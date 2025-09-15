import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import PromptCard from "@/components/PromptCard";
import TokenBalance from "@/components/TokenBalance";
import UsageTracker from "@/components/UsageTracker";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, FileText, Star, BarChart, BarChart3, Clock, Search, Users, Calendar, CheckCircle, Activity, UserCheck,
  TrendingUp, Brain, Target, Zap, Award, Eye, ArrowRight, Sparkles, Rocket, Crown,
  Bell, Settings, Filter, Grid, List, Bookmark, Share2, Download, RefreshCw,
  ChevronRight, PlayCircle, PieChart, LineChart, MoreVertical, Heart,
  Globe, Shield, Flame, Trophy, Lightbulb, MessageSquare, AlertCircle,
  Briefcase, DollarSign, GraduationCap, Layers, Coffee, Mic, Smile,
  PartyPopper, Gift, Sunrise, Music, Palette, Camera, Headphones, Trash2, Copy
} from "lucide-react";

// Mock data for development
const mockStats = {
  totalPrompts: 24,
  favorites: 8,
  usesThisMonth: 127,
  completedProjects: 15,
  teamCollaborations: 6,
  avgResponseTime: "2.3s"
};

// Enhanced user data
const currentUser = {
  name: 'Alex Johnson',
  role: 'Senior Product Manager',
  avatar: '👨‍💼',
  level: 'Expert',
  streak: 12,
  totalPoints: 4847,
  monthlyGoal: 5000,
  joinedDate: 'March 2024',
  completionRate: 94,
  qualityScore: 4.8
};

// Quick actions data
const quickActions = [
  { 
    id: 'marketing', 
    label: 'Marketing Campaign', 
    icon: Briefcase, 
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Create compelling campaigns'
  },
  { 
    id: 'product', 
    label: 'Product Strategy', 
    icon: Zap, 
    gradient: 'from-purple-500 to-pink-500',
    description: 'Plan product roadmaps'
  },
  { 
    id: 'financial', 
    label: 'Financial Plan', 
    icon: DollarSign, 
    gradient: 'from-green-500 to-emerald-500',
    description: 'Budget & investment plans'
  },
  { 
    id: 'education', 
    label: 'Learning Module', 
    icon: GraduationCap, 
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Educational content'
  },
  { 
    id: 'content', 
    label: 'Content Creation', 
    icon: FileText, 
    gradient: 'from-indigo-500 to-blue-500',
    description: 'Blog posts & articles'
  },
  { 
    id: 'team', 
    label: 'Team Workshop', 
    icon: Users, 
    gradient: 'from-pink-500 to-rose-500',
    description: 'Collaborative sessions'
  }
];

// Recent activity mock data
const recentActivity = [
  {
    id: 1,
    type: 'created',
    item: 'Q4 Marketing Strategy',
    time: '2 hours ago',
    category: 'Marketing',
    status: 'completed'
  },
  {
    id: 2,
    type: 'joined',
    item: 'Product Innovation Team',
    time: '1 day ago',
    category: 'Collaboration',
    status: 'active'
  },
  {
    id: 3,
    type: 'completed',
    item: 'Financial Forecast Model',
    time: '2 days ago',
    category: 'Finance',
    status: 'approved'
  },
  {
    id: 4,
    type: 'updated',
    item: 'Content Calendar Template',
    time: '3 days ago',
    category: 'Content',
    status: 'in-review'
  }
];

// Notifications
const notifications = [
  { id: 1, type: 'achievement', message: 'New milestone: 5,000 points earned!', time: '5 min ago', unread: true },
  { id: 2, type: 'team', message: 'Sarah invited you to "Brand Strategy 2025"', time: '1 hour ago', unread: true },
  { id: 3, type: 'update', message: 'Your Q4 Campaign prompt was approved', time: '2 hours ago', unread: false },
  { id: 4, type: 'reminder', message: 'Weekly team sync in 30 minutes', time: '4 hours ago', unread: false }
];

// Mock prompts data
const mockPrompts = [
  {
    id: 1,
    title: "Comprehensive Business Plan Generator",
    description: "Create detailed business plans with market analysis, financial projections, and strategic roadmaps",
    category: "business",
    isFavorite: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Generate a comprehensive business plan for...",
    tags: ['Strategy', 'Analysis', 'Planning'],
    status: 'completed',
    quality: 4.8
  },
  {
    id: 2,
    title: "Creative Writing & Storytelling Prompt",
    description: "Generate engaging story prompts and creative writing exercises for various genres",
    category: "creative",
    isFavorite: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Write a compelling story about...",
    tags: ['Creative', 'Writing', 'Fiction'],
    status: 'draft',
    quality: 4.5
  },
  {
    id: 3,
    title: "Technical Documentation Framework",
    description: "Create clear, comprehensive technical documentation with best practices",
    category: "technical",
    isFavorite: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Document the following technical process...",
    tags: ['Documentation', 'Technical', 'Process'],
    status: 'completed',
    quality: 4.9
  },
  {
    id: 4,
    title: "Social Media Campaign Strategy",
    description: "Develop engaging social media campaigns with content calendar and metrics",
    category: "marketing",
    isFavorite: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Create a social media strategy for...",
    tags: ['Social Media', 'Marketing', 'Engagement'],
    status: 'in-progress',
    quality: 4.7
  }
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    favorites: false
  });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Handler functions for PromptCard
  const handleToggleFavorite = (id: number) => {
    // Find the current prompt
    const prompt = mockPrompts.find(p => p.id === id);
    if (prompt) {
      // Toggle favorite status (this would typically be an API call)
      const newStatus = !prompt.isFavorite;
      prompt.isFavorite = newStatus;

      toast({
        title: newStatus ? "Added to favorites! ⭐" : "Removed from favorites",
        description: `"${prompt.title}" ${newStatus ? 'has been favorited' : 'removed from favorites'}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });
    }
  };

  const handleDeletePrompt = (id: number) => {
    const prompt = mockPrompts.find(p => p.id === id);
    if (prompt) {
      setPromptToDelete(prompt);
      setShowDeleteDialog(true);
    }
  };

  const handleViewPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setShowViewDialog(true);
  };

  const confirmDelete = () => {
    if (promptToDelete) {
      // Remove from mockPrompts array (this would typically be an API call)
      const index = mockPrompts.findIndex(p => p.id === promptToDelete.id);
      if (index > -1) {
        mockPrompts.splice(index, 1);
      }

      toast({
        title: "Prompt deleted successfully! 🗑️",
        description: `"${promptToDelete.title}" has been permanently deleted`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/prompts"] });

      setShowDeleteDialog(false);
      setPromptToDelete(null);
    }
  };

  // Mock queries for development
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => mockStats,
  });

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["/api/prompts", filters],
    queryFn: async () => {
      let filtered = mockPrompts;
      
      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      if (filters.search) {
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.favorites) {
        filtered = filtered.filter(p => p.isFavorite);
      }
      
      return filtered;
    },
  });

  const handleCreateNew = () => {
    setLocation("/categories");
  };

  const handleQuickAction = (actionId: string) => {
    setLocation(`/questionnaire/${actionId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'in-review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden" ref={dashboardRef}>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 rounded-full blur-lg animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>
      
      <Navigation />
      
      <section className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Welcome Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
              {/* Enhanced Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/15 to-cyan-400/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-yellow-400/30 rounded-full blur-sm animate-bounce" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-pink-400/30 rounded-full blur-sm animate-bounce" style={{ animationDelay: '3s' }}></div>
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between relative z-10">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="relative group cursor-pointer">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-3xl shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 hover:shadow-2xl">
                      <span className="group-hover:animate-bounce">{currentUser.avatar}</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -top-2 -right-2 text-xs animate-bounce" style={{ animationDelay: '1s' }}>✨</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 bg-clip-text text-transparent animate-gradient">
                        Welcome back, {currentUser.name}! 
                      </h1>
                      <div className="text-2xl animate-wave origin-bottom-right hover:animate-spin cursor-pointer">👋</div>
                      <div className="hidden lg:block text-xl animate-bounce hover:animate-spin cursor-pointer" style={{ animationDelay: '0.5s' }}>✨</div>
                      <div className="hidden lg:block text-lg animate-pulse hover:animate-bounce cursor-pointer" style={{ animationDelay: '1s' }}>🎉</div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-default hover:rotate-1 group">
                        <Crown className="w-4 h-4 mr-1 animate-pulse group-hover:animate-bounce" />
                        {currentUser.level} Creator 🚀
                      </Badge>
                      <span className="text-slate-600 font-medium bg-slate-50 px-3 py-1 rounded-full">{currentUser.role}</span>
                      <span className="flex items-center space-x-2 text-slate-600 bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors cursor-default group">
                        <Flame className="w-4 h-4 text-orange-500 animate-pulse group-hover:animate-bounce" />
                        <span className="font-semibold text-orange-600">{currentUser.streak} day streak! 🔥</span>
                        <div className="hidden group-hover:block animate-bounce">💪</div>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <AnimatedCounter 
                          end={currentUser.totalPoints} 
                          duration={2000} 
                          className="text-xl font-bold text-slate-900" 
                        /> 
                        <span className="text-slate-600">points</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-purple-500" />
                        <span className="text-xl font-bold text-slate-900">{currentUser.qualityScore}</span>
                        <span className="text-slate-600">quality score</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress towards monthly goal */}
                <div className="bg-gradient-to-br from-white/90 to-indigo-50/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all group">
                  <div className="text-center mb-3">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-indigo-500" />
                      <div className="text-sm text-slate-600 font-medium">Monthly Goal</div>
                      <div className="text-sm">🎯</div>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {Math.round((currentUser.totalPoints / currentUser.monthlyGoal) * 100)}%
                    </div>
                    <div className="text-xs text-indigo-600 font-medium hover:text-indigo-700 transition-colors cursor-default">Almost there! 💪 You've got this! 🌟</div>
                  </div>
                  <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden mx-auto">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative overflow-hidden"
                      style={{ width: `${Math.min((currentUser.totalPoints / currentUser.monthlyGoal) * 100, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 text-center">
                    <span className="font-semibold text-indigo-600">{currentUser.totalPoints}</span> / {currentUser.monthlyGoal} points
                    <div className="text-green-600 font-medium mt-1 hover:text-green-700 transition-colors cursor-default">+{currentUser.monthlyGoal - currentUser.totalPoints} to go! 🌟 Keep crushing it! 🎯</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Quick Actions ⚡</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border-0 hover:scale-105 transition-transform cursor-default">
                    Start Creating ✨
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className="group relative bg-gradient-to-br from-white to-slate-50 hover:from-white hover:to-blue-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:rotate-1 active:scale-95"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                        <action.icon className="w-6 h-6 text-white group-hover:animate-pulse" />
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mb-1 text-center">{action.label}</div>
                      <div className="text-xs text-slate-600 text-center leading-snug">{action.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Features Showcase */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl overflow-hidden relative">
              {/* Animated Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/15 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '2s' }}></div>
              </div>

              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white mb-1">Team Collaboration Hub 🚀</CardTitle>
                      <p className="text-indigo-100 text-sm">Unlock powerful team features and collaborative AI prompt creation</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all backdrop-blur-sm">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Feature
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-8 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Feature Cards */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/15 transition-all group cursor-pointer">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-1">Team Workspaces</h4>
                    <p className="text-indigo-100 text-xs">Create shared prompt libraries</p>
                    <div className="text-yellow-200 text-xs mt-2 font-medium">✨ 4 Active Teams</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/15 transition-all group cursor-pointer">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-1">Real-time Chat</h4>
                    <p className="text-indigo-100 text-xs">Instant team communication</p>
                    <div className="text-green-200 text-xs mt-2 font-medium">🟢 12 Members Online</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/15 transition-all group cursor-pointer">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-1">Role Management</h4>
                    <p className="text-indigo-100 text-xs">Advanced user permissions</p>
                    <div className="text-blue-200 text-xs mt-2 font-medium">⚡ Admin Controls</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/15 transition-all group cursor-pointer">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-1">Team Analytics</h4>
                    <p className="text-indigo-100 text-xs">Performance insights</p>
                    <div className="text-purple-200 text-xs mt-2 font-medium">📊 Advanced Reports</div>
                  </div>
                </div>

                {/* Access Control Display */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Who Has Access to Team Features
                    </h4>
                    <Badge className="bg-green-500/20 text-green-100 border-green-400/20">
                      All Users
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center text-white/90">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Free Plan Users
                    </div>
                    <div className="flex items-center text-white/90">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Pro Plan Users
                    </div>
                    <div className="flex items-center text-white/90">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      Team Admins
                    </div>
                    <div className="flex items-center text-white/90">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      Enterprise Users
                    </div>
                  </div>

                  <div className="mt-3 text-indigo-100 text-xs">
                    💡 <strong>Note:</strong> All users can access team features! Create teams, collaborate on prompts, and share knowledge with your colleagues.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setLocation('/teams')}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all group"
                  >
                    <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Explore Teams Hub
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>

                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm transition-all"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/80" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  <AnimatedCounter end={stats?.totalPrompts ?? 24} duration={1500} />
                </div>
                <div className="text-blue-100 text-sm font-medium">Total Prompts</div>
                <div className="text-xs text-blue-200 mt-2 hover:text-blue-100 transition-colors cursor-default">+12% from last month 📈</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <Star className="w-5 h-5 text-white/80" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  <AnimatedCounter end={stats?.favorites ?? 8} duration={1500} />
                </div>
                <div className="text-purple-100 text-sm font-medium">Favorites</div>
                <div className="text-xs text-purple-200 mt-2 hover:text-purple-100 transition-colors cursor-default">Most loved content 💜</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <BarChart className="w-5 h-5 text-white/80" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  <AnimatedCounter end={stats?.usesThisMonth ?? 127} duration={1500} />
                </div>
                <div className="text-green-100 text-sm font-medium">This Month</div>
                <div className="text-xs text-green-200 mt-2 hover:text-green-100 transition-colors cursor-default">AI interactions 🤖</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <Award className="w-5 h-5 text-white/80" />
                </div>
                <div className="text-3xl font-bold mb-1">{currentUser.completionRate}%</div>
                <div className="text-yellow-100 text-sm font-medium">Success Rate</div>
                <div className="text-xs text-yellow-200 mt-2 hover:text-yellow-100 transition-colors cursor-default">Quality delivery ⭐</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl h-fit">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900">Recent Activity 📊</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="border-slate-200 hover:border-indigo-300">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-xl hover:shadow-md transition-all group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          {activity.type === 'created' && <Plus className="w-5 h-5 text-white" />}
                          {activity.type === 'joined' && <Users className="w-5 h-5 text-white" />}
                          {activity.type === 'completed' && <CheckCircle className="w-5 h-5 text-white" />}
                          {activity.type === 'updated' && <RefreshCw className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {activity.type === 'created' && 'Created'}
                              {activity.type === 'joined' && 'Joined'}
                              {activity.type === 'completed' && 'Completed'}
                              {activity.type === 'updated' && 'Updated'}
                              <span className="text-indigo-600 ml-1">{activity.item}</span>
                            </p>
                            <Badge className={`${getStatusColor(activity.status)} text-xs px-2 py-0.5`}>
                              {activity.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3">
                            <p className="text-xs text-slate-500">{activity.time}</p>
                            <Badge variant="secondary" className="text-xs bg-slate-100">
                              {activity.category}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications & Quick Stats */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900">Notifications 🔔</CardTitle>
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {notifications.filter(n => n.unread).length} new
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {notifications.slice(0, 4).map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                        notification.unread ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100' : 'bg-slate-50 hover:bg-slate-100'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === 'achievement' ? 'bg-yellow-500' :
                            notification.type === 'team' ? 'bg-blue-500' :
                            notification.type === 'update' ? 'bg-green-500' : 'bg-purple-500'
                          } ${notification.unread ? 'animate-pulse' : ''}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 leading-snug">{notification.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Team Access */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span>Teams 👥</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <button
                      onClick={() => setLocation("/teams")}
                      className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all group border border-blue-100 hover:border-blue-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">View All Teams 👀</div>
                          <div className="text-xs text-slate-600">3 active collaborations 🚀</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setLocation("/teams")}
                      className="w-full text-left p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all group border border-green-100 hover:border-green-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Create Team ✨</div>
                          <div className="text-xs text-slate-600">Start new collaboration 🤝</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Prompts Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Your AI Prompts 🧠</CardTitle>
                    <p className="text-slate-600 text-sm mt-1">Manage and explore your generated content ✨</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleCreateNew}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                  
                  <div className="flex items-center space-x-2 bg-white/70 rounded-lg p-1 border border-slate-200">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search prompts..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 bg-white/70 backdrop-blur-sm border-slate-200 focus:border-indigo-300"
                  />
                </div>
                
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-48 bg-white/70 backdrop-blur-sm border-slate-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant={filters.favorites ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, favorites: !prev.favorites }))}
                  className="border-slate-200 hover:border-indigo-300"
                >
                  <Heart className={`w-4 h-4 mr-2 ${filters.favorites ? 'fill-current' : ''}`} />
                  Favorites
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-spin"></div>
                    <p className="text-slate-600">Loading your AI-powered content... ✨</p>
                  </div>
                </div>
              ) : prompts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">No prompts found 🔍</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                    {filters.search || (filters.category && filters.category !== "all") || filters.favorites
                      ? "Try adjusting your filters to find more prompts. 🎯"
                      : "Ready to create your first AI-powered prompt? Let's get started! 🚀"
                    }
                  </p>
                  <div className="space-y-4">
                    <Button 
                      onClick={handleCreateNew} 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      Create Your First Prompt
                    </Button>
                    
                    {(filters.search || (filters.category && filters.category !== "all") || filters.favorites) && (
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Or explore more options 🔍</h4>
                        <Button 
                          variant="outline" 
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                          onClick={() => setFilters({ category: '', search: '', favorites: false })}
                        >
                          <RefreshCw className="mr-2 w-4 h-4" />
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {prompts.map((prompt) => (
                    <div key={prompt.id} className={`group ${viewMode === 'list' ? 'flex items-center space-x-4 p-4 bg-white/70 rounded-xl hover:shadow-lg transition-all' : ''}`}>
                      {viewMode === 'grid' ? (
                        <PromptCard
                          prompt={prompt}
                          onToggleFavorite={handleToggleFavorite}
                          onDelete={handleDeletePrompt}
                          onView={handleViewPrompt}
                        />
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 truncate">{prompt.title}</h3>
                              <Badge className={`${getStatusColor(prompt.status)} text-xs px-2 py-1`}>
                                {prompt.status}
                              </Badge>
                              {prompt.isFavorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2 mb-2">{prompt.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500">
                              <span>Created {new Date(prompt.createdAt).toLocaleDateString()}</span>
                              <span className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                <span>{prompt.quality}</span>
                              </span>
                              <div className="flex space-x-1">
                                {prompt.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs bg-slate-100">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer CTA */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-0">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Ready to create something amazing? ✨
              </h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Join thousands of creators who are using SmartPromptIQ to transform their ideas into powerful AI-driven solutions. 🌟 Your next breakthrough is just a prompt away! 💡
              </p>
              <Button 
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Rocket className="mr-2 w-5 h-5" />
                Start Creating Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* View Prompt Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center space-x-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              <span>{selectedPrompt?.title}</span>
            </DialogTitle>
            <DialogDescription className="text-lg">
              {selectedPrompt?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedPrompt && (
            <div className="space-y-6 mt-6">
              {/* Prompt Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-sm text-slate-600">Category</div>
                  <Badge className="mt-1">{selectedPrompt.category}</Badge>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-sm text-slate-600">Status</div>
                  <Badge className={`mt-1 ${getStatusColor(selectedPrompt.status)}`}>
                    {selectedPrompt.status}
                  </Badge>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-sm text-slate-600">Quality Score</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{selectedPrompt.quality}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-sm text-slate-600">Created</div>
                  <div className="text-sm font-semibold mt-1">
                    {new Date(selectedPrompt.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-indigo-50 text-indigo-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt Content */}
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">Prompt Content</div>
                <Textarea
                  value={selectedPrompt.content}
                  readOnly
                  className="min-h-[200px] bg-slate-50 border-slate-200 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(selectedPrompt.content || '');
                        toast({
                          title: "Copied to clipboard! 📋",
                          description: "Prompt content copied successfully",
                        });
                      } catch (error) {
                        toast({
                          title: "Copy failed",
                          description: "Unable to copy to clipboard. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleToggleFavorite(selectedPrompt.id)}
                    className={selectedPrompt.isFavorite ? "text-yellow-600 border-yellow-200" : ""}
                  >
                    <Star className={`w-4 h-4 mr-2 ${selectedPrompt.isFavorite ? 'fill-current' : ''}`} />
                    {selectedPrompt.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <span>Delete Prompt</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{promptToDelete?.title}</strong>"? This action cannot be undone and will permanently remove the prompt from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Prompt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}