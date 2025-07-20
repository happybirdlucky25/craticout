-- Temporarily disable RLS on campaign tables for development
-- This allows development work without complex auth setup

-- Disable Row Level Security on campaign tables
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_legislators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_notes DISABLE ROW LEVEL SECURITY;

-- Note: When implementing proper authentication, re-enable with:
-- ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_bills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_legislators ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_notes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.campaigns IS 'Campaign management - RLS temporarily disabled for development';
COMMENT ON TABLE public.campaign_bills IS 'Campaign bill relationships - RLS temporarily disabled for development';
COMMENT ON TABLE public.campaign_legislators IS 'Campaign legislator relationships - RLS temporarily disabled for development';
COMMENT ON TABLE public.campaign_documents IS 'Campaign documents - RLS temporarily disabled for development';
COMMENT ON TABLE public.campaign_notes IS 'Campaign notes - RLS temporarily disabled for development';