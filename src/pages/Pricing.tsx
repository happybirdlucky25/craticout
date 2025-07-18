import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useToast } from "../components/ui/use-toast";
import { Check, X, Star, Zap, Loader2 } from "lucide-react";
import { useStripe } from "@stripe/react-stripe-js";
import { createCheckoutSession, stripeConfig } from "../lib/stripe";
import { useAppStore } from "../store";

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const { toast } = useToast();
  const { user } = useAppStore();

  const handleUpgrade = async () => {
    if (!stripe) {
      toast({
        title: "Error",
        description: "Stripe is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create checkout session with your backend
      const sessionId = await createCheckoutSession(
        stripeConfig.PREMIUM_PRICE_ID,
        user?.stripeCustomerId
      );

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      name: "Bill Tracking",
      free: "Up to 10 bills",
      premium: "Unlimited bills",
      freeIncluded: true,
      premiumIncluded: true
    },
    {
      name: "Legislator Following",
      free: "Up to 5 legislators",
      premium: "Unlimited legislators",
      freeIncluded: true,
      premiumIncluded: true
    },
    {
      name: "AI Report Generation",
      free: "5 reports per month",
      premium: "Unlimited AI reports",
      freeIncluded: true,
      premiumIncluded: true
    },
    {
      name: "Campaign Analysis",
      free: false,
      premium: "Advanced AI memos",
      freeIncluded: false,
      premiumIncluded: true
    },
    {
      name: "Export to PDF",
      free: false,
      premium: "Save and export all reports",
      freeIncluded: false,
      premiumIncluded: true
    },
    {
      name: "Priority Support",
      free: false,
      premium: "Email & chat support",
      freeIncluded: false,
      premiumIncluded: true
    },
    {
      name: "Advanced Analytics",
      free: false,
      premium: "Detailed insights & trends",
      freeIncluded: false,
      premiumIncluded: true
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Dashboard</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Pricing</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full power of legislative intelligence with unlimited access to AI analysis, 
            advanced reporting, and priority support.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-blue-600">$17</span>
            <span className="text-gray-500">/month</span>
            <Badge variant="secondary">Most Popular</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-500" />
                Free Plan
              </CardTitle>
              <CardDescription>
                Perfect for getting started with legislative tracking
              </CardDescription>
              <div className="text-2xl font-bold">$0<span className="text-sm font-normal text-gray-500">/month</span></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.freeIncluded ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className={`text-sm ${feature.freeIncluded ? 'text-gray-900' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                      {feature.free && (
                        <div className="text-xs text-gray-500 mt-1">
                          {feature.free}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-blue-200 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-600 text-white">Recommended</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Premium Plan
              </CardTitle>
              <CardDescription>
                For professionals who need unlimited access and advanced features
              </CardDescription>
              <div className="text-2xl font-bold text-blue-600">
                $17<span className="text-sm font-normal text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">
                        {feature.name}
                      </span>
                      {feature.premium && (
                        <div className="text-xs text-gray-500 mt-1">
                          {feature.premium}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleUpgrade} 
                disabled={loading || user?.subscription === 'premium'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : user?.subscription === 'premium' ? (
                  'Current Plan'
                ) : (
                  'Upgrade with Stripe'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Why Choose Premium?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Unlimited AI Analysis</h4>
              <p className="text-sm text-gray-600">
                Generate unlimited AI reports and insights on bills, voting patterns, and legislative trends.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Advanced Tracking</h4>
              <p className="text-sm text-gray-600">
                Track unlimited bills and legislators with advanced filtering and notification options.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Priority Support</h4>
              <p className="text-sm text-gray-600">
                Get priority email and chat support to help you maximize your legislative intelligence.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue to have access to Premium features until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">
                We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-sm text-gray-600">
                Our Free plan gives you access to core features. You can upgrade to Premium at any time to unlock unlimited access and advanced features.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to upgrade your legislative intelligence?
          </h3>
          <p className="text-gray-600 mb-6">
            Join thousands of professionals who rely on ShadowCongress Premium for their legislative tracking needs.
          </p>
          <Button 
            onClick={handleUpgrade} 
            disabled={loading || user?.subscription === 'premium'}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : user?.subscription === 'premium' ? (
              'You are Premium!'
            ) : (
              'Start Premium Today - $17/month'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;