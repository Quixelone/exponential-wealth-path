-- ============================================
-- Auto-Track Opzioni Pionex - Database Schema
-- ============================================

-- Tabella 1: Log opzioni giornaliere
CREATE TABLE IF NOT EXISTS public.daily_options_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    config_id UUID REFERENCES investment_configs(id) ON DELETE CASCADE,
    
    option_date DATE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    option_type TEXT CHECK (option_type IN ('SELL_PUT', 'COVERED_CALL', 'LOSS', 'EXPIRED', 'NO_OPTION')),
    
    balance_previous_day NUMERIC(18,8),
    balance_current_day NUMERIC(18,8),
    premium_earned NUMERIC(18,8),
    premium_in_usd NUMERIC(18,2),
    premium_in_eur NUMERIC(18,2),
    
    btc_previous_day NUMERIC(18,8),
    btc_current_day NUMERIC(18,8),
    btc_locked_previous NUMERIC(18,8),
    btc_locked_current NUMERIC(18,8),
    
    btc_price_at_settlement NUMERIC(18,2),
    api_sync_status TEXT DEFAULT 'PENDING' CHECK (api_sync_status IN ('PENDING', 'SUCCESS', 'ERROR')),
    sync_error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, option_date)
);

-- Tabella 2: Storico bilanci Pionex
CREATE TABLE IF NOT EXISTS public.balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    check_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    btc_free NUMERIC(18,8),
    btc_locked NUMERIC(18,8),
    usdt_free NUMERIC(18,8),
    usdt_locked NUMERIC(18,8),
    total_value_usd NUMERIC(18,2),
    
    api_response_time_ms INT,
    api_response_raw JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_daily_options_user_date ON public.daily_options_log(user_id, option_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_options_config ON public.daily_options_log(config_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_user_time ON public.balance_history(user_id, check_timestamp DESC);

-- Trigger per auto-update updated_at
CREATE OR REPLACE FUNCTION update_daily_options_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_daily_options_log_updated_at
BEFORE UPDATE ON public.daily_options_log
FOR EACH ROW
EXECUTE FUNCTION update_daily_options_log_updated_at();

-- RLS Policies
ALTER TABLE public.daily_options_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own options log"
ON public.daily_options_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own balance history"
ON public.balance_history FOR SELECT
USING (auth.uid() = user_id);

-- System can insert/update (for edge functions)
CREATE POLICY "System can manage options log"
ON public.daily_options_log FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "System can manage balance history"
ON public.balance_history FOR ALL
USING (true)
WITH CHECK (true);

-- Admins can view all
CREATE POLICY "Admins can view all options"
ON public.daily_options_log FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can view all balances"
ON public.balance_history FOR SELECT
USING (is_admin());

-- ============================================
-- Cron Job Setup (eseguire dopo la migrazione)
-- ============================================
-- Uncomment to enable daily sync at 09:05 UTC
/*
SELECT cron.schedule(
  'pionex-daily-options-sync',
  '5 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/sync-pionex-balance',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo'
    ),
    body := jsonb_build_object('manualSync', false)
  ) AS request_id;
  $$
);
*/