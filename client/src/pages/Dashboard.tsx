import React, { useState, useEffect } from 'react';
import {
  User, Plus, Zap, Star, BarChart3, Settings, CreditCard,
  Users, FileText, Clock, TrendingUp, Award, Target,
  Lightbulb, Calendar, Activity, BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    promptsGenerated: 127,
    tokensUsed: 2450,
    tokensRemaining: 2550,
    promptsThisMonth: 34,
    averageRating: 4.7,
    favoritePrompts: 15
  });

  // Mock recent activity data
  const recentActivity = [
    { id: 1, type: 'prompt', title: 'Marketing Campaign Ideas', category: 'Marketing', time: '2 hours ago', rating: 5 },
    { id: 2, type: 'prompt', title: 'Product Description', category: 'E-commerce', time: '5 hours ago', rating: 4 },
    { id: 3, type: 'prompt', title: 'Blog Post Outline', category: 'Content', time: '1 day ago', rating: 5 },
    { id: 4, type: 'prompt', title: 'Email Template', category: 'Marketing', time: '2 days ago', rating: 4 }
  ];

  // Mock quick actions with proper navigation
  const quickActions = [
    { icon: Plus, title: 'Generate New Prompt', description: 'Create AI-powered prompts', action: '/generation', color: 'bg-blue-500' },
    { icon: FileText, title: 'Browse Templates', description: 'Explore prompt templates', action: '/templates', color: 'bg-green-500' },
    { icon: BarChart3, title: 'View Analytics', description: 'Track your performance', action: '/analytics', color: 'bg-purple-500' },
    { icon: Users, title: 'Team Collaboration', description: 'Work with your team', action: '/teams', color: 'bg-orange-500' }
  ];

  const handleQuickAction = (action: string) => {
    window.location.href = action;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your SmartPromptIQ account today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1">
                {user?.plan || 'FREE'} Plan
              </Badge>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleQuickAction('/generation')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Prompt
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-500" />
                Prompts Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.promptsGenerated}</div>
              <p className="text-xs text-gray-500">
                +{stats.promptsThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="w-4 h-4 mr-2 text-green-500" />
                Tokens Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokensRemaining}</div>
              <p className="text-xs text-gray-500">
                {stats.tokensUsed} used this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-gray-500">
                Based on {stats.promptsGenerated} prompts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Award className="w-4 h-4 mr-2 text-purple-500" />
                Favorite Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoritePrompts}</div>
              <p className="text-xs text-gray-500">
                Saved for later use
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-500">{activity.category} • {activity.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(activity.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Usage Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tokens Used</span>
                      <span>{stats.tokensUsed} / 5000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(stats.tokensUsed / 5000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Prompts Generated</span>
                      <span>{stats.promptsThisMonth} / 100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(stats.promptsThisMonth / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => handleQuickAction('/pricing')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Recent Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 text-sm">
                      Use Specific Keywords
                    </h4>
                    <p className="text-purple-700 text-xs mt-1">
                      Add specific industry terms to get more targeted prompts.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 text-sm">
                      Rate Your Prompts
                    </h4>
                    <p className="text-blue-700 text-xs mt-1">
                      Rating helps improve future prompt suggestions.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 text-sm">
                      Save Templates
                    </h4>
                    <p className="text-green-700 text-xs mt-1">
                      Create reusable templates for common use cases.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">
                      Account Active
                    </h3>
                    <p className="text-green-700 text-sm">
                      Your SmartPromptIQ account is fully operational. All features are available.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                  onClick={() => handleQuickAction('/settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}