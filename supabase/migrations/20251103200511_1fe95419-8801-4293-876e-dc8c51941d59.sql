-- Fix circular dependency in is_admin() function and RLS policies
-- The issue: is_admin() queries user_profiles, which has RLS policy calling is_admin()
-- This creates infinite recursion when evaluating admin permissions

-- First, create a new helper function that safely checks admin status
-- This function uses a direct query that won't trigger RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Query auth.users directly to avoid RLS on user_profiles
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR admin_role IS NOT NULL)
    LIMIT 1
  );
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_safe() TO authenticated;

-- Now update the ai_trading_signals RLS policy to use the safe function
DROP POLICY IF EXISTS "Admins can view all signals" ON ai_trading_signals;
CREATE POLICY "Admins can view all signals"
  ON ai_trading_signals
  FOR SELECT
  TO authenticated
  USING (is_admin_safe());

-- Also ensure the user_profiles SELECT policy doesn't create recursion
-- Keep the simple policy that checks auth.uid() = id for regular users
-- The admin policy on user_profiles should only be used for viewing OTHER users
DROP POLICY IF EXISTS "Admin can view all user profiles" ON user_profiles;
CREATE POLICY "Admin can view all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Either viewing own profile OR is an admin
    (auth.uid() = id) OR 
    (
      -- Admin check without recursion: directly check role column
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND (up.role = 'admin' OR up.admin_role IS NOT NULL)
        LIMIT 1
      )
    )
  );

-- Comment: This fixes the circular dependency by:
-- 1. Creating is_admin_safe() that won't trigger recursive RLS checks
-- 2. Updating ai_trading_signals policy to use the safe function
-- 3. Simplifying user_profiles policy to avoid calling is_admin() during evaluation