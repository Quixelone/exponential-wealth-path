
-- Abilita RLS sulla tabella user_profiles se non è già abilitata
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Elimina tutte le policy esistenti per ricominciare da capo
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;

-- Policy per permettere agli utenti di vedere il proprio profilo
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy per permettere agli admin di vedere tutti i profili
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Policy per permettere agli utenti di aggiornare il proprio profilo
CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy per permettere agli admin di aggiornare tutti i profili
CREATE POLICY "Admins can update all profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Policy per permettere l'inserimento di nuovi profili utente
CREATE POLICY "Enable insert for authenticated users only" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
