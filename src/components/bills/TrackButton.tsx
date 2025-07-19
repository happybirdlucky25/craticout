import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useBillTracking } from '@/hooks/useBillTracking';
import { supabase } from '@/integrations/supabase/client';

interface TrackButtonProps {
  billId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const TrackButton = ({
  billId,
  variant = 'outline',
  size = 'md',
  showLabel = true,
  className = ''
}: TrackButtonProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    isTracked,
    loading,
    checkingStatus,
    toggleTracking
  } = useBillTracking(billId);

  useEffect(() => {
    // Temporarily disable auth for development
    setIsAuthenticated(true); // Always authenticated in dev mode
    
    // const checkAuth = async () => {
    //   const { data: { user } } = await supabase.auth.getUser();
    //   setIsAuthenticated(!!user);
    // };
    // 
    // checkAuth();
    // 
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    //   setIsAuthenticated(!!session?.user);
    // });
    //
    // return () => subscription.unsubscribe();
  }, []);

  const handleClick = async () => {
    if (!isAuthenticated) {
      // Could add a login modal here or redirect to login
      window.location.href = '/login';
      return;
    }
    
    await toggleTracking();
  };

  const getButtonProps = () => {
    if (checkingStatus) {
      return {
        disabled: true,
        variant: 'outline' as const,
        children: (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {showLabel && <span className="ml-2">Checking...</span>}
          </>
        )
      };
    }

    if (loading) {
      return {
        disabled: true,
        variant: variant,
        children: (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {showLabel && <span className="ml-2">{isTracked ? 'Untracking...' : 'Tracking...'}</span>}
          </>
        )
      };
    }

    if (isTracked) {
      return {
        variant: 'default' as const,
        children: (
          <>
            <BookmarkCheck className="h-4 w-4" />
            {showLabel && <span className="ml-2">Tracked</span>}
          </>
        )
      };
    }

    return {
      variant: variant,
      children: (
        <>
          <Bookmark className="h-4 w-4" />
          {showLabel && <span className="ml-2">Track Bill</span>}
        </>
      )
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="flex items-center gap-2">
      <Button
        {...buttonProps}
        size={size}
        onClick={handleClick}
        className={className}
      />
      {isTracked && showLabel && (
        <Badge variant="secondary" className="text-xs">
          Following
        </Badge>
      )}
    </div>
  );
};