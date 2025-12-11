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

        // Validate UUID format to prevent injection
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(tradeId)) {
          console.warn(`Invalid trade ID format: ${tradeId}`);
          await answerCallbackQuery(callbackId, '❌ ID trade non valido');
          return new Response('OK', { status: 200 });
        }

        // Get the trade to verify ownership
        const { data: trade, error: fetchError } = await supabase
          .from('options_trades')
          .select('id, user_id, strike_price_usd, premium_usdt')
          .eq('id', tradeId)
          .single();

        if (fetchError || !trade) {
          console.error('Trade not found:', fetchError);
          await answerCallbackQuery(callbackId, '❌ Trade non trovato');
          return new Response('OK', { status: 200 });
        }

        // Verify the callback is from the trade owner by checking their linked telegram_chat_id
        const { data: ownerSettings, error: settingsError } = await supabase
          .from('notification_settings')
          .select('user_id')
          .eq('telegram_chat_id', chatId?.toString() || '')
          .eq('user_id', trade.user_id)
          .single();

        if (settingsError || !ownerSettings) {
          console.warn(`Unauthorized callback attempt: chatId=${chatId}, tradeId=${tradeId}, tradeOwner=${trade.user_id}`);
          await answerCallbackQuery(callbackId, '❌ Non autorizzato');
          return new Response('OK', { status: 200 });
        }

        // Update the trade - ownership verified
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

      await sendMessage(chatId, 
        `🤖 *Benvenuto in BTC Wheel Pro!*\n\n` +
        `Per collegare il tuo account, usa il comando:\n` +
        `\`/connect CODICE\`\n\n` +
        `Genera il codice dall'app nella sezione Impostazioni → Notifiche.`
      );
    }

    // Handle /connect command
    if (update.message?.text?.startsWith('/connect ')) {
      const chatId = update.message.chat.id;
      const code = update.message.text.split(' ')[1]?.trim();

      if (!code || code.length !== 6) {
        await sendMessage(chatId, '❌ Codice non valido. Il codice deve essere di 6 cifre.');
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      console.log(`🔗 Connect attempt: code=${code}, chatId=${chatId}`);

      // Find the link code
      const { data: linkCode, error: codeError } = await supabase
        .from('telegram_link_codes')
        .select('*')
        .eq('code', code)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (codeError || !linkCode) {
        console.error('Code not found or expired:', codeError);
        await sendMessage(chatId, '❌ Codice non valido o scaduto.\n\nGenera un nuovo codice dall\'app.');
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      // Mark code as used
      await supabase
        .from('telegram_link_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', linkCode.id);

      // Update or create notification settings
      const { error: upsertError } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: linkCode.user_id,
          telegram_chat_id: chatId.toString(),
          preferred_method: 'telegram',
          notifications_enabled: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('Error saving chat_id:', upsertError);
        await sendMessage(chatId, '❌ Errore durante il collegamento. Riprova più tardi.');
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      console.log(`✅ Telegram connected: user=${linkCode.user_id}, chatId=${chatId}`);
      
      await sendMessage(chatId, 
        `✅ *Account collegato con successo!*\n\n` +
        `Riceverai le notifiche qui quando:\n` +
        `• Le tue opzioni scadono\n` +
        `• È richiesta una conferma\n` +
        `• Ci sono aggiornamenti importanti\n\n` +
        `Usa /help per vedere tutti i comandi disponibili.`
      );
    }

    // Handle /help command
    if (update.message?.text === '/help') {
      const chatId = update.message.chat.id;
      
      await sendMessage(chatId,
        `📖 *Comandi disponibili:*\n\n` +
        `/start - Avvia il bot\n` +
        `/connect CODICE - Collega il tuo account\n` +
        `/help - Mostra questo messaggio\n` +
        `/status - Verifica stato connessione\n\n` +
        `Per assistenza: support@btcwheelpro.com`
      );
    }

    // Handle /status command
    if (update.message?.text === '/status') {
      const chatId = update.message.chat.id;
      
      // Check if this chatId is linked
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('notifications_enabled')
        .eq('telegram_chat_id', chatId.toString())
        .single();

      if (settings) {
        await sendMessage(chatId,
          `✅ *Account collegato*\n\n` +
          `Notifiche: ${settings.notifications_enabled ? '🔔 Attive' : '🔕 Disattivate'}`
        );
      } else {
        await sendMessage(chatId,
          `❌ *Account non collegato*\n\n` +
          `Usa /connect CODICE per collegare il tuo account.`
        );
      }
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
