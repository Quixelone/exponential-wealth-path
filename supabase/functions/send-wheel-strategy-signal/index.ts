import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get user's Telegram settings
    const { data: notificationSettings } = await supabaseClient
      .from('notification_settings')
      .select('telegram_chat_id, notifications_enabled')
      .eq('user_id', user.id)
      .single();

    if (!notificationSettings?.notifications_enabled || !notificationSettings?.telegram_chat_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Telegram non configurato',
          message: 'Configura il tuo Telegram chat ID in Impostazioni per ricevere notifiche'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get latest analysis
    const { data: latestSignal } = await supabaseClient
      .from('ai_trading_signals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestSignal) {
      return new Response(
        JSON.stringify({ success: false, error: 'No analysis available' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format Telegram message
    const message = formatWheelStrategyMessage(latestSignal);

    // Send to Telegram
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: notificationSettings.telegram_chat_id,
          text: message,
          disable_web_page_preview: true
        })
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      throw new Error(`Telegram API error: ${telegramData.description}`);
    }

    // Update signal as sent
    await supabaseClient
      .from('ai_trading_signals')
      .update({
        telegram_sent: true,
        telegram_sent_at: new Date().toISOString()
      })
      .eq('id', latestSignal.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signal sent to Telegram',
        signal_id: latestSignal.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending Telegram signal:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatWheelStrategyMessage(signal: any): string {
  const action = signal.recommended_action === 'SELL_PUT' ? '🔴 SELL PUT' : 
                 signal.recommended_action === 'SELL_CALL' ? '🟢 SELL CALL' : '⏸️ HOLD';
  
  const sentiment = signal.macd_signal === 'bullish' ? '📈 Rialzista' : '📉 Ribassista';
  
  let message = `🎯 WHEEL STRATEGY SIGNAL\n\n`;
  message += `Azione Raccomandata: ${action}\n`;
  message += `Strike Price: $${signal.recommended_strike_price || 0}\n`;
  message += `Premium Atteso: ${signal.recommended_premium_pct?.toFixed(2) || 0}%\n\n`;
  
  message += `📊 Analisi Tecnica\n`;
  message += `• Prezzo BTC: $${signal.btc_price_usd || 0}\n`;
  message += `• RSI (14): ${signal.rsi_14?.toFixed(2) || 0}\n`;
  message += `• MACD: ${sentiment}\n`;
  message += `• Bollinger: ${signal.bollinger_position || 'N/A'}\n`;
  message += `• Volatilità 24h: ${signal.volatility_24h?.toFixed(2) || 0}%\n`;
  message += `• Support: $${signal.support_level || 0}\n`;
  message += `• Resistance: $${signal.resistance_level || 0}\n\n`;
  
  message += `🎲 Confidence Score: ${signal.confidence_score?.toFixed(0) || 0}/100\n\n`;
  message += `💡 Reasoning:\n${signal.reasoning || 'N/A'}\n\n`;
  message += `⏰ ${new Date(signal.created_at).toLocaleString('it-IT')}`;

  return message;
}
