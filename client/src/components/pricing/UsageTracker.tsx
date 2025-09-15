import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Coins, 
  Calendar,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';

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
    usage: {
      hourly: number;
      daily: number;
    };
    remaining: {
      hourly: number;
      daily: number;
    };
    limits: {
      hourly: number;
      daily: number;
    };
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
  usage: UsageData;
  breakdown?: UsageBreakdown;
  onRefresh?: () => void;
  onUpgrade?: () => void;
}

export default function UsageTracker({ usage, breakdown, onRefresh, onUpgrade }: UsageTrackerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return { color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle };
    if (percentage >= 70) return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Clock };
    return { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const monthlyStatus = getUsageStatus(usage.monthlyUsage.percentage);
  const MonthlyIcon = monthlyStatus.icon;

  const isLowBalance = usage.tokenBalance <= 10;
  const isApproachingLimit = usage.monthlyUsage.percentage >= 80;

  return (
    <div className="space-y-6">
      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Token Balance</div>
                <div className={`text-2xl font-bold ${isLowBalance ? 'text-red-600' : 'text-indigo-600'}`}>
                  {usage.tokenBalance.toLocaleString()}
                </div>
              </div>
              <div className={`p-2 rounded-full ${isLowBalance ? 'bg-red-100' : 'bg-indigo-100'}`}>
                <Coins className={`w-5 h-5 ${isLowBalance ? 'text-red-600' : 'text-indigo-600'}`} />
              </div>
            </div>
            {isLowBalance && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Low balance - consider purchasing more tokens
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Monthly Usage</div>
                <div className="text-2xl font-bold text-gray-900">
                  {usage.monthlyUsage.used}
                  <span className="text-sm font-normal text-gray-500">
                    /{usage.monthlyUsage.limit === -1 ? '∞' : usage.monthlyUsage.limit}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-full ${monthlyStatus.bgColor}`}>
                <MonthlyIcon className={`w-5 h-5 ${monthlyStatus.color}`} />
              </div>
            </div>
            {usage.monthlyUsage.limit !== -1 && (
              <Progress 
                value={usage.monthlyUsage.percentage} 
                className="mt-2 h-2"
                // You might need to add a custom style for colored progress bars
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Today's Activity</div>
                <div className="text-2xl font-bold text-gray-900">
                  {usage.realTimeStats.promptsToday}
                </div>
                <div className="text-xs text-gray-500">
                  {usage.realTimeStats.tokensUsed} tokens used
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Plan</div>
                <div className="text-lg font-bold text-gray-900 capitalize">
                  {usage.subscriptionTier}
                </div>
                <div className="text-xs text-gray-500">
                  Resets {formatDate(usage.monthlyUsage.resetDate)}
                </div>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(isLowBalance || isApproachingLimit) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800">Action Recommended</h4>
                <div className="text-sm text-yellow-700 space-y-1 mt-1">
                  {isLowBalance && (
                    <div>• Your token balance is low ({usage.tokenBalance} remaining)</div>
                  )}
                  {isApproachingLimit && (
                    <div>• You've used {usage.monthlyUsage.percentage.toFixed(0)}% of your monthly limit</div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={onUpgrade}>
                    Upgrade Plan
                  </Button>
                  <Button size="sm" variant="outline">
                    Purchase Tokens
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Usage Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usage Details</CardTitle>
            <CardDescription>
              Track your token consumption and usage patterns
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="limits">Rate Limits</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Progress */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Monthly Allocation
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Tokens Used</span>
                      <span className="font-medium">
                        {usage.monthlyUsage.used.toLocaleString()} / {usage.monthlyUsage.limit === -1 ? '∞' : usage.monthlyUsage.limit.toLocaleString()}
                      </span>
                    </div>
                    {usage.monthlyUsage.limit !== -1 && (
                      <>
                        <Progress value={usage.monthlyUsage.percentage} className="h-3" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{usage.monthlyUsage.percentage.toFixed(1)}% used</span>
                          <span>Resets in {Math.ceil((new Date(usage.monthlyUsage.resetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Real-time Stats */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Today's Activity
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Prompts Generated</span>
                      <Badge variant="secondary">{usage.realTimeStats.promptsToday}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tokens Consumed</span>
                      <Badge variant="secondary">{usage.realTimeStats.tokensUsed}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Calls</span>
                      <Badge variant="secondary">{usage.realTimeStats.apiCalls}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Activity</span>
                      <span className="text-xs text-gray-500">
                        {formatTime(usage.realTimeStats.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hourly Limits */}
                <div>
                  <h4 className="font-medium mb-3">Hourly Rate Limits</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Prompts Used</span>
                      <span className="font-medium">
                        {usage.rateLimits.usage.hourly} / {usage.rateLimits.limits.hourly === -1 ? '∞' : usage.rateLimits.limits.hourly}
                      </span>
                    </div>
                    {usage.rateLimits.limits.hourly !== -1 && (
                      <>
                        <Progress 
                          value={(usage.rateLimits.usage.hourly / usage.rateLimits.limits.hourly) * 100} 
                          className="h-2" 
                        />
                        <div className="text-xs text-gray-500">
                          {usage.rateLimits.remaining.hourly} remaining this hour
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Daily Limits */}
                <div>
                  <h4 className="font-medium mb-3">Daily Rate Limits</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Prompts Used</span>
                      <span className="font-medium">
                        {usage.rateLimits.usage.daily} / {usage.rateLimits.limits.daily === -1 ? '∞' : usage.rateLimits.limits.daily}
                      </span>
                    </div>
                    {usage.rateLimits.limits.daily !== -1 && (
                      <>
                        <Progress 
                          value={(usage.rateLimits.usage.daily / usage.rateLimits.limits.daily) * 100} 
                          className="h-2" 
                        />
                        <div className="text-xs text-gray-500">
                          {usage.rateLimits.remaining.daily} remaining today
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-6">
              {breakdown ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div>
                    <h4 className="font-medium mb-3">Usage by Category</h4>
                    <div className="space-y-2">
                      {breakdown.categories.slice(0, 5).map((cat, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span className="text-sm capitalize">{cat.category.replace('-', ' ')}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{cat.tokens} tokens</div>
                            <div className="text-xs text-gray-500">{cat.count} prompts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Daily Usage Chart */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Daily Usage</h4>
                    <div className="space-y-2">
                      {breakdown.dailyUsage.slice(-7).map((day, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span className="text-sm">{formatDate(day.date)}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{day.tokens} tokens</div>
                            <div className="text-xs text-gray-500">{day.prompts} prompts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No usage history available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}