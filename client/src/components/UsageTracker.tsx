import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Crown,
  Star,
  Rocket
} from "lucide-react";
import { Link } from "wouter";

interface UsageStats {
  daily: { used: number; limit: number; remaining: number };
  monthly: { used: number; limit: number; remaining: number };
  tier: string;
}

interface UsageData {
  tokenBalance: number;
  subscriptionTier: string;
  monthlyUsage: {
    used: number;
    limit: number;
    percentage: number;
    resetDate: string;
  };
  rateLimits: {
    usage: { hourly: number; daily: number };
    remaining: { hourly: number; daily: number };
    limits: { hourly: number; daily: number };
  };
  realTimeStats: {
    promptsToday: number;
    tokensUsed: number;
    apiCalls: number;
    lastActivity: string | null;
  };
}

interface UsageBreakdown {
  categories: Array<{
    category: string;
    count: number;
    tokens: number;
    cost: number;
  }>;
  dailyUsage: Array<{
    date: string;
    prompts: number;
    tokens: number;
    cost: number;
  }>;
}

interface UsageTrackerProps {
  usage?: UsageData;
  breakdown?: UsageBreakdown;
  onRefresh?: () => void;
  onUpgrade?: () => void;
}

// Mock data for demo
const deprecatedMockUsageStats: UsageStats = {
  daily: { used: 8, limit: 50, remaining: 42 },
  monthly: { used: 150, limit: 200, remaining: 50 },
  tier: "starter"
};

export default function UsageTracker({ usage, breakdown, onRefresh, onUpgrade }: UsageTrackerProps = {}) {
  const [usageStats] = useState<UsageStats>(deprecatedMockUsageStats);
  const [isLoading] = useState(false);
  const [error] = useState(null);

  console.log("?? UsageTracker loaded with usage data:", usageStats);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !usageStats) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load usage statistics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'pro':
        return <Star className="w-4 h-4 text-blue-600" />;
      default:
        return <Rocket className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const dailyUsagePercent = (usageStats.daily.used / usageStats.daily.limit) * 100;
  const monthlyUsagePercent = (usageStats.monthly.used / usageStats.monthly.limit) * 100;

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const isNearLimit = dailyUsagePercent >= 80;
  const isAtLimit = usageStats.daily.remaining === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span>API Usage</span>
          </div>
          <Badge className={`flex items-center space-x-1 ${getTierColor(usageStats.tier)}`}>
            {getTierIcon(usageStats.tier)}
            <span className="capitalize">{usageStats.tier}</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Track your AI prompt generation usage and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Daily Usage</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {usageStats.daily.used} / {usageStats.daily.limit}
            </span>
          </div>
          <Progress 
            value={dailyUsagePercent} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{usageStats.daily.remaining} remaining today</span>
            <span>{dailyUsagePercent.toFixed(0)}% used</span>
          </div>
        </div>

        {/* Monthly Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Monthly Usage</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {usageStats.monthly.used} / {usageStats.monthly.limit}
            </span>
          </div>
          <Progress 
            value={monthlyUsagePercent} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{usageStats.monthly.remaining} remaining this month</span>
            <span>{monthlyUsagePercent.toFixed(0)}% used</span>
          </div>
        </div>

        {/* Alerts and Actions */}
        {isAtLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You've reached your daily limit. Upgrade to continue generating prompts or wait until tomorrow.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You're approaching your daily limit ({usageStats.daily.remaining} prompts remaining).
            </AlertDescription>
          </Alert>
        )}

        {!isNearLimit && usageStats.tier === 'free' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You're on the free tier with {usageStats.daily.limit} prompts per day. Upgrade for more!
            </AlertDescription>
          </Alert>
        )}

        {/* Upgrade Options */}
        {(isNearLimit || usageStats.tier === 'free') && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-medium mb-3">Need more prompts?</h4>
            <div className="grid grid-cols-1 gap-3">
              {usageStats.tier === 'free' && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">Starter Plan</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">50 prompts/day, 200/month</div>
                  </div>
                  <Link href="/billing">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              )}
              {(usageStats.tier === 'free' || usageStats.tier === 'starter') && (
                <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <div>
                    <div className="font-medium text-indigo-900 dark:text-indigo-100">Pro Plan</div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300">200 prompts/day, 1000/month</div>
                  </div>
                  <Link href="/billing">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              )}
              {(usageStats.tier === 'free' || usageStats.tier === 'starter' || usageStats.tier === 'pro') && (
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div>
                    <div className="font-medium text-purple-900 dark:text-purple-100">Enterprise Plan</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Unlimited prompts</div>
                  </div>
                  <Link href="/billing">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2">?? Save on usage:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>� Similar prompts may be served from cache</li>
            <li>� Use templates to reduce generation time</li>
            <li>� Refine existing prompts instead of starting over</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
