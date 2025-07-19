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
import { useCampaigns, useCampaignOperations } from "@/hooks/useCampaigns";
import { toast } from "sonner";
import { Plus, Users, Calendar, FileText, Target } from "lucide-react";

const NewCampaignModal = ({ onRefresh }: { onRefresh: () => void }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { createCampaign, loading } = useCampaignOperations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const result = await createCampaign({
        name: formData.name,
        description: formData.description,
      });
      
      if (result) {
        toast.success("Campaign created successfully");
        setFormData({ name: "", description: "" });
        setOpen(false);
        onRefresh();
      } else {
        toast.error("Failed to create campaign");
      }
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

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief campaign description"
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
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
            {campaign.bill_count || 0} bills
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {campaign.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {campaign.legislator_count || 0} legislators
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Updated {formatDate(campaign.updated_at)}
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
  const { data: campaigns, loading, error, refetch } = useCampaigns();

  if (loading) {
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

      {error ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-600">Error Loading Campaigns</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      <NewCampaignModal onRefresh={refetch} />
    </div>
  );
};

export default Campaigns;