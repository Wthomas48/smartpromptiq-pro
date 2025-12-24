import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToStripeCheckout, stripeMode } from "@/lib/stripe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  CreditCard,
  Download,
  Users,
  Zap,
  Crown,
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
  ExternalLink,
  CheckCircle,
  GraduationCap,
  Rocket,
  Building2
} from "lucide-react";
import { PRICING_TIERS } from "@/config/pricing";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing: "monthly" | "yearly";
  features: string[];
  limits: {
    prompts: number;
    tokens: number;
    categories: number;
  };
  popular?: boolean;
  current?: boolean;
}

interface BillingInfo {
  currentPlan: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  usage: {
    prompts: number;
    tokens: number;
    categories: number;
  };
  paymentMethod?: {
    type: string;
    last4: string;
    expiry: string;
  };
}

export default function Billing() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle checkout success/cancel URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');
    const isTokenPurchase = urlParams.get('tokens');

    if (success === 'true' && sessionId) {
      setShowSuccessMessage(true);
      // Refresh billing data
      queryClient.invalidateQueries({ queryKey: ['/api/billing/info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/usage/current'] });

      toast({
        title: isTokenPurchase ? 'Tokens Purchased!' : 'Subscription Active!',
        description: isTokenPurchase
          ? 'Your tokens have been added to your account.'
          : 'Your subscription has been activated successfully.',
      });

      // Clean up URL
      window.history.replaceState({}, '', '/billing');
    } else if (canceled === 'true') {
      toast({
        title: 'Payment Canceled',
        description: 'Your payment was canceled. No charges were made.',
        variant: 'destructive',
      });
      // Clean up URL
      window.history.replaceState({}, '', '/billing');
    }
  }, [toast, queryClient]);

  // Fetch billing information
  const { data: billingInfo, isLoading, error } = useQuery<BillingInfo>({
    queryKey: ["/api/billing/info"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/billing/info");
      const result = await response.json();
      // Backend returns {success, data}, extract the data
      const apiData = result.data || result;

      // Transform backend data to frontend format
      return {
        currentPlan: apiData.user?.subscriptionTier?.toLowerCase() || "free",
        billingCycle: apiData.user?.billingCycle || "monthly",
        nextBillingDate: apiData.user?.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage: {
          prompts: apiData.user?.monthlyUsage?.tokensUsed || 0,
          tokens: apiData.user?.tokenBalance || 0,
          categories: 0 // Not tracked in backend yet
        },
        paymentMethod: apiData.stripe?.paymentMethod || undefined
      };
    },
    enabled: isAuthenticated, // Only fetch if user is authenticated
    retry: false
  });

  // Subscription plans - using centralized config
  const plans: SubscriptionPlan[] = PRICING_TIERS.map(tier => ({
    id: tier.id,
    name: tier.name,
    price: billingCycle === "monthly" ? tier.monthlyPrice / 100 : tier.yearlyPrice / 100,
    billing: billingCycle,
    features: tier.features.slice(0, 6), // Show first 6 features
    limits: {
      prompts: tier.limits.tokensPerMonth,
      tokens: tier.limits.tokensPerMonth * 1000,
      categories: tier.limits.teamMembers === -1 ? -1 : 15
    },
    popular: tier.popular || false,
    current: billingInfo?.currentPlan === tier.id ||
             (tier.id === 'academy_plus' && billingInfo?.currentPlan === 'academy')
  }));

  // Upgrade subscription mutation - uses Stripe.js redirectToCheckout
  // NO MOCK FALLBACKS - All errors are thrown properly
  const upgradeMutation = useMutation({
    mutationFn: async ({ planId, billing }: { planId: string; billing: string }) => {
      // Log checkout attempt
      console.log(`💳 Initiating Stripe Checkout for upgrade to: ${planId}, cycle: ${billing}`);
      console.log(`💳 Stripe Mode: ${stripeMode.toUpperCase()}`);

      // Use Stripe.js redirectToCheckout - NO MOCK FALLBACKS
      // Token is fetched automatically from localStorage('token') by the stripe module
      await redirectToStripeCheckout({
        tierId: planId,
        billingCycle: billing as 'monthly' | 'yearly',
      });

      // If redirect succeeds, this won't be reached
      return { success: true };
    },
    onError: (error: any) => {
      console.error('❌ Upgrade checkout failed:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Customer Portal mutation - for managing existing subscriptions
  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/billing/create-portal-session", {
        returnUrl: `${window.location.origin}/billing`
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create portal session');
      }
      return result;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Portal Access Failed",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (plan: SubscriptionPlan) => {
    upgradeMutation.mutate({
      planId: plan.id,
      billing: plan.billing
    });
  };

  const handleOpenPortal = () => {
    portalMutation.mutate();
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free": return <Users className="w-5 h-5" />;
      case "starter": return <Rocket className="w-5 h-5" />;
      case "academy_plus": return <GraduationCap className="w-5 h-5" />;
      case "pro": return <Star className="w-5 h-5" />;
      case "team_pro": return <Crown className="w-5 h-5" />;
      case "enterprise": return <Building2 className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // Show auth required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please sign in to view your billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/signin'}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Banner */}
          {showSuccessMessage && (
            <Card className="mb-8 border-green-500 bg-green-50 dark:bg-green-900/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Payment Successful!</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your payment has been processed. Your account has been updated.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Billing & Subscription
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Choose the perfect plan for your AI prompt generation needs
            </p>
          </div>

          {/* Current Usage */}
          {billingInfo && billingInfo.usage && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Current Usage
                </CardTitle>
                <CardDescription>
                  Your usage for the current billing period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Prompts Generated</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {billingInfo.usage.prompts} / {plans.find(p => p.current)?.limits.prompts === -1 ? "∞" : plans.find(p => p.current)?.limits.prompts}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(billingInfo.usage.prompts, plans.find(p => p.current)?.limits.prompts || 0)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Tokens Used</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {billingInfo.usage.tokens.toLocaleString()} / {plans.find(p => p.current)?.limits.tokens === -1 ? "∞" : plans.find(p => p.current)?.limits.tokens?.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(billingInfo.usage.tokens, plans.find(p => p.current)?.limits.tokens || 0)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Categories</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {billingInfo.usage.categories} / {plans.find(p => p.current)?.limits.categories === -1 ? "∞" : plans.find(p => p.current)?.limits.categories}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(billingInfo.usage.categories, plans.find(p => p.current)?.limits.categories || 0)} 
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === "yearly"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Save ~30%</Badge>
              </button>
            </div>
          </div>

          {/* Pricing Plans - 6 Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-indigo-500 border-2 scale-105" : ""} ${plan.current ? "ring-2 ring-green-500" : ""}`}>
                {plan.popular && !plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white text-xs">Most Popular</Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white text-xs">Current Plan</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2 text-indigo-600 dark:text-indigo-400">
                    {getPlanIcon(plan.id)}
                  </div>
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      ${plan.price % 1 === 0 ? plan.price : plan.price.toFixed(0)}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      /{plan.billing === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {plan.billing === "yearly" && plan.price > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      Save ~{Math.round((1 - plan.price / (PRICING_TIERS.find(t => t.id === plan.id)?.monthlyPrice || 1) / 100 * 12) * 100)}%
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-1 mb-4">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-3 h-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-indigo-600 ml-4">+{plan.features.length - 4} more</li>
                    )}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={plan.current || upgradeMutation.isPending || plan.price === 0}
                    className={`w-full text-xs py-2 ${plan.popular ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    size="sm"
                  >
                    {plan.current ? "Current" : plan.price === 0 ? "Free" : plan.id === "enterprise" ? "Contact Sales" : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Information */}
          {billingInfo?.paymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2 text-slate-900 dark:text-slate-100">Payment Method</h4>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CreditCard className="w-4 h-4" />
                      <span>{billingInfo.paymentMethod.type} ending in {billingInfo.paymentMethod.last4}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Expires {billingInfo.paymentMethod.expiry}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-slate-900 dark:text-slate-100">Next Billing Date</h4>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(billingInfo.nextBillingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleOpenPortal}
                    disabled={portalMutation.isPending}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {portalMutation.isPending ? 'Opening...' : 'Manage Subscription'}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
