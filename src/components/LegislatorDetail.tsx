import { useState, useEffect } from "react";
import { X, Phone, Mail, ExternalLink, Bell, FileText, Download, Share2, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAppStore } from "../store";
import type { Legislator } from "../store";

interface LegislatorDetailProps {
  legislator: Legislator;
  onClose: () => void;
}

// Mock data for demonstration
const mockCommittees = [
  "House Committee on Financial Services",
  "Subcommittee on Consumer Protection and Financial Institutions",
  "House Committee on Education and Labor"
];

const mockBillCounts = {
  sponsored: 12,
  cosponsored: 47
};

const mockRecentVotes = [
  { id: "1", bill: "H.R. 1234", title: "Infrastructure Investment Act", vote: "Yea", date: "2024-01-15" },
  { id: "2", bill: "S. 567", title: "Healthcare Reform Bill", vote: "Nay", date: "2024-01-10" },
  { id: "3", bill: "H.R. 890", title: "Education Funding Bill", vote: "Yea", date: "2024-01-05" }
];

const mockProfile = {
  summary: "A dedicated public servant with over 15 years of experience in state legislature. Known for bipartisan collaboration on infrastructure and education issues. Has authored significant legislation on renewable energy and small business support.",
  sources: [
    "Congressional Biography Database",
    "Ballotpedia.org",
    "OpenSecrets.org"
  ]
};

export function LegislatorDetail({ legislator, onClose }: LegislatorDetailProps) {
  const { isAuthenticated } = useAppStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const handleContactClick = (type: 'email' | 'phone', value: string) => {
    if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else if (type === 'phone') {
      window.location.href = `tel:${value}`;
    }
  };

  const handleSubscribeAlerts = () => {
    console.log('Subscribe to vote alerts for:', legislator.people_id);
  };

  const handleAddNote = () => {
    console.log('Add note for:', legislator.people_id);
  };

  const handleAssignToCampaign = () => {
    console.log('Assign to campaign:', legislator.people_id);
  };

  const handleExportPDF = () => {
    console.log('Export PDF for:', legislator.people_id);
  };

  const handleGenerateShareLink = () => {
    console.log('Generate share link for:', legislator.people_id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={legislator.photo} alt={legislator.name} />
              <AvatarFallback className="bg-gray-100">
                <Users className="h-8 w-8 text-gray-400" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{legislator.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getPartyColor(legislator.party)}>
                  {legislator.party || 'Unknown'}
                </Badge>
                <span className="text-muted-foreground">
                  {legislator.chamber} • {legislator.state}
                  {legislator.district && ` • District ${legislator.district}`}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="voting">Voting Record</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => handleContactClick('email', 'contact@example.com')}
                      >
                        contact@example.com
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => handleContactClick('phone', '(202) 555-0123')}
                      >
                        (202) 555-0123
                      </Button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <div className="flex space-x-4">
                        {legislator.ballotpedia && (
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => window.open(legislator.ballotpedia, '_blank')}
                          >
                            Ballotpedia
                          </Button>
                        )}
                        {legislator.opensecrets_id && (
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={() => window.open(`https://www.opensecrets.org/members-of-congress/summary?cid=${legislator.opensecrets_id}`, '_blank')}
                          >
                            OpenSecrets
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Committee Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Committee Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mockCommittees.map((committee, index) => (
                        <li key={index} className="text-sm">
                          • {committee}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* AI Profile Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed mb-4">
                      {mockProfile.summary}
                    </p>
                    <Separator className="my-3" />
                    <div className="text-xs text-muted-foreground">
                      <strong>Sources:</strong>
                      <ul className="mt-1 space-y-1">
                        {mockProfile.sources.map((source, index) => (
                          <li key={index}>• {source}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="voting" className="space-y-6">
                {/* Bill Counts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Legislative Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {mockBillCounts.sponsored}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bills Sponsored
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {mockBillCounts.cosponsored}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Bills Co-sponsored
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Votes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Roll-Call Votes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockRecentVotes.map((vote) => (
                        <div key={vote.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{vote.bill}</div>
                            <div className="text-sm text-muted-foreground">
                              {vote.title}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={vote.vote === 'Yea' ? 'default' : 'destructive'}>
                              {vote.vote}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {vote.date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                {isAuthenticated ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions & Collaboration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button onClick={handleSubscribeAlerts} className="w-full justify-start">
                        <Bell className="h-4 w-4 mr-2" />
                        Subscribe to Vote Alerts
                      </Button>
                      <Button onClick={handleAddNote} variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Add Private Note
                      </Button>
                      <Button onClick={handleAssignToCampaign} variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Assign to Campaign
                      </Button>
                      <Separator />
                      <Button onClick={handleExportPDF} variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export Profile as PDF
                      </Button>
                      <Button onClick={handleGenerateShareLink} variant="outline" className="w-full justify-start">
                        <Share2 className="h-4 w-4 mr-2" />
                        Generate Secure Share Link
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">Sign in to Access Actions</h3>
                        <p className="text-sm">
                          Create an account to track legislators, add notes, and collaborate on campaigns.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}