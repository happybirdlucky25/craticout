import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";
import { Loader2, CreditCard, Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { createPortalSession } from "../lib/stripe";
import { useAppStore } from "../store";

const Billing = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAppStore();

  const handleManageBilling = async () => {
    if (!user?.stripeCustomerId) {
      toast({
        title: "Error",
        description: "No billing information found. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const portalUrl = await createPortalSession(user.stripeCustomerId);
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Dashboard</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Billing</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your current subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold capitalize">
                  {user?.subscription || 'Free'} Plan
                </h3>
                <p className="text-sm text-gray-600">
                  {user?.subscription === 'premium' ? '$17/month' : 'No cost'}
                </p>
              </div>
              <Badge className={getStatusColor(user?.subscriptionStatus)}>
                {user?.subscriptionStatus ? 
                  user.subscriptionStatus.replace('_', ' ').toUpperCase() : 
                  'FREE'
                }
              </Badge>
            </div>

            {user?.subscription === 'premium' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Next Billing Date
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(user?.subscriptionEndsAt)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage in billing portal
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Management */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>
              Access your Stripe customer portal to manage billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Use the Stripe customer portal to:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Update payment methods</li>
              <li>• View billing history and invoices</li>
              <li>• Update billing address</li>
              <li>• Cancel or modify your subscription</li>
            </ul>

            <Button 
              onClick={handleManageBilling} 
              disabled={loading || !user?.stripeCustomerId}
              variant="outline"
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>

            {!user?.stripeCustomerId && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">No billing information</p>
                  <p className="text-yellow-700">
                    Subscribe to a premium plan to access billing management.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Features */}
        {user?.subscription === 'free' && (
          <Card>
            <CardHeader>
              <CardTitle>Upgrade to Premium</CardTitle>
              <CardDescription>
                Unlock advanced features with a Premium subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">Unlimited AI report generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">Track unlimited bills and legislators</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">Campaign analysis and AI memos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">Export reports as PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">Priority support</span>
                </div>
              </div>
              
              <Button asChild className="w-full mt-6">
                <a href="/pricing">View Pricing Plans</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Contact support for billing questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              If you have questions about your subscription or billing, our support team is here to help.
            </p>
            <Button variant="outline" asChild>
              <a href="/contact">Contact Support</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;