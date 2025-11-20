import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TechnicalIndicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollinger: { upper: number; middle: number; lower: number; position: number };
  twap: number;
  vwap: number;
  volatility: number;
  trend: string;
  support: number;
  resistance: number;
  score: number;
}

interface OnChainMetrics {
  fundingRate: number;
  longShortRatio: number;
  fearGreedIndex: number;
  openInterest: number;
  sentiment: string;
  score: number;
}

interface StrikeOption {
  strike: number;
  distance: number;
  delta: number;
  premium: number;
  score: number;
  recommendation: string;
}

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

    // Fetch current BTC price from Pionex API
    const pionexApiKey = Deno.env.get('PIONEX_API_KEY');
    
    let currentPrice: number;
    let priceSource = 'pionex';
    
    try {
      // Try Pionex first
      const pionexResponse = await fetch('https://api.pionex.com/api/v1/market/ticker?symbol=BTC_USDT');
      const pionexData = await pionexResponse.json();
      
      if (pionexData.result && pionexData.data?.tickers?.[0]?.close) {
        currentPrice = parseFloat(pionexData.data.tickers[0].close);
        console.log('Using Pionex price:', currentPrice);
      } else {
        throw new Error('Invalid Pionex response');
      }
    } catch (error) {
      // Fallback to Binance
      console.log('Pionex failed, using Binance fallback:', error);
      priceSource = 'binance';
      const binanceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
      const binanceData = await binanceResponse.json();
      currentPrice = parseFloat(binanceData.price);
    }

    // Fetch klines for technical analysis (1h, last 100 candles)
    let klines: any[];
    
    try {
      // Try Pionex klines first
      const pionexKlinesResponse = await fetch(
        'https://api.pionex.com/api/v1/market/klines?symbol=BTC_USDT&interval=1h&limit=100'
      );
      const pionexKlinesData = await pionexKlinesResponse.json();
      
      if (pionexKlinesData.result && pionexKlinesData.data?.klines) {
        klines = pionexKlinesData.data.klines.map((k: any) => [
          k.time, k.open, k.high, k.low, k.close, k.volume
        ]);
        console.log('Using Pionex klines data');
      } else {
        throw new Error('Invalid Pionex klines response');
      }
    } catch (error) {
      // Fallback to Binance
      console.log('Pionex klines failed, using Binance fallback:', error);
      const binanceKlinesResponse = await fetch(
        'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=100'
      );
      klines = await binanceKlinesResponse.json();
    }

    // Calculate Technical Indicators
    const closes = klines.map((k: any) => parseFloat(k[4]));
    const highs = klines.map((k: any) => parseFloat(k[2]));
    const lows = klines.map((k: any) => parseFloat(k[3]));
    const volumes = klines.map((k: any) => parseFloat(k[5]));

    const technical = calculateTechnicalIndicators(closes, highs, lows, volumes, currentPrice);

    // Fetch On-Chain Metrics (simplified - using Binance futures data)
    const fundingResponse = await fetch(
      'https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT'
    );
    const fundingData = await fundingResponse.json();

    const longShortResponse = await fetch(
      'https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1h&limit=1'
    );
    const longShortData = await longShortResponse.json();

    const onchain: OnChainMetrics = {
      fundingRate: parseFloat(fundingData.lastFundingRate) * 100,
      longShortRatio: parseFloat(longShortData[0]?.longShortRatio || '1'),
      fearGreedIndex: 50, // Placeholder - would need separate API
      openInterest: parseFloat(fundingData.estimatedSettlePrice || '0'),
      sentiment: determineSentiment(parseFloat(fundingData.lastFundingRate), parseFloat(longShortData[0]?.longShortRatio || '1')),
      score: calculateOnChainScore(parseFloat(fundingData.lastFundingRate), parseFloat(longShortData[0]?.longShortRatio || '1'))
    };

    // Calculate optimal strikes
    const strikes = calculateOptimalStrikes(currentPrice, technical, onchain);

    // Save analysis to database
    const now = new Date();
    const { data: insertedSignal, error: insertError } = await supabaseClient
      .from('ai_trading_signals')
      .insert({
        user_id: user.id,
        config_id: null, // Will be linked later
        signal_date: now.toISOString().split('T')[0],
        signal_time: now.toISOString(),
        btc_price_usd: currentPrice,
        btc_price_source: priceSource,
        rsi_14: technical.rsi,
        macd_signal: technical.macd.histogram > 0 ? 'bullish' : 'bearish',
        bollinger_position: getBollingerPosition(technical.bollinger.position),
        volatility_24h: technical.volatility,
        support_level: technical.support,
        resistance_level: technical.resistance,
        recommended_action: strikes[0].recommendation,
        recommended_strike_price: strikes[0].strike,
        recommended_premium_pct: strikes[0].premium,
        confidence_score: (technical.score + onchain.score) / 2,
        reasoning: `Technical Score: ${technical.score}/100, On-Chain Score: ${onchain.score}/100`
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving analysis:', insertError);
    }

    // Auto-send Telegram notification if conditions are met
    if (insertedSignal && strikes[0].premium >= 0.20 && strikes[0].score > 80) {
      console.log('Strike conditions met, checking Telegram settings...');
      
      // Get user's Telegram settings
      const { data: notificationSettings } = await supabaseClient
        .from('notification_settings')
        .select('telegram_chat_id, notifications_enabled')
        .eq('user_id', user.id)
        .single();

      if (notificationSettings?.notifications_enabled && notificationSettings?.telegram_chat_id) {
        console.log('Sending auto Telegram notification...');
        
        try {
          // Format Telegram message
          const message = formatWheelStrategyMessage(insertedSignal, strikes[0]);
          
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

          if (telegramData.ok) {
            // Update signal as sent
            await supabaseClient
              .from('ai_trading_signals')
              .update({
                telegram_sent: true,
                telegram_sent_at: new Date().toISOString()
              })
              .eq('id', insertedSignal.id);
            
            console.log('Auto Telegram notification sent successfully');
          } else {
            console.error('Telegram API error:', telegramData.description);
          }
        } catch (telegramError) {
          console.error('Error sending auto Telegram notification:', telegramError);
        }
      } else {
        console.log('Telegram not configured or notifications disabled');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        price: currentPrice,
        technical,
        onchain,
        strikes: strikes.slice(0, 5),
        recommendation: strikes[0]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in wheel-strategy-analysis:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateTechnicalIndicators(
  closes: number[],
  highs: number[],
  lows: number[],
  volumes: number[],
  currentPrice: number
): TechnicalIndicators {
  // RSI Calculation
  const rsi = calculateRSI(closes, 14);

  // MACD Calculation
  const macd = calculateMACD(closes);

  // Bollinger Bands
  const bollinger = calculateBollingerBands(closes, 20, 2);
  const bollingerPosition = (currentPrice - bollinger.lower) / (bollinger.upper - bollinger.lower);

  // TWAP (Time Weighted Average Price)
  const twap = closes.reduce((a, b) => a + b, 0) / closes.length;

  // VWAP (Volume Weighted Average Price)
  const vwap = closes.reduce((sum, close, i) => sum + close * volumes[i], 0) / 
                volumes.reduce((a, b) => a + b, 0);

  // Volatility (standard deviation of returns)
  const returns = closes.slice(1).map((price, i) => (price - closes[i]) / closes[i]);
  const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * 100;

  // Support and Resistance (simple calculation)
  const support = Math.min(...lows.slice(-20));
  const resistance = Math.max(...highs.slice(-20));

  // Trend determination
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
  const trend = currentPrice > sma20 && sma20 > sma50 ? 'bullish' : 
                currentPrice < sma20 && sma20 < sma50 ? 'bearish' : 'neutral';

  // Technical Score (0-100)
  let score = 50;
  if (rsi > 30 && rsi < 70) score += 15;
  if (macd.histogram > 0) score += 10;
  if (bollingerPosition > 0.3 && bollingerPosition < 0.7) score += 10;
  if (trend === 'bullish') score += 15;
  score = Math.min(100, Math.max(0, score));

  return {
    rsi,
    macd,
    bollinger: { ...bollinger, position: bollingerPosition },
    twap,
    vwap,
    volatility,
    trend,
    support,
    resistance,
    score
  };
}

function calculateRSI(prices: number[], period: number): number {
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? -c : 0);

  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  const macdLine = [macd];
  const signal = calculateEMA(macdLine, 9);
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateBollingerBands(prices: number[], period: number, stdDev: number) {
  const sma = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
  const variance = prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const std = Math.sqrt(variance);

  return {
    upper: sma + (std * stdDev),
    middle: sma,
    lower: sma - (std * stdDev)
  };
}

function calculateOnChainScore(fundingRate: number, longShortRatio: number): number {
  let score = 50;

  // Funding rate analysis (negative = bearish sentiment = good for selling puts)
  if (fundingRate < -0.01) score += 20;
  else if (fundingRate < 0) score += 10;
  else if (fundingRate > 0.05) score -= 15;

  // Long/Short ratio (> 1 = more longs = potential squeeze = good for selling puts)
  if (longShortRatio > 1.2) score += 15;
  else if (longShortRatio < 0.8) score -= 10;

  return Math.min(100, Math.max(0, score));
}

function determineSentiment(fundingRate: number, longShortRatio: number): string {
  if (fundingRate > 0.03 || longShortRatio > 1.5) return 'extreme_greed';
  if (fundingRate > 0.01 || longShortRatio > 1.2) return 'greed';
  if (fundingRate < -0.03 || longShortRatio < 0.5) return 'extreme_fear';
  if (fundingRate < -0.01 || longShortRatio < 0.8) return 'fear';
  return 'neutral';
}

function getBollingerPosition(position: number): string {
  if (position > 0.8) return 'overbought';
  if (position < 0.2) return 'oversold';
  return 'neutral';
}

function formatWheelStrategyMessage(signal: any, strike: StrikeOption): string {
  const action = signal.recommended_action === 'SELL_PUT' ? '🔴 SELL PUT' : 
                 signal.recommended_action === 'SELL_CALL' ? '🟢 SELL CALL' : '⏸️ HOLD';
  
  const sentiment = signal.macd_signal === 'bullish' ? '📈 Rialzista' : '📉 Ribassista';
  
  let message = `🎯 WHEEL STRATEGY ALERT - OPPORTUNITÀ RILEVATA!\n\n`;
  message += `✅ SEGNALE AUTOMATICO\n`;
  message += `Premium: ${strike.premium.toFixed(2)}% (>= 0.20%)\n`;
  message += `Score: ${strike.score}/100 (> 80)\n\n`;
  
  message += `📊 RACCOMANDAZIONE\n`;
  message += `Azione: ${action}\n`;
  message += `Strike Price: $${signal.recommended_strike_price || 0}\n`;
  message += `Premium Atteso: ${signal.recommended_premium_pct?.toFixed(2) || 0}%\n`;
  message += `Distanza: ${(strike.distance * 100).toFixed(2)}%\n`;
  message += `Delta: ${strike.delta.toFixed(2)}\n\n`;
  
  message += `📈 Analisi Tecnica\n`;
  message += `• Prezzo BTC: $${signal.btc_price_usd || 0}\n`;
  message += `• RSI (14): ${signal.rsi_14?.toFixed(2) || 0}\n`;
  message += `• MACD: ${sentiment}\n`;
  message += `• Bollinger: ${signal.bollinger_position || 'N/A'}\n`;
  message += `• Volatilità 24h: ${signal.volatility_24h?.toFixed(2) || 0}%\n`;
  message += `• Support: $${signal.support_level || 0}\n`;
  message += `• Resistance: $${signal.resistance_level || 0}\n\n`;
  
  message += `🎲 Confidence Score: ${signal.confidence_score?.toFixed(0) || 0}/100\n\n`;
  message += `⏰ ${new Date(signal.created_at).toLocaleString('it-IT')}`;

  return message;
}

function calculateOptimalStrikes(
  currentPrice: number,
  technical: TechnicalIndicators,
  onchain: OnChainMetrics
): StrikeOption[] {
  const strikes: StrikeOption[] = [];
  const TARGET_DAILY_PREMIUM = 0.20; // Target 0.20% daily premium

  // Helper function to round strike to realistic exchange values
  const roundStrike = (price: number): number => {
    if (price > 100000) return Math.round(price / 1000) * 1000; // Round to 1000
    if (price > 50000) return Math.round(price / 500) * 500;   // Round to 500
    if (price > 10000) return Math.round(price / 100) * 100;   // Round to 100
    return Math.round(price / 50) * 50;                        // Round to 50
  };

  // Generate realistic strike options from -12% to -2% below current price
  // Using smaller steps but rounding to exchange-realistic values
  const generatedStrikes = new Set<number>();
  
  for (let distancePct = 0.02; distancePct <= 0.12; distancePct += 0.003) {
    const rawStrike = currentPrice * (1 - distancePct);
    const strike = roundStrike(rawStrike);
    
    // Avoid duplicates
    if (generatedStrikes.has(strike)) continue;
    generatedStrikes.add(strike);
    
    const distance = (currentPrice - strike) / currentPrice;
    
    // Estimate delta (simplified for 1-day options)
    const delta = Math.max(0.05, 0.5 - (distance * 3.5));
    
    // Calculate premium for 1-day option (improved estimation)
    // For daily options at Pionex, premium depends heavily on distance and volatility
    const dailyVolatility = technical.volatility / Math.sqrt(365);
    const distanceBonus = distance * 100 * 0.8; // Distance contributes to premium
    const volatilityFactor = dailyVolatility * 1.5; // Volatility impact
    const timeValue = distanceBonus + volatilityFactor;
    const premium = Math.max(0.05, Math.min(0.50, timeValue));

    // Calculate score based on proximity to 0.20% target
    let score = 50;
    
    // Premium proximity to target (highest priority)
    const premiumDiff = Math.abs(premium - TARGET_DAILY_PREMIUM);
    if (premiumDiff < 0.03) score += 35; // Very close to target
    else if (premiumDiff < 0.05) score += 25;
    else if (premiumDiff < 0.08) score += 15;
    else if (premiumDiff < 0.12) score += 5;
    else score -= 10;

    // Technical factors
    if (strike > technical.support * 0.97) score += 15; // Strike well above support
    if (technical.trend === 'bullish' && distance > 0.03) score += 12;
    if (technical.rsi < 60) score += 10; // Not overbought

    // On-chain factors
    if (onchain.sentiment === 'fear' || onchain.sentiment === 'extreme_fear') score += 12;
    score += onchain.score * 0.2;

    // Distance scoring (prefer 3-8% OTM for daily options - Flying Wheel sweet spot)
    if (distance >= 0.03 && distance <= 0.08) score += 15;
    else if (distance >= 0.02 && distance < 0.03) score += 8;
    else if (distance > 0.08 && distance <= 0.10) score += 5;

    // Delta scoring (prefer 0.10-0.25 delta for daily puts)
    if (delta >= 0.10 && delta <= 0.25) score += 8;

    // Bonus for premiums at or slightly above target
    if (premium >= TARGET_DAILY_PREMIUM && premium <= TARGET_DAILY_PREMIUM * 1.4) score += 18;
    
    // Penalty for too high premiums (means strike too close = risky)
    if (premium > TARGET_DAILY_PREMIUM * 2) score -= 15;

    const recommendation = score > 75 ? 'SELL_PUT' : score > 60 ? 'CONSIDER' : 'HOLD';

    strikes.push({ strike, distance, delta, premium, score: Math.min(100, score), recommendation });
  }

  // Sort by score first, then by proximity to target premium
  const sortedStrikes = strikes.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (Math.abs(scoreDiff) < 5) {
      // If scores are close, prefer the one closer to target premium
      const aDiff = Math.abs(a.premium - TARGET_DAILY_PREMIUM);
      const bDiff = Math.abs(b.premium - TARGET_DAILY_PREMIUM);
      return aDiff - bDiff;
    }
    return scoreDiff;
  });

  // Return only top 8 most relevant strikes
  return sortedStrikes.slice(0, 8);
}
