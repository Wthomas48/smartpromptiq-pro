/**
 * SmartPromptIQ Frontend Pricing Configuration
 * Mirrors the backend pricing config for consistent pricing display
 *
 * UPDATED: Added Starter tier, new creative tool limits, and add-on packages
 *
 * TIERS:
 * - Free: Try before you buy
 * - Starter: Entry-level creative tools ($19/mo)
 * - Academy+: Education + basic creative tools ($29/mo)
 * - Pro: Full platform for creators ($49/mo) - MOST POPULAR
 * - Team Pro: For teams of 2-5 ($99/mo)
 * - Enterprise: Large organizations ($299/mo)
 */

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;        // Price in cents
  yearlyPrice: number;         // Price in cents
  features: string[];
  limits: {
    tokensPerMonth: number;
    maxTokenRollover: number;
    teamMembers: number;
    apiCalls: number;
    playgroundTests: number;
    // New creative tool limits
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
}

export interface TokenPackage {
  key: string;
  tokens: number;
  priceInCents: number;
  pricePerToken: number;
  savings: number;
}

// NEW: Feature-specific add-on packages
export interface AddOnPackage {
  key: string;
  name: string;
  description: string;
  priceInCents: number;
  contents: {
    prompts?: number;
    voices?: number;
    music?: number;
    videos?: number;
    images?: number;
  };
  popular?: boolean;
}

// Stripe Price IDs (for reference - actual IDs come from backend)
export const STRIPE_PRICE_IDS = {
  // Starter tier
  STARTER_MONTHLY: 'price_1T2gkzKtG2uGDhSNEgcnY6kg',
  STARTER_YEARLY: 'price_1T2gl0KtG2uGDhSNrSJdvyCI',
  // Academy+ tier (verified against Stripe API)
  ACADEMY_PLUS_MONTHLY: 'price_1SUCjTKtG2uGDhSNRWFbe07R',
  ACADEMY_PLUS_YEARLY: 'price_1SUCmKKtG2uGDhSNGAFa0mHD',
  // Pro tier
  PRO_MONTHLY: 'price_1SU8gOKtG2uGDhSN8mVgkD1E',
  PRO_YEARLY: 'price_1SU8luKtG2uGDhSNZPP8UFR3',
  // Team Pro tier (verified against Stripe API)
  TEAM_PRO_MONTHLY: 'price_1SU8qRKtG2uGDhSNi8k6uB9z',
  TEAM_PRO_YEARLY: 'price_1SU8tRKtG2uGDhSNWiMGSxlN',
  // Enterprise tier
  ENTERPRISE_MONTHLY: 'price_1SU8vXKtG2uGDhSN2e92rn5J',
  ENTERPRISE_YEARLY: 'price_1SU8yGKtG2uGDhSN28rCp3Ta',
  // Add-on packages
  ADDON_VOICE_PACK: 'price_addon_voice_pack',
  ADDON_MUSIC_PACK: 'price_addon_music_pack',
  ADDON_VIDEO_PACK: 'price_addon_video_pack',
  ADDON_CREATOR_BUNDLE: 'price_addon_creator_bundle',
  ADDON_AGENCY_PACK: 'price_addon_agency_pack',
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING TIERS - 6 TIERS
// ═══════════════════════════════════════════════════════════════════════════════

export const PRICING_TIERS: PricingTier[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // FREE TIER - Try before you buy (Reduced limits to increase conversion)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'free',
    name: 'Free',
    description: 'Try our AI tools',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 Academy courses (basics)',
      '2 AI prompts/month',
      '2 voice generations/month',
      '1 music track/month',
      '2 image generations/month',
      'Community support',
      'Upgrade anytime for more'
    ],
    limits: {
      tokensPerMonth: 2,
      maxTokenRollover: 0,
      teamMembers: 1,
      apiCalls: 0,
      playgroundTests: 3,
      voiceGenerations: 2,
      musicTracks: 1,
      videoExports: 0,
      imageGenerations: 2,
      introOutros: 0,
      blueprints: 1
    },
    rateLimits: {
      promptsPerDay: 2,
      promptsPerHour: 1,
      apiCallsPerMinute: 0
    },
    support: 'community',
    commercialLicense: false,
    hdExport: false,
    fourKExport: false,
    watermarkRemoval: false,
    priorityQueue: false
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STARTER TIER - $19/month - Entry-level creators
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'starter',
    name: 'Starter',
    description: 'Entry-level creative tools',
    monthlyPrice: 1900,      // $19/month
    yearlyPrice: 15600,      // $156/year ($13/month - save $72)
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
    priorityQueue: false
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ACADEMY+ TIER - $29/month - Education + Basic Creative
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'academy_plus',
    name: 'Academy+',
    description: 'Full education + basic creative tools',
    monthlyPrice: 2900,      // $29/month
    yearlyPrice: 24000,      // $240/year ($20/month - save $108)
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
    priorityQueue: false
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PRO TIER - $49/month - Content Creators (MOST POPULAR)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'pro',
    name: 'Pro',
    description: 'Full platform for content creators',
    monthlyPrice: 4900,      // $49/month
    yearlyPrice: 40800,      // $408/year ($34/month - save $180)
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
    priorityQueue: true
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEAM PRO TIER - $99/month - Small Teams
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'team_pro',
    name: 'Team Pro',
    description: 'For teams of 2-5 people',
    monthlyPrice: 9900,      // $99/month
    yearlyPrice: 82800,      // $828/year ($69/month - save $360)
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
    priorityQueue: true
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ENTERPRISE TIER - $299/month - Large Organizations
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large teams and organizations',
    monthlyPrice: 29900,     // $299/month
    yearlyPrice: 299900,     // $2,999/year (~$250/month)
    badge: 'Contact Sales',
    features: [
      'Everything in Team Pro, PLUS:',
      '5,000+ AI prompts/month',
      'Unlimited voice generations',
      'Unlimited Suno music tracks',
      'Unlimited DALL-E 3 images',
      'Unlimited video exports (4K)',
      'Unlimited intro/outro videos',
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
      teamMembers: -1,  // Unlimited
      apiCalls: -1,     // Unlimited
      playgroundTests: -1, // Unlimited
      voiceGenerations: -1, // Unlimited
      musicTracks: -1, // Unlimited
      videoExports: -1, // Unlimited
      imageGenerations: -1, // Unlimited
      introOutros: -1, // Unlimited
      blueprints: -1 // Unlimited
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
    priorityQueue: true
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN PACKAGES - Buy extra prompts
// ═══════════════════════════════════════════════════════════════════════════════

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    key: 'small',
    tokens: 25,
    priceInCents: 499,       // $4.99
    pricePerToken: 19.96,    // $0.1996 per token
    savings: 0
  },
  {
    key: 'medium',
    tokens: 100,
    priceInCents: 1799,      // $17.99
    pricePerToken: 17.99,    // $0.1799 per token
    savings: 10
  },
  {
    key: 'large',
    tokens: 500,
    priceInCents: 7999,      // $79.99
    pricePerToken: 16.00,    // $0.16 per token
    savings: 20
  },
  {
    key: 'bulk',
    tokens: 1000,
    priceInCents: 14999,     // $149.99
    pricePerToken: 15.00,    // $0.15 per token
    savings: 25
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// ADD-ON PACKAGES - Feature-specific boosts
// ═══════════════════════════════════════════════════════════════════════════════

export const ADDON_PACKAGES: AddOnPackage[] = [
  {
    key: 'voice_pack',
    name: 'Voice Pack',
    description: '+50 voice generations',
    priceInCents: 999,       // $9.99
    contents: {
      voices: 50
    }
  },
  {
    key: 'music_pack',
    name: 'Music Pack',
    description: '+30 Suno music tracks',
    priceInCents: 1499,      // $14.99
    contents: {
      music: 30
    }
  },
  {
    key: 'video_pack',
    name: 'Video Pack',
    description: '+20 video exports',
    priceInCents: 1999,      // $19.99
    contents: {
      videos: 20
    }
  },
  {
    key: 'creator_bundle',
    name: 'Creator Bundle',
    description: 'Best value for content creators',
    priceInCents: 2999,      // $29.99
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
    priceInCents: 4999,      // $49.99
    contents: {
      prompts: 500,
      voices: 100,
      music: 50,
      videos: 30,
      images: 100
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// OVERAGE PRICING - Pay-as-you-go for users who exceed limits
// ═══════════════════════════════════════════════════════════════════════════════

export interface OveragePricing {
  feature: string;
  unitName: string;
  pricePerUnit: number;  // In cents
  minPurchase: number;
  description: string;
}

export const OVERAGE_PRICING: OveragePricing[] = [
  {
    feature: 'prompts',
    unitName: 'prompt',
    pricePerUnit: 25,        // $0.25 per prompt
    minPurchase: 5,
    description: 'Additional AI prompts beyond your plan limit'
  },
  {
    feature: 'voices',
    unitName: 'voice generation',
    pricePerUnit: 15,        // $0.15 per voice
    minPurchase: 10,
    description: 'Additional ElevenLabs voice generations'
  },
  {
    feature: 'music',
    unitName: 'music track',
    pricePerUnit: 75,        // $0.75 per track
    minPurchase: 3,
    description: 'Additional Suno AI music tracks'
  },
  {
    feature: 'images',
    unitName: 'image',
    pricePerUnit: 10,        // $0.10 per image
    minPurchase: 10,
    description: 'Additional DALL-E 3 image generations'
  },
  {
    feature: 'videos',
    unitName: 'video export',
    pricePerUnit: 150,       // $1.50 per video
    minPurchase: 3,
    description: 'Additional video exports'
  },
  {
    feature: 'api_calls',
    unitName: 'API call',
    pricePerUnit: 5,         // $0.05 per API call
    minPurchase: 50,
    description: 'Additional API calls for developers'
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// API DEVELOPER TIER - Standalone API access for developers
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  apiCallsPerMonth: number;
  rateLimit: number;  // Calls per minute
  features: string[];
}

export const API_TIERS: ApiTier[] = [
  {
    id: 'api_starter',
    name: 'API Starter',
    description: 'For hobby projects and testing',
    monthlyPrice: 2900,      // $29/month
    yearlyPrice: 24000,      // $240/year
    apiCallsPerMonth: 1000,
    rateLimit: 10,
    features: [
      '1,000 API calls/month',
      '10 calls/minute rate limit',
      'All prompt endpoints',
      'Voice generation API',
      'Email support',
      'API documentation access'
    ]
  },
  {
    id: 'api_pro',
    name: 'API Pro',
    description: 'For production applications',
    monthlyPrice: 9900,      // $99/month
    yearlyPrice: 82800,      // $828/year
    apiCallsPerMonth: 10000,
    rateLimit: 60,
    features: [
      '10,000 API calls/month',
      '60 calls/minute rate limit',
      'All API endpoints',
      'Webhook support',
      'Priority support',
      'Usage analytics dashboard'
    ]
  },
  {
    id: 'api_enterprise',
    name: 'API Enterprise',
    description: 'For high-volume applications',
    monthlyPrice: 29900,     // $299/month
    yearlyPrice: 249900,     // $2,499/year
    apiCallsPerMonth: 100000,
    rateLimit: 300,
    features: [
      '100,000 API calls/month',
      '300 calls/minute rate limit',
      'All API endpoints',
      'Dedicated infrastructure',
      'SLA guarantee (99.9%)',
      'Technical account manager',
      'Custom integrations support'
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function formatPrice(cents: number, billingCycle: 'monthly' | 'yearly' = 'monthly'): string {
  const dollars = cents / 100;
  if (billingCycle === 'yearly') {
    return `$${dollars.toLocaleString()}/year`;
  }
  return `$${dollars}/mo`;
}

export function formatPriceShort(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars}`;
}

export function getMonthlyEquivalent(yearlyPrice: number): number {
  return Math.round(yearlyPrice / 12);
}

export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  if (monthlyPrice === 0) return 0;
  const fullYearlyPrice = monthlyPrice * 12;
  return Math.round(((fullYearlyPrice - yearlyPrice) / fullYearlyPrice) * 100);
}

export function getPricingTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === id);
}

export function getStripePriceId(tierId: string, billingCycle: 'monthly' | 'yearly'): string {
  const tierIdUpper = tierId.toUpperCase().replace('-', '_');
  const cycleKey = `${tierIdUpper}_${billingCycle.toUpperCase()}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[cycleKey] || '';
}

export function formatLimit(value: number): string {
  if (value === -1) return 'Unlimited';
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}

// Get overage price for a feature
export function getOveragePrice(feature: string): OveragePricing | undefined {
  return OVERAGE_PRICING.find(o => o.feature === feature);
}

// Calculate overage cost
export function calculateOverageCost(feature: string, quantity: number): number {
  const overage = getOveragePrice(feature);
  if (!overage) return 0;
  return overage.pricePerUnit * quantity;
}

// Get API tier by ID
export function getApiTierById(id: string): ApiTier | undefined {
  return API_TIERS.find(tier => tier.id === id);
}

export default {
  PRICING_TIERS,
  TOKEN_PACKAGES,
  ADDON_PACKAGES,
  OVERAGE_PRICING,
  API_TIERS,
  STRIPE_PRICE_IDS,
  formatPrice,
  formatPriceShort,
  getMonthlyEquivalent,
  calculateYearlySavings,
  getPricingTierById,
  getStripePriceId,
  formatLimit,
  isUnlimited,
  getOveragePrice,
  calculateOverageCost,
  getApiTierById
};
