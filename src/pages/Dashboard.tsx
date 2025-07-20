import { useEffect } from "react";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { NewsfeedSection } from "../components/newsfeed/NewsfeedSection";
import { WidgetPanel } from "../components/dashboard/WidgetPanel";
import { useAppStore } from "../store";

const Dashboard = () => {
  const { isAuthenticated, user } = useAppStore();

  useEffect(() => {
    // Auto-refresh dashboard every 15 minutes
    const refreshInterval = setInterval(() => {
      // Trigger refresh for all components
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Dashboard is now accessible to everyone

  return (
    <div className="bg-gray-50">
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - News Feed (takes 2/3 width on desktop) */}
          <div className="lg:col-span-2 order-1">
            <NewsfeedSection maxArticles={18} />
          </div>
          
          {/* Right Column - Widgets (takes 1/3 width on desktop) */}
          <div className="lg:col-span-1 order-2">
            <WidgetPanel />
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Dashboard;