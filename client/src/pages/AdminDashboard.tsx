import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Eye,
  RefreshCw,
  Download,
  Settings,
  Activity,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  LogOut,
  User,
  Clock,
  Database,
  Key,
  Lock,
  Save,
  UserX,
  Mail,
  Server,
  HardDrive,
  Cpu,
  Globe,
  FileText,
  Bell
} from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalCosts: number;
  profitMargin: number;
  averageMargin: number;
}

interface TierAnalysis {
  users: number;
  monthlyRevenue: number;
  totalCosts: number;
  profit: number;
  marginPercentage: number;
  profitMultiplier: number;
  averageRevenuePerUser: number;
  averageCostPerUser: number;
}

interface RiskUser {
  userId: string;
  email: string;
  tier: string;
  costRatio: number;
  costs: number;
  revenue: number;
  severity: 'WARNING' | 'CRITICAL';
}

interface CostAuditResult {
  totalUsers: number;
  warnings: RiskUser[];
  critical: RiskUser[];
  suspended: string[];
  healthy: number;
  auditTime: string;
}

interface AdminCostData {
  systemMetrics: SystemMetrics;
  tierAnalysis: Record<string, TierAnalysis>;
  riskUsers: RiskUser[];
  auditResults: CostAuditResult;
  recommendations: Array<{
    type: string;
    message: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    tier?: string;
  }>;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [adminSession, setAdminSession] = useState<{
    loginTime: string;
    sessionDuration: string;
  } | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Check admin authentication and set session info
  useEffect(() => {
    const isAdminAuthenticated = sessionStorage.getItem('admin-authenticated') === 'true';
    const loginTime = sessionStorage.getItem('admin-login-time');

    if (!isAdminAuthenticated) {
      window.location.href = '/admin/login';
      return;
    }

    // Set session info
    const sessionStart = loginTime ? new Date(loginTime) : new Date();
    if (!loginTime) {
      sessionStorage.setItem('admin-login-time', sessionStart.toISOString());
    }

    setAdminSession({
      loginTime: sessionStart.toLocaleString(),
      sessionDuration: calculateSessionDuration(sessionStart)
    });

    // Update session duration every minute
    const interval = setInterval(() => {
      setAdminSession(prev => prev ? {
        ...prev,
        sessionDuration: calculateSessionDuration(sessionStart)
      } : null);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const calculateSessionDuration = (startTime: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60); // minutes
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-authenticated');
    sessionStorage.removeItem('admin-login-time');
    toast({
      title: "Logged Out",
      description: "Admin session terminated successfully.",
    });
    window.location.href = '/admin/login';
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    // Get current admin password from sessionStorage or use default
    const currentAdminPassword = sessionStorage.getItem('admin-password') || 'Admin123!';

    // Validation
    if (passwordForm.currentPassword !== currentAdminPassword) {
      toast({
        title: "Error",
        description: "Current admin password is incorrect.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New admin password must be at least 8 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New admin passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    // Update admin password in sessionStorage (in production, this would be in database)
    sessionStorage.setItem('admin-password', passwordForm.newPassword);

    toast({
      title: "Admin Password Updated",
      description: "Admin password has been changed successfully. You will be logged out for security.",
    });

    // Clear form and close dialog
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordDialog(false);

    // Force logout for security
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  // Fetch admin cost data - using mock data for now
  const { data: costData, isLoading, error } = useQuery<AdminCostData>({
    queryKey: ['/api/admin/cost-dashboard'],
    queryFn: async () => {
      // Mock data for demo purposes
      return {
        systemMetrics: {
          totalUsers: 1247,
          activeUsers: 892,
          totalRevenue: 45600,
          totalCosts: 12340,
          profitMargin: 73.0,
          averageMargin: 3.7
        },
        tierAnalysis: {
          FREE: {
            users: 845,
            monthlyRevenue: 0,
            totalCosts: 4200,
            profit: -4200,
            marginPercentage: -100,
            profitMultiplier: 0,
            averageRevenuePerUser: 0,
            averageCostPerUser: 4.97
          },
          PREMIUM: {
            users: 302,
            monthlyRevenue: 30200,
            totalCosts: 6800,
            profit: 23400,
            marginPercentage: 77.5,
            profitMultiplier: 4.4,
            averageRevenuePerUser: 100,
            averageCostPerUser: 22.52
          },
          ENTERPRISE: {
            users: 100,
            monthlyRevenue: 15400,
            totalCosts: 1340,
            profit: 14060,
            marginPercentage: 91.3,
            profitMultiplier: 11.5,
            averageRevenuePerUser: 154,
            averageCostPerUser: 13.40
          }
        },
        riskUsers: [
          {
            userId: 'user_123',
            email: 'heavy.user@example.com',
            tier: 'FREE',
            costRatio: 1.2,
            costs: 1200,
            revenue: 0,
            severity: 'CRITICAL'
          },
          {
            userId: 'user_456',
            email: 'power.user@example.com',
            tier: 'PREMIUM',
            costRatio: 0.85,
            costs: 850,
            revenue: 1000,
            severity: 'WARNING'
          }
        ],
        auditResults: {
          totalUsers: 1247,
          warnings: 23,
          critical: 8,
          suspended: 2,
          healthy: 1214,
          auditTime: new Date().toISOString()
        },
        recommendations: [
          {
            type: 'cost_protection',
            message: '8 users have critical cost ratios. Review immediately.',
            priority: 'HIGH'
          },
          {
            type: 'tier_optimization',
            message: 'FREE tier has negative profit margin. Consider implementing usage limits.',
            priority: 'HIGH',
            tier: 'FREE'
          },
          {
            type: 'user_engagement',
            message: 'User engagement is healthy at 71.5% active users.',
            priority: 'LOW'
          }
        ]
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Run cost audit mutation - using mock data for now
  const runCostAudit = useMutation({
    mutationFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock audit results
      return {
        timestamp: new Date().toISOString(),
        usersAudited: 1247,
        costThresholdViolations: 12,
        suspensionsApplied: 3,
        warningsIssued: 27,
        summary: 'Cost audit completed successfully. 3 users suspended due to critical cost ratios.'
      };
    },
    onSuccess: () => {
      toast({
        title: 'Cost Audit Completed',
        description: 'System-wide cost audit has been completed successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cost-dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Audit Failed',
        description: error.message || 'Failed to run cost audit',
        variant: 'destructive',
      });
    },
  });

  // Override cost protection for user
  const overrideCostProtection = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await apiRequest('POST', '/api/admin/override-cost-protection', {
        userId,
        reason,
        temporaryLimit: 10000, // $100 temporary limit
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Override Applied',
        description: 'Cost protection has been overridden for the user.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cost-dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Override Failed',
        description: error.message || 'Failed to override cost protection',
        variant: 'destructive',
      });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['/api/admin/cost-dashboard'] });
    setRefreshing(false);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-600';
      case 'MEDIUM': return 'bg-yellow-600';
      case 'LOW': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cost dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
            <p className="text-gray-600 mb-4">Failed to load cost dashboard data.</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!costData) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <BackButton />
      {/* Admin Navigation Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Admin info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Shield className="text-white" size={16} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">SmartPromptIQ Admin</h1>
                  <p className="text-xs text-gray-500">Administrator Panel</p>
                </div>
              </div>

              {adminSession && (
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>Session: {adminSession.sessionDuration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>admin@smartpromptiq.net</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Database size={14} />
                    <span>System Status: Online</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">1,247 Active Users</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={() => runCostAudit.mutate()} disabled={runCostAudit.isPending}>
                <Shield className="w-4 h-4 mr-2" />
                Run Audit
              </Button>

              {/* Password Management Dialog */}
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handlePasswordChange}>
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Lock className="w-5 h-5 text-blue-600" />
                        <span>Change Admin Password</span>
                      </DialogTitle>
                      <DialogDescription>
                        Update your administrator password. You will be logged out after changing the admin password for security.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Admin Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          required
                          placeholder="Enter current admin password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Admin Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          required
                          minLength={8}
                          placeholder="Enter new admin password (min 8 characters)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Admin Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                          placeholder="Confirm new admin password"
                        />
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                          <div>
                            <p className="text-sm text-amber-700 font-medium">Security Notice</p>
                            <p className="text-xs text-amber-600 mt-1">
                              You will be automatically logged out after changing your password for security reasons.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Cost Protection Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor system costs, profit margins, and user risk levels</p>

          {adminSession && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Dashboard</span>
              </div>
              <div>Last Updated: {new Date().toLocaleTimeString()}</div>
              <div>Session Started: {adminSession.loginTime}</div>
            </div>
          )}
        </div>

        {/* Critical Alerts */}
        {(costData.riskUsers.some(u => u.severity === 'CRITICAL') || costData.systemMetrics.profitMargin < 20) && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle className="text-red-800">Critical Issues Detected</AlertTitle>
            <AlertDescription className="text-red-700">
              {costData.riskUsers.filter(u => u.severity === 'CRITICAL').length > 0 && (
                <div>{costData.riskUsers.filter(u => u.severity === 'CRITICAL').length} users with critical cost ratios.</div>
              )}
              {costData.systemMetrics.profitMargin < 20 && (
                <div>System profit margin is below 20% ({formatPercentage(costData.systemMetrics.profitMargin)}).</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(costData.systemMetrics.totalRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                From {costData.systemMetrics.totalUsers} total users
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Costs</p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(costData.systemMetrics.totalCosts)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                API + infrastructure costs
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                  <p className={`text-3xl font-bold ${
                    costData.systemMetrics.profitMargin >= 30 ? 'text-green-600' :
                    costData.systemMetrics.profitMargin >= 20 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(costData.systemMetrics.profitMargin)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  costData.systemMetrics.profitMargin >= 30 ? 'bg-green-100' :
                  costData.systemMetrics.profitMargin >= 20 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${
                    costData.systemMetrics.profitMargin >= 30 ? 'text-green-600' :
                    costData.systemMetrics.profitMargin >= 20 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Target: {'>'}30%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Risk Users</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {costData.riskUsers.length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {costData.riskUsers.filter(u => u.severity === 'CRITICAL').length} critical
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b">
                <TabsList className="h-14 w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger value="overview" className="rounded-none">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="tiers" className="rounded-none">
                    <PieChart className="w-4 h-4 mr-2" />
                    Tier Analysis
                  </TabsTrigger>
                  <TabsTrigger value="risks" className="rounded-none">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Risk Management
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="rounded-none">
                    <Settings className="w-4 h-4 mr-2" />
                    Recommendations
                  </TabsTrigger>
                  <TabsTrigger value="system" className="rounded-none">
                    <Server className="w-4 h-4 mr-2" />
                    System Management
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* System Health */}
                    <Card>
                      <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Overall system performance metrics</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Active Users</span>
                            <span>{costData.systemMetrics.activeUsers} / {costData.systemMetrics.totalUsers}</span>
                          </div>
                          <Progress 
                            value={(costData.systemMetrics.activeUsers / costData.systemMetrics.totalUsers) * 100} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Profit Margin</span>
                            <span>{formatPercentage(costData.systemMetrics.profitMargin)}</span>
                          </div>
                          <Progress 
                            value={Math.min(costData.systemMetrics.profitMargin, 100)}
                            className="h-3"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Margin Multiplier</span>
                            <span>{costData.systemMetrics.averageMargin.toFixed(2)}x</span>
                          </div>
                          <Progress 
                            value={Math.min((costData.systemMetrics.averageMargin / 5) * 100, 100)}
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Audit Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Last Audit Results</CardTitle>
                        <CardDescription>
                          {new Date(costData.auditResults.auditTime).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {costData.auditResults.healthy}
                            </div>
                            <div className="text-sm text-gray-600">Healthy Users</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">
                              {costData.auditResults.warnings.length}
                            </div>
                            <div className="text-sm text-gray-600">Warnings</div>
                          </div>
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                              {costData.auditResults.critical.length}
                            </div>
                            <div className="text-sm text-gray-600">Critical</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600">
                              {costData.auditResults.suspended.length}
                            </div>
                            <div className="text-sm text-gray-600">Suspended</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tiers" className="mt-0">
                  <div className="space-y-6">
                    {Object.entries(costData.tierAnalysis).map(([tier, analysis]) => (
                      <Card key={tier}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="capitalize">{tier} Tier</span>
                            <Badge 
                              className={`${
                                analysis.marginPercentage >= 30 ? 'bg-green-600' :
                                analysis.marginPercentage >= 20 ? 'bg-yellow-600' : 'bg-red-600'
                              } text-white`}
                            >
                              {formatPercentage(analysis.marginPercentage)} margin
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">Users</div>
                              <div className="text-xl font-bold">{analysis.users}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Monthly Revenue</div>
                              <div className="text-xl font-bold text-green-600">
                                {formatCurrency(analysis.monthlyRevenue)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Total Costs</div>
                              <div className="text-xl font-bold text-red-600">
                                {formatCurrency(analysis.totalCosts)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Profit</div>
                              <div className={`text-xl font-bold ${
                                analysis.profit > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(analysis.profit)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Avg Revenue/User: </span>
                              <span className="font-medium">{formatCurrency(analysis.averageRevenuePerUser)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Avg Cost/User: </span>
                              <span className="font-medium">{formatCurrency(analysis.averageCostPerUser)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="risks" className="mt-0">
                  <div className="space-y-4">
                    {costData.riskUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">All Users Healthy</h3>
                        <p className="text-gray-600">No users currently exceed cost safety thresholds.</p>
                      </div>
                    ) : (
                      costData.riskUsers.map((user) => (
                        <Card key={user.userId} className={getSeverityColor(user.severity)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{user.email}</div>
                                <div className="text-sm opacity-75">
                                  {user.tier} plan • Cost ratio: {(user.costRatio * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm opacity-75 mt-1">
                                  Revenue: {formatCurrency(user.revenue)} • Costs: {formatCurrency(user.costs)}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getSeverityColor(user.severity)}>
                                  {user.severity}
                                </Badge>
                                {user.severity === 'CRITICAL' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => overrideCostProtection.mutate({
                                      userId: user.userId,
                                      reason: 'Admin override - reviewed user account'
                                    })}
                                    disabled={overrideCostProtection.isPending}
                                  >
                                    Override
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-0">
                  <div className="space-y-4">
                    {costData.recommendations.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Actions Needed</h3>
                        <p className="text-gray-600">System is operating within optimal parameters.</p>
                      </div>
                    ) : (
                      costData.recommendations.map((rec, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                                {rec.priority}
                              </Badge>
                              <div className="flex-1">
                                <div className="font-medium capitalize">{rec.type.replace('_', ' ')}</div>
                                <div className="text-sm text-gray-600 mt-1">{rec.message}</div>
                                {rec.tier && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    Affects: {rec.tier} tier
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* System Management Tab */}
                <TabsContent value="system" className="mt-0">
                  <div className="space-y-6">
                    {/* System Health Monitoring */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Server className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Server Status</p>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="font-semibold text-green-600">Online</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Cpu className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">CPU Usage</p>
                              <p className="font-semibold">23%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <HardDrive className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Disk Usage</p>
                              <p className="font-semibold">45.2 GB</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Globe className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">API Requests</p>
                              <p className="font-semibold">12.4K/day</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Admin Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Settings className="w-5 h-5" />
                          <span>System Administration</span>
                        </CardTitle>
                        <CardDescription>
                          Manage system settings, user accounts, and maintenance tasks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* User Management */}
                          <Card className="border-2 hover:border-blue-200 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold">User Management</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-4">
                                Manage user accounts, roles, and permissions
                              </p>
                              <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View All Users
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend Users
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Email System */}
                          <Card className="border-2 hover:border-green-200 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Mail className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-semibold">Email System</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-4">
                                Send notifications and manage email templates
                              </p>
                              <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <Bell className="w-4 h-4 mr-2" />
                                  Send Broadcast
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Email Templates
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* System Logs */}
                          <Card className="border-2 hover:border-purple-200 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <Activity className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-semibold">System Logs</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-4">
                                View system activity and error logs
                              </p>
                              <div className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Logs
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <Download className="w-4 h-4 mr-2" />
                                  Export Logs
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>

                    {/* System Maintenance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-orange-600">
                          <AlertTriangle className="w-5 h-5" />
                          <span>System Maintenance</span>
                        </CardTitle>
                        <CardDescription>
                          Perform maintenance tasks and system optimization
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Database Maintenance</h4>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <Database className="w-4 h-4 mr-2" />
                                Optimize Database
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <Download className="w-4 h-4 mr-2" />
                                Backup Database
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <Activity className="w-4 h-4 mr-2" />
                                Clear Old Logs
                              </Button>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">System Information</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Uptime:</span>
                                <span className="font-medium">15 days, 4 hours</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Version:</span>
                                <span className="font-medium">v2.1.3</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Last Backup:</span>
                                <span className="font-medium">2 hours ago</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Environment:</span>
                                <span className="font-medium text-green-600">Production</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Emergency Actions */}
                    <Card className="border-red-200">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-600">
                          <Shield className="w-5 h-5" />
                          <span>Emergency Controls</span>
                        </CardTitle>
                        <CardDescription className="text-red-600">
                          Use these controls only in emergency situations
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Maintenance Mode
                          </Button>
                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                            <UserX className="w-4 h-4 mr-2" />
                            Suspend All Users
                          </Button>
                          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                            <Server className="w-4 h-4 mr-2" />
                            System Restart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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