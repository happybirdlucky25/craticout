-- Direct SQL to create tracking tables
-- Run this in your Supabase SQL Editor

-- 1. Create tracked_bills table with correct schema
CREATE TABLE IF NOT EXISTS tracked_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bill_id TEXT NOT NULL,  -- TEXT to match bills table
    tracked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    campaign_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, bill_id)
);

-- 2. Create tracked_legislators table with correct schema
CREATE TABLE IF NOT EXISTS tracked_legislators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    people_id TEXT NOT NULL,  -- TEXT to match people table
    tracked_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    notification_types TEXT[] DEFAULT ARRAY['bills', 'votes'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, people_id)
);

-- 3. Enable Row Level Security
ALTER TABLE tracked_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_legislators ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for tracked_bills
CREATE POLICY "Users can view own tracked bills" ON tracked_bills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracked bills" ON tracked_bills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracked bills" ON tracked_bills
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked bills" ON tracked_bills
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Create RLS policies for tracked_legislators
CREATE POLICY "Users can view own tracked legislators" ON tracked_legislators
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracked legislators" ON tracked_legislators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracked legislators" ON tracked_legislators
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked legislators" ON tracked_legislators
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracked_bills_user_id ON tracked_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_bills_bill_id ON tracked_bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_tracked_bills_tracked_at ON tracked_bills(tracked_at DESC);

CREATE INDEX IF NOT EXISTS idx_tracked_legislators_user_id ON tracked_legislators(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_legislators_people_id ON tracked_legislators(people_id);
CREATE INDEX IF NOT EXISTS idx_tracked_legislators_tracked_at ON tracked_legislators(tracked_at DESC);

-- 7. Optional: Create campaigns table if needed
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns" ON campaigns
    USING (auth.uid() = user_id);