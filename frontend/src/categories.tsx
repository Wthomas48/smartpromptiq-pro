import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Palette, Code, Wand2, Upload, Crown, Search, Sparkles,
  BarChart3, Megaphone, GraduationCap, Brain, Calculator, Globe,
  Target, Clock, Users, Star, ArrowLeft, Zap, Heart, Bookmark,
  TrendingDown, Activity, Award, FileText, Lightbulb, Timer
} from 'lucide-react';

interface Category {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  detailedDescription: string;
  tags: string[];
  gradient: string;
  badgeColor: string;
  iconGradient: string;
  tier: "free" | "premium";
  templateCount: number;
  avgCompletionTime: string;
  popularity: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  examples: string[];
  recentlyUpdated?: boolean;
  trending?: boolean;
  userRating: number;
  completionRate: number;
  successStories: number;
}

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string>("");
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  // Load user preferences from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCategories');
    const savedProgress = localStorage.getItem('categoryProgress');
    
    if (savedFavorites) {
      setFavoriteCategories(JSON.parse(savedFavorites));
    }
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  const categories: Category[] = [
    {
      id: "business-strategy",
      icon: TrendingUp,
      title: "Business Strategy",
      description: "Generate comprehensive business plans, marketing strategies, competitive analyses, and operational frameworks tailored to your industry and goals.",
      detailedDescription: "Create detailed business strategies including market analysis, competitive positioning, financial projections, operational plans, and growth roadmaps. Perfect for entrepreneurs, consultants, and business leaders.",
      tags: ["Market Analysis", "Business Plans", "Strategy", "SWOT Analysis", "Financial Planning"],
      gradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
      badgeColor: "bg-blue-100 text-blue-800",
      iconGradient: "from-blue-500 to-indigo-600",
      tier: "free",
      templateCount: 24,
      avgCompletionTime: "15-20 min",
      popularity: 95,
      difficulty: "Intermediate",
      examples: ["Business Model Canvas", "Market Entry Strategy", "Competitive Analysis", "Growth Planning"],
      trending: true,
      userRating: 4.8,
      completionRate: 87,
      successStories: 1247
    },
    {
      id: "creative",
      icon: Palette,
      title: "Creative & Design", 
      description: "Create detailed creative briefs, design specifications, brand guidelines, and artistic direction for your visual projects.",
      detailedDescription: "Develop comprehensive creative strategies including brand identity, visual design systems, creative campaigns, and artistic direction. Ideal for designers, marketers, and creative professionals.",
      tags: ["Brand Design", "Creative Briefs", "Art Direction", "Visual Identity", "Design Systems"],
      gradient: "bg-gradient-to-br from-violet-50 to-purple-100",
      badgeColor: "bg-violet-100 text-violet-800",
      iconGradient: "from-violet-500 to-purple-600",
      tier: "free",
      templateCount: 18,
      avgCompletionTime: "12-18 min",
      popularity: 87,
      difficulty: "Beginner",
      examples: ["Brand Identity Brief", "Logo Design Guidelines", "Creative Campaign", "Visual Style Guide"],
      recentlyUpdated: true,
      userRating: 4.6,
      completionRate: 92,
      successStories: 856
    },
    {
      id: "technical",
      icon: Code,
      title: "Technical & Development",
      description: "Generate technical specifications, project requirements, architecture diagrams, and development roadmaps for your software projects.",
      detailedDescription: "Build detailed technical documentation including system architecture, API specifications, database schemas, security protocols, and development workflows. Perfect for developers, architects, and technical leads.",
      tags: ["Architecture", "Requirements", "Roadmaps", "API Design", "Database Design"],
      gradient: "bg-gradient-to-br from-emerald-50 to-teal-100", 
      badgeColor: "bg-emerald-100 text-emerald-800",
      iconGradient: "from-emerald-500 to-teal-600",
      tier: "free",
      templateCount: 32,
      avgCompletionTime: "20-30 min",
      popularity: 91,
      difficulty: "Advanced",
      examples: ["API Documentation", "System Architecture", "Database Schema", "Security Audit"],
      userRating: 4.9,
      completionRate: 78,
      successStories: 1095
    },
    {
      id: "marketing",
      icon: Megaphone,
      title: "Marketing & Growth",
      description: "Develop comprehensive marketing strategies, campaign plans, content calendars, and growth frameworks.",
      detailedDescription: "Create detailed marketing strategies including audience research, content planning, campaign execution, social media strategies, and growth hacking techniques. Great for marketers and growth professionals.",
      tags: ["Marketing Strategy", "Content Planning", "Social Media", "Growth Hacking", "Campaign Management"],
      gradient: "bg-gradient-to-br from-orange-50 to-red-100",
      badgeColor: "bg-orange-100 text-orange-800",
      iconGradient: "from-orange-500 to-red-600",
      tier: "premium",
      templateCount: 28,
      avgCompletionTime: "10-15 min",
      popularity: 89,
      difficulty: "Intermediate",
      examples: ["Marketing Campaign", "Content Strategy", "Social Media Plan", "Growth Metrics"],
      trending: true,
      userRating: 4.7,
      completionRate: 85,
      successStories: 923
    },
    {
      id: "research",
      icon: Brain,
      title: "Research & Analysis",
      description: "Design research methodologies, data analysis frameworks, and comprehensive study plans.",
      detailedDescription: "Develop robust research approaches including user research, market studies, data analysis protocols, and academic research frameworks. Ideal for researchers, analysts, and data professionals.",
      tags: ["User Research", "Data Analysis", "Market Research", "Academic Research", "Survey Design"],
      gradient: "bg-gradient-to-br from-cyan-50 to-blue-100",
      badgeColor: "bg-cyan-100 text-cyan-800",
      iconGradient: "from-cyan-500 to-blue-600",
      tier: "premium",
      templateCount: 16,
      avgCompletionTime: "25-35 min",
      popularity: 76,
      difficulty: "Advanced",
      examples: ["User Research Plan", "Market Analysis", "Data Collection", "Research Methodology"],
      userRating: 4.5,
      completionRate: 73,
      successStories: 634
    },
    {
      id: "education",
      icon: GraduationCap,
      title: "Education & Training",
      description: "Create curriculum designs, training programs, educational content, and learning assessments.",
      detailedDescription: "Build comprehensive educational frameworks including course design, learning objectives, assessment methods, and training materials. Perfect for educators, trainers, and instructional designers.",
      tags: ["Curriculum Design", "Training Programs", "Learning Objectives", "Assessment", "Educational Content"],
      gradient: "bg-gradient-to-br from-green-50 to-emerald-100",
      badgeColor: "bg-green-100 text-green-800",
      iconGradient: "from-green-500 to-emerald-600",
      tier: "free",
      templateCount: 20,
      avgCompletionTime: "18-25 min",
      popularity: 82,
      difficulty: "Beginner",
      examples: ["Course Curriculum", "Training Module", "Learning Assessment", "Educational Goals"],
      recentlyUpdated: true,
      userRating: 4.4,
      completionRate: 88,
      successStories: 745
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsNavigating(true);
    
    // Save selection to analytics
    const analytics = JSON.parse(localStorage.getItem('categoryAnalytics') || '{}');
    analytics[categoryId] = (analytics[categoryId] || 0) + 1;
    localStorage.setItem('categoryAnalytics', JSON.stringify(analytics));
    
    setTimeout(() => {
      window.location.href = `/questionnaire?category=${categoryId}`;
    }, 800);
  };

  const toggleFavorite = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newFavorites = favoriteCategories.includes(categoryId)
      ? favoriteCategories.filter(id => id !== categoryId)
      : [...favoriteCategories, categoryId];
    
    setFavoriteCategories(newFavorites);
    localStorage.setItem('favoriteCategories', JSON.stringify(newFavorites));
  };

  const getTierBadge = (tier: string) => {
    if (tier === "premium") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        <Sparkles className="w-3 h-3 mr-1" />
        Free
      </Badge>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 🚀 AWESOME UNIQUE FEATURE: Smart Category Recommendations
  const getPersonalizedRecommendation = () => {
    const userAnalytics = JSON.parse(localStorage.getItem('categoryAnalytics') || '{}');
    const mostUsed = Object.entries(userAnalytics).sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    if (mostUsed) {
      const category = categories.find(c => c.id === mostUsed[0]);
      return category ? `Based on your usage, you might also like ${category.title}` : null;
    }
    return "New to Smart PromptIQ? Start with Business Strategy - it's our most popular category!";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🌟 UNIQUE FEATURE: Dynamic Header with Smart Recommendations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/dashboard'}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Choose Your Category</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Select the type of prompt you want to generate. Each category uses specialized questionnaires 
              to create the most relevant and actionable outputs for your specific needs.
            </p>
            
            {/* 🎯 AWESOME FEATURE: Personalized Recommendation */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 max-w-md mx-auto mb-8">
              <div className="flex items-center gap-2 text-sm text-indigo-700">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">Smart Recommendation:</span>
              </div>
              <p className="text-sm text-indigo-600 mt-1">{getPersonalizedRecommendation()}</p>
            </div>
            
            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3 text-lg"
                />
              </div>
            </div>
          </div>
          
          {/* 🔥 UNIQUE FEATURE: Featured Custom Questionnaire with Real-time Stats */}
          <div className="mb-16">
            <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Wand2 className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Custom Builder</CardTitle>
                <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Skip the categories and let our AI create a completely personalized questionnaire 
                  based on your industry, role, and specific requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-indigo-600">2.3k+</div>
                    <div className="text-xs text-gray-600">Custom Prompts Created</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">98%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">4.9★</div>
                    <div className="text-xs text-gray-600">User Rating</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-600">12min</div>
                    <div className="text-xs text-gray-600">Avg. Time</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => window.location.href = "/custom-questionnaire"}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Wand2 className="mr-3 h-6 w-6" />
                  Launch AI Builder
                  <Sparkles className="ml-3 h-6 w-6" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Category Selection Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Specialized Categories</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from our expertly crafted categories for faster prompt generation. 
              Each category includes multiple templates and guided workflows optimized for specific use cases.
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Found {filteredCategories.length} categories matching "{searchTerm}"
              </p>
            )}
          </div>

          {/* 🎨 ENHANCED Categories Grid with Awesome Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              const isNavigatingThis = isNavigating && isSelected;
              const isFavorite = favoriteCategories.includes(category.id);
              const isHovered = hoveredCategory === category.id;
              const userProgressPercent = userProgress[category.id] || 0;
              
              return (
                <Card
                  key={category.id}
                  className={`
                    ${category.gradient} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 
                    cursor-pointer group relative overflow-hidden transform hover:-translate-y-3
                    ${isSelected ? 'ring-4 ring-indigo-300 scale-105' : ''}
                    ${isNavigatingThis ? 'animate-pulse' : ''}
                    ${isHovered ? 'shadow-2xl scale-105' : ''}
                  `}
                  onClick={() => handleCategorySelect(category.id)}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory('')}
                >
                  {/* 🌟 UNIQUE: Floating Status Indicators */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    {getTierBadge(category.tier)}
                    {category.trending && (
                      <Badge className="bg-orange-100 text-orange-800 animate-pulse">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {category.recentlyUpdated && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    )}
                  </div>

                  {/* 💖 AWESOME: Favorite Heart Button */}
                  <button
                    onClick={(e) => toggleFavorite(category.id, e)}
                    className="absolute top-4 left-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'
                      }`} 
                    />
                  </button>

                  {/* 📊 UNIQUE: Real-time Stats Overlay */}
                  <div className="absolute top-16 left-4 z-10">
                    <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/90 rounded-full px-2 py-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="font-medium">{category.userRating}</span>
                    </div>
                  </div>

                  <CardHeader className="relative pt-16">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.iconGradient} text-white shadow-lg mb-4 transform transition-transform group-hover:scale-110`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {category.title}
                      </CardTitle>
                      
                      {/* 🎯 ENHANCED: Detailed Stats Row */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{category.templateCount} templates</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          <span>{category.avgCompletionTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{category.successStories}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <CardDescription className="text-center text-gray-700 leading-relaxed">
                        {isHovered ? category.detailedDescription : category.description}
                      </CardDescription>
                      
                      {/* 🏷️ Enhanced Tags with Popularity Indicators */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {category.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {category.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* 🎊 UNIQUE: Success Metrics */}
                      <div className="bg-white/60 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Completion Rate</span>
                          <span className="font-medium">{category.completionRate}%</span>
                        </div>
                        <Progress value={category.completionRate} className="h-1" />
                        
                        <div className="flex justify-between text-xs">
                          <span>Popularity</span>
                          <span className="font-medium">{category.popularity}%</span>
                        </div>
                        <Progress value={category.popularity} className="h-1" />
                      </div>

                      {/* 📝 ENHANCED: Example Preview */}
                      <div className="bg-white/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Popular templates:</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          {category.examples.slice(0, 2).map((example, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <span>{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 🎯 Enhanced Action Bar */}
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(category.difficulty)}>
                          {category.difficulty}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          {isNavigatingThis ? (
                            <>
                              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                              Loading...
                            </>
                          ) : (
                            <>
                              Start Building
                              <Zap className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any categories matching "{searchTerm}". Try a different search term.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="px-6 py-2"
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* 🌟 AWESOME: Bottom Insights Panel */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 mb-2">Most Active Today</h3>
                <p className="text-sm text-green-700">Business Strategy (847 prompts created)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-900 mb-2">Highest Rated</h3>
                <p className="text-sm text-purple-700">Technical Development (4.9★ average)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-orange-900 mb-2">Trending This Week</h3>
                <p className="text-sm text-orange-700">Marketing & Growth (+23% usage)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}