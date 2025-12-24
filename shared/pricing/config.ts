/**
 * SmartPromptIQ Shared Pricing Configuration
 * This file is used by both frontend and backend for consistent pricing
 *
 * UPDATED: 6-Tier Structure
 * - Free: $0 - Try before you buy
 * - Starter: $19/mo - Entry-level creative tools
 * - Academy+: $29/mo - Full education + basic creative
 * - Pro: $49/mo - Full platform for creators (Most Popular)
 * - Team Pro: $99/mo - Teams of 2-5
 * - Enterprise: $299/mo - Large organizations
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  limits: {
    promptsPerMonth: number;
    tokensPerMonth: number;
    voiceGenerations: number;
    musicTracks: number;
    videoExports: number;
    imageGenerations: number;
    introOutros: number;
    blueprints: number;
    categories: number | 'unlimited';
    teamMembers: number | 'unlimited';
    templatesCustom: number | 'unlimited';
    apiCalls: number | 'unlimited';
    promptHistory: number; // days
    exportFormats: string[];
    support: 'community' | 'email' | 'priority' | 'priority_chat' | 'dedicated';
  };
  popular?: boolean;
  badge?: string;
  color: string;
  commercialLicense: boolean;
  hdExport: boolean;
  fourKExport: boolean;
  watermarkRemoval: boolean;
  priorityQueue: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  // FREE TIER
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: '',
      yearly: '',
    },
    features: [
      '5 AI prompts/month',
      '3 free Academy courses',
      '5 voice generations',
      '3 music tracks',
      '5 image generations',
      'Community support',
    ],
    limits: {
      promptsPerMonth: 5,
      tokensPerMonth: 5,
      voiceGenerations: 5,
      musicTracks: 3,
      videoExports: 0,
      imageGenerations: 5,
      introOutros: 0,
      blueprints: 1,
      categories: 3,
      teamMembers: 1,
      templatesCustom: 0,
      apiCalls: 0,
      promptHistory: 7,
      exportFormats: ['txt'],
      support: 'community',
    },
    color: 'slate',
    commercialLicense: false,
    hdExport: false,
    fourKExport: false,
    watermarkRemoval: false,
    priorityQueue: false,
  },

  // STARTER TIER - $19/mo
  {
    id: 'starter',
    name: 'Starter',
    description: 'Entry-level creative tools',
    price: {
      monthly: 19,
      yearly: 156, // $13/mo
    },
    stripeIds: {
      monthly: 'price_starter_monthly',
      yearly: 'price_starter_yearly',
    },
    badge: 'Best Value',
    features: [
      '50 AI prompts/month',
      '50 voice generations',
      '10 music tracks',
      '30 image generations',
      '5 intro/outro videos',
      '3 BuilderIQ blueprints',
      'HD video export',
      'Email support',
    ],
    limits: {
      promptsPerMonth: 50,
      tokensPerMonth: 50,
      voiceGenerations: 50,
      musicTracks: 10,
      videoExports: 5,
      imageGenerations: 30,
      introOutros: 5,
      blueprints: 3,
      categories: 'unlimited',
      teamMembers: 1,
      templatesCustom: 10,
      apiCalls: 0,
      promptHistory: 14,
      exportFormats: ['txt', 'pdf'],
      support: 'email',
    },
    color: 'blue',
    commercialLicense: false,
    hdExport: true,
    fourKExport: false,
    watermarkRemoval: false,
    priorityQueue: false,
  },

  // ACADEMY+ TIER - $29/mo
  {
    id: 'academy_plus',
    name: 'Academy+',
    description: 'Full education + basic creative tools',
    price: {
      monthly: 29,
      yearly: 240, // $20/mo
    },
    stripeIds: {
      monthly: 'price_academy_monthly',
      yearly: 'price_academy_yearly',
    },
    badge: 'For Learners',
    features: [
      'All 57 Academy courses',
      '555+ lessons with certificates',
      '100 AI prompts/month',
      '75 voice generations',
      '20 music tracks',
      '50 image generations',
      'Audio learning & quizzes',
      'Email support',
    ],
    limits: {
      promptsPerMonth: 100,
      tokensPerMonth: 100,
      voiceGenerations: 75,
      musicTracks: 20,
      videoExports: 10,
      imageGenerations: 50,
      introOutros: 10,
      blueprints: 5,
      categories: 'unlimited',
      teamMembers: 1,
      templatesCustom: 20,
      apiCalls: 0,
      promptHistory: 30,
      exportFormats: ['txt', 'pdf'],
      support: 'email',
    },
    color: 'teal',
    commercialLicense: false,
    hdExport: true,
    fourKExport: false,
    watermarkRemoval: false,
    priorityQueue: false,
  },

  // PRO TIER - $49/mo (Most Popular)
  {
    id: 'pro',
    name: 'Pro',
    description: 'Full platform for content creators',
    price: {
      monthly: 49,
      yearly: 408, // $34/mo
    },
    stripeIds: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly',
    },
    badge: 'Most Popular',
    popular: true,
    features: [
      '200 AI prompts/month',
      'All 57 Academy courses',
      '200 voice generations',
      '50 Suno music tracks',
      '100 DALL-E 3 images',
      '30 video exports',
      'Commercial license',
      'Remove watermarks',
      'Priority support',
    ],
    limits: {
      promptsPerMonth: 200,
      tokensPerMonth: 200,
      voiceGenerations: 200,
      musicTracks: 50,
      videoExports: 30,
      imageGenerations: 100,
      introOutros: 30,
      blueprints: 10,
      categories: 'unlimited',
      teamMembers: 1,
      templatesCustom: 'unlimited',
      apiCalls: 100,
      promptHistory: 90,
      exportFormats: ['txt', 'pdf', 'doc', 'json'],
      support: 'priority',
    },
    color: 'indigo',
    commercialLicense: true,
    hdExport: true,
    fourKExport: false,
    watermarkRemoval: true,
    priorityQueue: true,
  },

  // TEAM PRO TIER - $99/mo
  {
    id: 'team_pro',
    name: 'Team Pro',
    description: 'For teams of 2-5 people',
    price: {
      monthly: 99,
      yearly: 828, // $69/mo
    },
    stripeIds: {
      monthly: 'price_team_pro_monthly',
      yearly: 'price_team_pro_yearly',
    },
    badge: 'Best for Teams',
    features: [
      '1,000 AI prompts/month',
      '500 voice generations',
      '150 Suno music tracks',
      '300 DALL-E 3 images',
      '100 video exports (4K)',
      '2-5 team members',
      'Team workspace',
      '1,000 API calls/month',
      'Priority chat support',
    ],
    limits: {
      promptsPerMonth: 1000,
      tokensPerMonth: 1000,
      voiceGenerations: 500,
      musicTracks: 150,
      videoExports: 100,
      imageGenerations: 300,
      introOutros: 100,
      blueprints: -1, // Unlimited
      categories: 'unlimited',
      teamMembers: 5,
      templatesCustom: 'unlimited',
      apiCalls: 1000,
      promptHistory: 180,
      exportFormats: ['txt', 'pdf', 'doc', 'json', 'csv'],
      support: 'priority_chat',
    },
    color: 'purple',
    commercialLicense: true,
    hdExport: true,
    fourKExport: true,
    watermarkRemoval: true,
    priorityQueue: true,
  },

  // ENTERPRISE TIER - $299/mo
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large teams and organizations',
    price: {
      monthly: 299,
      yearly: 2999, // ~$250/mo
    },
    stripeIds: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly',
    },
    badge: 'Contact Sales',
    features: [
      '5,000+ AI prompts/month',
      'Unlimited voice generations',
      'Unlimited Suno music tracks',
      'Unlimited DALL-E 3 images',
      'Unlimited video exports (4K)',
      'Unlimited team members',
      'Unlimited API calls',
      'Custom branding',
      'White-label options',
      'Dedicated account manager',
      'SSO & advanced security',
    ],
    limits: {
      promptsPerMonth: -1, // unlimited
      tokensPerMonth: -1, // unlimited
      voiceGenerations: -1,
      musicTracks: -1,
      videoExports: -1,
      imageGenerations: -1,
      introOutros: -1,
      blueprints: -1,
      categories: 'unlimited',
      teamMembers: 'unlimited',
      templatesCustom: 'unlimited',
      apiCalls: 'unlimited',
      promptHistory: 365,
      exportFormats: ['txt', 'pdf', 'doc', 'json', 'csv', 'xml', 'yaml'],
      support: 'dedicated',
    },
    color: 'amber',
    commercialLicense: true,
    hdExport: true,
    fourKExport: true,
    watermarkRemoval: true,
    priorityQueue: true,
  },
];

export const ADDON_FEATURES = {
  voice_pack: {
    name: 'Voice Pack',
    description: '+50 voice generations',
    price: 9.99,
    stripeId: 'price_addon_voice_pack',
    contents: { voices: 50 },
  },
  music_pack: {
    name: 'Music Pack',
    description: '+30 Suno music tracks',
    price: 14.99,
    stripeId: 'price_addon_music_pack',
    contents: { music: 30 },
  },
  video_pack: {
    name: 'Video Pack',
    description: '+20 video exports',
    price: 19.99,
    stripeId: 'price_addon_video_pack',
    contents: { videos: 20 },
  },
  creator_bundle: {
    name: 'Creator Bundle',
    description: 'Best value for content creators',
    price: 29.99,
    stripeId: 'price_addon_creator_bundle',
    contents: { prompts: 100, voices: 50, music: 20, images: 30 },
    popular: true,
  },
  agency_pack: {
    name: 'Agency Pack',
    description: 'High-volume content production',
    price: 49.99,
    stripeId: 'price_addon_agency_pack',
    contents: { prompts: 500, voices: 100, music: 50, videos: 30, images: 100 },
  },
};

export const USAGE_CATEGORIES = [
  { id: 'business-strategy', name: 'Business Strategy', icon: 'briefcase' },
  { id: 'marketing', name: 'Marketing & Sales', icon: 'megaphone' },
  { id: 'product-development', name: 'Product Development', icon: 'settings' },
  { id: 'financial-planning', name: 'Financial Planning', icon: 'dollar-sign' },
  { id: 'education', name: 'Education & Training', icon: 'graduation-cap' },
  { id: 'personal-development', name: 'Personal Development', icon: 'user' },
  { id: 'content-creation', name: 'Content Creation', icon: 'pen-tool' },
  { id: 'customer-support', name: 'Customer Support', icon: 'headphones' },
  { id: 'legal-compliance', name: 'Legal & Compliance', icon: 'shield' },
  { id: 'hr-recruiting', name: 'HR & Recruiting', icon: 'users' },
  { id: 'data-analysis', name: 'Data Analysis', icon: 'bar-chart' },
  { id: 'project-management', name: 'Project Management', icon: 'clipboard' },
  { id: 'creative-writing', name: 'Creative Writing', icon: 'feather' },
  { id: 'technical-documentation', name: 'Technical Documentation', icon: 'code' },
  { id: 'social-media', name: 'Social Media', icon: 'share-2' },
];

export const BILLING_CYCLES = {
  monthly: { label: 'Monthly', discount: 0 },
  yearly: { label: 'Yearly', discount: 0.17 }, // ~17% discount (2 months free)
};

export function getTierById(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === tierId);
}

export function getTierByStripeId(stripeId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier =>
    tier.stripeIds.monthly === stripeId || tier.stripeIds.yearly === stripeId
  );
}

export function calculateYearlySavings(tier: PricingTier): number {
  const monthlyTotal = tier.price.monthly * 12;
  const yearlyPrice = tier.price.yearly;
  return monthlyTotal - yearlyPrice;
}

export function isFeatureAvailable(tierId: string, feature: keyof PricingTier['limits']): boolean {
  const tier = getTierById(tierId);
  if (!tier) return false;

  const limit = tier.limits[feature];
  return limit === 'unlimited' || (typeof limit === 'number' && (limit > 0 || limit === -1));
}

export function getUsagePercentage(used: number, limit: number | 'unlimited'): number {
  if (limit === 'unlimited' || limit === -1) return 0;
  if (typeof limit !== 'number') return 0;
  return Math.min((used / limit) * 100, 100);
}

export function formatLimit(value: number | 'unlimited'): string {
  if (value === 'unlimited' || value === -1) return 'Unlimited';
  if (value === 0) return '—';
  if (typeof value === 'number' && value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}
