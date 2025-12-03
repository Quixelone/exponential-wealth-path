-- Create table for temporary Telegram link codes
CREATE TABLE public.telegram_link_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own link codes"
ON public.telegram_link_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage link codes"
ON public.telegram_link_codes FOR ALL
USING (true)
WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_telegram_link_codes_code ON public.telegram_link_codes(code);
CREATE INDEX idx_telegram_link_codes_user_id ON public.telegram_link_codes(user_id);

-- Auto-cleanup old codes (function)
CREATE OR REPLACE FUNCTION cleanup_expired_telegram_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.telegram_link_codes 
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$;