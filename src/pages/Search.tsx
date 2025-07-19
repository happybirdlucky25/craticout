import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/Skeleton";
import { toast } from "sonner";
import { 
  Search as SearchIcon, 
  Filter, 
  Bookmark, 
  Clock, 
  Plus,
  Heart,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Save
} from "lucide-react";

// Mock data
const US_STATES = [
  { value: "federal", label: "Federal Congress" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  // Add more states as needed...
];

const BILL_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "introduced", label: "Introduced" },
  { value: "in-committee", label: "In Committee" },
  { value: "passed-house", label: "Passed House" },
  { value: "passed-senate", label: "Passed Senate" },
  { value: "passed", label: "Passed" },
  { value: "signed", label: "Signed into Law" },
  { value: "vetoed", label: "Vetoed" },
  { value: "dead", label: "Dead/Failed" }
];

const BILL_TYPES = [
  { value: "all", label: "All Types" },
  { value: "H", label: "House Bill (H)" },
  { value: "S", label: "Senate Bill (S)" },
  { value: "HR", label: "House Resolution (HR)" },
  { value: "SR", label: "Senate Resolution (SR)" },
  { value: "HB", label: "House Bill (HB)" },
  { value: "SB", label: "Senate Bill (SB)" },
  { value: "SHJR", label: "Senate/House Joint Resolution" }
];

const CHAMBERS = [
  { value: "all", label: "Both Chambers" },
  { value: "house", label: "House" },
  { value: "senate", label: "Senate" }
];

const SEARCH_SUGGESTIONS = [
  "healthcare reform",
  "climate change",
  "infrastructure",
  "education funding",
  "tax reform",
  "immigration",
  "defense spending",
  "minimum wage"
];

const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  onSearch,
  suggestions,
  showSuggestions,
  onSuggestionClick,
  setShowSuggestions
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  suggestions: string[];
  showSuggestions: boolean;
  onSuggestionClick: (suggestion: string) => void;
  setShowSuggestions: (show: boolean) => void;
}) => {
  return (
    <div className="relative flex-1">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bills by title, number (e.g. H.R. 1234), or keywords..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-4"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
          <div className="p-2 text-xs text-muted-foreground font-medium">Suggestions</div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <SearchIcon className="inline h-3 w-3 mr-2 text-muted-foreground" />
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SavedSearches = ({ onLoadSearch }: { onLoadSearch: (search: any) => void }) => {
  const savedSearches = [
    { id: 1, name: "Climate Bills CA", query: "climate change", state: "CA", filters: {} },
    { id: 2, name: "Federal Healthcare", query: "healthcare", state: "federal", filters: {} },
    { id: 3, name: "Education Reform", query: "education funding", state: "NY", filters: {} }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Saved Searches
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {savedSearches.map((search) => (
          <DropdownMenuItem
            key={search.id}
            onClick={() => onLoadSearch(search)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{search.name}</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              {search.state === 'federal' ? 'Fed' : search.state}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const BillCard = ({ 
  bill, 
  onTrackBill, 
  isTracked 
}: { 
  bill: any; 
  onTrackBill: (bill: any) => void;
  isTracked: boolean;
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'in-committee': return 'bg-yellow-100 text-yellow-800';
      case 'introduced': return 'bg-gray-100 text-gray-800';
      case 'vetoed': return 'bg-red-100 text-red-800';
      case 'dead': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader onClick={() => navigate(`/bills/${bill.id}`)}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {bill.billNumber}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(bill.status)}`}>
              {bill.status}
            </Badge>
          </div>
          <Button
            size="sm"
            variant={isTracked ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onTrackBill(bill);
            }}
            className="h-8"
          >
            {isTracked ? (
              <Heart className="h-3 w-3 mr-1 fill-current" />
            ) : (
              <BookmarkPlus className="h-3 w-3 mr-1" />
            )}
            {isTracked ? "Tracked" : "Track"}
          </Button>
        </div>
        <CardTitle className="text-lg line-clamp-2 mb-2">
          {bill.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span>{bill.sponsor}</span>
          <span>•</span>
          <span>{bill.chamber}</span>
          <span>•</span>
          <span>{bill.state === 'federal' ? 'Federal' : bill.state}</span>
        </CardDescription>
      </CardHeader>
      <CardContent onClick={() => navigate(`/bills/${bill.id}`)}>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {bill.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last action: {bill.lastAction}</span>
          <span>{new Date(bill.lastActionDate).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const TrackBillModal = ({ 
  bill, 
  isOpen, 
  onClose, 
  onConfirm 
}: {
  bill: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (campaignId?: string) => void;
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  
  const campaigns = [
    { id: "1", name: "Clean Energy Initiative" },
    { id: "2", name: "Education Reform Coalition" },
    { id: "3", name: "Healthcare Access Campaign" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track Bill: {bill?.billNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add this bill to a campaign or track it individually:
          </p>
          <div className="font-medium">{bill?.title}</div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Add to Campaign (optional)</label>
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign or track individually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Track individually</SelectItem>
                {campaigns.map(campaign => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={() => onConfirm(selectedCampaign || undefined)} className="flex-1">
              Start Tracking
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'federal');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [chamberFilter, setChamberFilter] = useState('all');
  
  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trackingBill, setTrackingBill] = useState<any>(null);
  const [trackedBills, setTrackedBills] = useState<Set<string>>(new Set());
  
  // Mock search results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const totalResults = 156;
  const resultsPerPage = 15;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  // Mock bill data
  const mockBills = [
    {
      id: "1",
      billNumber: "H.R. 1234",
      title: "Clean Energy Infrastructure Investment Act",
      status: "In Committee",
      sponsor: "Rep. Johnson (D-CA)",
      chamber: "House",
      state: "federal",
      summary: "Comprehensive legislation to modernize America's energy infrastructure through investments in renewable energy, smart grid technology, and electric vehicle charging networks.",
      lastAction: "Referred to Committee on Energy and Commerce",
      lastActionDate: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      billNumber: "S. 567",
      title: "Education Equity and Funding Reform Act",
      status: "Passed Senate",
      sponsor: "Sen. Williams (D-NY)",
      chamber: "Senate",
      state: "federal",
      summary: "Legislation to address educational inequities by reforming funding formulas and increasing support for underserved communities.",
      lastAction: "Passed Senate by voice vote",
      lastActionDate: "2024-01-12T15:30:00Z"
    },
    {
      id: "3",
      billNumber: "H.R. 2468",
      title: "Small Business Innovation Support Act",
      status: "Introduced",
      sponsor: "Rep. Davis (R-TX)",
      chamber: "House",
      state: "federal",
      summary: "Provides tax incentives and grants for small businesses investing in research and development of innovative technologies.",
      lastAction: "Introduced in House",
      lastActionDate: "2024-01-10T09:15:00Z"
    }
  ];

  const performSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedState) params.set('state', selectedState);
    setSearchParams(params);

    // Mock search delay
    setTimeout(() => {
      setSearchResults(mockBills);
      setIsLoading(false);
      setCurrentPage(1);
    }, 1000);
  };

  const handleTrackBill = (bill: any) => {
    if (trackedBills.has(bill.id)) {
      setTrackedBills(prev => {
        const newSet = new Set(prev);
        newSet.delete(bill.id);
        return newSet;
      });
      toast.success("Bill removed from tracking");
    } else {
      setTrackingBill(bill);
    }
  };

  const confirmTrackBill = (campaignId?: string) => {
    if (trackingBill) {
      setTrackedBills(prev => new Set(prev).add(trackingBill.id));
      const message = campaignId 
        ? "Bill added to campaign and tracking" 
        : "Bill added to tracking";
      toast.success(message);
      setTrackingBill(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setTimeout(performSearch, 100);
  };

  const handleLoadSavedSearch = (search: any) => {
    setSearchTerm(search.query);
    setSelectedState(search.state);
    toast.success(`Loaded search: ${search.name}`);
  };

  const saveCurrentSearch = () => {
    if (searchTerm.trim()) {
      toast.success("Search saved successfully");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Legislation</h1>
        <p className="text-muted-foreground">
          Find and track bills across all 50 states and federal Congress
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Main search bar and jurisdiction */}
            <div className="flex gap-4">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={performSearch}
                suggestions={SEARCH_SUGGESTIONS.filter(s => 
                  s.toLowerCase().includes(searchTerm.toLowerCase()) && 
                  searchTerm.length > 0
                )}
                showSuggestions={showSuggestions}
                onSuggestionClick={handleSuggestionClick}
                setShowSuggestions={setShowSuggestions}
              />
              
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={performSearch} size="lg">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILL_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={chamberFilter} onValueChange={setChamberFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHAMBERS.map(chamber => (
                    <SelectItem key={chamber.value} value={chamber.value}>
                      {chamber.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="ml-auto flex gap-2">
                <SavedSearches onLoadSearch={handleLoadSavedSearch} />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={saveCurrentSearch}
                  disabled={!searchTerm.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Search
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
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
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * resultsPerPage) + 1}-{Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onTrackBill={handleTrackBill}
                isTracked={trackedBills.has(bill.id)}
              />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : searchTerm ? (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No bills found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Search for legislation</h3>
          <p className="text-muted-foreground">
            Enter keywords, bill numbers, or topics to find relevant bills
          </p>
        </div>
      )}

      <TrackBillModal
        bill={trackingBill}
        isOpen={!!trackingBill}
        onClose={() => setTrackingBill(null)}
        onConfirm={confirmTrackBill}
      />
    </div>
  );
};

export default Search;