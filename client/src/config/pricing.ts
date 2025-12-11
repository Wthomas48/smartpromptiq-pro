/**
 * SmartPromptIQ Frontend Pricing Configuration
 * Mirrors the backend pricing config for consistent pricing display
 *
 * This config can use hardcoded values or fetch from the API.
 * For static pricing display, use the hardcoded values.
 * For dynamic pricing (from Stripe), fetch from /api/billing/pricing
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
  };
  rateLimits: {
    promptsPerDay: number;
    promptsPerHour: number;
    apiCallsPerMinute: number;
  };
  support: 'community' | 'email' | 'priority' | 'priority_chat' | 'dedicated';
  badge?: string;
  popular?: boolean;
}

export interface TokenPackage {
  key: string;
  tokens: number;
  priceInCents: number;
  pricePerToken: number;
  savings: number;
}

// Stripe Price IDs (for reference - actual IDs come from backend)
export const STRIPE_PRICE_IDS = {
  ACADEMY_MONTHLY: 'price_1SUCmKKtG2uGDhSNGAFa0mHD',
  ACADEMY_YEARLY: 'price_1SUCjTKtG2uGDhSNRWFbe07R',
  PRO_MONTHLY: 'price_1SU8gOKtG2uGDhSN8mVgkD1E',
  PRO_YEARLY: 'price_1SU8luKtG2uGDhSNZPP8UFR3',
  TEAM_PRO_MONTHLY: 'price_1SU8tRKtG2uGDhSNWiMGSxlN',
  TEAM_PRO_YEARLY: 'price_1SU8qRKtG2uGDhSNi8k6uB9z',
  ENTERPRISE_MONTHLY: 'price_1SU8vXKtG2uGDhSN2e92rn5J',
  ENTERPRISE_YEARLY: 'price_1SU8yGKtG2uGDhSN28rCp3Ta',
} as const;

// Pricing tiers configuration
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 Academy courses (basics)',
      'First lesson of each course',
      '5 playground tests/month',
      'Community support'
    ],
    limits: {
      tokensPerMonth: 5,
      maxTokenRollover: 0,
      teamMembers: 1,
      apiCalls: 0,
      playgroundTests: 5
    },
    rateLimits: {
      promptsPerDay: 5,
      promptsPerHour: 2,
      apiCallsPerMinute: 0
    },
    support: 'community'
  },
  {
    id: 'academy',
    name: 'Academy Only',
    description: 'Perfect for students and learners',
    monthlyPrice: 2900,      // $29/month
    yearlyPrice: 24000,      // $240/year ($20/month - save $108)
    badge: 'For Learners',
    features: [
      'All 57 courses + 555 lessons',
      'Audio learning & quizzes',
      'Earn certificates',
      '50 playground tests/month',
      'Community forum access',
      'Email support'
    ],
    limits: {
      tokensPerMonth: 0,
      maxTokenRollover: 0,
      teamMembers: 1,
      apiCalls: 0,
      playgroundTests: 50
    },
    rateLimits: {
      promptsPerDay: 0,
      promptsPerHour: 0,
      apiCallsPerMinute: 0
    },
    support: 'email'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Full platform: Academy + Pro Tools',
    monthlyPrice: 4900,      // $49/month
    yearlyPrice: 40800,      // $408/year ($34/month - save $180)
    badge: 'Most Popular',
    popular: true,
    features: [
      'Everything in Academy, PLUS:',
      '200 AI prompts per month',
      '50+ professional templates',
      'Advanced analytics',
      'Priority email support',
      'Export & integrations'
    ],
    limits: {
      tokensPerMonth: 200,
      maxTokenRollover: 50,
      teamMembers: 1,
      apiCalls: 100,
      playgroundTests: 200
    },
    rateLimits: {
      promptsPerDay: 50,
      promptsPerHour: 10,
      apiCallsPerMinute: 5
    },
    support: 'priority'
  },
  {
    id: 'team_pro',
    name: 'Team Pro',
    description: 'For small teams (2-5 people)',
    monthlyPrice: 9900,      // $99/month
    yearlyPrice: 82800,      // $828/year ($69/month - save $360)
    badge: 'Best for Teams',
    features: [
      'Everything in Pro, PLUS:',
      '1,000 AI prompts/month (5x more)',
      '2-5 team member seats',
      'Team collaboration workspace',
      '100 API calls/month',
      'Priority chat support'
    ],
    limits: {
      tokensPerMonth: 1000,
      maxTokenRollover: 200,
      teamMembers: 5,
      apiCalls: 100,
      playgroundTests: 500
    },
    rateLimits: {
      promptsPerDay: 200,
      promptsPerHour: 50,
      apiCallsPerMinute: 20
    },
    support: 'priority_chat'
  },
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
      'Unlimited team members',
      'Custom branding & certificates',
      'White-label options',
      'Dedicated account manager',
      'SSO & advanced security'
    ],
    limits: {
      tokensPerMonth: 5000,
      maxTokenRollover: 1000,
      teamMembers: -1,  // Unlimited
      apiCalls: 10000,
      playgroundTests: -1  // Unlimited
    },
    rateLimits: {
      promptsPerDay: 500,
      promptsPerHour: 100,
      apiCallsPerMinute: 100
    },
    support: 'dedicated'
  }
];

// Token packages configuration
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

// Helper functions
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

export default {
  PRICING_TIERS,
  TOKEN_PACKAGES,
  STRIPE_PRICE_IDS,
  formatPrice,
  formatPriceShort,
  getMonthlyEquivalent,
  calculateYearlySavings,
  getPricingTierById,
  getStripePriceId
};
