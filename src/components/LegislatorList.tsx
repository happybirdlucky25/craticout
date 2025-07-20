import { useState, useMemo, useEffect } from "react";
import { LegislatorCard } from "./LegislatorCard";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "../store";
import type { Legislator } from "../store";

interface LegislatorListProps {
  legislators: Legislator[];
  onLegislatorClick: (legislator: Legislator) => void;
}

const ITEMS_PER_PAGE = 10;

export function LegislatorList({ legislators, onLegislatorClick }: LegislatorListProps) {
  const { legislatorFilters, selectedState, legislatureLevel } = useAppStore();
  const [currentPage, setCurrentPage] = useState(1);

  // Filter legislators based on current filters
  const filteredLegislators = useMemo(() => {
    let filtered = legislators;

    // Apply search filter
    if (legislatorFilters.searchTerm) {
      const searchTerm = legislatorFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(legislator => 
        legislator.name.toLowerCase().includes(searchTerm) ||
        legislator.first_name?.toLowerCase().includes(searchTerm) ||
        legislator.last_name?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply chamber filter
    if (legislatorFilters.chamber) {
      filtered = filtered.filter(legislator => 
        legislator.chamber === legislatorFilters.chamber
      );
    }

    // Apply party filter
    if (legislatorFilters.party) {
      filtered = filtered.filter(legislator => 
        legislator.party === legislatorFilters.party
      );
    }

    // Apply district filter
    if (legislatorFilters.district) {
      filtered = filtered.filter(legislator => 
        legislator.district === legislatorFilters.district
      );
    }

    // Apply state filter from search or map selection
    const stateToFilter = legislatorFilters.state || selectedState;
    if (stateToFilter) {
      filtered = filtered.filter(legislator => 
        legislator.state === stateToFilter
      );
    }

    return filtered;
  }, [legislators, legislatorFilters, selectedState]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLegislators.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLegislators = filteredLegislators.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [legislatorFilters, selectedState]);

  if (filteredLegislators.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
        <div className="text-gray-500">
          <div className="text-lg font-medium mb-2">No legislators found</div>
          <div className="text-sm">
            Try adjusting your search criteria or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredLegislators.length)} of {filteredLegislators.length} {legislatureLevel} legislators
            {selectedState && ` in ${selectedState}`}
          </div>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Legislator Cards */}
      <div className="grid gap-4">
        {currentLegislators.map((legislator) => (
          <LegislatorCard
            key={legislator.people_id}
            legislator={legislator}
            onCardClick={onLegislatorClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNumber)}
                    className="w-10 h-10 p-0"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}