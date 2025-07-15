import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrainLogo, { BrainIcon } from './BrainLogo';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Zap,
  BarChart3,
  FileText,
  Code,
  Megaphone,
  GraduationCap,
  Briefcase,
  Heart,
  TrendingUp,
  Target,
  Lightbulb,
  Edit3,
  Globe,
  Rocket,
  ChevronRight,
  Crown,
  Lock
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  usageCount: number;
  rating: number;
  isPremium: boolean;
  isPopular: boolean;
  tags: string[];
  preview: string;
  icon: React.ReactNode;
  color: string;
}

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { name: 'All', icon: <Globe className="w-4 h-4" />, count: 47 },
    { name: 'Business', icon: <Briefcase className="w-4 h-4" />, count: 12 },
    { name: 'Marketing', icon: <Megaphone className="w-4 h-4" />, count: 8 },
    { name: 'Development', icon: <Code className="w-4 h-4" />, count: 10 },
    { name: 'Education', icon: <GraduationCap className="w-4 h-4" />, count: 7 },
    { name: 'Content', icon: <Edit3 className="w-4 h-4" />, count: 6 },
    { name: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, count: 4 }
  ];

  const templates: Template[] = [
    {
      id: '1',
      title: 'Business Strategy Framework',
      description: 'Create comprehensive business strategies with market analysis, competitive positioning, and growth plans.',
      category: 'Business',
      difficulty: 'Advanced',
      estimatedTime: '15-20 min',
      usageCount: 1247,
      rating: 4.8,
      isPremium: true,
      isPopular: true,
      tags: ['Strategy', 'Analysis', 'Growth'],
      preview: 'Analyze market opportunities, define competitive advantages...',
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: '2',
      title: 'Social Media Campaign',
      description: 'Design engaging social media campaigns with content calendars, hashtag strategies, and engagement tactics.',
      category: 'Marketing',
      difficulty: 'Intermediate',
      estimatedTime: '10-15 min',
      usageCount: 892,
      rating: 4.6,
      isPremium: false,
      isPopular: true,
      tags: ['Social Media', 'Campaign', 'Engagement'],
      preview: 'Create compelling social media content that drives engagement...',
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: '3',
      title: 'API Documentation Generator',
      description: 'Generate comprehensive API documentation with examples, error codes, and integration guides.',
      category: 'Development',
      difficulty: 'Intermediate',
      estimatedTime: '12-18 min',
      usageCount: 654,
      rating: 4.7,
      isPremium: false,
      isPopular: false,
      tags: ['API', 'Documentation', 'Technical'],
      preview: 'Document your API endpoints with clear examples...',
      icon: <Code className="w-6 h-6" />,
      color: 'from-green-500 to-teal-600'
    },
    {
      id: '4',
      title: 'Learning Module Designer',
      description: 'Create structured learning modules with objectives, activities, and assessments for any subject.',
      category: 'Education',
      difficulty: 'Beginner',
      estimatedTime: '8-12 min',
      usageCount: 445,
      rating: 4.5,
      isPremium: false,
      isPopular: false,
      tags: ['Education', 'Learning', 'Curriculum'],
      preview: 'Design effective learning experiences with clear objectives...',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: '5',
      title: 'Content Strategy Planner',
      description: 'Plan comprehensive content strategies with topic research, SEO optimization, and publishing schedules.',
      category: 'Content',
      difficulty: 'Intermediate',
      estimatedTime: '15-25 min',
      usageCount: 723,
      rating: 4.9,
      isPremium: true,
      isPopular: true,
      tags: ['Content', 'SEO', 'Strategy'],
      preview: 'Develop content that ranks well and engages your audience...',
      icon: <Edit3 className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: '6',
      title: 'Data Analytics Report',
      description: 'Generate insightful analytics reports with visualizations, trends, and actionable recommendations.',
      category: 'Analytics',
      difficulty: 'Advanced',
      estimatedTime: '20-30 min',
      usageCount: 334,
      rating: 4.4,
      isPremium: true,
      isPopular: false,
      tags: ['Analytics', 'Data', 'Insights'],
      preview: 'Turn your data into actionable business insights...',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-indigo-500 to-blue-600'
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.usageCount - a.usageCount;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'time':
        return parseInt(a.estimatedTime) - parseInt(b.estimatedTime);
      default:
        return 0;
    }
  });

  const handleTemplateSelect = (template: Template) => {
  if (template.isPremium) {
    // Show upgrade modal for premium templates
    alert(`${template.title} is a premium template. Please upgrade to access premium features!`);
    window.location.href = '/billing';
  } else {
    // Navigate to prompt builder with selected template  
    alert(`Opening ${template.title} template in Prompt Builder!`);
    window.location.href = `/prompt-builder?template=${template.id}`;
  }
};
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📚 Prompt Templates
              </h1>
              <p className="text-gray-600">
                Professional templates to jumpstart your AI projects. From business strategy to technical documentation.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Badge variant="secondary" className="px-3 py-1">
                <Rocket className="w-4 h-4 mr-1" />
                {templates.length} Templates
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                10,000+ Users
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
                <option value="time">Shortest Time</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 border'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Featured Template */}
            <Card className="border-0 shadow-md mt-6 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <CardTitle className="text-lg">Featured Template</CardTitle>
                </div>
                <CardDescription>
                  Most popular this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">AI Product Launch Strategy</h4>
                  <p className="text-sm text-gray-600">Complete go-to-market strategy for AI products with positioning, pricing, and launch timeline.</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                    <Button size="sm">
                      Try Now
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Templates Grid */}
          <div className="lg:col-span-3">
            {sortedTemplates.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="text-center py-12">
                  <BrainLogo size={64} variant="simple" className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or category filter</p>
                  <Button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {sortedTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="relative">
                      {template.isPremium && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                      
                      {template.isPopular && !template.isPremium && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} text-white`}>
                          {template.icon}
                        </div>
                        
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {template.title}
                          </CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Preview */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-600 italic">"{template.preview}"</p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{template.estimatedTime}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{template.usageCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{template.rating}</span>
                            </div>
                          </div>
                          
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full group-hover:bg-indigo-700 transition-colors"
                          disabled={template.isPremium}
                        >
                          {template.isPremium ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Upgrade to Use
                            </>
                          ) : (
                            <>
                              <BrainIcon size={16} className="mr-2" />
                              Use Template
                            </>
                          )}
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}