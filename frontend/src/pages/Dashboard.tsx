import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  BarChart3, 
  Zap,
  FileText,
  Bookmark,
  TrendingUp,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
  usageCount: number;
  isFavorite: boolean;
  tags: string[];
  type: 'business' | 'creative' | 'technical';
}

interface QuickStartTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'business' | 'creative' | 'technical';
  estimatedTime: string;
  icon: React.ReactNode;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real API calls
  const recentPrompts: Prompt[] = [
    {
      id: '1',
      title: 'Marketing Campaign Strategy',
      category: 'Marketing',
      description: 'Comprehensive digital marketing campaign for Q4 product launch',
      createdAt: '2024-07-08',
      usageCount: 15,
      isFavorite: true,
      tags: ['campaign', 'digital', 'strategy'],
      type: 'business'
    },
    {
      id: '2',
      title: 'Software Architecture Plan',
      category: 'Development',
      description: 'Microservices architecture for e-commerce platform',
      createdAt: '2024-07-07',
      usageCount: 8,
      isFavorite: false,
      tags: ['architecture', 'microservices', 'ecommerce'],
      type: 'technical'
    },
    {
      id: '3',
      title: 'Creative Brief Template',
      category: 'Design',
      description: 'Brand identity guidelines and visual direction',
      createdAt: '2024-07-06',
      usageCount: 22,
      isFavorite: true,
      tags: ['branding', 'design', 'guidelines'],
      type: 'creative'
    }
  ];

  const quickStartTemplates: QuickStartTemplate[] = [
    {
      id: 'business-strategy',
      title: 'Business Strategy Plan',
      description: 'Create a comprehensive business strategy with market analysis',
      category: 'Business',
      type: 'business',
      estimatedTime: '10-15 min',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'marketing-campaign',
      title: 'Marketing Campaign Brief',
      description: 'Design a creative marketing campaign with messaging',
      category: 'Marketing',
      type: 'creative',
      estimatedTime: '8-12 min',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'software-architecture',
      title: 'Software Architecture',
      description: 'Define technical requirements and system architecture',
      category: 'Development',
      type: 'technical',
      estimatedTime: '15-20 min',
      icon: <FileText className="w-6 h-6" />
    }
  ];

  const stats = {
    totalPrompts: 45,
    totalUsage: 312,
    favoritePrompts: 8,
    thisWeekUsage: 28
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'business':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'creative':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'technical':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPrompts = recentPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your dashboard</h2>
          <Button onClick={() => window.location.href = "/api/login"}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Ready to create your next amazing prompt? Let's get started.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrompts}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">
                +25% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoritePrompts}</div>
              <p className="text-xs text-muted-foreground">
                Your starred prompts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeekUsage}</div>
              <p className="text-xs text-muted-foreground">
                Prompts generated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="my-prompts">My Prompts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Start Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Quick Start Templates
                </CardTitle>
                <CardDescription>
                  Jump-start your work with our pre-configured templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {quickStartTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(template.type)}`}>
                          {template.icon}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest prompts and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPrompts.slice(0, 3).map((prompt) => (
                    <div key={prompt.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                          {prompt.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <p className="text-sm text-gray-600">{prompt.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${getTypeColor(prompt.type)}`}>
                            {prompt.category}
                          </Badge>
                          <span className="text-xs text-gray-500">Used {prompt.usageCount} times</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{prompt.createdAt}</div>
                        <Button variant="ghost" size="sm" className="mt-1">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Library</CardTitle>
                <CardDescription>
                  Browse and use our comprehensive template collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickStartTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-lg ${getTypeColor(template.type)}`}>
                            {template.icon}
                          </div>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{template.estimatedTime}</span>
                          <Button size="sm">
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-prompts" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>My Prompts</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="marketing">Marketing</option>
                    <option value="development">Development</option>
                    <option value="design">Design</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPrompts.map((prompt) => (
                    <Card key={prompt.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{prompt.title}</h3>
                              {prompt.isFavorite && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{prompt.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getTypeColor(prompt.type)}>
                                {prompt.category}
                              </Badge>
                              {prompt.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-sm text-gray-500 mb-2">{prompt.createdAt}</div>
                            <div className="text-sm text-gray-500 mb-3">Used {prompt.usageCount} times</div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button size="sm">
                                Use
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Usage Analytics
                </CardTitle>
                <CardDescription>
                  Track your prompt performance and usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    We're working on detailed analytics to help you understand your prompt usage patterns.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button size="lg" className="rounded-full shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Create New Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}