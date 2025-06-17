
-- Crea tabella per salvare le modifiche PAC giornaliere personalizzate
CREATE TABLE public.daily_pac_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.investment_configs(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  pac_amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(config_id, day)
);

-- Abilita RLS per la tabella daily_pac_overrides
ALTER TABLE public.daily_pac_overrides ENABLE ROW LEVEL SECURITY;

-- Policy per permettere operazioni su daily_pac_overrides (usa le stesse policy di daily_returns)
CREATE POLICY "Allow all operations on daily_pac_overrides" 
  ON public.daily_pac_overrides 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Indici per migliorare le performance
CREATE INDEX idx_daily_pac_overrides_config_id ON public.daily_pac_overrides(config_id);
CREATE INDEX idx_daily_pac_overrides_day ON public.daily_pac_overrides(config_id, day);
