// src/components/HelpSupport.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, Search, Book, MessageCircle, Video, FileText,
  ChevronRight, ExternalLink, Star, Clock, Users, CheckCircle,
  Lightbulb, Rocket, Target, Zap, Brain, Code, Palette,
  BarChart3, Settings, Crown, Coffee, Heart, ThumbsUp,
  Send, Mail, Phone, Globe, ArrowRight, Play, Download,
  Bookmark, Flag, Eye, Share2, Plus, Minus, RotateCcw
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  views: number;
  helpful: number;
  lastUpdated: string;
  tags: string[];
  relatedArticles: string[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  tags: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: number;
  videoUrl?: string;
  thumbnail: string;
  category: string;
  views: number;
  rating: number;
}

export default function HelpSupport() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Mock data
  const categories = [
    { id: 'all', name: 'All Topics', icon: <Book className="w-4 h-4" />, count: 45 },
    { id: 'getting-started', name: 'Getting Started', icon: <Rocket className="w-4 h-4" />, count: 12 },
    { id: 'prompt-building', name: 'Prompt Building', icon: <Brain className="w-4 h-4" />, count: 18 },
    { id: 'templates', name: 'Templates', icon: <FileText className="w-4 h-4" />, count: 8 },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, count: 6 },
    { id: 'account', name: 'Account & Billing', icon: <Settings className="w-4 h-4" />, count: 7 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: <HelpCircle className="w-4 h-4" />, count: 9 }
  ];

  const helpArticles: HelpArticle[] = [
    {
      id: 'getting-started-guide',
      title: 'Getting Started with SmartPromptIQ',
      description: 'Complete guide to setting up your account and creating your first prompt',
      category: 'getting-started',
      content: 'Learn how to make the most of SmartPromptIQ from day one...',
      readTime: '5 min read',
      difficulty: 'Beginner',
      views: 15420,
      helpful: 342,
      lastUpdated: '2024-01-15',
      tags: ['setup', 'onboarding', 'basics'],
      relatedArticles: ['prompt-builder-basics', 'template-library-guide']
    },
    {
      id: 'prompt-builder-basics',
      title: 'Mastering the AI Prompt Builder',
      description: 'Learn advanced techniques for creating high-converting prompts',
      category: 'prompt-building',
      content: 'The Prompt Builder is your main tool for creating professional prompts...',
      readTime: '8 min read',
      difficulty: 'Intermediate',
      views: 12890,
      helpful: 289,
      lastUpdated: '2024-01-12',
      tags: ['prompt-builder', 'ai', 'advanced'],
      relatedArticles: ['template-customization', 'analytics-insights']
    },
    {
      id: 'template-library-guide',
      title: 'Navigating the Template Library',
      description: 'Find and customize the perfect templates for your needs',
      category: 'templates',
      content: 'Our template library contains 200+ professionally crafted templates...',
      readTime: '6 min read',
      difficulty: 'Beginner',
      views: 9876,
      helpful: 203,
      lastUpdated: '2024-01-10',
      tags: ['templates', 'customization', 'categories'],
      relatedArticles: ['getting-started-guide', 'prompt-optimization']
    },
    {
      id: 'analytics-insights',
      title: 'Understanding Your Analytics Dashboard',
      description: 'Make data-driven decisions with comprehensive prompt analytics',
      category: 'analytics',
      content: 'Your analytics dashboard provides valuable insights...',
      readTime: '7 min read',
      difficulty: 'Intermediate',
      views: 7654,
      helpful: 178,
      lastUpdated: '2024-01-08',
      tags: ['analytics', 'performance', 'optimization'],
      relatedArticles: ['prompt-builder-basics', 'success-metrics']
    }
  ];

  const faqs: FAQ[] = [
    {
      id: 'what-is-smartpromptiq',
      question: 'What is SmartPromptIQ and how does it work?',
      answer: 'SmartPromptIQ is an AI-powered platform that helps you create professional, high-converting prompts for any AI model. Our intelligent system guides you through building effective prompts using templates, questionnaires, and real-time optimization suggestions.',
      category: 'getting-started',
      helpful: 156,
      tags: ['basics', 'overview']
    },
    {
      id: 'free-vs-pro',
      question: 'What\'s the difference between Free and Pro plans?',
      answer: 'Free plan includes 50 prompts per month and basic templates. Pro plan offers unlimited prompts, premium templates, advanced analytics, priority support, and access to beta features. Perfect for professionals and teams.',
      category: 'account',
      helpful: 134,
      tags: ['pricing', 'features', 'plans']
    },
    {
      id: 'prompt-quality',
      question: 'How can I improve my prompt success rate?',
      answer: 'Focus on being specific, provide clear context, include examples, and use our AI suggestions. Our analytics show that prompts with examples have 23% higher success rates. Also try our questionnaire feature for guided creation.',
      category: 'prompt-building',
      helpful: 189,
      tags: ['optimization', 'success', 'tips']
    },
    {
      id: 'template-customization',
      question: 'Can I customize existing templates?',
      answer: 'Absolutely! All templates are fully customizable. You can modify any section, add your own variables, change the structure, and save your customized version for future use.',
      category: 'templates',
      helpful: 98,
      tags: ['customization', 'templates', 'editing']
    },
    {
      id: 'data-security',
      question: 'How secure is my data on SmartPromptIQ?',
      answer: 'We take security seriously. All data is encrypted in transit and at rest, we\'re SOC 2 compliant, and we never share your prompts or data with third parties. You own your content completely.',
      category: 'account',
      helpful: 167,
      tags: ['security', 'privacy', 'data']
    }
  ];

  const tutorials: Tutorial[] = [
    {
      id: 'quick-start-video',
      title: 'SmartPromptIQ Quick Start',
      description: 'Get up and running in under 5 minutes',
      duration: '4:32',
      difficulty: 'Beginner',
      steps: 5,
      thumbnail: '🚀',
      category: 'getting-started',
      views: 8943,
      rating: 4.8
    },
    {
      id: 'prompt-builder-masterclass',
      title: 'Prompt Builder Masterclass',
      description: 'Advanced techniques for professional prompt creation',
      duration: '12:15',
      difficulty: 'Advanced',
      steps: 8,
      thumbnail: '🧠',
      category: 'prompt-building',
      views: 5621,
      rating: 4.9
    },
    {
      id: 'template-customization',
      title: 'Customizing Templates Like a Pro',
      description: 'Learn to modify and create your own templates',
      duration: '8:45',
      difficulty: 'Intermediate',
      steps: 6,
      thumbnail: '📝',
      category: 'templates',
      views: 4387,
      rating: 4.7
    },
    {
      id: 'analytics-deep-dive',
      title: 'Analytics Deep Dive',
      description: 'Understanding and optimizing your prompt performance',
      duration: '10:20',
      difficulty: 'Intermediate',
      steps: 7,
      thumbnail: '📊',
      category: 'analytics',
      views: 3210,
      rating: 4.6
    }
  ];

  const quickActions = [
    {
      title: 'Start Creating',
      description: 'Jump into the Prompt Builder',
      icon: <Brain className="w-5 h-5" />,
      action: () => navigate('/create'),
      color: 'bg-indigo-600'
    },
    {
      title: 'Browse Templates',
      description: 'Explore our template library',
      icon: <FileText className="w-5 h-5" />,
      action: () => navigate('/templates'),
      color: 'bg-blue-600'
    },
    {
      title: 'Take Quiz',
      description: 'Find your perfect category',
      icon: <Target className="w-5 h-5" />,
      action: () => navigate('/categories?quiz=true'),
      color: 'bg-purple-600'
    },
    {
      title: 'Contact Support',
      description: 'Get personalized help',
      icon: <MessageCircle className="w-5 h-5" />,
      action: () => setActiveTab('contact'),
      color: 'bg-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help & Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers, learn new techniques, and get the most out of SmartPromptIQ
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search help articles, FAQs, and tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-center space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: Book },
                { id: 'articles', name: 'Help Articles', icon: FileText },
                { id: 'faqs', name: 'FAQs', icon: HelpCircle },
                { id: 'tutorials', name: 'Video Tutorials', icon: Video },
                { id: 'contact', name: 'Contact Support', icon: MessageCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={action.action}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <div className="text-white">
                          {action.icon}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Help Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {helpArticles.slice(0, 4).map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`text-xs ${
                          article.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          article.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {article.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          {article.views.toLocaleString()}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {article.helpful}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Tutorial */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Tutorial</h2>
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <Badge className="bg-indigo-100 text-indigo-800 mb-4">
                        <Play className="w-3 h-3 mr-1" />
                        Video Tutorial
                      </Badge>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Complete SmartPromptIQ Masterclass
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Learn everything from basic prompt creation to advanced optimization techniques. 
                        Perfect for users who want to master the platform quickly.
                      </p>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          45 minutes
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          4.9 rating
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          12k+ views
                        </div>
                      </div>
                      <Button size="lg">
                        <Play className="w-5 h-5 mr-2" />
                        Watch Now
                      </Button>
                    </div>
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <div className="text-6xl">🎓</div>
                      </div>
                      <p className="text-sm text-gray-600">Complete video course</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Help Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                  <Badge variant="outline" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`text-xs ${
                        article.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        article.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {article.difficulty}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views.toLocaleString()}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {faq.helpful} helpful
                        </Badge>
                        {expandedFAQ === faq.id ? 
                          <Minus className="w-5 h-5 text-gray-400" /> : 
                          <Plus className="w-5 h-5 text-gray-400" />
                        }
                      </div>
                    </div>
                  </CardHeader>
                  {expandedFAQ === faq.id && (
                    <CardContent className="pt-0">
                      <p className="text-gray-700 mb-4">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Was this helpful?</span>
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Flag className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tutorials Tab */}
        {activeTab === 'tutorials' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials.map((tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">{tutorial.thumbnail}</span>
                      </div>
                      <Badge className={`text-xs ${
                        tutorial.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        tutorial.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tutorial.difficulty}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 text-center">{tutorial.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 text-center">{tutorial.description}</p>
                    
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {tutorial.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {tutorial.rating}
                      </div>
                    </div>

                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Get personalized help from our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>General Question</option>
                      <option>Technical Issue</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe your question or issue..."
                    />
                  </div>

                  <Button className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Options */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Other ways to reach us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Email Support</div>
                        <div className="text-sm text-gray-600">support@smartpromptiq.com</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Live Chat</div>
                        <div className="text-sm text-gray-600">Available 24/7 for Pro users</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Community Forum</div>
                        <div className="text-sm text-gray-600">Get help from other users</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                  <CardContent className="p-6 text-center">
                    <Crown className="w-8 h-8 mx-auto text-indigo-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Get faster response times and dedicated support with our Pro plan
                    </p>
                    <Button variant="outline" size="sm">
                      Upgrade to Pro
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}