-- AI Trading Signals Table
CREATE TABLE IF NOT EXISTS public.ai_trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES public.investment_configs(id) ON DELETE CASCADE,
  signal_date DATE NOT NULL,
  signal_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Market data at analysis time
  btc_price_usd NUMERIC NOT NULL,
  btc_price_source TEXT DEFAULT 'pionex',
  
  -- Technical analysis
  rsi_14 NUMERIC,
  macd_signal TEXT, -- 'bullish', 'bearish', 'neutral'
  bollinger_position TEXT, -- 'upper', 'middle', 'lower'
  support_level NUMERIC,
  resistance_level NUMERIC,
  volatility_24h NUMERIC,
  
  -- User's open position (if exists)
  current_position_type TEXT, -- 'PUT', 'CALL', null
  current_strike_price NUMERIC,
  current_expiration TIMESTAMP WITH TIME ZONE,
  will_be_filled BOOLEAN DEFAULT false,
  fill_probability NUMERIC, -- 0.0 - 1.0
  
  -- AI recommendation
  recommended_action TEXT NOT NULL, -- 'SELL_PUT', 'SELL_CALL', 'HOLD'
  recommended_strike_price NUMERIC,
  recommended_premium_pct NUMERIC,
  confidence_score NUMERIC, -- 0.0 - 1.0
  reasoning TEXT,
  
  -- Insurance coverage
  is_premium_too_low BOOLEAN DEFAULT false,
  insurance_activated BOOLEAN DEFAULT false,
  
  -- Notification status
  telegram_sent BOOLEAN DEFAULT false,
  telegram_sent_at TIMESTAMP WITH TIME ZONE,
  telegram_chat_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_signals_user_date ON public.ai_trading_signals(user_id, signal_date DESC);
CREATE INDEX idx_signals_config ON public.ai_trading_signals(config_id);
CREATE INDEX idx_signals_telegram_pending ON public.ai_trading_signals(telegram_sent) WHERE telegram_sent = false;

-- RLS Policies for ai_trading_signals
ALTER TABLE public.ai_trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own signals"
ON public.ai_trading_signals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert signals"
ON public.ai_trading_signals FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all signals"
ON public.ai_trading_signals FOR SELECT
USING (is_admin());

-- Insurance Coverage Periods Table
CREATE TABLE IF NOT EXISTS public.insurance_coverage_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  config_id UUID NOT NULL REFERENCES public.investment_configs(id) ON DELETE CASCADE,
  
  -- Coverage period
  start_date DATE NOT NULL,
  end_date DATE, -- NULL if still active
  is_active BOOLEAN DEFAULT true,
  
  -- Fictitious premium accumulated
  daily_fictitious_premium_pct NUMERIC DEFAULT 0.15, -- 0.15%
  total_premium_accumulated_usdt NUMERIC DEFAULT 0,
  days_covered INTEGER DEFAULT 0,
  
  -- Capital base for premium calculation
  base_capital_for_premium NUMERIC NOT NULL,
  
  -- Unlock and payout
  unlocked_at TIMESTAMP WITH TIME ZONE,
  payout_requested BOOLEAN DEFAULT false,
  payout_address TEXT, -- USDT BNB Chain address
  payout_amount_usdt NUMERIC,
  payout_tx_hash TEXT,
  payout_completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_coverage_active ON public.insurance_coverage_periods(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_coverage_config ON public.insurance_coverage_periods(config_id);

-- RLS Policies for insurance_coverage_periods
ALTER TABLE public.insurance_coverage_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coverage"
ON public.insurance_coverage_periods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage coverage"
ON public.insurance_coverage_periods FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all coverage"
ON public.insurance_coverage_periods FOR SELECT
USING (is_admin());

-- Insurance Payments Table
CREATE TABLE IF NOT EXISTS public.insurance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Monthly payment
  payment_month DATE NOT NULL, -- e.g. 2025-12-01 for December 2025
  payment_due_date DATE NOT NULL, -- always 3rd of month
  
  -- Payment status
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_amount_eur NUMERIC,
  payment_method TEXT, -- 'card', 'bank_transfer', 'crypto', etc.
  payment_reference TEXT,
  
  -- Automatic verification
  last_check_at TIMESTAMP WITH TIME ZONE,
  grace_period_until DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_insurance_user_month ON public.insurance_payments(user_id, payment_month);
CREATE INDEX idx_insurance_unpaid ON public.insurance_payments(is_paid, payment_due_date) WHERE is_paid = false;

-- RLS Policies for insurance_payments
ALTER TABLE public.insurance_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.insurance_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
ON public.insurance_payments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can manage payments"
ON public.insurance_payments FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all payments"
ON public.insurance_payments FOR SELECT
USING (is_admin());

-- Telegram Notifications Queue Table
CREATE TABLE IF NOT EXISTS public.telegram_notifications_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Notification content
  message_type TEXT NOT NULL, -- 'daily_signal', 'insurance_payout_request', 'payment_reminder'
  message_text TEXT NOT NULL,
  telegram_chat_id TEXT NOT NULL,
  
  -- Priority and scheduling
  priority INTEGER DEFAULT 5, -- 1 = high, 10 = low
  scheduled_send_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Send status
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  related_signal_id UUID REFERENCES public.ai_trading_signals(id) ON DELETE SET NULL,
  related_coverage_id UUID REFERENCES public.insurance_coverage_periods(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_queue_pending ON public.telegram_notifications_queue(sent, scheduled_send_time) WHERE sent = false;
CREATE INDEX idx_telegram_queue_user ON public.telegram_notifications_queue(user_id, sent);

-- RLS Policies for telegram_notifications_queue
ALTER TABLE public.telegram_notifications_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.telegram_notifications_queue FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage notifications"
ON public.telegram_notifications_queue FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all notifications"
ON public.telegram_notifications_queue FOR SELECT
USING (is_admin());

-- Triggers for updated_at
CREATE TRIGGER update_ai_trading_signals_updated_at
BEFORE UPDATE ON public.ai_trading_signals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_coverage_periods_updated_at
BEFORE UPDATE ON public.insurance_coverage_periods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_payments_updated_at
BEFORE UPDATE ON public.insurance_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_notifications_queue_updated_at
BEFORE UPDATE ON public.telegram_notifications_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();