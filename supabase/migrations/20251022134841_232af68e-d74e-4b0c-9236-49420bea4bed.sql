-- Create diagnostic function to help users recover their strategies
-- This function is READ-ONLY and safe for all users
CREATE OR REPLACE FUNCTION public.reset_user_strategy_state(target_user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
  user_strategy JSON;
BEGIN
  -- Get user ID from email
  SELECT up.id INTO target_user_id
  FROM user_profiles up
  WHERE up.email = target_user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Get user's most recent strategy
  SELECT json_build_object(
    'id', ic.id,
    'name', ic.name,
    'created_at', ic.created_at,
    'updated_at', ic.updated_at
  ) INTO user_strategy
  FROM investment_configs ic
  WHERE ic.user_id = target_user_id
  ORDER BY ic.updated_at DESC
  LIMIT 1;
  
  RETURN json_build_object(
    'success', true,
    'user_id', target_user_id,
    'strategy', user_strategy
  );
END;
$$;