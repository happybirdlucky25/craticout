import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { useAppStore } from "../../../store";

interface Hearing {
  id: string;
  title: string;
  committee: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

// No mock data - will use real congressional hearing data

export function UpcomingHearingsWidget() {
  const { isAuthenticated } = useAppStore();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHearings = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // TODO: Fetch upcoming hearings from congressional API
        setHearings([]);
      } catch (error) {
        console.error('Error loading hearings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHearings();
  }, [isAuthenticated]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Hearings
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

  if (!isAuthenticated || hearings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Hearings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              No upcoming hearings in the next 7 days
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
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Hearings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hearings.map((hearing) => (
            <div key={hearing.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm leading-tight">
                  {hearing.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {hearing.status}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {hearing.committee}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(hearing.date)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {hearing.time}
                </div>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{hearing.location}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}