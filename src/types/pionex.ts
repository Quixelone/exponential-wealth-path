/**
 * Pionex API Integration Types
 * Local type definitions for Pionex balance and options tracking
 */

export interface DailyOptionsEntry {
  id: string;
  user_id: string;
  option_date: string;
  option_type: string | null;
  premium_earned: number | null;
  premium_in_eur: number | null;
  btc_locked_current: number | null;
  api_sync_status: string;
  recorded_at: string;
  // Additional fields from database
  balance_previous_day?: number | null;
  balance_current_day?: number | null;
  btc_previous_day?: number | null;
  btc_current_day?: number | null;
  btc_locked_previous?: number | null;
  premium_in_usd?: number | null;
  btc_price_at_settlement?: number | null;
  sync_error_message?: string | null;
  config_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BalanceSnapshot {
  id: string;
  user_id: string;
  btc_free: number | null;
  btc_locked: number | null;
  usdt_free: number | null;
  usdt_locked: number | null;
  total_value_usd: number | null;
  check_timestamp: string;
  api_response_raw?: any;
  api_response_time_ms?: number | null;
  created_at?: string;
}

export interface PionexSyncResult {
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
  todayEntry: DailyOptionsEntry | null;
  recentEntries: DailyOptionsEntry[];
  currentBalance: BalanceSnapshot | null;
  manualSync: () => Promise<void>;
  refreshData: () => Promise<void>;
}
