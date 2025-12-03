import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Checking for expired options...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Find all OPEN trades with expiration_date <= today
    const { data: expiredTrades, error: queryError } = await supabase
      .from('options_trades')
      .select('id, user_id, strike_price_usd, expiration_date, option_type, premium_usdt, duration_days')
      .eq('status', 'OPEN')
      .lte('expiration_date', today);

    if (queryError) {
      console.error('Query error:', queryError);
      return new Response(
        JSON.stringify({ error: queryError.message }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!expiredTrades || expiredTrades.length === 0) {
      console.log('✅ No expired options found');
      return new Response(
        JSON.stringify({ processed: 0, errors: [], message: 'No expired options' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${expiredTrades.length} expired options`);

    const results = {
      processed: 0,
      errors: [] as string[]
    };

    // Process each expired trade
    for (const trade of expiredTrades) {
      try {
        console.log(`Processing trade ${trade.id}...`);

        // Update status to PENDING_CONFIRMATION
        const { error: updateError } = await supabase
          .from('options_trades')
          .update({ 
            status: 'PENDING_CONFIRMATION',
            updated_at: new Date().toISOString()
          })
          .eq('id', trade.id);

        if (updateError) {
          console.error(`Error updating trade ${trade.id}:`, updateError);
          results.errors.push(`Trade ${trade.id}: ${updateError.message}`);
          continue;
        }

        // Call send-expiration-notification function
        const { error: notifyError } = await supabase.functions.invoke('send-expiration-notification', {
          body: { tradeId: trade.id }
        });

        if (notifyError) {
          console.error(`Error sending notification for trade ${trade.id}:`, notifyError);
          results.errors.push(`Trade ${trade.id} notification: ${notifyError.message}`);
        } else {
          results.processed++;
          console.log(`✅ Processed trade ${trade.id}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (e) {
        console.error(`Error processing trade ${trade.id}:`, e);
        results.errors.push(`Trade ${trade.id}: ${e.message}`);
      }
    }

    console.log(`✅ Check complete: ${results.processed} processed, ${results.errors.length} errors`);

    return new Response(
      JSON.stringify(results), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Check expirations error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
