-- Make config_id nullable in ai_trading_signals
-- This allows signals to be generated without being linked to a specific strategy
ALTER TABLE ai_trading_signals 
ALTER COLUMN config_id DROP NOT NULL;