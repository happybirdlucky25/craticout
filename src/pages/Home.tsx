import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  FileText, 
  Users, 
  TrendingUp, 
  Vote, 
  Calendar, 
  ArrowRight,
  Activity,
  Building2
} from "lucide-react";
import { useDashboardStats, useRecentActivity, useTrendingBills, useActiveLegislators } from "@/hooks/useDashboard";

const Home = () => {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: recentActivity, loading: activityLoading } = useRecentActivity(5);
  const { data: trendingBills, loading: billsLoading } = useTrendingBills(5);
  const { data: activeLegislators, loading: legislatorsLoading } = useActiveLegislators(5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            PoliUX Intelligence
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Real-time tracking of congressional bills, legislators, and legislative activity.
            AI-powered insights for informed civic engagement.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/search")}
              className="text-lg px-8 py-3"
            >
              Search Bills & Legislators
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-purple-600"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total_bills?.toLocaleString() || 0}</div>
              )}
              <p className="text-xs text-gray-500">All congressional bills tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bills</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.active_bills?.toLocaleString() || 0}</div>
              )}
              <p className="text-xs text-gray-500">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legislators</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.total_legislators?.toLocaleString() || 0}</div>
              )}
              <p className="text-xs text-gray-500">House & Senate members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Votes</CardTitle>
              <Vote className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats?.recent_votes?.toLocaleString() || 0}</div>
              )}
              <p className="text-xs text-gray-500">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">How PoliUX Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive legislative intelligence powered by real congressional data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Search & Track</h3>
                <p className="text-sm text-gray-600">
                  Find bills by topic, sponsor, or keyword across federal Congress with real-time data.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600">
                  Generate detailed reports and insights about voting patterns and legislative trends.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Monitor Activity</h3>
                <p className="text-sm text-gray-600">
                  Track legislator profiles, voting records, and sponsorship networks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Bills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Trending Bills
              </CardTitle>
              <CardDescription>
                Bills with recent activity and legislative action
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingBills.slice(0, 3).map((bill) => (
                    <div key={bill.bill_id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-sm">
                        {bill.bill_number} - {bill.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {bill.last_action}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {bill.status}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {bill.last_action_date}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/search")}>
                    View All Bills
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Legislators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Active Legislators
              </CardTitle>
              <CardDescription>
                Members with recent voting and legislative activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {legislatorsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {activeLegislators.slice(0, 3).map((legislator) => (
                    <div key={legislator.people_id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {legislator.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{legislator.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {legislator.party}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {legislator.role} - {legislator.district}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => navigate("/legislators")}>
                    View All Legislators
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Start Tracking Congress Today</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Get instant access to comprehensive legislative data, voting records, and AI-powered insights.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/search")}>
                Explore Bills & Legislators
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
                View Full Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;