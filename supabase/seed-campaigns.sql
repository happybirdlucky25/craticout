-- Seed Campaign Data for Development
-- Run this in Supabase SQL Editor to populate with sample data

-- Insert sample campaigns
INSERT INTO campaigns (id, name, description, status, user_id) VALUES
  ('01234567-89ab-cdef-0123-456789abcdef', 'Clean Energy Initiative', 'Tracking renewable energy legislation and building coalition support for climate action policies across multiple states.', 'active', 'dev-user'),
  ('11234567-89ab-cdef-0123-456789abcdef', 'Education Reform Coalition', 'Advocating for increased education funding and curriculum modernization with focus on STEM and digital literacy.', 'active', 'dev-user'),
  ('21234567-89ab-cdef-0123-456789abcdef', 'Healthcare Access Campaign', 'Expanding healthcare access and reducing prescription drug costs for seniors and low-income families.', 'active', 'dev-user');

-- Add sample bills to campaigns (using actual bill IDs from your bills table)
-- First, let's get some actual bill IDs from the database
WITH sample_bills AS (
  SELECT bill_id, title, bill_number 
  FROM bills 
  WHERE bill_id IS NOT NULL 
  LIMIT 10
)
INSERT INTO campaign_bills (campaign_id, bill_id, notes, priority)
SELECT 
  '01234567-89ab-cdef-0123-456789abcdef' as campaign_id,
  bill_id,
  'Key renewable energy bill - high priority for coalition' as notes,
  'high' as priority
FROM sample_bills
LIMIT 3
UNION ALL
SELECT 
  '11234567-89ab-cdef-0123-456789abcdef' as campaign_id,
  bill_id,
  'Education funding increase bill' as notes,
  'high' as priority
FROM sample_bills
OFFSET 3 LIMIT 2
UNION ALL
SELECT 
  '21234567-89ab-cdef-0123-456789abcdef' as campaign_id,
  bill_id,
  'Healthcare access bill' as notes,
  'high' as priority
FROM sample_bills
OFFSET 5 LIMIT 2;

-- Add sample legislators as stakeholders (using actual people IDs from your people table)
WITH sample_people AS (
  SELECT people_id, name, party, role 
  FROM people 
  WHERE people_id IS NOT NULL 
  LIMIT 10
)
INSERT INTO campaign_legislators (campaign_id, people_id, role, notes)
SELECT 
  '01234567-89ab-cdef-0123-456789abcdef' as campaign_id,
  people_id,
  'champion' as role,
  'Lead sponsor of renewable energy legislation' as notes
FROM sample_people
LIMIT 3
UNION ALL
SELECT 
  '11234567-89ab-cdef-0123-456789abcdef' as campaign_id,
  people_id,
  'supporter' as role,
  'Education policy supporter' as notes
FROM sample_people
OFFSET 3 LIMIT 2
UNION ALL
SELECT 
  '21234567-89ab-cdef-0123-456789abcdef' as campaign_id,
  people_id,
  'champion' as role,
  'Healthcare policy expert' as notes
FROM sample_people
OFFSET 5 LIMIT 2;

-- Add sample documents
INSERT INTO campaign_documents (campaign_id, file_name, file_size, file_type, storage_path, uploaded_by) VALUES
  ('01234567-89ab-cdef-0123-456789abcdef', 'Clean_Energy_Strategy_2025.pdf', 2048000, 'application/pdf', '/campaigns/01234567-89ab-cdef-0123-456789abcdef/Clean_Energy_Strategy_2025.pdf', 'dev-user'),
  ('01234567-89ab-cdef-0123-456789abcdef', 'Coalition_Member_List.xlsx', 512000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '/campaigns/01234567-89ab-cdef-0123-456789abcdef/Coalition_Member_List.xlsx', 'dev-user'),
  ('01234567-89ab-cdef-0123-456789abcdef', 'Renewable_Energy_Talking_Points.docx', 256000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '/campaigns/01234567-89ab-cdef-0123-456789abcdef/Renewable_Energy_Talking_Points.docx', 'dev-user'),
  ('11234567-89ab-cdef-0123-456789abcdef', 'Education_Funding_Analysis.pdf', 1536000, 'application/pdf', '/campaigns/11234567-89ab-cdef-0123-456789abcdef/Education_Funding_Analysis.pdf', 'dev-user'),
  ('11234567-89ab-cdef-0123-456789abcdef', 'STEM_Curriculum_Proposal.pdf', 1024000, 'application/pdf', '/campaigns/11234567-89ab-cdef-0123-456789abcdef/STEM_Curriculum_Proposal.pdf', 'dev-user'),
  ('21234567-89ab-cdef-0123-456789abcdef', 'Healthcare_Cost_Study.pdf', 3072000, 'application/pdf', '/campaigns/21234567-89ab-cdef-0123-456789abcdef/Healthcare_Cost_Study.pdf', 'dev-user'),
  ('21234567-89ab-cdef-0123-456789abcdef', 'Senior_Healthcare_Survey.xlsx', 768000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '/campaigns/21234567-89ab-cdef-0123-456789abcdef/Senior_Healthcare_Survey.xlsx', 'dev-user');

-- Add sample notes
INSERT INTO campaign_notes (campaign_id, content, updated_by) VALUES
  ('01234567-89ab-cdef-0123-456789abcdef', 
   'Clean Energy Initiative Campaign Notes

Key Objectives:
- Pass renewable energy portfolio standards
- Secure tax incentives for solar and wind
- Build bipartisan coalition of environmental and business groups

Recent Updates:
- Met with Sierra Club leadership on coalition strategy
- Scheduled hearings with House Energy Committee for next month
- Solar Energy Industries Association committed to lobbying support

Next Steps:
- Draft talking points for committee hearings
- Coordinate grassroots advocacy efforts
- Schedule one-on-one meetings with key legislators

Stakeholder Engagement:
- Rep. Johnson confirmed as lead sponsor
- Sen. Williams expressed interest but wants to see cost analysis
- Need to address concerns from rural legislators about grid reliability

Coalition Partners:
- Sierra Club (environmental advocacy)
- Solar Energy Industries Association (industry support)
- League of Conservation Voters (voter education)
- Chamber of Commerce (business community)', 
   'dev-user'),

  ('11234567-89ab-cdef-0123-456789abcdef',
   'Education Reform Coalition Campaign Notes

Primary Goals:
- Increase per-pupil funding by 15%
- Modernize STEM curricula statewide
- Expand digital learning infrastructure

Progress Update:
- Teachers Union formally endorsed the initiative
- School Board Association committed to advocacy
- Initial budget analysis shows $2.3B investment needed

Legislative Strategy:
- Target education committee members first
- Build support among rural district representatives
- Coordinate with parent advocacy groups

Challenges:
- Budget constraints in current fiscal year
- Opposition from taxpayer advocacy groups
- Need to demonstrate measurable outcomes

Upcoming Activities:
- Parent town halls scheduled for next month
- Policy briefing with education committee staff
- Media campaign launch planned for September',
   'dev-user'),

  ('21234567-89ab-cdef-0123-456789abcdef',
   'Healthcare Access Campaign Notes

Campaign Focus Areas:
- Medicare expansion for 55+ population
- Prescription drug cost negotiation
- Rural healthcare facility support

Key Achievements:
- AARP officially endorsed the campaign
- Medical Association resolution of support
- Preliminary cost-benefit analysis completed

Legislative Landscape:
- Rep. Davis committed to introducing companion bill
- Senate Health Committee chair requested additional hearings
- Bipartisan interest emerging on prescription drug provisions

Stakeholder Input:
- Senior citizen focus groups strongly supportive
- Rural hospital administrators seeking federal matching funds
- Pharmacy benefit managers raising cost concerns

Strategic Priorities:
- Counter opposition messaging on cost concerns
- Develop state-by-state implementation timeline
- Build coalition with rural healthcare advocates

Research Needs:
- Updated actuarial analysis for Medicare expansion
- Comparative studies from other states
- Economic impact assessment for rural communities',
   'dev-user');

-- Verify the data was inserted
SELECT 'Campaigns created:' as info, COUNT(*) as count FROM campaigns WHERE user_id = 'dev-user'
UNION ALL
SELECT 'Campaign bills added:' as info, COUNT(*) as count FROM campaign_bills
UNION ALL  
SELECT 'Campaign legislators added:' as info, COUNT(*) as count FROM campaign_legislators
UNION ALL
SELECT 'Campaign documents added:' as info, COUNT(*) as count FROM campaign_documents
UNION ALL
SELECT 'Campaign notes added:' as info, COUNT(*) as count FROM campaign_notes;