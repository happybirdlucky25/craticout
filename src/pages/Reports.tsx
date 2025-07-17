import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Brain, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Download,
  Share,
  Archive,
  Trash2,
  Filter
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: string;
  status: "completed" | "processing" | "failed";
  campaignName: string;
  generatedDate: string;
  billCount: number;
  fileCount?: number;
  content: string;
  summary: string;
}

const mockReports: Report[] = [
  {
    id: "r1",
    title: "Clean Energy Strategy Analysis",
    type: "Strategy Memo",
    status: "completed",
    campaignName: "Clean Energy Initiative",
    generatedDate: "2024-01-15T14:30:00Z",
    billCount: 3,
    fileCount: 2,
    content: "# Clean Energy Strategy Analysis\n\n## Executive Summary\n\nBased on our analysis of 3 key bills in the clean energy space and 2 supporting documents, we've identified several strategic opportunities...\n\n## Key Findings\n\n1. **H.R. 1234 - Renewable Energy Investment Tax Credit Extension**\n   - High probability of passage in current session\n   - Strong bipartisan support in committee\n   - Recommend immediate stakeholder mobilization\n\n2. **S. 567 - Clean Energy Jobs and Innovation Act**\n   - Already passed Senate with strong margin\n   - House leadership supportive but timing uncertain\n   - Focus on industry coalition building\n\n3. **H.R. 2468 - Green Infrastructure Investment Act**\n   - Early stage but promising\n   - Need to build broader coalition\n   - Monitor for amendment opportunities\n\n## Strategic Recommendations\n\n### Short-term (30-60 days)\n- Schedule meetings with key House committee staff\n- Coordinate with Sierra Club and SEIA on unified messaging\n- Prepare testimony for upcoming hearings\n\n### Medium-term (60-120 days)\n- Launch public awareness campaign\n- Engage business community stakeholders\n- Monitor opposition messaging and prepare counter-narratives\n\n### Long-term (120+ days)\n- Prepare for implementation phase\n- Build state-level advocacy capacity\n- Plan celebration events for passage\n\n## Risk Assessment\n\n**High Risk**: Opposition from fossil fuel industry may intensify\n**Medium Risk**: Economic conditions could shift priorities\n**Low Risk**: Technical implementation challenges\n\n## Resource Requirements\n\n- Additional staff time: 20 hours/week\n- Budget allocation: $50,000 for Q2\n- Consultant support for technical analysis\n\n## Next Steps\n\n1. Review recommendations with campaign leadership\n2. Schedule stakeholder coordination meeting\n3. Update campaign timeline and milestones\n4. Begin drafting talking points for legislators",
    summary: "Strategic analysis of 3 clean energy bills revealing high passage probability for tax credit extension, need for coalition building on infrastructure investment, and timeline for coordinated advocacy efforts."
  },
  {
    id: "r2", 
    title: "Education Reform Compliance Review",
    type: "Compliance Review",
    status: "completed",
    campaignName: "Education Reform Coalition",
    generatedDate: "2024-01-14T09:15:00Z",
    billCount: 2,
    content: "# Education Reform Compliance Review\n\n## Overview\n\nThis compliance review examines 2 education bills for potential regulatory conflicts and implementation challenges...\n\n## Bills Analyzed\n\n### H.R. 3456 - Modern Education Standards Act\n- **Compliance Status**: Generally compliant with existing federal education law\n- **Potential Issues**: May conflict with state testing requirements in 12 states\n- **Recommendations**: Coordinate with state education departments early\n\n### S. 789 - Teacher Support and Development Act\n- **Compliance Status**: Requires coordination with Department of Education\n- **Potential Issues**: Funding mechanism may need adjustment\n- **Recommendations**: Engage with appropriations committees\n\n## Regulatory Analysis\n\n### Federal Requirements\n- IDEA compliance confirmed\n- Title IX considerations addressed\n- No FERPA conflicts identified\n\n### State Coordination\n- 15 states have compatible frameworks\n- 8 states will need legislative updates\n- 2 states may face constitutional challenges\n\n## Implementation Timeline\n\n**Phase 1** (Months 1-6): Federal rulemaking\n**Phase 2** (Months 7-18): State implementation planning\n**Phase 3** (Months 19-36): Full deployment\n\n## Risk Mitigation\n\n1. Early state engagement essential\n2. Technical assistance funding recommended\n3. Phased implementation reduces risk\n\n## Budget Implications\n\n- Federal implementation: $2.1B over 3 years\n- State coordination costs: $450M\n- Technical assistance: $75M\n\n## Conclusion\n\nBoth bills are implementable with proper coordination and adequate funding.",
    summary: "Compliance review of 2 education bills shows general federal compliance with need for state coordination and $2.6B implementation budget over 3 years."
  },
  {
    id: "r3",
    title: "Healthcare Stakeholder Analysis",
    type: "Stakeholder Analysis", 
    status: "processing",
    campaignName: "Healthcare Access Campaign",
    generatedDate: "2024-01-13T16:45:00Z",
    billCount: 1,
    fileCount: 1,
    content: "",
    summary: "Analyzing stakeholder positions and influence networks for healthcare access legislation."
  },
  {
    id: "r4",
    title: "Amendment Proposal Draft",
    type: "Amendment Proposal",
    status: "failed",
    campaignName: "Clean Energy Initiative", 
    generatedDate: "2024-01-12T11:20:00Z",
    billCount: 1,
    content: "",
    summary: "Failed to generate amendment proposal due to insufficient bill text analysis."
  }
];

const ReportsList = ({ 
  reports, 
  selectedReport, 
  onSelectReport,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType
}: {
  reports: Report[];
  selectedReport: Report | null;
  onSelectReport: (report: Report) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reports Inbox</h2>
          <Badge variant="secondary">
            {filteredReports.length} of {reports.length}
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Strategy Memo">Strategy Memo</SelectItem>
              <SelectItem value="Compliance Review">Compliance Review</SelectItem>
              <SelectItem value="Stakeholder Analysis">Stakeholder Analysis</SelectItem>
              <SelectItem value="Amendment Proposal">Amendment Proposal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No reports found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedReport?.id === report.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => onSelectReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(report.status)}
                            <h4 className="font-medium text-sm truncate">
                              {report.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {report.type}
                            </Badge>
                            <Badge className={`${getStatusColor(report.status)} text-xs border`}>
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Campaign: {report.campaignName}</div>
                        <div className="flex items-center justify-between">
                          <span>{formatDate(report.generatedDate)}</span>
                          <span>
                            {report.billCount} bill{report.billCount !== 1 ? 's' : ''}
                            {report.fileCount && `, ${report.fileCount} file${report.fileCount !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const ReportViewer = ({ report }: { report: Report | null }) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Brain className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a Report</h3>
          <p>Choose a report from the list to view its contents</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(report.status)}
              <h1 className="text-2xl font-bold">{report.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Campaign: {report.campaignName}</span>
              <span>•</span>
              <span>Generated {formatDate(report.generatedDate)}</span>
              <span>•</span>
              <span>
                {report.billCount} bill{report.billCount !== 1 ? 's' : ''}
                {report.fileCount && `, ${report.fileCount} file${report.fileCount !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">{report.type}</Badge>
          <Badge className={
            report.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
            report.status === 'processing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            'bg-red-100 text-red-800 border-red-200'
          }>
            {report.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {report.status === 'processing' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Report in Progress</h3>
              <p className="text-muted-foreground">Your AI report is being generated...</p>
              <p className="text-sm text-muted-foreground mt-2">This usually takes 2-5 minutes</p>
            </div>
          </div>
        ) : report.status === 'failed' ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 text-red-500" />
              <h3 className="text-lg font-medium mb-2">Report Generation Failed</h3>
              <p className="text-muted-foreground mb-4">
                We encountered an error while generating this report.
              </p>
              <Button>
                <Brain className="h-4 w-4 mr-2" />
                Retry Generation
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">
                  {report.content}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

const Reports = () => {
  const [reports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground mt-1">
              AI-generated analysis and insights from your campaigns
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-4 w-4" />
            <span>{reports.filter(r => r.status === 'completed').length} completed reports</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={35} minSize={25} maxSize={50}>
            <ReportsList
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterType={filterType}
              setFilterType={setFilterType}
            />
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />
          
          <Panel defaultSize={65}>
            <ReportViewer report={selectedReport} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Reports;