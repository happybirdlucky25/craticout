import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { VotingButtons } from './VotingButtons';
import { useAnalytics } from '@/hooks/useNewsfeed';
import type { Article } from '@/hooks/useNewsfeedFallback';

interface ArticleCardProps {
  article: Article;
  onVoteUpdate?: (articleId: string, voteCounts: { up: number; down: number }) => void;
}

export const ArticleCard = ({ article, onVoteUpdate }: ArticleCardProps) => {
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { trackArticleView, trackArticleClick } = useAnalytics();

  // Track article view when it comes into viewport
  useEffect(() => {
    if (!cardRef.current || hasBeenViewed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenViewed) {
            setHasBeenViewed(true);
            trackArticleView(article.id, {
              viewport_percentage: Math.round(entry.intersectionRatio * 100),
              article_domain: article.domain,
              article_publication: article.publication
            });
          }
        });
      },
      { threshold: 0.5 } // Track when 50% of article is visible
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [article.id, article.domain, article.publication, hasBeenViewed, trackArticleView]);

  const handleArticleClick = () => {
    trackArticleClick(article.id, {
      click_target: 'article_link',
      article_domain: article.domain,
      article_publication: article.publication
    });
    window.open(article.link, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Unknown';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card 
      ref={cardRef}
      className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col bg-white border border-gray-200"
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Post Header - Publication and Date */}
        <div className="p-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs font-medium">
                {article.publication}
              </Badge>
              {article.author && (
                <span className="text-xs text-muted-foreground">by {article.author}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formatDate(article.pub_date)}</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3 
            className="font-semibold text-lg leading-tight mb-3 cursor-pointer hover:text-primary transition-colors line-clamp-2"
            onClick={handleArticleClick}
          >
            {article.title}
          </h3>

          {/* Content based on image availability */}
          {article.image_url ? (
            // With Image Layout
            <>
              <div className="relative mb-3 rounded-lg overflow-hidden bg-muted">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  onError={(e) => {
                    // Hide broken images and show description instead
                    const container = e.currentTarget.closest('.relative');
                    if (container) {
                      container.innerHTML = `<div class="p-4 bg-gray-50 rounded-lg"><p class="text-sm text-gray-700 line-clamp-4">${truncateText(article.description, 200)}</p></div>`;
                    }
                  }}
                />
              </div>
              {article.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {truncateText(article.description, 120)}
                </p>
              )}
            </>
          ) : (
            // No Image Layout - Show more content
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-gray-700 text-sm line-clamp-4 leading-relaxed">
                {truncateText(article.description, 250)}
              </p>
            </div>
          )}
        </div>

        {/* Post Footer */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              onClick={handleArticleClick}
              className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="truncate mr-1">{article.domain}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </button>
            
            {/* Voting Buttons */}
            <VotingButtons
              articleId={article.id}
              voteCounts={article.vote_counts}
              userVote={article.user_vote}
              onVoteUpdate={onVoteUpdate}
              size="sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};