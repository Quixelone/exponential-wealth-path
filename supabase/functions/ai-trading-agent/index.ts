import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketData {
  price: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  priceHistory: number[]; // Last 30 prices for calculations
}

interface TechnicalAnalysis {
  btcPrice: number;
  rsi: number;
  macdTrend: 'bullish' | 'bearish' | 'neutral';
  bollingerPosition: 'upper' | 'middle' | 'lower';
  support: number;
  resistance: number;
  volatility24h: number;
}

interface UserPosition {
  type: 'PUT' | 'CALL' | null;
  strikePrice: number | null;
  expiration: Date | null;
}

interface TradingDecision {
  action: 'SELL_PUT' | 'SELL_CALL' | 'HOLD';
  strikePrice: number | null;
  expectedPremiumPct: number;
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 AI Trading Agent started at', new Date().toISOString());
    
    // Get all active users with notification settings
    const { data: activeUsers, error: usersError } = await supabase
      .from('investment_configs')
      .select(`
        id,
        user_id,
        initial_capital,
        daily_return_rate,
        created_at,
        user_profiles!inner(
          id,
          notification_settings(telegram_chat_id, notifications_enabled)
        )
      `);
    
    if (usersError) throw usersError;
    
    if (!activeUsers || activeUsers.length === 0) {
      console.log('No active users found');
      return new Response(JSON.stringify({ message: 'No active users' }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Filter users with Telegram enabled
    const eligibleUsers = activeUsers.filter(u => {
      const notifSettings = (u.user_profiles as any)?.notification_settings;
      return notifSettings && notifSettings.telegram_chat_id && notifSettings.notifications_enabled;
    });
    
    console.log(`📊 Processing ${eligibleUsers.length} eligible users (${activeUsers.length} total)`);
    
    // Fetch market data from Pionex
    const marketData = await fetchPionexMarketData();
    console.log(`💰 BTC Price: $${marketData.price.toFixed(2)}`);
    
    // Perform technical analysis
    const analysis = performTechnicalAnalysis(marketData);
    console.log('📈 Analysis:', {
      rsi: analysis.rsi.toFixed(2),
      macd: analysis.macdTrend,
      bollinger: analysis.bollingerPosition,
      volatility: analysis.volatility24h.toFixed(2)
    });
    
    const results = [];
    
    for (const user of eligibleUsers) {
      try {
        const telegramChatId = (user.user_profiles as any).notification_settings.telegram_chat_id;
        
        // Check insurance payment
        const insuranceValid = await checkInsurancePayment(user.user_id);
        if (!insuranceValid) {
          console.log(`⚠️ User ${user.user_id} insurance not paid, skipping`);
          continue;
        }
        
        // Get user's last trade
        const { data: lastTrade } = await supabase
          .from('actual_trades')
          .select('*')
          .eq('config_id', user.id)
          .order('trade_date', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        const userPosition: UserPosition = lastTrade ? {
          type: lastTrade.trade_type.includes('PUT') ? 'PUT' : 'CALL',
          strikePrice: lastTrade.strike_price || null,
          expiration: lastTrade.expiration_date ? new Date(lastTrade.expiration_date) : null
        } : { type: null, strikePrice: null, expiration: null };
        
        // Calculate current capital
        const currentCapital = calculateCurrentCapital(user);
        
        // Determine optimal action
        const decision = determineOptimalStrike(analysis, userPosition, currentCapital);
        
        // Save signal to database
        const { data: signal, error: signalError } = await supabase
          .from('ai_trading_signals')
          .insert({
            user_id: user.user_id,
            config_id: user.id,
            signal_date: new Date().toISOString().split('T')[0],
            btc_price_usd: analysis.btcPrice,
            rsi_14: analysis.rsi,
            macd_signal: analysis.macdTrend,
            bollinger_position: analysis.bollingerPosition,
            support_level: analysis.support,
            resistance_level: analysis.resistance,
            volatility_24h: analysis.volatility24h,
            current_position_type: userPosition.type,
            current_strike_price: userPosition.strikePrice,
            will_be_filled: checkIfWillBeFilled(userPosition, analysis.btcPrice),
            recommended_action: decision.action,
            recommended_strike_price: decision.strikePrice,
            recommended_premium_pct: decision.expectedPremiumPct,
            confidence_score: decision.confidence,
            reasoning: decision.reasoning,
            is_premium_too_low: decision.expectedPremiumPct < 0.10,
            insurance_activated: decision.expectedPremiumPct < 0.10,
            telegram_chat_id: telegramChatId
          })
          .select()
          .single();
        
        if (signalError) {
          console.error(`Error saving signal for user ${user.user_id}:`, signalError);
          throw signalError;
        }
        
        // Handle insurance coverage
        if (decision.expectedPremiumPct < 0.10) {
          await activateInsuranceCoverage(user.user_id, user.id, currentCapital);
        } else {
          await checkAndUnlockInsurance(user.user_id, user.id, telegramChatId);
        }
        
        // Queue Telegram notification
        const messageText = formatTelegramMessage(decision, analysis, userPosition);
        const sendTime = new Date();
        sendTime.setHours(10, 0, 0, 0); // 10:00 AM
        
        await supabase
          .from('telegram_notifications_queue')
          .insert({
            user_id: user.user_id,
            message_type: 'daily_signal',
            message_text: messageText,
            telegram_chat_id: telegramChatId,
            priority: 1,
            scheduled_send_time: sendTime.toISOString(),
            related_signal_id: signal.id
          });
        
        results.push({ 
          user_id: user.user_id, 
          status: 'success', 
          action: decision.action,
          premium: decision.expectedPremiumPct 
        });
        
      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error);
        results.push({ 
          user_id: user.user_id, 
          status: 'error', 
          error: error.message 
        });
      }
    }
    
    console.log('✅ AI Trading Agent completed. Results:', results);
    
    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
    
  } catch (error) {
    console.error('❌ AI Trading Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});

// Helper functions
async function fetchPionexMarketData(): Promise<MarketData> {
  console.log('Fetching BTC market data from Binance...');
  
  // Use Binance public API (no auth required) for testing
  // Fetch current ticker
  const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT`);
  
  if (!tickerResponse.ok) {
    throw new Error(`Binance ticker API error: ${tickerResponse.statusText}`);
  }
  
  const tickerData = await tickerResponse.json();
  const price = parseFloat(tickerData.lastPrice);
  const high24h = parseFloat(tickerData.highPrice);
  const low24h = parseFloat(tickerData.lowPrice);
  const volume24h = parseFloat(tickerData.volume);
  
  console.log(`Current BTC price: $${price}`);
  
  // Fetch kline data for price history (last 30 hours)
  const klineResponse = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=30`
  );
  
  if (!klineResponse.ok) {
    throw new Error(`Binance kline API error: ${klineResponse.statusText}`);
  }
  
  const klineData = await klineResponse.json();
  const priceHistory = klineData.map((k: any) => parseFloat(k[4])); // close price is at index 4
  
  console.log(`Fetched ${priceHistory.length} hourly price points`);
  
  return {
    price,
    high24h,
    low24h,
    volume24h,
    priceHistory
  };
}

function createPionexSignature(
  apiKey: string,
  apiSecret: string,
  timestamp: number,
  params: Record<string, any>
): string {
  const queryString = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const signaturePayload = `${timestamp}${queryString}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const messageData = encoder.encode(signaturePayload);
  
  // Simple HMAC SHA256 (Deno native)
  const key = crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // For simplicity, using a basic implementation
  // In production, use proper crypto.subtle.sign
  return signaturePayload; // Placeholder - implement proper HMAC
}

function performTechnicalAnalysis(marketData: MarketData): TechnicalAnalysis {
  const prices = marketData.priceHistory;
  const currentPrice = marketData.price;
  
  // Calculate RSI
  const rsi = calculateRSI(prices, 14);
  
  // Calculate MACD
  const macd = calculateMACD(prices);
  
  // Calculate Bollinger Bands
  const bollinger = calculateBollingerBands(prices, 20, 2);
  
  // Calculate support/resistance
  const pivots = calculatePivotPoints(marketData.high24h, marketData.low24h, currentPrice);
  
  // Calculate volatility
  const volatility = calculateVolatility24h(prices.slice(-24));
  
  return {
    btcPrice: currentPrice,
    rsi,
    macdTrend: macd.trend,
    bollingerPosition: bollinger.position,
    support: pivots.s1,
    resistance: pivots.r1,
    volatility24h: volatility
  };
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i <= period; i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { 
  macd: number; 
  signal: number; 
  histogram: number; 
  trend: 'bullish' | 'bearish' | 'neutral' 
} {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  const macdLine = [macd];
  const signal = calculateEMA(macdLine, 9);
  const histogram = macd - signal;
  
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (histogram > 0 && macd > signal) trend = 'bullish';
  else if (histogram < 0 && macd < signal) trend = 'bearish';
  
  return { macd, signal, histogram, trend };
}

function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  
  return ema;
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
  position: 'upper' | 'middle' | 'lower';
} {
  const recentPrices = prices.slice(-period);
  const middle = recentPrices.reduce((a, b) => a + b) / period;
  
  const variance = recentPrices
    .map(p => Math.pow(p - middle, 2))
    .reduce((a, b) => a + b) / period;
  
  const stdDeviation = Math.sqrt(variance);
  
  const upper = middle + (stdDev * stdDeviation);
  const lower = middle - (stdDev * stdDeviation);
  
  const currentPrice = prices[prices.length - 1];
  
  let position: 'upper' | 'middle' | 'lower' = 'middle';
  if (currentPrice >= upper - (upper - middle) * 0.2) position = 'upper';
  else if (currentPrice <= lower + (middle - lower) * 0.2) position = 'lower';
  
  return { upper, middle, lower, position };
}

function calculatePivotPoints(high: number, low: number, close: number): {
  pivot: number;
  r1: number;
  r2: number;
  s1: number;
  s2: number;
} {
  const pivot = (high + low + close) / 3;
  const r1 = (2 * pivot) - low;
  const r2 = pivot + (high - low);
  const s1 = (2 * pivot) - high;
  const s2 = pivot - (high - low);
  
  return { pivot, r1, r2, s1, s2 };
}

function calculateVolatility24h(prices: number[]): number {
  const returns = prices.slice(1).map((price, i) => 
    Math.log(price / prices[i])
  );
  
  const mean = returns.reduce((a, b) => a + b) / returns.length;
  const variance = returns
    .map(r => Math.pow(r - mean, 2))
    .reduce((a, b) => a + b) / returns.length;
  
  const volatility = Math.sqrt(variance) * Math.sqrt(365);
  
  return volatility * 100;
}

function determineOptimalStrike(
  analysis: TechnicalAnalysis,
  userPosition: UserPosition,
  userCapital: number
): TradingDecision {
  const { btcPrice, rsi, macdTrend, bollingerPosition, support, volatility24h } = analysis;
  
  // Check if current position will be filled
  const willBeFilled = checkIfWillBeFilled(userPosition, btcPrice);
  
  if (willBeFilled && userPosition.type === 'PUT') {
    // PUT filled, now has BTC, sell CALL
    const callStrike = Math.round((btcPrice * 1.035) / 100) * 100;
    const premium = estimatePremium(callStrike, btcPrice, volatility24h);
    
    return {
      action: 'SELL_CALL',
      strikePrice: callStrike,
      expectedPremiumPct: premium,
      confidence: 0.85,
      reasoning: `PUT fillata. BTC acquistato a $${userPosition.strikePrice}. Vendi CALL coperta a $${callStrike} (+3.5%).`
    };
  }
  
  if (willBeFilled && userPosition.type === 'CALL') {
    // CALL filled, sold BTC, back to PUT
    const putStrike = Math.round((btcPrice * 0.965) / 100) * 100;
    const premium = estimatePremium(putStrike, btcPrice, volatility24h);
    
    return {
      action: 'SELL_PUT',
      strikePrice: putStrike,
      expectedPremiumPct: premium,
      confidence: 0.85,
      reasoning: `CALL fillata. BTC venduto a $${userPosition.strikePrice}. Torna a PUT per ri-entrare.`
    };
  }
  
  // ===== MULTI-STRIKE LOGIC =====
  // Evaluate 5 different strike options
  const strikeOptions = [
    { adjustment: -1.0, label: "Aggressivo" },
    { adjustment: -2.0, label: "Moderato-Alto" },
    { adjustment: -3.0, label: "Moderato" },
    { adjustment: -3.5, label: "Conservativo" },
    { adjustment: -5.0, label: "Ultra-Conservativo" }
  ];
  
  // Calculate premium for each strike
  const evaluatedStrikes = strikeOptions.map(option => {
    const strikePrice = Math.round((btcPrice * (1 + option.adjustment / 100)) / 100) * 100;
    const premium = estimatePremium(strikePrice, btcPrice, volatility24h);
    const distanceFromSpot = Math.abs(strikePrice - btcPrice);
    
    // Score = premium * (1 - distance penalty)
    // Further strikes are slightly penalized
    const distancePenalty = (distanceFromSpot / btcPrice) * 0.3;
    const score = premium * (1 - distancePenalty);
    
    return {
      ...option,
      strikePrice,
      premium,
      score,
      distancePct: option.adjustment
    };
  });
  
  // Sort by score (best premium/risk ratio)
  evaluatedStrikes.sort((a, b) => b.score - a.score);
  
  // Apply preferences based on technical indicators
  let preferredStrikes = evaluatedStrikes;
  
  if (rsi < 35) {
    // Oversold market: prefer more conservative strikes (-3.5%, -5%)
    preferredStrikes = evaluatedStrikes.filter(s => s.adjustment <= -3.0);
  } else if (rsi > 65) {
    // Overbought market: prefer more aggressive strikes (-1%, -2%)
    preferredStrikes = evaluatedStrikes.filter(s => s.adjustment >= -3.0);
  }
  
  if (macdTrend === 'bearish' && bollingerPosition === 'upper') {
    // Weakness signal: more conservative
    preferredStrikes = evaluatedStrikes.filter(s => s.adjustment <= -2.5);
  } else if (macdTrend === 'bullish' && bollingerPosition === 'lower') {
    // Strength signal: can be more aggressive
    preferredStrikes = evaluatedStrikes.filter(s => s.adjustment >= -3.5);
  }
  
  // Select optimal strike with best score among preferred
  const optimalStrike = preferredStrikes.length > 0 
    ? preferredStrikes[0] 
    : evaluatedStrikes[0];
  
  // Detailed logging for debugging
  console.log('📊 Strike Analysis:', {
    btcPrice: btcPrice.toFixed(2),
    rsi: rsi.toFixed(1),
    macdTrend,
    bollingerPosition,
    evaluatedStrikes: evaluatedStrikes.map(s => ({
      strike: s.strikePrice,
      adjustment: s.distancePct + '%',
      premium: s.premium.toFixed(3) + '%',
      score: s.score.toFixed(4)
    })),
    optimalChoice: {
      strike: optimalStrike.strikePrice,
      label: optimalStrike.label,
      adjustment: optimalStrike.distancePct + '%',
      premium: optimalStrike.premium.toFixed(3) + '%',
      score: optimalStrike.score.toFixed(4)
    }
  });
  
  // Check minimum threshold
  if (optimalStrike.premium < 0.10) {
    // Get top 3 alternatives for reasoning
    const topAlternatives = evaluatedStrikes.slice(0, 3)
      .map(s => `  • ${s.distancePct}%: $${s.strikePrice} → ${s.premium.toFixed(3)}%`)
      .join('\n');
    
    return {
      action: 'HOLD',
      strikePrice: null,
      expectedPremiumPct: optimalStrike.premium,
      confidence: 0.95,
      reasoning: `Miglior premio disponibile: ${optimalStrike.premium.toFixed(3)}% (Strike ${optimalStrike.label} $${optimalStrike.strikePrice}).\n\nAlternative valutate:\n${topAlternatives}\n\nTutti sotto soglia 0.10%. Copertura assicurativa attivata (0.15% garantito).`
    };
  }
  
  // Calculate confidence based on market conditions
  let confidence = 0.7;
  if (rsi < 40 || rsi > 60) confidence += 0.1;
  if (macdTrend !== 'neutral') confidence += 0.05;
  if (volatility24h < 50) confidence += 0.1;
  if (optimalStrike.score > 0.10) confidence += 0.05;
  confidence = Math.min(confidence, 0.95);
  
  // Build detailed reasoning with alternatives
  const topAlternatives = evaluatedStrikes.slice(0, 3)
    .map(s => `  • ${s.distancePct}%: $${s.strikePrice} → ${s.premium.toFixed(3)}%${s.strikePrice === optimalStrike.strikePrice ? ' ⭐' : ''}`)
    .join('\n');
  
  const apyEstimate = (optimalStrike.premium * 365).toFixed(1);
  
  return {
    action: 'SELL_PUT',
    strikePrice: optimalStrike.strikePrice,
    expectedPremiumPct: optimalStrike.premium,
    confidence,
    reasoning: `✅ Strike Scelto: $${optimalStrike.strikePrice} (${optimalStrike.distancePct}% - ${optimalStrike.label})\n💰 Premio: ${optimalStrike.premium.toFixed(3)}% giornaliero (~${apyEstimate}% APY)\n\n📊 Alternative valutate:\n${topAlternatives}\n\n🎯 Indicatori: RSI ${rsi.toFixed(1)}, MACD ${macdTrend}, Bollinger ${bollingerPosition}, Vol ${volatility24h.toFixed(1)}%`
  };
}

function checkIfWillBeFilled(position: UserPosition, currentPrice: number): boolean {
  if (!position.type || !position.strikePrice) return false;
  
  if (position.type === 'PUT') {
    return currentPrice <= position.strikePrice;
  } else if (position.type === 'CALL') {
    return currentPrice >= position.strikePrice;
  }
  
  return false;
}

function estimatePremium(strike: number, spotPrice: number, volatility: number): number {
  const moneyness = Math.abs(strike - spotPrice) / spotPrice;
  const timeFactor = 1 / 365;
  const volFactor = volatility / 100;
  
  const premium = moneyness * volFactor * 100 * 10;
  
  return Math.max(premium, 0.05);
}

function calculateCurrentCapital(user: any): number {
  const initialCapital = user.initial_capital;
  const dailyReturnRate = user.daily_return_rate / 100;
  const createdAt = new Date(user.created_at);
  const daysPassed = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  return initialCapital * Math.pow(1 + dailyReturnRate, daysPassed);
}

async function checkInsurancePayment(userId: string): Promise<boolean> {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  
  const { data, error } = await supabase
    .from('insurance_payments')
    .select('is_paid')
    .eq('user_id', userId)
    .eq('payment_month', currentMonth)
    .maybeSingle();
  
  if (error || !data) return false;
  
  return data.is_paid === true;
}

async function activateInsuranceCoverage(userId: string, configId: string, capital: number): Promise<void> {
  const { data: existing } = await supabase
    .from('insurance_coverage_periods')
    .select('id, days_covered, total_premium_accumulated_usdt')
    .eq('user_id', userId)
    .eq('config_id', configId)
    .eq('is_active', true)
    .maybeSingle();
  
  const dailyPremium = capital * 0.0015; // 0.15%
  
  if (existing) {
    await supabase
      .from('insurance_coverage_periods')
      .update({
        days_covered: existing.days_covered + 1,
        total_premium_accumulated_usdt: existing.total_premium_accumulated_usdt + dailyPremium,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('insurance_coverage_periods')
      .insert({
        user_id: userId,
        config_id: configId,
        start_date: new Date().toISOString().split('T')[0],
        base_capital_for_premium: capital,
        days_covered: 1,
        total_premium_accumulated_usdt: dailyPremium
      });
  }
  
  console.log(`🛡️ Insurance coverage activated for user ${userId}`);
}

async function checkAndUnlockInsurance(userId: string, configId: string, telegramChatId: string): Promise<void> {
  const { data: activeCoverage } = await supabase
    .from('insurance_coverage_periods')
    .select('*')
    .eq('user_id', userId)
    .eq('config_id', configId)
    .eq('is_active', true)
    .maybeSingle();
  
  if (!activeCoverage) return;
  
  await supabase
    .from('insurance_coverage_periods')
    .update({
      is_active: false,
      end_date: new Date().toISOString().split('T')[0],
      unlocked_at: new Date().toISOString()
    })
    .eq('id', activeCoverage.id);
  
  await supabase
    .from('telegram_notifications_queue')
    .insert({
      user_id: userId,
      message_type: 'insurance_payout_request',
      message_text: `🎉 *Copertura Assicurativa Sbloccata!*\n\n` +
                   `Premio accumulato: ${activeCoverage.total_premium_accumulated_usdt.toFixed(2)} USDT\n` +
                   `Giorni coperti: ${activeCoverage.days_covered}\n\n` +
                   `Inviaci il tuo indirizzo USDT (BNB Chain) per ricevere il pagamento.`,
      telegram_chat_id: telegramChatId,
      priority: 2,
      related_coverage_id: activeCoverage.id
    });
  
  console.log(`🔓 Insurance unlocked for user ${userId}, amount: $${activeCoverage.total_premium_accumulated_usdt}`);
}

function formatTelegramMessage(
  decision: TradingDecision,
  analysis: TechnicalAnalysis,
  userPosition: UserPosition
): string {
  const emoji = decision.action === 'SELL_PUT' ? '🟢' : decision.action === 'SELL_CALL' ? '🔵' : '⏸️';
  
  let msg = `${emoji} *Segnale Trading Giornaliero*\n\n`;
  msg += `📅 ${new Date().toLocaleDateString('it-IT')}\n`;
  msg += `⏰ 10:00 AM CET\n\n`;
  
  msg += `💰 BTC: $${analysis.btcPrice.toFixed(0)}\n`;
  msg += `📊 RSI: ${analysis.rsi.toFixed(1)}\n`;
  msg += `📈 MACD: ${analysis.macdTrend}\n`;
  msg += `📉 Volatilità 24h: ${analysis.volatility24h.toFixed(2)}%\n\n`;
  
  if (userPosition.type) {
    const filled = checkIfWillBeFilled(userPosition, analysis.btcPrice);
    msg += `🔍 *Posizione Attuale:*\n`;
    msg += `   ${userPosition.type} @ $${userPosition.strikePrice?.toFixed(0)}\n`;
    msg += `   ${filled ? '❌ FILLATA' : '✅ OTM'}\n\n`;
  }
  
  msg += `🎯 *Azione:* ${decision.action}\n`;
  
  if (decision.action !== 'HOLD') {
    msg += `💵 Strike: $${decision.strikePrice?.toFixed(0)}\n`;
    msg += `💰 Premio: ${decision.expectedPremiumPct.toFixed(2)}%\n`;
    msg += `🎲 Confidence: ${(decision.confidence * 100).toFixed(0)}%\n\n`;
  } else {
    msg += `⚠️ Premio troppo basso (${decision.expectedPremiumPct.toFixed(3)}%)\n`;
    msg += `🛡️ Copertura attivata: 0.15% garantito\n\n`;
  }
  
  msg += `📝 ${decision.reasoning}\n\n`;
  msg += `✨ _Powered by AI Trading Agent_`;
  
  return msg;
}
