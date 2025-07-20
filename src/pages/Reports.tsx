import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useReportInbox, useDeleteReport, useReportStats } from "@/hooks/useReportInbox";
import { formatBillNumber } from "@/utils/billNumberFormatter";
import type { ReportInboxWithBill } from "@/types/database";
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
  Filter,
  Calendar,
  ExternalLink,
  Copy,
  Globe
} from "lucide-react";

// Share functionality for reports
const shareReport = async (report: ReportInboxWithBill) => {
  try {
    const shareData = {
      title: `PoliUX Report: ${report.title}`,
      text: `${report.title}\n\nGenerated on ${new Date(report.date_created).toLocaleDateString()}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(
        `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
      );
      toast.success("Report link copied to clipboard");
    }
  } catch (err) {
    if (err instanceof Error && err.name !== 'AbortError') {
      toast.error("Failed to share report");
    }
  }
};

const InboxList = ({ 
  reports, 
  selectedReport, 
  onSelectReport,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  loading,
  onDeleteReport
}: {
  reports: ReportInboxWithBill[];
  selectedReport: ReportInboxWithBill | null;
  onSelectReport: (report: ReportInboxWithBill) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  loading: boolean;
  onDeleteReport: (reportId: string) => void;
}) => {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strategy memo': 
      case 'strategy': return <Brain className="h-4 w-4 text-blue-500" />;
      case 'compliance review':
      case 'compliance': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'stakeholder analysis': 
      case 'analysis': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'amendment proposal':
      case 'amendment': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const isExpiringSoon = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return expiry <= sevenDaysFromNow;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         report.report_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = filterType === 'all' || report.report_type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Report Inbox</h2>
          <Badge variant="secondary">
            {loading ? "Loading..." : `${filteredReports.length} of ${reports.length}`}
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports, campaigns, bill numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Strategy Memo">Strategy Memo</SelectItem>
              <SelectItem value="Compliance Review">Compliance Review</SelectItem>
              <SelectItem value="Stakeholder Analysis">Stakeholder Analysis</SelectItem>
              <SelectItem value="Amendment Proposal">Amendment Proposal</SelectItem>
              <SelectItem value="Summary">Summary</SelectItem>
              <SelectItem value="Comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No reports found</p>
              <p className="text-sm">
                {reports.length === 0 
                  ? "Generate your first AI report to see it here" 
                  : "Try adjusting your search or filters"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedReport?.id === report.id ? 'bg-muted border-primary' : ''
                  } ${isExpiringSoon(report.expiration_date) ? 'border-orange-200 bg-orange-50/50' : ''}`}
                  onClick={() => onSelectReport(report)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(report.report_type)}
                            <h4 className="font-medium text-sm truncate">
                              {report.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {report.report_type}
                            </Badge>
                            {report.bill_number && (
                              <Badge variant="secondary" className="text-xs">
                                {formatBillNumber(report.bill_number)}
                              </Badge>
                            )}
                            {isExpiringSoon(report.expiration_date) && (
                              <Badge variant="destructive" className="text-xs">
                                Expires in {getDaysUntilExpiration(report.expiration_date)} days
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteReport(report.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        {report.campaign_name && (
                          <div>Campaign: {report.campaign_name}</div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>{formatDate(report.date_created)}</span>
                          <span>
                            {report.bills_included} bill{report.bills_included !== 1 ? 's' : ''}
                            {report.files_used > 0 && `, ${report.files_used} file${report.files_used !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                      
                      {report.bill && (
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate">{report.bill.title}</span>
                          </div>
                        </div>
                      )}
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

const ReportViewer = ({ 
  report, 
  onDeleteReport 
}: { 
  report: ReportInboxWithBill | null;
  onDeleteReport: (reportId: string) => void;
}) => {
  if (!report) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Brain className="mx-auto h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select a Report</h3>
          <p>Choose a report from the inbox to view its contents</p>
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

  const getExpirationInfo = (expirationDate: string) => {
    const expiry = new Date(expirationDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { text: "Expired", color: "text-red-600", urgent: true };
    } else if (diffDays <= 7) {
      return { text: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`, color: "text-orange-600", urgent: true };
    } else {
      return { text: `Expires ${expiry.toLocaleDateString()}`, color: "text-muted-foreground", urgent: false };
    }
  };

  const handleShare = () => shareReport(report);
  
  const handleDownload = () => {
    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      onDeleteReport(report.id);
    }
  };

  const expirationInfo = getExpirationInfo(report.expiration_date);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">{report.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              {report.campaign_name && (
                <>
                  <span>Campaign: {report.campaign_name}</span>
                  <span>•</span>
                </>
              )}
              <span>Generated {formatDate(report.date_created)}</span>
              <span>•</span>
              <span>
                {report.bills_included} bill{report.bills_included !== 1 ? 's' : ''}
                {report.files_used > 0 && `, ${report.files_used} file${report.files_used !== 1 ? 's' : ''}`}
              </span>
              <span>•</span>
              <span className={expirationInfo.color}>
                <Calendar className="h-3 w-3 inline mr-1" />
                {expirationInfo.text}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{report.report_type}</Badge>
          {report.bill_number && (
            <Badge variant="secondary">
              {formatBillNumber(report.bill_number)}
            </Badge>
          )}
          {expirationInfo.urgent && (
            <Badge variant={expirationInfo.color.includes('red') ? 'destructive' : 'secondary'}>
              {expirationInfo.text}
            </Badge>
          )}
          {report.bill && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/bills/${report.bill_id}`, '_blank')}
              className="h-6 px-2 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Bill
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">
                {report.content}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const Inbox = () => {
  const { data: inboxData, loading, error, refetch } = useReportInbox(1, 50);
  const { deleteReport } = useDeleteReport();
  const { data: stats } = useReportStats();
  const [selectedReport, setSelectedReport] = useState<ReportInboxWithBill | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const reports = inboxData?.reports || [];

  const handleDeleteReport = async (reportId: string) => {
    const success = await deleteReport(reportId);
    if (success) {
      toast.success("Report deleted successfully");
      // Clear selection if deleted report was selected
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      // Refresh the inbox
      refetch();
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Inbox</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Report Inbox</h1>
            <p className="text-muted-foreground mt-1">
              AI-generated reports and analysis from your legislative research
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>{stats?.total_reports || 0} total reports</span>
            </div>
            {stats?.expiring_soon && stats.expiring_soon > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <Calendar className="h-4 w-4" />
                <span>{stats.expiring_soon} expiring soon</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={35} minSize={25} maxSize={50}>
            <InboxList
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              loading={loading}
              onDeleteReport={handleDeleteReport}
            />
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />
          
          <Panel defaultSize={65}>
            <ReportViewer 
              report={selectedReport} 
              onDeleteReport={handleDeleteReport}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default Inbox;