// components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, Star, Clock, Users, BarChart3, Zap, FileText, TrendingUp, 
  ChevronRight, PlayCircle, Wand2, Target, Sparkles, Award,
  Calendar, Activity, BookOpen, Settings, Crown, ArrowUp,
  Brain, Code, Palette, Megaphone, GraduationCap, History,
  Lightbulb, Flame, Heart, Eye, Download, Share2, Bookmark,
  Timer, Coffee, Rocket, Globe, MessageCircle, ThumbsUp,
  ArrowRight, Bell, Filter, MoreHorizontal, Maximize2
} from 'lucide-react';

// Interfaces for type safety
interface QuickStartTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
  icon: React.ReactNode;
  color: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isPopular?: boolean;
  isTrending?: boolean;
  successRate: number;
  lastUsed?: string;
  tags: string[];
}

interface RecentActivity {
  id: string;
  type: 'created' | 'used' | 'favorited' | 'shared' | 'improved';
  title: string;
  timestamp: string;
  category: string;
  rating?: number;
  description?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  total?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  reward?: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expires: string;
  category: string;
}

interface DashboardStats {
  totalPrompts: number;
  totalUsage: number;
  favoritePrompts: number;
  thisWeekUsage: number;
  timeToday: string;
  streak: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  weeklyGoal: {
    current: number;
    target: number;
  };
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedQuickStart, setSelectedQuickStart] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');

  // Set time-based greeting and motivation
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('Good morning');
      setMotivationalQuote('Every expert was once a beginner. Start creating amazing prompts today! ☀️');
    } else if (hour < 17) {
      setTimeOfDay('Good afternoon');
      setMotivationalQuote('Your next breakthrough prompt is just one question away! 🚀');
    } else {
      setTimeOfDay('Good evening');
      setMotivationalQuote('Perfect time to craft something brilliant. Let your creativity flow! 🌙');
    }
  }, []);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your SmartPromptIQ dashboard</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.href = "/login"} className="w-full">
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/signup"}
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mock data - replace with real API calls
  const stats: DashboardStats = {
    totalPrompts: 23,
    totalUsage: 67,
    favoritePrompts: 8,
    thisWeekUsage: 12,
    timeToday: '2h 45m',
    streak: 7,
    level: 8,
    xp: 2340,
    nextLevelXp: 3000,
    weeklyGoal: {
      current: 12,
      target: 20
    }
  };

  const quickStartTemplates: QuickStartTemplate[] = [
    {
      id: 'ai-business-strategy',
      title: 'AI-Enhanced Business Strategy',
      description: 'Create data-driven business strategies with AI-powered market analysis and competitive insights',
      category: 'Business',
      estimatedTime: '12-18 min',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600',
      difficulty: 'Intermediate',
      isPopular: true,
      isTrending: true,
      successRate: 94,
      lastUsed: '2 days ago',
      tags: ['Strategy', 'AI', 'Business', 'Analysis']
    },
    {
      id: 'viral-marketing-campaign',
      title: 'Viral Marketing Campaign',
      description: 'Design marketing campaigns optimized for viral spread and maximum engagement across all platforms',
      category: 'Marketing',
      estimatedTime: '8-15 min',
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Beginner',
      isTrending: true,
      successRate: 89,
      lastUsed: '1 week ago',
      tags: ['Marketing', 'Viral', 'Social Media', 'Engagement']
    },
    {
      id: 'next-gen-app-architecture',
      title: 'Next-Gen App Architecture',
      description: 'Define scalable, secure application architectures with modern cloud-native technologies',
      category: 'Development',
      estimatedTime: '20-30 min',
      icon: <Code className="w-6 h-6" />,
      color: 'from-green-500 to-teal-600',
      difficulty: 'Advanced',
      successRate: 92,
      lastUsed: 'Never used',
      tags: ['Architecture', 'Cloud', 'Scalability', 'Security']
    },
    {
      id: 'brand-identity-system',
      title: 'Revolutionary Brand Identity',
      description: 'Create comprehensive brand identities with psychological impact and cultural adaptation',
      category: 'Creative',
      estimatedTime: '15-25 min',
      icon: <Palette className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-600',
      difficulty: 'Intermediate',
      isPopular: true,
      successRate: 87,
      tags: ['Branding', 'Design', 'Identity', 'Creative']
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'created',
      title: 'AI-Powered API Documentation',
      timestamp: '2 hours ago',
      category: 'Development',
      rating: 5,
      description: 'Generated comprehensive API docs with examples'
    },
    {
      id: '2',
      type: 'improved',
      title: 'Marketing Campaign Strategy',
      timestamp: '5 hours ago',
      category: 'Marketing',
      rating: 4,
      description: 'Enhanced targeting and messaging'
    },
    {
      id: '3',
      type: 'shared',
      title: 'Business Model Canvas',
      timestamp: '1 day ago',
      category: 'Business',
      description: 'Shared with team members'
    },
    {
      id: '4',
      type: 'favorited',
      title: 'Brand Guidelines Template',
      timestamp: '2 days ago',
      category: 'Creative',
      description: 'Added to favorites for future use'
    },
    {
      id: '5',
      type: 'used',
      title: 'Technical Architecture Review',
      timestamp: '3 days ago',
      category: 'Development',
      rating: 5,
      description: 'Applied to new project architecture'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Created your first prompt',
      icon: <Sparkles className="w-5 h-5" />,
      unlocked: true,
      rarity: 'common',
      unlockedAt: '2 weeks ago',
      reward: '10 XP'
    },
    {
      id: '2',
      title: 'Template Explorer',
      description: 'Used 10 different templates',
      icon: <Award className="w-5 h-5" />,
      unlocked: true,
      rarity: 'rare',
      unlockedAt: '1 week ago',
      reward: '50 XP + Badge'
    },
    {
      id: '3',
      title: 'Prompt Master',
      description: 'Create 50 high-quality prompts',
      icon: <Crown className="w-5 h-5" />,
      unlocked: false,
      progress: 23,
      total: 50,
      rarity: 'epic',
      reward: '200 XP + Premium Badge'
    },
    {
      id: '4',
      title: 'Category Champion',
      description: 'Master all 6 categories',
      icon: <Target className="w-5 h-5" />,
      unlocked: false,
      progress: 4,
      total: 6,
      rarity: 'legendary',
      reward: '500 XP + Exclusive Title'
    },
    {
      id: '5',
      title: 'Streak Legend',
      description: 'Maintain a 30-day streak',
      icon: <Flame className="w-5 h-5" />,
      unlocked: false,
      progress: 7,
      total: 30,
      rarity: 'epic',
      reward: '300 XP + Streak Badge'
    }
  ];

  const dailyChallenge: DailyChallenge = {
    id: 'today-challenge',
    title: 'Creative Brief Master',
    description: 'Create a brand identity prompt for a sustainable tech startup',
    reward: '50 XP + Rare Badge',
    progress: 0,
    total: 1,
    difficulty: 'Medium',
    expires: '18 hours',
    category: 'Creative'
  };

  // Helper functions
  const handleQuickStart = (templateId: string) => {
    setSelectedQuickStart(templateId);
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = `/create?template=${templateId}`;
    }, 800);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <Plus className="w-4 h-4 text-green-600" />;
      case 'used': return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'favorited': return <Heart className="w-4 h-4 text-red-600" />;
      case 'shared': return <Share2 className="w-4 h-4 text-purple-600" />;
      case 'improved': return <TrendingUp className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {timeOfDay}, {user?.firstName || 'Creator'}! 👋
              </h1>
              <p className="text-lg text-gray-600 mb-4">{motivationalQuote}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1">
                  <Crown className="w-4 h-4 mr-1" />
                  Level {stats.level} Pro
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                  <Flame className="w-4 h-4 mr-1" />
                  {stats.streak} Day Streak
                </Badge>
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  <Target className="w-4 h-4 mr-1" />
                  {stats.weeklyGoal.current}/{stats.weeklyGoal.target} Weekly Goal
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 shadow-sm border">
                <p className="text-sm text-gray-500 mb-1">XP Progress</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-indigo-600">{stats.xp}</span>
                  <span className="text-sm text-gray-500">/ {stats.nextLevelXp}</span>
                </div>
                <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {stats.nextLevelXp - stats.xp} XP to Level {stats.level + 1}
                </p>
              </div>
            </div>
          </div>
          
          {/* Daily Challenge Banner */}
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Target className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Daily Challenge: {dailyChallenge.title}
                    </h3>
                    <p className="text-sm text-gray-600">{dailyChallenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-yellow-100 text-yellow-800 mb-1">
                    {dailyChallenge.reward}
                  </Badge>
                  <p className="text-xs text-gray-500">Expires in {dailyChallenge.expires}</p>
                  <Button 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = `/create?challenge=${dailyChallenge.id}`}
                  >
                    Start Challenge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 group-hover:scale-105 transition-transform"
                onClick={() => window.location.href = "/create"}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Launch Builder
              </Button>
            </CardContent>
          </Card>

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
              <Button 
                variant="outline" 
                className="w-full group-hover:border-indigo-300 group-hover:text-indigo-600"
                onClick={() => window.location.href = "/templates"}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Explore Templates
              </Button>
            </CardContent>
          </Card>

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
              <Button 
                variant="outline" 
                className="w-full group-hover:border-purple-300 group-hover:text-purple-600"
                onClick={() => window.location.href = "/categories"}
              >
                <Target className="w-4 h-4 mr-2" />
                Explore Categories
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
              <FileText className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalPrompts}</div>
              <p className="text-xs text-gray-500">+3 this week</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Count</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalUsage}</div>
              <p className="text-xs text-gray-500">+8 this week</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.favoritePrompts}</div>
              <p className="text-xs text-gray-500">Saved & loved</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              <Target className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.weeklyGoal.current}/{stats.weeklyGoal.target}
              </div>
              <Progress value={(stats.weeklyGoal.current / stats.weeklyGoal.target) * 100} className="h-1 mt-1" />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Today</CardTitle>
              <Clock className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.timeToday}</div>
              <p className="text-xs text-gray-500">Productive time</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
              <p className="text-xs text-gray-500">Days active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Start Templates */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Quick Start Templates
                    </CardTitle>
                    <CardDescription>
                      Jump-start with AI-enhanced templates tailored to your success
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickStartTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className={`
                        border rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white
                        ${selectedQuickStart === template.id ? 'ring-2 ring-indigo-300 shadow-md scale-105' : ''}
                      `}
                      onClick={() => handleQuickStart(template.id)}
                    >
                      {/* Template Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color} text-white transform group-hover:scale-110 transition-transform`}>
                          {template.icon}
                        </div>
                        <div className="flex flex-col gap-1">
                          {template.isTrending && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                          {template.isPopular && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                      
                      {/* Success Rate */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Success Rate</span>
                          <span className="font-medium">{template.successRate}%</span>
                        </div>
                        <Progress value={template.successRate} className="h-1" />
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 2}
                          </Badge>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge className={getDifficultyColor(template.difficulty) + " text-xs"}>
                            {template.difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {template.estimatedTime}
                          </div>
                          {template.lastUsed && (
                            <div className="text-xs text-gray-400">
                              {template.lastUsed}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full group hover:border-indigo-300"
                    onClick={() => window.location.href = "/templates"}
                  >
                    <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    View All 200+ Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                      <div className="mt-1 group-hover:scale-110 transition-transform">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                          {activity.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(activity.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-sm hover:bg-indigo-50"
                  onClick={() => window.location.href = "/history"}
                >
                  View All Activity
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.slice(0, 4).map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${
                        achievement.unlocked 
                          ? getRarityColor(achievement.rarity) + ' shadow-sm'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className={`mt-1 ${achievement.unlocked ? 'text-current' : 'text-gray-400'} transform hover:scale-110 transition-transform`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {achievement.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Unlocked {achievement.unlockedAt}
                          </p>
                        )}
                        {!achievement.unlocked && achievement.progress && achievement.total && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>{achievement.progress} / {achievement.total}</span>
                              <span>{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                            </div>
                            <Progress value={(achievement.progress / achievement.total) * 100} className="h-1" />
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className={`text-xs ${
                            achievement.rarity === 'legendary' ? 'border-yellow-300 text-yellow-700' :
                            achievement.rarity === 'epic' ? 'border-purple-300 text-purple-700' :
                            achievement.rarity === 'rare' ? 'border-blue-300 text-blue-700' :
                            'border-gray-300 text-gray-600'
                          }`}>
                            {achievement.rarity}
                          </Badge>
                          {achievement.reward && (
                            <span className="text-xs text-gray-500">{achievement.reward}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-sm hover:bg-indigo-50"
                  onClick={() => window.location.href = "/achievements"}
                >
                  View All Achievements
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* AI Insights Panel */}
            <Card className="shadow-lg border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Lightbulb className="w-5 h-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">🚀 Trending Now</p>
                    <p className="text-xs text-blue-700">
                      Marketing prompts are 34% more effective this week. Try our viral campaign template!
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-1">💡 Suggestion</p>
                    <p className="text-xs text-green-700">
                      You're great at business strategies! Consider exploring technical prompts to unlock new achievements.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900 mb-1">🎯 Goal</p>
                    <p className="text-xs text-purple-700">
                      Complete 8 more prompts this week to reach your goal and earn bonus XP!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Motivation Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Your Progress</h3>
              <p className="text-sm text-green-700 mb-3">
                You've improved 78% since last month!
              </p>
              <Badge className="bg-green-100 text-green-800">
                Keep it up! 🚀
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">Community Impact</h3>
              <p className="text-sm text-purple-700 mb-3">
                Your prompts have helped 47 other users!
              </p>
              <Badge className="bg-purple-100 text-purple-800">
                Making a difference! ✨
              </Badge>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-orange-900 mb-2">Streak Power</h3>
              <p className="text-sm text-orange-700 mb-3">
                7-day streak! You're in the top 15% of users.
              </p>
              <Badge className="bg-orange-100 text-orange-800">
                On fire! 🔥
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg" 
            className="rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 animate-pulse"
            onClick={() => window.location.href = "/create"}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6 mr-2" />
                Create Magic
                <Sparkles className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}