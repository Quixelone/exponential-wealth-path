-- Add columns for option timeline and status management
ALTER TABLE actual_trades
ADD COLUMN option_sold_date DATE,
ADD COLUMN expiration_date DATE,
ADD COLUMN option_status TEXT DEFAULT 'filled' CHECK (option_status IN ('filled', 'expired_otm')),
ADD COLUMN premium_received_usdt NUMERIC,
ADD COLUMN premium_currency TEXT DEFAULT 'USDT';

-- Make btc_amount nullable (can be 0 if not filled)
ALTER TABLE actual_trades
ALTER COLUMN btc_amount DROP NOT NULL;

-- Make fill_price_usd nullable (not needed for expired options)
ALTER TABLE actual_trades
ALTER COLUMN fill_price_usd DROP NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN actual_trades.option_sold_date IS 'Date when the option was sold (previous day)';
COMMENT ON COLUMN actual_trades.expiration_date IS 'Option expiration date (today)';
COMMENT ON COLUMN actual_trades.option_status IS 'filled = option filled (ITM), expired_otm = option expired out of the money (OTM)';
COMMENT ON COLUMN actual_trades.premium_received_usdt IS 'Premium received from selling the option';
COMMENT ON COLUMN actual_trades.premium_currency IS 'Currency of the premium (default USDT)';