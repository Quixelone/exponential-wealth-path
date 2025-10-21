-- Add strike_price column to actual_trades
ALTER TABLE actual_trades 
ADD COLUMN strike_price NUMERIC;

-- Add index for performance
CREATE INDEX idx_actual_trades_strike ON actual_trades(strike_price) 
WHERE strike_price IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN actual_trades.strike_price IS 'Strike price dell''opzione (buy/sell BTC)';