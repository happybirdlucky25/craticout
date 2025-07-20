-- 📁 Supabase Storage Setup for Campaign Documents
-- Create storage bucket and policies for file uploads

-- 1. Create storage bucket for campaign documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-documents',
  'campaign-documents', 
  false, -- Private bucket
  26214400, -- 25MB limit in bytes
  ARRAY['application/pdf']::text[] -- Only PDF files allowed
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for campaign documents
-- Note: Temporarily allowing all access for development

-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Users can upload campaign documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaign-documents');

-- Allow users to view campaign documents  
CREATE POLICY IF NOT EXISTS "Users can view campaign documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-documents');

-- Allow users to delete campaign documents
CREATE POLICY IF NOT EXISTS "Users can delete campaign documents"  
ON storage.objects FOR DELETE
USING (bucket_id = 'campaign-documents');

-- Future RLS policies (commented out for development):
-- CREATE POLICY "Users can upload to their campaigns" 
-- ON storage.objects FOR INSERT 
-- WITH CHECK (
--   bucket_id = 'campaign-documents' 
--   AND auth.uid() IN (
--     SELECT user_id FROM campaigns 
--     WHERE id::text = (storage.foldername(name))[1]
--   )
-- );

COMMENT ON POLICY "Users can upload campaign documents" ON storage.objects IS 'Allow file uploads to campaign-documents bucket';
COMMENT ON POLICY "Users can view campaign documents" ON storage.objects IS 'Allow viewing files in campaign-documents bucket';  
COMMENT ON POLICY "Users can delete campaign documents" ON storage.objects IS 'Allow deleting files in campaign-documents bucket';