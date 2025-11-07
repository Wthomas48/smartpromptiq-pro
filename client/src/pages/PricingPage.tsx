import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import PricingCard from '@/components/pricing/PricingCard';
import TokenPurchase from '@/components/pricing/TokenPurchase';
import UsageTracker from '@/components/UsageTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Users, 
  CreditCard,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  tokensPerMonth: number;
  features: string[];
  rateLimits: {
    promptsPerDay: number;
    promptsPerHour: number;
    apiCallsPerMinute: number;
  };
  support: string;
}

interface TokenPackage {
  key: string;
  tokens: number;
  priceInCents: number;
  pricePerToken: number;
  stripeId: string;
  savings: number;
}

export default function PricingPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Parse URL parameters for upgrade context
  const [upgradeContext, setUpgradeContext] = useState<{
    tier?: string;
    feature?: string;
    template?: string;
  }>({});

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('upgrade');
    const feature = urlParams.get('feature');
    const template = urlParams.get('template');
    const tab = urlParams.get('tab');

    // Set active tab if specified
    if (tab && ['subscriptions', 'tokens', 'usage'].includes(tab)) {
      setActiveTab(tab);
    }

    if (tier || feature || template) {
      setUpgradeContext({ tier, feature, template });

      // Show context-aware message
      if (tier && feature === 'template') {
        toast({
          title: "Upgrade to Access Premium Templates",
          description: `Unlock all premium templates with ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan!`,
          duration: 5000,
        });
      } else if (tier) {
        toast({
          title: "Upgrade Recommended",
          description: `Consider upgrading to ${tier.charAt(0).toUpperCase() + tier.slice(1)} for enhanced features!`,
          duration: 5000,
        });
      }
    }
  }, [toast]);

  // Mock pricing tiers data
  const mockTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      billingCycle: billingCycle,
      features: [
        '3 Academy courses (basics)',
        'First lesson of each course',
        '5 playground tests',
        'Community support'
      ],
      limits: {
        tokensPerMonth: 5,
        maxTokenRollover: 0,
        teamMembers: 1,
        apiCalls: 0
      },
      rateLimits: {
        promptsPerDay: 5,
        promptsPerHour: 2,
        apiCallsPerMinute: 0
      },
      support: 'Community'
    },
    {
      id: 'academy',
      name: 'Academy Only',
      description: 'Perfect for students and learners',
      price: billingCycle === 'yearly' ? 24000 : 2900, // $240/year (save $108) or $29/month
      billingCycle: billingCycle,
      badge: 'For Learners',
      features: [
        'All 57 courses + 555 lessons',
        'Audio learning & quizzes',
        'Earn certificates',
        '50 playground tests/month',
        'Community forum access',
        'Email support'
      ],
      limits: {
        tokensPerMonth: 0, // No Pro tool prompts
        maxTokenRollover: 0,
        teamMembers: 1,
        apiCalls: 0
      },
      rateLimits: {
        promptsPerDay: 0,
        promptsPerHour: 0,
        apiCallsPerMinute: 0
      },
      support: 'Email'
    },
    {
      id: 'starter',
      name: 'Pro',
      description: 'Full platform: Academy + Pro Tools',
      price: billingCycle === 'yearly' ? 40800 : 4900, // $408/year (save $180) or $49/month
      billingCycle: billingCycle,
      popular: true,
      badge: 'Most Popular',
      buttonLabel: 'Choose Plan',
      features: [
        '✨ Everything in Academy, PLUS:',
        '200 AI prompts per month',
        '50+ professional templates',
        'Advanced analytics',
        'Priority email support',
        'Export & integrations'
      ],
      limits: {
        tokensPerMonth: 200,
        maxTokenRollover: 50,
        teamMembers: 1,
        apiCalls: 100
      },
      rateLimits: {
        promptsPerDay: 50,
        promptsPerHour: 10,
        apiCallsPerMinute: 5
      },
      support: 'Email'
    },
    {
      id: 'team',
      name: 'Team Pro',
      description: 'For small teams (2-5 people)',
      price: billingCycle === 'yearly' ? 82800 : 9900, // $828/year (save $360) or $99/month
      billingCycle: billingCycle,
      badge: 'Best for Teams',
      features: [
        '✨ Everything in Pro, PLUS:',
        '1,000 AI prompts/month (5x more)',
        '2-5 team member seats',
        'Team collaboration workspace',
        '100 API calls/month',
        'Priority chat support'
      ],
      limits: {
        tokensPerMonth: 1000,
        maxTokenRollover: 200,
        teamMembers: 5,
        apiCalls: 100
      },
      rateLimits: {
        promptsPerDay: 200,
        promptsPerHour: 50,
        apiCallsPerMinute: 20
      },
      support: 'Priority'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large teams and organizations',
      price: billingCycle === 'yearly' ? 299900 : 29900, // $2,999/year or $299/month
      billingCycle: billingCycle,
      badge: 'Contact Sales',
      features: [
        '✨ Everything in Team Pro, PLUS:',
        '5,000+ AI prompts/month',
        'Unlimited team members',
        'Custom branding & certificates',
        'White-label options',
        'Dedicated account manager',
        'SSO & advanced security'
      ],
      limits: {
        tokensPerMonth: 5000,
        maxTokenRollover: 1000,
        teamMembers: -1, // Unlimited
        apiCalls: 10000
      },
      rateLimits: {
        promptsPerDay: 500,
        promptsPerHour: 100,
        apiCallsPerMinute: 100
      },
      support: '24/7'
    }
  ];

  // Use mock data instead of API calls
  const tiers = mockTiers;
  const tiersLoading = false;

  // Mock token packages
  const mockTokenPackages: TokenPackage[] = [
    {
      key: 'small',
      tokens: 25,
      priceInCents: 499,
      pricePerToken: 19.96,
      stripeId: 'price_tokens_25',
      savings: 0
    },
    {
      key: 'medium',
      tokens: 100,
      priceInCents: 1799,
      pricePerToken: 17.99,
      stripeId: 'price_tokens_100',
      savings: 10
    },
    {
      key: 'large',
      tokens: 500,
      priceInCents: 7999,
      pricePerToken: 16.00,
      stripeId: 'price_tokens_500',
      savings: 20
    },
    {
      key: 'bulk',
      tokens: 1000,
      priceInCents: 14999,
      pricePerToken: 15.00,
      stripeId: 'price_tokens_1000',
      savings: 25
    }
  ];

  const tokenPackages = mockTokenPackages;
  const packagesLoading = false;

  // Mock current subscription and usage data
  const currentSubscription = isAuthenticated ? {
    tier: 'free',
    billingCycle: 'monthly',
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  } : null;

  const usageData = isAuthenticated ? {
    tokenBalance: 3,
    tokensUsed: 2,
    tokensLimit: 5,
    periodStart: new Date().toISOString(),
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  } : null;

  const subscriptionLoading = false;

  // Create subscription mutation (mock for demo)
  const createSubscription = useMutation({
    mutationFn: async ({ tierId, billingCycle }: { tierId: string; billingCycle: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, tierId, billingCycle };
    },
    onSuccess: (data) => {
      toast({
        title: 'Demo Mode',
        description: `This is a demo. In production, you would be redirected to payment for ${data.tierId} (${data.billingCycle}).`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Subscription Failed',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      });
    },
  });

  const handleTierSelect = (tierId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to subscribe to a plan',
        variant: 'destructive',
      });
      return;
    }

    createSubscription.mutate({ tierId, billingCycle });
  };

  const handleTokenPurchaseComplete = (tokensAdded: number) => {
    queryClient.invalidateQueries({ queryKey: ['/api/usage/current'] });
    queryClient.invalidateQueries({ queryKey: ['/api/billing/info'] });
  };

  const calculateYearlySavings = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0; // Free tier has no savings
    const yearlyPrice = monthlyPrice * 10; // 10 months for yearly (2 months free)
    const monthlySavings = (monthlyPrice * 12) - yearlyPrice;
    return Math.round((monthlySavings / (monthlyPrice * 12)) * 100);
  };

  // Add current plan info to tiers
  const enhancedTiers = tiers.map(tier => ({
    ...tier,
    current: currentSubscription?.tier === tier.id,
    savings: billingCycle === 'yearly' ? calculateYearlySavings(tier.price) : 0,
    highlighted: upgradeContext.tier === tier.id // Highlight recommended tier
  }));

  // Debug logging
  console.log('PricingPage Debug:', {
    tiersLoading,
    tiersCount: tiers?.length,
    enhancedTiersCount: enhancedTiers?.length,
    billingCycle,
    upgradeContext,
    isAuthenticated
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-indigo-600 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Learn Prompt Engineering. Build AI Tools. All in One Platform.
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Choose Academy Only for education, Pro for full platform access, or Team Pro for collaboration.
              Start free or choose a plan that scales with your needs.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button variant="outline" asChild>
                <a href="/auth/sign-in">Sign In to View Your Usage</a>
              </Button>
              <Button asChild>
                <a href="/auth/sign-up">Get Started Free</a>
              </Button>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white p-1 rounded-lg border shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-green-100 text-green-800">2 Months Free</Badge>
              </button>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
            {tiersLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              enhancedTiers.map((tier) => (
                <PricingCard
                  key={tier.id}
                  tier={tier}
                  onSelect={handleTierSelect}
                  loading={createSubscription.isPending}
                  showUpgrade={false}
                />
              ))
            )}
          </div>

          {/* Features Comparison */}
          <Card className="mb-16">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Feature Comparison</CardTitle>
              <CardDescription>
                Compare features across all plans to find what's right for you
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Feature</th>
                    <th className="text-center p-3 font-medium">Free</th>
                    <th className="text-center p-3 font-medium">Academy</th>
                    <th className="text-center p-3 font-medium">Pro</th>
                    <th className="text-center p-3 font-medium">Team Pro</th>
                    <th className="text-center p-3 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-purple-50">
                    <td className="p-3 font-semibold">ACADEMY FEATURES</td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Academy Courses</td>
                    <td className="text-center p-3">3 courses</td>
                    <td className="text-center p-3">All 57</td>
                    <td className="text-center p-3">All 57</td>
                    <td className="text-center p-3">All 57</td>
                    <td className="text-center p-3">All 57</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Certificates</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅</td>
                    <td className="text-center p-3">✅ Custom</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Playground Tests</td>
                    <td className="text-center p-3">5/month</td>
                    <td className="text-center p-3">50/month</td>
                    <td className="text-center p-3">200/month</td>
                    <td className="text-center p-3">500/month</td>
                    <td className="text-center p-3">Unlimited</td>
                  </tr>
                  <tr className="border-b bg-blue-50">
                    <td className="p-3 font-semibold">PRO TOOLS</td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                    <td className="text-center p-3"></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">AI Prompts/Month</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">200</td>
                    <td className="text-center p-3">1,000</td>
                    <td className="text-center p-3">5,000+</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Templates</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">50+</td>
                    <td className="text-center p-3">50+</td>
                    <td className="text-center p-3">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Team Members</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">2-5</td>
                    <td className="text-center p-3">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">API Access</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">100/mo</td>
                    <td className="text-center p-3">10,000/mo</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Support</td>
                    <td className="text-center p-3">Community</td>
                    <td className="text-center p-3">Email</td>
                    <td className="text-center p-3">Priority</td>
                    <td className="text-center p-3">Priority + Chat</td>
                    <td className="text-center p-3">Dedicated Manager</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">White-label</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">❌</td>
                    <td className="text-center p-3">✅</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated user view
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Billing & Subscriptions
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Manage your subscription, track usage, and purchase additional tokens
          </p>
        </div>

        {/* Quick Stats */}
        {usageData && (
          <div className="mb-8">
            <UsageTracker
              usage={usageData}
              onRefresh={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/usage/current'] });
              }}
              onUpgrade={() => setActiveTab('subscriptions')}
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b">
                <TabsList className="h-14 w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger 
                    value="subscriptions" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscriptions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tokens"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Buy Tokens
                  </TabsTrigger>
                  <TabsTrigger 
                    value="usage"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Usage Details
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="subscriptions" className="mt-0">
                  <div className="space-y-6">
                    {/* Current Subscription Info */}
                    {currentSubscription && (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-green-800">
                                Current Plan: {currentSubscription.tier} ({currentSubscription.billingCycle})
                              </h3>
                              <p className="text-sm text-green-700">
                                {currentSubscription.endDate && `Renews on ${new Date(currentSubscription.endDate).toLocaleDateString()}`}
                              </p>
                            </div>
                            <Badge className="bg-green-600 text-white">Active</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Billing Cycle Toggle */}
                    <div className="flex justify-center">
                      <div className="bg-white p-1 rounded-lg border">
                        <button
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            billingCycle === 'monthly'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setBillingCycle('yearly')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            billingCycle === 'yearly'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Yearly
                          <Badge className="ml-2 bg-green-100 text-green-800">2 Months Free</Badge>
                        </button>
                      </div>
                    </div>

                    {/* Subscription Tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      {tiersLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                              <div className="h-32 bg-gray-200 rounded"></div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        enhancedTiers.map((tier) => (
                          <PricingCard
                            key={tier.id}
                            tier={tier}
                            onSelect={handleTierSelect}
                            loading={createSubscription.isPending}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tokens" className="mt-0">
                  {tokenPackages && usageData && (
                    <TokenPurchase
                      packages={tokenPackages}
                      currentBalance={usageData.tokenBalance}
                      onPurchaseComplete={handleTokenPurchaseComplete}
                    />
                  )}
                </TabsContent>

                <TabsContent value="usage" className="mt-0">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Detailed usage analytics coming soon...</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}