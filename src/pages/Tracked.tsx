import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBillNumber } from "@/utils/billNumberFormatter";
import { toast } from "sonner";
import { 
  FileText, 
  Users, 
  Heart, 
  HeartOff, 
  ExternalLink, 
  Calendar,
  Filter,
  Search,
  Plus,
  Activity,
  TrendingUp
} from "lucide-react";
import { useBills } from "@/hooks/useBills";
import { useLegislators } from "@/hooks/useLegislators";
import type { Bill, Person } from "@/types/database";

interface TrackedBillsProps {
  onUntrack: (billId: string) => void;
  trackedBillIds: string[];
}

interface TrackedLegislatorsProps {
  onUntrack: (personId: string) => void;
  trackedPersonIds: string[];
}

const TrackedBillCard = ({ 
  bill, 
  onUntrack 
}: { 
  bill: Bill; 
  onUntrack: (billId: string) => void;
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'in committee': 
      case 'committee': return 'bg-yellow-100 text-yellow-800';
      case 'introduced': return 'bg-gray-100 text-gray-800';
      case 'vetoed': return 'bg-red-100 text-red-800';
      case 'dead': 
      case 'failed': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => navigate(`/bills/${bill.bill_id}`)}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {formatBillNumber(bill.bill_number)}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(bill.status || '')}`}>
              {bill.status || 'Unknown'}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onUntrack(bill.bill_id);
            }}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <HeartOff className="h-3 w-3 mr-1" />
            Untrack
          </Button>
        </div>
        <CardTitle className="text-lg line-clamp-2 mb-2">
          {bill.title || 'Untitled Bill'}
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span>{bill.committee || 'No Committee'}</span>
          {bill.last_action_date && (
            <>
              <span>•</span>
              <span>{formatDate(bill.last_action_date)}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent onClick={() => navigate(`/bills/${bill.bill_id}`)}>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {bill.description || 'No description available.'}
        </p>
        {bill.last_action && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">Last action: {bill.last_action}</span>
            <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TrackedLegislatorCard = ({ 
  person, 
  onUntrack 
}: { 
  person: Person; 
  onUntrack: (personId: string) => void;
}) => {
  const navigate = useNavigate();

  const getPartyColor = (party: string) => {
    switch (party?.toLowerCase()) {
      case 'democratic':
      case 'democrat': return 'bg-blue-100 text-blue-800';
      case 'republican': return 'bg-red-100 text-red-800';
      case 'independent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase() || '??';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => navigate(`/legislators/${person.people_id}`)}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={person.name} />
              <AvatarFallback className="text-sm">
                {getInitials(person.name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium text-base">
                {person.name || 'Unknown Name'}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${getPartyColor(person.party || '')}`}>
                  {person.party || 'Unknown'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {person.role || 'Unknown'} 
                  {person.district && ` • District ${person.district}`}
                </span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onUntrack(person.people_id);
            }}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <HeartOff className="h-3 w-3 mr-1" />
            Untrack
          </Button>
        </div>
      </CardHeader>
      <CardContent onClick={() => navigate(`/legislators/${person.people_id}`)}>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>View voting record and activity</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  );
};

const TrackedBills = ({ onUntrack, trackedBillIds }: TrackedBillsProps) => {
  // For now, we'll use a placeholder approach since we don't have user tracking in the database yet
  // In a real implementation, this would fetch bills based on user's tracked bill IDs
  const { data: billsData, loading, error } = useBills({}, 1, 20);
  
  // Mock tracked bills by taking first few bills (in real app, would filter by tracked IDs)
  const trackedBills = useMemo(() => {
    if (!billsData?.bills) return [];
    return billsData.bills.slice(0, 3); // Mock: show first 3 as "tracked"
  }, [billsData]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Tracked Bills</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (trackedBills.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Tracked Bills</h3>
        <p className="text-muted-foreground mb-6">
          Start tracking bills to see updates and progress here.
        </p>
        <Button onClick={() => window.location.href = '/search'}>
          <Plus className="h-4 w-4 mr-2" />
          Find Bills to Track
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {trackedBills.length} tracked {trackedBills.length === 1 ? 'bill' : 'bills'}
        </p>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/search'}>
          <Plus className="h-4 w-4 mr-2" />
          Track More Bills
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trackedBills.map((bill) => (
          <TrackedBillCard
            key={bill.bill_id}
            bill={bill}
            onUntrack={onUntrack}
          />
        ))}
      </div>
    </div>
  );
};

const TrackedLegislators = ({ onUntrack, trackedPersonIds }: TrackedLegislatorsProps) => {
  // For now, we'll use a placeholder approach since we don't have user tracking in the database yet
  const { data: legislatorsData, loading, error } = useLegislators({}, 1, 20);
  
  // Mock tracked legislators by taking first few (in real app, would filter by tracked IDs)
  const trackedLegislators = useMemo(() => {
    if (!legislatorsData?.people) return [];
    return legislatorsData.people.slice(0, 2); // Mock: show first 2 as "tracked"
  }, [legislatorsData]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Tracked Legislators</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (trackedLegislators.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Tracked Legislators</h3>
        <p className="text-muted-foreground mb-6">
          Start following legislators to see their activity and voting records.
        </p>
        <Button onClick={() => window.location.href = '/legislators'}>
          <Plus className="h-4 w-4 mr-2" />
          Find Legislators to Track
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {trackedLegislators.length} tracked {trackedLegislators.length === 1 ? 'legislator' : 'legislators'}
        </p>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/legislators'}>
          <Plus className="h-4 w-4 mr-2" />
          Track More Legislators
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trackedLegislators.map((person) => (
          <TrackedLegislatorCard
            key={person.people_id}
            person={person}
            onUntrack={onUntrack}
          />
        ))}
      </div>
    </div>
  );
};

const Tracked = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bills");
  
  // Mock tracked IDs - in real app, these would come from user preferences/database
  const [trackedBillIds, setTrackedBillIds] = useState<string[]>([]);
  const [trackedPersonIds, setTrackedPersonIds] = useState<string[]>([]);

  const handleUntrackBill = (billId: string) => {
    setTrackedBillIds(prev => prev.filter(id => id !== billId));
    toast.success("Bill removed from tracking");
  };

  const handleUntrackLegislator = (personId: string) => {
    setTrackedPersonIds(prev => prev.filter(id => id !== personId));
    toast.success("Legislator removed from tracking");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Tracked Items</h1>
        <p className="text-muted-foreground">
          Monitor your tracked bills and legislators for updates and activity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tracked Bills</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tracked Legislators</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Recent Updates</p>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracked Items Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bills" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Bills
          </TabsTrigger>
          <TabsTrigger value="legislators" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Legislators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-6">
          <TrackedBills 
            onUntrack={handleUntrackBill}
            trackedBillIds={trackedBillIds}
          />
        </TabsContent>

        <TabsContent value="legislators" className="space-y-6">
          <TrackedLegislators 
            onUntrack={handleUntrackLegislator}
            trackedPersonIds={trackedPersonIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tracked;