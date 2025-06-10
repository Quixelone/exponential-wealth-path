
-- Creare la tabella per le configurazioni di investimento
CREATE TABLE public.investment_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid(),
  name TEXT NOT NULL DEFAULT 'Configurazione senza nome',
  initial_capital DECIMAL(15,2) NOT NULL,
  time_horizon INTEGER NOT NULL,
  daily_return_rate DECIMAL(8,5) NOT NULL,
  pac_amount DECIMAL(15,2) NOT NULL,
  pac_frequency TEXT NOT NULL CHECK (pac_frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  pac_custom_days INTEGER,
  pac_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Creare la tabella per i rendimenti giornalieri personalizzati
CREATE TABLE public.daily_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.investment_configs(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  return_rate DECIMAL(8,5) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(config_id, day)
);

-- Abilitare Row Level Security (per ora permissivo, preparato per futura autenticazione)
ALTER TABLE public.investment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_returns ENABLE ROW LEVEL SECURITY;

-- Politiche RLS permissive per ora (tutti possono fare tutto)
CREATE POLICY "Allow all operations on investment_configs" 
  ON public.investment_configs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations on daily_returns" 
  ON public.daily_returns 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Creare indici per migliorare le performance
CREATE INDEX idx_investment_configs_user_id ON public.investment_configs(user_id);
CREATE INDEX idx_investment_configs_created_at ON public.investment_configs(created_at DESC);
CREATE INDEX idx_daily_returns_config_id ON public.daily_returns(config_id);
CREATE INDEX idx_daily_returns_day ON public.daily_returns(config_id, day);

-- Trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investment_configs_updated_at 
  BEFORE UPDATE ON public.investment_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
