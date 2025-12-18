import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Coins, CreditCard, Clock, TrendingUp } from 'lucide-react';

interface TokenPackage {
  key: string;
  tokens: number;
  priceInCents: number;
  pricePerToken: number;
  stripeId: string;
  savings: number;
}

interface TokenPurchaseProps {
  packages: TokenPackage[];
  currentBalance: number;
  onPurchaseComplete?: (tokensAdded: number) => void;
}

export default function TokenPurchase({ packages, currentBalance, onPurchaseComplete }: TokenPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const formatPricePerToken = (pricePerToken: number) => {
    return `$${(pricePerToken / 100).toFixed(3)}`;
  };

  const getPackageColor = (packageKey: string) => {
    switch (packageKey) {
      case 'small': return 'border-slate-200';
      case 'medium': return 'border-blue-200';
      case 'large': return 'border-purple-200 border-2';
      case 'bulk': return 'border-green-300 border-2';
      default: return 'border-slate-200';
    }
  };

  const getBestValuePackage = () => {
    return packages.reduce((best, pkg) => 
      pkg.pricePerToken < best.pricePerToken ? pkg : best
    );
  };

  const handlePurchase = async (packageKey: string) => {
    setIsProcessing(true);
    setSelectedPackage(packageKey);

    try {
      // Create Stripe Checkout Session for token purchase
      const response = await apiRequest('POST', '/api/billing/create-token-checkout', {
        packageKey,
        successUrl: `${window.location.origin}/billing?success=true&tokens=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing?tab=tokens&canceled=true`
      });

      const result = await response.json();

      if (result.success && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }

    } catch (error) {
      console.error('Token purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error instanceof Error ? error.message : 'Failed to purchase tokens',
        variant: 'destructive',
      });
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  const bestValue = getBestValuePackage();

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coins className="w-5 h-5 text-yellow-600" />
            Current Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-indigo-600">{currentBalance}</div>
              <div className="text-sm text-gray-600">Available tokens</div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tokens expire in 90 days
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Packages */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Purchase Token Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Card 
              key={pkg.key} 
              className={`relative transition-all duration-200 hover:shadow-lg ${getPackageColor(pkg.key)}
                ${pkg.key === bestValue.key ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
              `}
            >
              {/* Best Value Badge */}
              {pkg.key === bestValue.key && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
                    Best Value
                  </Badge>
                </div>
              )}

              {/* Savings Badge */}
              {pkg.savings > 0 && (
                <div className="absolute -top-2 right-2">
                  <Badge className="bg-orange-500 text-white px-2 py-1 text-xs">
                    Save {pkg.savings}%
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {pkg.tokens.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">tokens</div>
                <div className="text-xl font-semibold mt-2">
                  {formatPrice(pkg.priceInCents)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPricePerToken(pkg.pricePerToken)} per token
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  onClick={() => handlePurchase(pkg.key)}
                  disabled={isProcessing}
                  variant={pkg.key === bestValue.key ? "default" : "outline"}
                  className={`w-full ${
                    pkg.key === bestValue.key 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : ''
                  }`}
                >
                  {isProcessing && selectedPackage === pkg.key ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>

                {/* Package Benefits */}
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <div>• 90-day expiration</div>
                  <div>• Instant activation</div>
                  {pkg.tokens >= 500 && (
                    <div>• Priority processing</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Token Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Token Usage Guide
          </CardTitle>
          <CardDescription>
            Understand how many tokens different types of prompts consume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-700">1 Token</div>
              <div className="text-sm text-gray-600">Simple Prompts</div>
              <div className="text-xs text-gray-500 mt-1">Basic questions, simple text generation</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">3 Tokens</div>
              <div className="text-sm text-gray-600">Standard Prompts</div>
              <div className="text-xs text-gray-500 mt-1">Marketing copy, emails, articles</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-700">7 Tokens</div>
              <div className="text-sm text-gray-600">Complex Prompts</div>
              <div className="text-xs text-gray-500 mt-1">Technical content, detailed analysis</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-lg font-semibold text-amber-700">15 Tokens</div>
              <div className="text-sm text-gray-600">Custom Prompts</div>
              <div className="text-xs text-gray-500 mt-1">Advanced AI interactions, custom workflows</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
            <div className="text-sm text-gray-700">
              <strong>Token Expiration:</strong> All purchased tokens expire 90 days after purchase. 
              Use them before they expire to get the full value.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
            <div className="text-sm text-gray-700">
              <strong>Instant Activation:</strong> Tokens are added to your account immediately after 
              successful payment and can be used right away.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
            <div className="text-sm text-gray-700">
              <strong>Best Value:</strong> Larger packages offer better per-token pricing. 
              The bulk package provides the best value at {formatPricePerToken(bestValue.pricePerToken)} per token.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
            <div className="text-sm text-gray-700">
              <strong>Secure Payment:</strong> All payments are processed securely through Stripe. 
              We never store your payment information.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}