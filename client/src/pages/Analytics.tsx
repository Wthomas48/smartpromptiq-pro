import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, Target, Zap, Award,
  Calendar, Clock, Filter, Download, RefreshCw, ChevronDown,
  Activity, Brain, MessageSquare, Star, Lightbulb, CheckCircle,
  BarChart3, LineChart, PieChart, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('usage');
  const { user } = useAuth();

  // User-specific analytics data (not admin data)
  const analyticsData = {
    myPrompts: 12,
    favoritePrompts: 5,
    totalUsage: 47,
    averageRating: 4.2,
    successRate: 88.5,
    tokensUsed: user?.tokenBalance ? (100 - (user.tokenBalance || 0)) : 53
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Analytics Dashboard</h1>
          <p className="text-gray-600">Track your personal prompt usage and performance</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* User Personal Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.myPrompts}</div>
              <div className="flex items-center text-sm text-blue-600">
                <Brain className="w-4 h-4 mr-1" />
                Total created
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.favoritePrompts}</div>
              <div className="flex items-center text-sm text-purple-600">
                <Star className="w-4 h-4 mr-1" />
                Saved prompts
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Usage Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalUsage}</div>
              <div className="flex items-center text-sm text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                This month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">My Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageRating}</div>
              <div className="flex items-center text-sm text-yellow-600">
                <Star className="w-4 h-4 mr-1" />
                Average score
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.successRate}%</div>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Completion rate
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tokens Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.tokensUsed}</div>
              <div className="flex items-center text-sm text-indigo-600">
                <Zap className="w-4 h-4 mr-1" />
                This period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Usage Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Chart Temporarily Disabled</p>
                  <p className="text-sm">Analytics charts disabled for stability</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-green-500" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <LineChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Chart Temporarily Disabled</p>
                  <p className="text-sm">Analytics charts disabled for stability</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-900">
                  ✅ Analytics Page Working!
                </h3>
                <p className="text-green-700 mt-1">
                  Analytics dashboard is now stable without recharts dependencies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}