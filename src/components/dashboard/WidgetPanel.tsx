import { TrackedBillsWidget } from "./widgets/TrackedBillsWidget";
import { TrackedLegislatorsWidget } from "./widgets/TrackedLegislatorsWidget";
import { CampaignsWidget } from "./widgets/CampaignsWidget";
import { UpcomingHearingsWidget } from "./widgets/UpcomingHearingsWidget";
import { SavedReportsWidget } from "./widgets/SavedReportsWidget";
import { BookmarksWidget } from "./widgets/BookmarksWidget";
import { RecentBillsByTrackedWidget } from "./widgets/RecentBillsByTrackedWidget";
import { NewBillsWidget } from "./widgets/NewBillsWidget";

export function WidgetPanel() {
  return (
    <div className="space-y-6">
      {/* Mobile Priority Order */}
      <div className="block lg:hidden">
        <CampaignsWidget />
      </div>
      
      <TrackedBillsWidget />
      <TrackedLegislatorsWidget />
      
      {/* Desktop shows campaigns here */}
      <div className="hidden lg:block">
        <CampaignsWidget />
      </div>
      
      <UpcomingHearingsWidget />
      <SavedReportsWidget />
      <BookmarksWidget />
      <RecentBillsByTrackedWidget />
      <NewBillsWidget />
    </div>
  );
}