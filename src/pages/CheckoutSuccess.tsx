import { useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useAppStore } from "../store";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, updateSubscription } = useAppStore();
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // If we have a successful checkout, update the user's subscription
    if (success === 'true' && sessionId) {
      // In a real app, you'd verify the session with your backend
      // For now, we'll optimistically update to premium
      updateSubscription({
        subscription: 'premium',
        subscriptionStatus: 'active'
      });
    }
  }, [success, sessionId, updateSubscription]);

  // If not a success page, redirect
  if (success !== 'true') {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Premium!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your subscription has been successfully activated. You now have access to all Premium features.
          </p>

          {/* Features Card */}
          <Card className="text-left mb-8">
            <CardHeader>
              <CardTitle>What's Included in Premium</CardTitle>
              <CardDescription>
                You now have access to these powerful features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Unlimited AI report generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Track unlimited bills and legislators</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Campaign analysis and AI memos</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Save and export reports as PDF</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Priority email and chat support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/dashboard">
                Start Exploring
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/billing">Manage Subscription</a>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-8">
            Questions about your subscription? Visit our{" "}
            <a href="/billing" className="text-blue-600 hover:underline">
              billing page
            </a>{" "}
            or{" "}
            <a href="/contact" className="text-blue-600 hover:underline">
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;