// src/components/Categories.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  // Add all missing imports
  Sparkles,
  Brain, 
  Code, 
  Palette, 
  Megaphone, 
  GraduationCap, 
  Users, 
  BarChart3, 
  Lightbulb,
  MessageCircle,
  Target,
  Zap,
  FileText,
  ArrowRight,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  Play,
  BookOpen,
  Rocket,
  ChevronRight,
  Globe,
  Heart,
  Coffee,
  Award,
  Shield,
  Camera,
  Music,
  Gamepad2,
  ShoppingCart,
  Home,
  Car,
  Plane,
  Utensils,
  Dumbbell,
  Stethoscope,
  Scale,
  PiggyBank,
  Briefcase,
  Building,
  Gavel,
  Wrench,
  Shirt,
  TreePine,
  Microscope,
  Calculator,
  PenTool,
  Languages,
  HeadphonesIcon,
  Video,
  Mic,
  Monitor,
  Smartphone,
  WifiIcon as Wifi,
  DatabaseIcon as Database,
  CloudIcon as Cloud,
  LockIcon as Lock,
  KeyIcon as Key,
  SettingsIcon as Settings
} from 'lucide-react';

// Your existing Categories component code...
// (Keep all your existing component logic, just make sure all icons are imported above)

const Categories = () => {
  // Your existing state and logic here...
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Enhanced categories data with more variety
  const categories = [
    {
      id: 'business-strategy',
      title: 'Business Strategy',
      description: 'Strategic planning, market analysis, and business development prompts',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'from-blue-500 to-indigo-600',
      promptCount: 45,
      popular: true,
      tags: ['Strategy', 'Planning', 'Analysis'],
      difficulty: 'intermediate'
    },
    {
      id: 'marketing',
      title: 'Content & Marketing',
      description: 'Create compelling content, campaigns, and marketing strategies',
      icon: <Megaphone className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      promptCount: 67,
      popular: true,
      tags: ['Content', 'Marketing', 'Social Media'],
      difficulty: 'beginner'
    },
    {
      id: 'technical',
      title: 'Software Development',
      description: 'Code architecture, documentation, and technical specifications',
      icon: <Code className="w-8 h-8" />,
      color: 'from-green-500 to-teal-600',
      promptCount: 38,
      popular: true,
      tags: ['Development', 'Code', 'Technical'],
      difficulty: 'advanced'
    },
    {
      id: 'creative',
      title: 'Creative & Design',
      description: 'Design briefs, creative concepts, and brand guidelines',
      icon: <Palette className="w-8 h-8" />,
      color: 'from-pink-500 to-rose-600',
      promptCount: 29,
      popular: false,
      tags: ['Design', 'Creative', 'Branding'],
      difficulty: 'beginner'
    },
    {
      id: 'education',
      title: 'Education & Training',
      description: 'Learning materials, curriculum design, and educational content',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-600',
      promptCount: 33,
      popular: false,
      tags: ['Education', 'Learning', 'Training'],
      difficulty: 'intermediate'
    },
    {
      id: 'research',
      title: 'Data & Analytics',
      description: 'Data analysis, reporting, and business intelligence prompts',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-cyan-500 to-blue-600',
      promptCount: 24,
      popular: false,
      tags: ['Data', 'Analytics', 'Reporting'],
      difficulty: 'advanced'
    },
    {
      id: 'healthcare-medical',
      title: 'Healthcare & Medical',
      description: 'Medical documentation, patient care, and healthcare workflows',
      icon: <Stethoscope className="w-8 h-8" />,
      color: 'from-red-500 to-pink-600',
      promptCount: 18,
      popular: false,
      tags: ['Healthcare', 'Medical', 'Documentation'],
      difficulty: 'advanced'
    },
    {
      id: 'finance-legal',
      title: 'Finance & Legal',
      description: 'Financial analysis, legal documentation, and compliance',
      icon: <Scale className="w-8 h-8" />,
      color: 'from-slate-500 to-gray-600',
      promptCount: 21,
      popular: false,
      tags: ['Finance', 'Legal', 'Compliance'],
      difficulty: 'advanced'
    },
    {
      id: 'entertainment-media',
      title: 'Entertainment & Media',
      description: 'Creative writing, storytelling, and media production',
      icon: <Video className="w-8 h-8" />,
      color: 'from-violet-500 to-purple-600',
      promptCount: 31,
      popular: false,
      tags: ['Entertainment', 'Media', 'Creative'],
      difficulty: 'beginner'
    }
  ];

  const popularTags = [
    'Strategy', 'Marketing', 'Content', 'Development', 'Design', 'Analytics', 
    'Education', 'Healthcare', 'Finance', 'Creative', 'Technical', 'Planning'
  ];

  const filteredCategories = categories.filter(category => 
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDifficultyBadgeColor = (difficulty: string) => {
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our AI-guided questionnaires organized by specialty. Each category provides 
            targeted prompts designed specifically for your industry and use case.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Target className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.promptCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {categories.filter(cat => cat.popular).length}
              </div>
              <div className="text-sm text-gray-600">Popular</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Difficulty Levels</div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or browse all categories.</p>
            <Button onClick={() => setSearchTerm('')} variant="outline">
              Clear Search
            </Button>
          </div>
        )}

        {/* Quick Start Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Start Guide
            </h2>
            <p className="text-gray-600">
              New to prompt engineering? Start with these popular categories
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {categories
              .filter(cat => cat.popular)
              .map((category, index) => (
                <Link 
                  key={category.id}
                  onClick={() => window.location.href = `/questionnaire?category=${category.id}`}
                  className="group"
                >
                  <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group-hover:border-indigo-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                        {category.icon}
                      </div>
                      <span className="font-semibold text-gray-900">{category.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{category.promptCount} prompts</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Guided</h3>
            <p className="text-sm text-gray-600">
              Smart questionnaires that adapt to your specific needs and experience level
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Industry-Specific</h3>
            <p className="text-sm text-gray-600">
              Prompts tailored for your specific industry, role, and use case requirements
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ready to Use</h3>
            <p className="text-sm text-gray-600">
              Professional prompts that work immediately with any AI model or platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// CategoryCard Component - Make sure all icons are used correctly here
const CategoryCard = ({ category }: { category: any }) => {
  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link onClick={() => window.location.href = `/questionnaire?category=${category.id}`} className="group">
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <CardHeader className="text-center pb-4">
          {category.popular && (
            <div className="flex justify-center mb-3">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </div>
          )}
          
          <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {category.icon}
          </div>
          
          <CardTitle className="text-xl font-bold mb-2">{category.title}</CardTitle>
          <CardDescription className="text-gray-600 leading-relaxed">
            {category.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{category.promptCount} prompts</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${getDifficultyBadgeColor(category.difficulty)}`}>
                {category.difficulty}
              </Badge>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {category.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Categories;
