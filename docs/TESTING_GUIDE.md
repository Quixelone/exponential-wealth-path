# AI Trading Agent - Testing Guide

## Quick Start Testing

### Step 1: Database Setup
1. Go to Supabase Dashboard → SQL Editor
2. Open and execute `supabase/test-setup.sql`
3. **IMPORTANT**: Replace `YOUR_TELEGRAM_CHAT_ID` with your actual Telegram Chat ID
   - Get your Chat ID by messaging [@userinfobot](https://t.me/userinfobot) on Telegram
   - Copy the numeric ID (e.g., `123456789`)

### Step 2: Cron Jobs Setup
1. In Supabase SQL Editor, execute `supabase/setup-cron-jobs.sql`
2. Verify jobs are active:
   ```sql
   SELECT jobname, schedule, active FROM cron.job;
   ```

### Step 3: Manual Edge Function Test
1. Go to Supabase Dashboard → Edge Functions → `ai-trading-agent`
2. Click "Invoke function"
3. Leave body empty `{}` and click "Send"
4. Expected response:
   ```json
   {
     "success": true,
     "processed": 1,
     "results": [{
       "userId": "00000000-0000-0000-0000-000000000001",
       "status": "success",
       "action": "SELL_PUT",
       "strike": 95000.50,
       "premium": 0.12
     }]
   }
   ```

### Step 4: Verify Database Records

**Check AI Signal:**
```sql
SELECT 
  signal_date,
  btc_price_usd,
  recommended_action,
  recommended_strike_price,
  recommended_premium_pct,
  confidence_score,
  insurance_activated,
  reasoning
FROM ai_trading_signals
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY created_at DESC
LIMIT 1;
```

**Check Telegram Queue:**
```sql
SELECT 
  message_type,
  sent,
  LEFT(message_text, 100) as preview
FROM telegram_notifications_queue
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY created_at DESC
LIMIT 1;
```

**Check Insurance Coverage (if activated):**
```sql
SELECT 
  start_date,
  days_covered,
  total_premium_accumulated_usdt,
  is_active
FROM insurance_coverage_periods
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
ORDER BY start_date DESC
LIMIT 1;
```

### Step 5: Frontend Verification
1. Navigate to `/ai-signals` in the app
2. Verify the signal appears with:
   - ✅ Action badge (SELL PUT/CALL/HOLD)
   - ✅ BTC price and strike price
   - ✅ Technical indicators (RSI, MACD, Bollinger)
   - ✅ Premium percentage
   - ✅ AI reasoning
   - ✅ Insurance alert (if premium < 0.10%)

### Step 6: Telegram Test (Optional)
1. Invoke `telegram-notification-sender` edge function
2. Check your Telegram for the message
3. If not received, verify:
   - `TELEGRAM_BOT_TOKEN` is set in Supabase secrets
   - Chat ID is correct and numeric
   - You've started the bot with `/start`

## Monitoring & Debugging

### Check Cron Job Execution
```sql
SELECT 
  j.jobname,
  r.status,
  r.start_time,
  r.end_time,
  r.return_message
FROM cron.job_run_details r
JOIN cron.job j ON j.jobid = r.jobid
ORDER BY r.start_time DESC
LIMIT 10;
```

### Edge Function Logs
- Go to Supabase Dashboard → Edge Functions → [function-name] → Logs
- Look for errors, response times, and execution details

### Common Issues

| Issue | Solution |
|-------|----------|
| "No active users" | Verify `notification_settings` has `telegram_chat_id` and `notifications_enabled: true` |
| "Insurance not paid" | Check `insurance_payments` has `is_paid: true` for current month |
| "Pionex API error" | Verify `PIONEX_API_KEY` and `PIONEX_API_SECRET` in Supabase secrets |
| No Telegram message | Check bot token, chat ID, and that bot was started with `/start` |
| No signals on frontend | Verify user is logged in and `user_id` in DB matches authenticated user |

## Test User Credentials
- **Email**: `test@tradingbot.com`
- **Password**: `TestPassword123!`
- **User ID**: `00000000-0000-0000-0000-000000000001`
- **Config ID**: `10000000-0000-0000-0000-000000000001`

## Next Steps After Successful Test
1. ✅ Verify all 3 cron jobs are running automatically
2. ✅ Monitor `ai_trading_signals` table for daily signals
3. ✅ Check Telegram notifications are being sent
4. ✅ Proceed to Week 2: Hedging implementation
5. ✅ Integrate real Pionex API trading execution

## Cron Job Schedule Reference
- **AI Trading Agent**: Every 15 minutes (`*/15 * * * *`)
- **Telegram Sender**: Every 5 minutes (`*/5 * * * *`)
- **Insurance Checker**: Daily at 2:30 AM (`30 2 * * *`)

Adjust schedules in `supabase/setup-cron-jobs.sql` as needed.
