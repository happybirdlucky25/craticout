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

interface NewsfeedResponse {
  articles: Article[];
  total_count: number;
}

interface NewsfeedParams {
  limit?: number;
  offset?: number;
  maxPerDomain?: number;
}

export const useNewsfeed = (params: NewsfeedParams = {}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const {
    limit = 20,
    offset = 0,
    maxPerDomain = 2
  } = params;

  const fetchNewsfeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        maxPerDomain: maxPerDomain.toString()
      });

      const response = await fetch(
        `/functions/v1/get-newsfeed?${queryParams}`,
        { headers }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch newsfeed');
      }

      const data: NewsfeedResponse = await response.json();
      
      if (offset === 0) {
        setArticles(data.articles);
      } else {
        setArticles(prev => [...prev, ...data.articles]);
      }
      
      setTotalCount(data.total_count);

    } catch (err) {
      console.error('Error fetching newsfeed:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch newsfeed');
    } finally {
      setLoading(false);
    }
  }, [limit, offset, maxPerDomain]);

  useEffect(() => {
    fetchNewsfeed();
  }, [fetchNewsfeed]);

  const loadMore = useCallback(() => {
    if (!loading && articles.length < totalCount) {
      // This will trigger a new fetch with updated offset
      const newParams = { ...params, offset: articles.length };
      return newParams;
    }
    return null;
  }, [loading, articles.length, totalCount, params]);

  const refresh = useCallback(() => {
    const refreshParams = { ...params, offset: 0 };
    setArticles([]);
    return refreshParams;
  }, [params]);

  return {
    articles,
    loading,
    error,
    totalCount,
    hasMore: articles.length < totalCount,
    loadMore,
    refresh,
    refetch: fetchNewsfeed
  };
};

export const useArticleVoting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteOnArticle = useCallback(async (
    articleId: string, 
    voteType: 'up' | 'down'
  ): Promise<{ up: number; down: number } | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required to vote');
      }

      const response = await fetch('/functions/v1/vote-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          article_id: articleId,
          vote_type: voteType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }

      const data = await response.json();
      return data.vote_counts;

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

export const useAnalytics = () => {
  const trackEvent = useCallback(async (
    eventType: string,
    articleId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      await fetch('/functions/v1/track-analytics', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event_type: eventType,
          article_id: articleId,
          metadata
        })
      });

      // Don't throw errors for analytics - fail silently
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, []);

  const trackArticleView = useCallback((articleId: string, metadata?: Record<string, any>) => {
    trackEvent('article_view', articleId, metadata);
  }, [trackEvent]);

  const trackArticleClick = useCallback((articleId: string, metadata?: Record<string, any>) => {
    trackEvent('article_click', articleId, metadata);
  }, [trackEvent]);

  const trackNewsfeedLoad = useCallback((metadata?: Record<string, any>) => {
    trackEvent('newsfeed_load', undefined, metadata);
  }, [trackEvent]);

  return {
    trackEvent,
    trackArticleView,
    trackArticleClick,
    trackNewsfeedLoad
  };
};

// Hook for real-time vote updates
export const useRealtimeVotes = (articleIds: string[]) => {
  const [voteUpdates, setVoteUpdates] = useState<Record<string, { up: number; down: number }>>({});

  useEffect(() => {
    if (articleIds.length === 0) return;

    const channel = supabase
      .channel('article_votes_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'article_votes',
          filter: `article_id=in.(${articleIds.join(',')})`
        },
        async (payload) => {
          // When vote changes, recalculate counts for affected article
          const articleId = payload.new?.article_id || payload.old?.article_id;
          
          if (articleId) {
            try {
              const { data: voteCounts } = await supabase
                .from('article_votes')
                .select('vote_type')
                .eq('article_id', articleId);

              if (voteCounts) {
                const upVotes = voteCounts.filter(v => v.vote_type === 'up').length;
                const downVotes = voteCounts.filter(v => v.vote_type === 'down').length;
                
                setVoteUpdates(prev => ({
                  ...prev,
                  [articleId]: { up: upVotes, down: downVotes }
                }));
              }
            } catch (error) {
              console.error('Error fetching updated vote counts:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleIds]);

  return voteUpdates;
};