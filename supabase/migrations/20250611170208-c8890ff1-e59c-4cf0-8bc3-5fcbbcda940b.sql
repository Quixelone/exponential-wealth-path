
-- Estendere la tabella user_profiles con campi aggiuntivi
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Creare tabella per le impostazioni di notifica
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  whatsapp_number TEXT,
  telegram_chat_id TEXT,
  preferred_method TEXT CHECK (preferred_method IN ('whatsapp', 'telegram', 'email')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Creare tabella per i promemoria di pagamento
CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  payment_day INTEGER NOT NULL CHECK (payment_day >= 1 AND payment_day <= 31),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly')),
  amount DECIMAL(10,2),
  description TEXT,
  next_reminder_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Creare tabella per il tracking delle sessioni utente
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  session_duration INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilitare RLS sulle nuove tabelle
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Politiche RLS per notification_settings
CREATE POLICY "Users can manage their own notification settings" 
  ON public.notification_settings 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all notification settings" 
  ON public.notification_settings 
  FOR SELECT 
  USING (public.is_admin());

-- Politiche RLS per payment_reminders
CREATE POLICY "Users can manage their own payment reminders" 
  ON public.payment_reminders 
  FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment reminders" 
  ON public.payment_reminders 
  FOR SELECT 
  USING (public.is_admin());

-- Politiche RLS per user_sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "System can insert sessions" 
  ON public.user_sessions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update sessions" 
  ON public.user_sessions 
  FOR UPDATE 
  USING (true);

-- Aggiornare la funzione handle_new_user per includere i nuovi campi
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    role,
    first_name,
    last_name,
    google_id
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    'user',
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'given_name'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NEW.raw_user_meta_data ->> 'family_name'),
    NEW.raw_user_meta_data ->> 'provider_id'
  );
  
  -- Creare impostazioni di notifica di default
  INSERT INTO public.notification_settings (user_id, preferred_method)
  VALUES (NEW.id, 'email');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creare trigger per aggiornare updated_at sulle nuove tabelle
CREATE TRIGGER update_notification_settings_updated_at 
  BEFORE UPDATE ON public.notification_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_reminders_updated_at 
  BEFORE UPDATE ON public.payment_reminders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Creare funzione per aggiornare il login
CREATE OR REPLACE FUNCTION public.update_user_login(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.user_profiles 
  SET 
    last_login = now(),
    login_count = COALESCE(login_count, 0) + 1,
    updated_at = now()
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creare indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_user_id ON public.payment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_next_date ON public.payment_reminders(next_reminder_date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_login_time ON public.user_sessions(login_time);
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id ON public.user_profiles(google_id);
