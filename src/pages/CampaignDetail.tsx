import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaign, useCampaignOperations } from "@/hooks/useCampaigns";
import { useTrackedBills } from "@/hooks/useTracking";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Edit2, 
  AlertTriangle,
  Users,
  FileText,
  Brain,
  NotebookPen,
  Target
} from "lucide-react";
import { StakeholdersTab, BillsTab, AnalysisTab, NotesTab } from "@/components/CampaignTabs";

const EditableTitleBar = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange 
}: {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [tempDescription, setTempDescription] = useState(description);

  const handleTitleSubmit = () => {
    onTitleChange(tempTitle);
    setIsEditingTitle(false);
    toast.success("Campaign title updated");
  };

  const handleDescriptionSubmit = () => {
    onDescriptionChange(tempDescription);
    setIsEditingDescription(false);
    toast.success("Campaign description updated");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="text-3xl font-bold h-auto py-2 border-0 shadow-none focus-visible:ring-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTempTitle(title);
                  setIsEditingTitle(false);
                }
              }}
            />
            <Button size="sm" onClick={handleTitleSubmit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(false);
            }}>Cancel</Button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-3xl font-bold">{title}</h1>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingTitle(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-start gap-2">
        {isEditingDescription ? (
          <div className="flex-1 flex flex-col gap-2">
            <Textarea
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
              placeholder="Campaign description"
              className="resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleDescriptionSubmit}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => {
                setTempDescription(description);
                setIsEditingDescription(false);
              }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-start gap-2">
            <p className="text-muted-foreground flex-1">
              {description || "No description provided"}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingDescription(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// New Campaign Tab Components for Real Data Integration

const LegislatorsTab = ({ campaign }: { campaign: any }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Campaign Legislators</h3>
        <p className="text-sm text-muted-foreground">
          {campaign.legislator_count || 0} legislators tracked
        </p>
      </div>

      {campaign.legislators?.length > 0 ? (
        <div className="space-y-4">
          {campaign.legislators.map((legislator: any) => (
            <Card key={legislator.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{legislator.person?.name}</h4>
                      <Badge variant="secondary">{legislator.role}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div><strong>Party:</strong> {legislator.person?.party}</div>
                      <div><strong>Role:</strong> {legislator.person?.role}</div>
                      {legislator.person?.district && (
                        <div><strong>District:</strong> {legislator.person.district}</div>
                      )}
                      {legislator.notes && (
                        <div><strong>Notes:</strong> {legislator.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>No legislators added to this campaign yet</p>
          <p className="text-sm">Legislators are automatically added when you track bills with sponsors</p>
        </div>
      )}
    </div>
  );
};

const CampaignBillsTab = ({ campaign }: { campaign: any }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'signed': return 'bg-blue-100 text-blue-800';
      case 'in committee': 
      case 'committee': return 'bg-yellow-100 text-yellow-800';
      case 'introduced': return 'bg-gray-100 text-gray-800';
      case 'vetoed': return 'bg-red-100 text-red-800';
      case 'dead': 
      case 'failed': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Campaign Bills</h3>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {campaign.bill_count || 0} bills tracked
          </p>
          <Button onClick={() => navigate('/search')}>
            <FileText className="h-4 w-4 mr-2" />
            Add Bills
          </Button>
        </div>
      </div>

      {campaign.bills?.length > 0 ? (
        <div className="space-y-4">
          {campaign.bills.map((campaignBill: any) => {
            const bill = campaignBill.bill;
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
                        <Badge className={`${getStatusColor(bill.status || '')} text-xs`}>
                          {bill.status || 'Unknown'}
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-1">{bill.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        <div>{bill.description}</div>
                        {bill.last_action && (
                          <div>Last action: {bill.last_action} ({new Date(bill.last_action_date).toLocaleDateString()})</div>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/bills/${bill.bill_id}`)}
                    >
                      View Details
                    </Button>
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
          <p className="text-sm">Go to Search to find and track bills for this campaign</p>
        </div>
      )}
    </div>
  );
};

const CampaignAnalysisTab = ({ campaign }: { campaign: any }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI Analysis Tools</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generate AI Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>AI analysis tools coming soon</p>
            <p className="text-sm">Generate comprehensive reports from your tracked bills and legislators</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CampaignNotesTab = ({ campaign, onNotesChange, hasUnsavedChanges }: {
  campaign: any;
  onNotesChange: (notes: string) => void;
  hasUnsavedChanges: boolean;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Campaign Notes</h3>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <NotebookPen className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p>Note-taking functionality coming soon</p>
            <p className="text-sm">Rich text editor for campaign planning and strategy notes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, loading, error, refetch } = useCampaign(id || '');
  const { updateCampaign, removeBillFromCampaign } = useCampaignOperations();
  const [activeTab, setActiveTab] = useState("bills");
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);

  const handleTitleChange = async (newTitle: string) => {
    if (!campaign?.id) return;
    const success = await updateCampaign(campaign.id, { name: newTitle });
    if (!success) {
      toast.error("Failed to update campaign title");
    }
  };

  const handleDescriptionChange = async (newDescription: string) => {
    if (!campaign?.id) return;
    const success = await updateCampaign(campaign.id, { description: newDescription });
    if (!success) {
      toast.error("Failed to update campaign description");
    }
  };

  const handleNotesChange = useCallback((newNotes: string) => {
    setHasUnsavedNotes(true);
    // In real implementation, would update campaign notes
  }, []);

  const handleRemoveBill = async (campaignBillId: string) => {
    const success = await removeBillFromCampaign(campaignBillId);
    if (success) {
      refetch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/campaigns")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        
        {campaign && (
          <EditableTitleBar
            title={campaign.name}
            description={campaign.description || ''}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
          />
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Campaign</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
        </div>
      ) : campaign ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="legislators" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Legislators
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bills
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="legislators">
            <LegislatorsTab campaign={campaign} />
          </TabsContent>

          <TabsContent value="bills">
            <BillsTab 
              campaignId={campaign.id}
              bills={campaign.bills || []}
              onRemove={handleRemoveBill}
              onRefresh={refetch}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <CampaignAnalysisTab campaign={campaign} />
          </TabsContent>

          <TabsContent value="notes">
            <CampaignNotesTab 
              campaign={campaign}
              onNotesChange={handleNotesChange}
              hasUnsavedChanges={hasUnsavedNotes}
            />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
};

export default CampaignDetail;