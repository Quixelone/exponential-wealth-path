
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestWhatsAppRequest {
  phone_number: string;
  message_count: number;
  test_message?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verifica autenticazione e permessi admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Verifica che l'utente sia admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { phone_number, message_count, test_message }: TestWhatsAppRequest = await req.json();

    // Validazioni
    if (!phone_number || !message_count) {
      throw new Error('Phone number and message count are required');
    }

    if (message_count > 10 || message_count < 1) {
      throw new Error('Message count must be between 1 and 10');
    }

    // Valida formato numero WhatsApp
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone_number)) {
      throw new Error('Invalid WhatsApp phone number format. Use format: +1234567890');
    }

    console.log(`Starting WhatsApp test: ${message_count} messages to ${phone_number}`);

    // Verifica configurazione Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured in Supabase secrets');
    }

    console.log('Twilio credentials found, testing API connection...');

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Invia messaggi di test
    for (let i = 1; i <= message_count; i++) {
      try {
        const message = test_message || `🧪 Test WhatsApp #${i}/${message_count}\n\nQuesto è un messaggio di test dal sistema Finanza Creativa.\n\nTempo: ${new Date().toLocaleString('it-IT')}\n\n✅ Se ricevi questo messaggio, la configurazione WhatsApp funziona correttamente!`;

        console.log(`Sending test message ${i}/${message_count} to ${phone_number}`);

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: 'whatsapp:+14155238886', // Twilio Sandbox number
              To: `whatsapp:${phone_number}`,
              Body: message,
            }),
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          console.log(`✅ Test message ${i} sent successfully. SID: ${responseData.sid}`);
          results.push({
            message_number: i,
            status: 'success',
            sid: responseData.sid,
            to: phone_number,
            timestamp: new Date().toISOString()
          });
          successCount++;
        } else {
          console.error(`❌ Test message ${i} failed:`, responseData);
          results.push({
            message_number: i,
            status: 'error',
            error: responseData.message || 'Unknown error',
            error_code: responseData.code,
            to: phone_number,
            timestamp: new Date().toISOString()
          });
          errorCount++;
        }

        // Pausa tra i messaggi per evitare rate limiting
        if (i < message_count) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`❌ Error sending test message ${i}:`, error);
        results.push({
          message_number: i,
          status: 'error',
          error: error.message,
          to: phone_number,
          timestamp: new Date().toISOString()
        });
        errorCount++;
      }
    }

    // Log del test nel database
    try {
      await supabase
        .from('notification_logs')
        .insert({
          user_id: user.id,
          notification_method: 'whatsapp',
          status: successCount > 0 ? 'sent' : 'failed',
          message: `Test WhatsApp: ${successCount}/${message_count} messages sent successfully`,
          sent_at: successCount > 0 ? new Date().toISOString() : null,
          error_message: errorCount > 0 ? `${errorCount} messages failed` : null
        });
    } catch (logError) {
      console.error('Error logging test results:', logError);
    }

    const summary = {
      total_messages: message_count,
      successful: successCount,
      failed: errorCount,
      success_rate: `${((successCount / message_count) * 100).toFixed(1)}%`,
      phone_number,
      test_completed_at: new Date().toISOString()
    };

    console.log('WhatsApp test completed:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        detailed_results: results,
        message: `Test completato: ${successCount}/${message_count} messaggi inviati con successo`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in test-whatsapp function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
