-- Fix infinite recursion on user_roles by creating a bypass function
-- The issue: user_roles policies query user_roles, creating recursion

-- Step 1: Create a function that checks user roles WITHOUT triggering RLS
-- This uses SECURITY DEFINER to bypass all RLS policies
CREATE OR REPLACE FUNCTION public.check_user_role_bypass(check_user_id uuid, check_role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function bypasses RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role = check_role
    LIMIT 1
  );
END;
$$;

-- Step 2: Create a function to check if user is admin (any admin role)
CREATE OR REPLACE FUNCTION public.is_admin_via_roles()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function bypasses RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_readonly', 'admin_full', 'super_admin')
    LIMIT 1
  );
END;
$$;

-- Step 3: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_user_role_bypass(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_via_roles() TO authenticated;

-- Step 4: Update user_roles policies to be simple (no recursion)
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can modify roles" ON user_roles;

-- Simple policy: users can view their own roles (no recursion)
-- Admins viewing all roles will be handled separately
CREATE POLICY "Users view own roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all roles using the bypass function
CREATE POLICY "Admins view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (is_admin_via_roles());

-- Super admins can modify roles using the bypass function
CREATE POLICY "Super admins modify roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (check_user_role_bypass(auth.uid(), 'super_admin'))
  WITH CHECK (check_user_role_bypass(auth.uid(), 'super_admin'));

-- Step 5: Update user_profiles policies to use the bypass function
DROP POLICY IF EXISTS "Admins view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Keep existing user policy
-- Admin policy now uses the bypass function
CREATE POLICY "Admins view all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin_via_roles());

-- Comment: This completely eliminates recursion by:
-- 1. All RLS checks use SECURITY DEFINER functions that bypass RLS
-- 2. No policy queries its own table through RLS
-- 3. The bypass functions access the data directly without RLS evaluation