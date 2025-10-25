import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-INSURANCE-CHECKOUT] ${step}${detailsStr}`);
};

// Helper: Determine insurance tier based on capital
const determineInsuranceTier = (capitalEur: number) => {
  if (capitalEur < 2500) return { name: 'Starter', price: 990, min: 1000, max: 2500 };
  if (capitalEur < 5000) return { name: 'Growth', price: 1990, min: 2500, max: 5000 };
  if (capitalEur < 10000) return { name: 'Advanced', price: 3990, min: 5000, max: 10000 };
  if (capitalEur < 25000) return { name: 'Premium', price: 7990, min: 10000, max: 25000 };
  return { name: 'Elite', price: 15990, min: 25000, max: Infinity };
};

// Helper: Check if day is a PAC day
const isPACDay = (day: number, frequency: string, customDays?: number): boolean => {
  if (frequency === 'daily') return true;
  if (frequency === 'weekly') return day % 7 === 0;
  if (frequency === 'monthly') return day % 30 === 0;
  if (frequency === 'custom' && customDays) return day % customDays === 0;
  return false;
};

// Helper: Calculate current capital
const calculateCurrentCapital = (config: any, dailyReturns: any[], dailyPACOverrides: any[]): number => {
  const startDate = new Date(config.pac_start_date);
  const today = new Date();
  const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysPassed < 0) return config.initial_capital;

  let capital = config.initial_capital;
  const returnMap = new Map(dailyReturns.map((r: any) => [r.day, r.return_rate]));
  const pacOverrideMap = new Map(dailyPACOverrides.map((p: any) => [p.day, p.pac_amount]));

  for (let day = 1; day <= Math.min(daysPassed, config.time_horizon); day++) {
    // Apply daily return
    const dailyReturn = returnMap.get(day) ?? config.daily_return_rate;
    capital = capital * (1 + dailyReturn / 100);

    // Add PAC if applicable
    const isPac = isPACDay(day, config.pac_frequency, config.pac_custom_days);
    if (isPac) {
      const pacAmount = pacOverrideMap.get(day) ?? config.pac_amount;
      capital += pacAmount;
    }
  }

  return capital;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { configId } = await req.json();
    if (!configId) throw new Error("configId is required");
    logStep("Config ID received", { configId });

    // Verify user owns this config and get full details
    const { data: config, error: configError } = await supabaseClient
      .from('investment_configs')
      .select('*')
      .eq('id', configId)
      .eq('user_id', user.id)
      .single();

    if (configError || !config) throw new Error("Configuration not found or access denied");
    logStep("Configuration verified", { configName: config.name });

    // Get daily returns for this config
    const { data: dailyReturns } = await supabaseClient
      .from('daily_returns')
      .select('day, return_rate')
      .eq('config_id', configId);

    // Get PAC overrides for this config
    const { data: dailyPACOverrides } = await supabaseClient
      .from('daily_pac_overrides')
      .select('day, pac_amount')
      .eq('config_id', configId);

    // Calculate current capital
    const currentCapital = calculateCurrentCapital(
      config,
      dailyReturns || [],
      dailyPACOverrides || []
    );
    logStep("Current capital calculated", { currentCapital });

    // Convert to EUR if needed
    let capitalEur = currentCapital;
    if (config.currency === 'USD' || config.currency === 'USDT') {
      capitalEur = currentCapital * 0.92; // Approximate conversion, could use real-time rate
    }
    logStep("Capital in EUR", { capitalEur });

    // Determine tier based on capital
    const tier = determineInsuranceTier(capitalEur);
    logStep("Tier determined", { tier });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = newCustomer.id;
      logStep("New customer created", { customerId });

      // Save customer ID to user profile
      await supabaseClient
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const origin = req.headers.get("origin") || "https://rsmvjsokqolxgczclqjv.supabase.co";
    
    // Create checkout session with dynamic pricing based on tier
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Copertura Assicurativa - Tier ${tier.name}`,
              description: `Strategia: ${config.name} | Capitale: €${capitalEur.toFixed(2)}`,
            },
            unit_amount: tier.price, // Dynamic price based on tier
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/settings?payment=success`,
      cancel_url: `${origin}/settings?payment=cancelled`,
      metadata: {
        user_id: user.id,
        config_id: configId,
        tier_name: tier.name,
        current_capital_eur: capitalEur.toFixed(2),
        pricing_date: new Date().toISOString(),
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
