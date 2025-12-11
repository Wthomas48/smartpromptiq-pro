/**
 * SmartPromptIQ Pricing Configuration
 * Central configuration for all pricing tiers and Stripe price IDs
 *
 * IMPORTANT: Update the environment variables in Railway with these price IDs
 * before deployment. Create products/prices in Stripe Dashboard first.
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
  stripePriceId: string;
  savings: number;  // Percentage savings compared to base rate
}

// Get Stripe Price IDs from environment variables
export const getStripePriceIds = () => ({
  // Academy Only Subscription
  ACADEMY_MONTHLY: process.env.STRIPE_PRICE_ACADEMY_MONTHLY || '',
  ACADEMY_YEARLY: process.env.STRIPE_PRICE_ACADEMY_YEARLY || '',

  // Pro Plan (Full Platform)
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || '',

  // Team Pro Plan (2-5 members)
  TEAM_PRO_MONTHLY: process.env.STRIPE_PRICE_TEAM_PRO_MONTHLY || '',
  TEAM_PRO_YEARLY: process.env.STRIPE_PRICE_TEAM_PRO_YEARLY || '',

  // Business Plan (Legacy/Future)
  BUSINESS_MONTHLY: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
  BUSINESS_YEARLY: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',

  // Enterprise Plan
  ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  ENTERPRISE_YEARLY: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',

  // Token Packages
  TOKENS_25: process.env.STRIPE_PRICE_TOKENS_25 || '',
  TOKENS_100: process.env.STRIPE_PRICE_TOKENS_100 || '',
  TOKENS_500: process.env.STRIPE_PRICE_TOKENS_500 || '',
  TOKENS_1000: process.env.STRIPE_PRICE_TOKENS_1000 || '',
});

// Pricing tiers configuration
export const getPricingTiers = (): PricingTier[] => {
  const priceIds = getStripePriceIds();

  return [
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
      stripePriceMonthly: priceIds.ACADEMY_MONTHLY,
      stripePriceYearly: priceIds.ACADEMY_YEARLY,
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
        tokensPerMonth: 0,     // No Pro tool prompts
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
      stripePriceMonthly: priceIds.PRO_MONTHLY,
      stripePriceYearly: priceIds.PRO_YEARLY,
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
      stripePriceMonthly: priceIds.TEAM_PRO_MONTHLY,
      stripePriceYearly: priceIds.TEAM_PRO_YEARLY,
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
      stripePriceMonthly: priceIds.ENTERPRISE_MONTHLY,
      stripePriceYearly: priceIds.ENTERPRISE_YEARLY,
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
};

// Token packages configuration
export const getTokenPackages = (): TokenPackage[] => {
  const priceIds = getStripePriceIds();

  return [
    {
      key: 'small',
      tokens: 25,
      priceInCents: 499,       // $4.99
      pricePerToken: 19.96,    // $0.1996 per token
      stripePriceId: priceIds.TOKENS_25,
      savings: 0
    },
    {
      key: 'medium',
      tokens: 100,
      priceInCents: 1799,      // $17.99
      pricePerToken: 17.99,    // $0.1799 per token
      stripePriceId: priceIds.TOKENS_100,
      savings: 10
    },
    {
      key: 'large',
      tokens: 500,
      priceInCents: 7999,      // $79.99
      pricePerToken: 16.00,    // $0.16 per token
      stripePriceId: priceIds.TOKENS_500,
      savings: 20
    },
    {
      key: 'bulk',
      tokens: 1000,
      priceInCents: 14999,     // $149.99
      pricePerToken: 15.00,    // $0.15 per token
      stripePriceId: priceIds.TOKENS_1000,
      savings: 25
    }
  ];
};

// Map Stripe price ID to plan name
export const getPlanFromPriceId = (priceId: string): string => {
  const priceIds = getStripePriceIds();

  const mapping: Record<string, string> = {
    // Academy
    [priceIds.ACADEMY_MONTHLY]: 'ACADEMY',
    [priceIds.ACADEMY_YEARLY]: 'ACADEMY',

    // Pro
    [priceIds.PRO_MONTHLY]: 'PRO',
    [priceIds.PRO_YEARLY]: 'PRO',

    // Team Pro
    [priceIds.TEAM_PRO_MONTHLY]: 'TEAM_PRO',
    [priceIds.TEAM_PRO_YEARLY]: 'TEAM_PRO',

    // Business (Legacy)
    [priceIds.BUSINESS_MONTHLY]: 'BUSINESS',
    [priceIds.BUSINESS_YEARLY]: 'BUSINESS',

    // Enterprise
    [priceIds.ENTERPRISE_MONTHLY]: 'ENTERPRISE',
    [priceIds.ENTERPRISE_YEARLY]: 'ENTERPRISE',

    // Legacy Starter Plan (map to Pro)
    'price_1QKrTdJNxVjDuJxhRtAMo2K7': 'PRO',
    'price_1QKrTdJNxVjDuJxhRtAMo2K8': 'PRO',

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
    'ACADEMY': 'academy',
    'PRO': 'pro',
    'TEAM_PRO': 'pro',
    'BUSINESS': 'pro',
    'ENTERPRISE': 'enterprise',
    'FREE': 'free'
  };

  return tierMapping[plan] || 'free';
};

// Get generation limits by plan
export const getGenerationLimits = (plan: string): number => {
  const limitsMapping: Record<string, number> = {
    'ACADEMY': 0,
    'PRO': 200,
    'TEAM_PRO': 1000,
    'BUSINESS': 1000,
    'ENTERPRISE': 5000,
    'FREE': 5
  };

  return limitsMapping[plan] || 5;
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
    { name: 'ACADEMY_MONTHLY', value: priceIds.ACADEMY_MONTHLY },
    { name: 'ACADEMY_YEARLY', value: priceIds.ACADEMY_YEARLY },
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
  getStripePriceIds,
  getPlanFromPriceId,
  getSubscriptionTier,
  getGenerationLimits,
  isValidPriceId,
  validatePricingConfiguration
};
