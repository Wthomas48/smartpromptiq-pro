import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Rocket,
  ExternalLink,
  Star,
  Zap,
  Code,
  Globe,
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle,
  Copy,
  Play,
  DollarSign,
  Users,
  Clock,
  Shield,
  Cpu,
  Palette,
  Database,
  Cloud,
  Gift,
  Crown,
  TrendingUp,
  ArrowLeft,
  Home,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import DeploymentModal from '@/components/DeploymentModal';

// ALL platforms - with affiliate status clearly marked
// Platforms with hasVerifiedAffiliate: true have verified affiliate/partner programs
const APP_BUILDERS = [
  // === AI-POWERED BUILDERS ===
  {
    id: 'bolt',
    name: 'Bolt.new',
    tagline: 'Build full-stack apps in seconds',
    description: 'AI-powered development environment that turns prompts into production-ready applications with built-in hosting.',
    logo: '⚡',
    color: 'from-yellow-500 to-orange-500',
    rating: 4.9,
    reviews: 12500,
    pricing: { free: true, starter: 20, pro: 50 },
    features: ['Full-stack apps', 'Instant preview', 'One-click deploy', 'AI debugging'],
    bestFor: ['Rapid prototyping', 'MVPs', 'Full-stack apps'],
    url: 'https://bolt.new',
    affiliateUrl: 'https://bolt.new',
    category: 'full-stack',
    deployTime: '< 30 seconds',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'],
    isPromoted: true,
    commission: null,
    hasVerifiedAffiliate: false
  },
  {
    id: 'lovable',
    name: 'Lovable.dev',
    tagline: 'Turn ideas into beautiful apps',
    description: 'Create stunning web applications from natural language. Perfect for designers and non-technical founders.',
    logo: '💜',
    color: 'from-purple-500 to-pink-500',
    rating: 4.8,
    reviews: 8900,
    pricing: { free: true, starter: 25, pro: 75 },
    features: ['Beautiful UI', 'Component library', 'Real-time collaboration', 'Export code'],
    bestFor: ['Landing pages', 'SaaS apps', 'Design-focused projects'],
    url: 'https://lovable.dev',
    affiliateUrl: 'https://lovable.dev',
    category: 'frontend',
    deployTime: '< 1 minute',
    techStack: ['React', 'TypeScript', 'Tailwind', 'Supabase'],
    isPromoted: true,
    commission: null,
    hasVerifiedAffiliate: false
  },
  {
    id: 'v0',
    name: 'v0.dev',
    tagline: 'Generate UI with AI',
    description: "Vercel's AI-powered UI generator. Create beautiful React components from text descriptions.",
    logo: '▲',
    color: 'from-gray-600 to-gray-800',
    rating: 4.8,
    reviews: 15000,
    pricing: { free: true, starter: 10, pro: 30 },
    features: ['React components', 'shadcn/ui', 'Copy code', 'Iterate designs'],
    bestFor: ['UI components', 'Design systems', 'React developers'],
    url: 'https://v0.dev',
    affiliateUrl: 'https://v0.dev',
    category: 'frontend',
    deployTime: 'Instant',
    techStack: ['React', 'Tailwind', 'shadcn/ui'],
    isPromoted: true,
    commission: null,
    hasVerifiedAffiliate: false
  },
  {
    id: 'cursor',
    name: 'Cursor',
    tagline: 'The AI-first code editor',
    description: 'VS Code fork with powerful AI capabilities. Write, edit, and understand code with AI assistance.',
    logo: '🖱️',
    color: 'from-blue-500 to-cyan-500',
    rating: 4.9,
    reviews: 25000,
    pricing: { free: true, starter: 20, pro: 40 },
    features: ['AI autocomplete', 'Chat with codebase', 'Multi-file edits', 'VS Code compatible'],
    bestFor: ['Professional developers', 'Large codebases', 'Refactoring'],
    url: 'https://cursor.sh',
    affiliateUrl: 'https://cursor.sh',
    category: 'ide',
    deployTime: 'N/A',
    techStack: ['All languages', 'All frameworks'],
    isPromoted: true,
    commission: null,
    hasVerifiedAffiliate: false
  },
  // === PLATFORMS WITH VERIFIED AFFILIATE PROGRAMS (Revenue Generating!) ===
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    tagline: 'Simple cloud hosting',
    description: 'Developer-friendly cloud infrastructure with Droplets, App Platform, and managed databases.',
    logo: '🌊',
    color: 'from-blue-500 to-blue-600',
    rating: 4.8,
    reviews: 150000,
    pricing: { free: false, starter: 5, pro: 'Custom' },
    features: ['Droplets', 'App Platform', 'Managed DBs', 'Kubernetes'],
    bestFor: ['Startups', 'Developers', 'Scalable apps'],
    url: 'https://www.digitalocean.com',
    affiliateUrl: 'https://www.digitalocean.com/?refcode=smartpromptiq',
    affiliateProgram: 'https://www.digitalocean.com/partners/referral-program',
    category: 'deployment',
    deployTime: '< 2 minutes',
    techStack: ['Docker', 'Kubernetes', 'Node.js', 'Python'],
    isPromoted: true,
    commission: '$200/referral',
    hasVerifiedAffiliate: true
  },
  {
    id: 'replit',
    name: 'Replit',
    tagline: 'Code, create, and deploy',
    description: 'Collaborative browser-based IDE with AI assistance. Great for learning and building together.',
    logo: '🔄',
    color: 'from-orange-500 to-red-500',
    rating: 4.7,
    reviews: 50000,
    pricing: { free: true, starter: 7, pro: 20 },
    features: ['Browser IDE', 'Multiplayer coding', 'Ghostwriter AI', 'Deployments'],
    bestFor: ['Learning', 'Collaboration', 'Quick experiments'],
    url: 'https://replit.com',
    affiliateUrl: 'https://replit.com/refer/wthomas19542',
    affiliateProgram: 'https://replit.com/site/affiliates',
    category: 'full-stack',
    deployTime: '< 2 minutes',
    techStack: ['50+ languages', 'Any framework', 'Built-in DB'],
    isPromoted: true,
    commission: '40% rev share',
    hasVerifiedAffiliate: true
  },
  {
    id: 'vercel',
    name: 'Vercel',
    tagline: 'Deploy at the speed of thought',
    description: 'The platform for frontend developers. Deploy with zero configuration from Git.',
    logo: '▲',
    color: 'from-black to-gray-700',
    rating: 4.9,
    reviews: 100000,
    pricing: { free: true, starter: 20, pro: 'Custom' },
    features: ['Git integration', 'Edge functions', 'Analytics', 'Preview deployments'],
    bestFor: ['Next.js', 'Static sites', 'Serverless'],
    url: 'https://vercel.com',
    affiliateUrl: 'https://vercel.com/partners?ref=smartpromptiq',
    affiliateProgram: 'https://vercel.com/partners',
    category: 'deployment',
    deployTime: '< 1 minute',
    techStack: ['Next.js', 'React', 'Node.js'],
    isPromoted: true,
    commission: '20% recurring',
    hasVerifiedAffiliate: true
  },
  {
    id: 'railway',
    name: 'Railway',
    tagline: 'Infrastructure made simple',
    description: 'Deploy apps, databases, and more with automatic scaling. No DevOps required.',
    logo: '🚂',
    color: 'from-purple-600 to-indigo-600',
    rating: 4.7,
    reviews: 20000,
    pricing: { free: true, starter: 5, pro: 20 },
    features: ['Auto-scaling', 'Database hosting', 'Cron jobs', 'Team collaboration'],
    bestFor: ['Backend APIs', 'Databases', 'Full applications'],
    url: 'https://railway.app',
    affiliateUrl: 'https://railway.app?referralCode=smartpromptiq',
    affiliateProgram: 'https://railway.app/account/referrals',
    category: 'deployment',
    deployTime: '< 3 minutes',
    techStack: ['Docker', 'PostgreSQL', 'Redis', 'Any language'],
    isPromoted: false,
    commission: '$5 credits',
    hasVerifiedAffiliate: true
  },
  {
    id: 'supabase',
    name: 'Supabase',
    tagline: 'The open source Firebase alternative',
    description: 'Build production-ready backends in minutes with auth, database, storage, and real-time subscriptions.',
    logo: '⚡',
    color: 'from-green-500 to-emerald-600',
    rating: 4.8,
    reviews: 35000,
    pricing: { free: true, starter: 25, pro: 'Custom' },
    features: ['PostgreSQL', 'Authentication', 'Storage', 'Real-time'],
    bestFor: ['Backend services', 'Auth', 'Database'],
    url: 'https://supabase.com',
    affiliateUrl: 'https://supabase.com/partners?ref=smartpromptiq',
    affiliateProgram: 'https://supabase.com/partners',
    category: 'backend',
    deployTime: '< 2 minutes',
    techStack: ['PostgreSQL', 'Auth', 'Storage', 'Edge Functions'],
    isPromoted: true,
    commission: '20% recurring',
    hasVerifiedAffiliate: true
  },
  {
    id: 'hostinger',
    name: 'Hostinger',
    tagline: 'Affordable web hosting',
    description: 'Premium web hosting at affordable prices. Great for beginners and small businesses.',
    logo: '🏠',
    color: 'from-purple-500 to-indigo-500',
    rating: 4.6,
    reviews: 200000,
    pricing: { free: false, starter: 2.99, pro: 9.99 },
    features: ['Web hosting', 'VPS', 'WordPress', 'Domain names'],
    bestFor: ['Beginners', 'WordPress', 'Small businesses'],
    url: 'https://www.hostinger.com',
    affiliateUrl: 'https://www.hostinger.com/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://www.hostinger.com/affiliates',
    category: 'deployment',
    deployTime: '< 5 minutes',
    techStack: ['PHP', 'WordPress', 'Node.js', 'Python'],
    isPromoted: false,
    commission: 'Up to 60%',
    hasVerifiedAffiliate: true
  },
  {
    id: 'cloudways',
    name: 'Cloudways',
    tagline: 'Managed cloud hosting',
    description: 'Managed cloud hosting on AWS, GCP, DigitalOcean. Great for agencies and growing businesses.',
    logo: '☁️',
    color: 'from-teal-500 to-cyan-500',
    rating: 4.7,
    reviews: 50000,
    pricing: { free: false, starter: 14, pro: 'Custom' },
    features: ['Managed hosting', 'Multi-cloud', 'Auto-scaling', '24/7 support'],
    bestFor: ['Agencies', 'Growing businesses', 'WordPress'],
    url: 'https://www.cloudways.com',
    affiliateUrl: 'https://www.cloudways.com/en/affiliate.php?ref=smartpromptiq',
    affiliateProgram: 'https://www.cloudways.com/en/affiliate.php',
    category: 'deployment',
    deployTime: '< 10 minutes',
    techStack: ['PHP', 'Node.js', 'Python', 'WordPress'],
    isPromoted: false,
    commission: '$125/sale',
    hasVerifiedAffiliate: true
  },
  {
    id: 'render',
    name: 'Render',
    tagline: 'Cloud for the modern age',
    description: 'Easy cloud platform for deploying apps, APIs, and databases.',
    logo: '🎨',
    color: 'from-emerald-500 to-teal-500',
    rating: 4.6,
    reviews: 25000,
    pricing: { free: true, starter: 7, pro: 'Custom' },
    features: ['Static sites', 'Web services', 'Databases', 'Cron jobs'],
    bestFor: ['Startups', 'Side projects', 'APIs'],
    url: 'https://render.com',
    affiliateUrl: 'https://render.com?ref=smartpromptiq',
    category: 'deployment',
    deployTime: '< 3 minutes',
    techStack: ['Docker', 'Node.js', 'Python', 'PostgreSQL'],
    isPromoted: false,
    commission: 'Credits',
    hasVerifiedAffiliate: true
  },
  // === OTHER POPULAR PLATFORMS (No affiliate yet) ===
  {
    id: 'netlify',
    name: 'Netlify',
    tagline: 'Build and deploy modern web projects',
    description: 'All-in-one platform for automating modern web projects. Continuous deployment, serverless functions, and more.',
    logo: '🌐',
    color: 'from-teal-400 to-cyan-500',
    rating: 4.7,
    reviews: 80000,
    pricing: { free: true, starter: 19, pro: 'Custom' },
    features: ['CI/CD', 'Serverless functions', 'Forms', 'Split testing'],
    bestFor: ['Static sites', 'Jamstack', 'Frontend projects'],
    url: 'https://www.netlify.com',
    affiliateUrl: 'https://www.netlify.com',
    category: 'deployment',
    deployTime: '< 2 minutes',
    techStack: ['React', 'Vue', 'Next.js', 'Gatsby'],
    isPromoted: false,
    commission: null,
    hasVerifiedAffiliate: false
  },
  {
    id: 'firebase',
    name: 'Firebase',
    tagline: 'Google\'s app development platform',
    description: 'Build and run apps with Google\'s mobile and web app development platform.',
    logo: '🔥',
    color: 'from-yellow-500 to-orange-600',
    rating: 4.6,
    reviews: 120000,
    pricing: { free: true, starter: 'Pay as you go', pro: 'Custom' },
    features: ['Realtime DB', 'Authentication', 'Hosting', 'Cloud Functions'],
    bestFor: ['Mobile apps', 'Real-time apps', 'Startups'],
    url: 'https://firebase.google.com',
    affiliateUrl: 'https://firebase.google.com',
    category: 'backend',
    deployTime: '< 5 minutes',
    techStack: ['JavaScript', 'iOS', 'Android', 'Flutter'],
    isPromoted: false,
    commission: null,
    hasVerifiedAffiliate: false
  },
  {
    id: 'aws-amplify',
    name: 'AWS Amplify',
    tagline: 'Build full-stack apps on AWS',
    description: 'Build full-stack web and mobile apps in hours with AWS services.',
    logo: '📦',
    color: 'from-orange-500 to-yellow-500',
    rating: 4.5,
    reviews: 45000,
    pricing: { free: true, starter: 'Pay as you go', pro: 'Custom' },
    features: ['Hosting', 'Auth', 'API', 'Storage', 'AI/ML'],
    bestFor: ['Enterprise', 'AWS users', 'Full-stack apps'],
    url: 'https://aws.amazon.com/amplify',
    affiliateUrl: 'https://aws.amazon.com/amplify',
    category: 'full-stack',
    deployTime: '< 10 minutes',
    techStack: ['React', 'Vue', 'Angular', 'iOS', 'Android'],
    isPromoted: false,
    commission: null,
    hasVerifiedAffiliate: false
  },
  // === E-COMMERCE & WEBSITE BUILDERS (High Commission!) ===
  {
    id: 'shopify',
    name: 'Shopify',
    tagline: 'The #1 e-commerce platform',
    description: 'Build and scale your online store with the most trusted e-commerce platform. From startup to enterprise.',
    logo: '🛒',
    color: 'from-green-500 to-emerald-600',
    rating: 4.8,
    reviews: 500000,
    pricing: { free: false, starter: 29, pro: 299 },
    features: ['Online store', 'Payment processing', 'Inventory', 'Marketing tools'],
    bestFor: ['E-commerce', 'Online stores', 'Dropshipping'],
    url: 'https://www.shopify.com',
    affiliateUrl: 'https://www.shopify.com/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://www.shopify.com/affiliates',
    category: 'ecommerce',
    deployTime: '< 30 minutes',
    techStack: ['Liquid', 'JavaScript', 'Shopify Apps'],
    isPromoted: true,
    commission: '$150/sale',
    hasVerifiedAffiliate: true
  },
  {
    id: 'webflow',
    name: 'Webflow',
    tagline: 'Build professional sites visually',
    description: 'Visual web development platform for designers. Create responsive websites without code.',
    logo: '🎨',
    color: 'from-blue-500 to-indigo-600',
    rating: 4.7,
    reviews: 75000,
    pricing: { free: true, starter: 14, pro: 39 },
    features: ['Visual editor', 'CMS', 'E-commerce', 'Animations'],
    bestFor: ['Designers', 'Marketing sites', 'Portfolios'],
    url: 'https://webflow.com',
    affiliateUrl: 'https://webflow.com/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://webflow.com/affiliates',
    category: 'frontend',
    deployTime: '< 15 minutes',
    techStack: ['Visual Builder', 'HTML', 'CSS', 'JavaScript'],
    isPromoted: true,
    commission: '50% first year',
    hasVerifiedAffiliate: true
  },
  {
    id: 'wix',
    name: 'Wix',
    tagline: 'Create stunning websites easily',
    description: 'Drag-and-drop website builder with AI tools. Perfect for beginners and small businesses.',
    logo: '✨',
    color: 'from-yellow-500 to-amber-600',
    rating: 4.5,
    reviews: 300000,
    pricing: { free: true, starter: 16, pro: 27 },
    features: ['Drag & drop', 'AI website builder', 'SEO tools', 'Marketing'],
    bestFor: ['Beginners', 'Small business', 'Portfolios'],
    url: 'https://www.wix.com',
    affiliateUrl: 'https://www.wix.com/about/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://www.wix.com/about/affiliates',
    category: 'frontend',
    deployTime: '< 10 minutes',
    techStack: ['Wix Editor', 'Velo (JavaScript)', 'Wix Apps'],
    isPromoted: false,
    commission: '$100/sale',
    hasVerifiedAffiliate: true
  },
  {
    id: 'squarespace',
    name: 'Squarespace',
    tagline: 'Beautiful websites for everyone',
    description: 'Award-winning templates and intuitive editor. Perfect for portfolios, blogs, and businesses.',
    logo: '◼️',
    color: 'from-gray-700 to-gray-900',
    rating: 4.6,
    reviews: 200000,
    pricing: { free: false, starter: 16, pro: 27 },
    features: ['Designer templates', 'E-commerce', 'Blogging', 'Analytics'],
    bestFor: ['Creatives', 'Restaurants', 'Small business'],
    url: 'https://www.squarespace.com',
    affiliateUrl: 'https://www.squarespace.com/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://www.squarespace.com/affiliates',
    category: 'frontend',
    deployTime: '< 20 minutes',
    techStack: ['Squarespace Templates', 'JavaScript', 'CSS'],
    isPromoted: false,
    commission: '$200/sale',
    hasVerifiedAffiliate: true
  },
  // === DATABASE PLATFORMS (High Value!) ===
  {
    id: 'planetscale',
    name: 'PlanetScale',
    tagline: 'Serverless MySQL platform',
    description: 'The MySQL-compatible serverless database with branching and infinite scale.',
    logo: '🌍',
    color: 'from-slate-600 to-slate-800',
    rating: 4.8,
    reviews: 15000,
    pricing: { free: true, starter: 29, pro: 'Custom' },
    features: ['Branching', 'Serverless', 'Auto-scaling', 'Zero downtime'],
    bestFor: ['Startups', 'High-traffic apps', 'CI/CD workflows'],
    url: 'https://planetscale.com',
    affiliateUrl: 'https://planetscale.com/partners?ref=smartpromptiq',
    affiliateProgram: 'https://planetscale.com/partners',
    category: 'backend',
    deployTime: '< 2 minutes',
    techStack: ['MySQL', 'Vitess', 'Any ORM'],
    isPromoted: true,
    commission: '20% recurring',
    hasVerifiedAffiliate: true
  },
  {
    id: 'neon',
    name: 'Neon',
    tagline: 'Serverless Postgres',
    description: 'The serverless Postgres with branching, autoscaling, and generous free tier.',
    logo: '💚',
    color: 'from-green-400 to-emerald-500',
    rating: 4.7,
    reviews: 10000,
    pricing: { free: true, starter: 19, pro: 'Custom' },
    features: ['Branching', 'Autoscaling', 'Point-in-time recovery', 'Generous free tier'],
    bestFor: ['Modern apps', 'Serverless', 'Development'],
    url: 'https://neon.tech',
    affiliateUrl: 'https://neon.tech/partners?ref=smartpromptiq',
    affiliateProgram: 'https://neon.tech/partners',
    category: 'backend',
    deployTime: '< 1 minute',
    techStack: ['PostgreSQL', 'Prisma', 'Drizzle', 'Any language'],
    isPromoted: true,
    commission: '25% recurring',
    hasVerifiedAffiliate: true
  },
  {
    id: 'mongodb-atlas',
    name: 'MongoDB Atlas',
    tagline: 'Cloud database service',
    description: 'Multi-cloud database service with built-in automation and search capabilities.',
    logo: '🍃',
    color: 'from-green-600 to-green-700',
    rating: 4.7,
    reviews: 80000,
    pricing: { free: true, starter: 9, pro: 'Custom' },
    features: ['Multi-cloud', 'Auto-scaling', 'Full-text search', 'Real-time sync'],
    bestFor: ['Document databases', 'Mobile apps', 'Real-time apps'],
    url: 'https://www.mongodb.com/atlas',
    affiliateUrl: 'https://www.mongodb.com/partners?ref=smartpromptiq',
    affiliateProgram: 'https://www.mongodb.com/partners',
    category: 'backend',
    deployTime: '< 5 minutes',
    techStack: ['MongoDB', 'Node.js', 'Python', 'All languages'],
    isPromoted: false,
    commission: '15% recurring',
    hasVerifiedAffiliate: true
  },
  // === ADDITIONAL HOSTING PLATFORMS ===
  {
    id: 'fly',
    name: 'Fly.io',
    tagline: 'Deploy apps globally',
    description: 'Run your apps close to users with edge deployments and built-in Postgres.',
    logo: '✈️',
    color: 'from-purple-500 to-violet-600',
    rating: 4.6,
    reviews: 18000,
    pricing: { free: true, starter: 'Pay as you go', pro: 'Custom' },
    features: ['Edge deployment', 'Built-in Postgres', 'Docker support', 'Auto-scaling'],
    bestFor: ['Global apps', 'Low latency', 'Container apps'],
    url: 'https://fly.io',
    affiliateUrl: 'https://fly.io?ref=smartpromptiq',
    category: 'deployment',
    deployTime: '< 5 minutes',
    techStack: ['Docker', 'Node.js', 'Go', 'Elixir'],
    isPromoted: false,
    commission: 'Credits',
    hasVerifiedAffiliate: true
  },
  {
    id: 'heroku',
    name: 'Heroku',
    tagline: 'Cloud platform for apps',
    description: 'The original PaaS for developers. Simple deployment with powerful add-ons ecosystem.',
    logo: '🟣',
    color: 'from-purple-600 to-indigo-700',
    rating: 4.5,
    reviews: 150000,
    pricing: { free: false, starter: 7, pro: 25 },
    features: ['One-click deploy', 'Add-ons marketplace', 'Auto-scaling', 'CI/CD'],
    bestFor: ['Startups', 'MVPs', 'Side projects'],
    url: 'https://www.heroku.com',
    affiliateUrl: 'https://www.heroku.com?ref=smartpromptiq',
    category: 'deployment',
    deployTime: '< 5 minutes',
    techStack: ['Node.js', 'Python', 'Ruby', 'Java', 'Go'],
    isPromoted: false,
    commission: null,
    hasVerifiedAffiliate: false
  },
  // === AI TOOLS & APIs (Growing Market!) ===
  {
    id: 'openai',
    name: 'OpenAI API',
    tagline: 'GPT-4 & DALL-E APIs',
    description: 'Access GPT-4, DALL-E, Whisper, and more. Build AI-powered applications.',
    logo: '🤖',
    color: 'from-emerald-500 to-teal-600',
    rating: 4.9,
    reviews: 100000,
    pricing: { free: true, starter: 'Pay as you go', pro: 'Custom' },
    features: ['GPT-4', 'DALL-E 3', 'Whisper', 'Embeddings'],
    bestFor: ['AI apps', 'Chatbots', 'Content generation'],
    url: 'https://platform.openai.com',
    affiliateUrl: 'https://platform.openai.com',
    category: 'backend',
    deployTime: 'Instant',
    techStack: ['REST API', 'Python', 'Node.js', 'All languages'],
    isPromoted: true,
    commission: null,
    hasVerifiedAffiliate: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    tagline: 'Safe & helpful AI',
    description: 'Claude API for building safe AI applications. Context windows up to 100K tokens.',
    logo: '🧠',
    color: 'from-amber-500 to-orange-600',
    rating: 4.8,
    reviews: 25000,
    pricing: { free: true, starter: 'Pay as you go', pro: 'Custom' },
    features: ['100K context', 'Safe AI', 'Function calling', 'Vision'],
    bestFor: ['Long documents', 'Enterprise AI', 'Safe applications'],
    url: 'https://www.anthropic.com',
    affiliateUrl: 'https://www.anthropic.com',
    category: 'backend',
    deployTime: 'Instant',
    techStack: ['REST API', 'Python', 'TypeScript'],
    isPromoted: true,
    commission: null,
    hasVerifiedAffiliate: false
  },
  // === MOBILE APP PLATFORMS ===
  {
    id: 'expo',
    name: 'Expo',
    tagline: 'Create universal apps',
    description: 'Build and deploy React Native apps for iOS, Android, and web from a single codebase.',
    logo: '📱',
    color: 'from-slate-700 to-slate-900',
    rating: 4.7,
    reviews: 40000,
    pricing: { free: true, starter: 29, pro: 99 },
    features: ['Cross-platform', 'OTA updates', 'App builds', 'Push notifications'],
    bestFor: ['Mobile apps', 'Cross-platform', 'React Native'],
    url: 'https://expo.dev',
    affiliateUrl: 'https://expo.dev?ref=smartpromptiq',
    category: 'full-stack',
    deployTime: '< 10 minutes',
    techStack: ['React Native', 'TypeScript', 'Expo SDK'],
    isPromoted: false,
    commission: null,
    hasVerifiedAffiliate: false
  },
  {
    id: 'flutterflow',
    name: 'FlutterFlow',
    tagline: 'Build Flutter apps visually',
    description: 'Low-code platform for building beautiful native mobile and web apps with Flutter.',
    logo: '💙',
    color: 'from-blue-400 to-cyan-500',
    rating: 4.6,
    reviews: 15000,
    pricing: { free: true, starter: 30, pro: 70 },
    features: ['Visual builder', 'Flutter export', 'Firebase integration', 'Custom code'],
    bestFor: ['Mobile apps', 'Low-code', 'Rapid prototyping'],
    url: 'https://flutterflow.io',
    affiliateUrl: 'https://flutterflow.io/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://flutterflow.io/affiliates',
    category: 'full-stack',
    deployTime: '< 20 minutes',
    techStack: ['Flutter', 'Dart', 'Firebase'],
    isPromoted: true,
    commission: '30% recurring',
    hasVerifiedAffiliate: true
  },
  // === AUTOMATION & INTEGRATION ===
  {
    id: 'zapier',
    name: 'Zapier',
    tagline: 'Automate your workflows',
    description: 'Connect your apps and automate workflows. 5000+ app integrations.',
    logo: '⚡',
    color: 'from-orange-500 to-red-500',
    rating: 4.7,
    reviews: 100000,
    pricing: { free: true, starter: 19.99, pro: 49 },
    features: ['5000+ apps', 'Multi-step Zaps', 'Webhooks', 'Filters'],
    bestFor: ['Automation', 'Integration', 'No-code workflows'],
    url: 'https://zapier.com',
    affiliateUrl: 'https://zapier.com/platform/partner?ref=smartpromptiq',
    affiliateProgram: 'https://zapier.com/platform/partner',
    category: 'backend',
    deployTime: '< 5 minutes',
    techStack: ['No-code', 'REST APIs', 'Webhooks'],
    isPromoted: true,
    commission: '25% recurring',
    hasVerifiedAffiliate: true
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    tagline: 'Visual automation platform',
    description: 'Visual workflow builder for complex automations. More powerful than Zapier for technical users.',
    logo: '🔗',
    color: 'from-violet-500 to-purple-600',
    rating: 4.6,
    reviews: 50000,
    pricing: { free: true, starter: 9, pro: 29 },
    features: ['Visual builder', 'Complex logic', 'Error handling', 'HTTP modules'],
    bestFor: ['Complex automations', 'Technical users', 'API integrations'],
    url: 'https://www.make.com',
    affiliateUrl: 'https://www.make.com/en/partners?ref=smartpromptiq',
    affiliateProgram: 'https://www.make.com/en/partners',
    category: 'backend',
    deployTime: '< 10 minutes',
    techStack: ['No-code', 'JSON', 'REST APIs'],
    isPromoted: false,
    commission: '25% recurring',
    hasVerifiedAffiliate: true
  },
  // === DOMAIN & EMAIL SERVICES ===
  {
    id: 'namecheap',
    name: 'Namecheap',
    tagline: 'Domain names & hosting',
    description: 'Affordable domain registration, SSL certificates, and web hosting services.',
    logo: '🌐',
    color: 'from-orange-500 to-amber-500',
    rating: 4.6,
    reviews: 250000,
    pricing: { free: false, starter: 8.88, pro: 'Varies' },
    features: ['Domain registration', 'SSL certs', 'Email hosting', 'VPN'],
    bestFor: ['Domains', 'SSL certificates', 'Privacy'],
    url: 'https://www.namecheap.com',
    affiliateUrl: 'https://www.namecheap.com/affiliates?ref=smartpromptiq',
    affiliateProgram: 'https://www.namecheap.com/affiliates',
    category: 'deployment',
    deployTime: 'Instant',
    techStack: ['Domains', 'DNS', 'SSL'],
    isPromoted: false,
    commission: 'Up to 35%',
    hasVerifiedAffiliate: true
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    tagline: 'Security & performance',
    description: 'CDN, DDoS protection, SSL, and serverless workers. Protect and accelerate your apps.',
    logo: '☁️',
    color: 'from-orange-500 to-orange-600',
    rating: 4.8,
    reviews: 180000,
    pricing: { free: true, starter: 20, pro: 200 },
    features: ['CDN', 'DDoS protection', 'SSL', 'Workers (serverless)'],
    bestFor: ['Security', 'Performance', 'Global CDN'],
    url: 'https://www.cloudflare.com',
    affiliateUrl: 'https://www.cloudflare.com/partners?ref=smartpromptiq',
    affiliateProgram: 'https://www.cloudflare.com/partners',
    category: 'deployment',
    deployTime: '< 5 minutes',
    techStack: ['CDN', 'Workers', 'Pages', 'R2 Storage'],
    isPromoted: true,
    commission: '10% recurring',
    hasVerifiedAffiliate: true
  },
  // === NO-CODE PLATFORMS (Great for non-developers!) ===
  {
    id: 'base44',
    name: 'Base44',
    tagline: 'AI-powered no-code in minutes',
    description: 'Build fully-functional apps in minutes with AI. No coding necessary. The fastest way to turn ideas into production apps.',
    logo: '🔷',
    color: 'from-blue-600 to-cyan-500',
    rating: 4.8,
    reviews: 8500,
    pricing: { free: true, starter: 29, pro: 79 },
    features: ['AI App Generation', 'Visual Editor', 'Database', 'Authentication', 'LLM Integration'],
    bestFor: ['AI-Powered Apps', 'MVPs', 'Internal Tools'],
    url: 'https://base44.com',
    affiliateUrl: 'https://base44.com/?ref=smartpromptiq',
    affiliateProgram: 'https://base44.com/affiliates',
    category: 'nocode',
    deployTime: '< 5 minutes',
    techStack: ['Visual', 'AI Prompts', 'OpenAI', 'REST APIs'],
    isPromoted: true,
    commission: '20% for 6 months',
    hasVerifiedAffiliate: true
  },
  {
    id: 'bubble',
    name: 'Bubble',
    tagline: 'Most powerful no-code platform',
    description: 'Build fully functional web applications without code. Visual programming for complex apps.',
    logo: '🫧',
    color: 'from-blue-500 to-indigo-500',
    rating: 4.6,
    reviews: 45000,
    pricing: { free: true, starter: 29, pro: 129 },
    features: ['Visual Editor', 'Database', 'Workflows', 'Plugins', 'API Connector'],
    bestFor: ['Complex Apps', 'Marketplaces', 'SaaS'],
    url: 'https://bubble.io',
    affiliateUrl: 'https://bubble.io/?ref=smartpromptiq',
    affiliateProgram: 'https://bubble.io/affiliates',
    category: 'nocode',
    deployTime: '< 15 minutes',
    techStack: ['Visual', 'Workflows', 'Plugins'],
    isPromoted: true,
    commission: '35% recurring',
    hasVerifiedAffiliate: true
  },
  {
    id: 'flutterflow',
    name: 'FlutterFlow',
    tagline: 'Visual app builder for Flutter',
    description: 'Build beautiful, native mobile apps visually using Flutter. Export clean code or deploy directly.',
    logo: '🦋',
    color: 'from-blue-400 to-purple-500',
    rating: 4.7,
    reviews: 25000,
    pricing: { free: true, starter: 30, pro: 70 },
    features: ['Flutter/Dart', 'Visual Builder', 'Firebase Integration', 'Code Export'],
    bestFor: ['Mobile Apps', 'Cross-Platform', 'Startups'],
    url: 'https://flutterflow.io',
    affiliateUrl: 'https://flutterflow.io',
    affiliateProgram: 'https://www.flutterflow.io/partner',
    category: 'nocode',
    deployTime: '< 10 minutes',
    techStack: ['Flutter', 'Dart', 'Firebase'],
    isPromoted: true,
    commission: 'Partner Program',
    hasVerifiedAffiliate: false
  },
  {
    id: 'adalo',
    name: 'Adalo',
    tagline: 'No-code mobile & web apps',
    description: 'Build custom mobile and web apps without code. Drag-and-drop simplicity with powerful features.',
    logo: '📱',
    color: 'from-purple-500 to-pink-500',
    rating: 4.5,
    reviews: 18000,
    pricing: { free: true, starter: 45, pro: 65 },
    features: ['Drag & Drop', 'Native Apps', 'Database', 'Marketplace'],
    bestFor: ['Mobile Apps', 'Prototypes', 'Small Business'],
    url: 'https://adalo.com',
    affiliateUrl: 'https://adalo.com/?ref=smartpromptiq',
    affiliateProgram: 'https://help.adalo.com/resources/adalo-affiliate-program',
    category: 'nocode',
    deployTime: '< 20 minutes',
    techStack: ['Visual', 'Native iOS/Android'],
    isPromoted: false,
    commission: '20% for 12 months',
    hasVerifiedAffiliate: true
  },
  {
    id: 'softr',
    name: 'Softr',
    tagline: 'Turn Airtable into apps',
    description: 'Build powerful web apps and client portals on top of Airtable or Google Sheets.',
    logo: '🧩',
    color: 'from-indigo-500 to-blue-600',
    rating: 4.6,
    reviews: 12000,
    pricing: { free: true, starter: 49, pro: 139 },
    features: ['Airtable Integration', 'User Auth', 'Client Portals', 'Memberships'],
    bestFor: ['Client Portals', 'Internal Tools', 'Directories'],
    url: 'https://softr.io',
    affiliateUrl: 'https://softr.io/?ref=smartpromptiq',
    affiliateProgram: 'https://www.softr.io/affiliate',
    category: 'nocode',
    deployTime: '< 10 minutes',
    techStack: ['Airtable', 'Google Sheets', 'Visual'],
    isPromoted: false,
    commission: '25% for 12 months',
    hasVerifiedAffiliate: true
  },
  {
    id: 'glide',
    name: 'Glide',
    tagline: 'Apps from spreadsheets',
    description: 'Create powerful apps from Google Sheets or Excel. Perfect for internal tools and simple apps.',
    logo: '✨',
    color: 'from-blue-500 to-teal-500',
    rating: 4.5,
    reviews: 15000,
    pricing: { free: true, starter: 25, pro: 99 },
    features: ['Spreadsheet Backend', 'Templates', 'Actions', 'User Roles'],
    bestFor: ['Internal Tools', 'Simple Apps', 'Directories'],
    url: 'https://glideapps.com',
    affiliateUrl: 'https://glideapps.com/?ref=smartpromptiq',
    affiliateProgram: 'https://www.glideapps.com/affiliates',
    category: 'nocode',
    deployTime: '< 5 minutes',
    techStack: ['Google Sheets', 'Excel', 'Visual'],
    isPromoted: false,
    commission: '20% for 12 months',
    hasVerifiedAffiliate: true
  },
  {
    id: 'bravo-studio',
    name: 'Bravo Studio',
    tagline: 'Turn Figma designs into apps',
    description: 'Transform your Figma designs into fully functional native iOS and Android apps.',
    logo: '🎬',
    color: 'from-orange-500 to-red-500',
    rating: 4.4,
    reviews: 8000,
    pricing: { free: true, starter: 19, pro: 59 },
    features: ['Figma Import', 'Native Apps', 'API Integration', 'Backend Connection'],
    bestFor: ['Designers', 'Figma Users', 'Mobile Apps'],
    url: 'https://bravostudio.app',
    affiliateUrl: 'https://bravostudio.app',
    affiliateProgram: 'https://www.bravostudio.app/solutions-partners',
    category: 'nocode',
    deployTime: '< 15 minutes',
    techStack: ['Figma', 'Native iOS/Android'],
    isPromoted: false,
    commission: 'Partner Program',
    hasVerifiedAffiliate: false
  },
  {
    id: 'wized',
    name: 'Wized',
    tagline: 'Add logic to Webflow',
    description: 'Transform Webflow into a full web application with dynamic data, user auth, and complex logic.',
    logo: '🔧',
    color: 'from-emerald-500 to-teal-600',
    rating: 4.5,
    reviews: 5000,
    pricing: { free: true, starter: 19, pro: 49 },
    features: ['Webflow Integration', 'Dynamic Data', 'User Auth', 'Logic Builder'],
    bestFor: ['Webflow Users', 'Web Apps', 'SaaS'],
    url: 'https://wized.com',
    affiliateUrl: 'https://wized.com',
    category: 'nocode',
    deployTime: '< 10 minutes',
    techStack: ['Webflow', 'Visual Logic'],
    isPromoted: false,
    commission: null,
    hasVerifiedAffiliate: false
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Platforms', icon: Globe },
  { id: 'full-stack', name: 'Full-Stack', icon: Code },
  { id: 'nocode', name: 'No-Code', icon: Sparkles },
  { id: 'frontend', name: 'Frontend & Website', icon: Palette },
  { id: 'backend', name: 'Backend & DB', icon: Database },
  { id: 'deployment', name: 'Hosting', icon: Cloud },
  { id: 'ide', name: 'AI IDEs', icon: Cpu },
  { id: 'ecommerce', name: 'E-Commerce', icon: ShoppingBag },
];

export default function DeploymentHub() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof APP_BUILDERS[0] | null>(null);

  const filteredBuilders = APP_BUILDERS.filter(builder => {
    const matchesCategory = selectedCategory === 'all' || builder.category === selectedCategory;
    const matchesSearch = builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      builder.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeploy = (builder: typeof APP_BUILDERS[0]) => {
    // Track affiliate click (in production, this would be logged)
    console.log(`Affiliate click: ${builder.id}`);

    // Open the deployment modal with step-by-step instructions
    setSelectedPlatform(builder);
    setDeployModalOpen(true);
  };

  const copyPromptForPlatform = (builder: typeof APP_BUILDERS[0]) => {
    const platformPrompt = `Build me a web application using ${builder.techStack.join(', ')}.\n\n[Paste your SmartPromptIQ prompt here]\n\nRequirements:\n- Modern, responsive design\n- Clean code architecture\n- Production-ready`;

    navigator.clipboard.writeText(platformPrompt);
    toast({
      title: 'Prompt template copied!',
      description: `Optimized for ${builder.name}`,
    });
  };

  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-950">
      {/* Header with Back Navigation */}
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
                <span className="text-gray-900 dark:text-white font-medium">Deployment Hub</span>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/playground">
                <Button variant="outline" size="sm" className="border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-purple-400">
                  <Play className="w-4 h-4 mr-2" />
                  Playground
                </Button>
              </Link>
              <Link href="/app-builders">
                <Button variant="outline" size="sm" className="border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-purple-400">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  App Builders
                </Button>
              </Link>
            </div>
          </div>

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Deployment Hub
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Turn prompts into apps - deploy in minutes</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{APP_BUILDERS.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Platforms</p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">1M+</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Apps Deployed</p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-white/10" />
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{"< 5min"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Deploy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Promoted Platforms */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Featured Platforms</h2>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
              Top Rated
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {APP_BUILDERS.filter(b => b.isPromoted).map((builder) => (
              <div key={builder.id} className="transition-transform hover:scale-[1.02]">
                <Card className={`bg-gradient-to-br ${builder.color} bg-opacity-10 border-white/20 overflow-hidden h-full`}>
                  <div className={`h-1 bg-gradient-to-r ${builder.color}`} />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{builder.logo}</span>
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          {builder.name}
                          {builder.hasVerifiedAffiliate && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              <CheckCircle className="w-3 h-3 mr-0.5" />
                              Partner
                            </Badge>
                          )}
                        </h3>
                        <p className="text-xs text-gray-400">{builder.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-white ml-1">{builder.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">({builder.reviews.toLocaleString()} reviews)</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {builder.features.slice(0, 2).map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-white/5">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleDeploy(builder)}
                      className="w-full bg-white/10 hover:bg-white/20"
                    >
                      Deploy Now
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* All Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuilders.map((builder, index) => (
            <div key={builder.id}>
              <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${builder.color} flex items-center justify-center text-2xl`}>
                        {builder.logo}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white flex items-center gap-2 flex-wrap">
                          {builder.name}
                          {builder.isPromoted && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                              Featured
                            </Badge>
                          )}
                          {builder.hasVerifiedAffiliate && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              <CheckCircle className="w-3 h-3 mr-0.5" />
                              Verified Partner
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{builder.tagline}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-400">{builder.description}</p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-sm font-medium text-white">{builder.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span className="text-sm font-medium text-white">{builder.deployTime}</span>
                      </div>
                      <p className="text-xs text-gray-500">Deploy</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-400" />
                        <span className="text-sm font-medium text-white">
                          {builder.pricing.free ? 'Free' : `$${builder.pricing.starter}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Start</p>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Tech Stack:</p>
                    <div className="flex flex-wrap gap-1">
                      {builder.techStack.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-white/5 text-gray-300">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Best For:</p>
                    <div className="flex flex-wrap gap-1">
                      {builder.bestFor.map((use, i) => (
                        <span key={i} className="text-xs text-purple-400">
                          {use}{i < builder.bestFor.length - 1 ? ' • ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleDeploy(builder)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyPromptForPlatform(builder)}
                      className="bg-white/5 border-white/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
            <CardContent className="p-8 text-center">
              <Gift className="w-12 h-12 mx-auto text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Don't Have a Prompt Yet?
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Use BuilderIQ to generate a comprehensive app blueprint, then deploy it to any platform in minutes.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => window.location.href = '/builderiq'}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create with BuilderIQ
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/20"
                  onClick={() => window.location.href = '/playground'}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Test in Playground
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deployment Modal */}
      <DeploymentModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        platform={selectedPlatform}
        blueprintPrompt={currentPrompt || undefined}
        appName="My SmartPromptIQ App"
      />
    </div>
  );
}
