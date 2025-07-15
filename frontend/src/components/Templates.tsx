// src/components/Templates.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { 
  // Add all missing imports
  Sparkles,
  Users,
  Code,
  Palette,
  Star,
  Heart,
  Crown,
  ArrowRight,
  Plus,
  Eye,
  Play,
  BarChart3,
  TrendingUp,
  BookOpen,
  Search,
  Filter,
  Copy,
  MoreHorizontal,
  Timer,
  Clock,
  Download,
  Share2,
  Bookmark,
  Target,
  Zap,
  Brain,
  FileText,
  Megaphone,
  GraduationCap,
  MessageCircle,
  Globe,
  Shield,
  Award,
  Lightbulb,
  Coffee,
  Rocket,
  CheckCircle,
  ThumbsUp,
  Activity,
  Flame,
  Tag,
  Calendar,
  Layers,
  Settings,
  RefreshCw,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  usage: number;
  rating: number;
  reviews: number;
  author: string;
  premium: boolean;
  trending: boolean;
  featured: boolean;
  lastUpdated: string;
  icon: JSX.Element;
  color: string;
  previewContent: string;
}

const Templates = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Sample templates data
  const templates: Template[] = [
    {
      id: 'business-strategy-comprehensive',
      title: 'Comprehensive Business Strategy',
      description: 'Create detailed business strategies with market analysis, competitive landscape, and growth planning',
      category: 'Business',
      subcategory: 'Strategy',
      tags: ['Strategy', 'Analysis', 'Planning', 'Market Research'],
      difficulty: 'advanced',
      estimatedTime: '15-20 min',
      usage: 1240,
      rating: 4.8,
      reviews: 156,
      author: 'Strategic Consulting Team',
      premium: true,
      trending: true,
      featured: true,
      lastUpdated: '2024-12-15',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-600',
      previewContent: 'Analyze market opportunities and develop comprehensive strategies...'
    },
    {
      id: 'social-media-campaign',
      title: 'Social Media Campaign Builder',
      description: 'Design engaging social media campaigns with content calendars and audience targeting',
      category: 'Marketing',
      subcategory: 'Social Media',
      tags: ['Social Media', 'Campaign', 'Content', 'Engagement'],
      difficulty: 'beginner',
      estimatedTime: '8-12 min',
      usage: 2180,
      rating: 4.9,
      reviews: 203,
      author: 'Marketing Experts',
      premium: false,
      trending: true,
      featured: false,
      lastUpdated: '2024-12-10',
      icon: <Megaphone className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-600',
      previewContent: 'Create compelling social media content that drives engagement...'
    },
    {
      id: 'api-documentation-generator',
      title: 'API Documentation Generator',
      description: 'Generate comprehensive API documentation with examples, endpoints, and integration guides',
      category: 'Development',
      subcategory: 'Documentation',
      tags: ['API', 'Documentation', 'Technical Writing', 'Integration'],
      difficulty: 'intermediate',
      estimatedTime: '10-15 min',
      usage: 890,
      rating: 4.7,
      reviews: 89,
      author: 'DevDocs Team',
      premium: false,
      trending: false,
      featured: true,
      lastUpdated: '2024-12-08',
      icon: <Code className="w-6 h-6" />,
      color: 'from-green-500 to-teal-600',
      previewContent: 'Document your API endpoints with clear examples and usage patterns...'
    },
    {
      id: 'brand-identity-guide',
      title: 'Brand Identity & Guidelines',
      description: 'Create comprehensive brand guidelines including visual identity, voice, and usage standards',
      category: 'Design',
      subcategory: 'Branding',
      tags: ['Branding', 'Identity', 'Guidelines', 'Visual Design'],
      difficulty: 'intermediate',
      estimatedTime: '12-18 min',
      usage: 670,
      rating: 4.6,
      reviews: 67,
      author: 'Design Studio',
      premium: true,
      trending: false,
      featured: false,
      lastUpdated: '2024-12-05',
      icon: <Palette className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-600',
      previewContent: 'Define your brand personality and create consistent visual guidelines...'
    },
    {
      id: 'curriculum-design-template',
      title: 'Educational Curriculum Designer',
      description: 'Design comprehensive educational curricula with learning objectives and assessment strategies',
      category: 'Education',
      subcategory: 'Curriculum',
      tags: ['Education', 'Curriculum', 'Learning', 'Assessment'],
      difficulty: 'advanced',
      estimatedTime: '20-25 min',
      usage: 450,
      rating: 4.8,
      reviews: 45,
      author: 'Education Specialists',
      premium: true,
      trending: false,
      featured: false,
      lastUpdated: '2024-12-01',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
      previewContent: 'Create structured learning paths with clear objectives and outcomes...'
    },
    {
      id: 'data-analysis-report',
      title: 'Data Analysis & Insights Report',
      description: 'Generate comprehensive data analysis reports with visualizations and actionable insights',
      category: 'Analytics',
      subcategory: 'Reporting',
      tags: ['Data Analysis', 'Reporting', 'Insights', 'Visualization'],
      difficulty: 'advanced',
      estimatedTime: '15-20 min',
      usage: 780,
      rating: 4.7,
      reviews: 78,
      author: 'Data Science Team',
      premium: false,
      trending: true,
      featured: true,
      lastUpdated: '2024-12-12',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-600',
      previewContent: 'Transform raw data into actionable business insights...'
    }
  ];

  const categories = ['all', 'Business', 'Marketing', 'Development', 'Design', 'Education', 'Analytics'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.usage - a.usage;
        case 'newest': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'rating': return b.rating - a.rating;
        case 'alphabetical': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  const featuredTemplates = templates.filter(t => t.featured);
  const trendingTemplates = templates.filter(t => t.trending);

  // Handle favorites
  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Handle template usage
  const useTemplate = (template: Template) => {
    navigate(`/create?template=${template.id}`);
  };

  // Handle template preview
  const previewTemplate = (template: Template) => {
    navigate(`/template/${template.id}`);
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
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
                Template Library
              </h1>
              <p className="text-gray-600">
                Discover professional prompt templates crafted by experts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button size="sm" asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Link to="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{featuredTemplates.length}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{trendingTemplates.length}</div>
              <div className="text-sm text-gray-600">Trending</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>
                      {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
                <div className="flex rounded-md border border-gray-300">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-md ${
                      viewMode === 'grid' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-md border-l ${
                      viewMode === 'list' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Templates */}
        {!searchTerm && selectedCategory === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Featured Templates
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isFavorite={favorites.includes(template.id)}
                  onToggleFavorite={toggleFavorite}
                  onUse={useTemplate}
                  onPreview={previewTemplate}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {searchTerm || selectedCategory !== 'all' ? 'Search Results' : 'All Templates'}
            </h2>
            <p className="text-sm text-gray-600">
              Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Templates Grid/List */}
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isFavorite={favorites.includes(template.id)}
              onToggleFavorite={toggleFavorite}
              onUse={useTemplate}
              onPreview={previewTemplate}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }} variant="outline">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ 
  template, 
  isFavorite, 
  onToggleFavorite, 
  onUse, 
  onPreview, 
  viewMode 
}: {
  template: Template;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onUse: (template: Template) => void;
  onPreview: (template: Template) => void;
  viewMode: 'grid' | 'list';
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-white flex-shrink-0`}>
              {template.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{template.title}</h3>
                    {template.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                    {template.trending && <Flame className="w-4 h-4 text-red-500" />}
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      {template.rating} ({template.reviews})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {template.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {template.usage}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onToggleFavorite(template.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                  </button>
                  <Button size="sm" variant="outline" onClick={() => onPreview(template)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" onClick={() => onUse(template)}>
                    <Play className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
            {template.icon}
          </div>
          <div className="flex items-center gap-1">
            {template.premium && <Crown className="w-4 h-4 text-yellow-500" />}
            {template.trending && <Flame className="w-4 h-4 text-red-500" />}
            <button
              onClick={() => onToggleFavorite(template.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
            </button>
          </div>
        </div>
        
        <CardTitle className="text-lg font-bold mb-2">{template.title}</CardTitle>
        <CardDescription className="text-gray-600 line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{template.rating}</span>
              <span className="text-gray-500">({template.reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{template.estimatedTime}</span>
            </div>
          </div>

          {/* Category and Difficulty */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
            <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
              {template.difficulty}
            </Badge>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => onPreview(template)} className="flex-1">
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            <Button size="sm" onClick={() => onUse(template)} className="flex-1">
              <Play className="w-4 h-4 mr-1" />
              Use
            </Button>
          </div>

          {/* Usage count */}
          <div className="text-xs text-gray-500 text-center">
            Used by {template.usage.toLocaleString()} people
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Templates;