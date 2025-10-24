-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- AI Trading Agent: Daily at 09:45 CET (08:45 UTC in winter, adjust for DST)
-- Running at 08:45 UTC to be safe for CET
SELECT cron.schedule(
  'ai-trading-agent-daily',
  '45 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/ai-trading-agent',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('trigger', 'cron')
  ) AS request_id;
  $$
);

-- Telegram Notification Sender: Every 5 minutes
SELECT cron.schedule(
  'telegram-notification-sender',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/telegram-notification-sender',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('trigger', 'cron')
  ) AS request_id;
  $$
);

-- Insurance Payment Checker: Daily at 10:00 CET (09:00 UTC in winter)
SELECT cron.schedule(
  'insurance-payment-checker-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/insurance-payment-checker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('trigger', 'cron')
  ) AS request_id;
  $$
);