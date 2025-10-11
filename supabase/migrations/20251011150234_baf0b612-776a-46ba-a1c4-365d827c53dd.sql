-- Fix Security Issue #1: Separate user_roles table (revised)
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin_readonly', 'admin_full', 'super_admin', 'user');

-- Create dedicated roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin_readonly', 'admin_full', 'super_admin')
  )
);

-- Only super admins can modify roles
CREATE POLICY "Super admins can modify roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'super_admin'
  )
);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin_new()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin_readonly', 'admin_full', 'super_admin')
  )
$$;

-- Create helper function to check admin level
CREATE OR REPLACE FUNCTION public.check_admin_level(_user_id UUID, _required_role app_role DEFAULT 'admin_readonly'::app_role)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_roles app_role[];
BEGIN
  SELECT ARRAY_AGG(role) INTO user_roles
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- Super admin can do everything
  IF 'super_admin' = ANY(user_roles) THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific role requirement
  IF _required_role = 'admin_readonly' AND 
     ('admin_readonly' = ANY(user_roles) OR 'admin_full' = ANY(user_roles)) THEN
    RETURN TRUE;
  END IF;
  
  IF _required_role = 'admin_full' AND 'admin_full' = ANY(user_roles) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Migrate existing roles from user_profiles to user_roles by mapping string values
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT 
  id,
  CASE 
    WHEN admin_role::text = 'admin_readonly' THEN 'admin_readonly'::app_role
    WHEN admin_role::text = 'admin_full' THEN 'admin_full'::app_role
    WHEN admin_role::text = 'super_admin' THEN 'super_admin'::app_role
    WHEN role = 'admin' THEN 'admin_readonly'::app_role
    ELSE 'user'::app_role
  END,
  created_at,
  updated_at
FROM public.user_profiles
WHERE id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();