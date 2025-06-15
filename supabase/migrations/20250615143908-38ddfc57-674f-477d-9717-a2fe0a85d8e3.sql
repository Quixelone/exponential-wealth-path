
-- Rimuove il vincolo di controllo esistente (se c'è) sulla colonna frequency della tabella payment_reminders
ALTER TABLE public.payment_reminders
  DROP CONSTRAINT IF EXISTS payment_reminders_frequency_check;

-- Aggiunge un nuovo vincolo di controllo che permette 'daily', 'weekly', 'monthly', 'quarterly', e 'yearly'
ALTER TABLE public.payment_reminders
  ADD CONSTRAINT payment_reminders_frequency_check
    CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'));
