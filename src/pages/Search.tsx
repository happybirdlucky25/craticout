import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useBills, useBillStatuses, useBillCommittees } from "@/hooks/useBills";
import { TrackButton } from "@/components/bills/TrackButton";
import { formatBillNumber, isBillNumber } from "@/utils/billNumberFormatter";
import type { BillFilters } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/Skeleton";
import { 
  Search as SearchIcon, 
  Filter, 
  Bookmark, 
  Clock, 
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
          placeholder="Search bills by title, keywords, or bill number (e.g. HR123, H.R. 1234, SJR45)..."
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
  bill
}: { 
  bill: any;
}) => {
  const navigate = useNavigate();
  
  const handleBillClick = () => {
    // Store the current search state for "Back" functionality
    const currentSearch = window.location.search;
    sessionStorage.setItem('lastSearchState', currentSearch);
    navigate(`/bills/${bill.bill_id}`);
  };

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

  // Format date for display
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
      <CardHeader onClick={handleBillClick}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {formatBillNumber(bill.bill_number)}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(bill.status || '')}`}>
              {bill.status || 'Unknown'}
            </Badge>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <TrackButton 
              billId={bill.bill_id || bill.id}
              billTitle={bill.title}
              billNumber={formatBillNumber(bill.bill_number)}
              size="sm"
              showModal={false}
              className="h-8"
            />
          </div>
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
      <CardContent onClick={handleBillClick}>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {bill.description || 'No description available.'}
        </p>
        {bill.last_action && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">Last action: {bill.last_action}</span>
          </div>
        )}
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


const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'federal');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [chamberFilter, setChamberFilter] = useState('all');
  const [committeeFilter, setCommitteeFilter] = useState('all');
  
  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Results per page
  const resultsPerPage = 15;
  
  // Memoize filters to prevent unnecessary re-renders
  const currentFilters = useMemo((): BillFilters => {
    if (!hasSearched) return {};
    
    const filters: BillFilters = {};
    
    if (searchTerm.trim()) {
      filters.search_term = searchTerm.trim();
    }
    
    if (statusFilter !== 'all') {
      filters.status = [statusFilter];
    }
    
    if (committeeFilter !== 'all') {
      filters.committee = [committeeFilter];
    }
    
    return filters;
  }, [hasSearched, searchTerm, statusFilter, committeeFilter]);
  const { data: billsData, loading: isLoading, error } = useBills(
    currentFilters, 
    currentPage, 
    resultsPerPage
  );
  
  // Get filter options from database
  const { data: statusOptions } = useBillStatuses();
  const { data: committeeOptions } = useBillCommittees();
  
  // Memoize search results to prevent flickering
  const searchResults = useMemo(() => {
    return (hasSearched && billsData?.bills) ? billsData.bills : [];
  }, [hasSearched, billsData?.bills]);
  
  const totalResults = useMemo(() => {
    return (hasSearched && billsData?.total_count) ? billsData.total_count : 0;
  }, [hasSearched, billsData?.total_count]);
  
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const performSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setShowSuggestions(false);
    setHasSearched(true);
    setCurrentPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedState) params.set('state', selectedState);
    setSearchParams(params);
  }, [searchTerm, selectedState, setSearchParams]);


  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setTimeout(performSearch, 100);
  }, [performSearch]);

  const handleLoadSavedSearch = useCallback((search: any) => {
    setSearchTerm(search.query);
    setSelectedState(search.state);
    toast.success(`Loaded search: ${search.name}`);
  }, []);

  const saveCurrentSearch = () => {
    if (searchTerm.trim()) {
      toast.success("Search saved successfully");
    }
  };

  // Trigger search on page load if URL has search params
  useEffect(() => {
    const urlSearchTerm = searchParams.get('q');
    if (urlSearchTerm && urlSearchTerm.trim()) {
      setHasSearched(true);
    }
  }, [searchParams]);

  // Auto-search when filters change (with debounce)
  useEffect(() => {
    if (!hasSearched) return;
    
    const timeoutId = setTimeout(() => {
      // Trigger a re-fetch by updating the filters
      // The useMemo will handle the actual filter changes
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, committeeFilter, hasSearched]);

  // Debug effect to track search state
  useEffect(() => {
    console.log('Search Debug:', {
      hasSearched,
      searchTerm,
      searchResults: searchResults.length,
      isLoading,
      totalResults,
      currentFilters,
      billsData: billsData?.bills?.length || 0
    });
  }, [hasSearched, searchTerm, searchResults, isLoading, totalResults, currentFilters, billsData]);

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
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions?.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Committees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Committees</SelectItem>
                  {committeeOptions?.map(committee => (
                    <SelectItem key={committee} value={committee}>
                      {committee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={chamberFilter} onValueChange={setChamberFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Both Chambers" />
                </SelectTrigger>
                <SelectContent>
                  {CHAMBERS.map(chamber => (
                    <SelectItem key={chamber.value} value={chamber.value}>
                      {chamber.label}
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
      {hasSearched && isLoading ? (
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
      ) : error ? (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-600">Search Error</h3>
          <p className="text-muted-foreground mb-4">
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : hasSearched && searchResults.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * resultsPerPage) + 1}-{Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((bill, index) => {
              const billId = bill.bill_id || bill.id || `bill-${index}`;
              return (
                <BillCard
                  key={`${billId}-${currentPage}`} // Stable key including page
                  bill={bill}
                />
              );
            })}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : hasSearched && searchTerm ? (
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

    </div>
  );
};

export default Search;