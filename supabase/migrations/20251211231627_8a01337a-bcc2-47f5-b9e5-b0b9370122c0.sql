-- Remove old broken cron jobs that use non-existent app.settings.service_role_key
SELECT cron.unschedule(1); -- ai-trading-agent-daily (old broken job)
SELECT cron.unschedule(2); -- telegram-notification-sender (old broken job)