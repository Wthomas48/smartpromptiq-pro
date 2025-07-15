// src/components/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Clock, Target, 
  Star, Zap, Brain, Award, Calendar, Download, Share2, RefreshCw,
  Eye, Heart, MessageCircle, FileText, Filter, ArrowUp, ArrowDown,
  Globe, Layers, Code, Palette, Megaphone, GraduationCap,
  CheckCircle, AlertTriangle, Info, ChevronRight, Play,
  Settings, ExternalLink, Bookmark, Timer, Coffee, Lightbulb,
  Crown, Flame, ThumbsUp, Activity, PieChart, LineChart
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalPrompts: number;
    totalUsage: number;
    successRate: number;
    avgRating: number;
    totalTimeSpent: string;
    activeStreak: number;
  };
  trends: {
    period: string;
    promptsCreated: number;
    usageCount: number;
    successRate: number;
    change: number;
  }[];
  categories: {
    name: string;
    count: number;
    percentage: number;
    successRate: number;
    avgRating: number;
    color: string;
  }[];
  topPrompts: {
    id: string;
    title: string;
    category: string;
    usageCount: number;
    successRate: number;
    rating: number;
    lastUsed: string;
  }[];
  performance: {
    daily: { date: string; prompts: number; usage: number; success: number; }[];
    weekly: { week: string; prompts: number; usage: number; success: number; }[];
    monthly: { month: string; prompts: number; usage: number; success: number; }[];
  };
  insights: {
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }[];
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock analytics data - replace with real API calls
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData: AnalyticsData = {
        overview: {
          totalPrompts: 47,
          totalUsage: 284,
          successRate: 89,
          avgRating: 4.6,
          totalTimeSpent: "23h 45m",
          activeStreak: 12
        },
        trends: [
          { period: 'This Week', promptsCreated: 8, usageCount: 45, successRate: 92, change: 15 },
          { period: 'Last Week', promptsCreated: 7, usageCount: 39, successRate: 87, change: -3 },
          { period: '2 Weeks Ago', promptsCreated: 6, usageCount: 28, successRate: 85, change: 8 },
          { period: '3 Weeks Ago', promptsCreated: 9, usageCount: 52, successRate: 91, change: 12 }
        ],
        categories: [
          { name: 'Marketing', count: 15, percentage: 32, successRate: 94, avgRating: 4.8, color: 'from-pink-500 to-rose-500' },
          { name: 'Development', count: 12, percentage: 26, successRate: 87, avgRating: 4.5, color: 'from-green-500 to-emerald-500' },
          { name: 'Content', count: 8, percentage: 17, successRate: 91, avgRating: 4.7, color: 'from-blue-500 to-indigo-500' },
          { name: 'Business', count: 7, percentage: 15, successRate: 85, avgRating: 4.4, color: 'from-purple-500 to-violet-500' },
          { name: 'Creative', count: 3, percentage: 6, successRate: 93, avgRating: 4.9, color: 'from-orange-500 to-amber-500' },
          { name: 'Education', count: 2, percentage: 4, successRate: 88, avgRating: 4.3, color: 'from-teal-500 to-cyan-500' }
        ],
        topPrompts: [
          {
            id: '1',
            title: 'Viral Marketing Campaign Creator',
            category: 'Marketing',
            usageCount: 43,
            successRate: 96,
            rating: 4.9,
            lastUsed: '2 hours ago'
          },
          {
            id: '2',
            title: 'API Documentation Generator',
            category: 'Development',
            usageCount: 38,
            successRate: 91,
            rating: 4.7,
            lastUsed: '1 day ago'
          },
          {
            id: '3',
            title: 'Blog Post Outline Creator',
            category: 'Content',
            usageCount: 35,
            successRate: 94,
            rating: 4.8,
            lastUsed: '3 hours ago'
          },
          {
            id: '4',
            title: 'Business Strategy Framework',
            category: 'Business',
            usageCount: 29,
            successRate: 87,
            rating: 4.5,
            lastUsed: '2 days ago'
          },
          {
            id: '5',
            title: 'Brand Identity Designer',
            category: 'Creative',
            usageCount: 24,
            successRate: 93,
            rating: 4.8,
            lastUsed: '1 day ago'
          }
        ],
        performance: {
          daily: [
            { date: '2024-01-15', prompts: 3, usage: 12, success: 11 },
            { date: '2024-01-16', prompts: 2, usage: 8, success: 7 },
            { date: '2024-01-17', prompts: 4, usage: 15, success: 14 },
            { date: '2024-01-18', prompts: 1, usage: 6, success: 5 },
            { date: '2024-01-19', prompts: 5, usage: 18, success: 16 },
            { date: '2024-01-20', prompts: 3, usage: 11, success: 10 },
            { date: '2024-01-21', prompts: 2, usage: 9, success: 8 }
          ],
          weekly: [
            { week: 'Week 1', prompts: 12, usage: 67, success: 59 },
            { week: 'Week 2', prompts: 15, usage: 89, success: 78 },
            { week: 'Week 3', prompts: 8, usage: 45, success: 41 },
            { week: 'Week 4', prompts: 12, usage: 83, success: 76 }
          ],
          monthly: [
            { month: 'Oct', prompts: 38, usage: 156, success: 142 },
            { month: 'Nov', prompts: 42, usage: 189, success: 167 },
            { month: 'Dec', prompts: 47, usage: 284, success: 253 },
            { month: 'Jan', prompts: 20, usage: 134, success: 118 }
          ]
        },
        insights: [
          {
            type: 'success',
            title: 'Excellent Performance This Week',
            description: 'Your success rate improved by 15% compared to last week. Marketing prompts are performing exceptionally well.',
            action: 'View Marketing Analytics'
          },
          {
            type: 'info',
            title: 'New Category Opportunity',
            description: 'You haven\'t created any Education prompts yet. This category shows high engagement rates among similar users.',
            action: 'Explore Education Templates'
          },
          {
            type: 'warning',
            title: 'Optimization Suggestion',
            description: 'Your Development prompts have a lower success rate. Consider using more specific examples and constraints.',
            action: 'View Optimization Tips'
          }
        ]
      };
      
      setAnalyticsData(mockData);
      setIsLoading(false);
    };

    loadAnalytics();
  }, []);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <ArrowRight className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analytics...</h3>
            <p className="text-gray-600">Analyzing your prompt performance and usage patterns</p>
            <div className="mt-6">
              <Progress value={75} className="w-64 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Track your prompt performance and discover insights to improve your results
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-xs">Total</Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalPrompts}</div>
              <p className="text-sm text-gray-600">Prompts Created</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <Badge variant="outline" className="text-xs">Usage</Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalUsage}</div>
              <p className="text-sm text-gray-600">Times Used</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <Badge variant="outline" className="text-xs">Rate</Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.successRate}%</div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <Badge variant="outline" className="text-xs">Avg</Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgRating}</div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="w-4 h-4 text-indigo-600" />
                </div>
                <Badge variant="outline" className="text-xs">Time</Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalTimeSpent}</div>
              <p className="text-sm text-gray-600">Time Spent</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="w-4 h-4 text-orange-600" />
                </div>
                <Badge variant="outline" className="text-xs">Streak</Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeStreak}</div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="prompts">Top Prompts</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Trends */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance Trends
                    </CardTitle>
                    <CardDescription>
                      Weekly performance comparison and growth metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{trend.period}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              <span>{trend.promptsCreated} prompts</span>
                              <span>{trend.usageCount} usage</span>
                              <span>{trend.successRate}% success</span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 ${getChangeColor(trend.change)}`}>
                            {getChangeIcon(trend.change)}
                            <span className="text-sm font-medium">
                              {Math.abs(trend.change)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Prompts
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Play className="w-4 h-4 mr-2" />
                      Create New Prompt
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Analytics Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Goals Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Goal</span>
                        <span>47/50</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate Target</span>
                        <span>89/90%</span>
                      </div>
                      <Progress value={99} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Categories Explored</span>
                        <span>6/8</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance Over Time
                </CardTitle>
                <CardDescription>
                  Track your prompt creation and usage patterns
                </CardDescription>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={selectedPeriod === 'daily' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('daily')}
                  >
                    Daily
                  </Button>
                  <Button 
                    variant={selectedPeriod === 'weekly' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('weekly')}
                  >
                    Weekly
                  </Button>
                  <Button 
                    variant={selectedPeriod === 'monthly' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedPeriod('monthly')}
                  >
                    Monthly
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {analyticsData.performance[selectedPeriod].map((period, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-12 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {selectedPeriod === 'daily' ? new Date(period.date || '').toLocaleDateString() : 
                             selectedPeriod === 'weekly' ? period.week : period.month}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {Math.round((period.success / period.usage) * 100)}% success rate
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{period.prompts}</div>
                          <div className="text-gray-500">Prompts</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{period.usage}</div>
                          <div className="text-gray-500">Usage</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{period.success}</div>
                          <div className="text-gray-500">Success</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Category Performance
                </CardTitle>
                <CardDescription>
                  Breakdown of your prompts by category and their performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.categories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <Badge variant="outline">{category.count} prompts</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Usage Share</span>
                            <span className="font-medium">{category.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Success Rate</span>
                          <span className="font-medium text-green-600">{category.successRate}%</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="font-medium">{category.avgRating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Prompts Tab */}
          <TabsContent value="prompts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Performing Prompts
                </CardTitle>
                <CardDescription>
                  Your most successful and frequently used prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPrompts.map((prompt, index) => (
                    <div key={prompt.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {prompt.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <Badge variant="outline" className="text-xs">{prompt.category}</Badge>
                            <span>Last used {prompt.lastUsed}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{prompt.usageCount}</div>
                          <div className="text-gray-500">Uses</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{prompt.successRate}%</div>
                          <div className="text-gray-500">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center gap-1 font-semibold text-yellow-600">
                            <Star className="w-3 h-3 fill-current" />
                            {prompt.rating}
                          </div>
                          <div className="text-gray-500">Rating</div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      AI-Powered Insights
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations to improve your prompt performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.insights.map((insight, index) => (
                        <div key={index} className={`p-4 border rounded-lg ${getInsightBgColor(insight.type)}`}>
                          <div className="flex items-start gap-3">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                              <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                              {insight.action && (
                                <Button variant="outline" size="sm">
                                  {insight.action}
                                  <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Improvement Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 text-sm mb-1">Add More Examples</h4>
                      <p className="text-blue-700 text-xs">Prompts with examples have 23% higher success rates</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 text-sm mb-1">Use Constraints</h4>
                      <p className="text-green-700 text-xs">Adding constraints improves output quality by 31%</p>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-medium text-purple-900 text-sm mb-1">Specify Output Format</h4>
                      <p className="text-purple-700 text-xs">Clear format instructions reduce revision time by 45%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Challenge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-3">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Create 5 Education Prompts</h3>
                      <p className="text-sm text-gray-600 mb-3">Explore the Education category to earn bonus XP</p>
                      <Progress value={20} className="mb-3" />
                      <p className="text-xs text-gray-500">1 of 5 completed</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}