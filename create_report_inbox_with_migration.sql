-- Create report_inbox table to replace simple_bill_analysis for Reports page
-- This will migrate existing data from simple_bill_analysis

-- Step 1: Create the report_inbox table
CREATE TABLE IF NOT EXISTS report_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id TEXT REFERENCES bills(bill_id) ON DELETE SET NULL,
  bill_number TEXT,
  report_type TEXT NOT NULL DEFAULT 'Analysis',
  date_created TIMESTAMPTZ DEFAULT NOW(),
  expiration_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  content TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  campaign_name TEXT,
  bills_included INTEGER DEFAULT 1,
  files_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE report_inbox ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies for report_inbox
CREATE POLICY "Users can view own reports" ON report_inbox
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON report_inbox
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON report_inbox
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON report_inbox
  FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create indexes for performance
CREATE INDEX idx_report_inbox_user_id ON report_inbox(user_id);
CREATE INDEX idx_report_inbox_bill_id ON report_inbox(bill_id);
CREATE INDEX idx_report_inbox_date_created ON report_inbox(date_created DESC);
CREATE INDEX idx_report_inbox_expiration_date ON report_inbox(expiration_date);

-- Step 5: Migrate existing data from simple_bill_analysis
-- Note: This assumes user_id needs to be set to a default or specific user
-- You may need to adjust the user_id based on your authentication setup

INSERT INTO report_inbox (
  bill_id,
  bill_number,
  report_type,
  content,
  title,
  date_created,
  expiration_date,
  bills_included,
  files_used,
  user_id
)
SELECT 
  sba.bill_id,
  sba.bill_number,
  COALESCE(sba.analysis_type, 'Analysis') as report_type,
  COALESCE(sba.analysis_text, 'Analysis content not available.') as content,
  CONCAT('Bill Analysis: ', COALESCE(sba.bill_number, sba.bill_id)) as title,
  sba.created_at as date_created,
  sba.created_at + INTERVAL '30 days' as expiration_date,
  1 as bills_included,
  0 as files_used,
  '00000000-0000-0000-0000-000000000000'::uuid as user_id -- Placeholder, replace with actual user ID
FROM simple_bill_analysis sba
WHERE NOT EXISTS (
  SELECT 1 FROM report_inbox ri 
  WHERE ri.bill_id = sba.bill_id 
  AND ri.report_type = COALESCE(sba.analysis_type, 'Analysis')
);

-- Step 6: Add some sample data for testing if needed
-- This adds a sample report with proper content for testing
INSERT INTO report_inbox (
  bill_id,
  bill_number, 
  report_type,
  content,
  title,
  campaign_name,
  bills_included,
  files_used,
  user_id
) VALUES (
  '1901783',
  'HB35',
  'Summary Report',
  E'# Bill Analysis: HB35\n\n## Executive Summary\nThis bill analysis provides a comprehensive overview of HB35 and its potential implications.\n\n## Key Provisions\n- Legislative text analysis\n- Impact assessment\n- Stakeholder considerations\n\n## Recommendations\nBased on our analysis, this bill requires careful consideration of its long-term implications.\n\n## Next Steps\n1. Review committee assignments\n2. Monitor legislative progress\n3. Engage with relevant stakeholders\n\n*Report generated on ' || NOW()::date || '*',
  'Comprehensive Analysis of HB35',
  'Legislative Review Campaign',
  1,
  2,
  '00000000-0000-0000-0000-000000000000'::uuid -- Placeholder, replace with actual user ID
) ON CONFLICT DO NOTHING;

-- Optional: Add another sample report type
INSERT INTO report_inbox (
  bill_id,
  bill_number,
  report_type, 
  content,
  title,
  bills_included,
  files_used,
  user_id
) VALUES (
  '1917397',
  'SB71',
  'Strategy Memo',
  E'# Strategic Memo: Baby Changing on Board Act (SB71)\n\n## Overview\nSenate Bill 71 requires Amtrak to install baby changing tables in passenger rail car bathrooms.\n\n## Strategic Analysis\n### Political Feasibility: HIGH\n- Bipartisan appeal\n- Low controversy\n- Clear public benefit\n\n### Implementation Timeline\n- Expected committee review: 30-60 days\n- Floor consideration: Q2 2025\n- Implementation: 6-12 months post-passage\n\n### Stakeholder Positions\n**Support:**\n- Family advocacy groups\n- Disability rights organizations\n- Transportation unions\n\n**Neutral/Watching:**\n- Amtrak (cost concerns)\n- Budget committee\n\n### Recommended Position\n**SUPPORT** - Low-risk, high-visibility family-friendly legislation.\n\n*Strategic memo prepared ' || NOW()::date || '*',
  'Strategic Analysis: Baby Changing on Board Act',
  1,
  0,
  '00000000-0000-0000-0000-000000000000'::uuid -- Placeholder, replace with actual user ID
) ON CONFLICT DO NOTHING;