-- Fix RLS for strike_prices_cache table (Public cache data for strike prices)
-- Enable RLS
ALTER TABLE public.strike_prices_cache ENABLE ROW LEVEL SECURITY;

-- This is publicly accessible cache data (strike prices from exchanges)
-- All authenticated users can read it
CREATE POLICY "Anyone can view strike prices cache"
ON public.strike_prices_cache
FOR SELECT
TO authenticated
USING (true);

-- Only system/admins can modify the cache data
CREATE POLICY "System can manage strike prices cache"
ON public.strike_prices_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);