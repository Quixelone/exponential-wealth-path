
-- Abilita RLS per la tabella daily_pac_overrides (se non già abilitato)
ALTER TABLE public.daily_pac_overrides ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere le proprie modifiche PAC
CREATE POLICY "Users can view their own daily PAC overrides" 
  ON public.daily_pac_overrides 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = daily_pac_overrides.config_id 
      AND user_id = auth.uid()
    )
  );

-- Policy per permettere agli utenti di inserire le proprie modifiche PAC
CREATE POLICY "Users can create their own daily PAC overrides" 
  ON public.daily_pac_overrides 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = daily_pac_overrides.config_id 
      AND user_id = auth.uid()
    )
  );

-- Policy per permettere agli utenti di aggiornare le proprie modifiche PAC
CREATE POLICY "Users can update their own daily PAC overrides" 
  ON public.daily_pac_overrides 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = daily_pac_overrides.config_id 
      AND user_id = auth.uid()
    )
  );

-- Policy per permettere agli utenti di eliminare le proprie modifiche PAC
CREATE POLICY "Users can delete their own daily PAC overrides" 
  ON public.daily_pac_overrides 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = daily_pac_overrides.config_id 
      AND user_id = auth.uid()
    )
  );
