import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
  TrendingUp
} from "lucide-react";

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
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Fetch billing information
  const { data: billingInfo, isLoading } = useQuery<BillingInfo>({
    queryKey: ["/api/billing/info"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/billing/info");
      return await response.json();
    },
  });

  // Subscription plans
  const plans: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free",
      price: 0,
      billing: billingCycle,
      features: [
        "5 AI prompts per month",
        "Basic categories",
        "Standard templates",
        "Community support"
      ],
      limits: {
        prompts: 5,
        tokens: 1000,
        categories: 3
      },
      current: billingInfo?.currentPlan === "free"
    },
    {
      id: "starter",
      name: "Starter",
      price: billingCycle === "monthly" ? 14.99 : 149.9,
      billing: billingCycle,
      features: [
        "200 AI prompts per month",
        "All categories",
        "Email support",
        "Templates",
        "Basic analytics"
      ],
      limits: {
        prompts: 200,
        tokens: 50000,
        categories: 15
      },
      popular: true,
      current: billingInfo?.currentPlan === "starter"
    },
    {
      id: "pro",
      name: "Pro",
      price: billingCycle === "monthly" ? 49.99 : 499,
      billing: billingCycle,
      features: [
        "1000 AI prompts per month",
        "Advanced customization",
        "Priority support",
        "Analytics dashboard",
        "Export functionality"
      ],
      limits: {
        prompts: 1000,
        tokens: 250000,
        categories: 15
      },
      popular: false,
      current: billingInfo?.currentPlan === "pro"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: billingCycle === "monthly" ? 149.99 : 1499,
      billing: billingCycle,
      features: [
        "Unlimited AI prompts",
        "Custom categories",
        "Team collaboration",
        "API access",
        "White-label options",
        "Dedicated support",
        "Custom integrations"
      ],
      limits: {
        prompts: -1, // Unlimited
        tokens: -1,
        categories: -1
      },
      current: billingInfo?.currentPlan === "enterprise"
    }
  ];

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: async ({ planId, billing }: { planId: string; billing: string }) => {
      const response = await apiRequest("POST", "/api/billing/upgrade", {
        planId,
        billingCycle: billing
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Plan Updated",
          description: "Your subscription has been updated successfully",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription",
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

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free": return <Users className="w-5 h-5" />;
      case "pro": return <Star className="w-5 h-5" />;
      case "enterprise": return <Crown className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          {billingInfo && (
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
                <Badge className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Save 20%</Badge>
              </button>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? "border-indigo-500 border-2" : ""} ${plan.current ? "ring-2 ring-green-500" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                  </div>
                )}
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-600 text-white">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                    {getPlanIcon(plan.id)}
                  </div>
                  <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">${plan.price}</span>
                    <span className="text-slate-600 dark:text-slate-400">/{plan.billing === "monthly" ? "month" : "year"}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={plan.current || upgradeMutation.isPending}
                    className={`w-full ${plan.popular ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                  >
                    {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
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
                  <Button variant="outline" className="flex-1">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Update Payment Method
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
