import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature" }), { status: 400 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR: Missing Stripe keys");
    return new Response(JSON.stringify({ error: "Configuration error" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook event received", { type: event.type });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { user_id, config_id } = session.metadata || {};

      if (!user_id || !config_id) {
        logStep("ERROR: Missing metadata", { user_id, config_id });
        return new Response(JSON.stringify({ error: "Missing metadata" }), { status: 400 });
      }

      logStep("Processing checkout completion", { user_id, config_id });

      // Save subscription ID to user profile
      if (session.subscription) {
        await supabaseClient
          .from('user_profiles')
          .update({ stripe_subscription_id: session.subscription as string })
          .eq('id', user_id);
        logStep("Subscription ID saved", { subscriptionId: session.subscription });
      }

      // Get current month
      const now = new Date();
      const paymentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Update insurance_payments
      const { data: existingPayment } = await supabaseClient
        .from('insurance_payments')
        .select('id')
        .eq('user_id', user_id)
        .eq('payment_month', paymentMonth.toISOString().split('T')[0])
        .single();

      if (existingPayment) {
        // Update existing payment
        await supabaseClient
          .from('insurance_payments')
          .update({
            is_paid: true,
            paid_at: new Date().toISOString(),
            payment_method: 'stripe',
            payment_provider: 'stripe',
            payment_amount_eur: 49,
          })
          .eq('id', existingPayment.id);
        logStep("Existing payment updated", { paymentId: existingPayment.id });
      } else {
        // Create new payment record
        await supabaseClient
          .from('insurance_payments')
          .insert({
            user_id,
            payment_month: paymentMonth.toISOString().split('T')[0],
            payment_due_date: paymentMonth.toISOString().split('T')[0],
            is_paid: true,
            paid_at: new Date().toISOString(),
            payment_method: 'stripe',
            payment_provider: 'stripe',
            payment_amount_eur: 49,
          });
        logStep("New payment record created");
      }

      // Activate or extend insurance coverage
      const startDate = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 3); // Until 3rd of next month

      const { data: activeCoverage } = await supabaseClient
        .from('insurance_coverage_periods')
        .select('id, end_date')
        .eq('user_id', user_id)
        .eq('config_id', config_id)
        .eq('is_active', true)
        .single();

      if (activeCoverage) {
        // Extend existing coverage
        await supabaseClient
          .from('insurance_coverage_periods')
          .update({
            end_date: endDate.toISOString().split('T')[0],
          })
          .eq('id', activeCoverage.id);
        logStep("Coverage extended", { coverageId: activeCoverage.id });
      } else {
        // Get config initial capital
        const { data: configData } = await supabaseClient
          .from('investment_configs')
          .select('initial_capital')
          .eq('id', config_id)
          .single();

        // Create new coverage period
        await supabaseClient
          .from('insurance_coverage_periods')
          .insert({
            user_id,
            config_id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            base_capital_for_premium: configData?.initial_capital || 0,
            is_active: true,
          });
        logStep("New coverage period created");
      }

      // Mark strategy as insured
      await supabaseClient
        .from('investment_configs')
        .update({ is_insured: true })
        .eq('id', config_id);
      logStep("Strategy marked as insured", { config_id });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find user by subscription ID
      const { data: userProfile } = await supabaseClient
        .from('user_profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (userProfile) {
        // Deactivate all coverages for this user
        await supabaseClient
          .from('insurance_coverage_periods')
          .update({ is_active: false })
          .eq('user_id', userProfile.id)
          .eq('is_active', true);

        // Unmark all strategies as insured
        await supabaseClient
          .from('investment_configs')
          .update({ is_insured: false })
          .eq('user_id', userProfile.id);

        logStep("Insurance cancelled for user", { userId: userProfile.id });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
});
