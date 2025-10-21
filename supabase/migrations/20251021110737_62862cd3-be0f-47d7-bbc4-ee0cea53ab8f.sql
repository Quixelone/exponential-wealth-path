-- Enable real-time replication for portfolio analytics tables
-- This allows the frontend to receive real-time updates when data changes

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE investment_configs;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_returns;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_pac_overrides;
ALTER PUBLICATION supabase_realtime ADD TABLE actual_trades;

-- Set REPLICA IDENTITY FULL to capture all column values in change events
-- This is required for proper real-time functionality
ALTER TABLE investment_configs REPLICA IDENTITY FULL;
ALTER TABLE daily_returns REPLICA IDENTITY FULL;
ALTER TABLE daily_pac_overrides REPLICA IDENTITY FULL;
ALTER TABLE actual_trades REPLICA IDENTITY FULL;