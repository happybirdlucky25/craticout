import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useBills, useBillSearch } from "@/hooks/useBills";
import { useCampaignOperations } from "@/hooks/useCampaigns";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Trash2, 
  Users, 
  FileText, 
  Upload,
  Download,
  Eye,
  X,
  Save,
  Clock,
  Brain,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";

// Enhanced Stakeholders Tab
export const StakeholdersTab = ({ 
  stakeholders, 
  onAdd, 
  onRemove, 
  onEdit 
}: {
  stakeholders: any[];
  onAdd: (stakeholder: any) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, stakeholder: any) => void;
}) => {
  const [newStakeholder, setNewStakeholder] = useState({
    name: "",
    organization: "",
    role: "",
    contact: "",
    tag: "neutral" as const,
    notes: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newStakeholder.name.trim()) {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        ...newStakeholder,
      });
      setNewStakeholder({ name: "", organization: "", role: "", contact: "", tag: "neutral", notes: "" });
      setShowAddForm(false);
      toast.success("Stakeholder added");
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'supporter': return 'bg-green-100 text-green-800 border-green-200';
      case 'opponent': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Campaign Stakeholders</h3>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stakeholder
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Stakeholder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newStakeholder.name}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                  placeholder="Stakeholder name"
                />
              </div>
              <div>
                <Label>Organization</Label>
                <Input
                  value={newStakeholder.organization}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, organization: e.target.value })}
                  placeholder="Organization name"
                />
              </div>
              <div>
                <Label>Role/Title</Label>
                <Input
                  value={newStakeholder.role}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                  placeholder="Role or title"
                />
              </div>
              <div>
                <Label>Contact</Label>
                <Input
                  value={newStakeholder.contact}
                  onChange={(e) => setNewStakeholder({ ...newStakeholder, contact: e.target.value })}
                  placeholder="Email or phone"
                />
              </div>
            </div>
            
            <div>
              <Label>Position</Label>
              <Select value={newStakeholder.tag} onValueChange={(value: any) => setNewStakeholder({ ...newStakeholder, tag: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supporter">Supporter</SelectItem>
                  <SelectItem value="opponent">Opponent</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newStakeholder.notes}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, notes: e.target.value })}
                placeholder="Add notes about this stakeholder..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Add Stakeholder</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {stakeholders.map((stakeholder) => (
          <Card key={stakeholder.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{stakeholder.name}</h4>
                    <Badge className={`${getTagColor(stakeholder.tag)} border text-xs`}>
                      {stakeholder.tag}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {stakeholder.organization && <div><strong>Organization:</strong> {stakeholder.organization}</div>}
                    {stakeholder.role && <div><strong>Role:</strong> {stakeholder.role}</div>}
                    {stakeholder.contact && <div><strong>Contact:</strong> {stakeholder.contact}</div>}
                    {stakeholder.notes && <div><strong>Notes:</strong> {stakeholder.notes}</div>}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove stakeholder?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove {stakeholder.name} from this campaign.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        onRemove(stakeholder.id);
                        toast.success("Stakeholder removed");
                      }}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stakeholders.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>No stakeholders added yet</p>
          <p className="text-sm">Add people and organizations relevant to your campaign</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Bills Tab with Real Search Integration
export const BillsTab = ({ 
  campaignId,
  bills, 
  onRemove, 
  onRefresh 
}: { 
  campaignId: string;
  bills: any[]; 
  onRemove: (id: string) => void;
  onRefresh: () => void;
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  // Use real bill search hook
  const { data: searchResults, loading: searchLoading } = useBillSearch(searchTerm);
  const { addBillToCampaign } = useCampaignOperations();

  const handleAddBill = async (bill: any) => {
    const success = await addBillToCampaign(campaignId, bill.bill_id);
    if (success) {
      toast.success("Bill added to campaign");
      onRefresh();
      setSearchTerm("");
    } else {
      toast.error("Failed to add bill to campaign");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'in committee': 
      case 'committee': return 'bg-yellow-100 text-yellow-800';
      case 'introduced': return 'bg-gray-100 text-gray-800';
      case 'failed':
      case 'vetoed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Campaign Bills</h3>
        
        {/* Real Bill Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Add Bills to Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills by title, number, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={() => setShowSearch(!showSearch)}
                variant={showSearch ? "default" : "outline"}
              >
                {showSearch ? "Hide Search" : "Show Search"}
              </Button>
            </div>
            
            {showSearch && searchTerm && (
              <div className="space-y-2">
                <Label>Search Results:</Label>
                {searchLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Searching bills...</p>
                  </div>
                ) : searchResults?.bills?.length > 0 ? (
                  searchResults.bills.map((bill: any) => (
                    <div key={bill.bill_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{bill.bill_number}</Badge>
                          <Badge className={`${getStatusColor(bill.status)} text-xs`}>
                            {bill.status || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="font-medium">{bill.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {bill.description && bill.description.length > 100 
                            ? `${bill.description.substring(0, 100)}...` 
                            : bill.description}
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleAddBill(bill)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))
                ) : searchTerm && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No bills found for "{searchTerm}"</p>
                    <p className="text-sm">Try different keywords or bill numbers</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Bills List */}
      <div>
        {bills?.length > 0 ? (
          <div className="space-y-4">
            {bills.map((campaignBill: any) => {
              const bill = campaignBill.bill || campaignBill;
              return (
                <Card key={campaignBill.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/bills/${bill.bill_id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{bill.bill_number}</Badge>
                          <Badge className={`${getStatusColor(bill.status)} text-xs`}>
                            {bill.status || 'Unknown'}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{bill.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          <div>{bill.description}</div>
                          {bill.last_action && (
                            <div>Last action: {bill.last_action} ({new Date(bill.last_action_date || '').toLocaleDateString()})</div>
                          )}
                          {campaignBill.notes && (
                            <div className="mt-1"><strong>Notes:</strong> {campaignBill.notes}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/bills/${bill.bill_id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove bill from campaign?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{bill.title}" from this campaign.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                onRemove(campaignBill.id);
                                toast.success("Bill removed from campaign");
                              }}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>No bills added to this campaign yet</p>
            <p className="text-sm">Search and add relevant legislation above</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Analysis Tab with Real File Upload Integration
export const AnalysisTab = ({ 
  campaignId,
  files, 
  bills, 
  reports,
  onRefresh
}: {
  campaignId: string;
  files: any[];
  bills: any[];
  reports: any[];
  onRefresh: () => void;
}) => {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [reportType, setReportType] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { uploadCampaignDocument, removeCampaignDocument } = useCampaignOperations();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.type !== 'application/pdf') {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 25 * 1024 * 1024) { // 25MB
      toast.error("File size must be less than 25MB");
      return;
    }

    if (files.length >= 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }

    // Real file upload
    setUploadProgress(0);
    const success = await uploadCampaignDocument(campaignId, file);
    
    if (success) {
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        onRefresh();
        toast.success("File uploaded successfully");
      }, 500);
    } else {
      setUploadProgress(null);
      toast.error("Failed to upload file");
    }
  };

  const handleGenerateReport = () => {
    if (selectedBills.length === 0 || !reportType) {
      toast.error("Please select at least one bill and a report type");
      return;
    }

    // Placeholder for AI report generation
    // TODO: Implement actual AI report generation
    toast.success("Report requested – AI analysis coming soon!");

    // Reset form
    setSelectedBills([]);
    setSelectedFiles([]);
    setReportType("");
  };

  const handleRemoveFile = async (fileId: string) => {
    const success = await removeCampaignDocument(fileId);
    if (success) {
      onRefresh();
      toast.success("File removed successfully");
    } else {
      toast.error("Failed to remove file");
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-8">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Supporting Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload PDF files (max 25MB each, 10 files total)
              </p>
            </label>
          </div>

          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files ({files.length}/10)</Label>
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveFile(file.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generate AI Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Bills *</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {bills.map((bill) => (
                <div key={bill.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bill-${bill.id}`}
                    checked={selectedBills.includes(bill.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBills([...selectedBills, bill.id]);
                      } else {
                        setSelectedBills(selectedBills.filter(id => id !== bill.id));
                      }
                    }}
                  />
                  <label htmlFor={`bill-${bill.id}`} className="text-sm font-medium cursor-pointer">
                    {bill.billNumber}: {bill.title}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Include Files (optional)</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`file-${file.id}`}
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFiles([...selectedFiles, file.id]);
                      } else {
                        setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                      }
                    }}
                  />
                  <label htmlFor={`file-${file.id}`} className="text-sm font-medium cursor-pointer">
                    {file.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategy">Strategy Memo</SelectItem>
                <SelectItem value="compliance">Compliance Review</SelectItem>
                <SelectItem value="stakeholder">Stakeholder Analysis</SelectItem>
                <SelectItem value="amendment">Amendment Proposal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerateReport}
            disabled={selectedBills.length === 0 || !reportType}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Generated Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{report.type}</div>
                  <div className="text-sm text-muted-foreground">
                    Generated {new Date(report.generatedDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                    {report.status === 'completed' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {report.status}
                  </Badge>
                  {report.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Notes Tab with Rich Text Editor
export const NotesTab = ({ 
  notes, 
  lastSaved, 
  onNotesChange,
  hasUnsavedChanges 
}: {
  notes: string;
  lastSaved: string | null;
  onNotesChange: (notes: string) => void;
  hasUnsavedChanges: boolean;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your campaign notes...',
      }),
    ],
    content: notes,
    onUpdate: ({ editor }) => {
      onNotesChange(editor.getHTML());
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Campaign Notes</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {hasUnsavedChanges ? (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>Unsaved changes</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Last saved at {new Date(lastSaved).toLocaleTimeString()}</span>
            </div>
          ) : null}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="prose prose-sm max-w-none min-h-[400px]">
            <EditorContent 
              editor={editor} 
              className="min-h-[400px] focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Notes auto-save every 10 seconds. You can use markdown formatting.
      </div>
    </div>
  );
};