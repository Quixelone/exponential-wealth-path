-- Fix security issue: investor_inquiries table exposing PII publicly
-- This table contains names and emails of potential investors that should only be accessible by admins

-- First, enable RLS if not already enabled
ALTER TABLE public.investor_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON public.investor_inquiries;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.investor_inquiries;
DROP POLICY IF EXISTS "Anyone can insert investor inquiries" ON public.investor_inquiries;
DROP POLICY IF EXISTS "Admins can view all investor inquiries" ON public.investor_inquiries;
DROP POLICY IF EXISTS "Admins can update investor inquiries" ON public.investor_inquiries;
DROP POLICY IF EXISTS "Admins can delete investor inquiries" ON public.investor_inquiries;

-- Create policy: Only admins can SELECT investor inquiries
-- Uses is_admin_safe() function which checks user_roles table without recursion
CREATE POLICY "Admins can view all investor inquiries"
ON public.investor_inquiries
FOR SELECT
TO authenticated
USING (public.is_admin_safe());

-- Create policy: Only admins can UPDATE investor inquiries
CREATE POLICY "Admins can update investor inquiries"
ON public.investor_inquiries
FOR UPDATE
TO authenticated
USING (public.is_admin_safe())
WITH CHECK (public.is_admin_safe());

-- Create policy: Only admins can DELETE investor inquiries
CREATE POLICY "Admins can delete investor inquiries"
ON public.investor_inquiries
FOR DELETE
TO authenticated
USING (public.is_admin_safe());

-- Create policy: Anyone can INSERT (for public inquiry forms from landing page)
-- This allows unauthenticated visitors to submit inquiries
CREATE POLICY "Anyone can submit investor inquiries"
ON public.investor_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);