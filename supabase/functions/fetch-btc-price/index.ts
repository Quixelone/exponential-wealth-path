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

    // Check if date is in the future or today
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    requestedDate.setHours(0, 0, 0, 0);

    if (requestedDate >= today) {
      console.log(`Date ${date} is today or in the future. Cannot fetch BTC price.`);
      return new Response(
        JSON.stringify({ 
          error: 'Cannot fetch BTC price for future dates or today',
          price: null,
          date 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Fetch from CoinGecko (free, no API key needed)
    // Convert date format from YYYY-MM-DD to DD-MM-YYYY for CoinGecko
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    console.log(`Fetching BTC price from CoinGecko for ${date}...`);
    
    const geckoResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${formattedDate}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!geckoResponse.ok) {
      const errorText = await geckoResponse.text();
      console.error('CoinGecko API error:', errorText);
      throw new Error(`CoinGecko API error: ${geckoResponse.status}`);
    }

    const geckoData = await geckoResponse.json();
    
    if (!geckoData.market_data || !geckoData.market_data.current_price || !geckoData.market_data.current_price.usd) {
      throw new Error('No price data available for this date');
    }

    const btcPrice = geckoData.market_data.current_price.usd;
    console.log(`BTC price for ${date}: $${btcPrice}`);

    // Save to cache
    const { error: insertError } = await supabase
      .from('btc_prices')
      .insert({
        date,
        price_usd: btcPrice,
        source: 'coingecko'
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
