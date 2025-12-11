import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useVoiceActivation } from '@/hooks/useVoiceActivation';
import {
  Mic, MicOff, Sparkles, Zap, BookOpen, Layout,
  MessageSquare, Palette, Code, Rocket, ArrowRight,
  Building2, ShoppingCart, GraduationCap, Briefcase,
  Heart, Scale, Home, Gamepad2, Car, Plane,
  Dumbbell, UtensilsCrossed, Users, TrendingUp,
  ChevronRight, Play, Search, Star, Clock, Bot,
  Brain, Volume2, Check, Download, DollarSign, Crown, Lock, Gift, Percent, Rocket as RocketIcon
} from 'lucide-react';

// Industry data with icons and descriptions
const industries = [
  { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'from-red-500 to-pink-500', description: 'Medical apps, telehealth, patient portals' },
  { id: 'finance', name: 'Finance', icon: TrendingUp, color: 'from-green-500 to-emerald-500', description: 'Banking, trading, budgeting apps' },
  { id: 'ecommerce', name: 'E-Commerce', icon: ShoppingCart, color: 'from-blue-500 to-cyan-500', description: 'Online stores, marketplaces, subscriptions' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'from-purple-500 to-violet-500', description: 'LMS, courses, student portals' },
  { id: 'legal', name: 'Legal', icon: Scale, color: 'from-amber-500 to-orange-500', description: 'Case management, document automation' },
  { id: 'realestate', name: 'Real Estate', icon: Home, color: 'from-teal-500 to-cyan-500', description: 'Property listings, CRM, management' },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2, color: 'from-pink-500 to-rose-500', description: 'Streaming, gaming, social apps' },
  { id: 'automotive', name: 'Automotive', icon: Car, color: 'from-slate-500 to-gray-500', description: 'Dealerships, service, fleet management' },
  { id: 'travel', name: 'Travel', icon: Plane, color: 'from-sky-500 to-blue-500', description: 'Booking, itineraries, travel guides' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'from-orange-500 to-red-500', description: 'Workout tracking, nutrition, coaching' },
  { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed, color: 'from-yellow-500 to-amber-500', description: 'Ordering, reservations, POS' },
  { id: 'nonprofit', name: 'Non-Profit', icon: Users, color: 'from-indigo-500 to-purple-500', description: 'Donations, volunteers, campaigns' },
];

// Featured templates with pricing
const featuredTemplates = [
  {
    id: '1',
    title: 'Telehealth Platform',
    industry: 'Healthcare',
    description: 'Complete virtual healthcare solution with video calls, scheduling, and records',
    complexity: 'Enterprise',
    rating: 4.9,
    usageCount: 1250,
    price: 149,
    isPremium: true,
    features: ['Video Calls', 'Patient Portal', 'EHR Integration', 'Scheduling', 'Billing'],
  },
  {
    id: '2',
    title: 'E-Commerce Marketplace',
    industry: 'E-Commerce',
    description: 'Multi-vendor marketplace with payments, reviews, and seller dashboard',
    complexity: 'Complex',
    rating: 4.8,
    usageCount: 2100,
    price: 99,
    isPremium: true,
    features: ['Multi-vendor', 'Payments', 'Reviews', 'Analytics', 'Seller Dashboard'],
  },
  {
    id: '3',
    title: 'LMS Platform',
    industry: 'Education',
    description: 'Learning management system with courses, quizzes, and certificates',
    complexity: 'Medium',
    rating: 4.7,
    usageCount: 890,
    price: 79,
    isPremium: true,
    features: ['Course Builder', 'Quizzes', 'Certificates', 'Progress Tracking', 'Forums'],
  },
  {
    id: '4',
    title: 'SaaS Starter Kit',
    industry: 'Technology',
    description: 'Complete SaaS boilerplate with auth, billing, teams, and admin dashboard',
    complexity: 'Complex',
    rating: 4.9,
    usageCount: 3200,
    price: 199,
    isPremium: true,
    features: ['Authentication', 'Stripe Billing', 'Team Management', 'Admin Panel', 'API'],
  },
  {
    id: '5',
    title: 'Restaurant Ordering',
    industry: 'Restaurant',
    description: 'Online ordering system with menu management, delivery tracking, and POS',
    complexity: 'Medium',
    rating: 4.6,
    usageCount: 780,
    price: 0,
    isPremium: false,
    features: ['Menu Builder', 'Online Orders', 'Delivery Tracking', 'Kitchen Display'],
  },
  {
    id: '6',
    title: 'Fitness Tracker',
    industry: 'Fitness',
    description: 'Workout tracking app with exercise library, progress charts, and social features',
    complexity: 'Simple',
    rating: 4.5,
    usageCount: 1500,
    price: 0,
    isPremium: false,
    features: ['Workout Logging', 'Exercise Library', 'Progress Charts', 'Social Feed'],
  },
];

// AI Agent templates with pricing
const agentTemplates = [
  {
    id: 'agent-1',
    name: 'Customer Support Pro',
    category: 'Customer Service',
    description: 'Enterprise-grade customer support agent with sentiment analysis, ticket routing, and escalation',
    rating: 4.9,
    downloads: 15420,
    price: 49,
    isPremium: true,
    capabilities: ['24/7 Support', 'Sentiment Analysis', 'Auto-routing', 'Escalation', 'Multi-language'],
  },
  {
    id: 'agent-2',
    name: 'Sales Qualifier Bot',
    category: 'Sales',
    description: 'Intelligent lead qualification using BANT methodology with CRM integration',
    rating: 4.8,
    downloads: 8920,
    price: 79,
    isPremium: true,
    capabilities: ['BANT Scoring', 'CRM Sync', 'Meeting Booking', 'Follow-up Sequences'],
  },
  {
    id: 'agent-3',
    name: 'Content Creator AI',
    category: 'Marketing',
    description: 'Multi-format content creation with brand voice consistency and SEO optimization',
    rating: 4.9,
    downloads: 18750,
    price: 99,
    isPremium: true,
    capabilities: ['Blog Posts', 'Social Media', 'Email Campaigns', 'SEO Optimization', 'Brand Voice'],
  },
  {
    id: 'agent-4',
    name: 'Code Review Assistant',
    category: 'Development',
    description: 'Automated code review with security scanning, best practices, and documentation',
    rating: 4.7,
    downloads: 12300,
    price: 59,
    isPremium: true,
    capabilities: ['Security Scan', 'Best Practices', 'Auto Documentation', 'PR Reviews'],
  },
  {
    id: 'agent-5',
    name: 'HR Onboarding Bot',
    category: 'HR',
    description: 'Streamline employee onboarding with document collection and training scheduling',
    rating: 4.6,
    downloads: 5600,
    price: 0,
    isPremium: false,
    capabilities: ['Document Collection', 'Training Schedule', 'FAQ Answers', 'Policy Guide'],
  },
  {
    id: 'agent-6',
    name: 'Data Analysis Agent',
    category: 'Analytics',
    description: 'Transform raw data into insights with natural language queries and visualizations',
    rating: 4.8,
    downloads: 9800,
    price: 129,
    isPremium: true,
    capabilities: ['NL Queries', 'Auto Visualizations', 'Report Generation', 'Trend Analysis'],
  },
];

const BuilderIQ: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [storyInput, setStoryInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Voice activation hook with SmartPromptIQ branding
  const {
    isListening,
    isSupported,
    isSpeaking,
    transcript,
    interimTranscript,
    error: voiceError,
    isWakeWordDetected,
    audioLevel,
    startListening,
    stopListening,
    toggleListening,
    speak,
    activateDirectly,
    clearTranscript,
  } = useVoiceActivation({
    wakeWord: 'hey smartprompt',
    voicePersonality: 'enthusiastic',
    speakResponses: true,
    onCommand: useCallback((command: string) => {
      console.log('Voice command received:', command);

      // Handle voice commands
      if (command === 'templates') {
        setActiveTab('templates');
        toast({ title: 'Templates', description: 'Showing template library' });
      } else if (command === 'create') {
        setActiveTab('create');
        toast({ title: 'Create Mode', description: 'Ready to create your app' });
      } else if (command === 'questionnaire') {
        navigate('/builderiq/questionnaire');
      } else if (command.startsWith('industry:')) {
        const industry = command.replace('industry:', '');
        navigate(`/builderiq/questionnaire?industry=${industry}`);
      } else if (command === 'agents') {
        setActiveTab('agents');
        toast({ title: 'AI Agents', description: 'Browsing AI agent marketplace' });
      } else if (command === 'help') {
        toast({
          title: 'Voice Commands',
          description: 'Say: "show templates", "create app", "browse agents", or describe your app idea',
        });
      }
    }, [navigate, toast]),
    onTranscript: useCallback((text: string) => {
      // If in story mode, update story input
      if (activeTab === 'story') {
        setStoryInput(prev => prev + ' ' + text);
      }
    }, [activeTab]),
  });

  // Voice service wrapper for compatibility
  const voiceService = {
    isReady: isSupported && isListening,
    speak: (text: string, options?: { personality?: string }) => {
      speak(text);
    }
  };

  // Handle voice button click
  const handleVoiceButtonClick = useCallback(() => {
    if (isListening) {
      stopListening();
      toast({
        title: 'Voice Deactivated',
        description: 'Voice mode turned off',
      });
    } else {
      activateDirectly();
      toast({
        title: 'Voice Activated',
        description: 'Say "Hey SmartPrompt" or speak a command',
      });
    }
  }, [isListening, stopListening, activateDirectly, toast]);

  // State for purchase modal
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    item: { title?: string; name?: string; price: number; isPremium?: boolean; id?: string; type?: string } | null;
  }>({ isOpen: false, item: null });

  // Handle purchase action
  const handlePurchase = (item: { title?: string; name?: string; price: number; isPremium?: boolean; id?: string }, type: 'template' | 'agent' = 'template') => {
    const itemName = item.title || item.name;

    // Free items - add directly
    if (item.price === 0) {
      if (!isAuthenticated) {
        toast({
          title: 'Sign In to Save',
          description: 'Sign in to save this free item to your workspace.',
        });
        navigate(`/signin?redirect=/builderiq&item=${item.id}&type=${type}`);
        return;
      }
      toast({
        title: 'Added to Your Workspace!',
        description: `${itemName} is now available in your dashboard.`,
      });
      // In production, this would call an API to add to user's workspace
      return;
    }

    // Paid items - show purchase options
    if (!isAuthenticated) {
      toast({
        title: 'Sign In to Purchase',
        description: `Sign in to buy ${itemName} for $${item.price}`,
      });
      navigate(`/signin?redirect=/builderiq&purchase=${item.id}&type=${type}&price=${item.price}`);
      return;
    }

    // User is logged in - show purchase confirmation
    setPurchaseModal({ isOpen: true, item: { ...item, type } });
  };

  // Confirm purchase
  const confirmPurchase = () => {
    if (!purchaseModal.item) return;

    const itemName = purchaseModal.item.title || purchaseModal.item.name;

    toast({
      title: 'Processing Purchase...',
      description: `Purchasing ${itemName} for $${purchaseModal.item.price}`,
    });

    // Navigate to checkout/billing with the item
    navigate(`/billing?purchase=${purchaseModal.item.id}&type=${purchaseModal.item.type}&price=${purchaseModal.item.price}&name=${encodeURIComponent(itemName || '')}`);

    setPurchaseModal({ isOpen: false, item: null });
  };

  // Handle unlock all bundle
  const handleUnlockAll = () => {
    toast({
      title: 'SmartPromptIQ Builder Pro',
      description: 'Get ALL templates + agents for $299/year (Save $500+)',
    });
    navigate('/pricing?upgrade=builder_pro');
  };

  // Mood options for discovery
  const moods = [
    { id: 'frustrated', emoji: '😤', label: 'Frustrated', description: "I have an app but it's not working" },
    { id: 'inspired', emoji: '💡', label: 'Inspired', description: 'I have a brilliant new idea!' },
    { id: 'confused', emoji: '🤔', label: 'Confused', description: 'I know I need something but...' },
    { id: 'ambitious', emoji: '🚀', label: 'Ambitious', description: 'I want to disrupt an industry' },
    { id: 'practical', emoji: '💰', label: 'Practical', description: 'I need to solve a business problem' },
  ];

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    const mood = moods.find(m => m.id === moodId);

    if (voiceService.isReady) {
      voiceService.speak(`${mood?.label}! ${mood?.description}. Let's explore what you need!`, { personality: 'enthusiastic' });
    }

    // Navigate to questionnaire with mood context after speech
    setTimeout(() => {
      navigate(`/builderiq/questionnaire?mood=${moodId}`);
    }, 2500);
  };

  const handleStorySubmit = () => {
    if (!storyInput.trim()) {
      toast({
        title: 'Tell us your story',
        description: 'Please describe your app idea or frustration',
        variant: 'destructive',
      });
      return;
    }

    // Navigate to story analysis
    navigate(`/builderiq/story?input=${encodeURIComponent(storyInput)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Main hero */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" /> Part of SmartPromptIQ™ Platform
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-white">Smart</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                PromptIQ™
              </span>
              <span className="text-purple-400"> Builder</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              The AI App Builder within SmartPromptIQ™. Create professional app blueprints,
              use AI agents, and access 100+ templates. Powered by your prompts.
            </p>

            {/* Quick links to other SmartPromptIQ sections */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20" onClick={() => navigate('/academy')}>
                <GraduationCap className="w-4 h-4 mr-1" /> Academy (57 Courses)
              </Button>
              <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20" onClick={() => navigate('/categories')}>
                <Sparkles className="w-4 h-4 mr-1" /> Prompt Generator
              </Button>
              <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20" onClick={() => navigate('/playground')}>
                <Play className="w-4 h-4 mr-1" /> Playground
              </Button>
              <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20" onClick={() => navigate('/dashboard')}>
                <Layout className="w-4 h-4 mr-1" /> Dashboard
              </Button>
            </div>

            {/* Voice activation button */}
            <div className="flex justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={handleVoiceButtonClick}
                disabled={!isSupported}
                className={`${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                } text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    {isSupported ? 'Say "Hey SmartPrompt" or Click' : 'Voice Not Supported'}
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/builderiq/questionnaire')}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 px-8 py-6 text-lg rounded-full"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Start Questionnaire
              </Button>
            </div>

            {/* Voice status */}
            {isListening && (
              <div className="mb-8 p-4 bg-purple-500/20 rounded-xl max-w-2xl mx-auto border border-purple-500/30">
                <div className="flex items-center justify-center gap-3 text-purple-300">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>SmartPromptIQ™ is listening... Say "create app", "show templates", or "browse agents"</span>
                </div>
                {/* Audio level indicator */}
                {audioLevel > 0 && (
                  <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                      style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                    />
                  </div>
                )}
                {/* Show interim transcript */}
                {interimTranscript && (
                  <div className="mt-3 text-sm text-gray-400 italic">
                    "{interimTranscript}"
                  </div>
                )}
              </div>
            )}

            {/* Voice error */}
            {voiceError && (
              <div className="mb-8 p-4 bg-red-500/20 rounded-xl max-w-2xl mx-auto border border-red-500/30">
                <p className="text-red-300 text-center">{voiceError}</p>
              </div>
            )}

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="mb-8 p-3 bg-cyan-500/20 rounded-xl max-w-md mx-auto border border-cyan-500/30">
                <div className="flex items-center justify-center gap-2 text-cyan-300">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                  <span>SmartPromptIQ™ is speaking...</span>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="flex justify-center gap-8 text-gray-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-sm">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-sm">Industries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-sm">Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Voice</div>
                <div className="text-sm">Enabled</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 bg-slate-800/50 rounded-xl p-1 mb-8">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg">
              <Zap className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg">
              <Bot className="w-4 h-4 mr-2" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg">
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="story" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              Story Mode
            </TabsTrigger>
            <TabsTrigger value="my-apps" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg">
              <Rocket className="w-4 h-4 mr-2" />
              My Apps
            </TabsTrigger>
          </TabsList>

          {/* CREATE TAB */}
          <TabsContent value="create" className="space-y-12">
            {/* Mood-based discovery */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                How are you feeling about your project today?
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.id)}
                    className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                      selectedMood === mood.id
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-4xl mb-2 block">{mood.emoji}</span>
                    <span className="font-semibold block">{mood.label}</span>
                    <span className="text-xs opacity-75 block mt-1">{mood.description}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Industry selection */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Or choose your industry
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {industries.map((industry) => {
                  const Icon = industry.icon;
                  return (
                    <button
                      key={industry.id}
                      onClick={() => navigate(`/builderiq/questionnaire?industry=${industry.id}`)}
                      className="group p-6 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${industry.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-1">{industry.name}</h3>
                      <p className="text-sm text-gray-400">{industry.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          {/* AI AGENTS TAB */}
          <TabsContent value="agents" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">AI Agent Templates</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Production-ready AI agents for customer service, sales, marketing, operations, and more.
                Each template includes a complete system prompt, example conversations, and integrations.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-cyan-400">12+</div>
                <div className="text-sm text-gray-400">Agent Categories</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">50+</div>
                <div className="text-sm text-gray-400">Ready Templates</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-pink-400">100K+</div>
                <div className="text-sm text-gray-400">Downloads</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">4.8</div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </div>
            </div>

            {/* Featured Agent Categories */}
            <section>
              <h3 className="text-xl font-bold text-white mb-4">Popular Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Customer Service', icon: MessageSquare, color: 'from-blue-500 to-cyan-500', count: 8 },
                  { name: 'Sales & Revenue', icon: TrendingUp, color: 'from-green-500 to-emerald-500', count: 6 },
                  { name: 'Marketing', icon: Sparkles, color: 'from-purple-500 to-pink-500', count: 5 },
                  { name: 'Technical Support', icon: Code, color: 'from-cyan-500 to-blue-500', count: 7 },
                  { name: 'HR & Recruiting', icon: Users, color: 'from-pink-500 to-rose-500', count: 4 },
                  { name: 'Creative & Content', icon: Palette, color: 'from-yellow-500 to-orange-500', count: 5 },
                  { name: 'Research & Analysis', icon: Brain, color: 'from-indigo-500 to-purple-500', count: 4 },
                  { name: 'Personal Assistant', icon: Bot, color: 'from-slate-500 to-gray-500', count: 6 },
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.name}
                      onClick={() => navigate('/builderiq/agents')}
                      className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all text-left group"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-1">{category.name}</h4>
                      <p className="text-sm text-gray-400">{category.count} agents</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Featured Agents with Purchase */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">AI Agent Marketplace</h3>
                <Button
                  variant="outline"
                  onClick={() => navigate('/builderiq/agents')}
                  className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                >
                  View All Agents
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agentTemplates.map((agent) => (
                  <Card key={agent.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group relative overflow-hidden">
                    {agent.isPremium && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
                          <Crown className="w-3 h-3 mr-1" /> Pro
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          {agent.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{agent.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-white group-hover:text-cyan-300 transition-colors">
                        {agent.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((cap, i) => (
                          <span key={i} className="text-xs bg-cyan-500/10 text-cyan-300 px-2 py-1 rounded border border-cyan-500/20">
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="text-xs text-gray-500">+{agent.capabilities.length - 3} more</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                        <span className="text-sm text-gray-400">
                          <Download className="w-4 h-4 inline mr-1" />
                          {agent.downloads.toLocaleString()}
                        </span>
                        {agent.price > 0 ? (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                            onClick={() => handlePurchase(agent, 'agent')}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${agent.price}
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handlePurchase(agent, 'agent')}>
                            <Check className="w-4 h-4 mr-1" />
                            Free
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="text-center py-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to deploy your AI agent?</h3>
              <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                Browse our complete library of production-ready agents or build a custom one.
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => navigate('/builderiq/agents')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 px-8 py-6 text-lg"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Browse All Agents
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/builderiq/questionnaire?mode=agent')}
                  className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 px-8 py-6 text-lg"
                >
                  Build Custom Agent
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TEMPLATES TAB */}
          <TabsContent value="templates" className="space-y-8">
            {/* UNLOCK ALL BUNDLE BANNER */}
            <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-xl" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      SmartPromptIQ Builder Pro
                      <Badge className="bg-red-500 text-white border-0 animate-pulse">
                        <Percent className="w-3 h-3 mr-1" /> Save $500+
                      </Badge>
                    </h3>
                    <p className="text-gray-300">Get ALL templates + ALL AI agents • Lifetime updates • Priority support</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-gray-400 line-through text-sm">$799</div>
                    <div className="text-3xl font-bold text-white">$299<span className="text-sm font-normal text-gray-400">/year</span></div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold px-8"
                    onClick={handleUnlockAll}
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Unlock All
                  </Button>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by industry, feature, or keyword..."
                  className="pl-12 py-6 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500 rounded-xl"
                />
              </div>
            </div>

            {/* Featured templates */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Featured Templates</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates.map((template) => (
                  <Card key={template.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                    {template.isPremium && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                          <Crown className="w-3 h-3 mr-1" /> Premium
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                          {template.industry}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-gray-400">
                          {template.complexity}
                        </Badge>
                      </div>
                      <CardTitle className="text-white group-hover:text-purple-300 transition-colors">
                        {template.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Features */}
                      <div className="flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                        {template.features.length > 3 && (
                          <span className="text-xs text-gray-500">+{template.features.length - 3} more</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {template.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {template.usageCount.toLocaleString()}
                          </span>
                        </div>
                        {template.price > 0 ? (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                            onClick={() => handlePurchase(template, 'template')}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${template.price}
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handlePurchase(template, 'template')}>
                            <Check className="w-4 h-4 mr-1" />
                            Free
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Browse by industry */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Browse by Industry</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {industries.map((industry) => {
                  const Icon = industry.icon;
                  return (
                    <button
                      key={industry.id}
                      onClick={() => navigate(`/builderiq/templates/${industry.id}`)}
                      className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all text-center group"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${industry.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-300">{industry.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          {/* STORY MODE TAB */}
          <TabsContent value="story" className="space-y-8">
            <div className="max-w-3xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Tell Me Your Story</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Describe a frustrating day at your business, a problem you face, or an idea you have.
                    SmartPromptIQ will understand and suggest the perfect app blueprint.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={storyInput}
                      onChange={(e) => setStoryInput(e.target.value)}
                      placeholder="Example: Yesterday I spent 3 hours manually tracking inventory, then a customer complained we were out of stock on something we actually had..."
                      className="w-full h-48 p-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-gray-500 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />

                    {/* Voice input button */}
                    <button
                      onClick={handleVoiceButtonClick}
                      disabled={!isSupported}
                      className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${
                        isListening
                          ? 'bg-red-500 animate-pulse'
                          : 'bg-purple-500 hover:bg-purple-600'
                      } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5 text-white" />
                      ) : (
                        <Mic className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>

                  <Button
                    onClick={handleStorySubmit}
                    className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze My Story
                  </Button>

                  <div className="text-center text-gray-500 text-sm">
                    SmartPromptIQ™ will analyze your story and suggest features, user flows, and the perfect app architecture.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* MY APPS TAB */}
          <TabsContent value="my-apps" className="space-y-8">
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No apps created yet</h3>
              <p className="text-gray-400 mb-6">Start building your first app using the questionnaire or templates</p>
              <Button
                onClick={() => setActiveTab('create')}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create Your First App
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* How it works section */}
      <div className="bg-slate-800/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How SmartPromptIQ™ Builder Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Your Path',
                description: 'Start with a questionnaire, template, or just tell your story using voice or text.',
                icon: MessageSquare,
              },
              {
                step: '02',
                title: 'Answer Smart Questions',
                description: 'Our AI adapts questions based on your industry, goals, and previous answers.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Get Your Blueprint',
                description: 'Receive a complete app prompt with features, tech stack, and user flows.',
                icon: Code,
              },
              {
                step: '04',
                title: 'Build & Launch',
                description: 'Use your blueprint with any AI tool to generate your app instantly.',
                icon: Rocket,
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500 to-transparent" />
                )}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-purple-400 font-mono text-sm mb-2">{item.step}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expert Consultation CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Star className="w-3 h-3 mr-1" /> Premium Service
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help Building Your App?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Get 1-on-1 expert consultation. Our team will help you design, plan, and build your perfect app blueprint.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 px-8"
              onClick={() => {
                toast({
                  title: 'Expert Consultation',
                  description: 'Book a 30-min session for $99 or get the full package for $499',
                });
                navigate('/contact?service=consultation');
              }}
            >
              <Users className="w-5 h-5 mr-2" />
              Book Consultation - $99
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 px-8"
              onClick={() => navigate('/pricing')}
            >
              View All Plans
            </Button>
          </div>
        </div>
      </div>

      {/* Referral Banner */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 py-8 border-t border-green-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Refer & Earn $50</h3>
                <p className="text-gray-400 text-sm">Share SmartPromptIQ™ and get $50 credit for each friend who subscribes</p>
              </div>
            </div>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => {
                toast({
                  title: 'Referral Link Copied!',
                  description: 'Share this link and earn $50 for each signup',
                });
                navigator.clipboard.writeText(`https://smartpromptiq.com/ref/${user?.id || 'guest'}`);
              }}
            >
              <Gift className="w-4 h-4 mr-2" />
              Get Referral Link
            </Button>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      <Dialog open={purchaseModal.isOpen} onOpenChange={(open) => setPurchaseModal({ isOpen: open, item: purchaseModal.item })}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              You are about to purchase:
            </DialogDescription>
          </DialogHeader>

          {purchaseModal.item && (
            <div className="py-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-white">
                    {purchaseModal.item.title || purchaseModal.item.name}
                  </h3>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {purchaseModal.item.type === 'agent' ? 'AI Agent' : 'Template'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-2xl font-bold text-white">${purchaseModal.item.price}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-green-300 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Instant access after purchase
                </p>
                <p className="text-green-300 text-sm flex items-center gap-2 mt-1">
                  <Check className="w-4 h-4" />
                  Lifetime updates included
                </p>
              </div>

              {user && (
                <div className="mt-4 text-sm text-gray-400">
                  Purchasing as: <span className="text-white">{user.email}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-800"
              onClick={() => setPurchaseModal({ isOpen: false, item: null })}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              onClick={confirmPurchase}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Purchase Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BuilderIQ;
