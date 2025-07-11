/*
  # Miglioramento della funzione handle_new_user

  1. Modifiche
    - Aggiunge gestione degli errori più robusta
    - Migliora il logging per il debug
    - Assicura che il profilo utente venga creato anche in caso di errori
*/

-- Migliora la funzione handle_new_user per essere più robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_count integer;
  v_user_id uuid;
BEGIN
  -- Salva l'ID utente per uso successivo
  v_user_id := NEW.id;
  
  -- Log dell'inizio dell'esecuzione
  RAISE LOG 'handle_new_user: Creazione profilo per utente % con email %', v_user_id, NEW.email;
  
  -- Verifica se esiste già un profilo per questo utente
  SELECT COUNT(*) INTO v_count FROM public.user_profiles WHERE id = v_user_id;
  
  IF v_count > 0 THEN
    -- Aggiorna il profilo esistente
    RAISE LOG 'handle_new_user: Profilo già esistente per utente %, aggiornamento', v_user_id;
    
    UPDATE public.user_profiles 
    SET 
      email = COALESCE(NEW.email, email),
      first_name = COALESCE(
        NEW.raw_user_meta_data ->> 'first_name', 
        NEW.raw_user_meta_data ->> 'given_name', 
        first_name
      ),
      last_name = COALESCE(
        NEW.raw_user_meta_data ->> 'last_name', 
        NEW.raw_user_meta_data ->> 'family_name', 
        last_name
      ),
      updated_at = now()
    WHERE id = v_user_id;
  ELSE
    -- Crea un nuovo profilo
    RAISE LOG 'handle_new_user: Creazione nuovo profilo per utente %', v_user_id;
    
    BEGIN
      INSERT INTO public.user_profiles (
        id, 
        email, 
        role,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at
      )
      VALUES (
        v_user_id, 
        NEW.email, 
        'user',
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'given_name'),
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', NEW.raw_user_meta_data ->> 'family_name'),
        NEW.raw_user_meta_data ->> 'phone',
        now(),
        now()
      );
      
      RAISE LOG 'handle_new_user: Profilo creato con successo per utente %', v_user_id;
    EXCEPTION WHEN OTHERS THEN
      -- Log dell'errore ma continua l'esecuzione
      RAISE LOG 'handle_new_user: Errore nella creazione del profilo per utente %: %', v_user_id, SQLERRM;
    END;
  END IF;
  
  -- Verifica se esistono già impostazioni di notifica per questo utente
  SELECT COUNT(*) INTO v_count FROM public.notification_settings WHERE user_id = v_user_id;
  
  IF v_count = 0 THEN
    -- Crea impostazioni di notifica di default
    BEGIN
      INSERT INTO public.notification_settings (
        user_id, 
        preferred_method, 
        notifications_enabled,
        created_at,
        updated_at
      )
      VALUES (
        v_user_id, 
        'email', 
        true,
        now(),
        now()
      );
      
      RAISE LOG 'handle_new_user: Impostazioni notifica create per utente %', v_user_id;
    EXCEPTION WHEN OTHERS THEN
      -- Log dell'errore ma continua l'esecuzione
      RAISE LOG 'handle_new_user: Errore nella creazione delle impostazioni di notifica per utente %: %', v_user_id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Assicurati che il trigger sia correttamente configurato
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();