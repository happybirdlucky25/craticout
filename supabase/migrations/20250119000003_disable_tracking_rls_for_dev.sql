-- Temporarily disable RLS on tracking tables for development
-- This allows development work without complex auth setup

-- Disable Row Level Security on tracking tables
ALTER TABLE public.tracked_bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracked_legislators DISABLE ROW LEVEL SECURITY;

-- Note: When implementing proper authentication, re-enable with:
-- ALTER TABLE public.tracked_bills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tracked_legislators ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.tracked_bills IS 'User bill tracking - RLS temporarily disabled for development';
COMMENT ON TABLE public.tracked_legislators IS 'User legislator tracking - RLS temporarily disabled for development';