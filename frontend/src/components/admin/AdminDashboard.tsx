import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, BarChart3, FileText, Settings, DollarSign, AlertTriangle,
  Activity, Shield, Server, ArrowUp, Calendar, RefreshCw, Bell
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Check admin access
  if (!user || user.email !== 'demo@smartpromptiq.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          <Button onClick={() => window.location.href = '/'} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: 3247,
    activeUsers: 1892,
    totalPrompts: 15847,
    revenue: 24567,
    systemHealth: 98.5,
    todayPrompts: 342
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleUserManagement = () => {
    alert('User Management feature coming soon! This will show all users, their activity, and management options.');
  };

  const handleContentManagement = () => {
    alert('Content Management feature coming soon! This will allow you to manage questionnaires and templates.');
  };

  const handleAnalytics = () => {
    alert('Advanced Analytics feature coming soon! This will show detailed reports and insights.');
  };

  const handleSystemSettings = () => {
    alert('System Settings feature coming soon! This will allow you to configure the platform.');
  };

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
              
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
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
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="ml-1">+15.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="ml-1">+8.5% from last period</span>
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
              <Progress value={stats.systemHealth} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Analytics
              </CardTitle>
              <CardDescription>
                Key metrics and performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Prompts Generated</span>
                  <span className="text-sm font-medium">{stats.totalPrompts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prompts Today</span>
                  <span className="text-sm font-medium">{stats.todayPrompts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Premium Users</span>
                  <span className="text-sm font-medium">178</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-medium">14.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Session Time</span>
                  <span className="text-sm font-medium">12m 34s</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">High API Usage</p>
                      <p className="text-xs text-yellow-700">OpenAI API usage is at 85% of monthly limit</p>
                      <p className="text-xs text-yellow-600 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">Scheduled Maintenance</p>
                      <p className="text-xs text-blue-700">Database maintenance scheduled for Sunday 2AM UTC</p>
                      <p className="text-xs text-blue-600 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">System Backup Complete</p>
                      <p className="text-xs text-green-700">Daily backup completed successfully</p>
                      <p className="text-xs text-green-600 mt-1">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks and management tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={handleUserManagement}
              >
                <Users className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Manage Users</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={handleContentManagement}
              >
                <FileText className="w-6 h-6 text-green-600" />
                <span className="font-medium">Content Management</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={handleAnalytics}
              >
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span className="font-medium">Advanced Analytics</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                onClick={handleSystemSettings}
              >
                <Settings className="w-6 h-6 text-orange-600" />
                <span className="font-medium">System Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Usage statistics for each questionnaire category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Business Strategy', usage: 2847, growth: 23.4, color: 'blue' },
                { name: 'Creative & Design', usage: 1892, growth: 18.7, color: 'purple' },
                { name: 'Technical Development', usage: 1654, growth: 12.3, color: 'green' },
                { name: 'Marketing & Growth', usage: 1432, growth: 28.9, color: 'orange' },
                { name: 'Research & Analysis', usage: 987, growth: 15.6, color: 'cyan' },
                { name: 'Education & Training', usage: 743, growth: 19.8, color: 'pink' }
              ].map((category) => (
                <div key={category.name} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{category.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage</span>
                      <span className="font-medium">{category.usage.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Growth</span>
                      <span className="font-medium text-green-600">+{category.growth}%</span>
                    </div>
                    <Progress value={Math.min(category.growth * 2, 100)} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
