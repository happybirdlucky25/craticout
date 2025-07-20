import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useArticleVotingFallback } from '@/hooks/useNewsfeedFallback';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VotingButtonsProps {
  articleId: string;
  voteCounts: { up: number; down: number };
  userVote?: 'up' | 'down' | null;
  onVoteUpdate?: (articleId: string, voteCounts: { up: number; down: number }) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical';
}

export const VotingButtons = ({
  articleId,
  voteCounts,
  userVote,
  onVoteUpdate,
  size = 'md',
  variant = 'horizontal'
}: VotingButtonsProps) => {
  const [optimisticVotes, setOptimisticVotes] = useState(voteCounts);
  const [optimisticUserVote, setOptimisticUserVote] = useState(userVote);
  const { voteOnArticle, loading } = useArticleVotingFallback();

  const handleVote = async (voteType: 'up' | 'down') => {
    // Optimistic update
    const newUserVote = optimisticUserVote === voteType ? null : voteType;
    const newVoteCounts = { ...optimisticVotes };

    // Calculate optimistic vote counts
    if (optimisticUserVote === 'up') {
      newVoteCounts.up--;
    } else if (optimisticUserVote === 'down') {
      newVoteCounts.down--;
    }

    if (newUserVote === 'up') {
      newVoteCounts.up++;
    } else if (newUserVote === 'down') {
      newVoteCounts.down++;
    }

    // Apply optimistic update
    setOptimisticVotes(newVoteCounts);
    setOptimisticUserVote(newUserVote);
    onVoteUpdate?.(articleId, newVoteCounts);

    // Send API request
    const result = await voteOnArticle(articleId, voteType);

    if (result) {
      // Update with actual server response
      setOptimisticVotes(result);
      setOptimisticUserVote(voteType);
      onVoteUpdate?.(articleId, result);
    } else {
      // Revert optimistic update on error
      setOptimisticVotes(voteCounts);
      setOptimisticUserVote(userVote);
      onVoteUpdate?.(articleId, voteCounts);
      toast.error('Failed to vote. Please try again.');
    }
  };

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const containerClasses = cn(
    'flex items-center gap-1',
    variant === 'vertical' ? 'flex-col' : 'flex-row'
  );

  return (
    <div className={containerClasses}>
      {/* Thumbs Up Button */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            sizeClasses[size],
            'p-1 rounded-full',
            optimisticUserVote === 'up' 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'hover:bg-green-50 hover:text-green-600'
          )}
          onClick={() => handleVote('up')}
          disabled={loading}
        >
          <ThumbsUp className={iconSizeClasses[size]} />
        </Button>
        <span 
          className={cn(
            'text-xs font-medium min-w-[1rem] text-center',
            optimisticUserVote === 'up' ? 'text-green-700' : 'text-muted-foreground'
          )}
        >
          {optimisticVotes.up}
        </span>
      </div>

      {/* Thumbs Down Button */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            sizeClasses[size],
            'p-1 rounded-full',
            optimisticUserVote === 'down' 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'hover:bg-red-50 hover:text-red-600'
          )}
          onClick={() => handleVote('down')}
          disabled={loading}
        >
          <ThumbsDown className={iconSizeClasses[size]} />
        </Button>
        <span 
          className={cn(
            'text-xs font-medium min-w-[1rem] text-center',
            optimisticUserVote === 'down' ? 'text-red-700' : 'text-muted-foreground'
          )}
        >
          {optimisticVotes.down}
        </span>
      </div>
    </div>
  );
};