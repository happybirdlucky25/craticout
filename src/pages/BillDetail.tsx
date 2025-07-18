import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatBillNumber } from "@/utils/billNumberFormatter";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Heart, 
  BookmarkPlus, 
  Share, 
  Mail, 
  FileText, 
  Users, 
  Calendar,
  ExternalLink,
  Download,
  Zap,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Building
} from "lucide-react";

// Mock bill data based on the JSON structure
const mockBillData = {
  "status": "OK",
  "bill": {
    "bill_id": 1678901,
    "state": "US",
    "session": {
      "session_id": 2050,
      "name": "118th Congress (2025‑2026)",
      "year_start": 2025,
      "year_end": 2026
    },
    "bill_number": "HR987",
    "bill_type": "resolution",
    "body": "H",
    "current_body": "H",
    "title": "A resolution supporting the development of a national AI‑safety framework",
    "description": "Expresses the sense of the House that the United States should prioritize creation of a comprehensive artificial‑intelligence safety framework.",
    "status": "Introduced",
    "status_date": "2025‑03‑01",
    "introduced_date": "2025‑02‑28",
    "last_action": "Referred to the House Committee on Science, Space, and Technology",
    "last_action_date": "2025‑03‑01",
    "sponsors": [
      {
        "people_id": 41234,
        "name": "Rep. Jane Doe",
        "first_name": "Jane",
        "last_name": "Doe",
        "party": "D",
        "role": "Primary Sponsor"
      },
      {
        "people_id": 51277,
        "name": "Rep. John Smith",
        "first_name": "John",
        "last_name": "Smith",
        "party": "R",
        "role": "Co‑Sponsor"
      }
    ],
    "history": [
      { "date": "2025‑02‑28", "action": "Filed" },
      { "date": "2025‑03‑01", "action": "Referred to Committee on Science, Space, and Technology" }
    ],
    "texts": [
      {
        "doc_id": 908771,
        "date": "2025‑02‑28",
        "type": "Introduced",
        "mime": "application/pdf",
        "url": "https://legiscan.com/US/text/HR987/id/908771"
      }
    ],
    "votes": [
      {
        "roll_call_id": 62011,
        "date": "2025‑03‑15",
        "motion": "Adopt Resolution",
        "yeas": 224,
        "nays": 206,
        "absent": 3,
        "url": "https://legiscan.com/US/rollcall/HR987/id/62011"
      }
    ],
    "amendments": [
      {
        "amendment_id": 12055,
        "date": "2025‑03‑12",
        "title": "Amendment clarifying federal‑state collaboration",
        "description": "Adds language requiring consultation with state regulators.",
        "status": "Adopted"
      }
    ],
    "committees": [
      {
        "committee_id": 2580,
        "name": "House Committee on Science, Space, and Technology",
        "chamber": "House"
      }
    ],
    "subjects": ["Artificial Intelligence", "Technology assessment", "Federal‑state relations"],
    "urls": {
      "legiscan": "https://legiscan.com/US/bill/HR987/2025",
      "congress": "https://www.congress.gov/bill/118th-congress-house-resolution/987",
      "openstates": null
    },
    "change_hash": "37d2c3b0e5c1194d9f0f0a6a4ab55d2",
    "updated": "2025‑03‑17T14:10:22Z"
  }
};

const BillHeader = ({ bill }: { bill: any }) => {
  const [isTracked, setIsTracked] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800 border-green-200';
      case 'signed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'introduced': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in committee': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vetoed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Bill URL copied to clipboard");
  };

  const handleTrack = () => {
    if (isTracked) {
      setIsTracked(false);
      toast.success("Bill removed from tracking");
    } else {
      setShowTrackModal(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {formatBillNumber(bill.bill_number)}
          </Badge>
          <Badge className={`${getStatusColor(bill.status)} border`}>
            {bill.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {bill.session.name}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowContactModal(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Contact Sponsor
          </Button>
          <Button 
            variant={isTracked ? "default" : "outline"} 
            size="sm"
            onClick={handleTrack}
          >
            {isTracked ? (
              <Heart className="h-4 w-4 mr-2 fill-current" />
            ) : (
              <BookmarkPlus className="h-4 w-4 mr-2" />
            )}
            {isTracked ? "Tracked" : "Track Bill"}
          </Button>
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-2">{bill.title}</h1>
        <p className="text-lg text-muted-foreground">{bill.description}</p>
      </div>

      <TrackBillModal 
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        onConfirm={() => {
          setIsTracked(true);
          setShowTrackModal(false);
          toast.success("Bill added to tracking");
        }}
        bill={bill}
      />

      <ContactSponsorModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        sponsors={bill.sponsors}
      />
    </div>
  );
};

const TrackBillModal = ({ isOpen, onClose, onConfirm, bill }: any) => {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  
  const campaigns = [
    { id: "1", name: "Clean Energy Initiative" },
    { id: "2", name: "Education Reform Coalition" },
    { id: "3", name: "Healthcare Access Campaign" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track {formatBillNumber(bill.bill_number)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add this bill to a campaign or track it individually:
          </p>
          <div className="font-medium">{bill.title}</div>
          
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
            <Button onClick={onConfirm} className="flex-1">
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

const ContactSponsorModal = ({ isOpen, onClose, sponsors }: any) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Bill Sponsors</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {sponsors.map((sponsor: any) => (
            <Card key={sponsor.people_id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{sponsor.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant={sponsor.party === 'D' ? 'default' : 'secondary'} className="w-6 h-6 p-0 text-xs">
                        {sponsor.party}
                      </Badge>
                      {sponsor.role}
                    </div>
                  </div>
                  <Button size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OverviewTab = ({ bill }: { bill: any }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalVotes = bill.votes.length > 0 ? 
    bill.votes[0].yeas + bill.votes[0].nays + bill.votes[0].absent : 0;

  return (
    <div className="space-y-8">
      {/* Key Information */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Key Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Introduced:</span>
              <span>{formatDate(bill.introduced_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Action:</span>
              <span>{formatDate(bill.last_action_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status Date:</span>
              <span>{formatDate(bill.status_date)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Committees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bill.committees.map((committee: any) => (
              <div key={committee.committee_id} className="text-sm">
                <div className="font-medium">{committee.name}</div>
                <div className="text-muted-foreground">{committee.chamber}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bill.subjects.map((subject: string) => (
                <Badge key={subject} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sponsors ({bill.sponsors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {bill.sponsors.map((sponsor: any) => (
              <div key={sponsor.people_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{sponsor.name}</div>
                  <div className="text-sm text-muted-foreground">{sponsor.role}</div>
                </div>
                <Badge variant={sponsor.party === 'D' ? 'default' : 'secondary'} className="w-8 h-8 p-0">
                  {sponsor.party}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Votes */}
      {bill.votes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Votes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bill.votes.map((vote: any) => (
              <div key={vote.roll_call_id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{vote.motion}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(vote.date)}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={vote.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </a>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">Yeas: {vote.yeas}</span>
                    <span className="text-red-600 font-medium">Nays: {vote.nays}</span>
                    <span className="text-gray-600">Absent: {vote.absent}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress 
                      value={(vote.yeas / totalVotes) * 100} 
                      className="h-2 bg-red-100"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((vote.yeas / totalVotes) * 100).toFixed(1)}% Yes</span>
                      <span>{((vote.nays / totalVotes) * 100).toFixed(1)}% No</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Amendments */}
      {bill.amendments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amendments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bill.amendments.map((amendment: any) => (
              <div key={amendment.amendment_id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{amendment.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {amendment.description}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatDate(amendment.date)}
                    </div>
                  </div>
                  <Badge 
                    variant={amendment.status === 'Adopted' ? 'default' : 'secondary'}
                    className="ml-4"
                  >
                    {amendment.status === 'Adopted' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {amendment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Legislative History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bill.history.map((item: any, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  {index < bill.history.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="font-medium">{item.action}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(item.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {bill.urls.legiscan && (
              <Button variant="outline" size="sm" asChild>
                <a href={bill.urls.legiscan} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  LegiScan
                </a>
              </Button>
            )}
            {bill.urls.congress && (
              <Button variant="outline" size="sm" asChild>
                <a href={bill.urls.congress} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Congress.gov
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FullTextTab = ({ bill }: { bill: any }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Bill Documents</h3>
        {bill.texts.length > 0 ? (
          <div className="space-y-4">
            {bill.texts.map((text: any) => (
              <Card key={text.doc_id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{text.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(text.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={text.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Online
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={text.url} download>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No bill text documents available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AIReportTab = ({ bill }: { bill: any }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState("summary");
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Mock generation delay
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("AI report generated successfully");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Tools
          </CardTitle>
          <CardDescription>
            Generate comprehensive AI-powered analysis of this legislation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Quick Summary</SelectItem>
                <SelectItem value="fiscal">Fiscal Impact Analysis</SelectItem>
                <SelectItem value="opinion">Public Opinion Assessment</SelectItem>
                <SelectItem value="strategy">Strategy Memo</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Report...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate AI Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground italic">
              Click "Generate AI Report" above to create an AI-powered analysis of this bill.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  const bill = mockBillData.bill;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate("/")} className="hover:text-foreground">
          Home
        </button>
        <span>/</span>
        <button onClick={() => navigate("/search")} className="hover:text-foreground">
          Search
        </button>
        <span>/</span>
        <span>Bill Detail</span>
      </div>

      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Bill Header */}
      <BillHeader bill={bill} />

      <Separator className="my-8" />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fulltext">Full Text</TabsTrigger>
          <TabsTrigger value="aireport">AI Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab bill={bill} />
        </TabsContent>

        <TabsContent value="fulltext">
          <FullTextTab bill={bill} />
        </TabsContent>

        <TabsContent value="aireport">
          <AIReportTab bill={bill} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillDetail;