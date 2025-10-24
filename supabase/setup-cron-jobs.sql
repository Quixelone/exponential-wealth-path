-- ============================================
-- AI Trading Agent - Cron Jobs Setup
-- ============================================
-- Execute this SQL in Supabase SQL Editor to set up automated jobs
-- IMPORTANT: Run this AFTER enabling pg_cron and pg_net extensions

-- Enable required extensions (run once)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant permissions to use pg_net for cron jobs
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- ============================================
-- 1. AI Trading Agent - Daily Execution
-- ============================================
-- Runs every 15 minutes to generate trading signals
-- Adjust schedule as needed: */15 * * * * = every 15 minutes

SELECT cron.schedule(
  'ai-trading-agent-every-15min',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/ai-trading-agent',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);

-- ============================================
-- 2. Telegram Notification Sender
-- ============================================
-- Runs every 5 minutes to send queued Telegram messages

SELECT cron.schedule(
  'telegram-sender-every-5min',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/telegram-notification-sender',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);

-- ============================================
-- 3. Insurance Payment Checker
-- ============================================
-- Runs daily at 2:30 AM to check for unpaid insurance

SELECT cron.schedule(
  'insurance-payment-checker-daily',
  '30 2 * * *', -- Every day at 2:30 AM
  $$
  SELECT net.http_post(
    url := 'https://rsmvjsokqolxgczclqjv.supabase.co/functions/v1/insurance-payment-checker',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXZqc29rcW9seGdjemNscWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDI5MTUsImV4cCI6MjA2NTExODkxNX0.8ruQsbU1HlK_CPsgrIv7JhJgDJsM-XD8daBa1Z2gEmo'
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);

-- ============================================
-- Verification & Management Queries
-- ============================================

-- View all active cron jobs
SELECT 
  jobid,
  jobname, 
  schedule, 
  active,
  command
FROM cron.job
ORDER BY jobname;

-- View recent cron job executions
SELECT 
  j.jobname,
  r.runid,
  r.status,
  r.start_time,
  r.end_time,
  r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.jobid
ORDER BY r.start_time DESC
LIMIT 20;

-- Unschedule a job (if needed)
-- SELECT cron.unschedule('ai-trading-agent-every-15min');
-- SELECT cron.unschedule('telegram-sender-every-5min');
-- SELECT cron.unschedule('insurance-payment-checker-daily');

-- Reschedule a job with new timing
-- First unschedule, then schedule again with new timing
-- Example: Change AI agent to run every hour instead of every 15 minutes
-- SELECT cron.unschedule('ai-trading-agent-every-15min');
-- SELECT cron.schedule('ai-trading-agent-hourly', '0 * * * *', $$ ... $$);
