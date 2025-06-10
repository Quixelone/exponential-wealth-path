
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

export interface SavedConfiguration {
  id: string;
  name: string;
  config: InvestmentConfig;
  dailyReturns: { [day: number]: number };
  created_at: string;
  updated_at: string;
}
