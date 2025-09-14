-- Security Enhancement for user_profiles table
-- 1. Create audit log table for tracking access to sensitive data
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'SELECT', 'UPDATE', 'INSERT', 'DELETE'  
  table_name TEXT NOT NULL,
  record_id UUID,
  accessed_fields TEXT[], -- Array of accessed sensitive fields
  ip_address INET,
  user_agent TEXT,
  admin_user_id UUID REFERENCES auth.users(id), -- If accessed by admin
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- 2. Create enhanced admin roles enum
CREATE TYPE public.admin_role_type AS ENUM ('admin_readonly', 'admin_full', 'super_admin');

-- 3. Add admin_role column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN admin_role admin_role_type;

-- 4. Create security definer function for enhanced admin check
CREATE OR REPLACE FUNCTION public.is_admin_with_role(required_role admin_role_type DEFAULT 'admin_readonly')
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  user_admin_role admin_role_type;
BEGIN
  SELECT admin_role INTO user_admin_role 
  FROM public.user_profiles 
  WHERE id = auth.uid() AND role = 'admin';
  
  -- Super admin can do everything
  IF user_admin_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific role requirement
  IF required_role = 'admin_readonly' AND user_admin_role IN ('admin_readonly', 'admin_full') THEN
    RETURN true;
  END IF;
  
  IF required_role = 'admin_full' AND user_admin_role = 'admin_full' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 5. Create function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  action_type TEXT,
  table_name TEXT,
  record_id UUID,
  accessed_fields TEXT[] DEFAULT NULL,
  target_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    accessed_fields,
    admin_user_id
  ) VALUES (
    COALESCE(target_user_id, auth.uid()),
    action_type,
    table_name,
    record_id,
    accessed_fields,
    CASE WHEN target_user_id IS NOT NULL AND target_user_id != auth.uid() THEN auth.uid() ELSE NULL END
  );
END;
$$;

-- 6. Enhanced RLS policies for user_profiles with granular field access
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Separate policies for readonly vs full admin access
CREATE POLICY "Admin readonly can view basic profile info"
ON public.user_profiles
FOR SELECT
USING (
  is_admin_with_role('admin_readonly') AND
  (SELECT log_sensitive_access('SELECT', 'user_profiles', id, ARRAY['email', 'phone', 'first_name', 'last_name']) IS NULL)
);

CREATE POLICY "Admin full can update profiles"
ON public.user_profiles  
FOR UPDATE
USING (
  is_admin_with_role('admin_full') AND
  (SELECT log_sensitive_access('UPDATE', 'user_profiles', id) IS NULL)
);

-- 7. Add DELETE policy for data protection compliance
CREATE POLICY "Super admin can delete profiles for compliance"
ON public.user_profiles
FOR DELETE
USING (
  is_admin_with_role('super_admin') AND
  (SELECT log_sensitive_access('DELETE', 'user_profiles', id) IS NULL)
);

-- 8. RLS policies for security audit log
CREATE POLICY "Super admins can view all audit logs"
ON public.security_audit_log
FOR SELECT
USING (is_admin_with_role('super_admin'));

CREATE POLICY "Users can view their own audit logs"
ON public.security_audit_log  
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- 9. Create trigger to automatically log profile updates
CREATE OR REPLACE FUNCTION public.audit_user_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $$
BEGIN
  -- Log the update with changed fields
  IF TG_OP = 'UPDATE' THEN
    PERFORM log_sensitive_access(
      'UPDATE',
      'user_profiles', 
      NEW.id,
      ARRAY(
        SELECT column_name::text 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND table_schema = 'public'
        AND column_name IN ('email', 'phone', 'first_name', 'last_name', 'google_id')
      ),
      NEW.id
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_user_profile_trigger
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_user_profile_changes();

-- 10. Create indexes for performance
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at);
CREATE INDEX idx_security_audit_log_action ON public.security_audit_log(action);
CREATE INDEX idx_user_profiles_admin_role ON public.user_profiles(admin_role) WHERE admin_role IS NOT NULL;