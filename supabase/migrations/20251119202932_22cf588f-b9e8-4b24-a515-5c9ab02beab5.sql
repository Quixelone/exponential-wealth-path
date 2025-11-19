-- Create broker_connections table
CREATE TABLE IF NOT EXISTS public.broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  broker_name TEXT NOT NULL CHECK (broker_name IN ('pionex', 'bybit', 'binance', 'bitget', 'kucoin', 'bingx')),
  api_key TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  api_passphrase TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_date TIMESTAMP WITH TIME ZONE,
  connection_status TEXT DEFAULT 'never_synced' CHECK (connection_status IN ('connected', 'error', 'never_synced')),
  last_error_message TEXT,
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'daily' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, broker_name)
);

-- Enable RLS
ALTER TABLE public.broker_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own broker connections"
  ON public.broker_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own broker connections"
  ON public.broker_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own broker connections"
  ON public.broker_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own broker connections"
  ON public.broker_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Add new fields to daily_options_log
ALTER TABLE public.daily_options_log 
ADD COLUMN IF NOT EXISTS broker_source TEXT,
ADD COLUMN IF NOT EXISTS broker_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_method TEXT CHECK (sync_method IN ('manual', 'auto_api'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_options_broker_tx 
  ON public.daily_options_log(broker_transaction_id) 
  WHERE broker_transaction_id IS NOT NULL;

-- Create index for broker connections
CREATE INDEX IF NOT EXISTS idx_broker_connections_user 
  ON public.broker_connections(user_id);

-- Update updated_at trigger for broker_connections
CREATE OR REPLACE FUNCTION public.update_broker_connection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_broker_connections_updated_at
  BEFORE UPDATE ON public.broker_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_broker_connection_updated_at();