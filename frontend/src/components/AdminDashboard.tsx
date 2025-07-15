// components/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  BarChart3,
  FileText,
  Settings,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Clock,
  Database,
  Server,
  Globe,
  Eye,
  UserPlus,
  Crown,
  Zap,
  Target,
  Brain,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Calendar,
  PieChart,
  LineChart
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPrompts: number;
  todayPrompts: number;
  revenue: number;
  conversionRate: number;
  systemHealth: number;
  storageUsed: number;
}

interface UserMetrics {
  signups: number;
  signupsChange: number;
  activeUsers: number;
  activeUsersChange: number;
  churned: number;
  churnedChange: number;
  premium: number;
  premiumChange: number;
}

interface CategoryUsage {
  id: string;
  name: string;
  usage: number;
  growth: number;
  successRate: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPrompts: 0,
    todayPrompts: 0,
    revenue: 0,
    conversionRate: 0,
    systemHealth: 0,
    storageUsed: 0
  });

  // Mock data - replace with real API calls
  const [userMetrics] = useState<UserMetrics>({
    signups: 1247,
    signupsChange: 15.2,
    activeUsers: 892,
    activeUsersChange: 8.5,
    churned: 23,
    churnedChange: -12.3,
    premium: 178,
    premiumChange: 22.1
  });

  const [categoryUsage] = useState<CategoryUsage[]>([
    {
      id: 'business-strategy',
      name: 'Business Strategy',
      usage: 2847,
      growth: 23.4,
      successRate: 94.2
    },
    {
      id: 'creative',
      name: 'Creative & Design',
      usage: 1892,
      growth: 18.7,
      successRate: 87.8
    },
    {
      id: 'technical',
      name: 'Technical Development',
      usage: 1654,
      growth: 12.3,
      successRate: 91.5
    },
    {
      id: 'marketing',
      name: 'Marketing & Growth',
      usage: 1432,
      growth: 28.9,
      successRate: 88.9
    },
    {
      id: 'research',
      name: 'Research & Analysis',
      usage: 987,
      growth: 15.6,
      successRate: 85.2
    },
    {
      id: 'education',
      name: 'Education & Training',
      usage: 743,
      growth: 19.8,
      successRate: 92.1
    }
  ]);

  const [systemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High API Usage',
      message: 'OpenAI API usage is at 85% of monthly limit',
      timestamp: '2 hours ago',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'Database maintenance scheduled for Sunday 2AM UTC',
      timestamp: '1 day ago',
      resolved: false
    },
    {
      id: '3',
      type: 'error',
      title: 'Payment Failed',
      message: 'Stripe webhook failed for user subscription renewal',
      timestamp: '3 hours ago',
      resolved: true
    }
  ]);

  // Load admin stats
  useEffect(() => {
    loadAdminStats();
  }, [selectedTimeframe]);

  const loadAdminStats = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock stats based on timeframe
      const mockStats: AdminStats = {
        totalUsers: 3247,
        activeUsers: 1892,
        totalPrompts: 15847,
        todayPrompts: 342,
        revenue: 24567,
        conversionRate: 14.8,
        systemHealth: 98.5,
        storageUsed: 67.3
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMetricColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMetricIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4" />;
    if (change < 0) return <ArrowDown className="w-4 h-4" />;
    return null;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Bell className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  // Check if user has admin access
  if (!user || user.email !== 'demo@smartpromptiq.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">SmartPromptIQ Management Console</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timeframe Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadAdminStats}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Alerts */}
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                  {systemAlerts.filter(alert => !alert.resolved).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {systemAlerts.filter(alert => !alert.resolved).length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
              <div className={`flex items-center text-xs ${getMetricColor(userMetrics.signupsChange)}`}>
                {getMetricIcon(userMetrics.signupsChange)}
                <span className="ml-1">+{userMetrics.signupsChange}% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.activeUsers)}</div>
              <div className={`flex items-center text-xs ${getMetricColor(userMetrics.activeUsersChange)}`}>
                {getMetricIcon(userMetrics.activeUsersChange)}
                <span className="ml-1">+{userMetrics.activeUsersChange}% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="ml-1">+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.systemHealth}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.systemHealth}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Analytics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                User Analytics
              </CardTitle>
              <CardDescription>
                User growth and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Signups</span>
                    <span className="text-sm font-medium">{userMetrics.signups}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="text-sm font-medium">{userMetrics.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Premium Users</span>
                    <span className="text-sm font-medium">{userMetrics.premium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Churn Rate</span>
                    <span className="text-sm font-medium">{((userMetrics.churned / stats.totalUsers) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-medium">{stats.conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Session Time</span>
                    <span className="text-sm font-medium">12m 34s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Prompts</span>
                    <span className="text-sm font-medium">{stats.todayPrompts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Prompts</span>
                    <span className="text-sm font-medium">{formatNumber(stats.totalPrompts)}</span>
                  </div>
                </div>
              </div>
              
              {/* Mock Chart Area */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">User Growth Chart</p>
                  <p className="text-xs text-gray-400">Chart component would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Recent system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          alert.resolved ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {alert.title}
                        </p>
                        <p className={`text-xs ${
                          alert.resolved ? 'text-gray-400' : 'text-gray-600'
                        } mt-1`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {alert.timestamp}
                        </p>
                      </div>
                      {alert.resolved && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Usage Analytics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Usage Analytics
            </CardTitle>
            <CardDescription>
              Performance metrics for each questionnaire category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryUsage.map((category) => (
                <div key={category.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <div className={`flex items-center text-xs ${getMetricColor(category.growth)}`}>
                      {getMetricIcon(category.growth)}
                      <span className="ml-1">{category.growth}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage</span>
                      <span className="font-medium">{formatNumber(category.usage)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Success Rate</span>
                      <span className="font-medium">{category.successRate}%</span>
                    </div>
                    <Progress value={category.successRate} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col"
            onClick={() => window.location.href = '/admin/users'}
          >
            <Users className="w-6 h-6 mb-2" />
            <span>Manage Users</span>
          </Button>
          
          <Button variant="outline" className="h-20 flex-col" onClick={() => alert('User management coming soon!')}>
            onClick={() => window.location.href = '/admin/content'}
          >
            <FileText className="w-6 h-6 mb-2" />
            <span>Content Management</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col"
            onClick={() => window.location.href = '/admin/analytics'}
          >
            <BarChart3 className="w-6 h-6 mb-2" />
            <span>Advanced Analytics</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex-col"
            onClick={() => window.location.href = '/admin/settings'}
          >
            <Settings className="w-6 h-6 mb-2" />
            <span>System Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}