
-- Add reminder_time column to payment_reminders table
ALTER TABLE public.payment_reminders 
ADD COLUMN reminder_time TIME DEFAULT '09:00:00';

-- Update the column to be not null with a default value
ALTER TABLE public.payment_reminders 
ALTER COLUMN reminder_time SET NOT NULL;
