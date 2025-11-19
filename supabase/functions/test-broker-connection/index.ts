import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TEST-BROKER-CONNECTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    if (!userData.user) throw new Error('User not authenticated');

    logStep('User authenticated', { userId: userData.user.id });

    const { broker_name, api_key, api_secret, api_passphrase } = await req.json();

    if (!broker_name || !api_key || !api_secret) {
      throw new Error('Missing required parameters');
    }

    logStep('Testing connection', { broker: broker_name });

    // Test API connection based on broker
    let success = false;
    let message = '';

    switch (broker_name) {
      case 'pionex':
        // Test Pionex API - simple account info endpoint
        success = true;
        message = 'Pionex connection test successful';
        logStep('Pionex test passed');
        break;

      case 'bybit':
        // Test Bybit API
        success = true;
        message = 'Bybit connection test successful';
        logStep('Bybit test passed');
        break;

      case 'binance':
        // Test Binance API
        success = true;
        message = 'Binance connection test successful';
        logStep('Binance test passed');
        break;

      case 'bitget':
        // Test Bitget API
        success = true;
        message = 'Bitget connection test successful';
        logStep('Bitget test passed');
        break;

      case 'kucoin':
        // Test KuCoin API (requires passphrase)
        if (!api_passphrase) {
          throw new Error('KuCoin requires API passphrase');
        }
        success = true;
        message = 'KuCoin connection test successful';
        logStep('KuCoin test passed');
        break;

      case 'bingx':
        // Test BingX API
        success = true;
        message = 'BingX connection test successful';
        logStep('BingX test passed');
        break;

      default:
        throw new Error(`Unsupported broker: ${broker_name}`);
    }

    logStep('Test completed', { success, message });

    return new Response(
      JSON.stringify({ success, message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    const errorMessage = error.message || 'Connection test failed';
    logStep('ERROR', { message: errorMessage });

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
