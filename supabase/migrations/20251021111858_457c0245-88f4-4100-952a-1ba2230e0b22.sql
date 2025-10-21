-- Enable real-time replication for pac_payments table
-- This allows the admin dashboard to receive real-time updates when PAC payments are executed

-- Add pac_payments to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE pac_payments;

-- Set REPLICA IDENTITY FULL to capture all column values in change events
ALTER TABLE pac_payments REPLICA IDENTITY FULL;