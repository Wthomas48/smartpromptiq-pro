import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Search, Star, Copy, Filter, Grid, List, Bookmark, Share2, Download,
  Edit3, Trash2, Plus, Eye, TrendingUp, Clock, Users, Zap, Brain,
  ChevronDown, MoreVertical, Tag, ArrowUpDown, RefreshCw, Sparkles,
  FileText, Target, Award, Flame, CheckCircle, AlertCircle, Lightbulb,
  Heart, MessageSquare, BarChart, Globe, Shield, Crown, Trophy,
  ChevronRight, PlayCircle, Settings, Import, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import AnimatedCounter from '@/components/AnimatedCounter';

interface PromptData {
  id: number;
  title: string;
  description: string;
  category: string;
  prompt: string;
  tags: string[];
  favorite: boolean;
  author: string;
  authorAvatar: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  rating: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  type: 'Personal' | 'Team' | 'Public' | 'Premium';
  language: string;
  wordCount: number;
  estimatedTime: string;
  featured: boolean;
  trending: boolean;
  verified: boolean;
  collections: string[];
}

export default function Library() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptData | null>(null);
  const [favorites, setFavorites] = useState<number[]>([1, 3, 7, 12]);
  const [collections, setCollections] = useState(['My Favorites', 'Business Ideas', 'Creative Writing', 'Code Reviews']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const libraryRef = useRef<HTMLDivElement>(null);

  // Enhanced mock data with comprehensive details
  const [prompts] = useState<PromptData[]>([
    {
      id: 1,
      title: "Strategic Business Plan Generator",
      description: "Create comprehensive business plans with market analysis, financial projections, and growth strategies.",
      category: "Business",
      prompt: "You are a strategic business consultant with 20+ years of experience. Create a comprehensive business plan for [BUSINESS_IDEA] including: 1) Executive Summary, 2) Market Analysis, 3) Competitive Landscape, 4) Financial Projections (5 years), 5) Marketing Strategy, 6) Operations Plan, 7) Risk Analysis, 8) Growth Milestones. Make it investor-ready with specific metrics and actionable insights.",
      tags: ["business", "strategy", "planning", "investment", "startup"],
      favorite: true,
      author: "Sarah Chen",
      authorAvatar: "👩‍💼",
      createdAt: "2024-01-15",
      lastUsed: "2 hours ago",
      usageCount: 847,
      rating: 4.9,
      difficulty: "Advanced",
      type: "Premium",
      language: "English",
      wordCount: 156,
      estimatedTime: "5-10 min",
      featured: true,
      trending: true,
      verified: true,
      collections: ["Business Plans", "Startup Tools"]
    },
    {
      id: 2,
      title: "Creative Story Architect",
      description: "Craft compelling narratives with rich characters, plot twists, and emotional depth.",
      category: "Creative Writing",
      prompt: "You are a master storyteller with expertise in narrative structure. Create an engaging story about [TOPIC/THEME] with: 1) A compelling protagonist with clear motivations, 2) An intriguing plot with unexpected twists, 3) Rich world-building and atmosphere, 4) Dialogue that reveals character, 5) A satisfying resolution. Include literary techniques like foreshadowing, symbolism, and vivid imagery. Target length: [WORD_COUNT] words.",
      tags: ["creative", "storytelling", "fiction", "narrative", "writing"],
      favorite: false,
      author: "Marcus Johnson",
      authorAvatar: "✍️",
      createdAt: "2024-01-20",
      lastUsed: "1 day ago",
      usageCount: 623,
      rating: 4.7,
      difficulty: "Intermediate",
      type: "Public",
      language: "English",
      wordCount: 134,
      estimatedTime: "3-7 min",
      featured: true,
      trending: false,
      verified: true,
      collections: ["Creative Writing"]
    },
    {
      id: 3,
      title: "Advanced Code Reviewer & Optimizer",
      description: "Comprehensive code analysis with performance optimization and security recommendations.",
      category: "Development",
      prompt: "You are a senior software architect and security expert. Review this code: [CODE_SNIPPET]. Provide: 1) Code Quality Assessment (0-10 score), 2) Security Vulnerabilities & fixes, 3) Performance Optimization suggestions, 4) Best Practices compliance, 5) Refactoring recommendations, 6) Test coverage analysis, 7) Documentation improvements, 8) Scalability considerations. Include specific code examples for improvements.",
      tags: ["code", "review", "optimization", "security", "architecture"],
      favorite: true,
      author: "Alex Rodriguez",
      authorAvatar: "👨‍💻",
      createdAt: "2024-01-10",
      lastUsed: "30 min ago",
      usageCount: 1247,
      rating: 4.8,
      difficulty: "Expert",
      type: "Team",
      language: "Multiple",
      wordCount: 178,
      estimatedTime: "10-15 min",
      featured: false,
      trending: true,
      verified: true,
      collections: ["Code Reviews", "Development Tools"]
    },
    {
      id: 4,
      title: "AI-Powered Marketing Campaign Strategist",
      description: "Design comprehensive marketing campaigns with audience targeting and performance metrics.",
      category: "Marketing",
      prompt: "You are a digital marketing expert with deep knowledge of consumer psychology. Create a marketing campaign for [PRODUCT/SERVICE] targeting [AUDIENCE]. Include: 1) Brand Positioning Strategy, 2) Customer Persona Analysis, 3) Multi-channel Campaign Plan, 4) Content Calendar (30 days), 5) Budget Allocation, 6) KPI Framework, 7) A/B Testing Strategy, 8) ROI Projections. Make it data-driven and actionable.",
      tags: ["marketing", "strategy", "campaigns", "analytics", "branding"],
      favorite: false,
      author: "Lisa Thompson",
      authorAvatar: "📊",
      createdAt: "2024-01-25",
      lastUsed: "5 hours ago",
      usageCount: 432,
      rating: 4.6,
      difficulty: "Advanced",
      type: "Premium",
      language: "English",
      wordCount: 145,
      estimatedTime: "8-12 min",
      featured: true,
      trending: true,
      verified: true,
      collections: ["Marketing Tools"]
    },
    {
      id: 5,
      title: "Data Science Insights Generator",
      description: "Extract meaningful insights from complex datasets with statistical analysis.",
      category: "Analytics",
      prompt: "You are a senior data scientist with expertise in statistical modeling and machine learning. Analyze this dataset: [DATA_DESCRIPTION]. Provide: 1) Exploratory Data Analysis summary, 2) Key statistical insights, 3) Correlation patterns, 4) Anomaly detection, 5) Predictive modeling recommendations, 6) Data visualization suggestions, 7) Business implications, 8) Next steps for deeper analysis. Use Python/R code examples where relevant.",
      tags: ["data", "analytics", "insights", "statistics", "ml"],
      favorite: true,
      author: "Dr. Emily Rodriguez",
      authorAvatar: "📈",
      createdAt: "2024-01-12",
      lastUsed: "3 hours ago",
      usageCount: 756,
      rating: 4.9,
      difficulty: "Expert",
      type: "Team",
      language: "Technical",
      wordCount: 167,
      estimatedTime: "12-20 min",
      featured: false,
      trending: false,
      verified: true,
      collections: ["Data Science", "Analytics Tools"]
    },
    {
      id: 6,
      title: "Personal Brand Builder",
      description: "Develop a compelling personal brand strategy across digital platforms.",
      category: "Personal Development",
      prompt: "You are a personal branding expert who has helped CEOs and influencers build million-dollar personal brands. Create a personal brand strategy for [NAME] in [INDUSTRY]. Include: 1) Brand Identity & Voice, 2) Target Audience Analysis, 3) Content Pillars (5 themes), 4) Platform Strategy (LinkedIn, Twitter, etc.), 5) Content Calendar Template, 6) Networking Approach, 7) Thought Leadership Plan, 8) Measurement Framework. Make it authentic and scalable.",
      tags: ["personal", "branding", "career", "networking", "influence"],
      favorite: false,
      author: "Jordan Kim",
      authorAvatar: "🚀",
      createdAt: "2024-01-18",
      lastUsed: "1 day ago",
      usageCount: 298,
      rating: 4.5,
      difficulty: "Intermediate",
      type: "Public",
      language: "English",
      wordCount: 142,
      estimatedTime: "6-10 min",
      featured: false,
      trending: true,
      verified: false,
      collections: ["Personal Development"]
    },
    {
      id: 7,
      title: "Educational Curriculum Designer",
      description: "Create comprehensive learning experiences with assessments and outcomes.",
      category: "Education",
      prompt: "You are an instructional design expert with 15+ years in educational technology. Design a complete curriculum for [SUBJECT/TOPIC] targeting [LEARNING_LEVEL]. Include: 1) Learning Objectives & Outcomes, 2) Modular Lesson Structure, 3) Interactive Activities & Exercises, 4) Assessment Strategy, 5) Resource Library, 6) Progress Tracking Methods, 7) Engagement Techniques, 8) Accessibility Considerations. Make it learner-centered and results-driven.",
      tags: ["education", "curriculum", "learning", "teaching", "assessment"],
      favorite: true,
      author: "Prof. Michael Chen",
      authorAvatar: "🎓",
      createdAt: "2024-01-08",
      lastUsed: "4 hours ago",
      usageCount: 521,
      rating: 4.8,
      difficulty: "Advanced",
      type: "Team",
      language: "English",
      wordCount: 153,
      estimatedTime: "10-15 min",
      featured: true,
      trending: false,
      verified: true,
      collections: ["Education Tools", "Curriculum Design"]
    },
    {
      id: 8,
      title: "Financial Planning Advisor",
      description: "Comprehensive financial planning with investment strategies and risk management.",
      category: "Finance",
      prompt: "You are a certified financial planner with expertise in wealth management. Create a financial plan for [CLIENT_PROFILE] with [INCOME] annual income. Include: 1) Current Financial Assessment, 2) Goal-based Planning (short/long term), 3) Investment Portfolio Strategy, 4) Risk Management Plan, 5) Tax Optimization Strategies, 6) Retirement Planning, 7) Estate Planning Basics, 8) Monthly Action Steps. Provide specific recommendations with rationale.",
      tags: ["finance", "planning", "investment", "wealth", "retirement"],
      favorite: false,
      author: "Rachel Martinez",
      authorAvatar: "💰",
      createdAt: "2024-01-22",
      lastUsed: "6 hours ago",
      usageCount: 367,
      rating: 4.7,
      difficulty: "Advanced",
      type: "Premium",
      language: "English",
      wordCount: 139,
      estimatedTime: "8-12 min",
      featured: false,
      trending: true,
      verified: true,
      collections: ["Financial Planning"]
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Categories', count: prompts.length },
    { value: 'Business', label: 'Business', count: prompts.filter(p => p.category === 'Business').length },
    { value: 'Creative Writing', label: 'Creative Writing', count: prompts.filter(p => p.category === 'Creative Writing').length },
    { value: 'Development', label: 'Development', count: prompts.filter(p => p.category === 'Development').length },
    { value: 'Marketing', label: 'Marketing', count: prompts.filter(p => p.category === 'Marketing').length },
    { value: 'Analytics', label: 'Analytics', count: prompts.filter(p => p.category === 'Analytics').length },
    { value: 'Personal Development', label: 'Personal Development', count: prompts.filter(p => p.category === 'Personal Development').length },
    { value: 'Education', label: 'Education', count: prompts.filter(p => p.category === 'Education').length },
    { value: 'Finance', label: 'Finance', count: prompts.filter(p => p.category === 'Finance').length }
  ];

  const stats = {
    totalPrompts: prompts.length,
    totalUsage: prompts.reduce((sum, p) => sum + p.usageCount, 0),
    averageRating: (prompts.reduce((sum, p) => sum + p.rating, 0) / prompts.length).toFixed(1),
    favoriteCount: favorites.length
  };

  // Filter and sort prompts
  const filteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      const matchesType = selectedType === 'all' || prompt.type === selectedType;
      const matchesDifficulty = selectedDifficulty === 'all' || prompt.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.usageCount - a.usageCount;
        case 'rating': return b.rating - a.rating;
        case 'name': return a.title.localeCompare(b.title);
        case 'recent': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });

  // Animation effects
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const copyPrompt = (prompt: string, title: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied to clipboard!",
      description: `"${title}" is ready to use.`
    });
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
    toast({
      title: favorites.includes(id) ? "Removed from favorites" : "Added to favorites",
      description: "Your library has been updated."
    });
  };

  const refreshLibrary = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Library refreshed!",
        description: "All prompts are up to date."
      });
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Premium': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Team': return <Users className="w-4 h-4 text-blue-500" />;
      case 'Public': return <Globe className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden" ref={libraryRef}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 animate-on-scroll">
          <Card className="bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Prompt Library ✨
                    </h1>
                    <p className="text-slate-600 mt-1">
                      Discover, create, and share AI-powered prompts with the community
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={refreshLibrary}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    onClick={() => toast({ title: 'Import feature coming soon!' })}
                    variant="outline"
                    size="sm"
                    className="border-slate-200 hover:border-green-300 hover:bg-green-50"
                  >
                    <Import className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <Button 
                    onClick={() => toast({ title: 'Create prompt feature coming soon!' })}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Prompt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-on-scroll">
          {[
            { icon: FileText, label: 'Total Prompts', value: stats.totalPrompts, color: 'from-blue-500 to-cyan-500' },
            { icon: TrendingUp, label: 'Total Usage', value: stats.totalUsage, color: 'from-green-500 to-emerald-500' },
            { icon: Star, label: 'Avg Rating', value: stats.averageRating, color: 'from-yellow-500 to-orange-500' },
            { icon: Heart, label: 'Favorites', value: stats.favoriteCount, color: 'from-pink-500 to-red-500' }
          ].map((stat, index) => (
            <Card key={index} className="group bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {typeof stat.value === 'number' && stat.value > 10 ? (
                        <AnimatedCounter end={stat.value} duration={2000 + index * 200} />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/20 shadow-lg animate-on-scroll">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search prompts, tags, authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex items-center space-x-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 h-12 border-slate-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{category.label}</span>
                          <Badge className="ml-2 bg-slate-100 text-slate-600">{category.count}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 h-12 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="name">A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-12 w-12 p-0"
                  >
                    <Grid className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-12 w-12 p-0"
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Team">Team</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setSelectedDifficulty('all');
                    setSearchTerm('');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 animate-on-scroll">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredPrompts.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{prompts.length}</span> prompts
            </p>
            {filteredPrompts.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>Avg time: 8-12 minutes</span>
              </div>
            )}
          </div>
        </div>

        {/* Prompts Grid/List */}
        {isLoading ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="py-24">
              <div className="text-center">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Refreshing Library</h3>
                <p className="text-slate-600">Loading the latest prompts...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredPrompts.length === 0 ? (
          <Card className="bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="py-24">
              <div className="text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="text-indigo-500 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No prompts found</h3>
                <p className="text-slate-600 mb-8">
                  Try adjusting your search terms or filters to discover more prompts.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setSelectedDifficulty('all');
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 animate-on-scroll ${
            viewMode === 'grid' 
              ? 'md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredPrompts.map((prompt, index) => (
              <Card
                key={prompt.id}
                className="group relative bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedPrompt(prompt)}
              >
                {/* Featured/Trending Badges */}
                <div className="absolute top-3 left-3 flex space-x-1 z-10">
                  {prompt.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {prompt.trending && (
                    <Badge className="bg-gradient-to-r from-pink-400 to-red-500 text-white text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(prompt.id);
                  }}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-300"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(prompt.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-slate-400'
                    }`} 
                  />
                </button>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                        {prompt.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                        {prompt.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <Badge className={getDifficultyColor(prompt.difficulty)}>
                      {prompt.difficulty}
                    </Badge>
                    <Badge className="bg-slate-100 text-slate-700">
                      {prompt.category}
                    </Badge>
                    <div className="flex items-center">
                      {getTypeIcon(prompt.type)}
                    </div>
                    {prompt.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">{prompt.authorAvatar}</span>
                    <span className="text-sm text-slate-600">{prompt.author}</span>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(prompt.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1">{prompt.rating}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {prompt.tags.slice(0, 4).map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        variant="secondary" 
                        className="bg-indigo-50 text-indigo-700 text-xs hover:bg-indigo-100 cursor-pointer"
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {prompt.tags.length > 4 && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                        +{prompt.tags.length - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{prompt.usageCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{prompt.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="w-3 h-3" />
                      <span>{prompt.wordCount} words</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPrompt(prompt.prompt, prompt.title);
                      }}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition-all duration-300"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({ title: 'Preview feature coming soon!' });
                      }}
                      className="border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast({ title: 'Share feature coming soon!' });
                      }}
                      className="border-slate-200 hover:border-green-300 hover:bg-green-50"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredPrompts.length > 0 && filteredPrompts.length >= 8 && (
          <div className="mt-12 text-center animate-on-scroll">
            <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 inline-block">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Discover More Prompts</h4>
                <p className="text-slate-600 mb-4">Load additional prompts to expand your library</p>
                <Button 
                  onClick={() => toast({ title: 'Loading more prompts...', description: 'Feature coming soon!' })}
                  variant="outline" 
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Load More Prompts
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={() => toast({ title: 'AI Library Assistant', description: 'Coming soon! Get personalized prompt recommendations.' })}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group"
        >
          <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Detailed Prompt Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedPrompt.title}</h2>
                  <p className="text-slate-600">{selectedPrompt.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Prompt Content</h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {selectedPrompt.prompt}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={() => copyPrompt(selectedPrompt.prompt, selectedPrompt.title)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                    <Button variant="outline">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Author:</span>
                        <span className="text-slate-900">{selectedPrompt.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Category:</span>
                        <Badge>{selectedPrompt.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Difficulty:</span>
                        <Badge className={getDifficultyColor(selectedPrompt.difficulty)}>
                          {selectedPrompt.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Usage:</span>
                        <span className="text-slate-900">{selectedPrompt.usageCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Rating:</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-slate-900">{selectedPrompt.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedPrompt.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}