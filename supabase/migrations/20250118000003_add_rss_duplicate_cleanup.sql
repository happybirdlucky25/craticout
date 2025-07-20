-- Function to delete RSS duplicates
-- This assumes you have an RSS-related table that might accumulate duplicates

CREATE OR REPLACE FUNCTION delete_rss_duplicates()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duplicates_count INTEGER := 0;
BEGIN
  -- Example implementation - adjust based on your actual RSS table structure
  -- This is a generic pattern for removing duplicates based on multiple columns
  
  -- If you have an RSS feeds table, you might delete duplicates like this:
  -- DELETE FROM rss_feeds a USING (
  --   SELECT MIN(ctid) as ctid, url, title
  --   FROM rss_feeds 
  --   GROUP BY url, title
  --   HAVING COUNT(*) > 1
  -- ) b
  -- WHERE a.url = b.url AND a.title = b.title AND a.ctid <> b.ctid;
  
  -- For now, this is a placeholder that returns 0
  -- Replace with your actual duplicate deletion logic
  
  -- Example for a hypothetical rss_items table:
  /*
  WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY url, title, published_date 
             ORDER BY created_at DESC
           ) as row_num
    FROM rss_items
  )
  DELETE FROM rss_items 
  WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
  );
  
  GET DIAGNOSTICS duplicates_count = ROW_COUNT;
  */
  
  -- Log the cleanup operation
  INSERT INTO public.system_logs (
    operation, 
    details, 
    created_at
  ) VALUES (
    'rss_duplicate_cleanup',
    json_build_object(
      'duplicates_removed', duplicates_count,
      'executed_at', NOW()
    ),
    NOW()
  ) ON CONFLICT DO NOTHING; -- In case system_logs table doesn't exist
  
  RETURN duplicates_count;
END;
$$;

-- Create system_logs table if it doesn't exist (for audit trail)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for system_logs (only service role can access)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.system_logs
  FOR ALL USING (auth.role() = 'service_role');