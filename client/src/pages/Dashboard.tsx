import React, { useState, useEffect } from 'react';
import {
  User, Plus, Zap, Star, BarChart3, Settings, CreditCard,
  Users, FileText, Clock, TrendingUp, Award, Target,
  Lightbulb, Calendar, Activity, BookOpen, Gift, Rocket,
  ExternalLink, DollarSign, Sparkles, Code, Globe, ShoppingCart, Mic
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import ReferralWidget from '@/components/ReferralWidget';
import { VoiceAssistant } from '@/components/VoiceAssistant';

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
    { icon: Plus, title: 'Create New Prompt', description: 'Start with questionnaire flow', action: '/categories', color: 'bg-blue-500' },
    { icon: FileText, title: 'Browse Templates', description: 'Explore prompt templates', action: '/templates', color: 'bg-green-500' },
    { icon: Rocket, title: 'Deploy Your App', description: 'Launch on 30+ platforms', action: '/deployment-hub', color: 'bg-purple-500' },
    { icon: Code, title: 'BuilderIQ Studio', description: 'AI-powered app builder', action: '/builderiq', color: 'bg-orange-500' }
  ];

  // Top deployment partners with affiliate links
  const deploymentPartners = [
    { name: 'Replit', logo: '🔄', tagline: 'Code & Deploy', url: 'https://replit.com/refer/wthomas19542', color: 'bg-orange-500' },
    { name: 'Shopify', logo: '🛒', tagline: 'E-commerce', url: 'https://www.shopify.com/affiliates?ref=smartpromptiq', color: 'bg-green-500' },
    { name: 'Vercel', logo: '▲', tagline: 'Fast Hosting', url: 'https://vercel.com/partners?ref=smartpromptiq', color: 'bg-gray-800' },
    { name: 'Webflow', logo: '🎨', tagline: 'No-Code Design', url: 'https://webflow.com/affiliates?ref=smartpromptiq', color: 'bg-blue-500' },
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
                Here's what's happening with your SmartPromptIQ™ account today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1">
                {user?.plan || 'FREE'} Plan
              </Badge>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleQuickAction('/categories')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Prompt
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

        {/* Deploy Your Prompts - Revenue Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-purple-500" />
              Deploy Your Prompts
            </h2>
            <Button variant="outline" size="sm" onClick={() => handleQuickAction('/deployment-hub')}>
              View All 30+ Platforms
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {deploymentPartners.map((partner, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-purple-300"
                onClick={() => window.open(partner.url, '_blank')}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-xl ${partner.color} flex items-center justify-center text-2xl`}>
                    {partner.logo}
                  </div>
                  <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                  <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                    {partner.tagline}
                  </Badge>
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

            {/* Referral Widget - only show when logged in */}
            {user && (
              <Card className="overflow-hidden border-0 bg-transparent shadow-none">
                <ReferralWidget variant="card" />
              </Card>
            )}

            {/* Premium Features Upsell */}
            <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                  Unlock Pro Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-300" />
                    Unlimited prompt generation
                  </li>
                  <li className="flex items-center">
                    <Code className="w-4 h-4 mr-2 text-yellow-300" />
                    Priority access to BuilderIQ
                  </li>
                  <li className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-yellow-300" />
                    Deploy to 30+ platforms
                  </li>
                  <li className="flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-yellow-300" />
                    E-commerce templates
                  </li>
                </ul>
                <Button
                  className="w-full mt-4 bg-white text-purple-700 hover:bg-gray-100"
                  onClick={() => handleQuickAction('/pricing')}
                >
                  Upgrade Now
                  <TrendingUp className="w-4 h-4 ml-2" />
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

            {/* Discord Community */}
            <Card className="bg-[#5865F2] text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-white text-base">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Join Our Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-sm mb-3">
                  Get help, share prompts, and connect with other users!
                </p>
                <a
                  href="https://discord.gg/smartpromptiq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 bg-white text-[#5865F2] hover:bg-gray-100 font-semibold rounded-lg transition-all text-center text-sm"
                >
                  Join Discord
                </a>
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
                      Your SmartPromptIQ™ account is fully operational. All features are available.
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

      {/* Voice Assistant - Floating Button */}
      <VoiceAssistant
        position="bottom-right"
        size="md"
        personality="friendly"
        showTranscript={true}
        onCommand={(command) => {
          // Handle voice commands for navigation
          const lowerCmd = command.toLowerCase();
          if (lowerCmd.includes('create') || lowerCmd.includes('new prompt')) {
            handleQuickAction('/categories');
          } else if (lowerCmd.includes('template')) {
            handleQuickAction('/templates');
          } else if (lowerCmd.includes('deploy')) {
            handleQuickAction('/deployment-hub');
          } else if (lowerCmd.includes('builder') || lowerCmd.includes('studio')) {
            handleQuickAction('/builderiq');
          } else if (lowerCmd.includes('pricing') || lowerCmd.includes('upgrade')) {
            handleQuickAction('/pricing');
          } else if (lowerCmd.includes('setting')) {
            handleQuickAction('/settings');
          } else if (lowerCmd.includes('academy') || lowerCmd.includes('learn')) {
            handleQuickAction('/academy');
          }
        }}
        onTranscript={(transcript) => {
          console.log('Voice transcript:', transcript);
        }}
      />
    </div>
  );
}