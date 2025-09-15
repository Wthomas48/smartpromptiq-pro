import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
  Search, Grid, List, Star, TrendingUp, Crown, Heart, Clock, Users,
  AlertCircle, CheckCircle, Settings, Zap, Eye, RefreshCw,
  Briefcase, TrendingDown, DollarSign, GraduationCap, Target, Lightbulb
} from "lucide-react";

export default function Templates() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Check if user can access premium templates
  const canAccessPremium = () => {
    if (!user) return false;
    const userTier = user.subscription?.tier || 'free';
    return ['starter', 'pro', 'business'].includes(userTier);
  };

  // Handle premium template access
  const handlePremiumAccess = (template: any) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to access templates",
        variant: "destructive",
      });
      setLocation('/signin');
      return;
    }

    if (!canAccessPremium()) {
      toast({
        title: "Upgrade Required",
        description: "This is a premium template. Upgrade to access all templates!",
        variant: "destructive",
      });
      // Redirect to pricing page with upgrade context
      setLocation('/pricing?upgrade=starter&feature=template&template=' + template.id);
      return;
    }

    // If user has access, proceed with template
    console.log('Going to questionnaire for premium template:', template.name);
    setLocation(`/questionnaire/${template.categoryKey}`);
  };

  // Debug logging
  useEffect(() => {
    console.log('🚀 === TEMPLATES COMPONENT MOUNTED ===');
    console.log('🔐 isAuthenticated:', isAuthenticated);

    const totalTemplates = Object.values(templateCategories).reduce((sum, cat) => sum + cat.templates.length, 0);
    console.log('📋 Total templates loaded:', totalTemplates);

    return () => {};
  }, [isAuthenticated]);

  // Template data
  const templateCategories = {
    "business-strategy": {
      name: "Business Strategy",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
      description: "Strategic planning, market analysis, and business growth solutions",
      painPoint: "Struggling to create clear business strategies and competitive advantages",
      templates: [
        {
          id: "startup-pitch",
          name: "Startup Pitch Deck Mastery",
          description: "Create investor-ready pitch decks that secure funding and partnerships",
          painPoint: "90% of startups fail to get funding due to poor pitch presentations",
          solution: "Structured storytelling framework that converts investors into believers",
          tags: ["Pitch Deck", "Investment", "Fundraising", "Storytelling"],
          difficulty: "Advanced" as const,
          estimatedTime: "15-20 min",
          usageCount: 2847,
          rating: 4.9,
          featured: true,
          trending: true,
          premium: true,
          categoryKey: "business-strategy"
        },
        {
          id: "market-penetration",
          name: "Market Penetration Strategy",
          description: "Develop comprehensive strategies to capture and dominate market segments",
          painPoint: "Companies struggle to gain market share in competitive landscapes",
          solution: "Data-driven market entry strategies with tactical execution plans",
          tags: ["Market Strategy", "Competition", "Growth", "Analysis"],
          difficulty: "Expert" as const,
          estimatedTime: "20-25 min",
          usageCount: 1923,
          rating: 4.8,
          featured: true,
          trending: false,
          premium: true,
          categoryKey: "business-strategy"
        }
      ]
    },
    "marketing": {
      name: "Marketing",
      icon: TrendingUp,
      color: "from-pink-500 to-rose-500",
      description: "Marketing campaigns, brand strategy, and customer acquisition",
      painPoint: "Struggling to create effective marketing campaigns that convert",
      templates: [
        {
          id: "social-campaign",
          name: "Viral Social Media Campaign",
          description: "Create engaging social media campaigns that drive massive reach and engagement",
          painPoint: "Most social campaigns get ignored in the noise of social media",
          solution: "Psychology-driven content frameworks that trigger sharing and engagement",
          tags: ["Social Media", "Viral", "Engagement", "Content"],
          difficulty: "Intermediate" as const,
          estimatedTime: "10-15 min",
          usageCount: 3421,
          rating: 4.7,
          featured: true,
          trending: true,
          premium: false,
          categoryKey: "marketing"
        }
      ]
    },
    "financial-planning": {
      name: "Financial Planning",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      description: "Financial analysis, budgeting, and investment strategies",
      painPoint: "Difficulty creating comprehensive financial plans and forecasts",
      templates: [
        {
          id: "budget-optimizer",
          name: "Smart Budget Optimizer",
          description: "Create optimized budgets that maximize ROI and minimize waste",
          painPoint: "Most budgets fail because they don't account for real business dynamics",
          solution: "Dynamic budgeting framework that adapts to changing business conditions",
          tags: ["Budget", "ROI", "Optimization", "Financial"],
          difficulty: "Intermediate" as const,
          estimatedTime: "12-18 min",
          usageCount: 1567,
          rating: 4.6,
          featured: false,
          trending: false,
          premium: true,
          categoryKey: "financial-planning"
        }
      ]
    },
    "education": {
      name: "Education",
      icon: GraduationCap,
      color: "from-purple-500 to-indigo-500",
      description: "Learning materials, curriculum design, and educational content",
      painPoint: "Difficulty creating engaging educational content that actually teaches",
      templates: [
        {
          id: "course-creator",
          name: "Engaging Course Creator",
          description: "Design courses that keep students engaged and ensure learning outcomes",
          painPoint: "Most online courses have 90%+ dropout rates due to poor engagement",
          solution: "Neuroscience-based learning design that maximizes retention and completion",
          tags: ["Course Design", "Learning", "Engagement", "Education"],
          difficulty: "Beginner" as const,
          estimatedTime: "8-12 min",
          usageCount: 892,
          rating: 4.8,
          featured: false,
          trending: true,
          premium: false,
          categoryKey: "education"
        }
      ]
    }
  };

  // Create flat array of all templates
  const allTemplates = Object.entries(templateCategories).flatMap(([categoryKey, category]) =>
    category.templates.map(template => ({ ...template, categoryName: category.name, categoryKey }))
  );

  console.log('🔍 allTemplates count:', allTemplates.length);
  console.log('🔍 activeCategory:', activeCategory);
  console.log('🔍 searchTerm:', searchTerm);
  console.log('🔍 selectedDifficulty:', selectedDifficulty);

  // Filter and sort templates
  const filteredTemplates = allTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || template.categoryKey === activeCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      // Sort by featured first, then by usage count
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.usageCount - a.usageCount;
    });

  console.log('🔍 filteredTemplates count:', filteredTemplates.length);

  // Template statistics
  const stats = {
    totalTemplates: allTemplates.length,
    featuredCount: allTemplates.filter(t => t.featured).length,
    trendingCount: allTemplates.filter(t => t.trending).length,
    avgRating: (allTemplates.reduce((sum, t) => sum + t.rating, 0) / allTemplates.length).toFixed(1)
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );

    toast({
      title: favorites.includes(templateId) ? "Removed from favorites" : "Added to favorites",
      description: "Your template library has been updated."
    });
  };

  const handleUseTemplate = (template: any) => {
    console.log('🚀 === HANDLE USE TEMPLATE FUNCTION CALLED ===');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('📋 template received:', template);

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to signin');
      toast({
        title: "Authentication Required",
        description: "Please sign in to use templates.",
        variant: "destructive",
      });
      setLocation('/signin');
      return;
    }

    console.log('✅ User authenticated, proceeding to questionnaire');
    setLocation(`/questionnaire/${template.categoryKey}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-cyan-600/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Ready-to-Use <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Templates</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
            Skip the setup. Jump straight to results with our curated collection of high-converting AI prompt templates.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { label: "Templates", value: stats.totalTemplates, icon: Target },
              { label: "Featured", value: stats.featuredCount, icon: Star },
              { label: "Trending", value: stats.trendingCount, icon: TrendingUp },
              { label: "Avg Rating", value: stats.avgRating, icon: Users }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {typeof stat.value === 'number' && stat.value > 10 ? (
                      <AnimatedCounter end={stat.value} duration={2000 + index * 200} />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-white/20"
                />
              </div>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[180px] bg-white/80 backdrop-blur-sm border-white/20">
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
            </div>

            {/* Category Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                onClick={() => setActiveCategory("all")}
                size="sm"
                className="mb-2"
              >
                All Categories
              </Button>
              {Object.entries(templateCategories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={key}
                    variant={activeCategory === key ? "default" : "outline"}
                    onClick={() => setActiveCategory(key)}
                    size="sm"
                    className="mb-2 flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </Button>
                );
              })}
            </div>

            {/* Results and View Toggle */}
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredTemplates.length}</span> templates
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="w-10 h-10 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-10 h-10 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Unified Templates View */}
        <div className={`grid gap-6 animate-on-scroll ${
          viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        }`}>
          {filteredTemplates.map((template, index) => (
            <Card
              key={`${template.categoryKey}-${template.id}`}
              className="group relative bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 flex space-x-2 z-10">
                {template.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {template.trending && (
                  <Badge className="bg-gradient-to-r from-pink-400 to-red-500 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
                {template.premium && (
                  <Badge className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 hover:scale-110 transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.includes(template.id)
                      ? 'text-red-500 fill-current'
                      : 'text-slate-400'
                  }`}
                />
              </button>

              <CardHeader className="pb-3">
                <div className="pt-8">
                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-sm mb-3">
                    {template.description}
                  </CardDescription>
                </div>

                {/* Pain Point & Solution */}
                <div className="space-y-3 mb-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-700 mb-1">Pain Point</p>
                        <p className="text-xs text-red-600">{template.painPoint}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-1">Solution</p>
                        <p className="text-xs text-green-600">{template.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{template.estimatedTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{template.usageCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Action Buttons */}
                <div className="flex items-center justify-between space-x-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isAuthenticated ? 'Customize' : 'Sign In to Customize'}
                  </Button>

                  <button
                    onClick={() => {
                      console.log('TEMPLATE BUTTON CLICKED:', template.name);

                      // Check if template is premium and handle accordingly
                      if (template.premium) {
                        handlePremiumAccess(template);
                        return;
                      }

                      // Handle free templates
                      if (!isAuthenticated) {
                        alert('Please sign in first!');
                        setLocation('/signin');
                        return;
                      }
                      alert('Going to questionnaire for: ' + template.name);
                      setLocation(`/questionnaire/${template.categoryKey}`);
                    }}
                    className="px-3 py-1 border border-slate-200 rounded hover:border-indigo-300 hover:bg-indigo-50 relative z-10 bg-white cursor-pointer text-sm flex items-center gap-1"
                  >
                    <Zap className="w-4 h-4" />
                    {!isAuthenticated
                      ? 'Sign In to Use'
                      : template.premium && !canAccessPremium()
                      ? 'Upgrade to Use'
                      : 'Use Template'
                    }
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Preview functionality
                    }}
                    className="w-10 h-10 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <Card className="bg-gradient-to-br from-white/80 to-indigo-50/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="py-16">
              <div className="text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Search className="text-indigo-500" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No templates found</h3>
                <p className="text-slate-600 mb-8">
                  Try adjusting your search terms or explore different categories to find the perfect template.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDifficulty('all');
                    setActiveCategory('all');
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        {filteredTemplates.length > 0 && (
          <Card className="mt-12 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm border-white/20 shadow-lg animate-on-scroll">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Need a Custom Solution? 🎯
                </h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                  Can't find the perfect template? Create custom prompts using our intelligent questionnaire system.
                  Get AI-generated content tailored to your specific pain points and requirements.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setLocation('/categories')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Create Custom Prompt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}