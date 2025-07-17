import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ExternalLink, Clock, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useAppStore } from "../../store";

interface FeedItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
  tags: string[];
  is_breaking: boolean;
  item_type: 'rss' | 'ad';
}

// Mock data for demonstration
const mockFeedItems: FeedItem[] = [
  {
    id: "1",
    title: "Senate Passes Bipartisan Infrastructure Bill",
    summary: "The Senate voted 69-30 to pass the $1.2 trillion infrastructure package, sending it to the House for final approval.",
    source: "Reuters",
    url: "https://example.com/senate-infrastructure",
    published_at: "2024-01-17T10:30:00Z",
    tags: ["Infrastructure", "Senate", "Bipartisan"],
    is_breaking: true,
    item_type: 'rss'
  },
  {
    id: "ad-1",
    title: "Sponsored: Policy Research Tools",
    summary: "Get comprehensive policy analysis tools for your organization. Advanced tracking and reporting features.",
    source: "Advertisement",
    url: "https://example.com/policy-tools",
    published_at: "2024-01-17T09:00:00Z",
    tags: ["Sponsored"],
    is_breaking: false,
    item_type: 'ad'
  },
  {
    id: "2",
    title: "House Committee Advances Climate Legislation",
    summary: "The House Energy and Commerce Committee voted to advance sweeping climate legislation aimed at reducing carbon emissions by 50% by 2030.",
    source: "The Hill",
    url: "https://example.com/climate-legislation",
    published_at: "2024-01-17T08:15:00Z",
    tags: ["Climate", "Environment", "House"],
    is_breaking: false,
    item_type: 'rss'
  },
  {
    id: "3",
    title: "Supreme Court to Hear Healthcare Challenge",
    summary: "The Supreme Court announced it will hear arguments in a case that could significantly impact healthcare access nationwide.",
    source: "Associated Press",
    url: "https://example.com/supreme-court-healthcare",
    published_at: "2024-01-17T07:45:00Z",
    tags: ["Supreme Court", "Healthcare", "Legal"],
    is_breaking: false,
    item_type: 'rss'
  },
  {
    id: "4",
    title: "New Education Funding Formula Proposed",
    summary: "State legislators propose a new formula for education funding that would increase support for underserved districts.",
    source: "Education Week",
    url: "https://example.com/education-funding",
    published_at: "2024-01-17T06:20:00Z",
    tags: ["Education", "Funding", "State"],
    is_breaking: false,
    item_type: 'rss'
  }
];

export function NewsFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeedItems = useCallback(async (pageNum: number = 1, refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const itemsPerPage = 5;
      const startIndex = (pageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageItems = mockFeedItems.slice(startIndex, endIndex);

      if (refresh || pageNum === 1) {
        setFeedItems(pageItems);
      } else {
        setFeedItems(prev => [...prev, ...pageItems]);
      }

      setHasMore(endIndex < mockFeedItems.length);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading feed items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    loadFeedItems(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadFeedItems(page + 1);
    }
  };

  useEffect(() => {
    loadFeedItems();
  }, [loadFeedItems]);

  // Listen for dashboard refresh events
  useEffect(() => {
    const handleDashboardRefresh = () => {
      loadFeedItems(1, true);
    };

    window.addEventListener('dashboard-refresh', handleDashboardRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleDashboardRefresh);
  }, [loadFeedItems]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && feedItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest News</h2>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Latest News</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {feedItems.map((item) => (
          <Card 
            key={item.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              item.item_type === 'ad' ? 'border-blue-200 bg-blue-50/30' : ''
            }`}
            onClick={() => window.open(item.url, '_blank')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={item.item_type === 'ad' ? 'secondary' : 'outline'}>
                      {item.item_type === 'ad' ? 'Sponsored' : item.source}
                    </Badge>
                    {item.is_breaking && (
                      <Badge variant="destructive" className="animate-pulse">
                        Breaking
                      </Badge>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(item.published_at)}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg leading-tight mb-2">
                    {item.title}
                  </h3>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground mb-3 leading-relaxed">
                {item.summary}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {!hasMore && feedItems.length > 0 && (
        <div className="text-center pt-4 text-sm text-muted-foreground">
          You've reached the end of the feed
        </div>
      )}
    </div>
  );
}