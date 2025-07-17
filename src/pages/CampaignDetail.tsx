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
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Edit2, 
  AlertTriangle
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

// Components are now in separate file for better organization

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState({
    id: "1",
    name: "Clean Energy Initiative",
    description: "Tracking renewable energy legislation and building coalition support for climate action.",
    title: "Policy Director",
    company: "Environmental Action Group",
    goals: "Advance comprehensive clean energy legislation and build bipartisan support for renewable energy initiatives.",
    stakeholders: [
      {
        id: "1",
        name: "Jane Smith",
        organization: "Sierra Club",
        role: "Policy Director",
        contact: "jane@sierraclub.org",
        tag: "supporter" as const,
        notes: "Key ally on renewable energy policy. Has strong relationships with House Democrats."
      },
      {
        id: "2",
        name: "Bob Johnson",
        organization: "Solar Energy Industries Association",
        role: "Legislative Manager",
        contact: "bob@seia.org",
        tag: "supporter" as const,
        notes: "Industry perspective on solar initiatives. Good source for technical details."
      },
      {
        id: "3",
        name: "Mark Wilson",
        organization: "Fossil Fuel Coalition",
        role: "Director",
        contact: "mark@ffc.org",
        tag: "opponent" as const,
        notes: "Likely to oppose most renewable energy initiatives. Monitor their messaging."
      }
    ],
    bills: [
      {
        id: "1",
        billNumber: "H.R. 1234",
        title: "Renewable Energy Investment Tax Credit Extension",
        status: "In Committee",
        sponsor: "Rep. Williams",
        chamber: "House",
        lastAction: "Referred to Ways and Means Committee",
        lastActionDate: "2024-01-15"
      },
      {
        id: "2",
        billNumber: "S. 567",
        title: "Clean Energy Jobs and Innovation Act",
        status: "Passed Senate",
        sponsor: "Sen. Johnson",
        chamber: "Senate",
        lastAction: "Passed by voice vote",
        lastActionDate: "2024-01-20"
      }
    ],
    files: [
      {
        id: "f1",
        name: "Clean Energy Policy Analysis.pdf",
        size: 2.4,
        uploadDate: "2024-01-10",
        url: "/files/f1.pdf"
      },
      {
        id: "f2", 
        name: "Stakeholder Mapping Document.pdf",
        size: 1.8,
        uploadDate: "2024-01-12",
        url: "/files/f2.pdf"
      }
    ],
    reports: [
      {
        id: "r1",
        type: "Strategy Memo",
        status: "completed",
        generatedDate: "2024-01-15",
        billIds: ["1", "2"],
        fileIds: ["f1"],
        content: "# Strategic Analysis\n\nBased on current legislative landscape..."
      }
    ],
    notes: "# Campaign Planning Notes\n\n## Key Priorities\n- Focus on bipartisan support\n- Engage industry stakeholders early\n- Monitor opposition messaging\n\n## Next Steps\n- Schedule meeting with Rep. Williams staff\n- Prepare testimony for committee hearing",
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: false
  });

  const [activeTab, setActiveTab] = useState("stakeholders");
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState(false);

  const handleTitleChange = (newTitle: string) => {
    setCampaign(prev => ({ ...prev, name: newTitle }));
  };

  const handleDescriptionChange = (newDescription: string) => {
    setCampaign(prev => ({ ...prev, description: newDescription }));
  };

  const handleAddStakeholder = (stakeholder: any) => {
    setCampaign(prev => ({
      ...prev,
      stakeholders: [...prev.stakeholders, stakeholder]
    }));
  };

  const handleRemoveStakeholder = (stakeholderId: string) => {
    setCampaign(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter(s => s.id !== stakeholderId)
    }));
  };

  const handleEditStakeholder = (stakeholderId: string, updatedStakeholder: any) => {
    setCampaign(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.map(s => 
        s.id === stakeholderId ? { ...s, ...updatedStakeholder } : s
      )
    }));
  };

  const handleRemoveBill = (billId: string) => {
    setCampaign(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== billId)
    }));
  };

  const handleAddBill = (bill: any) => {
    setCampaign(prev => ({
      ...prev,
      bills: [...prev.bills, bill]
    }));
  };

  const handleFileUpload = (file: File) => {
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size / (1024 * 1024), // Convert to MB
      uploadDate: new Date().toISOString(),
      url: URL.createObjectURL(file) // In real app, this would be the uploaded file URL
    };
    
    setCampaign(prev => ({
      ...prev,
      files: [...prev.files, newFile]
    }));
  };

  const handleFileRemove = (fileId: string) => {
    setCampaign(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  };

  const handleGenerateReport = (data: any) => {
    const newReport = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.reportType,
      status: "processing",
      generatedDate: new Date().toISOString(),
      billIds: data.billIds,
      fileIds: data.fileIds || [],
      content: ""
    };

    setCampaign(prev => ({
      ...prev,
      reports: [...prev.reports, newReport]
    }));

    // Simulate processing
    setTimeout(() => {
      setCampaign(prev => ({
        ...prev,
        reports: prev.reports.map(r => 
          r.id === newReport.id 
            ? { ...r, status: "completed", content: "# Analysis Report\n\nGenerated analysis content..." }
            : r
        )
      }));
    }, 3000);
  };

  const handleNotesChange = useCallback((newNotes: string) => {
    setCampaign(prev => ({ ...prev, notes: newNotes }));
    setHasUnsavedNotes(true);
  }, []);

  // Auto-save notes every 10 seconds
  useEffect(() => {
    if (!hasUnsavedNotes) return;

    const timer = setTimeout(() => {
      setCampaign(prev => ({ 
        ...prev, 
        lastSaved: new Date().toISOString() 
      }));
      setHasUnsavedNotes(false);
      // In real app, make API call here
    }, 10000);

    return () => clearTimeout(timer);
  }, [campaign.notes, hasUnsavedNotes]);

  // Warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedNotes) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedNotes]);

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
        
        <EditableTitleBar
          title={campaign.name}
          description={campaign.description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="stakeholders">
          <StakeholdersTab
            stakeholders={campaign.stakeholders}
            onAdd={handleAddStakeholder}
            onRemove={handleRemoveStakeholder}
            onEdit={handleEditStakeholder}
          />
        </TabsContent>

        <TabsContent value="bills">
          <BillsTab
            bills={campaign.bills}
            onRemove={handleRemoveBill}
            onAddBill={handleAddBill}
          />
        </TabsContent>

        <TabsContent value="analysis">
          <AnalysisTab
            files={campaign.files}
            bills={campaign.bills}
            reports={campaign.reports}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            onGenerateReport={handleGenerateReport}
          />
        </TabsContent>

        <TabsContent value="notes">
          <NotesTab
            notes={campaign.notes}
            lastSaved={campaign.lastSaved}
            onNotesChange={handleNotesChange}
            hasUnsavedChanges={hasUnsavedNotes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetail;