import { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";

interface SavedReport {
  id: string;
  title: string;
  type: 'fiscal' | 'summary' | 'opinion' | 'strategy';
  created_at: string;
  bill_title: string;
}

// No mock data - will use real user-generated reports

export function SavedReportsWidget() {
  const { isAuthenticated } = useAppStore();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // TODO: Fetch user's saved reports from Supabase
        setReports([]);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [isAuthenticated]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fiscal': return 'bg-green-100 text-green-800';
      case 'summary': return 'bg-blue-100 text-blue-800';
      case 'opinion': return 'bg-purple-100 text-purple-800';
      case 'strategy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <FileText className="h-5 w-5 mr-2" />
            Saved Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Saved Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              No saved reports yet
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
          <FileText className="h-5 w-5 mr-2" />
          Saved Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.slice(0, 5).map((report) => (
            <div key={report.id} className="flex items-start justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm mb-1 truncate">
                  {report.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  {report.bill_title}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getTypeColor(report.type)} text-xs`}>
                    {report.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(report.created_at)}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}