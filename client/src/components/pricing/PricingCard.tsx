import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Users, Zap, Sparkles, GraduationCap, Building2 } from 'lucide-react';

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
    voiceGenerations?: number;
    musicTracks?: number;
    videoExports?: number;
    imageGenerations?: number;
  };
  popular?: boolean;
  current?: boolean;
  savings?: number;
  highlighted?: boolean;
  badge?: string;
  buttonLabel?: string;
  // New features
  commercialLicense?: boolean;
  hdExport?: boolean;
  fourKExport?: boolean;
  watermarkRemoval?: boolean;
  priorityQueue?: boolean;
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
    case 'academy_plus': return <GraduationCap className="w-6 h-6" />;
    case 'pro': return <Star className="w-6 h-6" />;
    case 'team_pro': return <Crown className="w-6 h-6" />;
    case 'enterprise': return <Building2 className="w-6 h-6 text-amber-500" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};

const getTierColor = (tierId: string) => {
  switch (tierId) {
    case 'free': return 'border-slate-200';
    case 'starter': return 'border-blue-200 border-2';
    case 'academy_plus': return 'border-teal-200 border-2';
    case 'pro': return 'border-indigo-300 border-2';
    case 'team_pro': return 'border-purple-300 border-2';
    case 'enterprise': return 'border-amber-300 border-2';
    default: return 'border-slate-200';
  }
};

const getTierGradient = (tierId: string) => {
  switch (tierId) {
    case 'free': return 'from-slate-50 to-slate-100';
    case 'starter': return 'from-blue-50 to-cyan-50';
    case 'academy_plus': return 'from-teal-50 to-emerald-50';
    case 'pro': return 'from-indigo-50 to-purple-50';
    case 'team_pro': return 'from-purple-50 to-pink-50';
    case 'enterprise': return 'from-amber-50 to-orange-50';
    default: return 'from-slate-50 to-slate-100';
  }
};

const formatLimit = (value: number | undefined): string => {
  if (value === undefined) return '—';
  if (value === -1) return 'Unlimited';
  if (value === 0) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

export default function PricingCard({ tier, onSelect, loading = false, showUpgrade = true }: PricingCardProps) {
  const {
    id, name, description, price, billingCycle, features, limits,
    popular, current, savings, highlighted, badge, buttonLabel,
    commercialLicense, hdExport, fourKExport, watermarkRemoval, priorityQueue
  } = tier;

  const handleSelect = () => {
    if (!current) {
      onSelect(id);
    }
  };

  return (
    <Card className={`relative transition-all duration-200 hover:shadow-lg bg-gradient-to-br ${getTierGradient(id)} ${getTierColor(id)} ${
      popular ? 'ring-2 ring-indigo-500 ring-opacity-50 scale-105' : ''
    } ${current ? 'ring-2 ring-green-500' : ''} ${
      highlighted ? 'ring-2 ring-orange-500 ring-opacity-75 shadow-orange-200 shadow-xl' : ''
    }`}>

      {/* Popular Badge */}
      {popular && !current && !highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-indigo-600 text-white px-3 py-1 text-xs font-semibold">
            {badge || 'Most Popular'}
          </Badge>
        </div>
      )}

      {/* Badge for non-popular tiers */}
      {badge && !popular && !current && !highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-slate-600 text-white px-3 py-1 text-xs font-semibold">
            {badge}
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
            popular ? 'bg-indigo-100' : 'bg-white/80'
          }`}>
            {getTierIcon(id)}
          </div>
        </div>

        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-300 min-h-[2.5rem]">
          {description}
        </CardDescription>

        <div className="pt-4">
          {price === 0 ? (
            <div className="text-3xl font-bold">Free</div>
          ) : billingCycle === 'yearly' ? (
            // Yearly billing - show monthly equivalent prominently
            <>
              <div className="text-4xl font-bold text-green-600">
                ${((price / 100) / 12).toFixed(0)}
                <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                  /month
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Billed as ${(price / 100).toFixed(0)}/year
              </div>
              <div className="text-xs text-green-600 font-semibold mt-1">
                Save 2 months!
              </div>
            </>
          ) : (
            // Monthly billing
            <div className="text-4xl font-bold">
              ${(price / 100).toFixed(0)}
              <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                /month
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Monthly Limits Summary */}
        <div className="mb-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">AI Prompts</span>
            <span className="font-semibold text-indigo-600">{formatLimit(limits.tokensPerMonth)}/mo</span>
          </div>
          {limits.voiceGenerations !== undefined && limits.voiceGenerations > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Voice</span>
              <span className="font-medium">{formatLimit(limits.voiceGenerations)}/mo</span>
            </div>
          )}
          {limits.musicTracks !== undefined && limits.musicTracks > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Music</span>
              <span className="font-medium">{formatLimit(limits.musicTracks)}/mo</span>
            </div>
          )}
          {limits.imageGenerations !== undefined && limits.imageGenerations > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Images</span>
              <span className="font-medium">{formatLimit(limits.imageGenerations)}/mo</span>
            </div>
          )}
          {limits.videoExports !== undefined && limits.videoExports > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Videos</span>
              <span className="font-medium">{formatLimit(limits.videoExports)}/mo</span>
            </div>
          )}
        </div>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {features.slice(0, 6).map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-200">{feature}</span>
            </li>
          ))}
          {features.length > 6 && (
            <li className="text-sm text-indigo-600 font-medium ml-6">
              + {features.length - 6} more features
            </li>
          )}
        </ul>

        {/* Pro Features Badges */}
        {(commercialLicense || watermarkRemoval || priorityQueue || fourKExport) && (
          <div className="mb-4 flex flex-wrap gap-1">
            {commercialLicense && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Commercial License
              </Badge>
            )}
            {watermarkRemoval && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                No Watermarks
              </Badge>
            )}
            {priorityQueue && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Priority Queue
              </Badge>
            )}
            {fourKExport && (
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                4K Export
              </Badge>
            )}
          </div>
        )}

        {/* Key Limits */}
        <div className="mb-6 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {limits.teamMembers !== 1 && limits.teamMembers !== -1 && (
            <div>Up to {limits.teamMembers} team members</div>
          )}
          {limits.teamMembers === -1 && (
            <div>Unlimited team members</div>
          )}
          {limits.apiCalls > 0 && (
            <div>{formatLimit(limits.apiCalls)} API calls/month</div>
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
            'Get Started Free'
          ) : buttonLabel ? (
            buttonLabel
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
