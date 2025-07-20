import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, User, MapPin, Building, Calendar, ExternalLink, Bell, BellOff, Users, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '../store';
import { useLegislatorTracking } from '@/hooks/useTracking';
import type { Legislator } from '../store';

const LegislatorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { legislators, loading } = useAppStore();
  const [legislator, setLegislator] = useState<Legislator | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const { trackLegislator, untrackLegislator, isTracking: checkTracking, loading: trackingLoading } = useLegislatorTracking();

  useEffect(() => {
    if (id && legislators.length > 0) {
      const found = legislators.find(leg => leg.people_id === id);
      setLegislator(found || null);
    }
  }, [id, legislators]);

  // Check tracking status when legislator is found
  useEffect(() => {
    const checkStatus = async () => {
      if (legislator?.people_id) {
        const tracked = await checkTracking(legislator.people_id);
        setIsTracking(tracked);
      }
    };
    checkStatus();
  }, [legislator?.people_id, checkTracking]);

  const handleBack = () => {
    navigate('/legislators');
  };

  const getPartyColor = (party: string | null) => {
    if (!party) return 'bg-gray-100 text-gray-800';
    switch (party.toLowerCase()) {
      case 'democratic':
      case 'democrat':
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

  const handleTrackingToggle = async () => {
    if (!legislator) return;

    try {
      if (isTracking) {
        const success = await untrackLegislator(legislator.people_id);
        if (success) {
          setIsTracking(false);
          toast.success(`Stopped tracking ${legislator.name}`);
        }
      } else {
        const result = await trackLegislator(legislator.people_id);
        if (result) {
          setIsTracking(true);
          toast.success(`Now tracking ${legislator.name}`);
        }
      }
    } catch (error) {
      console.error('Error toggling legislator tracking:', error);
      toast.error("Failed to update tracking status");
    }
  };

  if (loading.legislators) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!legislator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Legislator Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The legislator you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Legislators
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={handleBack}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Legislators
      </Button>

      {/* Legislator Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={legislator.photo} alt={legislator.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(legislator.name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <CardTitle className="text-3xl mb-2">{legislator.name}</CardTitle>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={getPartyColor(legislator.party)}>
                    {legislator.party || 'Unknown'}
                  </Badge>
                  <Badge variant="outline">
                    {legislator.role || 'Unknown Role'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{legislator.state || 'Unknown State'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{legislator.chamber || 'Unknown Chamber'}</span>
                  </div>
                  {legislator.district && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>District {legislator.district}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleTrackingToggle}
                variant={isTracking ? 'default' : 'outline'}
                disabled={trackingLoading}
                className="flex items-center gap-2"
              >
                {trackingLoading ? (
                  <>
                    <User className="h-4 w-4 animate-spin" />
                    {isTracking ? 'Untracking...' : 'Tracking...'}
                  </>
                ) : isTracking ? (
                  <>
                    <BellOff className="h-4 w-4" />
                    Untrack
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Track Legislator
                  </>
                )}
              </Button>
              
              {/* External Links */}
              <div className="flex gap-2">
                {legislator.ballotpedia && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(legislator.ballotpedia, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ballotpedia
                  </Button>
                )}
                {legislator.opensecrets_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://www.opensecrets.org/members-of-congress/summary?cid=${legislator.opensecrets_id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    OpenSecrets
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Bills Sponsored</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Votes Cast</p>
                <p className="text-2xl font-bold">324</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Committees</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Years Served</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Sponsored Bills</TabsTrigger>
          <TabsTrigger value="votes">Voting History</TabsTrigger>
          <TabsTrigger value="committees">Committees</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {legislator.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Current Position</h4>
                  <p className="text-muted-foreground">
                    {legislator.role} representing {legislator.state}
                    {legislator.district && ` District ${legislator.district}`} in the {legislator.chamber}.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Political Affiliation</h4>
                  <p className="text-muted-foreground">
                    Member of the {legislator.party} Party.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p className="text-muted-foreground">
                    Contact information and office details would be displayed here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sponsored Bills</CardTitle>
              <CardDescription>
                Bills sponsored or co-sponsored by {legislator.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Sponsored bills data will be displayed here when connected to the database.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="votes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voting History</CardTitle>
              <CardDescription>
                Recent voting record for {legislator.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                <p>Voting history data will be displayed here when connected to the database.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="committees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Committee Memberships</CardTitle>
              <CardDescription>
                Committees that {legislator.name} serves on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>Committee membership data will be displayed here when connected to the database.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegislatorDetail;