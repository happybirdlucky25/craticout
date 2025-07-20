import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, BellOff, FileText, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAppStore } from "../store";
import { useLegislatorTracking } from "@/hooks/useTracking";
import { toast } from "sonner";
import type { Legislator } from "../store";

interface LegislatorCardProps {
  legislator: Legislator;
  onCardClick: (legislator: Legislator) => void;
}

export function LegislatorCard({ legislator, onCardClick }: LegislatorCardProps) {
  const { isAuthenticated } = useAppStore();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const { trackLegislator, untrackLegislator, isTracking: checkTracking, loading } = useLegislatorTracking();

  const getPartyColor = (party: string | null) => {
    if (!party) return "bg-gray-100 text-gray-800";
    switch (party.toLowerCase()) {
      case 'democratic':
      case 'democrat':
        return "bg-blue-100 text-blue-800";
      case 'republican':
        return "bg-red-100 text-red-800";
      case 'independent':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Check tracking status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      if (legislator.people_id) {
        const tracked = await checkTracking(legislator.people_id);
        setIsTracking(tracked);
      }
    };
    checkStatus();
  }, [legislator.people_id, checkTracking]);

  const handleTrackClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please log in to track legislators");
      return;
    }

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

  const handleAddNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement add note functionality
    console.log('Add note for legislator:', legislator.people_id);
  };

  const handleExternalLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const handleCardClick = () => {
    navigate(`/legislators/${legislator.people_id}`);
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={legislator.photo} alt={legislator.name} />
            <AvatarFallback className="bg-gray-100">
              <User className="h-8 w-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg truncate">{legislator.name}</h3>
              
              {/* Quick Action Icons - shown on hover for authenticated users */}
              {isAuthenticated && isHovered && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTrackClick}
                    disabled={loading}
                    className="h-8 w-8 p-0"
                    title={isTracking ? 'Stop tracking' : 'Track legislator'}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isTracking ? (
                      <BellOff className="h-4 w-4 text-red-600" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddNoteClick}
                    className="h-8 w-8 p-0"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Party Badge */}
            <Badge className={`${getPartyColor(legislator.party)} mb-2`}>
              {legislator.party || 'Unknown'}
            </Badge>

            {/* Enhanced Details Display */}
            <div className="space-y-2 text-sm">
              {/* Role and State on one line */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">{legislator.role || 'Representative'}</span>
              </div>
              
              {/* District prominently displayed */}
              {legislator.district && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">District:</span>
                  <span className="font-medium text-blue-600">{legislator.district}</span>
                </div>
              )}
              
              {/* State */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">State:</span>
                <span className="font-medium">{legislator.state || 'Federal'}</span>
              </div>
              
              {/* Chamber */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Chamber:</span>
                <span className="font-medium">{legislator.chamber || 'House'}</span>
              </div>
            </div>

            {/* External Links */}
            <div className="flex space-x-2 mt-3">
              {legislator.ballotpedia && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleExternalLinkClick(e, legislator.ballotpedia)}
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ballotpedia
                </Button>
              )}
              {legislator.opensecrets_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleExternalLinkClick(e, `https://www.opensecrets.org/members-of-congress/summary?cid=${legislator.opensecrets_id}`)}
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  OpenSecrets
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}