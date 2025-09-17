-- Temporary fix: Remove audit logging from admin SELECT policies to fix read-only transaction error
-- This allows admin users to view user profiles without triggering INSERT operations during SELECT

-- Drop the problematic policy that uses log_sensitive_access in SELECT
DROP POLICY IF EXISTS "Admin readonly can view basic profile info" ON public.user_profiles;

-- Create a simplified admin policy for viewing user profiles
CREATE POLICY "Admin can view all user profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Keep the audit logging for write operations (UPDATE, DELETE) but remove from SELECT
-- The existing policies for UPDATE and DELETE will remain as they are for now since they don't affect the current SELECT issue