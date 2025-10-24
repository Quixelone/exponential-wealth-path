
import { InvestmentConfig } from './investment';

export interface DatabaseConfig {
  id: string;
  user_id: string | null;
  name: string;
  initial_capital: number;
  time_horizon: number;
  daily_return_rate: number;
  pac_amount: number;
  pac_frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  pac_custom_days: number | null;
  pac_start_date: string;
  use_real_btc_prices?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDailyReturn {
  id: string;
  config_id: string;
  day: number;
  return_rate: number;
  created_at: string;
}

export interface DatabaseDailyPACOverride {
  id: string;
  config_id: string;
  day: number;
  pac_amount: number;
  created_at: string;
}

export interface SavedConfiguration {
  id: string;
  name: string;
  config: InvestmentConfig;
  dailyReturns: { [day: number]: number };
  dailyPACOverrides: { [day: number]: number };
  created_at: string;
  updated_at: string;
  is_insured?: boolean;
}

// BTC tracking types
export interface DatabaseBTCPrice {
  id: string;
  date: string;
  price_usd: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseActualTrade {
  id: string;
  config_id: string;
  day: number;
  trade_date: string;
  btc_amount: number;
  fill_price_usd: number;
  strike_price?: number;
  trade_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
