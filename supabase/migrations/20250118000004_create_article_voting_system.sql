-- Create article voting and analytics system for RSS newsfeed

-- Article votes table: One vote per user per article
CREATE TABLE IF NOT EXISTS article_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL, -- references rss_feed.id
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id) -- Ensure one vote per user per article
);

-- Internal analytics table for tracking user interactions
CREATE TABLE IF NOT EXISTS internal_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'article_view', 'article_vote', 'article_click', 'newsfeed_load'
  article_id TEXT, -- references rss_feed.id when applicable
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}', -- flexible data: vote_type, click_target, viewport_time, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_article_votes_article_id ON article_votes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_votes_user_id ON article_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_article_votes_created_at ON article_votes(created_at);

CREATE INDEX IF NOT EXISTS idx_internal_analytics_event_type ON internal_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_internal_analytics_article_id ON internal_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_internal_analytics_created_at ON internal_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_internal_analytics_user_id ON internal_analytics(user_id);

-- Add index on rss_feed for newsfeed queries
CREATE INDEX IF NOT EXISTS idx_rss_feed_pub_date ON rss_feed(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_rss_feed_domain_pub_date ON rss_feed(domain, pub_date DESC);

-- Row Level Security Policies

-- Article votes: Users can see all vote counts but only manage their own votes
ALTER TABLE article_votes ENABLE ROW LEVEL SECURITY;

-- Allow users to view all vote records (needed for counting)
CREATE POLICY "Users can view all vote counts" ON article_votes
  FOR SELECT USING (true);

-- Users can only insert/update/delete their own votes
CREATE POLICY "Users can manage own votes" ON article_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" ON article_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON article_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Internal analytics: Service role only (users can't read analytics data)
ALTER TABLE internal_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON internal_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to insert analytics events
CREATE POLICY "Users can insert analytics" ON internal_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Trigger to update updated_at on article_votes
CREATE OR REPLACE FUNCTION update_article_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_article_votes_updated_at
  BEFORE UPDATE ON article_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_article_votes_updated_at();

-- Function to get vote counts for an article
CREATE OR REPLACE FUNCTION get_article_vote_counts(article_id_param TEXT)
RETURNS TABLE(up_votes BIGINT, down_votes BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END), 0) as up_votes,
    COALESCE(SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END), 0) as down_votes
  FROM article_votes 
  WHERE article_id = article_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's vote for an article
CREATE OR REPLACE FUNCTION get_user_vote(article_id_param TEXT, user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  user_vote TEXT;
BEGIN
  SELECT vote_type INTO user_vote
  FROM article_votes 
  WHERE article_id = article_id_param AND user_id = user_id_param;
  
  RETURN user_vote;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add article_votes to realtime publication for real-time vote updates
ALTER PUBLICATION supabase_realtime ADD TABLE article_votes;