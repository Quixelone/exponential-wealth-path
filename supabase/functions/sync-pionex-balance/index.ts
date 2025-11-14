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

const PIONEX_API_BASE = 'https://api.pionex.com';

/**
 * Generate HMAC SHA256 signature for Pionex API authentication
 * @see https://pionex-doc.gitbook.io/apidocs/restful-api/authentication
 */
async function createPionexSignature(
  method: string,
  path: string,
  timestamp: number,
  params: Record<string, any> = {}
): Promise<string> {
  const apiSecret = Deno.env.get('PIONEX_API_SECRET')!;
  
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const signaturePayload = `${timestamp}${method}${path}${sortedParams}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const messageData = encoder.encode(signaturePayload);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Fetch balance from Pionex API
 */
async function fetchPionexBalance(userId: string) {
  const apiKey = Deno.env.get('PIONEX_API_KEY')!;
  const timestamp = Date.now();
  const method = 'GET';
  const path = '/api/v1/account/balances';
  
  const signature = await createPionexSignature(method, path, timestamp);
  
  const startTime = Date.now();
  
  const response = await fetch(`${PIONEX_API_BASE}${path}`, {
    method,
    headers: {
      'PIONEX-KEY': apiKey,
      'PIONEX-SIGNATURE': signature,
      'PIONEX-TIMESTAMP': timestamp.toString(),
      'Content-Type': 'application/json',
    }
  });
  
  const responseTime = Date.now() - startTime;
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pionex API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (!data.result || !data.data) {
    throw new Error(`Invalid Pionex response: ${JSON.stringify(data)}`);
  }
  
  const balances = data.data.balances || [];
  
  const btcBalance = balances.find((b: any) => b.coin === 'BTC') || { free: '0', frozen: '0' };
  const usdtBalance = balances.find((b: any) => b.coin === 'USDT') || { free: '0', frozen: '0' };
  
  const btc_free = parseFloat(btcBalance.free || '0');
  const btc_locked = parseFloat(btcBalance.frozen || '0');
  const usdt_free = parseFloat(usdtBalance.free || '0');
  const usdt_locked = parseFloat(usdtBalance.frozen || '0');
  
  // Fetch current BTC price
  const btcPriceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
  const btcPriceData = await btcPriceResponse.json();
  const btcPriceUsd = parseFloat(btcPriceData.price);
  
  const total_btc = btc_free + btc_locked;
  const total_usdt = usdt_free + usdt_locked;
  const total_value_usd = (total_btc * btcPriceUsd) + total_usdt;
  
  return {
    btc_free,
    btc_locked,
    usdt_free,
    usdt_locked,
    total_value_usd,
    response_time_ms: responseTime,
    raw_response: data
  };
}

/**
 * Determine option type based on BTC locked changes
 */
function determineOptionType(
  btcLockedPrev: number,
  btcLockedCurrent: number,
  premiumEarned: number
): string {
  const btcLockedDiff = btcLockedCurrent - btcLockedPrev;
  
  if (btcLockedDiff > 0.001) return 'SELL_PUT';
  if (btcLockedDiff < -0.001) return 'COVERED_CALL';
  if (premiumEarned > 0 && Math.abs(btcLockedDiff) < 0.001) return 'EXPIRED';
  if (premiumEarned < 0) return 'LOSS';
  
  return 'NO_OPTION';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, manualSync } = await req.json().catch(() => ({ userId: null, manualSync: false }));
    
    let usersToSync: any[] = [];
    
    if (userId) {
      const { data: user } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (user) usersToSync = [{ user_id: user.id }];
    } else {
      const { data: configs } = await supabase
        .from('investment_configs')
        .select('user_id')
        .eq('use_real_btc_prices', true);
      
      if (configs) {
        usersToSync = configs.map(c => ({ user_id: c.user_id }));
      }
    }
    
    if (usersToSync.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to sync', synced: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results = [];
    
    for (const user of usersToSync) {
      try {
        const userId = user.user_id;
        
        const currentBalance = await fetchPionexBalance(userId);
        
        const { error: balanceError } = await supabase
          .from('balance_history')
          .insert({
            user_id: userId,
            btc_free: currentBalance.btc_free,
            btc_locked: currentBalance.btc_locked,
            usdt_free: currentBalance.usdt_free,
            usdt_locked: currentBalance.usdt_locked,
            total_value_usd: currentBalance.total_value_usd,
            api_response_time_ms: currentBalance.response_time_ms,
            api_response_raw: currentBalance.raw_response
          });
        
        if (balanceError) throw balanceError;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const { data: prevBalance } = await supabase
          .from('balance_history')
          .select('*')
          .eq('user_id', userId)
          .lte('check_timestamp', yesterday.toISOString())
          .order('check_timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!prevBalance) {
          results.push({ user_id: userId, status: 'success', message: 'First sync, no previous data' });
          continue;
        }
        
        const currentTotal = currentBalance.total_value_usd;
        const prevTotal = (prevBalance.total_value_usd || 0);
        const premiumEarned = currentTotal - prevTotal;
        
        const optionType = determineOptionType(
          prevBalance.btc_locked || 0,
          currentBalance.btc_locked,
          premiumEarned
        );
        
        const optionDate = yesterday.toISOString().split('T')[0];
        
        const btcPriceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const btcPriceData = await btcPriceResponse.json();
        const btcPriceUsd = parseFloat(btcPriceData.price);
        
        const EUR_RATE = 0.92;
        const premiumInEur = premiumEarned * EUR_RATE;
        
        const { error: logError } = await supabase
          .from('daily_options_log')
          .upsert({
            user_id: userId,
            option_date: optionDate,
            option_type: optionType,
            balance_previous_day: prevTotal,
            balance_current_day: currentTotal,
            premium_earned: premiumEarned,
            premium_in_usd: premiumEarned,
            premium_in_eur: premiumInEur,
            btc_previous_day: (prevBalance.btc_free || 0) + (prevBalance.btc_locked || 0),
            btc_current_day: currentBalance.btc_free + currentBalance.btc_locked,
            btc_locked_previous: prevBalance.btc_locked || 0,
            btc_locked_current: currentBalance.btc_locked,
            btc_price_at_settlement: btcPriceUsd,
            api_sync_status: 'SUCCESS',
            recorded_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,option_date'
          });
        
        if (logError) throw logError;
        
        results.push({
          user_id: userId,
          status: 'success',
          option_type: optionType,
          premium_usd: premiumEarned,
          premium_eur: premiumInEur
        });
        
      } catch (error: any) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const optionDate = yesterday.toISOString().split('T')[0];
        
        await supabase
          .from('daily_options_log')
          .upsert({
            user_id: user.user_id,
            option_date: optionDate,
            api_sync_status: 'ERROR',
            sync_error_message: error.message,
            recorded_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,option_date'
          });
        
        results.push({
          user_id: user.user_id,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, synced: results.length, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
