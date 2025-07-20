-- 🏛️ Campaign System Database Tables
-- Complete campaign management with document storage

-- 1. Main campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaign-Bills relationship table  
CREATE TABLE IF NOT EXISTS public.campaign_bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    bill_id TEXT NOT NULL, -- References bills.bill_id
    added_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    UNIQUE(campaign_id, bill_id)
);

-- 3. Campaign-Legislators relationship table
CREATE TABLE IF NOT EXISTS public.campaign_legislators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    people_id TEXT NOT NULL, -- References people.people_id
    role TEXT DEFAULT 'stakeholder' CHECK (role IN ('target', 'ally', 'opponent', 'stakeholder', 'sponsor')),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(campaign_id, people_id)
);

-- 4. Campaign documents table (file metadata)
CREATE TABLE IF NOT EXISTS public.campaign_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Path in Supabase storage
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- 5. Campaign notes table (rich text storage)
CREATE TABLE IF NOT EXISTS public.campaign_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    content TEXT, -- Rich text HTML content
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_bills_campaign_id ON public.campaign_bills(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_bills_bill_id ON public.campaign_bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_campaign_legislators_campaign_id ON public.campaign_legislators(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_legislators_people_id ON public.campaign_legislators(people_id);
CREATE INDEX IF NOT EXISTS idx_campaign_documents_campaign_id ON public.campaign_documents(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_notes_campaign_id ON public.campaign_notes(campaign_id);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to campaigns table
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply update trigger to campaign_notes table  
DROP TRIGGER IF EXISTS update_campaign_notes_updated_at ON public.campaign_notes;
CREATE TRIGGER update_campaign_notes_updated_at
    BEFORE UPDATE ON public.campaign_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for campaign documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-documents',
  'campaign-documents', 
  false, -- Private bucket
  26214400, -- 25MB limit in bytes
  ARRAY['application/pdf']::text[] -- Only PDF files allowed
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for campaign documents
CREATE POLICY IF NOT EXISTS "Users can upload campaign documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-documents');

CREATE POLICY IF NOT EXISTS "Users can view campaign documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-documents');

CREATE POLICY IF NOT EXISTS "Users can delete campaign documents"  
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-documents');

-- Row Level Security (RLS) Policies
-- Note: Temporarily disabled for development, will re-enable with proper auth

-- ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_bills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_legislators ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.campaign_notes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.campaigns IS 'Main campaigns table for organizing legislative tracking efforts';
COMMENT ON TABLE public.campaign_bills IS 'Junction table linking campaigns to bills';
COMMENT ON TABLE public.campaign_legislators IS 'Junction table linking campaigns to legislators/people';
COMMENT ON TABLE public.campaign_documents IS 'Metadata for files uploaded to campaigns';
COMMENT ON TABLE public.campaign_notes IS 'Rich text notes for campaigns';