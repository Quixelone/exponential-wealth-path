import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestTelegramRequest {
  chat_id: string;
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

    const { chat_id, message_count, test_message }: TestTelegramRequest = await req.json();

    // Validazioni
    if (!chat_id || !message_count) {
      throw new Error('Chat ID and message count are required');
    }

    if (message_count > 10 || message_count < 1) {
      throw new Error('Message count must be between 1 and 10');
    }

    // Valida formato Chat ID Telegram (può essere numero o @username)
    if (!chat_id.match(/^(@[\w\d_]+|\d+)$/)) {
      throw new Error('Invalid Telegram Chat ID format. Use format: @username or numeric ID');
    }

    console.log(`Starting Telegram test: ${message_count} messages to ${chat_id}`);

    // Verifica configurazione Telegram
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      throw new Error('Telegram Bot Token not configured in Supabase secrets');
    }

    console.log('Telegram Bot Token found, testing API connection...');

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Invia messaggi di test
    for (let i = 1; i <= message_count; i++) {
      try {
        const message = test_message || `🧪 Test Telegram #${i}/${message_count}

Questo è un messaggio di test dal sistema Finanza Creativa.

Tempo: ${new Date().toLocaleString('it-IT')}

✅ Se ricevi questo messaggio, la configurazione Telegram funziona correttamente!`;

        console.log(`Sending test message ${i}/${message_count} to ${chat_id}`);

        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chat_id,
              text: message,
              parse_mode: 'HTML'
            }),
          }
        );

        const responseData = await response.json();

        if (response.ok && responseData.ok) {
          console.log(`✅ Test message ${i} sent successfully. Message ID: ${responseData.result.message_id}`);
          results.push({
            message_number: i,
            status: 'success',
            message_id: responseData.result.message_id,
            to: chat_id,
            timestamp: new Date().toISOString()
          });
          successCount++;
        } else {
          console.error(`❌ Test message ${i} failed:`, responseData);
          results.push({
            message_number: i,
            status: 'error',
            error: responseData.description || 'Unknown error',
            error_code: responseData.error_code,
            to: chat_id,
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
          to: chat_id,
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
          notification_method: 'telegram',
          status: successCount > 0 ? 'sent' : 'failed',
          message: `Test Telegram: ${successCount}/${message_count} messages sent successfully`,
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
      chat_id,
      test_completed_at: new Date().toISOString()
    };

    console.log('Telegram test completed:', summary);

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
    console.error('Error in test-telegram function:', error);
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