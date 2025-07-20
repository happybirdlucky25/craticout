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
import { useCampaign, useCampaignBills, useCampaignLegislators, useCampaignDocuments, useCampaignNotes } from "@/hooks/useCampaign";
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
  Target,
  Trash2
} from "lucide-react";
// Using inline tab components with real database data

const EditableTitleBar = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange,
  onDeleteCampaign
}: {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDeleteCampaign: () => void;
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                campaign and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteCampaign}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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

// Campaign Detail page now uses inline components with real database integration

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaign, loading, error, refetch, updateCampaign } = useCampaign(id || '');
  const { bills, loading: billsLoading } = useCampaignBills(id || '');
  const { legislators, loading: legislatorsLoading } = useCampaignLegislators(id || '');
  const { documents, loading: documentsLoading } = useCampaignDocuments(id || '');
  const { notes, loading: notesLoading, updateNotes } = useCampaignNotes(id || '');
  const [activeTab, setActiveTab] = useState("bills");
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);

  const handleTitleChange = async (newTitle: string) => {
    if (!campaign?.id) return;
    try {
      await updateCampaign({ name: newTitle });
      toast.success("Campaign title updated");
    } catch (error) {
      toast.error("Failed to update campaign title");
    }
  };

  const handleDescriptionChange = async (newDescription: string) => {
    if (!campaign?.id) return;
    try {
      await updateCampaign({ description: newDescription });
      toast.success("Campaign description updated");
    } catch (error) {
      toast.error("Failed to update campaign description");
    }
  };

  const handleDeleteCampaign = async () => {
    // TODO: Implement campaign deletion
    toast.success("Campaign deletion functionality coming soon");
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
            onDeleteCampaign={handleDeleteCampaign}
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
            {legislatorsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <Skeleton className="h-6 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Campaign Legislators</h3>
                  <p className="text-sm text-muted-foreground">
                    {legislators.length} legislators tracked
                  </p>
                </div>
                {legislators.length > 0 ? (
                  <div className="space-y-4">
                    {legislators.map((legislator) => (
                      <Card key={legislator.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{legislator.name}</h4>
                                <Badge variant="secondary">{legislator.role}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div><strong>Party:</strong> {legislator.party}</div>
                                <div><strong>Office:</strong> {legislator.office}</div>
                                {legislator.district && (
                                  <div><strong>District:</strong> {legislator.district}</div>
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
            )}
          </TabsContent>

          <TabsContent value="bills">
            {billsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4">
                      <Skeleton className="h-6 w-1/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Campaign Bills</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      {bills.length} bills tracked
                    </p>
                    <Button onClick={() => navigate('/search')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Add Bills
                    </Button>
                  </div>
                </div>
                {bills.length > 0 ? (
                  <div className="space-y-4">
                    {bills.map((campaignBill) => (
                      <Card key={campaignBill.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => navigate(`/bills/${campaignBill.bill_id}`)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{campaignBill.bill_number}</Badge>
                                <Badge variant="secondary">{campaignBill.priority}</Badge>
                                {campaignBill.status && (
                                  <Badge variant="outline">{campaignBill.status}</Badge>
                                )}
                              </div>
                              <h4 className="font-medium mb-1">{campaignBill.title}</h4>
                              <div className="text-sm text-muted-foreground">
                                {campaignBill.description && (
                                  <div className="mb-1">{campaignBill.description}</div>
                                )}
                                {campaignBill.notes && (
                                  <div className="text-blue-600"><strong>Campaign Notes:</strong> {campaignBill.notes}</div>
                                )}
                                {campaignBill.last_action_date && (
                                  <div>Last action: {new Date(campaignBill.last_action_date).toLocaleDateString()}</div>
                                )}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/bills/${campaignBill.bill_id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No bills added to this campaign yet</p>
                    <p className="text-sm">Go to Search to find and track bills for this campaign</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Campaign Analysis</h3>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {documents.length} documents uploaded
                  </p>
                </div>
              </div>
              {documentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{doc.file_name}</h4>
                            <div className="text-sm text-muted-foreground">
                              {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB • 
                              Uploaded {new Date(doc.uploaded_at || '').toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline">{doc.file_type}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">Upload documents to generate AI analysis and reports</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes">
            {notesLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Campaign Notes</h3>
                  {hasUnsavedNotes && (
                    <Badge variant="outline" className="text-orange-600">
                      Unsaved changes
                    </Badge>
                  )}
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <Textarea
                      placeholder="Add your campaign notes, strategy, and key insights here..."
                      value={notes?.content || ''}
                      onChange={(e) => {
                        updateNotes(e.target.value);
                        setHasUnsavedNotes(false);
                      }}
                      className="min-h-64 resize-none"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      {notes?.updated_at && (
                        <span>Last updated: {new Date(notes.updated_at).toLocaleString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
};

export default CampaignDetail;