-- Fix infinite recursion in user_profiles policy
-- The previous fix still had recursion because the EXISTS clause queries user_profiles
-- which triggers the same policy again

-- Update user_profiles policy to use is_admin_safe() function
DROP POLICY IF EXISTS "Admin can view all user profiles" ON user_profiles;

CREATE POLICY "Admin can view all user profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Either viewing own profile OR is an admin (using safe function)
    (auth.uid() = id) OR is_admin_safe()
  );

-- Comment: This completely eliminates recursion by:
-- 1. Using the is_admin_safe() SECURITY DEFINER function which doesn't trigger RLS
-- 2. Removing the EXISTS subquery that was causing the recursion