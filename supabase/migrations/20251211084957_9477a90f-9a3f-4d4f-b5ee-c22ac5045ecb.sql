-- Fix RLS for options_trades table (Critical - contains sensitive trading data)
-- Enable RLS
ALTER TABLE public.options_trades ENABLE ROW LEVEL SECURITY;

-- Users can view their own trades
CREATE POLICY "Users can view their own trades"
ON public.options_trades
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own trades
CREATE POLICY "Users can insert their own trades"
ON public.options_trades
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own trades
CREATE POLICY "Users can update their own trades"
ON public.options_trades
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own trades
CREATE POLICY "Users can delete their own trades"
ON public.options_trades
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all trades for management purposes
CREATE POLICY "Admins can view all trades"
ON public.options_trades
FOR SELECT
TO authenticated
USING (public.is_admin_via_roles());

-- Fix RLS for btc_positions table (Critical - contains sensitive position data)
-- Enable RLS
ALTER TABLE public.btc_positions ENABLE ROW LEVEL SECURITY;

-- Users can view their own positions
CREATE POLICY "Users can view their own positions"
ON public.btc_positions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own positions
CREATE POLICY "Users can insert their own positions"
ON public.btc_positions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own positions
CREATE POLICY "Users can update their own positions"
ON public.btc_positions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all positions for management purposes
CREATE POLICY "Admins can view all positions"
ON public.btc_positions
FOR SELECT
TO authenticated
USING (public.is_admin_via_roles());