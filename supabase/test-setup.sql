-- ============================================
-- AI Trading Agent - Test User Setup Script
-- ============================================
-- Execute this SQL in Supabase SQL Editor to create a complete test user

-- 1. Create test user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  instance_id,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'test@tradingbot.com',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  '{"first_name": "Test", "last_name": "Trader"}'::jsonb,
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  updated_at = now();

-- 2. Create user profile
INSERT INTO user_profiles (
  id,
  email,
  role,
  first_name,
  last_name
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'test@tradingbot.com',
  'user',
  'Test',
  'Trader'
) ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- 3. Create investment configuration
INSERT INTO investment_configs (
  id,
  user_id,
  name,
  initial_capital,
  time_horizon,
  daily_return_rate,
  pac_amount,
  pac_frequency,
  pac_start_date,
  currency
) VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Test Trading Strategy',
  10000.00,
  365,
  0.15,
  0,
  'monthly',
  CURRENT_DATE,
  'USDT'
) ON CONFLICT (id) DO UPDATE SET 
  initial_capital = EXCLUDED.initial_capital,
  updated_at = now();

-- 4. Create notification settings with Telegram
-- IMPORTANT: Replace 'YOUR_TELEGRAM_CHAT_ID' with your actual Telegram Chat ID
-- Get your Chat ID by messaging @userinfobot on Telegram
INSERT INTO notification_settings (
  user_id,
  telegram_chat_id,
  notifications_enabled,
  preferred_method
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'YOUR_TELEGRAM_CHAT_ID',  -- <-- REPLACE THIS WITH YOUR ACTUAL CHAT ID
  true,
  'telegram'
) ON CONFLICT (user_id) DO UPDATE SET 
  telegram_chat_id = EXCLUDED.telegram_chat_id,
  notifications_enabled = EXCLUDED.notifications_enabled,
  preferred_method = EXCLUDED.preferred_method;

-- 5. Create insurance payment (paid for current month)
INSERT INTO insurance_payments (
  user_id,
  payment_month,
  payment_due_date,
  is_paid,
  paid_at,
  payment_amount_eur
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  DATE_TRUNC('month', CURRENT_DATE),
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '2 days',
  true,
  CURRENT_DATE,
  20.00
) ON CONFLICT (user_id, payment_month) DO UPDATE SET 
  is_paid = true,
  paid_at = CURRENT_DATE;

-- ============================================
-- Verification Queries
-- ============================================

-- Verify test user setup
SELECT 
  'User Profile' as entity,
  id,
  email,
  role
FROM user_profiles
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid

UNION ALL

SELECT 
  'Investment Config' as entity,
  id::text,
  name as email,
  initial_capital::text as role
FROM investment_configs
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid

UNION ALL

SELECT 
  'Notification Settings' as entity,
  id::text,
  telegram_chat_id as email,
  preferred_method as role
FROM notification_settings
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid

UNION ALL

SELECT 
  'Insurance Payment' as entity,
  id::text,
  payment_month::text as email,
  is_paid::text as role
FROM insurance_payments
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;

-- ============================================
-- Post-Test Verification Queries
-- ============================================

-- Check generated AI signals
-- Run this AFTER invoking the ai-trading-agent edge function
SELECT 
  signal_date,
  signal_time,
  btc_price_usd,
  recommended_action,
  recommended_strike_price,
  recommended_premium_pct,
  confidence_score,
  insurance_activated,
  telegram_sent,
  reasoning
FROM ai_trading_signals
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY created_at DESC
LIMIT 5;

-- Check Telegram notification queue
SELECT 
  message_type,
  priority,
  sent,
  scheduled_send_time,
  LEFT(message_text, 100) as message_preview
FROM telegram_notifications_queue
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY created_at DESC
LIMIT 5;

-- Check insurance coverage periods
SELECT 
  start_date,
  end_date,
  days_covered,
  total_premium_accumulated_usdt,
  is_active,
  unlocked_at,
  payout_amount_usdt
FROM insurance_coverage_periods
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY start_date DESC
LIMIT 5;

-- Check cron jobs are active
SELECT 
  jobname, 
  schedule, 
  active, 
  command
FROM cron.job
WHERE jobname LIKE '%ai-trading%' 
   OR jobname LIKE '%telegram%'
   OR jobname LIKE '%insurance%';
