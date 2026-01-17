import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Zap,
  Sparkles,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';

interface UsageLimitPromptProps {
  feature: string;
  used: number;
  limit: number;
  currentPlan: string;
  suggestedPlan?: string;
  onDismiss?: () => void;
  compact?: boolean;
}

/**
 * UsageLimitPrompt - Shows upgrade prompts when users approach their usage limits
 *
 * This component is a key conversion driver - showing users upgrade options
 * when they're running low on their plan limits.
 */
export default function UsageLimitPrompt({
  feature,
  used,
  limit,
  currentPlan,
  suggestedPlan = 'starter',
  onDismiss,
  compact = false
}: UsageLimitPromptProps) {
  const navigate = useNavigate();

  const percentUsed = limit > 0 ? Math.min((used / limit) * 100, 100) : 100;
  const remaining = Math.max(limit - used, 0);
  const isNearLimit = percentUsed >= 80;
  const isAtLimit = percentUsed >= 100;

  // Feature display names
  const featureNames: Record<string, string> = {
    prompts: 'AI Prompts',
    voices: 'Voice Generations',
    music: 'Music Tracks',
    images: 'Image Generations',
    videos: 'Video Exports',
    api_calls: 'API Calls',
    blueprints: 'BuilderIQ Blueprints'
  };

  const featureName = featureNames[feature] || feature;

  // Plan upgrade suggestions with value props
  const planSuggestions: Record<string, { name: string; price: string; increase: string }> = {
    starter: { name: 'Starter', price: '$19/mo', increase: '25x more' },
    academy_plus: { name: 'Academy+', price: '$29/mo', increase: '50x more' },
    pro: { name: 'Pro', price: '$49/mo', increase: '100x more' },
    team_pro: { name: 'Team Pro', price: '$99/mo', increase: '500x more' }
  };

  const suggestion = planSuggestions[suggestedPlan] || planSuggestions.starter;

  // Compact version for inline use (headers, sidebars)
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${
        isAtLimit
          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
      }`}>
        {isAtLimit ? (
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        ) : (
          <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            isAtLimit ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
          }`}>
            {isAtLimit
              ? `You've used all ${limit} ${featureName.toLowerCase()}`
              : `${remaining} ${featureName.toLowerCase()} remaining`
            }
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate(`/pricing?upgrade=${suggestedPlan}&feature=${feature}`)}
          className={isAtLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  // Full card version for feature pages
  return (
    <Card className={`overflow-hidden ${
      isAtLimit
        ? 'border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
        : 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isAtLimit ? (
              <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
            ) : (
              <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full">
                <Zap className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
            )}
            <div>
              <h3 className={`font-semibold ${
                isAtLimit ? 'text-red-800 dark:text-red-200' : 'text-amber-800 dark:text-amber-200'
              }`}>
                {isAtLimit ? 'Limit Reached!' : 'Running Low'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {featureName} this month
              </p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Usage Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              {used} of {limit} used
            </span>
            <span className={`font-medium ${
              isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-green-600'
            }`}>
              {remaining} remaining
            </span>
          </div>
          <Progress
            value={percentUsed}
            className={`h-2 ${
              isAtLimit
                ? '[&>div]:bg-red-500'
                : isNearLimit
                  ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-green-500'
            }`}
          />
        </div>

        {/* Upgrade CTA Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Upgrade to {suggestion.name}
              </span>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {suggestion.increase}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get {suggestion.increase} {featureName.toLowerCase()} plus premium features for just {suggestion.price}
          </p>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate(`/pricing?upgrade=${suggestedPlan}&feature=${feature}`)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/pricing?tab=tokens')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Extra
            </Button>
          </div>
        </div>

        {/* Quick buy tip for users at limit */}
        {isAtLimit && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>
                <strong>Need more right now?</strong> Buy a one-time add-on pack to continue creating.
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Hook to check if user should see an upgrade prompt based on usage
 */
export function useUsageLimitStatus(feature: string, used: number, limit: number) {
  const percentUsed = limit > 0 ? (used / limit) * 100 : 100;

  return {
    shouldShow: percentUsed >= 70,
    isNearLimit: percentUsed >= 80 && percentUsed < 100,
    isAtLimit: percentUsed >= 100,
    percentUsed,
    remaining: Math.max(limit - used, 0)
  };
}

/**
 * Get suggested upgrade plan based on current plan
 */
export function getSuggestedPlan(currentPlan: string): string {
  const upgradePath: Record<string, string> = {
    'free': 'starter',
    'starter': 'academy_plus',
    'academy_plus': 'pro',
    'pro': 'team_pro',
    'team_pro': 'enterprise'
  };
  return upgradePath[currentPlan] || 'starter';
}
