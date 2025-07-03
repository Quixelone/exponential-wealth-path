-- Add currency column to investment_configs table
ALTER TABLE public.investment_configs 
ADD COLUMN currency text DEFAULT 'EUR' NOT NULL;

-- Update existing configurations to have EUR as default currency
UPDATE public.investment_configs 
SET currency = 'EUR' 
WHERE currency IS NULL;