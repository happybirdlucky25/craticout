import { useState, useEffect } from "react";
import { FileText, ExternalLink, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";

interface NewBill {
  id: string;
  title: string;
  sponsor: string;
  introduced_date: string;
  chamber: string;
  summary: string;
}

const mockNewBills: NewBill[] = [
  {
    id: "1",
    title: "Digital Privacy Protection Act",
    sponsor: "Rep. Sarah Johnson",
    introduced_date: "2024-01-17T09:00:00Z",
    chamber: "House",
    summary: "Establishes comprehensive data privacy protections for consumers"
  },
  {
    id: "2",
    title: "Small Business Recovery Fund",
    sponsor: "Sen. Michael Chen",
    introduced_date: "2024-01-16T16:30:00Z",
    chamber: "Senate",
    summary: "Provides financial assistance to small businesses affected by economic disruption"
  }
];

export function NewBillsWidget() {
  const { isAuthenticated } = useAppStore();
  const [bills, setBills] = useState<NewBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNewBills = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 700));
        setBills(mockNewBills);
      } catch (error) {
        console.error('Error loading new bills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNewBills();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleTrackBill = (e: React.MouseEvent, billId: string) => {
    e.stopPropagation();
    // TODO: Implement tracking functionality
    console.log('Track bill:', billId);
    // Show confirmation modal that bill is being tracked
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recently Introduced Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recently Introduced Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              No recently introduced bills
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
          Recently Introduced Bills
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.map((bill) => (
            <div 
              key={bill.id} 
              className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border"
              onClick={() => window.location.href = `/bills/${bill.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 truncate">
                    {bill.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {bill.summary}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {bill.chamber}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {bill.sponsor} • {formatDate(bill.introduced_date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleTrackBill(e, bill.id)}
                      className="h-8 px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Track
                    </Button>
                  )}
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}