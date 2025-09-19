import React, { useState } from 'react';
import { Link } from 'wouter';
import BackButton from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Rocket, 
  Users, 
  DollarSign, 
  Settings, 
  BarChart3,
  Brain,
  MessageSquare,
  Target,
  Shield,
  Zap,
  Lightbulb,
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Sparkles,
  Heart,
  Trophy,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Share2,
  Globe,
  Mail,
  Phone,
  HelpCircle,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react';

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const navigationItems = [
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'features', label: 'Core Features', icon: Sparkles },
    { id: 'categories', label: 'AI Categories', icon: Brain },
    { id: 'pricing', label: 'Pricing & Plans', icon: DollarSign },
    { id: 'api', label: 'API Reference', icon: FileText },
    { id: 'tutorials', label: 'Tutorials', icon: PlayCircle },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'support', label: 'Support', icon: MessageSquare }
  ];

  const features = [
    {
      title: 'AI-Powered Prompt Generation',
      description: 'Advanced AI creates professional prompts tailored to your specific needs and industry.',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      capabilities: ['Industry-specific prompts', 'Context-aware generation', 'Multi-language support', 'Custom tone adjustment']
    },
    {
      title: 'Smart Categories System',
      description: 'Organized categories covering business, education, marketing, and personal development.',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      capabilities: ['15+ specialized categories', 'Custom category requests', 'Intelligent categorization', 'Category-specific questionnaires']
    },
    {
      title: 'Interactive Questionnaires',
      description: 'Guided questionnaires that understand your goals and generate perfect prompts.',
      icon: MessageSquare,
      color: 'from-green-500 to-teal-500',
      capabilities: ['Dynamic question flow', 'Context-aware questions', 'Save & resume sessions', 'Export responses']
    },
    {
      title: 'Team Collaboration',
      description: 'Work together with your team on projects with shared templates and analytics.',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      capabilities: ['Shared workspaces', 'Role-based permissions', 'Team analytics', 'Collaboration tools']
    },
    {
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your AI usage, performance, and cost optimization.',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      capabilities: ['Usage tracking', 'Performance metrics', 'Cost analysis', 'Export reports']
    },
    {
      title: 'Template Management',
      description: 'Create, save, and manage your favorite prompts and templates for future use.',
      icon: FileText,
      color: 'from-pink-500 to-rose-500',
      capabilities: ['Personal templates', 'Public template library', 'Version control', 'Smart tagging']
    }
  ];

  const categories = [
    { name: 'Marketing & Sales', icon: TrendingUp, prompts: '50+ prompts', color: 'bg-blue-500' },
    { name: 'Product Development', icon: Lightbulb, prompts: '40+ prompts', color: 'bg-green-500' },
    { name: 'Financial Planning', icon: DollarSign, prompts: '35+ prompts', color: 'bg-yellow-500' },
    { name: 'Education & Training', icon: BookOpen, prompts: '45+ prompts', color: 'bg-purple-500' },
    { name: 'Personal Development', icon: Heart, prompts: '30+ prompts', color: 'bg-pink-500' },
    { name: 'Business Strategy', icon: Target, prompts: '42+ prompts', color: 'bg-indigo-500' },
    { name: 'Content Creation', icon: FileText, prompts: '55+ prompts', color: 'bg-cyan-500' },
    { name: 'Team Management', icon: Users, prompts: '38+ prompts', color: 'bg-orange-500' }
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['5 AI prompts per month', 'Basic categories', 'Standard templates', 'Community support'],
      color: 'border-gray-200',
      popular: false
    },
    {
      name: 'Starter',
      price: '$14.99',
      period: '/month',
      features: ['200 AI prompts per month', 'All categories', 'Email support', 'Templates', 'Basic analytics'],
      color: 'border-blue-500',
      popular: true
    },
    {
      name: 'Pro',
      price: '$49.99',
      period: '/month',
      features: ['1000 AI prompts per month', 'Advanced customization', 'Priority support', 'Analytics dashboard', 'Export functionality'],
      color: 'border-purple-500',
      popular: false
    },
    {
      name: 'Enterprise',
      price: '$149.99',
      period: '/month',
      features: ['Unlimited AI prompts', 'Custom categories', 'Team collaboration', 'API access', 'White-label options', 'Dedicated support', 'Custom integrations'],
      color: 'border-gold-500',
      popular: false
    }
  ];

  const faqs = [
    {
      id: 'what-is-smartpromptiq',
      question: 'What is SmartPromptIQ Pro?',
      answer: 'SmartPromptIQ Pro is an advanced AI-powered platform that generates professional, industry-specific prompts for businesses, educators, and individuals. Our intelligent system uses questionnaires to understand your needs and creates tailored prompts that deliver exceptional results.'
    },
    {
      id: 'how-does-ai-work',
      question: 'How does the AI prompt generation work?',
      answer: 'Our AI analyzes your responses to dynamic questionnaires, considers your industry context, and generates prompts optimized for your specific use case. The system learns from millions of successful prompts to ensure high-quality, relevant results every time.'
    },
    {
      id: 'pricing-model',
      question: 'How does the pricing work?',
      answer: 'We offer flexible pricing with both subscription plans and pay-per-use options. Subscriptions include monthly prompt allowances with rollover unused prompts. You can also purchase additional token packages as needed. All plans include core features with advanced capabilities in higher tiers.'
    },
    {
      id: 'team-collaboration',
      question: 'Can I collaborate with my team?',
      answer: 'Yes! Our team features allow you to create shared workspaces, collaborate on projects, share templates, and access team analytics. You can invite team members with different permission levels and track usage across your organization.'
    },
    {
      id: 'custom-categories',
      question: 'Can I request custom categories?',
      answer: 'Absolutely! We offer custom category development for specific industries or use cases. Simply submit a request through our platform, and our team will work with you to create specialized prompts and questionnaires tailored to your needs within 24-48 hours.'
    },
    {
      id: 'data-security',
      question: 'Is my data secure?',
      answer: 'Security is our top priority. We use enterprise-grade encryption, secure data storage, and follow strict privacy protocols. Your prompts, templates, and business information are never shared with third parties and are stored securely in compliance with GDPR and other privacy regulations.'
    },
    {
      id: 'api-access',
      question: 'Do you offer API access?',
      answer: 'Yes, Pro and Business plans include API access. Our RESTful API allows you to integrate SmartPromptIQ into your existing workflows, applications, and systems. Comprehensive documentation and SDKs are available for easy implementation.'
    },
    {
      id: 'support-options',
      question: 'What support options are available?',
      answer: 'We offer multiple support channels: community forums for Free users, email support for Starter plans, priority email support for Pro users, and 24/7 dedicated support for Business customers. We also provide comprehensive documentation, video tutorials, and live chat assistance.'
    },
    {
      id: 'token-system',
      question: 'How does the token system work?',
      answer: 'Our token system is based on prompt complexity: Simple prompts (1 token), Standard prompts (3 tokens), Complex prompts (7 tokens), and Custom prompts (15 tokens). Unused tokens from subscriptions roll over monthly, and you can purchase additional token packages anytime.'
    },
    {
      id: 'getting-started',
      question: 'How do I get started?',
      answer: 'Getting started is easy! Sign up for a free account to get 5 free prompts, explore our categories, try our questionnaires, and see the AI in action. No credit card required for the free tier. You can upgrade anytime as your needs grow.'
    }
  ];

  const tutorials = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running with SmartPromptIQ Pro in under 5 minutes',
      duration: '5 min',
      level: 'Beginner',
      steps: ['Create account', 'Choose category', 'Complete questionnaire', 'Generate your first prompt']
    },
    {
      title: 'Mastering Questionnaires',
      description: 'Learn how to get the best results from our AI questionnaires',
      duration: '10 min',
      level: 'Intermediate',
      steps: ['Understanding question types', 'Providing detailed context', 'Using advanced options', 'Saving & reusing responses']
    },
    {
      title: 'Team Collaboration Setup',
      description: 'Set up your team workspace and manage collaboration',
      duration: '15 min',
      level: 'Advanced',
      steps: ['Create team workspace', 'Invite team members', 'Set permissions', 'Track team analytics']
    },
    {
      title: 'Template Management',
      description: 'Create, organize, and share templates effectively',
      duration: '8 min',
      level: 'Intermediate',
      steps: ['Save prompts as templates', 'Organize with tags', 'Share with team', 'Use public templates']
    }
  ];

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <BackButton />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">SmartPromptIQ Pro Documentation</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Everything You Need to Know
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Complete documentation, tutorials, and guides to help you master AI-powered prompt generation 
              and unlock your creative potential with SmartPromptIQ Pro.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-white/90"
                onClick={() => setActiveSection('getting-started')}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setActiveSection('tutorials')}
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Tutorials
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Documentation</CardTitle>
                  <CardDescription>Navigate through our guides</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 transition-colors ${
                            activeSection === item.id ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600' : 'text-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Getting Started Section */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Getting Started with SmartPromptIQ Pro</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Welcome to SmartPromptIQ Pro! This guide will help you get up and running quickly with our AI-powered prompt generation platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'Create Account', icon: Users, description: 'Sign up for free and get 5 free prompts to start exploring' },
                    { title: 'Choose Category', icon: Target, description: 'Select from 15+ specialized categories or request a custom one' },
                    { title: 'Complete Questionnaire', icon: MessageSquare, description: 'Answer intelligent questions that understand your needs' },
                    { title: 'Generate Prompts', icon: Sparkles, description: 'Get professional, tailored prompts instantly generated by AI' },
                    { title: 'Save Templates', icon: FileText, description: 'Save your best prompts as reusable templates' },
                    { title: 'Track Analytics', icon: BarChart3, description: 'Monitor usage, performance, and optimize your results' }
                  ].map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <Card key={index} className="border-2 hover:border-indigo-200 transition-colors">
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Step {index + 1}: {step.title}</h3>
                          <p className="text-slate-600 text-sm mb-4">{step.description}</p>

                          {/* Signup Options */}
                          <div className="space-y-2 mt-4">
                            <Link href="/signin" className="block">
                              <Button variant="outline" className="w-full border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium py-2 text-sm">
                                <Sparkles className="w-4 h-4 mr-1" />
                                Get Started
                              </Button>
                            </Link>
                            <div className="flex space-x-2">
                              <Link href="/register" className="flex-1">
                                <Button variant="outline" className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 font-medium py-1.5 text-xs">
                                  Create Account
                                </Button>
                              </Link>
                              <Link href="/demo" className="flex-1">
                                <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium py-1.5 text-xs">
                                  Try Demo
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900 mb-2">Pro Tip: Start with Simple Prompts</h3>
                        <p className="text-green-800">
                          New to AI prompting? Begin with our simple prompt categories like "Email Writing" or "Social Media Posts" 
                          to get familiar with the platform before moving to complex business strategies.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Features</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Explore the powerful features that make SmartPromptIQ Pro the leading AI prompt generation platform.
                  </p>
                </div>

                <div className="space-y-8">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card key={index} className="overflow-hidden shadow-lg">
                        <div className="p-8">
                          <div className="flex items-start gap-6">
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                              <p className="text-slate-600 text-lg mb-6">{feature.description}</p>
                              <div className="grid grid-cols-2 gap-3">
                                {feature.capabilities.map((capability, capIndex) => (
                                  <div key={capIndex} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-slate-700">{capability}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categories Section */}
            {activeSection === 'categories' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">AI Categories</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Our specialized AI categories are designed for specific industries and use cases, each with tailored prompts and questionnaires.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((category, index) => {
                    const Icon = category.icon;
                    return (
                      <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-slate-900 mb-2">{category.name}</h3>
                          <p className="text-sm text-slate-600 mb-3">{category.prompts}</p>
                          <Badge variant="secondary" className="text-xs">Professional Grade</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Need a Custom Category?</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      Can't find the perfect category for your industry? Our team can create custom AI categories 
                      tailored specifically to your business needs and use cases.
                    </p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Request Custom Category
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pricing Section */}
            {activeSection === 'pricing' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Pricing & Plans</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Choose the perfect plan for your needs. All plans include our core AI features with additional capabilities in higher tiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {pricingTiers.map((tier, index) => (
                    <Card key={index} className={`relative ${tier.color} ${tier.popular ? 'ring-2 ring-blue-500' : ''}`}>
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-blue-500 text-white px-3 py-1">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl font-bold">{tier.price}</span>
                          <span className="text-slate-500 ml-1">{tier.period}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {tier.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-6" variant={tier.popular ? "default" : "outline"}>
                          {tier.name === 'Free' ? 'Get Started' : 'Choose Plan'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Token System
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Simple prompts</span>
                          <Badge variant="secondary">1 token</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Standard prompts</span>
                          <Badge variant="secondary">3 tokens</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Complex prompts</span>
                          <Badge variant="secondary">7 tokens</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Custom prompts</span>
                          <Badge variant="secondary">15 tokens</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Enterprise Solutions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        Need higher volumes or custom integrations? Our enterprise solutions offer:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Unlimited prompts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">White-label solutions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Custom integrations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Dedicated support</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* API Reference Section */}
            {activeSection === 'api' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">API Reference</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Integrate SmartPromptIQ Pro into your applications with our comprehensive REST API.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                        <CardDescription>Secure API access using JWT tokens</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                          <div className="text-green-400">// Authentication header</div>
                          <div className="text-white">Authorization: Bearer YOUR_JWT_TOKEN</div>
                          <br />
                          <div className="text-green-400">// Login endpoint</div>
                          <div className="text-blue-400">POST</div> <span className="text-white">/api/auth/login</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Generate Prompts</CardTitle>
                        <CardDescription>Create AI-powered prompts programmatically</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-100 overflow-x-auto">
                          <div className="text-green-400">// Generate prompt</div>
                          <div className="text-blue-400">POST</div> <span className="text-white">/api/prompts/generate</span>
                          <br />
                          <div className="text-yellow-400">&#123;</div>
                          <div className="ml-4 text-white">"category": "marketing",</div>
                          <div className="ml-4 text-white">"answers": &#123;...&#125;,</div>
                          <div className="ml-4 text-white">"complexity": "standard"</div>
                          <div className="text-yellow-400">&#125;</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Templates</CardTitle>
                        <CardDescription>Manage your prompt templates via API</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                            <Badge className="bg-blue-500">GET</Badge>
                            <code className="text-sm">/api/templates</code>
                            <span className="text-sm text-slate-600">List templates</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                            <Badge className="bg-green-500">POST</Badge>
                            <code className="text-sm">/api/templates</code>
                            <span className="text-sm text-slate-600">Create template</span>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                            <Badge className="bg-yellow-600">PUT</Badge>
                            <code className="text-sm">/api/templates/:id</code>
                            <span className="text-sm text-slate-600">Update template</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Rate Limits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Starter Plan</span>
                          <Badge variant="outline">100/hour</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pro Plan</span>
                          <Badge variant="outline">500/hour</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Business Plan</span>
                          <Badge variant="outline">2000/hour</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>SDKs Available</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {['JavaScript/Node.js', 'Python', 'PHP', 'Ruby', 'Go'].map((sdk) => (
                          <div key={sdk} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{sdk}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-900 font-medium mb-1">API Documentation</p>
                            <p className="text-sm text-blue-800">
                              Full API documentation with examples and SDKs available in your dashboard.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Tutorials Section */}
            {activeSection === 'tutorials' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Video Tutorials</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Step-by-step video guides to help you master SmartPromptIQ Pro and get the most out of our AI platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tutorials.map((tutorial, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                        <PlayCircle className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/20 text-white">{tutorial.duration}</Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary">{tutorial.level}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{tutorial.title}</h3>
                        <p className="text-slate-600 mb-4">{tutorial.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-700">What you'll learn:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {tutorial.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-slate-600">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Need Personalized Training?</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      Our team offers personalized onboarding sessions and custom training for teams and enterprise customers.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button>
                        <Mail className="w-4 h-4 mr-2" />
                        Schedule Training
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Live Chat Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* FAQ Section */}
            {activeSection === 'faq' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Find answers to the most common questions about SmartPromptIQ Pro, pricing, features, and more.
                  </p>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <Card key={faq.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full p-6 text-left hover:bg-slate-50 transition-colors flex items-center justify-between"
                        >
                          <h3 className="text-lg font-semibold text-slate-900 pr-4">{faq.question}</h3>
                          {expandedFaq === faq.id ? (
                            <Minus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          ) : (
                            <Plus className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaq === faq.id && (
                          <div className="px-6 pb-6">
                            <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Still Have Questions?</h3>
                    <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                      Can't find what you're looking for? Our support team is here to help you succeed with SmartPromptIQ Pro.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                      <Button variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Us
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Support Section */}
            {activeSection === 'support' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Support & Help</h2>
                  <p className="text-slate-600 text-lg mb-8">
                    Get the help you need with multiple support channels and resources available 24/7.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Live Chat Support',
                      description: 'Instant help for Pro and Business customers',
                      icon: MessageSquare,
                      color: 'from-green-500 to-emerald-500',
                      availability: '24/7 for Business',
                      action: 'Start Chat'
                    },
                    {
                      title: 'Email Support',
                      description: 'Detailed help for all users',
                      icon: Mail,
                      color: 'from-blue-500 to-cyan-500',
                      availability: '24-48 hour response',
                      action: 'Send Email'
                    },
                    {
                      title: 'Phone Support',
                      description: 'Direct phone support for Business customers',
                      icon: Phone,
                      color: 'from-purple-500 to-indigo-500',
                      availability: 'Business hours',
                      action: 'Schedule Call'
                    },
                    {
                      title: 'Community Forum',
                      description: 'Connect with other users and get tips',
                      icon: Users,
                      color: 'from-orange-500 to-red-500',
                      availability: 'Always open',
                      action: 'Join Forum'
                    },
                    {
                      title: 'Knowledge Base',
                      description: 'Comprehensive guides and tutorials',
                      icon: BookOpen,
                      color: 'from-teal-500 to-cyan-500',
                      availability: 'Always available',
                      action: 'Browse Articles'
                    },
                    {
                      title: 'Video Tutorials',
                      description: 'Step-by-step visual guides',
                      icon: PlayCircle,
                      color: 'from-pink-500 to-rose-500',
                      availability: 'On-demand',
                      action: 'Watch Videos'
                    }
                  ].map((support, index) => {
                    const Icon = support.icon;
                    return (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-center">
                          <div className={`w-16 h-16 bg-gradient-to-br ${support.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">{support.title}</h3>
                          <p className="text-slate-600 text-sm mb-3">{support.description}</p>
                          <Badge variant="secondary" className="text-xs mb-4">{support.availability}</Badge>
                          <Button variant="outline" size="sm" className="w-full">
                            {support.action}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Support Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Email Support</span>
                        <Badge>24/7</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Live Chat (Pro)</span>
                        <Badge variant="secondary">9 AM - 6 PM EST</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Live Chat (Business)</span>
                        <Badge>24/7</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Phone Support</span>
                        <Badge variant="secondary">9 AM - 6 PM EST</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Priority Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        Get faster response times and priority handling with our Pro and Business plans.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Dedicated support channel</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Faster response times</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Screen sharing support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Account manager (Business)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Enterprise Support</h3>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                      Large organization? Our enterprise support includes dedicated account management, 
                      custom training, and priority development for your specific needs.
                    </p>
                    <Button className="bg-white text-slate-900 hover:bg-slate-100">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SmartPromptIQ Pro</h3>
              <p className="text-slate-400 text-sm mb-4">
                AI-powered prompt generation for professionals, teams, and enterprises.
              </p>
              <div className="flex gap-4">
                <Button size="sm" variant="ghost" className="text-white hover:text-slate-300">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:text-slate-300">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:text-slate-300">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Tutorials</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 SmartPromptIQ Pro. All rights reserved. Empowering creativity with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}