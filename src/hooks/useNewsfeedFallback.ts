import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  canonical_link: string;
  domain: string;
  publication: string;
  author: string;
  pub_date: string;
  image_url?: string;
  vote_counts: {
    up: number;
    down: number;
  };
  user_vote?: 'up' | 'down' | null;
}

interface NewsfeedParams {
  limit?: number;
  maxPerDomain?: number;
}

// Calculate recency weight based on publication date
function calculateWeight(pubDate: string): number {
  const now = new Date();
  const articleDate = new Date(pubDate);
  const ageInHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
  
  if (ageInHours <= 24) return 4;      // Last 24 hours: 4x weight
  if (ageInHours <= 72) return 2;      // 1-3 days: 2x weight  
  if (ageInHours <= 168) return 1;     // 4-7 days: 1x weight
  return 0; // Exclude articles older than 7 days
}

// Ensure domain diversity by limiting articles per domain
function diversifyByDomain(articles: any[], maxPerDomain: number): any[] {
  const domainCounts: Record<string, number> = {};
  return articles.filter(article => {
    const count = domainCounts[article.domain] || 0;
    if (count < maxPerDomain) {
      domainCounts[article.domain] = count + 1;
      return true;
    }
    return false;
  });
}

// Weighted random shuffle
function weightedShuffle(articles: any[]): any[] {
  return articles
    .map(article => ({
      ...article,
      sortKey: Math.random() * article.weight
    }))
    .sort((a, b) => b.sortKey - a.sortKey)
    .map(({ sortKey, weight, ...article }) => article);
}

export const useNewsfeedFallback = (params: NewsfeedParams = {}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const {
    limit = 20,
    maxPerDomain = 2
  } = params;

  const fetchNewsfeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Get RSS articles from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: rssArticles, error: articlesError } = await supabase
        .from('rss_feed')
        .select(`
          id,
          title,
          description,
          link,
          canonical_link,
          domain,
          publication,
          author,
          pub_date,
          image_url
        `)
        .gte('pub_date', sevenDaysAgo.toISOString())
        .order('pub_date', { ascending: false })
        .limit(200); // Get more articles to allow for filtering

      if (articlesError) {
        throw new Error(`Failed to fetch articles: ${articlesError.message}`);
      }

      if (!rssArticles || rssArticles.length === 0) {
        setArticles([]);
        setTotalCount(0);
        return;
      }

      // Add weights and filter by age
      const weightedArticles = rssArticles
        .map(article => ({
          ...article,
          weight: calculateWeight(article.pub_date)
        }))
        .filter(article => article.weight > 0);

      // Apply domain diversity
      const diversifiedArticles = diversifyByDomain(weightedArticles, maxPerDomain);

      // Apply weighted randomization
      const shuffledArticles = weightedShuffle(diversifiedArticles);

      // Take the requested number of articles
      const finalArticles = shuffledArticles.slice(0, limit);

      // Get article IDs for vote queries
      const articleIds = finalArticles.map(a => a.id);

      // Get vote counts for all articles
      let voteCountsMap: Record<string, { up: number, down: number }> = {};
      if (articleIds.length > 0) {
        const { data: voteCounts } = await supabase
          .from('article_votes')
          .select('article_id, vote_type')
          .in('article_id', articleIds);

        if (voteCounts) {
          for (const vote of voteCounts) {
            if (!voteCountsMap[vote.article_id]) {
              voteCountsMap[vote.article_id] = { up: 0, down: 0 };
            }
            if (vote.vote_type === 'up') {
              voteCountsMap[vote.article_id].up++;
            } else if (vote.vote_type === 'down') {
              voteCountsMap[vote.article_id].down++;
            }
          }
        }
      }

      // Get user's votes if authenticated
      let userVotes: Record<string, string> = {};
      if (user && articleIds.length > 0) {
        const { data: userVoteData } = await supabase
          .from('article_votes')
          .select('article_id, vote_type')
          .eq('user_id', user.id)
          .in('article_id', articleIds);

        if (userVoteData) {
          userVotes = userVoteData.reduce((acc, vote) => ({
            ...acc,
            [vote.article_id]: vote.vote_type
          }), {});
        }
      }

      // Format final articles
      const formattedArticles: Article[] = finalArticles.map(article => ({
        ...article,
        vote_counts: voteCountsMap[article.id] || { up: 0, down: 0 },
        user_vote: userVotes[article.id] || null
      }));

      setArticles(formattedArticles);
      setTotalCount(shuffledArticles.length);

      // Track analytics if user is authenticated
      if (user) {
        try {
          await supabase
            .from('internal_analytics')
            .insert({
              event_type: 'newsfeed_load',
              user_id: user.id,
              metadata: {
                articles_count: formattedArticles.length,
                method: 'database_direct'
              }
            });
        } catch (analyticsError) {
          console.warn('Failed to log analytics:', analyticsError);
        }
      }

    } catch (err) {
      console.error('Error fetching newsfeed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch newsfeed');
    } finally {
      setLoading(false);
    }
  }, [limit, maxPerDomain]);

  useEffect(() => {
    fetchNewsfeed();
  }, [fetchNewsfeed]);

  const refresh = useCallback(() => {
    fetchNewsfeed();
  }, [fetchNewsfeed]);

  return {
    articles,
    loading,
    error,
    totalCount,
    hasMore: false, // Simplified for fallback
    refresh,
    refetch: fetchNewsfeed
  };
};

export const useArticleVotingFallback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteOnArticle = useCallback(async (
    articleId: string, 
    voteType: 'up' | 'down'
  ): Promise<{ up: number; down: number } | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required to vote');
      }

      // Check if article exists
      const { data: article, error: articleError } = await supabase
        .from('rss_feed')
        .select('id')
        .eq('id', articleId)
        .single();

      if (articleError || !article) {
        throw new Error('Article not found');
      }

      // Upsert vote
      const { error: voteError } = await supabase
        .from('article_votes')
        .upsert({
          article_id: articleId,
          user_id: user.id,
          vote_type: voteType,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'article_id,user_id'
        });

      if (voteError) {
        throw new Error(`Failed to record vote: ${voteError.message}`);
      }

      // Get updated vote counts
      const { data: voteCounts } = await supabase
        .from('article_votes')
        .select('vote_type')
        .eq('article_id', articleId);

      const upVotes = voteCounts?.filter(v => v.vote_type === 'up').length || 0;
      const downVotes = voteCounts?.filter(v => v.vote_type === 'down').length || 0;

      // Log analytics
      try {
        await supabase
          .from('internal_analytics')
          .insert({
            event_type: 'article_vote',
            article_id: articleId,
            user_id: user.id,
            metadata: {
              vote_type: voteType,
              method: 'database_direct'
            }
          });
      } catch (analyticsError) {
        console.warn('Failed to log analytics:', analyticsError);
      }

      return { up: upVotes, down: downVotes };

    } catch (err) {
      console.error('Error voting on article:', err);
      setError(err instanceof Error ? err.message : 'Failed to vote');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    voteOnArticle,
    loading,
    error
  };
};