-- Create report_inbox table for storing AI-generated reports
CREATE TABLE IF NOT EXISTS report_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES bills(bill_id) ON DELETE CASCADE,
    bill_number TEXT,
    report_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    expiration_date TIMESTAMPTZ,
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    campaign_name TEXT,
    bills_included INTEGER DEFAULT 1,
    files_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_report_inbox_user_id ON report_inbox(user_id);
CREATE INDEX IF NOT EXISTS idx_report_inbox_bill_id ON report_inbox(bill_id);
CREATE INDEX IF NOT EXISTS idx_report_inbox_date_created ON report_inbox(date_created DESC);
CREATE INDEX IF NOT EXISTS idx_report_inbox_expiration ON report_inbox(expiration_date);
CREATE INDEX IF NOT EXISTS idx_report_inbox_report_type ON report_inbox(report_type);

-- Create trigger function to set expiration_date to +90 days from creation
CREATE OR REPLACE FUNCTION set_report_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiration_date to 90 days from now if not already set
    IF NEW.expiration_date IS NULL THEN
        NEW.expiration_date := NEW.date_created + INTERVAL '90 days';
    END IF;
    
    -- Update the updated_at timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expiration_date on INSERT
DROP TRIGGER IF EXISTS trigger_set_report_expiration ON report_inbox;
CREATE TRIGGER trigger_set_report_expiration
    BEFORE INSERT ON report_inbox
    FOR EACH ROW
    EXECUTE FUNCTION set_report_expiration();

-- Create trigger to update updated_at on UPDATE
DROP TRIGGER IF EXISTS trigger_update_report_timestamp ON report_inbox;
CREATE TRIGGER trigger_update_report_timestamp
    BEFORE UPDATE ON report_inbox
    FOR EACH ROW
    EXECUTE FUNCTION set_report_expiration();

-- Enable Row Level Security
ALTER TABLE report_inbox ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own reports" ON report_inbox;
CREATE POLICY "Users can view their own reports" ON report_inbox
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reports" ON report_inbox;
CREATE POLICY "Users can insert their own reports" ON report_inbox
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reports" ON report_inbox;
CREATE POLICY "Users can update their own reports" ON report_inbox
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reports" ON report_inbox;
CREATE POLICY "Users can delete their own reports" ON report_inbox
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to clean up expired reports (can be called via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_reports()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM report_inbox 
    WHERE expiration_date < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON report_inbox TO authenticated;
GRANT EXECUTE ON FUNCTION set_report_expiration() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_reports() TO authenticated;