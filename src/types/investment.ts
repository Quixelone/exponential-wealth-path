
export interface InvestmentData {
  day: number;
  date: string;
  capitalBeforePAC: number;
  pacAmount: number;
  capitalAfterPAC: number;
  dailyReturn: number;
  interestEarnedDaily: number;
  finalCapital: number;
  totalPACInvested: number;
  totalInterest: number;
  isCustomReturn?: boolean;
  isCustomPAC?: boolean; // FIX: Added property for custom PAC editing
  // Real BTC tracking
  realBTCPrice?: number;
  realBTCValue?: number;
  hasActualTrade?: boolean;
  theoreticalVsRealDiff?: number;
}

export interface PACConfig {
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  startDate: Date;
}

// New: Record for editing PAC per day
export type DailyPACOverrides = { [day: number]: number };

export interface InvestmentConfig {
  initialCapital: number;
  timeHorizon: number;
  dailyReturnRate: number;
  currency?: 'EUR' | 'USD' | 'USDT';
  pacConfig: PACConfig;
  useRealBTCPrices?: boolean;
}

export interface ScenarioComparison {
  optimistic: InvestmentData[];
  realistic: InvestmentData[];
  pessimistic: InvestmentData[];
}

export interface DailyReturnEntry {
  day: number;
  returnRate: number;
  date: string;
}

// BTC price tracking
export interface BTCPrice {
  id: string;
  date: string;
  price_usd: number;
  source: string;
  created_at: string;
  updated_at: string;
}

// Actual trade tracking
export interface ActualTrade {
  id: string;
  config_id: string;
  day: number;
  option_sold_date?: string;
  expiration_date?: string;
  trade_date: string;
  btc_amount: number | null;
  fill_price_usd: number | null;
  strike_price?: number;
  trade_type: string;
  option_status: 'filled' | 'expired_otm';
  premium_received_usdt?: number;
  premium_currency?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
