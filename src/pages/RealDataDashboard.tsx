import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Vote, 
  Calendar, 
  ArrowRight,
  Activity,
  Building2
} from "lucide-react";
import { useDashboardStats, useRecentActivity, useTrendingBills, useActiveLegislators } from "../hooks/useDashboard";
import { Link } from "react-router-dom";

const RealDataDashboard = () => {
  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: recentActivity, loading: activityLoading } = useRecentActivity(5);
  const { data: trendingBills, loading: billsLoading } = useTrendingBills(5);
  const { data: activeLegislators, loading: legislatorsLoading } = useActiveLegislators(5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Shadow Congress Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time tracking of congressional bills, legislators, and legislative activity.
            Ask questions, get AI-powered insights, and stay informed about what's happening in Congress.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/search">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Search Bills & Legislators
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" size="lg">
                View Reports
              </Button>
            </Link>
          </div>
        </div>

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
              <p className="text-xs text-gray-500">All congressional bills</p>
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

        {/* Main Content Grid */}
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
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingBills.map((bill) => (
                    <div key={bill.bill_id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
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
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/search">Search All Bills</Link>
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
                  {[...Array(5)].map((_, i) => (
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
                  {activeLegislators.map((legislator) => (
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
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/legislators">View All Legislators</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Legislative Activity
            </CardTitle>
            <CardDescription>
              Latest actions and updates from Congress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-2 w-2 rounded-full mt-2" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>{activity.bill_title}</strong> - {activity.action_description}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/reports">View Full Reports</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Browse Bills</h3>
              <p className="text-sm text-gray-600 mb-4">
                Search and filter congressional bills by status, committee, and topic
              </p>
              <Button asChild className="w-full">
                <Link to="/search">Explore Bills</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Find Legislators</h3>
              <p className="text-sm text-gray-600 mb-4">
                View profiles, voting records, and sponsored legislation
              </p>
              <Button asChild className="w-full">
                <Link to="/legislators">View Legislators</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Vote className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Voting Records</h3>
              <p className="text-sm text-gray-600 mb-4">
                Analyze voting patterns and roll call results
              </p>
              <Button asChild className="w-full">
                <Link to="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealDataDashboard;