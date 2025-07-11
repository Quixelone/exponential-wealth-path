-- Improve the handle_new_user trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  -- Log the trigger execution
  RAISE LOG 'Creating profile for user: %', NEW.id;
  
  BEGIN
    -- Try to insert the profile
    INSERT INTO public.user_profiles (
      id, 
      email, 
      role,
      first_name,
      last_name,
      google_id,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id, 
      NEW.email, 
      'user',
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'given_name'),
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', NEW.raw_user_meta_data ->> 'family_name'),
      NEW.raw_user_meta_data ->> 'provider_id',
      now(),
      now()
    );
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- Profile already exists, update it instead
      RAISE LOG 'Profile already exists for user: %, updating instead', NEW.id;
      UPDATE public.user_profiles 
      SET 
        email = NEW.email,
        first_name = COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'given_name', first_name),
        last_name = COALESCE(NEW.raw_user_meta_data ->> 'last_name', NEW.raw_user_meta_data ->> 'family_name', last_name),
        google_id = COALESCE(NEW.raw_user_meta_data ->> 'provider_id', google_id),
        updated_at = now()
      WHERE id = NEW.id;
      
    WHEN OTHERS THEN
      -- Log the error but don't fail the signup
      RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
      -- Continue with the signup process
  END;
  
  -- Try to create default notification settings
  BEGIN
    INSERT INTO public.notification_settings (user_id, preferred_method, notifications_enabled)
    VALUES (NEW.id, 'email', true);
    
    RAISE LOG 'Notification settings created for user: %', NEW.id;
    
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'Notification settings already exist for user: %', NEW.id;
    WHEN OTHERS THEN
      RAISE LOG 'Error creating notification settings for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$function$;