-- Add admin policy to view all daily PAC overrides
CREATE POLICY "Admins can view all daily PAC overrides"
ON public.daily_pac_overrides
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);