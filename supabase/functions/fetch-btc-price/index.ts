import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date } = await req.json(); // formato: YYYY-MM-DD
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache in btc_prices table
    const { data: cached, error: cacheError } = await supabase
      .from('btc_prices')
      .select('price_usd')
      .eq('date', date)
      .maybeSingle();

    if (cached) {
      console.log(`BTC price for ${date} found in cache: $${cached.price_usd}`);
      return new Response(
        JSON.stringify({ price: cached.price_usd, cached: true, date }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from CoinMarketCap
    const CMC_API_KEY = Deno.env.get('CMC_API_KEY');
    if (!CMC_API_KEY) {
      throw new Error('CMC_API_KEY not configured');
    }

    // Convert date to timestamp for CoinMarketCap API
    const startTime = `${date}T00:00:00Z`;
    const endTime = `${date}T23:59:59Z`;

    console.log(`Fetching BTC price from CoinMarketCap for ${date}...`);
    
    const cmcResponse = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?id=1&time_start=${startTime}&time_end=${endTime}`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (!cmcResponse.ok) {
      const errorText = await cmcResponse.text();
      console.error('CoinMarketCap API error:', errorText);
      throw new Error(`CoinMarketCap API error: ${cmcResponse.status}`);
    }

    const cmcData = await cmcResponse.json();
    
    if (!cmcData.data || !cmcData.data.quotes || cmcData.data.quotes.length === 0) {
      throw new Error('No price data available for this date');
    }

    const btcPrice = cmcData.data.quotes[0].quote.USD.price;
    console.log(`BTC price for ${date}: $${btcPrice}`);

    // Save to cache
    const { error: insertError } = await supabase
      .from('btc_prices')
      .insert({
        date,
        price_usd: btcPrice,
        source: 'coinmarketcap'
      });

    if (insertError) {
      console.error('Error caching BTC price:', insertError);
      // Don't fail the request if caching fails
    }

    return new Response(
      JSON.stringify({ price: btcPrice, cached: false, date }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-btc-price:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch BTC price' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
