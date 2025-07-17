import { useState, useEffect } from "react";
import { LegislatureToggle } from "../components/LegislatureToggle";
import { LegislatorSearch } from "../components/LegislatorSearch";
import { USMap } from "../components/USMap";
import { LegislatorList } from "../components/LegislatorList";
import { LegislatorDetail } from "../components/LegislatorDetail";
import { useAppStore } from "../store";
import type { Legislator } from "../store";

// Mock data for demonstration
const mockLegislators: Legislator[] = [
  {
    people_id: "1",
    name: "John Smith",
    first_name: "John",
    last_name: "Smith",
    party: "Democratic",
    role: "Representative",
    district: "5",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/John_Smith",
    opensecrets_id: "N00001234"
  },
  {
    people_id: "2",
    name: "Jane Doe",
    first_name: "Jane",
    last_name: "Doe",
    party: "Republican",
    role: "Senator",
    district: null,
    state: "IN",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Jane_Doe",
    opensecrets_id: "N00005678"
  },
  {
    people_id: "3",
    name: "Mike Johnson",
    first_name: "Mike",
    last_name: "Johnson",
    party: "Republican",
    role: "Representative",
    district: "3",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Mike_Johnson",
    opensecrets_id: "N00009012"
  },
  {
    people_id: "4",
    name: "Sarah Williams",
    first_name: "Sarah",
    last_name: "Williams",
    party: "Democratic",
    role: "Senator",
    district: null,
    state: "IN",
    chamber: "Senate",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Sarah_Williams",
    opensecrets_id: "N00003456"
  },
  {
    people_id: "5",
    name: "Tom Brown",
    first_name: "Tom",
    last_name: "Brown",
    party: "Republican",
    role: "Representative",
    district: "1",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Tom_Brown",
    opensecrets_id: "N00007890"
  },
  {
    people_id: "6",
    name: "Lisa Davis",
    first_name: "Lisa",
    last_name: "Davis",
    party: "Democratic",
    role: "Representative",
    district: "7",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Lisa_Davis",
    opensecrets_id: "N00001122"
  },
  {
    people_id: "7",
    name: "Robert Miller",
    first_name: "Robert",
    last_name: "Miller",
    party: "Republican",
    role: "Representative",
    district: "4",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Robert_Miller",
    opensecrets_id: "N00003344"
  },
  {
    people_id: "8",
    name: "Emily Taylor",
    first_name: "Emily",
    last_name: "Taylor",
    party: "Democratic",
    role: "Representative",
    district: "9",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Emily_Taylor",
    opensecrets_id: "N00005566"
  },
  {
    people_id: "9",
    name: "David Wilson",
    first_name: "David",
    last_name: "Wilson",
    party: "Republican",
    role: "Representative",
    district: "2",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/David_Wilson",
    opensecrets_id: "N00007788"
  },
  {
    people_id: "10",
    name: "Jennifer Garcia",
    first_name: "Jennifer",
    last_name: "Garcia",
    party: "Democratic",
    role: "Representative",
    district: "6",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Jennifer_Garcia",
    opensecrets_id: "N00009900"
  },
  {
    people_id: "11",
    name: "Michael Anderson",
    first_name: "Michael",
    last_name: "Anderson",
    party: "Republican",
    role: "Representative",
    district: "8",
    state: "IN",
    chamber: "House",
    photo: undefined,
    ballotpedia: "https://ballotpedia.org/Michael_Anderson",
    opensecrets_id: "N00002211"
  }
];

const Legislators = () => {
  const { legislators, setLegislators, loading, setLoading, legislatureLevel, selectedLegislator, setSelectedLegislator } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize with mock data
    if (!isInitialized) {
      setLoading('legislators', true);
      
      // Simulate API call
      setTimeout(() => {
        setLegislators(mockLegislators);
        setLoading('legislators', false);
        setIsInitialized(true);
      }, 1000);
    }
  }, [isInitialized, setLegislators, setLoading]);

  const handleLegislatorClick = (legislator: Legislator) => {
    setSelectedLegislator(legislator);
  };

  const handleCloseDetail = () => {
    setSelectedLegislator(null);
  };

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