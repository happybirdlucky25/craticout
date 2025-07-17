import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/Skeleton";
import { useAppStore } from "@/store";
import { Plus, Users, Calendar, FileText } from "lucide-react";

const NewCampaignModal = ({ onCreateCampaign }: { onCreateCampaign: (campaign: any) => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    company: "",
    description: "",
    goals: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreateCampaign({
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        title: formData.title,
        company: formData.company,
        description: formData.description,
        goals: formData.goals,
        billCount: 0,
        updated: new Date().toISOString(),
        stakeholders: [],
        bills: [],
        files: [],
        reports: [],
        notes: "",
        lastSaved: null,
      });
      setFormData({ name: "", title: "", company: "", description: "", goals: "" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter campaign name"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Your Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Policy Director"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company/Organization</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Advocacy Group Inc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief campaign description"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goals">Campaign Goals</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="What do you hope to achieve with this campaign?"
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create Campaign
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CampaignCard = ({ campaign }: { campaign: any }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/campaigns/${campaign.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-2">{campaign.name}</CardTitle>
          <Badge variant="secondary">
            {campaign.billCount} bills
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {campaign.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {campaign.stakeholders.length} stakeholders
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Updated {formatDate(campaign.updated)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = () => (
  <div className="text-center py-12">
    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <FileText className="h-10 w-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
    <p className="text-muted-foreground mb-4">
      Create your first campaign to start tracking legislation and building stakeholder networks.
    </p>
    <p className="text-sm text-muted-foreground">
      Click the + button to get started
    </p>
  </div>
);

const Campaigns = () => {
  const { campaigns, loading, setCampaigns } = useAppStore();
  const [localCampaigns, setLocalCampaigns] = useState([
    {
      id: "1",
      name: "Clean Energy Initiative",
      description: "Tracking renewable energy legislation and building coalition support for climate action.",
      billCount: 8,
      updated: "2024-01-15T10:30:00Z",
      stakeholders: ["Sierra Club", "Solar Energy Industries Association", "Rep. Johnson"]
    },
    {
      id: "2", 
      name: "Education Reform Coalition",
      description: "Advocating for increased education funding and curriculum modernization.",
      billCount: 12,
      updated: "2024-01-14T14:20:00Z",
      stakeholders: ["Teachers Union", "School Board Association", "Sen. Williams"]
    },
    {
      id: "3",
      name: "Healthcare Access Campaign",
      description: "Expanding healthcare access and reducing prescription drug costs for seniors.",
      billCount: 5,
      updated: "2024-01-13T09:15:00Z",
      stakeholders: ["AARP", "Medical Association", "Rep. Davis"]
    }
  ]);

  const handleCreateCampaign = (newCampaign: any) => {
    setLocalCampaigns([...localCampaigns, newCampaign]);
    setCampaigns([...campaigns, newCampaign]);
  };

  const displayCampaigns = localCampaigns.length > 0 ? localCampaigns : campaigns;

  if (loading.campaigns) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Campaigns</h1>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Organize your legislative tracking and stakeholder engagement
          </p>
        </div>
      </div>

      {displayCampaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <NewCampaignModal onCreateCampaign={handleCreateCampaign} />
    </div>
  );
};

export default Campaigns;