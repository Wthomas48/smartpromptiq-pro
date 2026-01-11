/**
 * SmartPromptIQ Backend Pricing Configuration
 * Central configuration for all pricing tiers and Stripe price IDs
 *
 * IMPORTANT: Update the environment variables in Railway with these price IDs
 * before deployment. Create products/prices in Stripe Dashboard first.
 *
 * UPDATED TIERS:
 * - Free: Try before you buy ($0)
 * - Starter: Entry-level creators ($19/mo)
 * - Academy+: Education + basic creative ($29/mo)
 * - Pro: Full platform for creators ($49/mo) - MOST POPULAR
 * - Team Pro: For teams of 2-5 ($99/mo)
 * - Enterprise: Large organizations ($299/mo)
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;        // Price in cents
  yearlyPrice: number;         // Price in cents (should be ~10-11 months of monthly)
  stripePriceMonthly: string;  // Stripe Price ID for monthly
  stripePriceYearly: string;   // Stripe Price ID for yearly
  features: string[];
  limits: {
    tokensPerMonth: number;
    maxTokenRollover: number;
    teamMembers: number;
    apiCalls: number;
    playgroundTests: number;
    voiceGenerations: number;
    musicTracks: number;
    videoExports: number;
    imageGenerations: number;
    introOutros: number;
    blueprints: number;
  };
  rateLimits: {
    promptsPerDay: number;
    promptsPerHour: number;
    apiCallsPerMinute: number;
  };
  support: 'community' | 'email' | 'priority' | 'priority_chat' | 'dedicated';
  badge?: string;
  popular?: boolean;
  // New features
  commercialLicense: boolean;
  hdExport: boolean;
  fourKExport: boolean;
  watermarkRemoval: boolean;
  priorityQueue: boolean;
  voiceCloning: number;
}

export interface TokenPackage {
  key: string;
  tokens: number;
  priceInCents: number;
  pricePerToken: number;
  stripePriceId: string;
  savings: number;  // Percentage savings compared to base rate
}

export interface AddOnPackage {
  key: string;
  name: string;
  description: string;
  priceInCents: number;
  stripePriceId: string;
  contents: {
    prompts?: number;
    voices?: number;
    music?: number;
    videos?: number;
    images?: number;
  };
  popular?: boolean;
}

// Get Stripe Price IDs from environment variables
// Supports both Railway naming convention (STRIPE_XXX_MONTHLY_PRICE_ID) and standard (STRIPE_PRICE_XXX_MONTHLY)
export const getStripePriceIds = () => ({
  // Starter Plan
  STARTER_MONTHLY: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
  STARTER_YEARLY: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_STARTER_YEARLY || '',

  // Academy+ Subscription
  ACADEMY_PLUS_MONTHLY: process.env.STRIPE_PRICE_ACADEMY_MONTHLY || '',
  ACADEMY_PLUS_YEARLY: process.env.STRIPE_PRICE_ACADEMY_YEARLY || '',

  // Pro Plan (Full Platform)
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_PRO_YEARLY || '',

  // Team Pro Plan (2-5 members)
  TEAM_PRO_MONTHLY: process.env.STRIPE_TEAM_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_TEAM_PRO_MONTHLY || '',
  TEAM_PRO_YEARLY: process.env.STRIPE_TEAM_PRO_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_TEAM_PRO_YEARLY || '',

  // Enterprise Plan
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  ENTERPRISE_YEARLY: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',

  // Token Packages
  TOKENS_25: process.env.STRIPE_PRICE_TOKENS_25 || '',
  TOKENS_100: process.env.STRIPE_PRICE_TOKENS_100 || '',
  TOKENS_500: process.env.STRIPE_PRICE_TOKENS_500 || '',
  TOKENS_1000: process.env.STRIPE_PRICE_TOKENS_1000 || '',

  // Add-on Packages (NEW)
  ADDON_VOICE_PACK: process.env.STRIPE_PRICE_ADDON_VOICE_PACK || '',
  ADDON_MUSIC_PACK: process.env.STRIPE_PRICE_ADDON_MUSIC_PACK || '',
  ADDON_VIDEO_PACK: process.env.STRIPE_PRICE_ADDON_VIDEO_PACK || '',
  ADDON_CREATOR_BUNDLE: process.env.STRIPE_PRICE_ADDON_CREATOR_BUNDLE || '',
  ADDON_AGENCY_PACK: process.env.STRIPE_PRICE_ADDON_AGENCY_PACK || '',
});

// Pricing tiers configuration
export const getPricingTiers = (): PricingTier[] => {
  const priceIds = getStripePriceIds();

  return [
    // ─────────────────────────────────────────────────────────────────────────────
    // FREE TIER - Try before you buy
    // ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      stripePriceMonthly: '',
      stripePriceYearly: '',
      features: [
        '3 Academy courses (basics)',
        '5 AI prompts/month',
        '5 voice generations/month',
        '3 music tracks/month',
        '5 image generations/month',
        'Community support'
      ],
      limits: {
        tokensPerMonth: 5,
        maxTokenRollover: 0,
        teamMembers: 1,
        apiCalls: 0,
        playgroundTests: 5,
        voiceGenerations: 5,
        musicTracks: 3,
        videoExports: 0,
        imageGenerations: 5,
        introOutros: 0,
        blueprints: 1
      },
      rateLimits: {
        promptsPerDay: 5,
        promptsPerHour: 2,
        apiCallsPerMinute: 0
      },
      support: 'community',
      commercialLicense: false,
      hdExport: false,
      fourKExport: false,
      watermarkRemoval: false,
      priorityQueue: false,
      voiceCloning: 0
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // STARTER TIER - $19/month - Entry-level creators
    // ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'starter',
      name: 'Starter',
      description: 'Entry-level creative tools',
      monthlyPrice: 1900,
      yearlyPrice: 15600,
      stripePriceMonthly: priceIds.STARTER_MONTHLY,
      stripePriceYearly: priceIds.STARTER_YEARLY,
      badge: 'Best Value',
      features: [
        '50 AI prompts per month',
        '50 voice generations/month',
        '10 music tracks/month',
        '30 image generations/month',
        '5 intro/outro videos/month',
        '3 BuilderIQ blueprints/month',
        'PDF & audio downloads',
        'Email support'
      ],
      limits: {
        tokensPerMonth: 50,
        maxTokenRollover: 10,
        teamMembers: 1,
        apiCalls: 0,
        playgroundTests: 25,
        voiceGenerations: 50,
        musicTracks: 10,
        videoExports: 5,
        imageGenerations: 30,
        introOutros: 5,
        blueprints: 3
      },
      rateLimits: {
        promptsPerDay: 15,
        promptsPerHour: 5,
        apiCallsPerMinute: 0
      },
      support: 'email',
      commercialLicense: false,
      hdExport: true,
      fourKExport: false,
      watermarkRemoval: false,
      priorityQueue: false,
      voiceCloning: 0
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // ACADEMY+ TIER - $29/month - Education + Basic Creative
    // ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'academy_plus',
      name: 'Academy+',
      description: 'Full education + basic creative tools',
      monthlyPrice: 2900,
      yearlyPrice: 24000,
      stripePriceMonthly: priceIds.ACADEMY_PLUS_MONTHLY,
      stripePriceYearly: priceIds.ACADEMY_PLUS_YEARLY,
      badge: 'For Learners',
      features: [
        'All 57 Academy courses + 555 lessons',
        'Earn completion certificates',
        '100 AI prompts per month',
        '75 voice generations/month',
        '20 music tracks/month',
        '50 image generations/month',
        '10 intro/outro videos/month',
        '5 BuilderIQ blueprints/month',
        'Audio learning & quizzes',
        'Email support'
      ],
      limits: {
        tokensPerMonth: 100,
        maxTokenRollover: 20,
        teamMembers: 1,
        apiCalls: 0,
        playgroundTests: 50,
        voiceGenerations: 75,
        musicTracks: 20,
        videoExports: 10,
        imageGenerations: 50,
        introOutros: 10,
        blueprints: 5
      },
      rateLimits: {
        promptsPerDay: 25,
        promptsPerHour: 8,
        apiCallsPerMinute: 0
      },
      support: 'email',
      commercialLicense: false,
      hdExport: true,
      fourKExport: false,
      watermarkRemoval: false,
      priorityQueue: false,
      voiceCloning: 0
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // PRO TIER - $49/month - Content Creators (MOST POPULAR)
    // ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'pro',
      name: 'Pro',
      description: 'Full platform for content creators',
      monthlyPrice: 4900,
      yearlyPrice: 40800,
      stripePriceMonthly: priceIds.PRO_MONTHLY,
      stripePriceYearly: priceIds.PRO_YEARLY,
      badge: 'Most Popular',
      popular: true,
      features: [
        'Everything in Academy+, PLUS:',
        '200 AI prompts per month',
        '200 voice generations/month',
        '50 Suno music tracks/month',
        '100 DALL-E 3 images/month',
        '30 video exports/month',
        '30 intro/outro videos/month',
        '10 BuilderIQ blueprints/month',
        '5 voice clones',
        'Commercial license',
        'Remove watermarks',
        'Priority queue',
        'Priority email support'
      ],
      limits: {
        tokensPerMonth: 200,
        maxTokenRollover: 50,
        teamMembers: 1,
        apiCalls: 100,
        playgroundTests: 200,
        voiceGenerations: 200,
        musicTracks: 50,
        videoExports: 30,
        imageGenerations: 100,
        introOutros: 30,
        blueprints: 10
      },
      rateLimits: {
        promptsPerDay: 50,
        promptsPerHour: 15,
        apiCallsPerMinute: 5
      },
      support: 'priority',
      commercialLicense: true,
      hdExport: true,
      fourKExport: false,
      watermarkRemoval: true,
      priorityQueue: true,
      voiceCloning: 5
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // TEAM PRO TIER - $99/month - Small Teams
    // ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'team_pro',
      name: 'Team Pro',
      description: 'For teams of 2-5 people',
      monthlyPrice: 9900,
      yearlyPrice: 82800,
      stripePriceMonthly: priceIds.TEAM_PRO_MONTHLY,
      stripePriceYearly: priceIds.TEAM_PRO_YEARLY,
      badge: 'Best for Teams',
      features: [
        'Everything in Pro, PLUS:',
        '1,000 AI prompts/month (5x more)',
        '500 voice generations/month',
        '150 Suno music tracks/month',
        '300 DALL-E 3 images/month',
        '100 video exports/month (4K)',
        '100 intro/outro videos/month',
        'Unlimited BuilderIQ blueprints',
        '20 voice clones',
        '2-5 team member seats',
        'Team collaboration workspace',
        '1,000 API calls/month',
        'Priority chat support'
      ],
      limits: {
        tokensPerMonth: 1000,
        maxTokenRollover: 200,
        teamMembers: 5,
        apiCalls: 1000,
        playgroundTests: 500,
        voiceGenerations: 500,
        musicTracks: 150,
        videoExports: 100,
        imageGenerations: 300,
        introOutros: 100,
        blueprints: -1 // Unlimited
      },
      rateLimits: {
        promptsPerDay: 200,
        promptsPerHour: 50,
        apiCallsPerMinute: 20
      },
      support: 'priority_chat',
      commercialLicense: true,
      hdExport: true,
      fourKExport: true,
      watermarkRemoval: true,
      priorityQueue: true,
      voiceCloning: 20
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // ENTERPRISE TIER - $299/month - Large Organizations
    // ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large teams and organizations',
      monthlyPrice: 29900,
      yearlyPrice: 299900,
      stripePriceMonthly: priceIds.ENTERPRISE_MONTHLY,
      stripePriceYearly: priceIds.ENTERPRISE_YEARLY,
      badge: 'Contact Sales',
      features: [
        'Everything in Team Pro, PLUS:',
        '5,000+ AI prompts/month',
        'Unlimited voice generations',
        'Unlimited Suno music tracks',
        'Unlimited DALL-E 3 images',
        'Unlimited video exports (4K)',
        'Unlimited intro/outro videos',
        'Unlimited voice clones',
        'Unlimited team members',
        'Unlimited API calls',
        'Custom branding & certificates',
        'White-label options',
        'Dedicated account manager',
        'SSO & advanced security',
        '1-4 hour support response'
      ],
      limits: {
        tokensPerMonth: 5000,
        maxTokenRollover: 1000,
        teamMembers: -1,
        apiCalls: -1,
        playgroundTests: -1,
        voiceGenerations: -1,
        musicTracks: -1,
        videoExports: -1,
        imageGenerations: -1,
        introOutros: -1,
        blueprints: -1
      },
      rateLimits: {
        promptsPerDay: 500,
        promptsPerHour: 100,
        apiCallsPerMinute: 100
      },
      support: 'dedicated',
      commercialLicense: true,
      hdExport: true,
      fourKExport: true,
      watermarkRemoval: true,
      priorityQueue: true,
      voiceCloning: -1 // Unlimited
    }
  ];
};

// Token packages configuration
export const getTokenPackages = (): TokenPackage[] => {
  const priceIds = getStripePriceIds();

  return [
    {
      key: 'small',
      tokens: 25,
      priceInCents: 499,
      pricePerToken: 19.96,
      stripePriceId: priceIds.TOKENS_25,
      savings: 0
    },
    {
      key: 'medium',
      tokens: 100,
      priceInCents: 1799,
      pricePerToken: 17.99,
      stripePriceId: priceIds.TOKENS_100,
      savings: 10
    },
    {
      key: 'large',
      tokens: 500,
      priceInCents: 7999,
      pricePerToken: 16.00,
      stripePriceId: priceIds.TOKENS_500,
      savings: 20
    },
    {
      key: 'bulk',
      tokens: 1000,
      priceInCents: 14999,
      pricePerToken: 15.00,
      stripePriceId: priceIds.TOKENS_1000,
      savings: 25
    }
  ];
};

// Add-on packages configuration (NEW)
export const getAddOnPackages = (): AddOnPackage[] => {
  const priceIds = getStripePriceIds();

  return [
    {
      key: 'voice_pack',
      name: 'Voice Pack',
      description: '+50 voice generations',
      priceInCents: 999,
      stripePriceId: priceIds.ADDON_VOICE_PACK,
      contents: {
        voices: 50
      }
    },
    {
      key: 'music_pack',
      name: 'Music Pack',
      description: '+30 Suno music tracks',
      priceInCents: 1499,
      stripePriceId: priceIds.ADDON_MUSIC_PACK,
      contents: {
        music: 30
      }
    },
    {
      key: 'video_pack',
      name: 'Video Pack',
      description: '+20 video exports',
      priceInCents: 1999,
      stripePriceId: priceIds.ADDON_VIDEO_PACK,
      contents: {
        videos: 20
      }
    },
    {
      key: 'creator_bundle',
      name: 'Creator Bundle',
      description: 'Best value for content creators',
      priceInCents: 2999,
      stripePriceId: priceIds.ADDON_CREATOR_BUNDLE,
      contents: {
        prompts: 100,
        voices: 50,
        music: 20,
        images: 30
      },
      popular: true
    },
    {
      key: 'agency_pack',
      name: 'Agency Pack',
      description: 'High-volume content production',
      priceInCents: 4999,
      stripePriceId: priceIds.ADDON_AGENCY_PACK,
      contents: {
        prompts: 500,
        voices: 100,
        music: 50,
        videos: 30,
        images: 100
      }
    }
  ];
};

// Map Stripe price ID to plan name
export const getPlanFromPriceId = (priceId: string): string => {
  const priceIds = getStripePriceIds();

  const mapping: Record<string, string> = {
    // Starter (NEW)
    [priceIds.STARTER_MONTHLY]: 'STARTER',
    [priceIds.STARTER_YEARLY]: 'STARTER',

    // Academy+
    [priceIds.ACADEMY_PLUS_MONTHLY]: 'ACADEMY_PLUS',
    [priceIds.ACADEMY_PLUS_YEARLY]: 'ACADEMY_PLUS',

    // Pro
    [priceIds.PRO_MONTHLY]: 'PRO',
    [priceIds.PRO_YEARLY]: 'PRO',

    // Team Pro
    [priceIds.TEAM_PRO_MONTHLY]: 'TEAM_PRO',
    [priceIds.TEAM_PRO_YEARLY]: 'TEAM_PRO',

    // Enterprise
    [priceIds.ENTERPRISE_MONTHLY]: 'ENTERPRISE',
    [priceIds.ENTERPRISE_YEARLY]: 'ENTERPRISE',

    // Legacy price IDs for backward compatibility
    'price_pro_monthly': 'PRO',
    'price_team_monthly': 'TEAM_PRO',
    'price_enterprise_monthly': 'ENTERPRISE'
  };

  return mapping[priceId] || 'FREE';
};

// Get subscription tier for Academy access
export const getSubscriptionTier = (plan: string): string => {
  const tierMapping: Record<string, string> = {
    'STARTER': 'starter',
    'ACADEMY_PLUS': 'academy_plus',
    'ACADEMY': 'academy_plus', // Legacy mapping
    'PRO': 'pro',
    'TEAM_PRO': 'team_pro',
    'BUSINESS': 'team_pro', // Legacy mapping
    'ENTERPRISE': 'enterprise',
    'FREE': 'free'
  };

  return tierMapping[plan] || 'free';
};

// Get generation limits by plan
export const getGenerationLimits = (plan: string): Record<string, number> => {
  const limitsMapping: Record<string, Record<string, number>> = {
    'STARTER': {
      prompts: 50,
      voice: 50,
      music: 10,
      images: 30,
      videos: 5,
      introOutros: 5,
      blueprints: 3
    },
    'ACADEMY_PLUS': {
      prompts: 100,
      voice: 75,
      music: 20,
      images: 50,
      videos: 10,
      introOutros: 10,
      blueprints: 5
    },
    'PRO': {
      prompts: 200,
      voice: 200,
      music: 50,
      images: 100,
      videos: 30,
      introOutros: 30,
      blueprints: 10
    },
    'TEAM_PRO': {
      prompts: 1000,
      voice: 500,
      music: 150,
      images: 300,
      videos: 100,
      introOutros: 100,
      blueprints: -1
    },
    'ENTERPRISE': {
      prompts: 5000,
      voice: -1,
      music: -1,
      images: -1,
      videos: -1,
      introOutros: -1,
      blueprints: -1
    },
    'FREE': {
      prompts: 5,
      voice: 5,
      music: 3,
      images: 5,
      videos: 0,
      introOutros: 0,
      blueprints: 1
    }
  };

  return limitsMapping[plan] || limitsMapping['FREE'];
};

// Validate price ID format
export const isValidPriceId = (priceId: string): boolean => {
  return priceId.startsWith('price_') && priceId.length > 10;
};

// Check if all required price IDs are configured
export const validatePricingConfiguration = (): { valid: boolean; missing: string[] } => {
  const priceIds = getStripePriceIds();
  const missing: string[] = [];

  // Required price IDs (except Free which has no price)
  const requiredPriceIds = [
    { name: 'STARTER_MONTHLY', value: priceIds.STARTER_MONTHLY },
    { name: 'STARTER_YEARLY', value: priceIds.STARTER_YEARLY },
    { name: 'ACADEMY_PLUS_MONTHLY', value: priceIds.ACADEMY_PLUS_MONTHLY },
    { name: 'ACADEMY_PLUS_YEARLY', value: priceIds.ACADEMY_PLUS_YEARLY },
    { name: 'PRO_MONTHLY', value: priceIds.PRO_MONTHLY },
    { name: 'PRO_YEARLY', value: priceIds.PRO_YEARLY },
    { name: 'TEAM_PRO_MONTHLY', value: priceIds.TEAM_PRO_MONTHLY },
    { name: 'TEAM_PRO_YEARLY', value: priceIds.TEAM_PRO_YEARLY },
    { name: 'ENTERPRISE_MONTHLY', value: priceIds.ENTERPRISE_MONTHLY },
    { name: 'ENTERPRISE_YEARLY', value: priceIds.ENTERPRISE_YEARLY },
  ];

  for (const { name, value } of requiredPriceIds) {
    if (!value || !isValidPriceId(value)) {
      missing.push(`STRIPE_PRICE_${name}`);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
};

export default {
  getPricingTiers,
  getTokenPackages,
  getAddOnPackages,
  getStripePriceIds,
  getPlanFromPriceId,
  getSubscriptionTier,
  getGenerationLimits,
  isValidPriceId,
  validatePricingConfiguration
};
