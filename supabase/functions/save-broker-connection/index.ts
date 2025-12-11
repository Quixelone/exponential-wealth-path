import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SAVE-BROKER-CONNECTION] ${step}${detailsStr}`);
};

// Encryption utilities using Web Crypto API
async function getEncryptionKey(): Promise<CryptoKey> {
  const encryptionKeyBase64 = Deno.env.get('BROKER_ENCRYPTION_KEY');
  if (!encryptionKeyBase64) {
    throw new Error('BROKER_ENCRYPTION_KEY not configured');
  }
  
  // Decode the base64 key (should be 32 bytes for AES-256)
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(encryptionKeyBase64), c => c.charCodeAt(0));
  } catch {
    // If not valid base64, derive a key from the string using SHA-256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKeyBase64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    keyBytes = new Uint8Array(hashBuffer);
  }
  
  // Ensure we have exactly 32 bytes for AES-256
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

async function encryptValue(plaintext: string, cryptoKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate a random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  // Combine IV and encrypted data, then encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(encryptedData).length);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  return btoa(String.fromCharCode(...combined));
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

    const { broker_name, api_key, api_secret, api_passphrase, auto_sync_enabled, sync_frequency } = await req.json();

    if (!broker_name || !api_key || !api_secret) {
      throw new Error('Missing required parameters');
    }

    logStep('Encrypting credentials', { broker: broker_name });

    // Get encryption key and encrypt credentials
    const cryptoKey = await getEncryptionKey();
    
    const encryptedApiKey = await encryptValue(api_key, cryptoKey);
    const encryptedApiSecret = await encryptValue(api_secret, cryptoKey);
    const encryptedPassphrase = api_passphrase ? await encryptValue(api_passphrase, cryptoKey) : null;

    logStep('Credentials encrypted, saving to database');

    // Upsert the connection with encrypted values
    const { data, error } = await supabaseClient
      .from('broker_connections')
      .upsert({
        user_id: userData.user.id,
        broker_name,
        api_key: encryptedApiKey,
        api_secret: encryptedApiSecret,
        api_passphrase: encryptedPassphrase,
        is_active: true,
        connection_status: 'connected',
        auto_sync_enabled: auto_sync_enabled ?? true,
        sync_frequency: sync_frequency ?? 'daily',
      }, {
        onConflict: 'user_id,broker_name'
      })
      .select()
      .single();

    if (error) {
      logStep('Database error', { error: error.message });
      throw error;
    }

    logStep('Connection saved successfully', { connectionId: data?.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Broker connection saved with encrypted credentials',
        connection_id: data?.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to save broker connection';
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
