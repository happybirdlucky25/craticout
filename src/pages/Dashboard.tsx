import { useEffect } from "react";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { NewsFeed } from "../components/dashboard/NewsFeed";
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to ShadowCongress</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access your dashboard</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <DashboardLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - News Feed (takes 2/3 width on desktop) */}
          <div className="lg:col-span-2 order-1">
            <NewsFeed />
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