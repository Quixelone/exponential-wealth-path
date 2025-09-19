-- Create a function to safely delete a user and handle foreign key constraints
CREATE OR REPLACE FUNCTION public.delete_user_safely(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Check if current user is super admin
  SELECT admin_role INTO current_user_role 
  FROM public.user_profiles 
  WHERE id = auth.uid() AND role = 'admin';
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admin can delete users';
  END IF;
  
  -- Log the deletion attempt
  PERFORM log_sensitive_access(
    'DELETE_USER',
    'user_profiles', 
    target_user_id,
    ARRAY['complete_user_deletion'],
    target_user_id
  );
  
  -- Delete related records in order to avoid foreign key constraints
  -- 1. Delete investment configs and related data
  DELETE FROM daily_returns WHERE config_id IN (
    SELECT id FROM investment_configs WHERE user_id = target_user_id
  );
  
  DELETE FROM daily_pac_overrides WHERE config_id IN (
    SELECT id FROM investment_configs WHERE user_id = target_user_id
  );
  
  DELETE FROM actual_trades WHERE config_id IN (
    SELECT id FROM investment_configs WHERE user_id = target_user_id
  );
  
  DELETE FROM pac_payments WHERE config_id IN (
    SELECT id FROM investment_configs WHERE user_id = target_user_id
  );
  
  DELETE FROM investment_configs WHERE user_id = target_user_id;
  
  -- 2. Delete user-specific data
  DELETE FROM notification_settings WHERE user_id = target_user_id;
  DELETE FROM payment_reminders WHERE user_id = target_user_id;
  DELETE FROM user_sessions WHERE user_id = target_user_id;
  
  -- 3. Anonymize audit logs instead of deleting them (for compliance)
  UPDATE security_audit_log 
  SET user_id = NULL 
  WHERE user_id = target_user_id;
  
  -- 4. Delete user profile
  DELETE FROM user_profiles WHERE id = target_user_id;
  
  -- 5. Finally delete from auth.users (this should cascade properly now)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN true;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the error
  RAISE LOG 'Error deleting user %: %', target_user_id, SQLERRM;
  RETURN false;
END;
$$;