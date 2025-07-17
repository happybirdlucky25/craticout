import { useState, useEffect } from "react";
import { Bookmark, FileText, Users, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";

interface BookmarkItem {
  id: string;
  title: string;
  type: 'bill' | 'legislator' | 'article';
  saved_at: string;
  url?: string;
}

const mockBookmarks: BookmarkItem[] = [
  {
    id: "1",
    title: "Clean Energy Investment Bill",
    type: 'bill',
    saved_at: "2024-01-16T10:30:00Z"
  },
  {
    id: "2",
    title: "Sen. Elizabeth Warren",
    type: 'legislator',
    saved_at: "2024-01-15T14:20:00Z"
  },
  {
    id: "3",
    title: "Analysis: Healthcare Reform Impact",
    type: 'article',
    saved_at: "2024-01-14T09:15:00Z",
    url: "https://example.com/healthcare-analysis"
  }
];

export function BookmarksWidget() {
  const { isAuthenticated } = useAppStore();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        setBookmarks(mockBookmarks);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [isAuthenticated]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'bill': return <FileText className="h-4 w-4" />;
      case 'legislator': return <Users className="h-4 w-4" />;
      case 'article': return <Globe className="h-4 w-4" />;
      default: return <Bookmark className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bookmark className="h-5 w-5 mr-2" />
            Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || bookmarks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bookmark className="h-5 w-5 mr-2" />
            Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              No bookmarks saved yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Bookmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <div className="text-muted-foreground mt-0.5">
                {getIcon(bookmark.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1 truncate">
                  {bookmark.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="capitalize">{bookmark.type}</span>
                  <span>•</span>
                  <span>{formatDate(bookmark.saved_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}