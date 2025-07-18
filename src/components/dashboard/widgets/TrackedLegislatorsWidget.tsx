import { useState, useEffect } from "react";
import { Users, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";

interface TrackedLegislator {
  id: string;
  name: string;
  party: string;
  state: string;
  chamber: string;
  district?: string;
  photo?: string;
  recent_activity: string;
}

// No mock data - will use real tracked legislators from user preferences

export function TrackedLegislatorsWidget() {
  const { user, isAuthenticated } = useAppStore();
  const [legislators, setLegislators] = useState<TrackedLegislator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrackedLegislators = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // TODO: Fetch user's tracked legislators from Supabase
        // For now, show empty state until user tracking is implemented
        setLegislators([]);
      } catch (error) {
        console.error('Error loading tracked legislators:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrackedLegislators();
  }, [isAuthenticated]);

  const getPartyColor = (party: string) => {
    switch (party.toLowerCase()) {
      case 'democratic':
        return 'bg-blue-100 text-blue-800';
      case 'republican':
        return 'bg-red-100 text-red-800';
      case 'independent':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Tracked Legislators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
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
            <Users className="h-5 w-5 mr-2" />
            Tracked Legislators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to track legislators and get updates
            </p>
            <Button size="sm">Sign In</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (legislators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Tracked Legislators
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.href = '/legislators'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground mb-4">
              Start tracking legislators to see updates here
            </p>
            <Button 
              size="sm"
              onClick={() => window.location.href = '/legislators'}
            >
              <Plus className="h-4 w-4 mr-1" />
              Find Legislators to Track
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
            <Users className="h-5 w-5 mr-2" />
            Tracked Legislators
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.href = '/legislators'}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {legislators.slice(0, 5).map((legislator) => (
            <div 
              key={legislator.id} 
              className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => window.location.href = `/legislators/${legislator.id}`}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={legislator.photo} alt={legislator.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(legislator.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {legislator.name}
                    </h4>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={`${getPartyColor(legislator.party)} text-xs`}>
                      {legislator.party.charAt(0)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {legislator.chamber} • {legislator.state}
                      {legislator.district && ` • D${legislator.district}`}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {legislator.recent_activity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {legislators.length > 5 && (
          <div className="text-center pt-4 border-t">
            <Button variant="ghost" size="sm">
              View All ({legislators.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}