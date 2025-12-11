-- Add RLS policies for kv_store_7c0f82ca table
-- This table is used for key-value storage and should be accessible by authenticated users

-- Policy: Allow authenticated users to read all KV pairs (public cache/config data)
CREATE POLICY "Authenticated users can read kv store"
ON public.kv_store_7c0f82ca
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert/update/delete their own entries
-- Since kv_store doesn't have user_id, we allow system-level access for the service role
-- For authenticated users, we allow read-only access
CREATE POLICY "Service role can manage kv store"
ON public.kv_store_7c0f82ca
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);