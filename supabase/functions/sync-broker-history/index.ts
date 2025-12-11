import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-BROKER-HISTORY] ${step}${detailsStr}`);
};

// Decryption utilities - inline to avoid import issues in edge functions
async function getEncryptionKey(): Promise<CryptoKey> {
  const encryptionKeyBase64 = Deno.env.get('BROKER_ENCRYPTION_KEY');
  if (!encryptionKeyBase64) {
    throw new Error('BROKER_ENCRYPTION_KEY not configured');
  }
  
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(encryptionKeyBase64), c => c.charCodeAt(0));
  } catch {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKeyBase64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    keyBytes = new Uint8Array(hashBuffer);
  }
  
  if (keyBytes.length !== 32) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKeyBase64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    keyBytes = new Uint8Array(hashBuffer);
  }
  
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function decryptValue(encryptedBase64: string, cryptoKey: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

function isEncrypted(value: string): boolean {
  if (!value || value.length < 40) return false;
  try {
    const decoded = atob(value);
    return decoded.length >= 28;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Function started');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    if (!userData.user) throw new Error('User not authenticated');

    logStep('User authenticated', { userId: userData.user.id });

    const { connection_id } = await req.json();

    if (!connection_id) {
      throw new Error('Missing connection_id');
    }

    // Get broker connection details
    const { data: connection, error: connectionError } = await supabaseClient
      .from('broker_connections')
      .select('*')
      .eq('id', connection_id)
      .eq('user_id', userData.user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('Broker connection not found');
    }

    logStep('Retrieved connection', { broker: connection.broker_name });

    // Decrypt credentials
    let apiKey = connection.api_key;
    let apiSecret = connection.api_secret;
    let apiPassphrase = connection.api_passphrase;

    // Check if values are encrypted and decrypt them
    if (isEncrypted(apiKey)) {
      logStep('Decrypting credentials');
      try {
        const cryptoKey = await getEncryptionKey();
        apiKey = await decryptValue(apiKey, cryptoKey);
        apiSecret = await decryptValue(apiSecret, cryptoKey);
        if (apiPassphrase && isEncrypted(apiPassphrase)) {
          apiPassphrase = await decryptValue(apiPassphrase, cryptoKey);
        }
        logStep('Credentials decrypted successfully');
      } catch (decryptError: any) {
        logStep('Decryption error', { error: decryptError.message });
        throw new Error('Failed to decrypt broker credentials');
      }
    } else {
      logStep('Credentials not encrypted (legacy data)');
    }

    // Get user's config
    const { data: config } = await supabaseClient
      .from('investment_configs')
      .select('id')
      .eq('user_id', userData.user.id)
      .single();

    if (!config) {
      throw new Error('No investment config found for user');
    }

    // Simulate fetching history from broker API using decrypted credentials
    // In production, this would make actual API calls to the broker
    logStep('Fetching history from broker', { 
      broker: connection.broker_name,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret 
    });

    // Mock data - in production this would come from real API
    const mockTransactions: any[] = [];
    let synced = 0;
    let skipped = 0;

    for (const transaction of mockTransactions) {
      // Check if transaction already exists
      const { data: existing } = await supabaseClient
        .from('daily_options_log')
        .select('id')
        .eq('broker_transaction_id', `${connection.broker_name}-${transaction.id}`)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Insert new transaction
      const { error: insertError } = await supabaseClient
        .from('daily_options_log')
        .insert({
          user_id: userData.user.id,
          config_id: config.id,
          option_date: new Date().toISOString().split('T')[0],
          premium_earned: 0,
          broker_source: connection.broker_name,
          broker_transaction_id: `${connection.broker_name}-${transaction.id}`,
          synced_at: new Date().toISOString(),
          sync_method: 'auto_api',
          api_sync_status: 'SUCCESS',
        });

      if (!insertError) {
        synced++;
      }
    }

    // Update connection last_sync_date
    await supabaseClient
      .from('broker_connections')
      .update({ 
        last_sync_date: new Date().toISOString(),
        connection_status: 'connected'
      })
      .eq('id', connection_id);

    logStep('Sync completed', { synced, skipped });

    return new Response(
      JSON.stringify({
        success: true,
        synced,
        skipped,
        errors: 0,
        message: synced > 0 ? `Successfully synced ${synced} transactions` : 'No new transactions to sync',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    const errorMessage = error.message || 'Sync failed';
    logStep('ERROR', { message: errorMessage });

    return new Response(
      JSON.stringify({
        success: false,
        synced: 0,
        skipped: 0,
        errors: 1,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
