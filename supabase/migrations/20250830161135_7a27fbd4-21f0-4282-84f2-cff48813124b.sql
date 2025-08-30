-- Add BTC prices table for historical/real prices
CREATE TABLE public.btc_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  price_usd NUMERIC NOT NULL,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add actual trades table for recording real fills
CREATE TABLE public.actual_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL,
  day INTEGER NOT NULL,
  trade_date DATE NOT NULL,
  btc_amount NUMERIC NOT NULL,
  fill_price_usd NUMERIC NOT NULL,
  trade_type TEXT NOT NULL DEFAULT 'option_fill',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add real BTC price tracking to investment configs
ALTER TABLE public.investment_configs 
ADD COLUMN use_real_btc_prices BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX idx_btc_prices_date ON public.btc_prices(date);
CREATE INDEX idx_actual_trades_config_day ON public.actual_trades(config_id, day);

-- Enable RLS on new tables
ALTER TABLE public.btc_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actual_trades ENABLE ROW LEVEL SECURITY;

-- BTC prices policies (public read, admin write)
CREATE POLICY "Everyone can view BTC prices" 
ON public.btc_prices 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage BTC prices" 
ON public.btc_prices 
FOR ALL 
USING (is_admin());

-- Actual trades policies (user-specific)
CREATE POLICY "Users can view their own trades" 
ON public.actual_trades 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM investment_configs 
  WHERE investment_configs.id = actual_trades.config_id 
  AND investment_configs.user_id = auth.uid()
));

CREATE POLICY "Users can create their own trades" 
ON public.actual_trades 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM investment_configs 
  WHERE investment_configs.id = actual_trades.config_id 
  AND investment_configs.user_id = auth.uid()
));

CREATE POLICY "Users can update their own trades" 
ON public.actual_trades 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM investment_configs 
  WHERE investment_configs.id = actual_trades.config_id 
  AND investment_configs.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own trades" 
ON public.actual_trades 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM investment_configs 
  WHERE investment_configs.id = actual_trades.config_id 
  AND investment_configs.user_id = auth.uid()
));

-- Add trigger for updating timestamps
CREATE TRIGGER update_btc_prices_updated_at
BEFORE UPDATE ON public.btc_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_actual_trades_updated_at
BEFORE UPDATE ON public.actual_trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();