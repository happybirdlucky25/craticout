import { useState, useEffect } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";

interface RecentBill {
  id: string;
  title: string;
  sponsor: string;
  introduced_date: string;
  status: string;
  chamber: string;
}

const mockRecentBills: RecentBill[] = [
  {
    id: "1",
    title: "Green Infrastructure Development Act",
    sponsor: "Rep. John Smith",
    introduced_date: "2024-01-16T10:00:00Z",
    status: "Introduced",
    chamber: "House"
  },
  {
    id: "2",
    title: "Education Technology Enhancement Bill",
    sponsor: "Sen. Jane Doe",
    introduced_date: "2024-01-15T14:30:00Z",
    status: "Referred to Committee",
    chamber: "Senate"
  }
];

export function RecentBillsByTrackedWidget() {
  const { isAuthenticated } = useAppStore();
  const [bills, setBills] = useState<RecentBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentBills = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        setBills(mockRecentBills);
      } catch (error) {
        console.error('Error loading recent bills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentBills();
  }, [isAuthenticated]);

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
            Recent Bills by Tracked Legislators
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

  if (!isAuthenticated || bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Bills by Tracked Legislators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              No recent bills from tracked legislators
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
          Recent Bills by Tracked Legislators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.id} className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 truncate">
                    {bill.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-1">
                    {bill.sponsor}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {bill.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {bill.chamber} • {formatDate(bill.introduced_date)}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}