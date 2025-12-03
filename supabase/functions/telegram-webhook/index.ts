import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token',
};

interface TelegramUpdate {
  update_id: number;
  callback_query?: {
    id: string;
    from: { id: number; username?: string };
    message?: { chat: { id: number }; message_id: number };
    data?: string;
  };
  message?: {
    chat: { id: number };
    text?: string;
    from: { id: number; username?: string };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook secret
    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
    if (TELEGRAM_WEBHOOK_SECRET && secretHeader !== TELEGRAM_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return new Response('Unauthorized', { status: 401 });
    }

    const update: TelegramUpdate = await req.json();
    console.log('📥 Telegram update received:', JSON.stringify(update));

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const callbackId = update.callback_query.id;
      const chatId = update.callback_query.message?.chat.id;
      const messageId = update.callback_query.message?.message_id;

      if (!callbackData) {
        await answerCallbackQuery(callbackId, '❌ Dati mancanti');
        return new Response('OK', { status: 200 });
      }

      // Parse callback data: confirm_not_assigned_[tradeId] or confirm_assigned_[tradeId]
      const notAssignedMatch = callbackData.match(/^confirm_not_assigned_(.+)$/);
      const assignedMatch = callbackData.match(/^confirm_assigned_(.+)$/);

      if (notAssignedMatch || assignedMatch) {
        const tradeId = notAssignedMatch ? notAssignedMatch[1] : assignedMatch![1];
        const isAssigned = !!assignedMatch;

        console.log(`📝 Processing confirmation: tradeId=${tradeId}, isAssigned=${isAssigned}`);

        // Get the trade to check pre-analysis
        const { data: trade, error: fetchError } = await supabase
          .from('options_trades')
          .select('*')
          .eq('id', tradeId)
          .single();

        if (fetchError || !trade) {
          console.error('Trade not found:', fetchError);
          await answerCallbackQuery(callbackId, '❌ Trade non trovato');
          return new Response('OK', { status: 200 });
        }

        // Update the trade
        const newStatus = isAssigned ? 'CLOSED_ASSIGNED' : 'CLOSED_NOT_ASSIGNED';
        const { error: updateError } = await supabase
          .from('options_trades')
          .update({
            status: newStatus,
            is_assigned: isAssigned,
            user_confirmed: true,
            user_confirmed_at: new Date().toISOString(),
            confirmation_source: 'telegram',
            closed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', tradeId);

        if (updateError) {
          console.error('Error updating trade:', updateError);
          await answerCallbackQuery(callbackId, '❌ Errore nel salvataggio');
          return new Response('OK', { status: 200 });
        }

        // Send confirmation message
        const confirmMessage = isAssigned
          ? `✅ *Confermato: ASSEGNATO*\n\nHai ricevuto BTC al prezzo di $${trade.strike_price_usd.toLocaleString()}`
          : `✅ *Confermato: NON ASSEGNATO*\n\nIl premium di $${trade.premium_usdt.toFixed(2)} è stato incassato!`;

        await answerCallbackQuery(callbackId, isAssigned ? '✅ Assegnato confermato' : '✅ Non assegnato confermato');

        // Edit original message to show confirmation
        if (chatId && messageId) {
          await editMessage(chatId, messageId, confirmMessage);
        }

        console.log(`✅ Trade ${tradeId} confirmed as ${newStatus}`);
      }
    }

    // Handle /start command
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;

      await sendMessage(chatId, 
        `🤖 *Benvenuto nel Bot Wheel Strategy!*\n\n` +
        `Il tuo Chat ID è: \`${chatId}\`\n\n` +
        `Copia questo ID nelle impostazioni dell'app per ricevere notifiche sulle tue opzioni.`
      );
    }

    return new Response('OK', { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

async function answerCallbackQuery(callbackQueryId: string, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: false
      })
    });
  } catch (error) {
    console.error('Error answering callback query:', error);
  }
}

async function sendMessage(chatId: number, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

async function editMessage(chatId: number, messageId: number, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Error editing message:', error);
  }
}
