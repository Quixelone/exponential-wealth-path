-- Create investor_inquiries table
CREATE TABLE IF NOT EXISTS public.investor_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_type TEXT NOT NULL CHECK (investor_type IN ('business-angel', 'venture-capital')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  data JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'meeting_scheduled', 'due_diligence', 'invested', 'declined')),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_type ON public.investor_inquiries(investor_type);
CREATE INDEX IF NOT EXISTS idx_status ON public.investor_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON public.investor_inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE public.investor_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries" ON public.investor_inquiries
  FOR SELECT
  USING (is_admin_safe());

-- Policy: System can insert inquiries (edge functions)
CREATE POLICY "System can insert inquiries" ON public.investor_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can update inquiries
CREATE POLICY "Admins can update inquiries" ON public.investor_inquiries
  FOR UPDATE
  USING (is_admin_safe());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_investor_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investor_inquiries_updated_at
  BEFORE UPDATE ON public.investor_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_investor_inquiries_updated_at();