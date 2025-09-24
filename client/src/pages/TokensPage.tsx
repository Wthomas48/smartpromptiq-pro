import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import TokenBalance from '@/components/TokenBalance';
import TokenPurchase from '@/components/pricing/TokenPurchase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins, TrendingUp, Clock, Star, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function TokensPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Mock token packages based on our pricing config
  const tokenPackages = [
    {
      key: 'addon_small',
      tokens: 20,
      priceInCents: 500,
      pricePerToken: 25.00,
      stripeId: 'price_addon_tokens_20',
      savings: 0,
      label: '20 Extra Tokens'
    },
    {
      key: 'addon_medium',
      tokens: 50,
      priceInCents: 1000,
      pricePerToken: 20.00,
      stripeId: 'price_addon_tokens_50',
      savings: 20,
      label: '50 Extra Tokens'
    },
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

  // Mock usage data
  const usageData = {
    tokenBalance: 47,
    tokensUsed: 153,
    tokensLimit: 200,
    periodStart: new Date().toISOString(),
    periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  const handleTokenPurchaseComplete = (tokensAdded: number) => {
    toast({
      title: "Tokens Added Successfully!",
      description: `${tokensAdded} tokens have been added to your account.`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <Navigation />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to manage your tokens and purchase token packages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <p className="text-sm text-gray-600">
                  Don't have an account? <Link href="/auth/sign-up" className="text-indigo-600 hover:underline">Sign up for free</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <Coins className="w-4 h-4 mr-2" />
            Token Management
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Manage Your <span className="text-indigo-600">AI Tokens</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Purchase additional tokens, track your usage, and never run out of AI-powered prompts
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600">Current Balance</p>
                  <p className="text-3xl font-bold text-indigo-900">{usageData.tokenBalance}</p>
                  <p className="text-sm text-indigo-700">tokens available</p>
                </div>
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Used This Month</p>
                  <p className="text-3xl font-bold text-green-900">{usageData.tokensUsed}</p>
                  <p className="text-sm text-green-700">of {usageData.tokensLimit} tokens</p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Expires In</p>
                  <p className="text-3xl font-bold text-orange-900">82</p>
                  <p className="text-sm text-orange-700">days remaining</p>
                </div>
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token Purchase */}
          <div className="lg:col-span-2">
            <TokenPurchase
              packages={tokenPackages}
              currentBalance={usageData.tokenBalance}
              onPurchaseComplete={handleTokenPurchaseComplete}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Balance Card */}
            <TokenBalance />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/billing" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Full Billing
                  </Button>
                </Link>
                <Link href="/billing?tab=usage" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Usage Analytics
                  </Button>
                </Link>
                <Link href="/billing?tab=subscriptions" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>Use templates to save tokens and get better results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>Tokens expire 90 days after purchase</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>Bulk packages offer better value per token</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}