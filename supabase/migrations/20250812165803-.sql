-- Remove overly permissive RLS policy on daily_pac_overrides and ensure RLS is enabled

-- Make sure RLS is enabled on the table
ALTER TABLE public.daily_pac_overrides ENABLE ROW LEVEL SECURITY;

-- Drop the permissive policy that allows all operations
DROP POLICY IF EXISTS "Allow all operations on daily_pac_overrides" ON public.daily_pac_overrides;