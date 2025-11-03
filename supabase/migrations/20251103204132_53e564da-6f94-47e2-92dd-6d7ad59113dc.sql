-- Fix infinite recursion by updating is_admin_safe() to use user_roles
-- Step 1: Update dependent policies first

-- Drop the problematic user_profiles policy
DROP POLICY IF EXISTS "Admin can view all user profiles" ON user_profiles;

-- Step 2: Recreate is_admin_safe() to use user_roles (which doesn't cause recursion)
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Query user_roles table instead of user_profiles to avoid recursion
  -- user_roles has its own RLS that doesn't depend on is_admin_safe()
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_readonly', 'admin_full', 'super_admin')
    LIMIT 1
  );
$$;

-- Step 3: Create new user_profiles policies that don't cause recursion
-- Simple policy for users to view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admin policy using user_roles directly (no recursion)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin_readonly', 'admin_full', 'super_admin')
    )
  );

-- Comment: This fixes recursion by:
-- 1. is_admin_safe() now queries user_roles (doesn't depend on user_profiles RLS)
-- 2. user_profiles policies directly query user_roles without calling functions
-- 3. ai_trading_signals can keep using is_admin_safe() since it's now safe