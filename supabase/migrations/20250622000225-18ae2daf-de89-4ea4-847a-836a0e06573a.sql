
-- Fix Function Search Path Mutable vulnerability by setting explicit search_path for all functions

-- Fix public.update_user_login function
CREATE OR REPLACE FUNCTION public.update_user_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  UPDATE public.user_profiles 
  SET 
    last_login = now(),
    login_count = COALESCE(login_count, 0) + 1,
    updated_at = now()
  WHERE id = user_uuid;
END;
$function$;

-- Fix public.is_user_admin function
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.user_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$function$;

-- Fix public.update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix public.is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$;

-- Fix public.handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
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
$function$;
