import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BackButton from '@/components/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useToast } from '@/hooks/use-toast';
import SectionLanding from '@/components/SectionLanding';
import EducationalHeader, { educationalContent } from '@/components/EducationalHeader';
import {
  Search, Filter, Star, Download, Heart, Share2,
  ShoppingCart, Tag, TrendingUp, Clock, User,
  Crown, Zap, Eye, MessageSquare, DollarSign,
  Plus, Grid, List, Sparkles, Award, Copy,
  Check, ExternalLink, Bookmark, BookmarkCheck, Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

// SEO-optimized content for public landing
const marketplaceLandingContent = {
  title: 'Prompt Marketplace',
  definition: 'The SmartPromptIQ Marketplace is where prompt engineers buy and sell professional-grade AI prompts. Access battle-tested templates for marketing, sales, development, and creative work—or monetize your own expertise by selling prompts you\'ve crafted and optimized.',
  whatItsFor: 'The Marketplace connects prompt creators with professionals who need proven AI instructions. Buyers get instant access to expert-crafted prompts that save hours of trial and error. Sellers earn passive income by sharing their expertise. Every prompt is rated, reviewed, and optimized for results.',
  whoItsFor: [
    'Professionals seeking proven, high-quality prompts without DIY experimentation',
    'Expert prompt engineers looking to monetize their skills and templates',
    'Agencies needing reliable prompts for client deliverables',
    'Businesses scaling AI adoption across teams with vetted resources',
    'Freelancers building prompt libraries for various client needs',
    'AI enthusiasts exploring what expert prompts look like'
  ],
  howItHelps: [
    'Access thousands of professional prompts across 10+ categories',
    'Filter by ratings, downloads, and verified seller status',
    'Preview outputs before purchasing to ensure fit for your needs',
    'Sell your own prompts and earn passive income',
    'Build a library of favorites for quick access',
    'Get detailed usage guides and customization tips with each purchase'
  ],
  internalLinks: [
    { label: 'Academy', href: '/academy', description: 'Learn to create sellable prompts' },
    { label: 'Templates', href: '/templates', description: 'Free prompt templates to get started' },
    { label: 'BuilderIQ', href: '/builderiq', description: 'Build apps with prompts' },
    { label: 'AI Agents', href: '/agents', description: 'Deploy prompts as chatbots' },
    { label: 'Voice AI', href: '/voice', description: 'Turn prompt outputs into audio' },
    { label: 'Pricing', href: '/pricing', description: 'View seller and buyer benefits' }
  ],
  stats: [
    { label: 'Prompts Available', value: '5,000+' },
    { label: 'Active Sellers', value: '500+' },
    { label: 'Categories', value: '10+' },
    { label: 'Total Downloads', value: '100K+' }
  ],
  faqs: [
    {
      question: 'What is the SmartPromptIQ Marketplace?',
      answer: 'The Marketplace is a platform where prompt engineers sell their battle-tested AI prompts and templates. Buyers get instant access to professional-grade prompts with ratings, reviews, and usage guides. It\'s like an app store, but for AI prompts.'
    },
    {
      question: 'How do I know if a prompt is good before buying?',
      answer: 'Every prompt shows ratings, review counts, download numbers, and preview outputs. You can see exactly what the prompt produces before purchasing. Verified sellers have been vetted for quality. All purchases include a satisfaction guarantee.'
    },
    {
      question: 'Can I sell my own prompts on the Marketplace?',
      answer: 'Yes! Anyone can apply to become a seller. You set your own prices, keep the majority of each sale, and build your reputation through ratings. Top sellers earn thousands monthly from their prompt libraries. Apply through your account dashboard.'
    },
    {
      question: 'What categories of prompts are available?',
      answer: 'The Marketplace covers Marketing & Sales (email sequences, ad copy), Technical (code review, documentation), Content Creation (blogs, social media), Business Strategy (analysis, planning), Customer Service (response templates), and more.'
    },
    {
      question: 'How are payments handled?',
      answer: 'Purchases are made using SmartPromptIQ tokens or direct USD payment. Tokens can be purchased in bundles for discounts. Sellers receive payouts monthly via PayPal or Stripe. There are no hidden fees beyond the platform commission.'
    },
    {
      question: 'Can I request custom prompts?',
      answer: 'Yes! Pro and Business subscribers can post custom prompt requests. Verified sellers can then bid on your project. It\'s a great way to get exactly what you need when you can\'t find it in the marketplace.'
    }
  ]
};

// Types
interface MarketplacePrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  subcategory?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
    rating: number;
    totalSales: number;
  };
  price: number; // 0 = free
  currency: 'tokens' | 'usd';
  rating: number;
  reviewCount: number;
  downloads: number;
  likes: number;
  tags: string[];
  preview?: string;
  isPremium: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock marketplace data
const MARKETPLACE_PROMPTS: MarketplacePrompt[] = [
  {
    id: 'mp-1',
    title: 'Ultimate Blog Post Generator',
    description: 'Create SEO-optimized, engaging blog posts on any topic. Includes title variations, meta descriptions, and social media snippets.',
    prompt: 'Write a comprehensive blog post about [TOPIC]. Include:\n1. Catchy headline with power words\n2. Hook introduction\n3. 5-7 main sections with H2 headers\n4. Practical tips and examples\n5. Call-to-action conclusion\n6. Meta description (155 chars)\n7. 3 social media post variations',
    category: 'Marketing',
    subcategory: 'Content',
    author: { id: 'u1', name: 'ContentMaster', isVerified: true, rating: 4.9, totalSales: 1250, avatar: undefined },
    price: 0,
    currency: 'tokens',
    rating: 4.8,
    reviewCount: 342,
    downloads: 5420,
    likes: 890,
    tags: ['blog', 'seo', 'content', 'marketing'],
    isPremium: false,
    isFeatured: true,
    isNew: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: 'mp-2',
    title: 'Enterprise Sales Email Sequence',
    description: '7-email sequence designed for B2B sales. Proven to increase response rates by 3x. Includes follow-up timing recommendations.',
    prompt: 'Create a 7-email B2B sales sequence for [PRODUCT/SERVICE] targeting [TARGET_AUDIENCE]...',
    category: 'Sales',
    subcategory: 'Email',
    author: { id: 'u2', name: 'SalesGuru', isVerified: true, rating: 4.95, totalSales: 890, avatar: undefined },
    price: 15,
    currency: 'tokens',
    rating: 4.9,
    reviewCount: 156,
    downloads: 1230,
    likes: 445,
    tags: ['sales', 'email', 'b2b', 'enterprise'],
    isPremium: true,
    isFeatured: true,
    isNew: false,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: 'mp-3',
    title: 'AI Code Review Assistant',
    description: 'Comprehensive code review prompt that catches bugs, security issues, and suggests improvements. Supports 15+ languages.',
    prompt: 'Review the following code for:\n1. Bugs and logical errors\n2. Security vulnerabilities (OWASP Top 10)\n3. Performance optimizations\n4. Code style and best practices\n5. Documentation needs\n\nCode:\n[CODE]\n\nLanguage: [LANGUAGE]',
    category: 'Technical',
    subcategory: 'Development',
    author: { id: 'u3', name: 'DevExpert', isVerified: true, rating: 4.85, totalSales: 2100, avatar: undefined },
    price: 25,
    currency: 'tokens',
    rating: 4.95,
    reviewCount: 521,
    downloads: 8900,
    likes: 1250,
    tags: ['code', 'review', 'development', 'security'],
    isPremium: true,
    isFeatured: true,
    isNew: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-04-15'),
  },
  {
    id: 'mp-4',
    title: 'Social Media Content Calendar',
    description: 'Generate a full month of social media content across all platforms. Includes hashtags, posting times, and engagement hooks.',
    prompt: 'Create a 30-day social media content calendar for [BRAND/BUSINESS]...',
    category: 'Marketing',
    subcategory: 'Social Media',
    author: { id: 'u4', name: 'SocialPro', isVerified: false, rating: 4.7, totalSales: 340, avatar: undefined },
    price: 10,
    currency: 'tokens',
    rating: 4.6,
    reviewCount: 89,
    downloads: 780,
    likes: 230,
    tags: ['social media', 'content calendar', 'marketing'],
    isPremium: false,
    isFeatured: false,
    isNew: true,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-10'),
  },
  {
    id: 'mp-5',
    title: 'Customer Support Response Library',
    description: '50+ templated responses for common customer issues. Maintains brand voice while being empathetic and solution-focused.',
    prompt: 'Generate customer support responses for the following scenarios...',
    category: 'Customer Service',
    author: { id: 'u5', name: 'SupportHero', isVerified: true, rating: 4.8, totalSales: 560, avatar: undefined },
    price: 20,
    currency: 'tokens',
    rating: 4.75,
    reviewCount: 178,
    downloads: 2340,
    likes: 567,
    tags: ['support', 'customer service', 'templates'],
    isPremium: true,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-25'),
  },
  {
    id: 'mp-6',
    title: 'Creative Story Starter Pack',
    description: 'Jump-start your creative writing with 20 unique story prompts spanning multiple genres. Perfect for writers block.',
    prompt: 'Generate creative story ideas based on [GENRE] with unique characters and plot twists...',
    category: 'Creative',
    subcategory: 'Writing',
    author: { id: 'u6', name: 'StoryWeaver', isVerified: false, rating: 4.5, totalSales: 120, avatar: undefined },
    price: 0,
    currency: 'tokens',
    rating: 4.4,
    reviewCount: 67,
    downloads: 890,
    likes: 210,
    tags: ['creative writing', 'stories', 'fiction'],
    isPremium: false,
    isFeatured: false,
    isNew: true,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-12'),
  },
  {
    id: 'mp-7',
    title: 'Legal Document Analyzer',
    description: 'Break down complex legal documents into plain English summaries. Identifies key clauses, risks, and action items.',
    prompt: 'Analyze the following legal document and provide:\n1. Plain English summary\n2. Key clauses and their implications\n3. Potential risks or concerns\n4. Required action items\n5. Questions to ask legal counsel\n\nDocument: [DOCUMENT]',
    category: 'Legal',
    author: { id: 'u7', name: 'LegalEagle', isVerified: true, rating: 4.9, totalSales: 450, avatar: undefined },
    price: 50,
    currency: 'tokens',
    rating: 4.85,
    reviewCount: 134,
    downloads: 1890,
    likes: 445,
    tags: ['legal', 'contracts', 'analysis'],
    isPremium: true,
    isFeatured: true,
    isNew: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-04-08'),
  },
  {
    id: 'mp-8',
    title: 'Product Description Generator',
    description: 'Create compelling product descriptions that convert. Optimized for e-commerce platforms.',
    prompt: 'Write product descriptions for [PRODUCT] including benefits, features, and emotional triggers...',
    category: 'E-Commerce',
    author: { id: 'u8', name: 'ShopWriter', isVerified: false, rating: 4.6, totalSales: 280, avatar: undefined },
    price: 5,
    currency: 'tokens',
    rating: 4.5,
    reviewCount: 92,
    downloads: 1450,
    likes: 320,
    tags: ['e-commerce', 'product', 'descriptions', 'copywriting'],
    isPremium: false,
    isFeatured: false,
    isNew: false,
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-03-15'),
  },
];

// Categories
const CATEGORIES = [
  'All',
  'Marketing',
  'Sales',
  'Technical',
  'Creative',
  'Customer Service',
  'Legal',
  'E-Commerce',
  'Finance',
  'Education',
  'HR',
];

const Marketplace: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { awardXP, checkAndAwardBadge } = useGamification();
  const { toast } = useToast();

  // Show SEO-optimized public landing for non-authenticated users
  if (!isAuthenticated) {
    return (
      <SectionLanding
        title={marketplaceLandingContent.title}
        definition={marketplaceLandingContent.definition}
        whatItsFor={marketplaceLandingContent.whatItsFor}
        whoItsFor={marketplaceLandingContent.whoItsFor}
        howItHelps={marketplaceLandingContent.howItHelps}
        internalLinks={marketplaceLandingContent.internalLinks}
        heroGradient="from-green-600 via-emerald-600 to-teal-600"
        ctaText="Browse Marketplace"
        ctaHref="/signup"
        secondaryCtaText="Become a Seller"
        secondaryCtaHref="/signup"
        stats={marketplaceLandingContent.stats}
        faqs={marketplaceLandingContent.faqs}
        icon={<Store className="w-8 h-8 text-white" />}
      />
    );
  }

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'price'>('popular');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPrompt, setSelectedPrompt] = useState<MarketplacePrompt | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]);

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let result = [...MARKETPLACE_PROMPTS];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      result = result.filter(p => p.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter(p => p.price > 0);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        result.sort((a, b) => a.price - b.price);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy, priceFilter]);

  // Featured prompts
  const featuredPrompts = MARKETPLACE_PROMPTS.filter(p => p.isFeatured);

  // Handle purchase/download
  const handlePurchase = (prompt: MarketplacePrompt) => {
    if (purchasedPrompts.includes(prompt.id)) {
      // Already purchased - copy to clipboard
      navigator.clipboard.writeText(prompt.prompt);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard',
      });
      return;
    }

    if (prompt.price === 0) {
      // Free prompt
      setPurchasedPrompts(prev => [...prev, prompt.id]);
      awardXP(5, 'Downloaded free prompt from marketplace', 'marketplace');
      toast({
        title: 'Downloaded!',
        description: `${prompt.title} is now in your library`,
      });
    } else {
      // Premium prompt - would integrate with billing
      setPurchasedPrompts(prev => [...prev, prompt.id]);
      awardXP(10, 'Purchased premium prompt from marketplace', 'marketplace');
      toast({
        title: 'Purchased!',
        description: `${prompt.title} is now in your library`,
      });
    }
  };

  // Toggle save
  const toggleSave = (promptId: string) => {
    setSavedPrompts(prev =>
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  // Render prompt card
  const renderPromptCard = (prompt: MarketplacePrompt) => {
    const isPurchased = purchasedPrompts.includes(prompt.id);
    const isSaved = savedPrompts.includes(prompt.id);

    return (
      <Card
        key={prompt.id}
        className={cn(
          "bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group",
          viewMode === 'list' && "flex flex-row"
        )}
        onClick={() => setSelectedPrompt(prompt)}
      >
        <CardHeader className={viewMode === 'list' ? "flex-1" : ""}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {prompt.isFeatured && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    <Crown className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
                {prompt.isNew && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    New
                  </Badge>
                )}
                {prompt.isPremium && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Premium
                  </Badge>
                )}
              </div>
              <CardTitle className="text-white group-hover:text-purple-300 transition-colors text-lg">
                {prompt.title}
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2 line-clamp-2">
                {prompt.description}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-pink-400"
              onClick={(e) => {
                e.stopPropagation();
                toggleSave(prompt.id);
              }}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-pink-400" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {prompt.author.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-400">{prompt.author.name}</span>
            {prompt.author.isVerified && (
              <Badge className="bg-blue-500/20 text-blue-300 text-xs px-1">
                <Check className="w-3 h-3" />
              </Badge>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {prompt.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs border-slate-600 text-gray-500">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-slate-600 text-gray-500">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardFooter className={cn(
          "flex items-center justify-between border-t border-slate-700 pt-4",
          viewMode === 'list' && "flex-col items-end gap-2 border-t-0 border-l pl-4"
        )}>
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {prompt.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {prompt.downloads.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {prompt.likes}
            </span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center gap-2">
            {prompt.price === 0 ? (
              <Badge className="bg-green-500/20 text-green-300">Free</Badge>
            ) : (
              <Badge className="bg-purple-500/20 text-purple-300">
                {prompt.price} tokens
              </Badge>
            )}
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePurchase(prompt);
              }}
              className={cn(
                isPurchased
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {isPurchased ? (
                <>
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </>
              ) : prompt.price === 0 ? (
                <>
                  <Download className="w-4 h-4 mr-1" /> Get
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" /> Buy
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Educational Context Header */}
      <EducationalHeader
        title={educationalContent.marketplace.title}
        definition={educationalContent.marketplace.definition}
        icon={<Store className="w-5 h-5" />}
        academyLink={educationalContent.marketplace.academyLink}
        relatedLinks={educationalContent.marketplace.relatedLinks}
        gradient={educationalContent.marketplace.gradient}
      />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <BackButton />

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Prompt Marketplace
              </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover and share premium prompts created by the community.
              Buy, sell, and earn from your best work.
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{MARKETPLACE_PROMPTS.length}+</p>
                <p className="text-gray-400">Prompts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-gray-400">Creators</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">25K+</p>
                <p className="text-gray-400">Downloads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        {featuredPrompts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Featured Prompts
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPrompts.slice(0, 3).map(renderPromptCard)}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts by name, category, or tags..."
              className="pl-12 py-6 bg-slate-800/50 border-slate-700 text-white text-lg"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    selectedCategory === cat
                      ? 'bg-purple-600'
                      : 'border-slate-600 text-gray-300'
                  )}
                >
                  {cat}
                </Button>
              ))}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-24 bg-slate-800/50 border-slate-700 text-gray-300">
                  <SelectValue placeholder="More" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.slice(6).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort and View */}
            <div className="flex items-center gap-2">
              <Select value={priceFilter} onValueChange={(v: any) => setPriceFilter(v)}>
                <SelectTrigger className="w-28 bg-slate-800/50 border-slate-700 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                  <SelectItem value="paid">Paid Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price">Price: Low-High</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-slate-700 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "rounded-none",
                    viewMode === 'grid' && "bg-slate-700"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "rounded-none",
                    viewMode === 'list' && "bg-slate-700"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-400 text-sm">
          Showing {filteredPrompts.length} prompts
        </div>

        {/* Prompt Grid */}
        <div className={cn(
          "gap-6 mb-12",
          viewMode === 'grid'
            ? "grid md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col"
        )}>
          {filteredPrompts.map(renderPromptCard)}
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No prompts found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setPriceFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Sell Your Prompts CTA */}
        <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 mt-12">
          <CardContent className="py-8 text-center">
            <Award className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Become a Creator</h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Share your best prompts with the community and earn tokens when others purchase them.
              Top creators earn 70% commission on every sale!
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Submit Your Prompt
              </Button>
              <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Detail Modal */}
        {selectedPrompt && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPrompt(null)}
          >
            <div
              className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedPrompt.isFeatured && (
                        <Badge className="bg-yellow-500/20 text-yellow-300">Featured</Badge>
                      )}
                      {selectedPrompt.isPremium && (
                        <Badge className="bg-purple-500/20 text-purple-300">Premium</Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{selectedPrompt.title}</h2>
                    <p className="text-gray-400 mt-2">{selectedPrompt.description}</p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedPrompt(null)}>
                    Close
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Author Info */}
                <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                    {selectedPrompt.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{selectedPrompt.author.name}</span>
                      {selectedPrompt.author.isVerified && (
                        <Badge className="bg-blue-500/20 text-blue-300 text-xs">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        {selectedPrompt.author.rating.toFixed(1)}
                      </span>
                      <span>{selectedPrompt.author.totalSales} sales</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPrompt.rating.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">{selectedPrompt.reviewCount} reviews</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Download className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPrompt.downloads.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Downloads</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">{selectedPrompt.likes}</p>
                    <p className="text-xs text-gray-400">Likes</p>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Clock className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">
                      {new Date(selectedPrompt.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">Updated</p>
                  </div>
                </div>

                {/* Prompt Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prompt Preview</h3>
                  <pre className="bg-slate-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-60">
                    {purchasedPrompts.includes(selectedPrompt.id)
                      ? selectedPrompt.prompt
                      : selectedPrompt.prompt.substring(0, 200) + '...\n\n[Purchase to see full prompt]'}
                  </pre>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="border-slate-600 text-gray-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-slate-700 flex items-center justify-between">
                <div>
                  {selectedPrompt.price === 0 ? (
                    <p className="text-2xl font-bold text-green-400">Free</p>
                  ) : (
                    <p className="text-2xl font-bold text-purple-400">
                      {selectedPrompt.price} tokens
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-slate-700"
                    onClick={() => toggleSave(selectedPrompt.id)}
                  >
                    {savedPrompts.includes(selectedPrompt.id) ? (
                      <BookmarkCheck className="w-4 h-4 mr-2 text-pink-400" />
                    ) : (
                      <Bookmark className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                  <Button
                    className={cn(
                      purchasedPrompts.includes(selectedPrompt.id)
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-purple-600 hover:bg-purple-700"
                    )}
                    onClick={() => handlePurchase(selectedPrompt)}
                  >
                    {purchasedPrompts.includes(selectedPrompt.id) ? (
                      <>
                        <Copy className="w-4 h-4 mr-2" /> Copy Prompt
                      </>
                    ) : selectedPrompt.price === 0 ? (
                      <>
                        <Download className="w-4 h-4 mr-2" /> Download Free
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" /> Purchase
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
