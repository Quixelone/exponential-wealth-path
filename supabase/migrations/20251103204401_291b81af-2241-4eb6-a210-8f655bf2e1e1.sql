-- Fix infinite recursion - final version
-- Keep existing user policy, only update admin policy and is_admin_safe()

-- Step 1: Update is_admin_safe() to query user_roles instead of user_profiles
CREATE OR REPLACE FUNCTION public.is_admin_safe()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Query user_roles table to avoid recursion with user_profiles RLS
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin_readonly', 'admin_full', 'super_admin')
    LIMIT 1
  );
$$;

-- Step 2: Drop existing admin policy on user_profiles
DROP POLICY IF EXISTS "Admin can view all user profiles" ON user_profiles;

-- Step 3: Create new admin policy that directly queries user_roles
CREATE POLICY "Admins view all profiles"
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

-- Comment: This completely eliminates recursion:
-- 1. is_admin_safe() queries user_roles (no recursion)
-- 2. user_profiles admin policy queries user_roles directly
-- 3. Existing "Users can view their own profile" policy remains unchanged