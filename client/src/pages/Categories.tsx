import React, { useState } from 'react';
import { Link } from 'wouter';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RequestCustomCategory from '@/components/RequestCustomCategory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Zap, 
  DollarSign, 
  GraduationCap, 
  Heart, 
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Star,
  Sparkles,
  Target,
  Brain,
  Lightbulb,
  Rocket,
  Shield,
  Award,
  Search,
  Filter
} from 'lucide-react';

const categories = [
  {
    id: 'marketing',
    title: 'Marketing & Growth',
    description: 'Create compelling campaigns, brand strategies, and content that converts',
    icon: Briefcase,
    gradient: 'from-blue-500 to-cyan-500',
    bgPattern: 'from-blue-50 to-cyan-50',
    questions: 12,
    duration: '5-8 min',
    difficulty: 'Intermediate',
    popularity: 'Most Popular',
    tags: ['Brand Strategy', 'Social Media', 'Content Marketing', 'SEO'],
    examples: ['Brand positioning strategy', 'Social media campaign', 'Email marketing sequence'],
    completionRate: '94%',
    avgRating: 4.8,
    totalUsers: 15420
  },
  {
    id: 'product-development',
    title: 'Product Development',
    description: 'Design innovative products, create roadmaps, and build features that users love',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    bgPattern: 'from-purple-50 to-pink-50',
    questions: 10,
    duration: '4-6 min',
    difficulty: 'Advanced',
    popularity: 'Trending',
    tags: ['Product Strategy', 'UX/UI', 'MVP Planning', 'User Research'],
    examples: ['Product launch strategy', 'Feature development plan', 'User persona creation'],
    completionRate: '89%',
    avgRating: 4.7,
    totalUsers: 8950
  },
  {
    id: 'financial-planning',
    title: 'Financial Planning',
    description: 'Plan budgets, investment strategies, and financial goals with AI-powered insights',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-500',
    bgPattern: 'from-green-50 to-emerald-50',
    questions: 14,
    duration: '6-9 min',
    difficulty: 'Intermediate',
    popularity: 'Hot',
    tags: ['Budgeting', 'Investment', 'Risk Management', 'Goals'],
    examples: ['Investment portfolio plan', 'Budget optimization', 'Retirement planning'],
    completionRate: '91%',
    avgRating: 4.9,
    totalUsers: 12300
  },
  {
    id: 'education',
    title: 'Education & Training',
    description: 'Create engaging curricula, learning modules, and educational experiences',
    icon: GraduationCap,
    gradient: 'from-yellow-500 to-orange-500',
    bgPattern: 'from-yellow-50 to-orange-50',
    questions: 11,
    duration: '5-7 min',
    difficulty: 'Beginner',
    popularity: 'Rising',
    tags: ['Curriculum Design', 'E-Learning', 'Assessment', 'Skills'],
    examples: ['Course curriculum plan', 'Training program design', 'Learning assessment'],
    completionRate: '96%',
    avgRating: 4.6,
    totalUsers: 9780
  },
  {
    id: 'personal-development',
    title: 'Personal Development',
    description: 'Build habits, achieve goals, and unlock your potential with personalized guidance',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-500',
    bgPattern: 'from-pink-50 to-rose-50',
    questions: 9,
    duration: '4-5 min',
    difficulty: 'Beginner',
    popularity: 'New',
    tags: ['Goal Setting', 'Habits', 'Mindset', 'Productivity'],
    examples: ['Personal growth plan', 'Habit formation strategy', 'Goal achievement roadmap'],
    completionRate: '92%',
    avgRating: 4.5,
    totalUsers: 6540
  },
  {
    id: 'business-strategy',
    title: 'Business Strategy',
    description: 'Develop comprehensive business plans, competitive analysis, and growth strategies',
    icon: Target,
    gradient: 'from-indigo-500 to-blue-500',
    bgPattern: 'from-indigo-50 to-blue-50',
    questions: 15,
    duration: '7-10 min',
    difficulty: 'Advanced',
    popularity: 'Professional',
    tags: ['Strategy', 'Analysis', 'Growth', 'Operations'],
    examples: ['Business model canvas', 'Market analysis', 'Growth strategy plan'],
    completionRate: '87%',
    avgRating: 4.8,
    totalUsers: 11200
  },
  // NEW WEBSITE/APP CATEGORIES
  {
    id: 'ecommerce',
    title: 'E-Commerce & Online Store',
    description: 'Build online stores, product catalogs, shopping carts, and payment systems',
    icon: Briefcase,
    gradient: 'from-amber-500 to-orange-500',
    bgPattern: 'from-amber-50 to-orange-50',
    questions: 12,
    duration: '6-8 min',
    difficulty: 'Intermediate',
    popularity: 'Hot',
    tags: ['Online Store', 'Products', 'Payments', 'Inventory'],
    examples: ['Shopify-like store', 'Product marketplace', 'Subscription box site'],
    completionRate: '90%',
    avgRating: 4.8,
    totalUsers: 18500
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Medical',
    description: 'Create patient portals, appointment booking, telemedicine, and health tracking apps',
    icon: Heart,
    gradient: 'from-red-500 to-pink-500',
    bgPattern: 'from-red-50 to-pink-50',
    questions: 14,
    duration: '7-10 min',
    difficulty: 'Advanced',
    popularity: 'Professional',
    tags: ['Patient Portal', 'Appointments', 'Telemedicine', 'Health Records'],
    examples: ['Doctor appointment app', 'Patient management system', 'Health tracker'],
    completionRate: '85%',
    avgRating: 4.7,
    totalUsers: 7800
  },
  {
    id: 'real-estate',
    title: 'Real Estate & Property',
    description: 'Build property listing sites, agent portfolios, and real estate management platforms',
    icon: Target,
    gradient: 'from-teal-500 to-cyan-500',
    bgPattern: 'from-teal-50 to-cyan-50',
    questions: 11,
    duration: '5-7 min',
    difficulty: 'Intermediate',
    popularity: 'Trending',
    tags: ['Listings', 'Property Search', 'Agent Sites', 'Rentals'],
    examples: ['Zillow-like platform', 'Property management app', 'Real estate CRM'],
    completionRate: '88%',
    avgRating: 4.6,
    totalUsers: 9200
  },
  {
    id: 'restaurant',
    title: 'Restaurant & Food Service',
    description: 'Create restaurant websites, online ordering, menu displays, and reservation systems',
    icon: Sparkles,
    gradient: 'from-orange-500 to-red-500',
    bgPattern: 'from-orange-50 to-red-50',
    questions: 10,
    duration: '4-6 min',
    difficulty: 'Beginner',
    popularity: 'Hot',
    tags: ['Menu', 'Online Ordering', 'Reservations', 'Delivery'],
    examples: ['Restaurant website', 'Food delivery app', 'Table booking system'],
    completionRate: '94%',
    avgRating: 4.9,
    totalUsers: 14300
  },
  {
    id: 'portfolio',
    title: 'Portfolio & Creative',
    description: 'Showcase your work with stunning portfolio sites for artists, designers, and creators',
    icon: Lightbulb,
    gradient: 'from-violet-500 to-purple-500',
    bgPattern: 'from-violet-50 to-purple-50',
    questions: 8,
    duration: '3-5 min',
    difficulty: 'Beginner',
    popularity: 'Rising',
    tags: ['Portfolio', 'Gallery', 'Creative', 'Showcase'],
    examples: ['Photography portfolio', 'Design showcase', 'Artist website'],
    completionRate: '97%',
    avgRating: 4.8,
    totalUsers: 12100
  },
  {
    id: 'saas',
    title: 'SaaS & Tech Startup',
    description: 'Build SaaS landing pages, dashboards, user management, and subscription systems',
    icon: Rocket,
    gradient: 'from-blue-600 to-indigo-600',
    bgPattern: 'from-blue-50 to-indigo-50',
    questions: 13,
    duration: '6-9 min',
    difficulty: 'Advanced',
    popularity: 'Most Popular',
    tags: ['Landing Page', 'Dashboard', 'Subscriptions', 'Analytics'],
    examples: ['SaaS landing page', 'Admin dashboard', 'User analytics platform'],
    completionRate: '86%',
    avgRating: 4.9,
    totalUsers: 16800
  },
  {
    id: 'nonprofit',
    title: 'Non-Profit & Charity',
    description: 'Create donation pages, volunteer management, event sites, and cause awareness platforms',
    icon: Heart,
    gradient: 'from-emerald-500 to-teal-500',
    bgPattern: 'from-emerald-50 to-teal-50',
    questions: 10,
    duration: '5-7 min',
    difficulty: 'Beginner',
    popularity: 'New',
    tags: ['Donations', 'Volunteers', 'Events', 'Campaigns'],
    examples: ['Charity website', 'Donation platform', 'Volunteer signup'],
    completionRate: '93%',
    avgRating: 4.7,
    totalUsers: 5600
  },
  {
    id: 'legal',
    title: 'Legal & Professional Services',
    description: 'Build law firm websites, consultation booking, client portals, and case management',
    icon: Shield,
    gradient: 'from-slate-600 to-gray-700',
    bgPattern: 'from-slate-50 to-gray-50',
    questions: 12,
    duration: '6-8 min',
    difficulty: 'Intermediate',
    popularity: 'Professional',
    tags: ['Law Firm', 'Consultations', 'Client Portal', 'Services'],
    examples: ['Law firm website', 'Consultation booking', 'Client management'],
    completionRate: '89%',
    avgRating: 4.6,
    totalUsers: 6900
  },
  {
    id: 'fitness',
    title: 'Fitness & Wellness',
    description: 'Create gym websites, workout trackers, class booking, and membership management',
    icon: Zap,
    gradient: 'from-lime-500 to-green-500',
    bgPattern: 'from-lime-50 to-green-50',
    questions: 11,
    duration: '5-7 min',
    difficulty: 'Intermediate',
    popularity: 'Trending',
    tags: ['Gym', 'Workouts', 'Classes', 'Memberships'],
    examples: ['Fitness app', 'Gym website', 'Personal trainer site'],
    completionRate: '91%',
    avgRating: 4.8,
    totalUsers: 11400
  },
  {
    id: 'events',
    title: 'Events & Ticketing',
    description: 'Build event pages, ticket sales, RSVPs, and event management platforms',
    icon: Users,
    gradient: 'from-fuchsia-500 to-pink-500',
    bgPattern: 'from-fuchsia-50 to-pink-50',
    questions: 10,
    duration: '5-6 min',
    difficulty: 'Intermediate',
    popularity: 'Hot',
    tags: ['Events', 'Tickets', 'RSVPs', 'Registration'],
    examples: ['Event landing page', 'Ticketing system', 'Conference website'],
    completionRate: '92%',
    avgRating: 4.7,
    totalUsers: 8700
  },
  {
    id: 'travel',
    title: 'Travel & Hospitality',
    description: 'Create travel booking sites, hotel management, tour guides, and travel blogs',
    icon: Target,
    gradient: 'from-sky-500 to-blue-500',
    bgPattern: 'from-sky-50 to-blue-50',
    questions: 12,
    duration: '6-8 min',
    difficulty: 'Intermediate',
    popularity: 'Rising',
    tags: ['Booking', 'Hotels', 'Tours', 'Travel Blog'],
    examples: ['Travel booking site', 'Hotel website', 'Tour guide platform'],
    completionRate: '88%',
    avgRating: 4.6,
    totalUsers: 7500
  },
  {
    id: 'social',
    title: 'Social & Community',
    description: 'Build social networks, forums, community platforms, and member directories',
    icon: Users,
    gradient: 'from-rose-500 to-orange-500',
    bgPattern: 'from-rose-50 to-orange-50',
    questions: 13,
    duration: '7-9 min',
    difficulty: 'Advanced',
    popularity: 'Trending',
    tags: ['Social Network', 'Forums', 'Community', 'Members'],
    examples: ['Community forum', 'Social app', 'Member directory'],
    completionRate: '84%',
    avgRating: 4.5,
    totalUsers: 9800
  },
  {
    id: 'blog',
    title: 'Blog & Content',
    description: 'Create professional blogs, news sites, content platforms, and media publications',
    icon: Lightbulb,
    gradient: 'from-cyan-500 to-teal-500',
    bgPattern: 'from-cyan-50 to-teal-50',
    questions: 9,
    duration: '4-6 min',
    difficulty: 'Beginner',
    popularity: 'Most Popular',
    tags: ['Blog', 'News', 'Content', 'Publishing'],
    examples: ['Personal blog', 'News website', 'Magazine platform'],
    completionRate: '96%',
    avgRating: 4.8,
    totalUsers: 21000
  },
  {
    id: 'ai-tools',
    title: 'AI & Automation Tools',
    description: 'Build AI-powered apps, chatbots, automation tools, and smart assistants',
    icon: Brain,
    gradient: 'from-purple-600 to-indigo-600',
    bgPattern: 'from-purple-50 to-indigo-50',
    questions: 14,
    duration: '7-10 min',
    difficulty: 'Advanced',
    popularity: 'Hot',
    tags: ['AI', 'Chatbots', 'Automation', 'Machine Learning'],
    examples: ['AI chatbot', 'Automation dashboard', 'Smart assistant'],
    completionRate: '82%',
    avgRating: 4.9,
    totalUsers: 13500
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'bg-green-100 text-green-800';
    case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
    case 'Advanced': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPopularityIcon = (popularity: string) => {
  switch (popularity) {
    case 'Most Popular': return <Star className="w-3 h-3" />;
    case 'Trending': return <TrendingUp className="w-3 h-3" />;
    case 'Hot': return <Sparkles className="w-3 h-3" />;
    case 'Rising': return <Rocket className="w-3 h-3" />;
    case 'New': return <Badge className="w-3 h-3" />;
    case 'Professional': return <Award className="w-3 h-3" />;
    default: return <Star className="w-3 h-3" />;
  }
};

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === 'All' || category.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-pink-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4">
        <BackButton />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 transform hover:scale-105 transition-transform shadow-xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent mb-6">
            Choose Your Smart AI Journey
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Select a category to unlock personalized AI-powered prompts. Our intelligent questionnaires guide you through targeted questions to create the perfect content strategy.
          </p>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto mb-12">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories, tags, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="pl-12 pr-8 py-3 border border-slate-200 rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg appearance-none cursor-pointer"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">50,000+</div>
              <div className="text-sm text-slate-600">AI Prompts Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">12,000+</div>
              <div className="text-sm text-slate-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-1">4.8★</div>
              <div className="text-sm text-slate-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCategories.map((category, index) => (
            <Card 
              key={category.id} 
              className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Pattern */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.bgPattern} opacity-30`}></div>
              
              {/* Popularity Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className={`bg-gradient-to-r ${category.gradient} text-white border-0 shadow-lg`}>
                  <div className="flex items-center gap-1">
                    {getPopularityIcon(category.popularity)}
                    <span className="text-xs font-medium">{category.popularity}</span>
                  </div>
                </Badge>
              </div>

              <CardHeader className="pb-4 relative z-10">
                {/* Icon with Gradient */}
                <div className={`w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl font-bold text-slate-900">{category.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{category.avgRating}</span>
                  </div>
                </div>
                
                <CardDescription className="text-slate-600 leading-relaxed mb-4">
                  {category.description}
                </CardDescription>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {category.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">
                      {tag}
                    </Badge>
                  ))}
                  {category.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                      +{category.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/50 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-sm font-medium text-slate-900">{category.duration}</div>
                    <div className="text-xs text-slate-600">{category.questions} questions</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-sm font-medium text-slate-900">{category.totalUsers.toLocaleString()}</div>
                    <div className="text-xs text-slate-600">users</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Shield className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-sm font-medium text-slate-900">{category.completionRate}</div>
                    <div className="text-xs text-slate-600">success</div>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between mb-6">
                  <Badge className={`${getDifficultyColor(category.difficulty)} border-0`}>
                    {category.difficulty}
                  </Badge>
                  <div className="text-sm text-slate-600">
                    Completion Rate: {category.completionRate}
                  </div>
                </div>

                {/* Examples Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    What you'll create:
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {category.examples.slice(0, 2).map((example, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link href={`/questionnaire/${category.id}`}>
                    <Button className={`w-full bg-gradient-to-r ${category.gradient} hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-0 text-white font-medium py-3`}>
                      <span className="flex items-center justify-center gap-2">
                        Start AI Journey
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>

                  <div className="flex space-x-2">
                    <Link href="/register" className="flex-1">
                      <Button variant="outline" className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 font-medium py-2.5">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Free Account
                      </Button>
                    </Link>
                    <Link href="/demo" className="flex-1">
                      <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium py-2.5">
                        Try Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No categories found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Try adjusting your search terms or filters to discover more AI-powered categories.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedDifficulty('All');
              }}
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Request Custom Category */}
        <div className="mt-16">
          <RequestCustomCategory onRequestSubmitted={() => {
            // Optional callback for when request is submitted
            console.log('Custom category request submitted');
          }} />
        </div>
      </div>
    </div>
  );
}
