import { useState, useEffect } from "react";
import { Target, Plus, ExternalLink, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";

interface Campaign {
  id: string;
  name: string;
  description: string;
  bill_count: number;
  legislator_count: number;
  progress: number;
  updated_at: string;
  status: 'active' | 'paused' | 'completed';
}

// No mock data - will use real user campaigns from database

export function CampaignsWidget() {
  const { user, isAuthenticated } = useAppStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaigns = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // TODO: Fetch user's campaigns from Supabase
        // For now, show empty state until campaign system is implemented
        setCampaigns([]);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else {
      return `${diffInDays} days ago`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            My Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-full" />
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
            <Target className="h-5 w-5 mr-2" />
            My Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to create and manage campaigns
            </p>
            <Button size="sm">Sign In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              My Campaigns
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.href = '/campaigns'}
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-4">
              Create your first campaign to organize your legislative tracking
            </p>
            <Button 
              size="sm"
              onClick={() => window.location.href = '/campaigns'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Campaign
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
            <Target className="h-5 w-5 mr-2" />
            My Campaigns
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.href = '/campaigns'}
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div 
              key={campaign.id} 
              className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border"
              onClick={() => window.location.href = `/campaigns/${campaign.id}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1 truncate">
                    {campaign.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {campaign.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <Badge className={`${getStatusColor(campaign.status)} text-xs`}>
                    {campaign.status}
                  </Badge>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                <div className="flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  {campaign.bill_count} bills
                </div>
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {campaign.legislator_count} legislators
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} className="h-1" />
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                Updated {formatDate(campaign.updated_at)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center pt-4 border-t">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/campaigns'}
          >
            View All Campaigns
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}