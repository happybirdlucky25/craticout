import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Newspaper } from 'lucide-react';
import { ArticleCard } from './ArticleCard';
import { useRealtimeVotes, useAnalytics } from '@/hooks/useNewsfeed';
import { useNewsfeedFallback, type Article } from '@/hooks/useNewsfeedFallback';

interface NewsfeedSectionProps {
  className?: string;
  maxArticles?: number;
}

export const NewsfeedSection = ({ className, maxArticles = 20 }: NewsfeedSectionProps) => {
  const [localArticles, setLocalArticles] = useState<Article[]>([]);
  const { articles, loading, error, hasMore, refresh, refetch } = useNewsfeedFallback({
    limit: maxArticles,
    maxPerDomain: 2
  });
  const { trackNewsfeedLoad } = useAnalytics();

  // Set up real-time vote updates
  const articleIds = useMemo(() => articles.map(a => a.id), [articles]);
  const voteUpdates = useRealtimeVotes(articleIds);

  // Update local articles when new data arrives
  useEffect(() => {
    setLocalArticles(articles);
  }, [articles]);

  // Track newsfeed load
  useEffect(() => {
    if (articles.length > 0) {
      trackNewsfeedLoad({
        articles_count: articles.length,
        domains: [...new Set(articles.map(a => a.domain))],
        publications: [...new Set(articles.map(a => a.publication))]
      });
    }
  }, [articles, trackNewsfeedLoad]);

  // Apply real-time vote updates
  useEffect(() => {
    if (Object.keys(voteUpdates).length > 0) {
      setLocalArticles(prev => 
        prev.map(article => ({
          ...article,
          vote_counts: voteUpdates[article.id] || article.vote_counts
        }))
      );
    }
  }, [voteUpdates]);

  const handleVoteUpdate = (articleId: string, voteCounts: { up: number; down: number }) => {
    setLocalArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, vote_counts: voteCounts }
          : article
      )
    );
  };

  const handleRefresh = () => {
    refresh();
    refetch();
  };

  if (loading && localArticles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest Political News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="aspect-video mb-4 rounded" />
                  <Skeleton className="h-6 mb-2" />
                  <Skeleton className="h-4 mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && localArticles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest Political News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading News</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (localArticles.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest Political News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Newspaper className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recent News</h3>
            <p className="text-muted-foreground mb-4">
              No political news articles found from the last 7 days. This could mean:
            </p>
            <ul className="text-sm text-muted-foreground mb-6 space-y-1">
              <li>• The RSS feed table is empty</li>
              <li>• No articles have been published recently</li>
              <li>• Database connection issues</li>
            </ul>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest Political News
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onVoteUpdate={handleVoteUpdate}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                'Load More Articles'
              )}
            </Button>
          </div>
        )}

        {/* Article Count */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Showing {localArticles.length} articles from the last 7 days
        </div>
      </CardContent>
    </Card>
  );
};