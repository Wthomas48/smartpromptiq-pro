// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Star, 
  Clock, 
  Users, 
  BarChart3, 
  Zap, 
  FileText, 
  TrendingUp, 
  ChevronRight, 
  PlayCircle, 
  Wand2, 
  Target, 
  Sparkles, 
  Award,
  Calendar, 
  Activity, 
  BookOpen, 
  Settings, 
  Crown, 
  ArrowUp,
  Brain, 
  Code, 
  Palette, 
  Megaphone, 
  GraduationCap, 
  History,
  Lightbulb, 
  Flame, 
  Heart, 
  Eye, 
  Download, 
  Share2, 
  Bookmark,
  Timer, 
  Coffee, 
  Rocket, 
  Globe, 
  MessageCircle, 
  ThumbsUp,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your dashboard</h2>
          <Link to="/login">
            <Button>
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const quickStartTemplates = [
    {
      id: 'business-strategy',
      title: 'Business Strategy Plan',
      description: 'Create a comprehensive business strategy with market analysis',
      category: 'Business',
      estimatedTime: '10-15 min',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      id: 'marketing-campaign',
      title: 'Marketing Campaign Brief',
      description: 'Design a creative marketing campaign with messaging',
      category: 'Marketing',
      estimatedTime: '8-12 min',
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'software-architecture',
      title: 'Software Architecture',
      description: 'Define technical requirements and system architecture',
      category: 'Development',
      estimatedTime: '15-20 min',
      icon: <FileText className="w-6 h-6" />
    }
  ];

  const stats = {
    totalPrompts: 12,
    totalUsage: 45,
    favoritePrompts: 3,
    thisWeekUsage: 8
  };

  const recentActivity = [
    {
      id: 1,
      type: 'created',
      title: 'Marketing Campaign Brief',
      time: '2 hours ago',
      icon: <Plus className="w-4 h-4 text-green-600" />
    },
    {
      id: 2,
      type: 'used',
      title: 'Business Strategy Template',
      time: '1 day ago',
      icon: <PlayCircle className="w-4 h-4 text-blue-600" />
    },
    {
      id: 3,
      type: 'favorited',
      title: 'Code Documentation Guide',
      time: '2 days ago',
      icon: <Star className="w-4 h-4 text-yellow-600" />
    }
  ];

  const trendingTemplates = [
    {
      id: 1,
      title: 'AI Product Launch Strategy',
      category: 'Business',
      usage: 234,
      icon: <Rocket className="w-5 h-5" />,
      trending: true
    },
    {
      id: 2,
      title: 'Social Media Content Calendar',
      category: 'Marketing',
      usage: 189,
      icon: <Calendar className="w-5 h-5" />,
      trending: true
    },
    {
      id: 3,
      title: 'API Documentation Template',
      category: 'Development',
      usage: 156,
      icon: <Code className="w-5 h-5" />,
      trending: false
    }
  ];

  const achievements = [
    {
      id: 1,
      title: 'First Prompt Created',
      description: 'Created your first AI prompt',
      earned: true,
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />
    },
    {
      id: 2,
      title: 'Power User',
      description: 'Used 50+ prompts',
      earned: true,
      icon: <Zap className="w-5 h-5 text-blue-500" />
    },
    {
      id: 3,
      title: 'Template Master',
      description: 'Created 10+ templates',
      earned: false,
      icon: <Crown className="w-5 h-5 text-purple-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600">
                Ready to create your next amazing prompt? Let's get started.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/analytics">
                  <Eye className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Link to="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  New Prompt
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* AI Prompt Builder */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                AI Prompt Builder
              </CardTitle>
              <CardDescription>
                Create professional prompts with intelligent AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/create">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 group-hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Launch Builder
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Template Library */}
          <Card className="hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Template Library
              </CardTitle>
              <CardDescription>
                Browse 200+ expert-crafted templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/templates">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-indigo-300 group-hover:text-indigo-600"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Templates
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Smart Categories */}
          <Card className="hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 group-hover:pulse transition-all" />
                Smart Categories
              </CardTitle>
              <CardDescription>
                AI-guided questionnaires by specialty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/categories">
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-purple-300 group-hover:text-purple-600"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Explore Categories
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrompts}</div>
              <p className="text-xs text-muted-foreground">Your created prompts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">Times used</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoritePrompts}</div>
              <p className="text-xs text-muted-foreground">Starred prompts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeekUsage}</div>
              <p className="text-xs text-muted-foreground">New prompts</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
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
                    <Link key={template.id} to="/create">
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
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
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trending Templates
                </CardTitle>
                <CardDescription>
                  Popular templates this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {template.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{template.title}</h4>
                            {template.trending && (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                <Flame className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{template.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{template.usage}</p>
                        <p className="text-xs text-gray-500">uses</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-gray-100">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg ${achievement.earned ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`p-2 rounded-full ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${achievement.earned ? 'text-green-900' : 'text-gray-600'}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-xs ${achievement.earned ? 'text-green-700' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Analytics Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Analytics
                </CardTitle>
                <CardDescription>
                  View your performance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">View detailed analytics</h3>
                    <p className="text-sm text-gray-600">Track your prompt performance and success rates</p>
                  </div>
                  <Link to="/analytics">
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Link to="/create">
            <Button 
              size="lg" 
              className="rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Create New Prompt
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;