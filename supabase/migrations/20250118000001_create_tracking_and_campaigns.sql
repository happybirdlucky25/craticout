-- Create tracking and campaign tables for PoliUX

-- Table: tracked_bills
CREATE TABLE IF NOT EXISTS tracked_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES bills(bill_id) ON DELETE CASCADE,
    tracked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    campaign_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, bill_id)
);

-- Table: tracked_legislators 
CREATE TABLE IF NOT EXISTS tracked_legislators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    people_id UUID REFERENCES people(people_id) ON DELETE CASCADE,
    tracked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    notification_types TEXT[] DEFAULT ARRAY['bills', 'votes'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, people_id)
);

-- Table: campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: campaign_bills (many-to-many relationship)
CREATE TABLE IF NOT EXISTS campaign_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES bills(bill_id) ON DELETE CASCADE,
    tracked_bill_id UUID REFERENCES tracked_bills(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(campaign_id, bill_id)
);

-- Table: campaign_legislators (many-to-many relationship)
CREATE TABLE IF NOT EXISTS campaign_legislators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    people_id UUID REFERENCES people(people_id) ON DELETE CASCADE,
    tracked_legislator_id UUID REFERENCES tracked_legislators(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'stakeholder' CHECK (role IN ('target', 'ally', 'opponent', 'stakeholder', 'sponsor')),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(campaign_id, people_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tracked_bills_user_id ON tracked_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_bills_bill_id ON tracked_bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_tracked_bills_campaign_id ON tracked_bills(campaign_id);

CREATE INDEX IF NOT EXISTS idx_tracked_legislators_user_id ON tracked_legislators(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_legislators_people_id ON tracked_legislators(people_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

CREATE INDEX IF NOT EXISTS idx_campaign_bills_campaign_id ON campaign_bills(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_bills_bill_id ON campaign_bills(bill_id);

CREATE INDEX IF NOT EXISTS idx_campaign_legislators_campaign_id ON campaign_legislators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_legislators_people_id ON campaign_legislators(people_id);

-- Add foreign key constraint for tracked_bills.campaign_id
ALTER TABLE tracked_bills ADD CONSTRAINT fk_tracked_bills_campaign 
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;

-- Add foreign key constraint for report_inbox.campaign_id (if not exists)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_report_inbox_campaign'
    ) THEN
        ALTER TABLE report_inbox ADD COLUMN campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_tracked_bills_updated_at ON tracked_bills;
CREATE TRIGGER update_tracked_bills_updated_at
    BEFORE UPDATE ON tracked_bills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tracked_legislators_updated_at ON tracked_legislators;
CREATE TRIGGER update_tracked_legislators_updated_at
    BEFORE UPDATE ON tracked_legislators
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tracked_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_legislators ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_legislators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracked_bills
DROP POLICY IF EXISTS "Users can manage their own tracked bills" ON tracked_bills;
CREATE POLICY "Users can manage their own tracked bills" ON tracked_bills
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tracked_legislators
DROP POLICY IF EXISTS "Users can manage their own tracked legislators" ON tracked_legislators;
CREATE POLICY "Users can manage their own tracked legislators" ON tracked_legislators
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for campaigns
DROP POLICY IF EXISTS "Users can manage their own campaigns" ON campaigns;
CREATE POLICY "Users can manage their own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for campaign_bills
DROP POLICY IF EXISTS "Users can manage their campaign bills" ON campaign_bills;
CREATE POLICY "Users can manage their campaign bills" ON campaign_bills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_bills.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- RLS Policies for campaign_legislators
DROP POLICY IF EXISTS "Users can manage their campaign legislators" ON campaign_legislators;
CREATE POLICY "Users can manage their campaign legislators" ON campaign_legislators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_legislators.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON tracked_bills TO authenticated;
GRANT ALL ON tracked_legislators TO authenticated;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaign_bills TO authenticated;
GRANT ALL ON campaign_legislators TO authenticated;

-- Function to auto-add bill sponsors to campaign legislators
CREATE OR REPLACE FUNCTION auto_add_bill_sponsors_to_campaign()
RETURNS TRIGGER AS $$
BEGIN
    -- Add primary sponsors of the bill to campaign legislators
    INSERT INTO campaign_legislators (campaign_id, people_id, role, notes)
    SELECT 
        NEW.campaign_id,
        s.people_id,
        CASE 
            WHEN s.position = 'Primary' THEN 'sponsor'
            ELSE 'stakeholder'
        END,
        'Auto-added as bill sponsor'
    FROM sponsor s
    WHERE s.bill_id = NEW.bill_id
    AND s.people_id IS NOT NULL
    ON CONFLICT (campaign_id, people_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-add sponsors when bill is added to campaign
DROP TRIGGER IF EXISTS trigger_auto_add_sponsors ON campaign_bills;
CREATE TRIGGER trigger_auto_add_sponsors
    AFTER INSERT ON campaign_bills
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_bill_sponsors_to_campaign();