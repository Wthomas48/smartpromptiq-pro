import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Search,
  Filter,
  Star,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  Shield,
  Clock,
  Award,
  ThumbsUp,
  MessageSquare,
  ChevronDown,
  Grid,
  List,
  BookOpen,
  Sparkles,
  Code,
  Palette,
  Database,
  Cloud,
  Globe,
  Smartphone,
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle,
  ArrowUpRight,
  ArrowLeft,
  Home,
  Rocket,
  Play,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// ALL PLATFORMS - Complete directory with affiliate status marked
// hasVerifiedAffiliate: true = has affiliate program you can earn from
const BUILDERS_DIRECTORY = [
  // === AI-POWERED BUILDERS ===
  {
    id: 'bolt',
    name: 'Bolt.new',
    tagline: 'AI-powered full-stack development',
    description: 'Build and deploy full-stack web applications in seconds using natural language. The fastest path from idea to production.',
    logo: '⚡',
    color: 'from-yellow-500 to-orange-500',
    category: 'ai-builder',
    subcategory: 'Full-Stack',
    rating: 4.9,
    totalReviews: 12500,
    monthlyUsers: '500K+',
    pricing: { free: true, paid: '$20/mo' },
    features: ['AI Code Generation', 'Instant Preview', 'One-Click Deploy', 'Git Integration', 'Database Support', 'API Routes'],
    pros: ['Incredibly fast', 'No setup needed', 'Great for MVPs'],
    cons: ['Limited customization', 'Vendor lock-in'],
    languages: ['TypeScript', 'JavaScript'],
    frameworks: ['React', 'Next.js', 'Node.js'],
    integrations: ['Vercel', 'GitHub', 'Supabase'],
    url: 'https://bolt.new',
    affiliateUrl: 'https://bolt.new',
    bestFor: ['Startups', 'MVPs', 'Prototypes', 'Solo Developers'],
    userReviews: [
      { user: 'Sarah K.', rating: 5, text: 'Built my SaaS MVP in 2 hours!' },
      { user: 'Mike R.', rating: 5, text: 'Game changer for rapid prototyping.' },
    ],
    lastUpdated: '2024-01-15',
    founded: '2023',
    isVerified: true,
    isFeatured: true,
    commission: null,
    hasVerifiedAffiliate: false,
  },
  {
    id: 'lovable',
    name: 'Lovable.dev',
    tagline: 'Design-first AI app builder',
    description: 'Create beautiful, production-ready web applications from natural language. Focuses on design quality and developer experience.',
    logo: '💜',
    color: 'from-purple-500 to-pink-500',
    category: 'ai-builder',
    subcategory: 'Full-Stack',
    rating: 4.8,
    totalReviews: 8900,
    monthlyUsers: '300K+',
    pricing: { free: true, paid: '$25/mo' },
    features: ['Beautiful UI', 'Component Library', 'Real-time Collab', 'Export Code', 'Supabase Integration', 'Custom Domains'],
    pros: ['Stunning designs', 'Clean code output', 'Great UX'],
    cons: ['Steeper learning curve', 'Limited backend'],
    languages: ['TypeScript'],
    frameworks: ['React', 'Tailwind CSS'],
    integrations: ['Supabase', 'Stripe', 'Auth0'],
    url: 'https://lovable.dev',
    affiliateUrl: 'https://lovable.dev',
    bestFor: ['Designers', 'SaaS Builders', 'Landing Pages'],
    userReviews: [
      { user: 'Emily T.', rating: 5, text: 'Finally an AI tool that understands design!' },
      { user: 'James L.', rating: 4, text: 'Great for frontend, backend needs work.' },
    ],
    lastUpdated: '2024-01-10',
    founded: '2023',
    isVerified: true,
    isFeatured: true,
    commission: null,
    hasVerifiedAffiliate: false,
  },
  {
    id: 'v0',
    name: 'v0.dev',
    tagline: 'AI-generated React components',
    description: "Vercel's AI-powered UI generation tool. Get production-ready React components using shadcn/ui and Tailwind CSS.",
    logo: '▲',
    color: 'from-gray-700 to-black',
    category: 'ai-builder',
    subcategory: 'UI Components',
    rating: 4.8,
    totalReviews: 15000,
    monthlyUsers: '1M+',
    pricing: { free: true, paid: '$10/mo' },
    features: ['React Components', 'shadcn/ui', 'Tailwind', 'Copy Code', 'Iterate', 'Export'],
    pros: ['High quality output', 'Modern stack', 'Easy to use'],
    cons: ['Components only', 'No full apps'],
    languages: ['TypeScript'],
    frameworks: ['React', 'Next.js'],
    integrations: ['Vercel', 'GitHub'],
    url: 'https://v0.dev',
    affiliateUrl: 'https://v0.dev',
    bestFor: ['React Developers', 'UI Design', 'Component Libraries'],
    userReviews: [
      { user: 'Alex M.', rating: 5, text: 'Perfect for rapid UI prototyping.' },
      { user: 'Nina S.', rating: 5, text: 'Saves hours of frontend work.' },
    ],
    lastUpdated: '2024-01-12',
    founded: '2023',
    isVerified: true,
    isFeatured: true,
    commission: null,
    hasVerifiedAffiliate: false,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    tagline: 'The AI-first code editor',
    description: 'A VS Code fork with powerful AI capabilities. Chat with your codebase, get smart autocomplete, and make multi-file edits.',
    logo: '🖱️',
    color: 'from-cyan-500 to-blue-500',
    category: 'ai-ide',
    subcategory: 'Code Editor',
    rating: 4.9,
    totalReviews: 25000,
    monthlyUsers: '1M+',
    pricing: { free: true, paid: '$20/mo' },
    features: ['AI Autocomplete', 'Chat', 'Multi-file Edit', 'VS Code Compatible', 'Git Integration', 'Extensions'],
    pros: ['Very smart AI', 'Familiar interface', 'Fast'],
    cons: ['Resource hungry', 'Subscription model'],
    languages: ['All'],
    frameworks: ['All'],
    integrations: ['GitHub', 'GitLab', 'All VS Code extensions'],
    url: 'https://cursor.sh',
    affiliateUrl: 'https://cursor.sh',
    bestFor: ['Professional Devs', 'Large Codebases', 'Refactoring'],
    userReviews: [
      { user: 'Chris D.', rating: 5, text: 'Changed how I code. 10x productivity.' },
      { user: 'Anna K.', rating: 5, text: 'Best AI coding assistant available.' },
    ],
    lastUpdated: '2024-01-14',
    founded: '2022',
    isVerified: true,
    isFeatured: true,
    commission: null,
    hasVerifiedAffiliate: false,
  },
  // === PLATFORMS WITH VERIFIED AFFILIATE PROGRAMS ===
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    tagline: 'Simple cloud hosting - $200/referral',
    description: 'Developer-friendly cloud infrastructure with Droplets, App Platform, and managed databases. Top affiliate program!',
    logo: '🌊',
    color: 'from-blue-500 to-blue-600',
    category: 'deployment',
    subcategory: 'Cloud Infrastructure',
    rating: 4.8,
    totalReviews: 150000,
    monthlyUsers: '10M+',
    pricing: { free: false, paid: '$5/mo' },
    features: ['Droplets', 'App Platform', 'Managed DBs', 'Kubernetes', 'Spaces', 'Load Balancers'],
    pros: ['Simple pricing', 'Great docs', 'Reliable'],
    cons: ['No free tier', 'Fewer regions'],
    languages: ['All'],
    frameworks: ['All'],
    integrations: ['GitHub', 'Docker', 'Terraform'],
    url: 'https://www.digitalocean.com',
    affiliateUrl: 'https://www.digitalocean.com/?refcode=smartpromptiq',
    affiliateProgram: 'https://www.digitalocean.com/partners/referral-program',
    bestFor: ['Startups', 'Developers', 'Scalable Apps'],
    userReviews: [
      { user: 'Dev Team', rating: 5, text: 'Perfect for our startup.' },
      { user: 'Cloud Expert', rating: 5, text: 'Best value in cloud hosting.' },
    ],
    lastUpdated: '2024-01-15',
    founded: '2011',
    isVerified: true,
    isFeatured: true,
    commission: '$200/referral',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'replit',
    name: 'Replit',
    tagline: 'Code anywhere, deploy instantly',
    description: 'Collaborative browser-based IDE with AI assistance. Build and deploy apps without any setup.',
    logo: '🔄',
    color: 'from-orange-500 to-red-500',
    category: 'ai-ide',
    subcategory: 'Browser IDE',
    rating: 4.7,
    totalReviews: 50000,
    monthlyUsers: '20M+',
    pricing: { free: true, paid: '$7/mo' },
    features: ['Browser IDE', 'Multiplayer', 'Ghostwriter AI', 'Deployments', 'Database', 'Templates'],
    pros: ['Zero setup', 'Great for learning', 'Collaborative'],
    cons: ['Limited resources', 'Performance issues'],
    languages: ['50+ Languages'],
    frameworks: ['All Major'],
    integrations: ['GitHub', 'Google Auth'],
    url: 'https://replit.com',
    affiliateUrl: 'https://replit.com/site/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://replit.com/site/affiliates',
    bestFor: ['Students', 'Educators', 'Quick Projects'],
    userReviews: [
      { user: 'Prof. Martin', rating: 5, text: 'Essential for teaching programming.' },
      { user: 'Student Sam', rating: 4, text: 'Great for learning.' },
    ],
    lastUpdated: '2024-01-11',
    founded: '2016',
    isVerified: true,
    isFeatured: true,
    commission: '40% rev share',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    tagline: 'Deploy fast, scale globally',
    description: 'The platform for frontend developers. Lightning-fast deployments with global edge network.',
    logo: '▲',
    color: 'from-black to-gray-800',
    category: 'deployment',
    subcategory: 'Frontend Hosting',
    rating: 4.9,
    totalReviews: 100000,
    monthlyUsers: '10M+',
    pricing: { free: true, paid: '$20/mo' },
    features: ['Git Deploy', 'Edge Functions', 'Analytics', 'Preview URLs', 'Custom Domains', 'CI/CD'],
    pros: ['Blazing fast', 'Great DX', 'Generous free tier'],
    cons: ['Can get expensive', 'Next.js focused'],
    languages: ['JavaScript', 'TypeScript', 'Python'],
    frameworks: ['Next.js', 'React', 'Vue', 'Svelte'],
    integrations: ['GitHub', 'GitLab', 'Bitbucket'],
    url: 'https://vercel.com',
    affiliateUrl: 'https://vercel.com/partners?ref=smartpromptiq',
    affiliateProgram: 'https://vercel.com/partners',
    bestFor: ['Next.js Apps', 'Static Sites', 'Jamstack'],
    userReviews: [
      { user: 'Dan A.', rating: 5, text: 'Best deployment experience ever.' },
      { user: 'Maria S.', rating: 5, text: 'Vercel + Next.js = perfect.' },
    ],
    lastUpdated: '2024-01-13',
    founded: '2015',
    isVerified: true,
    isFeatured: true,
    commission: '20% recurring',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    tagline: 'Open source Firebase alternative',
    description: 'The open source Firebase alternative with PostgreSQL database, authentication, and real-time features.',
    logo: '⚡',
    color: 'from-green-500 to-emerald-600',
    category: 'backend',
    subcategory: 'BaaS',
    rating: 4.8,
    totalReviews: 35000,
    monthlyUsers: '1M+',
    pricing: { free: true, paid: '$25/mo' },
    features: ['PostgreSQL', 'Auth', 'Storage', 'Real-time', 'Edge Functions', 'Vector DB'],
    pros: ['Open source', 'Great free tier', 'Fast setup'],
    cons: ['Vendor lock-in risk', 'Learning curve'],
    languages: ['SQL', 'JavaScript'],
    frameworks: ['Works with all'],
    integrations: ['Vercel', 'Netlify', 'All frameworks'],
    url: 'https://supabase.com',
    affiliateUrl: 'https://supabase.com/partners?ref=smartpromptiq',
    affiliateProgram: 'https://supabase.com/partners',
    bestFor: ['MVPs', 'Real-time Apps', 'Auth'],
    userReviews: [
      { user: 'Jason T.', rating: 5, text: 'Best backend for indie hackers.' },
      { user: 'Amy R.', rating: 5, text: 'Supabase + Next.js is unstoppable.' },
    ],
    lastUpdated: '2024-01-14',
    founded: '2020',
    isVerified: true,
    isFeatured: true,
    commission: '20% recurring',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'hostinger',
    name: 'Hostinger',
    tagline: 'Affordable premium hosting',
    description: 'Premium web hosting at affordable prices. Great for WordPress, VPS, and domain registration.',
    logo: '🏠',
    color: 'from-purple-500 to-indigo-500',
    category: 'deployment',
    subcategory: 'Web Hosting',
    rating: 4.6,
    totalReviews: 200000,
    monthlyUsers: '30M+',
    pricing: { free: false, paid: '$2.99/mo' },
    features: ['Web Hosting', 'VPS', 'WordPress', 'Domain Names', 'SSL', 'Email'],
    pros: ['Very affordable', 'Great for beginners', 'Fast support'],
    cons: ['Basic features', 'Upsells'],
    languages: ['PHP', 'Python', 'Node.js'],
    frameworks: ['WordPress', 'Laravel', 'Django'],
    integrations: ['WordPress', 'Cloudflare'],
    url: 'https://www.hostinger.com',
    affiliateUrl: 'https://www.hostinger.com/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://www.hostinger.com/affiliates',
    bestFor: ['Beginners', 'WordPress Sites', 'Small Businesses'],
    userReviews: [
      { user: 'Blogger Jane', rating: 5, text: 'Best budget hosting.' },
      { user: 'Small Biz', rating: 4, text: 'Great value for money.' },
    ],
    lastUpdated: '2024-01-14',
    founded: '2004',
    isVerified: true,
    isFeatured: false,
    commission: 'Up to 60%',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'cloudways',
    name: 'Cloudways',
    tagline: 'Managed hosting - $125/sale',
    description: 'Managed cloud hosting on AWS, GCP, DO. Strong affiliate program pays $125 per sale!',
    logo: '☁️',
    color: 'from-teal-500 to-cyan-500',
    category: 'deployment',
    subcategory: 'Managed Hosting',
    rating: 4.7,
    totalReviews: 50000,
    monthlyUsers: '500K+',
    pricing: { free: false, paid: '$14/mo' },
    features: ['Managed Hosting', 'Multi-cloud', 'Auto-scaling', '24/7 Support', 'CDN', 'Backups'],
    pros: ['Managed service', 'Multiple clouds', 'Great support'],
    cons: ['No free tier', 'Complex for beginners'],
    languages: ['PHP', 'Node.js', 'Python'],
    frameworks: ['WordPress', 'Laravel', 'Magento'],
    integrations: ['AWS', 'GCP', 'DigitalOcean', 'Vultr'],
    url: 'https://www.cloudways.com',
    affiliateUrl: 'https://www.cloudways.com/en/affiliate.php?ref=smartpromptiq',
    affiliateProgram: 'https://www.cloudways.com/en/affiliate.php',
    bestFor: ['Agencies', 'Growing Businesses', 'WordPress'],
    userReviews: [
      { user: 'Agency Owner', rating: 5, text: 'Perfect for client sites.' },
      { user: 'WP Developer', rating: 5, text: 'Best managed WordPress.' },
    ],
    lastUpdated: '2024-01-13',
    founded: '2012',
    isVerified: true,
    isFeatured: false,
    commission: '$125/sale',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'railway',
    name: 'Railway',
    tagline: 'Infrastructure made simple',
    description: 'Deploy apps and databases with automatic scaling. Referral program gives credits.',
    logo: '🚂',
    color: 'from-purple-600 to-indigo-600',
    category: 'deployment',
    subcategory: 'Full-Stack Hosting',
    rating: 4.7,
    totalReviews: 20000,
    monthlyUsers: '500K+',
    pricing: { free: true, paid: '$5/mo' },
    features: ['Auto Deploy', 'Databases', 'Cron Jobs', 'Secrets', 'Teams', 'Metrics'],
    pros: ['Easy databases', 'Fair pricing', 'Great support'],
    cons: ['Smaller community', 'Less mature'],
    languages: ['All'],
    frameworks: ['All'],
    integrations: ['GitHub', 'Docker'],
    url: 'https://railway.app',
    affiliateUrl: 'https://railway.app?referralCode=smartpromptiq',
    affiliateProgram: 'https://railway.app/account/referrals',
    bestFor: ['Backend APIs', 'Full-Stack Apps', 'Databases'],
    userReviews: [
      { user: 'Kevin L.', rating: 5, text: 'Railway makes DevOps easy.' },
      { user: 'Sarah M.', rating: 4, text: 'Great for small projects.' },
    ],
    lastUpdated: '2024-01-09',
    founded: '2020',
    isVerified: true,
    isFeatured: false,
    commission: '$5 credits',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'render',
    name: 'Render',
    tagline: 'Cloud for the modern age',
    description: 'Modern cloud platform for developers. Referral program with credit incentives.',
    logo: '🎨',
    color: 'from-emerald-500 to-teal-500',
    category: 'deployment',
    subcategory: 'Cloud Platform',
    rating: 4.6,
    totalReviews: 25000,
    monthlyUsers: '500K+',
    pricing: { free: true, paid: '$7/mo' },
    features: ['Static Sites', 'Web Services', 'Databases', 'Cron Jobs', 'Blueprints'],
    pros: ['Easy to use', 'Good free tier', 'Modern stack'],
    cons: ['Newer platform', 'Fewer features'],
    languages: ['All'],
    frameworks: ['All'],
    integrations: ['GitHub', 'GitLab', 'Docker'],
    url: 'https://render.com',
    affiliateUrl: 'https://render.com?ref=smartpromptiq',
    bestFor: ['Startups', 'Side Projects', 'APIs'],
    userReviews: [
      { user: 'Indie Dev', rating: 5, text: 'Perfect Heroku replacement.' },
      { user: 'Startup CTO', rating: 4, text: 'Great for early stage.' },
    ],
    lastUpdated: '2024-01-12',
    founded: '2018',
    isVerified: true,
    isFeatured: false,
    commission: 'Credits',
    hasVerifiedAffiliate: true,
  },
  // === NO-CODE PLATFORMS ===
  {
    id: 'base44',
    name: 'Base44',
    tagline: 'AI-powered no-code in minutes',
    description: 'Build fully-functional apps in minutes with AI. No coding necessary. The fastest way to turn ideas into production apps.',
    logo: '🔷',
    color: 'from-blue-600 to-cyan-500',
    category: 'no-code',
    subcategory: 'AI No-Code',
    rating: 4.8,
    totalReviews: 8500,
    monthlyUsers: '150K+',
    pricing: { free: true, paid: '$29/mo' },
    features: ['AI App Generation', 'Visual Editor', 'Database', 'Authentication', 'API Integrations', 'Custom Domains', 'LLM Integration'],
    pros: ['Super fast AI generation', 'Great for MVPs', 'Built-in AI features', 'Easy to learn'],
    cons: ['Newer platform', 'Smaller community'],
    languages: ['Visual', 'AI Prompts'],
    frameworks: ['Proprietary'],
    integrations: ['OpenAI', 'Stripe', 'Zapier', 'Webhooks', 'REST APIs'],
    url: 'https://base44.com',
    affiliateUrl: 'https://base44.com/?ref=smartpromptiq',
    affiliateProgram: 'https://base44.com/affiliates',
    bestFor: ['AI-Powered Apps', 'MVPs', 'Internal Tools', 'Startups'],
    userReviews: [
      { user: 'Startup Steve', rating: 5, text: 'Built my app in 30 minutes with AI!' },
      { user: 'Indie Maker', rating: 5, text: 'Best AI no-code tool available.' },
    ],
    lastUpdated: '2024-12-01',
    founded: '2023',
    isVerified: true,
    isFeatured: true,
    commission: '20% for 6 months',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'bubble',
    name: 'Bubble',
    tagline: 'Most powerful no-code platform - 35% recurring',
    description: 'Build fully functional web applications without code. Visual programming for complex apps.',
    logo: '🫧',
    color: 'from-blue-500 to-indigo-500',
    category: 'no-code',
    subcategory: 'Full-Stack',
    rating: 4.6,
    totalReviews: 45000,
    monthlyUsers: '2M+',
    pricing: { free: true, paid: '$29/mo' },
    features: ['Visual Editor', 'Database', 'Workflows', 'Plugins', 'API Connector'],
    pros: ['Very powerful', 'Large community', 'Mature platform'],
    cons: ['Steep learning curve', 'Can be slow'],
    languages: ['Visual'],
    frameworks: ['Proprietary'],
    integrations: ['Stripe', 'Zapier', 'APIs'],
    url: 'https://bubble.io',
    affiliateUrl: 'https://bubble.io/?ref=smartpromptiq',
    affiliateProgram: 'https://bubble.io/affiliates',
    bestFor: ['Complex Apps', 'Marketplaces', 'SaaS'],
    userReviews: [
      { user: 'David P.', rating: 5, text: 'Built a $1M ARR SaaS on Bubble.' },
      { user: 'Lisa W.', rating: 4, text: 'Powerful but takes time.' },
    ],
    lastUpdated: '2024-01-08',
    founded: '2012',
    isVerified: true,
    isFeatured: true,
    commission: '35% recurring',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'flutterflow',
    name: 'FlutterFlow',
    tagline: 'Visual app builder for Flutter',
    description: 'Build beautiful, native mobile apps visually using Flutter. Export clean code or deploy directly.',
    logo: '🦋',
    color: 'from-blue-400 to-purple-500',
    category: 'no-code',
    subcategory: 'Mobile Apps',
    rating: 4.7,
    totalReviews: 25000,
    monthlyUsers: '500K+',
    pricing: { free: true, paid: '$30/mo' },
    features: ['Flutter/Dart', 'Visual Builder', 'Firebase Integration', 'Code Export', 'Custom Functions', 'API Integration'],
    pros: ['Native mobile apps', 'Clean code export', 'Growing fast'],
    cons: ['Mobile focused', 'Learning curve'],
    languages: ['Visual', 'Dart'],
    frameworks: ['Flutter'],
    integrations: ['Firebase', 'Supabase', 'REST APIs', 'Stripe'],
    url: 'https://flutterflow.io',
    affiliateUrl: 'https://flutterflow.io',
    affiliateProgram: 'https://www.flutterflow.io/partner',
    bestFor: ['Mobile Apps', 'Cross-Platform', 'Startups'],
    userReviews: [
      { user: 'Mobile Dev', rating: 5, text: 'Finally, visual Flutter development!' },
      { user: 'Agency Owner', rating: 5, text: 'Cut our mobile dev time by 70%.' },
    ],
    lastUpdated: '2024-11-15',
    founded: '2020',
    isVerified: true,
    isFeatured: true,
    commission: 'Partner Program',
    hasVerifiedAffiliate: false,
  },
  {
    id: 'adalo',
    name: 'Adalo',
    tagline: 'No-code mobile & web apps - 20% for 12mo',
    description: 'Build custom mobile and web apps without code. Drag-and-drop simplicity with powerful features.',
    logo: '📱',
    color: 'from-purple-500 to-pink-500',
    category: 'no-code',
    subcategory: 'Mobile Apps',
    rating: 4.5,
    totalReviews: 18000,
    monthlyUsers: '300K+',
    pricing: { free: true, paid: '$45/mo' },
    features: ['Drag & Drop', 'Native Apps', 'Database', 'Actions', 'Marketplace', 'Custom Components'],
    pros: ['Easy to learn', 'Native iOS/Android', 'Good templates'],
    cons: ['Limited customization', 'Performance issues'],
    languages: ['Visual'],
    frameworks: ['Proprietary'],
    integrations: ['Zapier', 'Stripe', 'Airtable', 'APIs'],
    url: 'https://adalo.com',
    affiliateUrl: 'https://adalo.com/?ref=smartpromptiq',
    affiliateProgram: 'https://help.adalo.com/resources/adalo-affiliate-program',
    bestFor: ['Mobile Apps', 'Prototypes', 'Small Business'],
    userReviews: [
      { user: 'App Maker', rating: 5, text: 'Launched my app store app in a week!' },
      { user: 'Entrepreneur', rating: 4, text: 'Great for testing ideas.' },
    ],
    lastUpdated: '2024-10-20',
    founded: '2018',
    isVerified: true,
    isFeatured: false,
    commission: '20% for 12 months',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'softr',
    name: 'Softr',
    tagline: 'Turn Airtable into apps - 25% for 12mo',
    description: 'Build powerful web apps and client portals on top of Airtable or Google Sheets. No code required.',
    logo: '🧩',
    color: 'from-indigo-500 to-blue-600',
    category: 'no-code',
    subcategory: 'Web Apps',
    rating: 4.6,
    totalReviews: 12000,
    monthlyUsers: '200K+',
    pricing: { free: true, paid: '$49/mo' },
    features: ['Airtable Integration', 'User Auth', 'Client Portals', 'Memberships', 'Custom Domains', 'Templates'],
    pros: ['Great Airtable integration', 'Fast setup', 'Good templates'],
    cons: ['Airtable dependent', 'Limited offline'],
    languages: ['Visual'],
    frameworks: ['Proprietary'],
    integrations: ['Airtable', 'Google Sheets', 'Stripe', 'Zapier'],
    url: 'https://softr.io',
    affiliateUrl: 'https://softr.io/?ref=smartpromptiq',
    affiliateProgram: 'https://www.softr.io/affiliate',
    bestFor: ['Client Portals', 'Internal Tools', 'Directories'],
    userReviews: [
      { user: 'Agency Pro', rating: 5, text: 'Perfect for client portals!' },
      { user: 'Airtable Fan', rating: 5, text: 'Makes Airtable 10x more powerful.' },
    ],
    lastUpdated: '2024-11-01',
    founded: '2019',
    isVerified: true,
    isFeatured: false,
    commission: '25% for 12 months',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'glide',
    name: 'Glide',
    tagline: 'Apps from spreadsheets - 20% for 12mo',
    description: 'Create powerful apps from Google Sheets or Excel. Perfect for internal tools and simple apps.',
    logo: '✨',
    color: 'from-blue-500 to-teal-500',
    category: 'no-code',
    subcategory: 'Web Apps',
    rating: 4.5,
    totalReviews: 15000,
    monthlyUsers: '250K+',
    pricing: { free: true, paid: '$25/mo' },
    features: ['Spreadsheet Backend', 'Templates', 'Actions', 'Computed Columns', 'User Roles', 'PWA'],
    pros: ['Super easy', 'Spreadsheet power users', 'Good free tier'],
    cons: ['Limited complexity', 'Spreadsheet dependent'],
    languages: ['Visual'],
    frameworks: ['Proprietary'],
    integrations: ['Google Sheets', 'Excel', 'Zapier', 'APIs'],
    url: 'https://glideapps.com',
    affiliateUrl: 'https://glideapps.com/?ref=smartpromptiq',
    affiliateProgram: 'https://www.glideapps.com/affiliates',
    bestFor: ['Internal Tools', 'Simple Apps', 'Directories'],
    userReviews: [
      { user: 'Ops Manager', rating: 5, text: 'Built our internal tool in a day!' },
      { user: 'Small Biz', rating: 4, text: 'Perfect for simple needs.' },
    ],
    lastUpdated: '2024-10-15',
    founded: '2018',
    isVerified: true,
    isFeatured: false,
    commission: '20% for 12 months',
    hasVerifiedAffiliate: true,
  },
  {
    id: 'bravo-studio',
    name: 'Bravo Studio',
    tagline: 'Turn Figma designs into apps',
    description: 'Transform your Figma designs into fully functional native iOS and Android apps. Design-first approach.',
    logo: '🎬',
    color: 'from-orange-500 to-red-500',
    category: 'no-code',
    subcategory: 'Mobile Apps',
    rating: 4.4,
    totalReviews: 8000,
    monthlyUsers: '100K+',
    pricing: { free: true, paid: '$19/mo' },
    features: ['Figma Import', 'Native Apps', 'API Integration', 'Backend Connection', 'App Store Deploy'],
    pros: ['Designer friendly', 'Figma integration', 'Native performance'],
    cons: ['Design-dependent', 'Limited logic'],
    languages: ['Visual'],
    frameworks: ['Proprietary'],
    integrations: ['Figma', 'REST APIs', 'Firebase', 'Airtable'],
    url: 'https://bravostudio.app',
    affiliateUrl: 'https://bravostudio.app',
    affiliateProgram: 'https://www.bravostudio.app/solutions-partners',
    bestFor: ['Designers', 'Figma Users', 'Mobile Apps'],
    userReviews: [
      { user: 'UI Designer', rating: 5, text: 'My Figma designs come to life!' },
      { user: 'Product Designer', rating: 4, text: 'Great for design-first teams.' },
    ],
    lastUpdated: '2024-09-20',
    founded: '2019',
    isVerified: true,
    isFeatured: false,
    commission: 'Partner Program',
    hasVerifiedAffiliate: false,
  },
  {
    id: 'wized',
    name: 'Wized',
    tagline: 'Add logic to Webflow sites',
    description: 'Transform Webflow into a full web application with dynamic data, user auth, and complex logic.',
    logo: '🔧',
    color: 'from-emerald-500 to-teal-600',
    category: 'no-code',
    subcategory: 'Web Apps',
    rating: 4.5,
    totalReviews: 5000,
    monthlyUsers: '50K+',
    pricing: { free: true, paid: '$19/mo' },
    features: ['Webflow Integration', 'Dynamic Data', 'User Auth', 'API Connections', 'Logic Builder'],
    pros: ['Extends Webflow', 'Good for apps', 'Clean integration'],
    cons: ['Webflow required', 'Learning curve'],
    languages: ['Visual'],
    frameworks: ['Webflow Extension'],
    integrations: ['Webflow', 'Xano', 'Airtable', 'APIs'],
    url: 'https://wized.com',
    affiliateUrl: 'https://wized.com',
    bestFor: ['Webflow Users', 'Web Apps', 'SaaS'],
    userReviews: [
      { user: 'Webflow Dev', rating: 5, text: 'Makes Webflow actually useful for apps!' },
      { user: 'No-Coder', rating: 4, text: 'Great combo with Webflow.' },
    ],
    lastUpdated: '2024-08-15',
    founded: '2020',
    isVerified: true,
    isFeatured: false,
    commission: null,
    hasVerifiedAffiliate: false,
  },
  {
    id: 'webflow',
    name: 'Webflow',
    tagline: 'Visual web development - 50% first year',
    description: 'Design and build professional websites visually. Great for designers who want code-quality output.',
    logo: '🌊',
    color: 'from-blue-600 to-violet-600',
    category: 'no-code',
    subcategory: 'Websites',
    rating: 4.7,
    totalReviews: 50000,
    monthlyUsers: '3M+',
    pricing: { free: true, paid: '$14/mo' },
    features: ['Visual Designer', 'CMS', 'E-commerce', 'Interactions', 'Hosting'],
    pros: ['Professional output', 'Great for agencies', 'Clean code'],
    cons: ['Expensive scaling', 'Limited logic'],
    languages: ['Visual'],
    frameworks: ['Proprietary'],
    integrations: ['Zapier', 'Mailchimp', 'HubSpot'],
    url: 'https://webflow.com',
    affiliateUrl: 'https://webflow.com/?ref=smartpromptiq',
    affiliateProgram: 'https://webflow.com/solutions/affiliates',
    bestFor: ['Marketing Sites', 'Portfolios', 'Blogs'],
    userReviews: [
      { user: 'Rachel G.', rating: 5, text: 'Best for marketing sites.' },
      { user: 'Tom B.', rating: 4, text: 'Great design, limited logic.' },
    ],
    lastUpdated: '2024-01-05',
    founded: '2013',
    isVerified: true,
    isFeatured: true,
    commission: '50% first year',
    hasVerifiedAffiliate: true,
  },
  // === OTHER PLATFORMS ===
  {
    id: 'netlify',
    name: 'Netlify',
    tagline: 'Build and deploy modern web',
    description: 'All-in-one platform for automating modern web projects. Continuous deployment and serverless.',
    logo: '🌐',
    color: 'from-teal-400 to-cyan-500',
    category: 'deployment',
    subcategory: 'Frontend Hosting',
    rating: 4.7,
    totalReviews: 80000,
    monthlyUsers: '3M+',
    pricing: { free: true, paid: '$19/mo' },
    features: ['CI/CD', 'Serverless functions', 'Forms', 'Split testing'],
    pros: ['Great free tier', 'Easy setup', 'Good DX'],
    cons: ['Can get expensive', 'Some limitations'],
    languages: ['JavaScript', 'TypeScript'],
    frameworks: ['React', 'Vue', 'Next.js', 'Gatsby'],
    integrations: ['GitHub', 'GitLab', 'Bitbucket'],
    url: 'https://www.netlify.com',
    affiliateUrl: 'https://www.netlify.com',
    bestFor: ['Static Sites', 'Jamstack', 'Frontend'],
    userReviews: [
      { user: 'Dev Chris', rating: 5, text: 'Love the free tier.' },
      { user: 'Agency Mike', rating: 4, text: 'Great for client sites.' },
    ],
    lastUpdated: '2024-01-10',
    founded: '2014',
    isVerified: true,
    isFeatured: false,
    commission: null,
    hasVerifiedAffiliate: false,
  },
  {
    id: 'firebase',
    name: 'Firebase',
    tagline: "Google's app platform",
    description: "Build and run apps with Google's mobile and web development platform.",
    logo: '🔥',
    color: 'from-yellow-500 to-orange-600',
    category: 'backend',
    subcategory: 'BaaS',
    rating: 4.6,
    totalReviews: 120000,
    monthlyUsers: '5M+',
    pricing: { free: true, paid: 'Pay as you go' },
    features: ['Realtime DB', 'Auth', 'Hosting', 'Cloud Functions', 'Analytics'],
    pros: ['Google backed', 'Great docs', 'Generous free tier'],
    cons: ['Vendor lock-in', 'Can get expensive'],
    languages: ['JavaScript', 'iOS', 'Android'],
    frameworks: ['React', 'Flutter', 'Native'],
    integrations: ['Google Cloud', 'BigQuery'],
    url: 'https://firebase.google.com',
    affiliateUrl: 'https://firebase.google.com',
    bestFor: ['Mobile Apps', 'Real-time Apps', 'Startups'],
    userReviews: [
      { user: 'Mobile Dev', rating: 5, text: 'Essential for mobile.' },
      { user: 'Startup Founder', rating: 4, text: 'Great to start.' },
    ],
    lastUpdated: '2024-01-08',
    founded: '2012',
    isVerified: true,
    isFeatured: false,
    commission: null,
    hasVerifiedAffiliate: false,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Globe, count: BUILDERS_DIRECTORY.length },
  { id: 'ai-builder', name: 'AI Builders', icon: Sparkles, count: 3 },
  { id: 'ai-ide', name: 'AI IDEs', icon: Code, count: 2 },
  { id: 'no-code', name: 'No-Code', icon: Palette, count: 10 },
  { id: 'deployment', name: 'Deployment', icon: Cloud, count: 2 },
  { id: 'backend', name: 'Backend', icon: Database, count: 1 },
];

export default function AppBuilderMarketplace() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  const [selectedBuilder, setSelectedBuilder] = useState<typeof BUILDERS_DIRECTORY[0] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredBuilders = BUILDERS_DIRECTORY
    .filter(builder => {
      const matchesCategory = selectedCategory === 'all' || builder.category === selectedCategory;
      const matchesSearch =
        builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        builder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        builder.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
      return a.name.localeCompare(b.name);
    });

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleVisit = (builder: typeof BUILDERS_DIRECTORY[0]) => {
    // Track affiliate click
    console.log(`Affiliate click: ${builder.id}`);
    window.open(builder.affiliateUrl, '_blank');
  };

  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      {/* Page Header with Back Navigation */}
      <div className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 backdrop-blur-xl sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Breadcrumb & Back Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/dashboard')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-purple-400">
                  <Home className="w-4 h-4" />
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-white font-medium">App Builders</span>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link href="/playground">
                <Button variant="outline" size="sm" className="border-indigo-200 dark:border-purple-500/30 text-indigo-600 dark:text-purple-400">
                  <Play className="w-4 h-4 mr-2" />
                  Playground
                </Button>
              </Link>
              <Link href="/deployment-hub">
                <Button variant="outline" size="sm" className="border-indigo-200 dark:border-purple-500/30 text-indigo-600 dark:text-purple-400">
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Hub
                </Button>
              </Link>
            </div>
          </div>

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    App Builder Marketplace
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Compare {BUILDERS_DIRECTORY.length}+ platforms to build and deploy your apps
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search builders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-white/10 border-gray-200 dark:border-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'
                  }
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {category.name}
                  <Badge variant="outline" className="ml-2 text-xs bg-white/20 dark:bg-white/10">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="rating">Sort by Rating</option>
              <option value="reviews">Sort by Reviews</option>
              <option value="name">Sort by Name</option>
            </select>
            <div className="flex border border-gray-200 dark:border-white/10 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Showing {filteredBuilders.length} of {BUILDERS_DIRECTORY.length} platforms
        </p>

        {/* Builders Grid/List */}
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }>
          {filteredBuilders.map((builder, index) => (
            <div key={builder.id}>
              <Card className={`bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-purple-500/50 hover:shadow-lg transition-all overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
                {/* Gradient Top Bar */}
                <div className={`h-1 bg-gradient-to-r ${builder.color}`} />

                <CardContent className={`p-6 ${viewMode === 'list' ? 'flex-1 flex gap-6' : ''}`}>
                  {/* Header */}
                  <div className={viewMode === 'list' ? 'flex-shrink-0 w-48' : ''}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${builder.color} flex items-center justify-center text-2xl`}>
                          {builder.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{builder.name}</h3>
                            {builder.isVerified && (
                              <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            )}
                            {builder.hasVerifiedAffiliate && (
                              <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30 text-xs">
                                <CheckCircle className="w-3 h-3 mr-0.5" />
                                Partner
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{builder.subcategory}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(builder.id)}
                        className="p-1"
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(builder.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`} />
                      </button>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(builder.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{builder.rating}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({builder.totalReviews.toLocaleString()})</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{builder.tagline}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {builder.features.slice(0, 4).map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10">
                          {feature}
                        </Badge>
                      ))}
                      {builder.features.length > 4 && (
                        <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10">
                          +{builder.features.length - 4} more
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2">
                        <Users className="w-4 h-4 mx-auto text-blue-500 dark:text-blue-400 mb-1" />
                        <p className="text-xs text-gray-900 dark:text-white font-medium">{builder.monthlyUsers}</p>
                        <p className="text-xs text-gray-500">Users</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2">
                        <DollarSign className="w-4 h-4 mx-auto text-green-500 dark:text-green-400 mb-1" />
                        <p className="text-xs text-gray-900 dark:text-white font-medium">{builder.pricing.free ? 'Free' : builder.pricing.paid}</p>
                        <p className="text-xs text-gray-500">Start</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-2">
                        <TrendingUp className="w-4 h-4 mx-auto text-purple-500 dark:text-purple-400 mb-1" />
                        <p className="text-xs text-gray-900 dark:text-white font-medium">{builder.founded}</p>
                        <p className="text-xs text-gray-500">Founded</p>
                      </div>
                    </div>

                    {/* Best For */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Best for:</p>
                      <div className="flex flex-wrap gap-1">
                        {builder.bestFor.map((use, i) => (
                          <span key={i} className="text-xs text-indigo-600 dark:text-purple-400">
                            {use}{i < builder.bestFor.length - 1 ? ' • ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVisit(builder)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-600 dark:to-pink-600 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white"
                      >
                        Visit Site
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedBuilder(builder)}
                        className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10"
                      >
                        <BookOpen className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBuilders.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16">
          <Card className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-purple-500/20 dark:to-pink-500/20 border-indigo-200 dark:border-purple-500/30">
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 mx-auto text-yellow-500 dark:text-yellow-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Have a Prompt Ready?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Test your prompt in our Playground, then deploy it directly to any of these platforms.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-600 dark:to-pink-600 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-pink-700 text-white"
                  onClick={() => window.location.href = '/playground'}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Open Playground
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white dark:bg-white/5 border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10"
                  onClick={() => window.location.href = '/deployment-hub'}
                >
                  <Cloud className="w-5 h-5 mr-2" />
                  Deployment Hub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
