import { useState, useEffect, useMemo } from "react";
import { LegislatureToggle } from "../components/LegislatureToggle";
import { LegislatorSearch } from "../components/LegislatorSearch";
import { USMap } from "../components/USMap";
import { LegislatorList } from "../components/LegislatorList";
import { LegislatorDetail } from "../components/LegislatorDetail";
import { useAppStore } from "../store";
import { useLegislators } from "@/hooks/useLegislators";
import type { Legislator } from "../store";
import type { PersonFilters } from "@/types/database";

// Configuration flag to switch between mock and real data
const USE_REAL_DATA = true; // Set to true to use real data, false for mock data

// Mock data for demonstration - Federal legislators from various states
const mockLegislators: Legislator[] = [
  {
    people_id: "1",
    name: "Alexandria Ocasio-Cortez",
    first_name: "Alexandria",
    last_name: "Ocasio-Cortez",
    party: "Democratic",
    role: "Representative",
    district: "14",
    state: "NY",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Alexandria_Ocasio-Cortez",
    opensecrets_id: "N00041162"
  },
  {
    people_id: "2",
    name: "Ted Cruz",
    first_name: "Ted",
    last_name: "Cruz",
    party: "Republican",
    role: "Senator",
    district: null,
    state: "TX",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Ted_Cruz",
    opensecrets_id: "N00033085"
  },
  {
    people_id: "3",
    name: "Nancy Pelosi",
    first_name: "Nancy",
    last_name: "Pelosi",
    party: "Democratic",
    role: "Representative",
    district: "11",
    state: "CA",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Nancy_Pelosi",
    opensecrets_id: "N00007360"
  },
  {
    people_id: "4",
    name: "Mitch McConnell",
    first_name: "Mitch",
    last_name: "McConnell",
    party: "Republican",
    role: "Senator",
    district: null,
    state: "KY",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Mitch_McConnell",
    opensecrets_id: "N00003389"
  },
  {
    people_id: "5",
    name: "Elizabeth Warren",
    first_name: "Elizabeth",
    last_name: "Warren",
    party: "Democratic",
    role: "Senator",
    district: null,
    state: "MA",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Elizabeth_Warren",
    opensecrets_id: "N00033492"
  },
  {
    people_id: "6",
    name: "Kevin McCarthy",
    first_name: "Kevin",
    last_name: "McCarthy",
    party: "Republican",
    role: "Representative",
    district: "20",
    state: "CA",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Kevin_McCarthy",
    opensecrets_id: "N00028152"
  },
  {
    people_id: "7",
    name: "Bernie Sanders",
    first_name: "Bernie",
    last_name: "Sanders",
    party: "Independent",
    role: "Senator",
    district: null,
    state: "VT",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Bernie_Sanders",
    opensecrets_id: "N00000528"
  },
  {
    people_id: "8",
    name: "Marco Rubio",
    first_name: "Marco",
    last_name: "Rubio",
    party: "Republican",
    role: "Senator",
    district: null,
    state: "FL",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Marco_Rubio",
    opensecrets_id: "N00030612"
  },
  {
    people_id: "9",
    name: "Katie Porter",
    first_name: "Katie",
    last_name: "Porter",
    party: "Democratic",
    role: "Representative",
    district: "47",
    state: "CA",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Katie_Porter",
    opensecrets_id: "N00041870"
  },
  {
    people_id: "10",
    name: "Josh Hawley",
    first_name: "Josh",
    last_name: "Hawley",
    party: "Republican",
    role: "Senator",
    district: null,
    state: "MO",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Josh_Hawley",
    opensecrets_id: "N00041620"
  },
  {
    people_id: "11",
    name: "Ilhan Omar",
    first_name: "Ilhan",
    last_name: "Omar",
    party: "Democratic",
    role: "Representative",
    district: "5",
    state: "MN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Ilhan_Omar",
    opensecrets_id: "N00043581"
  }
];

const Legislators = () => {
  const { legislators, setLegislators, loading, setLoading, legislatureLevel, selectedLegislator, setSelectedLegislator, legislatorFilters, selectedState } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Convert store filters to PersonFilters format for real API
  const personFilters = useMemo((): PersonFilters => {
    const filters: PersonFilters = {};
    
    if (legislatorFilters.search_term) {
      filters.search_term = legislatorFilters.search_term;
    }
    
    if (legislatorFilters.party) {
      filters.party = [legislatorFilters.party];
    }
    
    if (legislatorFilters.chamber) {
      filters.role = [legislatorFilters.chamber === 'House' ? 'Representative' : 'Senator'];
    }
    
    return filters;
  }, [legislatorFilters]);

  // Use real data hooks when enabled
  const { data: realLegislatorsData, loading: realLoading, error: realError } = useLegislators(
    USE_REAL_DATA ? personFilters : {}, 
    1, 
    50
  );

  useEffect(() => {
    if (USE_REAL_DATA) {
      // Use real data from hooks
      if (realLegislatorsData) {
        // Convert Person[] to Legislator[] format for compatibility
        const convertedLegislators: Legislator[] = realLegislatorsData.people.map(person => {
          // Extract state from district format like "HD-FL-4" -> "FL"
          let extractedState = 'Federal';
          if (person.district && person.district.includes('-')) {
            const parts = person.district.split('-');
            if (parts.length >= 2) {
              extractedState = parts[1]; // Get state abbreviation
            }
          }
          
          return {
            people_id: person.people_id,
            name: person.name,
            first_name: person.first_name,
            last_name: person.last_name,
            party: person.party,
            role: person.role,
            district: person.district,
            state: extractedState,
            chamber: person.role === 'Senator' ? 'Senate' : 'House',
            photo: undefined,
            ballotpedia: `https://ballotpedia.org/${person.name?.replace(/\s+/g, '_')}`,
            opensecrets_id: undefined
          };
        });
        
        setLegislators(convertedLegislators);
        setLoading('legislators', realLoading);
      }
    } else {
      // Initialize with mock data
      if (!isInitialized) {
        setLoading('legislators', true);
        
        // Simulate API call
        setTimeout(() => {
          setLegislators(mockLegislators);
          setLoading('legislators', false);
          setIsInitialized(true);
        }, 100);
      }
    }
  }, [USE_REAL_DATA, realLegislatorsData, realLoading, isInitialized, setLegislators, setLoading]);

  const handleLegislatorClick = (legislator: Legislator) => {
    setSelectedLegislator(legislator);
  };

  const handleCloseDetail = () => {
    setSelectedLegislator(null);
  };

  // Handle real data errors
  if (USE_REAL_DATA && realError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading legislators: {realError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading.legislators) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading legislators...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">
          {legislatureLevel === 'federal' ? 'Federal' : 'State'} Legislators
        </h1>
        <LegislatureToggle />
      </div>

      {/* Search Component */}
      <div className="mb-8">
        <LegislatorSearch />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Map */}
        <div className="lg:col-span-1">
          <USMap />
        </div>

        {/* Right Column - Legislator List */}
        <div className="lg:col-span-2">
          <LegislatorList
            legislators={legislators}
            onLegislatorClick={handleLegislatorClick}
          />
        </div>
      </div>

      {/* Legislator Detail Modal */}
      {selectedLegislator && (
        <LegislatorDetail
          legislator={selectedLegislator}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Legislators;