-- Enable realtime for simple_bill_analysis table
-- This migration adds the simple_bill_analysis table to the realtime publication
-- so that clients can subscribe to INSERT events for bill analysis updates

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE simple_bill_analysis;

-- Ensure the table has proper RLS policies for realtime subscriptions
-- (The table should already exist with appropriate policies, this just confirms it)

-- Add index for better performance on realtime queries
CREATE INDEX IF NOT EXISTS idx_simple_bill_analysis_bill_id_created_at 
ON simple_bill_analysis (bill_id, created_at DESC);

-- Add index for better performance on bill_id lookups
CREATE INDEX IF NOT EXISTS idx_simple_bill_analysis_bill_id 
ON simple_bill_analysis (bill_id);