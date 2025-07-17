import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAppStore } from "../store";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export function LegislatorSearch() {
  const { legislatorFilters, setLegislatorFilters, legislatureLevel } = useAppStore();
  const [searchInput, setSearchInput] = useState(legislatorFilters.searchTerm);

  const handleSearch = () => {
    setLegislatorFilters({ searchTerm: searchInput });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChamberChange = (value: string) => {
    setLegislatorFilters({ chamber: value === 'all' ? null : value });
  };

  const handleStateChange = (value: string) => {
    setLegislatorFilters({ district: null }); // Reset district when state changes
    // Note: This should update a state filter, not chamber
    // For now, we'll use the selectedState from the store
    // TODO: Implement proper state filtering
  };

  const handlePartyChange = (value: string) => {
    setLegislatorFilters({ party: value === 'all' ? null : value });
  };

  const handleDistrictChange = (value: string) => {
    setLegislatorFilters({ district: value === 'all' ? null : value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search legislators by name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="px-6">
          Search
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Chamber Filter */}
        <Select value={legislatorFilters.chamber || 'all'} onValueChange={handleChamberChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chamber" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chambers</SelectItem>
            <SelectItem value="House">House</SelectItem>
            <SelectItem value="Senate">Senate</SelectItem>
          </SelectContent>
        </Select>

        {/* State Filter */}
        <Select value={legislatorFilters.chamber || 'all'} onValueChange={handleStateChange}>
          <SelectTrigger>
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Party Filter */}
        <Select value={legislatorFilters.party || 'all'} onValueChange={handlePartyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Party" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parties</SelectItem>
            <SelectItem value="Democratic">Democratic</SelectItem>
            <SelectItem value="Republican">Republican</SelectItem>
            <SelectItem value="Independent">Independent</SelectItem>
          </SelectContent>
        </Select>

        {/* District Filter */}
        <Select value={legislatorFilters.district || 'all'} onValueChange={handleDistrictChange}>
          <SelectTrigger>
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {Array.from({ length: 50 }, (_, i) => i + 1).map((district) => (
              <SelectItem key={district} value={district.toString()}>
                District {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {(legislatorFilters.searchTerm || legislatorFilters.chamber || legislatorFilters.party || legislatorFilters.district) && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {legislatorFilters.searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: {legislatorFilters.searchTerm}
            </span>
          )}
          {legislatorFilters.chamber && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Chamber: {legislatorFilters.chamber}
            </span>
          )}
          {legislatorFilters.party && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Party: {legislatorFilters.party}
            </span>
          )}
          {legislatorFilters.district && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              District: {legislatorFilters.district}
            </span>
          )}
        </div>
      )}
    </div>
  );
}