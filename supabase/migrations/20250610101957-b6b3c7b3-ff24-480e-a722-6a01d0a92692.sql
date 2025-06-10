
-- Aggiornare le politiche RLS per limitare l'accesso alle configurazioni dell'utente
DROP POLICY IF EXISTS "Allow all operations on investment_configs" ON public.investment_configs;
DROP POLICY IF EXISTS "Allow all operations on daily_returns" ON public.daily_returns;

-- Politiche per investment_configs: gli utenti vedono solo le proprie configurazioni
CREATE POLICY "Users can view their own configs" 
  ON public.investment_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configs" 
  ON public.investment_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configs" 
  ON public.investment_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configs" 
  ON public.investment_configs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Politiche per daily_returns: accesso tramite config_id
CREATE POLICY "Users can view daily returns for their configs" 
  ON public.daily_returns 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = config_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert daily returns for their configs" 
  ON public.daily_returns 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = config_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update daily returns for their configs" 
  ON public.daily_returns 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = config_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = config_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete daily returns for their configs" 
  ON public.daily_returns 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.investment_configs 
      WHERE id = config_id AND user_id = auth.uid()
    )
  );

-- Creare tabella per i profili utente con ruoli
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Abilitare RLS per user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Politiche per user_profiles
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user'); -- Impedisce agli utenti di auto-promuoversi ad admin

-- Funzione per creare automaticamente il profilo utente al momento della registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare il profilo quando un utente si registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funzione di sicurezza per verificare se l'utente è admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Politiche aggiuntive per gli admin (possono vedere tutte le configurazioni)
CREATE POLICY "Admins can view all configs" 
  ON public.investment_configs 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can view all daily returns" 
  ON public.daily_returns 
  FOR SELECT 
  USING (public.is_admin());

-- Aggiornare il trigger per updated_at su user_profiles
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Impostare il primo utente come amministratore (sostituisci con la tua email)
-- Questa riga andrà eseguita manualmente dopo aver creato il tuo account
-- UPDATE public.user_profiles SET role = 'admin' WHERE email = 'tua-email@esempio.com';
