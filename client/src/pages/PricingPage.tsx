import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { redirectToStripeCheckout, stripeMode } from '@/lib/stripe';
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
import {
  PRICING_TIERS,
  TOKEN_PACKAGES,
  ADDON_PACKAGES,
  STRIPE_PRICE_IDS,
  formatPrice,
  calculateYearlySavings as configCalculateYearlySavings,
  getStripePriceId,
  formatLimit,
  type PricingTier as ConfigPricingTier,
  type TokenPackage as ConfigTokenPackage,
  type AddOnPackage
} from '@/config/pricing';

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

  // Use centralized pricing tiers from config
  const mockTiers = PRICING_TIERS.map(tier => ({
    id: tier.id,
    name: tier.name,
    description: tier.description,
    price: billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice,
    billingCycle: billingCycle,
    features: tier.features.map(f => f.startsWith('Everything') ? `✨ ${f}` : f),
    limits: {
      tokensPerMonth: tier.limits.tokensPerMonth,
      maxTokenRollover: tier.limits.maxTokenRollover,
      teamMembers: tier.limits.teamMembers,
      apiCalls: tier.limits.apiCalls,
      voiceGenerations: tier.limits.voiceGenerations,
      musicTracks: tier.limits.musicTracks,
      videoExports: tier.limits.videoExports,
      imageGenerations: tier.limits.imageGenerations,
      introOutros: tier.limits.introOutros,
      blueprints: tier.limits.blueprints
    },
    rateLimits: tier.rateLimits,
    support: tier.support === 'community' ? 'Community' :
             tier.support === 'email' ? 'Email' :
             tier.support === 'priority' ? 'Priority' :
             tier.support === 'priority_chat' ? 'Priority Chat' :
             tier.support === 'dedicated' ? 'Dedicated' : 'Community',
    badge: tier.badge,
    popular: tier.popular,
    buttonLabel: tier.popular ? 'Choose Plan' : undefined,
    stripePriceId: billingCycle === 'yearly'
      ? getStripePriceId(tier.id, 'yearly')
      : getStripePriceId(tier.id, 'monthly'),
    // New features
    commercialLicense: tier.commercialLicense,
    hdExport: tier.hdExport,
    fourKExport: tier.fourKExport,
    watermarkRemoval: tier.watermarkRemoval,
    priorityQueue: tier.priorityQueue
  }));

  // Use mock data instead of API calls
  const tiers = mockTiers;
  const tiersLoading = false;

  // Use centralized token packages from config
  const mockTokenPackages: TokenPackage[] = TOKEN_PACKAGES.map(pkg => ({
    key: pkg.key,
    tokens: pkg.tokens,
    priceInCents: pkg.priceInCents,
    pricePerToken: pkg.pricePerToken,
    stripeId: `price_tokens_${pkg.tokens}`,
    savings: pkg.savings
  }));

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

  // Create subscription via Stripe Checkout using Stripe.js
  // This uses stripe.redirectToCheckout() for proper Stripe integration
  const createSubscription = useMutation({
    mutationFn: async ({ tierId, billingCycle }: { tierId: string; billingCycle: string }) => {
      // Log checkout attempt
      console.log(`💳 Initiating Stripe Checkout for tier: ${tierId}, cycle: ${billingCycle}`);
      console.log(`💳 Stripe Mode: ${stripeMode.toUpperCase()}`);

      // Use Stripe.js redirectToCheckout - NO MOCK FALLBACKS
      // Token is fetched automatically from localStorage('token') by the stripe module
      await redirectToStripeCheckout({
        tierId,
        billingCycle: billingCycle as 'monthly' | 'yearly',
      });

      // If redirect succeeds, this won't be reached
      return { success: true };
    },
    onError: (error: any) => {
      console.error('❌ Checkout failed:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Failed to start checkout. Please try again.',
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-16">
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
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-3 font-medium sticky left-0 bg-slate-50">Feature</th>
                    <th className="text-center p-3 font-medium">Free</th>
                    <th className="text-center p-3 font-medium text-blue-600">Starter</th>
                    <th className="text-center p-3 font-medium text-teal-600">Academy+</th>
                    <th className="text-center p-3 font-medium text-indigo-600">Pro</th>
                    <th className="text-center p-3 font-medium text-purple-600">Team Pro</th>
                    <th className="text-center p-3 font-medium text-amber-600">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {/* PRICING ROW */}
                  <tr className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
                    <td className="p-3 font-semibold sticky left-0 bg-gradient-to-r from-indigo-50 to-purple-50">Monthly Price</td>
                    <td className="text-center p-3 font-bold">Free</td>
                    <td className="text-center p-3 font-bold text-blue-600">$19</td>
                    <td className="text-center p-3 font-bold text-teal-600">$29</td>
                    <td className="text-center p-3 font-bold text-indigo-600">$49</td>
                    <td className="text-center p-3 font-bold text-purple-600">$99</td>
                    <td className="text-center p-3 font-bold text-amber-600">$299</td>
                  </tr>

                  {/* CREATIVE TOOLS SECTION */}
                  <tr className="border-b bg-purple-100">
                    <td className="p-3 font-semibold sticky left-0 bg-purple-100" colSpan={7}>CREATIVE TOOLS</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">AI Prompts/Month</td>
                    <td className="text-center p-3">5</td>
                    <td className="text-center p-3">50</td>
                    <td className="text-center p-3">100</td>
                    <td className="text-center p-3 font-medium">200</td>
                    <td className="text-center p-3 font-medium">1,000</td>
                    <td className="text-center p-3 font-medium text-green-600">5,000+</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Voice Generations</td>
                    <td className="text-center p-3">5</td>
                    <td className="text-center p-3">50</td>
                    <td className="text-center p-3">75</td>
                    <td className="text-center p-3 font-medium">200</td>
                    <td className="text-center p-3 font-medium">500</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Suno Music Tracks</td>
                    <td className="text-center p-3">3</td>
                    <td className="text-center p-3">10</td>
                    <td className="text-center p-3">20</td>
                    <td className="text-center p-3 font-medium">50</td>
                    <td className="text-center p-3 font-medium">150</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Image Generations</td>
                    <td className="text-center p-3">5</td>
                    <td className="text-center p-3">30</td>
                    <td className="text-center p-3">50</td>
                    <td className="text-center p-3 font-medium">100</td>
                    <td className="text-center p-3 font-medium">300</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Video Exports</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3">5</td>
                    <td className="text-center p-3">10</td>
                    <td className="text-center p-3 font-medium">30</td>
                    <td className="text-center p-3 font-medium">100</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Intro/Outro Videos</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3">5</td>
                    <td className="text-center p-3">10</td>
                    <td className="text-center p-3 font-medium">30</td>
                    <td className="text-center p-3 font-medium">100</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">BuilderIQ Blueprints</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">3</td>
                    <td className="text-center p-3">5</td>
                    <td className="text-center p-3 font-medium">10</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>

                  {/* ACADEMY SECTION */}
                  <tr className="border-b bg-teal-100">
                    <td className="p-3 font-semibold sticky left-0 bg-teal-100" colSpan={7}>ACADEMY & EDUCATION</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Academy Courses</td>
                    <td className="text-center p-3">3 courses</td>
                    <td className="text-center p-3">3 courses</td>
                    <td className="text-center p-3 font-medium text-green-600">All 57</td>
                    <td className="text-center p-3 font-medium text-green-600">All 57</td>
                    <td className="text-center p-3 font-medium text-green-600">All 57</td>
                    <td className="text-center p-3 font-medium text-green-600">All 57</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Certificates</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 font-medium text-green-600">Custom Branded</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Playground Tests</td>
                    <td className="text-center p-3">5/mo</td>
                    <td className="text-center p-3">25/mo</td>
                    <td className="text-center p-3">50/mo</td>
                    <td className="text-center p-3">200/mo</td>
                    <td className="text-center p-3">500/mo</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>

                  {/* QUALITY & EXPORT SECTION */}
                  <tr className="border-b bg-blue-100">
                    <td className="p-3 font-semibold sticky left-0 bg-blue-100" colSpan={7}>QUALITY & EXPORTS</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">HD Video Export (1080p)</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">4K Video Export</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Remove Watermarks</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Commercial License</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Priority Queue</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                  </tr>

                  {/* TEAM & API SECTION */}
                  <tr className="border-b bg-amber-100">
                    <td className="p-3 font-semibold sticky left-0 bg-amber-100" colSpan={7}>TEAM & API</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Team Members</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3">1</td>
                    <td className="text-center p-3 font-medium">2-5</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">API Access</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3">100/mo</td>
                    <td className="text-center p-3 font-medium">1,000/mo</td>
                    <td className="text-center p-3 font-medium text-green-600">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Team Workspace</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">White-label</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-gray-400">—</td>
                    <td className="text-center p-3 text-green-600">✓</td>
                  </tr>

                  {/* SUPPORT SECTION */}
                  <tr className="border-b bg-green-100">
                    <td className="p-3 font-semibold sticky left-0 bg-green-100" colSpan={7}>SUPPORT</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Support Level</td>
                    <td className="text-center p-3">Community</td>
                    <td className="text-center p-3">Email</td>
                    <td className="text-center p-3">Email</td>
                    <td className="text-center p-3">Priority</td>
                    <td className="text-center p-3 font-medium">Priority Chat</td>
                    <td className="text-center p-3 font-medium text-green-600">Dedicated Manager</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">Response Time</td>
                    <td className="text-center p-3">48-72h</td>
                    <td className="text-center p-3">24-48h</td>
                    <td className="text-center p-3">24-48h</td>
                    <td className="text-center p-3">12-24h</td>
                    <td className="text-center p-3 font-medium">4-12h</td>
                    <td className="text-center p-3 font-medium text-green-600">1-4h</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 sticky left-0 bg-white">History Retention</td>
                    <td className="text-center p-3">7 days</td>
                    <td className="text-center p-3">14 days</td>
                    <td className="text-center p-3">30 days</td>
                    <td className="text-center p-3">90 days</td>
                    <td className="text-center p-3">180 days</td>
                    <td className="text-center p-3 font-medium text-green-600">1 year</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Add-on Packages */}
          <Card className="mb-16">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Need More? Add-on Packages</CardTitle>
              <CardDescription>
                Boost your limits with one-time add-on purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {ADDON_PACKAGES.map((pkg) => (
                  <Card key={pkg.key} className={`relative ${pkg.popular ? 'ring-2 ring-indigo-500' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-indigo-600 text-white text-xs">Best Value</Badge>
                      </div>
                    )}
                    <CardContent className="p-4 text-center">
                      <h3 className="font-bold text-lg mb-1">{pkg.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                      <div className="text-2xl font-bold text-indigo-600 mb-3">
                        ${(pkg.priceInCents / 100).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        {pkg.contents.prompts && <div>+{pkg.contents.prompts} prompts</div>}
                        {pkg.contents.voices && <div>+{pkg.contents.voices} voices</div>}
                        {pkg.contents.music && <div>+{pkg.contents.music} music tracks</div>}
                        {pkg.contents.videos && <div>+{pkg.contents.videos} videos</div>}
                        {pkg.contents.images && <div>+{pkg.contents.images} images</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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