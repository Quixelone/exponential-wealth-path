-- Create PAC payments tracking table
CREATE TABLE public.pac_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_amount NUMERIC NOT NULL,
  is_executed BOOLEAN NOT NULL DEFAULT false,
  executed_date DATE NULL,
  executed_amount NUMERIC NULL,
  execution_notes TEXT NULL,
  payment_method TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pac_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for pac_payments
CREATE POLICY "Users can view their own PAC payments" 
ON public.pac_payments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.investment_configs 
  WHERE investment_configs.id = pac_payments.config_id 
  AND investment_configs.user_id = auth.uid()
));

CREATE POLICY "Users can create their own PAC payments" 
ON public.pac_payments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.investment_configs 
  WHERE investment_configs.id = pac_payments.config_id 
  AND investment_configs.user_id = auth.uid()
));

CREATE POLICY "Users can update their own PAC payments" 
ON public.pac_payments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.investment_configs 
  WHERE investment_configs.id = pac_payments.config_id 
  AND investment_configs.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own PAC payments" 
ON public.pac_payments 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.investment_configs 
  WHERE investment_configs.id = pac_payments.config_id 
  AND investment_configs.user_id = auth.uid()
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_pac_payments_updated_at
BEFORE UPDATE ON public.pac_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_pac_payments_config_id ON public.pac_payments(config_id);
CREATE INDEX idx_pac_payments_scheduled_date ON public.pac_payments(scheduled_date);
CREATE INDEX idx_pac_payments_is_executed ON public.pac_payments(is_executed);