-- Fix search_path for trigger functions to prevent search path manipulation attacks
-- This sets a fixed search path for security-sensitive trigger functions

-- Update update_daily_options_log_updated_at
CREATE OR REPLACE FUNCTION public.update_daily_options_log_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$function$;

-- Update update_investor_inquiries_updated_at
CREATE OR REPLACE FUNCTION public.update_investor_inquiries_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column (used by multiple triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;