import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📤 Telegram Notification Sender started');
    
    const now = new Date().toISOString();
    
    // Get pending messages
    const { data: pendingMessages, error } = await supabase
      .from('telegram_notifications_queue')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_send_time', now)
      .order('priority', { ascending: true })
      .order('scheduled_send_time', { ascending: true })
      .limit(50);
    
    if (error) throw error;
    
    if (!pendingMessages || pendingMessages.length === 0) {
      console.log('No pending messages');
      return new Response(
        JSON.stringify({ message: 'No pending messages' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
    console.log(`📨 Sending ${pendingMessages.length} Telegram messages`);
    
    const results = [];
    
    for (const msg of pendingMessages) {
      try {
        const success = await sendTelegramMessage(msg.telegram_chat_id, msg.message_text);
        
        if (success) {
          await supabase
            .from('telegram_notifications_queue')
            .update({
              sent: true,
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', msg.id);
          
          // Update related signal if exists
          if (msg.related_signal_id) {
            await supabase
              .from('ai_trading_signals')
              .update({
                telegram_sent: true,
                telegram_sent_at: new Date().toISOString()
              })
              .eq('id', msg.related_signal_id);
          }
          
          results.push({ id: msg.id, status: 'sent' });
          console.log(`✅ Message ${msg.id} sent to ${msg.telegram_chat_id}`);
        } else {
          // Increment retry count
          await supabase
            .from('telegram_notifications_queue')
            .update({
              retry_count: msg.retry_count + 1,
              error_message: 'Failed to send',
              updated_at: new Date().toISOString()
            })
            .eq('id', msg.id);
          
          results.push({ id: msg.id, status: 'failed' });
          console.error(`❌ Message ${msg.id} failed to send`);
        }
        
        // Rate limiting: 1 message per second
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error sending message ${msg.id}:`, error);
        results.push({ id: msg.id, status: 'error', error: error.message });
      }
    }
    
    console.log('✅ Telegram batch completed:', results);
    
    return new Response(
      JSON.stringify({ success: true, sent: results.filter(r => r.status === 'sent').length, results }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
    
  } catch (error) {
    console.error('❌ Telegram Notification Sender error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});

async function sendTelegramMessage(chatId: string, messageText: string): Promise<boolean> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('Telegram bot token not configured');
      return false;
    }
    
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'Markdown'
        })
      }
    );
    
    if (response.ok) {
      return true;
    } else {
      const error = await response.text();
      console.error(`Telegram send failed:`, error);
      return false;
    }
  } catch (error) {
    console.error('Telegram API error:', error);
    return false;
  }
}
