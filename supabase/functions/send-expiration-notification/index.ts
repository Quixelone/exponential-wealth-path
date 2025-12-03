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

interface SendNotificationRequest {
  tradeId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tradeId }: SendNotificationRequest = await req.json();
    console.log(`📤 Sending expiration notification for trade: ${tradeId}`);

    if (!tradeId) {
      return new Response(
        JSON.stringify({ error: 'tradeId is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get trade details
    const { data: trade, error: tradeError } = await supabase
      .from('options_trades')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (tradeError || !trade) {
      console.error('Trade not found:', tradeError);
      return new Response(
        JSON.stringify({ error: 'Trade not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's telegram chat ID
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('telegram_chat_id')
      .eq('user_id', trade.user_id)
      .single();

    if (settingsError || !settings?.telegram_chat_id) {
      console.error('Telegram chat ID not found:', settingsError);
      
      // Log failed notification
      await supabase.from('notification_logs').insert({
        user_id: trade.user_id,
        reminder_id: tradeId,
        notification_method: 'telegram',
        status: 'failed',
        error_message: 'Telegram chat ID not configured'
      });

      return new Response(
        JSON.stringify({ error: 'Telegram chat ID not configured' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current BTC price
    let btcPrice = 0;
    try {
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const priceData = await priceResponse.json();
      btcPrice = priceData.bitcoin?.usd || 0;
    } catch (e) {
      console.error('Error fetching BTC price:', e);
      // Fallback to last known price from DB
      const { data: lastPrice } = await supabase
        .from('btc_prices')
        .select('price_usd')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      btcPrice = lastPrice?.price_usd || 0;
    }

    // Calculate prediction
    const strikePrice = trade.strike_price_usd;
    const optionType = trade.option_type;
    const priceDiff = ((btcPrice - strikePrice) / strikePrice * 100).toFixed(2);
    const isAboveStrike = btcPrice > strikePrice;

    // For PUT: above strike = not assigned, below strike = assigned
    // For CALL: above strike = assigned, below strike = not assigned
    const isPut = optionType === 'SELL_PUT' || optionType === 'PUT';
    const predictedNotAssigned = isPut ? isAboveStrike : !isAboveStrike;

    const optionTypeLabel = isPut ? 'PUT' : 'CALL';
    const predictionText = predictedNotAssigned
      ? `✅ Prezzo ${isAboveStrike ? 'SOPRA' : 'SOTTO'} strike → Probabilmente *NON assegnato*`
      : `⚠️ Prezzo ${isAboveStrike ? 'SOPRA' : 'SOTTO'} strike → Probabilmente *ASSEGNATO*`;

    // Build message
    const message = `🔔 *Opzione Scaduta*

La tua ${optionTypeLabel} a $${strikePrice.toLocaleString()} è scaduta.

📊 *Dettagli:*
• Strike: $${strikePrice.toLocaleString()}
• Prezzo BTC: $${btcPrice.toLocaleString()}
• Differenza: ${Number(priceDiff) >= 0 ? '+' : ''}${priceDiff}%
• Premium: $${trade.premium_usdt.toFixed(2)}
• Durata: ${trade.duration_days} giorni

${predictionText}

_Conferma l'esito:_`;

    // Build inline keyboard
    const inlineKeyboard = {
      inline_keyboard: [[
        { text: "✓ Non Assegnato", callback_data: `confirm_not_assigned_${tradeId}` },
        { text: "✗ Assegnato", callback_data: `confirm_assigned_${tradeId}` }
      ]]
    };

    // Send Telegram message with retry
    let success = false;
    let lastError = '';
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegram_chat_id,
            text: message,
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
          })
        });

        if (response.ok) {
          success = true;
          console.log(`✅ Notification sent successfully on attempt ${attempt}`);
          break;
        } else {
          const errorData = await response.text();
          lastError = errorData;
          console.error(`Attempt ${attempt} failed:`, errorData);
        }
      } catch (e) {
        lastError = e.message;
        console.error(`Attempt ${attempt} error:`, e);
      }

      // Exponential backoff
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    // Log notification
    await supabase.from('notification_logs').insert({
      user_id: trade.user_id,
      reminder_id: tradeId,
      notification_method: 'telegram',
      status: success ? 'sent' : 'failed',
      sent_at: success ? new Date().toISOString() : null,
      error_message: success ? null : lastError,
      message: message.substring(0, 500)
    });

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Failed to send notification after 3 attempts', details: lastError }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, tradeId, chatId: settings.telegram_chat_id }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Send notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
