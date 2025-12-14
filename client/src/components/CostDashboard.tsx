/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - COST MANAGEMENT DASHBOARD
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Admin dashboard for monitoring API costs, usage, and profitability.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Zap,
  RefreshCw,
  Shield,
  ShieldOff,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Coins,
  Server,
  Database,
  Cpu,
  Power,
  PowerOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// Types
interface CostStats {
  daily: {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    alerts: {
      warning: boolean;
      critical: boolean;
      shutdown: boolean;
    };
  };
  monthly: {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    alerts: {
      warning: boolean;
      critical: boolean;
      shutdown: boolean;
    };
  };
  profitMetrics: {
    daily: {
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    };
  };
  costByProvider: Array<{
    provider: string;
    _sum: { cost: number };
    _count: number;
  }>;
  costByFeature: Array<{
    action: string;
    _sum: { cost: number; tokensUsed: number };
    _count: number;
  }>;
  controlFlags: Record<string, boolean>;
  thresholds: {
    daily: { warning: number; critical: number; shutdown: number };
    monthly: { warning: number; critical: number; shutdown: number };
    perUser: { daily: number; monthly: number };
  };
}

interface HighSpender {
  userId: string;
  user: { email: string; name: string; subscriptionTier: string };
  _sum: { cost: number };
  _count: number;
  isAboveThreshold: boolean;
}

export default function CostDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<CostStats | null>(null);
  const [highSpenders, setHighSpenders] = useState<HighSpender[]>([]);
  const [controlFlags, setControlFlags] = useState<Record<string, boolean>>({});

  // Fetch dashboard data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashboardRes, spendersRes] = await Promise.all([
        fetch('/api/costs/admin/dashboard'),
        fetch('/api/costs/admin/high-spenders?period=daily'),
      ]);

      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setStats(data.data);
        setControlFlags(data.data.controlFlags || {});
      }

      if (spendersRes.ok) {
        const data = await spendersRes.json();
        setHighSpenders(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching cost data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cost data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Toggle cost control flag
  const toggleFlag = async (flag: string, value: boolean) => {
    try {
      const res = await fetch('/api/costs/admin/set-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flags: { [flag]: value } }),
      });

      if (res.ok) {
        setControlFlags(prev => ({ ...prev, [flag]: value }));
        toast({
          title: 'Setting Updated',
          description: `${flag} is now ${value ? 'enabled' : 'disabled'}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  // Emergency shutdown
  const emergencyShutdown = async () => {
    if (!confirm('Are you sure you want to disable all expensive features?')) return;

    try {
      const res = await fetch('/api/costs/admin/emergency-shutdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual admin shutdown' }),
      });

      if (res.ok) {
        toast({
          title: 'Emergency Shutdown Activated',
          description: 'All expensive features have been disabled',
          variant: 'destructive',
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate emergency shutdown',
        variant: 'destructive',
      });
    }
  };

  // Restore features
  const restoreFeatures = async () => {
    try {
      const res = await fetch('/api/costs/admin/restore', {
        method: 'POST',
      });

      if (res.ok) {
        toast({
          title: 'Features Restored',
          description: 'All features have been re-enabled',
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore features',
        variant: 'destructive',
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get alert status color
  const getAlertColor = (alerts: { warning: boolean; critical: boolean; shutdown: boolean }) => {
    if (alerts.shutdown) return 'text-red-500 bg-red-500/10';
    if (alerts.critical) return 'text-orange-500 bg-orange-500/10';
    if (alerts.warning) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-green-500 bg-green-500/10';
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cost Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Monitor API costs and usage in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="destructive" onClick={emergencyShutdown}>
            <PowerOff className="w-4 h-4 mr-2" />
            Emergency Shutdown
          </Button>
          <Button variant="default" onClick={restoreFeatures}>
            <Power className="w-4 h-4 mr-2" />
            Restore All
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {stats?.daily.alerts.critical && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
        >
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h4 className="font-semibold text-red-500">Critical Cost Alert!</h4>
            <p className="text-sm text-red-400">
              Daily API costs have exceeded critical threshold. Consider enabling emergency shutdown.
            </p>
          </div>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Cost */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily API Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.daily.totalCost || 0)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getAlertColor(stats?.daily.alerts || { warning: false, critical: false, shutdown: false })}`}>
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={((stats?.daily.totalCost || 0) / (stats?.thresholds.daily.shutdown || 1000)) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(stats?.daily.totalCost || 0)} / {formatCurrency(stats?.thresholds.daily.shutdown || 1000)} limit
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Revenue */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.profitMetrics.daily.revenue || 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              From {stats?.daily.totalTokens?.toLocaleString() || 0} tokens used
            </p>
          </CardContent>
        </Card>

        {/* Daily Profit */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Profit</p>
                <p className={`text-2xl font-bold ${(stats?.profitMetrics.daily.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(stats?.profitMetrics.daily.profit || 0)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${(stats?.profitMetrics.daily.profit || 0) >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {(stats?.profitMetrics.daily.profit || 0) >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats?.profitMetrics.daily.margin?.toFixed(1) || 0}% margin
            </p>
          </CardContent>
        </Card>

        {/* Daily Requests */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.daily.totalRequests?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Avg {formatCurrency((stats?.daily.totalCost || 0) / (stats?.daily.totalRequests || 1))}/request
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Control Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Cost Control Settings
          </CardTitle>
          <CardDescription>
            Toggle expensive features on/off to control costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'enableGPT4', label: 'GPT-4', description: 'Most expensive model', icon: <Cpu className="w-4 h-4" /> },
              { key: 'enableDALLE3', label: 'DALL-E 3', description: 'HD image generation', icon: <PieChart className="w-4 h-4" /> },
              { key: 'enableElevenLabs', label: 'ElevenLabs', description: 'Premium voices', icon: <Activity className="w-4 h-4" /> },
              { key: 'enableSuno', label: 'Suno AI', description: 'Music generation', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((flag) => (
              <div
                key={flag.key}
                className={`p-4 rounded-lg border ${controlFlags[flag.key] ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {flag.icon}
                    <span className="font-medium">{flag.label}</span>
                  </div>
                  <Switch
                    checked={controlFlags[flag.key]}
                    onCheckedChange={(checked) => toggleFlag(flag.key, checked)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{flag.description}</p>
                <Badge className={`mt-2 ${controlFlags[flag.key] ? 'bg-green-500' : 'bg-red-500'}`}>
                  {controlFlags[flag.key] ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost by Provider & Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-500" />
              Cost by Provider (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.costByProvider?.map((provider, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Database className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium">{provider.provider || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{provider._count} requests</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(provider._sum.cost || 0)}</p>
                  </div>
                </div>
              ))}
              {(!stats?.costByProvider || stats.costByProvider.length === 0) && (
                <p className="text-gray-500 text-center py-4">No data yet today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Features by Cost */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              Top Features by Cost (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.costByFeature?.slice(0, 8).map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{feature.action}</p>
                    <p className="text-xs text-gray-500">
                      {feature._count} uses · {feature._sum.tokensUsed || 0} tokens
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {formatCurrency(feature._sum.cost || 0)}
                  </Badge>
                </div>
              ))}
              {(!stats?.costByFeature || stats.costByFeature.length === 0) && (
                <p className="text-gray-500 text-center py-4">No data yet today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Spenders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            High Cost Users (Today)
          </CardTitle>
          <CardDescription>
            Users with highest API costs - potential abuse detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tier</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Requests</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">API Cost</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {highSpenders.map((spender, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{spender.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{spender.user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{spender.user?.subscriptionTier || 'free'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">{spender._count}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(spender._sum.cost || 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {spender.isAboveThreshold ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Above Threshold
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Normal
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {highSpenders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No high-cost users detected today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Total Cost</p>
              <p className="text-xl font-bold">{formatCurrency(stats?.monthly.totalCost || 0)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Total Tokens</p>
              <p className="text-xl font-bold">{stats?.monthly.totalTokens?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-xl font-bold">{stats?.monthly.totalRequests?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-500">Avg Cost/Request</p>
              <p className="text-xl font-bold">
                {formatCurrency((stats?.monthly.totalCost || 0) / (stats?.monthly.totalRequests || 1))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
