import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchAndStoreBTCPrice(supabase: any, date: string, cmcApiKey: string) {
  try {
    // Check if price already exists
    const { data: existing } = await supabase
      .from('btc_prices')
      .select('id')
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      console.log(`BTC price for ${date} already exists, skipping...`);
      return { success: true, cached: true };
    }

    // Fetch from CoinMarketCap
    const startTime = `${date}T00:00:00Z`;
    const endTime = `${date}T23:59:59Z`;

    console.log(`Fetching BTC price from CoinMarketCap for ${date}...`);
    
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?id=1&time_start=${startTime}&time_end=${endTime}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': cmcApiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.quotes || data.data.quotes.length === 0) {
      throw new Error('No price data available for this date');
    }

    const btcPrice = data.data.quotes[0].quote.USD.price;
    console.log(`BTC price for ${date}: $${btcPrice}`);

    // Store in database
    const { error: insertError } = await supabase
      .from('btc_prices')
      .insert({
        date,
        price_usd: btcPrice,
        source: 'coinmarketcap_cron'
      });

    if (insertError) {
      console.error('Error storing BTC price:', insertError);
      throw insertError;
    }

    return { success: true, price: btcPrice, cached: false };
  } catch (error) {
    console.error(`Error fetching BTC price for ${date}:`, error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const cmcApiKey = Deno.env.get('CMC_API_KEY');

    if (!cmcApiKey) {
      throw new Error('CMC_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today and yesterday's dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    console.log(`Syncing BTC prices for ${yesterdayStr} and ${todayStr}...`);

    // Fetch prices for both dates
    const results = await Promise.all([
      fetchAndStoreBTCPrice(supabase, yesterdayStr, cmcApiKey),
      fetchAndStoreBTCPrice(supabase, todayStr, cmcApiKey)
    ]);

    const response = {
      success: true,
      synced: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: {
        yesterday: results[0],
        today: results[1]
      }
    };

    console.log('Sync completed:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-btc-prices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to sync BTC prices' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
