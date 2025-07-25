import { useState, useEffect } from "react";
import { FileText, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";
import { useTracking } from "../../../hooks/useTracking";

interface TrackedBill {
  id: string;
  title: string;
  status: string;
  last_action: string;
  last_action_date: string;
  sponsor: string;
  chamber: string;
}

// No mock data - will use real tracked bills from user preferences

export function TrackedBillsWidget() {
  const { user, isAuthenticated } = useAppStore();
  const { trackedBills, loading } = useTracking();

  // Transform tracked bills data for the widget
  const bills = trackedBills.map(bill => ({
    id: bill.bill_id,
    title: bill.title || 'Bill Title',
    status: bill.status || 'Unknown',
    last_action: bill.last_action || 'No recent action',
    last_action_date: bill.last_action_date || new Date().toISOString(),
    sponsor: bill.sponsor || 'Unknown',
    chamber: bill.chamber || 'Unknown'
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'in committee':
        return 'bg-blue-100 text-blue-800';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Tracked Bills
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

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Tracked Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to track bills and get updates
            </p>
            <Button size="sm">Sign In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Tracked Bills
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.href = '/search'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-4">
              Start tracking bills to see updates here
            </p>
            <Button 
              size="sm"
              onClick={() => window.location.href = '/search'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Find Bills to Track
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Tracked Bills
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.href = '/search'}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.slice(0, 5).map((bill) => (
            <div 
              key={bill.id} 
              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => window.location.href = `/bills/${bill.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight mb-1 truncate">
                    {bill.title}
                  </h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`${getStatusColor(bill.status)} text-xs`}>
                      {bill.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {bill.chamber}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {bill.last_action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(bill.last_action_date)}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
        
        {bills.length > 5 && (
          <div className="text-center pt-4 border-t">
            <Button variant="ghost" size="sm">
              View All ({bills.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}