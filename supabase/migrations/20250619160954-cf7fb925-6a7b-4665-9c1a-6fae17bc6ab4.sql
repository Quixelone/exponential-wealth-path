
-- Promuovi lcoccimiglio@gmail.com ad admin
UPDATE public.user_profiles 
SET role = 'admin', updated_at = now() 
WHERE email = 'lcoccimiglio@gmail.com';
