-- Fix infinite recursion - comprehensive solution
-- Remove ALL existing policies and recreate them properly

-- Step 1: Create bypass functions (these won't fail if they already exist)
CREATE OR REPLACE FUNCTION public.check_user_role_bypass(check_user_id uuid, check_role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = check_role
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_via_roles()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_readonly', 'admin_full', 'super_admin')
    LIMIT 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_role_bypass(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin_via_roles() TO authenticated, anon;

-- Step 2: Remove ALL policies on user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins can modify roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins view all roles" ON user_roles;
DROP POLICY IF EXISTS "Super admins modify roles" ON user_roles;

-- Step 3: Create simple, non-recursive policies on user_roles
CREATE POLICY "user_roles_select_own"
  ON user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_roles_select_admin"
  ON user_roles FOR SELECT TO authenticated
  USING (is_admin_via_roles());

CREATE POLICY "user_roles_all_super_admin"
  ON user_roles FOR ALL TO authenticated
  USING (check_user_role_bypass(auth.uid(), 'super_admin'))
  WITH CHECK (check_user_role_bypass(auth.uid(), 'super_admin'));

-- Step 4: Remove duplicate admin policies on user_profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins view all user profiles" ON user_profiles;

-- Step 5: Create single admin policy on user_profiles
CREATE POLICY "user_profiles_admin_view"
  ON user_profiles FOR SELECT TO authenticated
  USING (is_admin_via_roles());

-- Comment: This completely eliminates ALL recursion by:
-- 1. SECURITY DEFINER functions bypass RLS entirely
-- 2. No policy queries its own table through RLS
-- 3. Clean, simple policy names to avoid duplicates