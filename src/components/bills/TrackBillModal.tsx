
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBillTrackingManager } from "@/hooks/useBillTrackingManager";

interface TrackBillModalProps {
  billId: string;
  billTitle: string;
  billNumber: string;
}

export const TrackBillModal = ({ billId, billTitle, billNumber }: TrackBillModalProps) => {
  const {
    isModalOpen,
    setIsModalOpen,
    notes,
    setNotes,
    selectedCampaign,
    setSelectedCampaign,
    campaigns,
    campaignsLoading,
    campaignsError,
    trackBill,
    loading
  } = useBillTrackingManager(billId);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track Bill: {billNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{billTitle}</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Add to Campaign (optional)</label>
            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign or track individually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Track individually</SelectItem>
                {campaignsLoading ? (
                  <SelectItem value="loading" disabled>Loading campaigns...</SelectItem>
                ) : campaignsError ? (
                  <SelectItem value="error" disabled>Error loading campaigns</SelectItem>
                ) : (
                  campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this bill..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={trackBill} className="flex-1" disabled={loading}>
              {loading ? "Tracking..." : "Start Tracking"}
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
