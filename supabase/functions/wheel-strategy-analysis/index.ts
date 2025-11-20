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

    // Fetch current BTC price from Pionex (using Binance as fallback)
    const priceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    const priceData = await priceResponse.json();
    const currentPrice = parseFloat(priceData.price);

    // Fetch klines for technical analysis (1h, last 100 candles)
    const klinesResponse = await fetch(
      'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=100'
    );
    const klines = await klinesResponse.json();

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
    const { error: insertError } = await supabaseClient
      .from('ai_trading_signals')
      .insert({
        user_id: user.id,
        config_id: null, // Will be linked later
        signal_date: now.toISOString().split('T')[0],
        signal_time: now.toISOString(),
        btc_price_usd: currentPrice,
        btc_price_source: 'binance',
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
      });

    if (insertError) {
      console.error('Error saving analysis:', insertError);
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

function calculateOptimalStrikes(
  currentPrice: number,
  technical: TechnicalIndicators,
  onchain: OnChainMetrics
): StrikeOption[] {
  const strikes: StrikeOption[] = [];

  // Generate strike options from -15% to -3% below current price
  for (let distancePct = 0.03; distancePct <= 0.15; distancePct += 0.01) {
    const strike = Math.round(currentPrice * (1 - distancePct) / 100) * 100;
    const distance = (currentPrice - strike) / currentPrice;
    
    // Estimate delta (simplified Black-Scholes approximation)
    const delta = 0.5 - (distance * 2);
    
    // Estimate premium (based on distance and volatility)
    const premium = (distance * 100) * (1 + technical.volatility / 100) * 0.8;

    // Calculate score
    let score = 50;

    // Technical factors
    if (strike > technical.support) score += 15;
    if (technical.trend === 'bullish' && distance > 0.05) score += 10;
    if (technical.rsi < 50) score += 10;

    // On-chain factors
    if (onchain.sentiment === 'fear' || onchain.sentiment === 'extreme_fear') score += 15;
    score += onchain.score * 0.2;

    // Distance scoring
    if (distance > 0.05 && distance < 0.10) score += 15;
    if (premium > 0.3) score += 10;

    // Delta scoring
    if (delta > 0.2 && delta < 0.35) score += 10;

    const recommendation = score > 75 ? 'SELL_PUT' : score > 60 ? 'CONSIDER' : 'HOLD';

    strikes.push({ strike, distance, delta, premium, score: Math.min(100, score), recommendation });
  }

  return strikes.sort((a, b) => b.score - a.score);
}
