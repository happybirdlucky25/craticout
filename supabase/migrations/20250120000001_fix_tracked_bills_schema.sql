-- Fix tracked_bills table to match actual bills table schema
-- The bills table uses TEXT for bill_id, not UUID

-- First, drop the existing foreign key constraint
ALTER TABLE tracked_bills 
DROP CONSTRAINT IF EXISTS tracked_bills_bill_id_fkey;

-- Change bill_id column from UUID to TEXT to match bills table
ALTER TABLE tracked_bills 
ALTER COLUMN bill_id TYPE TEXT;

-- Add the foreign key constraint back with the correct type
ALTER TABLE tracked_bills 
ADD CONSTRAINT tracked_bills_bill_id_fkey 
FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE;

-- Update the unique constraint to ensure it still works
ALTER TABLE tracked_bills 
DROP CONSTRAINT IF EXISTS tracked_bills_user_id_bill_id_key;

ALTER TABLE tracked_bills 
ADD CONSTRAINT tracked_bills_user_id_bill_id_key 
UNIQUE(user_id, bill_id);

-- Same fix for campaign_bills table if it exists
ALTER TABLE campaign_bills 
DROP CONSTRAINT IF EXISTS campaign_bills_bill_id_fkey;

ALTER TABLE campaign_bills 
ALTER COLUMN bill_id TYPE TEXT;

ALTER TABLE campaign_bills 
ADD CONSTRAINT campaign_bills_bill_id_fkey 
FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE;

-- Update unique constraint for campaign_bills
ALTER TABLE campaign_bills 
DROP CONSTRAINT IF EXISTS campaign_bills_campaign_id_bill_id_key;

ALTER TABLE campaign_bills 
ADD CONSTRAINT campaign_bills_campaign_id_bill_id_key 
UNIQUE(campaign_id, bill_id);