import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Users, Zap } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    tokensPerMonth: number;
    maxTokenRollover: number;
    teamMembers: number;
    apiCalls: number;
  };
  popular?: boolean;
  current?: boolean;
  savings?: number;
  highlighted?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  onSelect: (tierId: string) => void;
  loading?: boolean;
  showUpgrade?: boolean;
}

const getTierIcon = (tierId: string) => {
  switch (tierId) {
    case 'free': return <Users className="w-6 h-6" />;
    case 'starter': return <Zap className="w-6 h-6" />;
    case 'pro': return <Star className="w-6 h-6" />;
    case 'business': return <Crown className="w-6 h-6" />;
    case 'enterprise': return <Crown className="w-6 h-6 text-amber-500" />;
    default: return <Zap className="w-6 h-6" />;
  }
};

const getTierColor = (tierId: string) => {
  switch (tierId) {
    case 'free': return 'border-slate-200';
    case 'starter': return 'border-blue-200';
    case 'pro': return 'border-indigo-300 border-2';
    case 'business': return 'border-purple-300 border-2';
    case 'enterprise': return 'border-amber-300 border-2';
    default: return 'border-slate-200';
  }
};

const formatPrompts = (prompts: number) => {
  if (prompts === -1) return 'Unlimited';
  if (prompts >= 1000) return `${(prompts / 1000).toFixed(0)}K`;
  return prompts.toString();
};

export default function PricingCard({ tier, onSelect, loading = false, showUpgrade = true }: PricingCardProps) {
  const { id, name, description, price, billingCycle, features, limits, popular, current, savings, highlighted } = tier;

  const handleSelect = () => {
    if (!current) {
      onSelect(id);
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg ${getTierColor(id)} ${
      popular ? 'ring-2 ring-indigo-500 ring-opacity-50' : ''
    } ${current ? 'ring-2 ring-green-500' : ''} ${
      highlighted ? 'ring-2 ring-orange-500 ring-opacity-75 shadow-orange-200 shadow-xl' : ''
    }`}>
      
      {/* Popular Badge */}
      {popular && !current && !highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-indigo-600 text-white px-3 py-1 text-xs font-semibold">
            Most Popular
          </Badge>
        </div>
      )}

      {/* Recommended Badge for highlighted tiers */}
      {highlighted && !current && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-orange-500 text-white px-3 py-1 text-xs font-semibold animate-pulse">
            Recommended
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {current && (
        <div className="absolute -top-3 right-4">
          <Badge className="bg-green-600 text-white px-3 py-1 text-xs font-semibold">
            Current Plan
          </Badge>
        </div>
      )}

      {/* Savings Badge */}
      {savings && savings > 0 && (
        <div className="absolute -top-3 left-4">
          <Badge className="bg-orange-500 text-white px-2 py-1 text-xs font-medium">
            Save {savings}%
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className={`p-3 rounded-full ${
            popular ? 'bg-indigo-100' : 'bg-slate-100'
          }`}>
            {getTierIcon(id)}
          </div>
        </div>
        
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 min-h-[2.5rem]">
          {description}
        </CardDescription>
        
        <div className="pt-4">
          {price === 0 ? (
            <div className="text-3xl font-bold">Free</div>
          ) : (
            <>
              <div className="text-4xl font-bold">
                ${(price / 100).toFixed(0)}
                <span className="text-lg font-normal text-gray-600">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="text-sm text-green-600 font-medium">
                  ${((price / 100) / 12).toFixed(0)}/month when billed yearly
                </div>
              )}
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Prompt Allocation */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">Monthly Prompts</div>
          <div className="text-lg font-bold text-indigo-600">
            {formatPrompts(limits.tokensPerMonth)} prompts/month
          </div>
          {limits.maxTokenRollover > 0 && (
            <div className="text-xs text-gray-500">
              Up to {formatPrompts(limits.maxTokenRollover)} rollover
            </div>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Key Limits */}
        <div className="mb-6 text-xs text-gray-500 space-y-1">
          {limits.teamMembers !== -1 && (
            <div>• Up to {limits.teamMembers} team members</div>
          )}
          {limits.apiCalls > 0 && (
            <div>• {formatPrompts(limits.apiCalls)} API calls/month</div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleSelect}
          disabled={current || loading}
          variant={popular && !current ? "default" : current ? "outline" : "outline"}
          className={`w-full ${
            popular && !current 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
              : ''
          } ${current ? 'cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Processing...
            </div>
          ) : current ? (
            'Current Plan'
          ) : price === 0 ? (
            'Get Started'
          ) : showUpgrade ? (
            `Upgrade to ${name}`
          ) : (
            `Select ${name}`
          )}
        </Button>

        {/* Enterprise Contact */}
        {id === 'enterprise' && (
          <div className="mt-3 text-center">
            <button className="text-xs text-indigo-600 hover:text-indigo-800 underline">
              Contact Sales for Custom Pricing
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}