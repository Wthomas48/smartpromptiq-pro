/**
 * Core pricing configuration for Smart PromptIQ
 * All monetary values are in cents to avoid floating point errors
 *
 * UPDATED: 6-Tier Structure
 * - Free: $0 - Try before you buy
 * - Starter: $19/mo - Entry-level creative tools
 * - Academy+: $29/mo - Full education + basic creative
 * - Pro: $49/mo - Full platform for creators (Most Popular)
 * - Team Pro: $99/mo - Teams of 2-5
 * - Enterprise: $299/mo - Large organizations
 */

// Token consumption based on prompt complexity
const TOKEN_CONSUMPTION = {
  simple: 1,      // Basic prompts
  standard: 3,    // Standard prompts
  complex: 7,     // Complex prompts
  custom: 15      // Advanced/custom prompts
};

// Token packages for pay-per-use model
const TOKEN_PACKAGES = {
  addon_small: {
    tokens: 20,
    priceInCents: 500,    // $5.00
    pricePerToken: 25.00, // $0.250/token in cents
    stripeId: 'price_1QKrTdJNxVjDuJxhRtAMo2L3',
    label: '20 Extra Tokens'
  },
  addon_medium: {
    tokens: 50,
    priceInCents: 1000,   // $10.00
    pricePerToken: 20.00, // $0.200/token in cents
    stripeId: 'price_1QKrTdJNxVjDuJxhRtAMo2L4',
    label: '50 Extra Tokens'
  },
  small: {
    tokens: 25,
    priceInCents: 499,    // $4.99
    pricePerToken: 19.96,
    stripeId: 'price_tokens_25'
  },
  medium: {
    tokens: 100,
    priceInCents: 1799,   // $17.99
    pricePerToken: 17.99,
    stripeId: 'price_tokens_100'
  },
  large: {
    tokens: 500,
    priceInCents: 7999,   // $79.99
    pricePerToken: 16.00,
    stripeId: 'price_tokens_500'
  },
  bulk: {
    tokens: 1000,
    priceInCents: 14999,  // $149.99
    pricePerToken: 15.00,
    stripeId: 'price_tokens_1000'
  }
};

// Add-on packages for creative tools
const ADDON_PACKAGES = {
  voice_pack: {
    name: 'Voice Pack',
    description: '+50 voice generations',
    priceInCents: 999,
    stripeId: 'price_addon_voice_pack',
    contents: { voices: 50 }
  },
  music_pack: {
    name: 'Music Pack',
    description: '+30 Suno music tracks',
    priceInCents: 1499,
    stripeId: 'price_addon_music_pack',
    contents: { music: 30 }
  },
  video_pack: {
    name: 'Video Pack',
    description: '+20 video exports',
    priceInCents: 1999,
    stripeId: 'price_addon_video_pack',
    contents: { videos: 20 }
  },
  creator_bundle: {
    name: 'Creator Bundle',
    description: 'Best value for content creators',
    priceInCents: 2999,
    stripeId: 'price_addon_creator_bundle',
    contents: { prompts: 100, voices: 50, music: 20, images: 30 },
    popular: true
  },
  agency_pack: {
    name: 'Agency Pack',
    description: 'High-volume content production',
    priceInCents: 4999,
    stripeId: 'price_addon_agency_pack',
    contents: { prompts: 500, voices: 100, music: 50, videos: 30, images: 100 }
  }
};

// 6-Tier Subscription structure
const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    priceInCents: 0,
    yearlyPriceInCents: 0,
    tokensPerMonth: 5,
    maxTokenRollover: 0,
    templates: false,
    apiAccess: false,
    apiCallsPerMonth: 0,
    teamMembers: 1,
    support: 'Community support',
    features: [
      '5 AI prompts/month',
      '3 free Academy courses',
      '5 voice generations',
      '3 music tracks',
      '5 image generations',
      'Community support'
    ],
    limits: {
      promptsPerMonth: 5,
      voiceGenerations: 5,
      musicTracks: 3,
      videoExports: 0,
      imageGenerations: 5,
      introOutros: 0,
      blueprints: 1
    },
    stripeIds: {
      monthly: null,
      yearly: null
    },
    rateLimits: {
      promptsPerDay: 5,
      promptsPerHour: 2,
      requireCaptcha: true,
      requireEmailVerification: true
    },
    commercialLicense: false,
    hdExport: false,
    fourKExport: false,
    watermarkRemoval: false,
    priorityQueue: false
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceInCents: 1900,   // $19/month
    yearlyPriceInCents: 15600, // $156/year ($13/mo)
    tokensPerMonth: 50,
    maxTokenRollover: 10,
    templates: true,
    apiAccess: false,
    apiCallsPerMonth: 0,
    teamMembers: 1,
    support: 'Email support',
    badge: 'Best Value',
    buttonLabel: 'Choose Plan',
    features: [
      '50 AI prompts/month',
      '50 voice generations',
      '10 music tracks',
      '30 image generations',
      '5 intro/outro videos',
      '3 BuilderIQ blueprints',
      'HD video export',
      'Email support'
    ],
    limits: {
      promptsPerMonth: 50,
      voiceGenerations: 50,
      musicTracks: 10,
      videoExports: 5,
      imageGenerations: 30,
      introOutros: 5,
      blueprints: 3
    },
    stripeIds: {
      monthly: 'price_starter_monthly',
      yearly: 'price_starter_yearly'
    },
    rateLimits: {
      promptsPerDay: 50,
      promptsPerHour: 10,
      apiCallsPerMinute: 0
    },
    commercialLicense: false,
    hdExport: true,
    fourKExport: false,
    watermarkRemoval: false,
    priorityQueue: false
  },
  academy_plus: {
    id: 'academy_plus',
    name: 'Academy+',
    priceInCents: 2900,   // $29/month
    yearlyPriceInCents: 24000, // $240/year ($20/mo)
    tokensPerMonth: 100,
    maxTokenRollover: 25,
    templates: true,
    apiAccess: false,
    apiCallsPerMonth: 0,
    teamMembers: 1,
    support: 'Email support',
    badge: 'For Learners',
    buttonLabel: 'Choose Plan',
    features: [
      'All 57 Academy courses',
      '555+ lessons with certificates',
      '100 AI prompts/month',
      '75 voice generations',
      '20 music tracks',
      '50 image generations',
      'Audio learning & quizzes',
      'Email support'
    ],
    limits: {
      promptsPerMonth: 100,
      voiceGenerations: 75,
      musicTracks: 20,
      videoExports: 10,
      imageGenerations: 50,
      introOutros: 10,
      blueprints: 5
    },
    stripeIds: {
      monthly: 'price_academy_monthly',
      yearly: 'price_academy_yearly'
    },
    rateLimits: {
      promptsPerDay: 100,
      promptsPerHour: 20,
      apiCallsPerMinute: 0
    },
    commercialLicense: false,
    hdExport: true,
    fourKExport: false,
    watermarkRemoval: false,
    priorityQueue: false
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceInCents: 4900,   // $49/month
    yearlyPriceInCents: 40800, // $408/year ($34/mo)
    tokensPerMonth: 200,
    maxTokenRollover: 50,
    templates: true,
    apiAccess: true,
    apiCallsPerMonth: 100,
    teamMembers: 1,
    support: 'Priority support',
    popular: true,
    badge: 'Most Popular',
    buttonLabel: 'Choose Plan',
    features: [
      '200 AI prompts/month',
      'All 57 Academy courses',
      '200 voice generations',
      '50 Suno music tracks',
      '100 DALL-E 3 images',
      '30 video exports',
      'Commercial license',
      'Remove watermarks',
      'Priority support'
    ],
    limits: {
      promptsPerMonth: 200,
      voiceGenerations: 200,
      musicTracks: 50,
      videoExports: 30,
      imageGenerations: 100,
      introOutros: 30,
      blueprints: 10
    },
    stripeIds: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly'
    },
    rateLimits: {
      promptsPerDay: 200,
      promptsPerHour: 50,
      apiCallsPerMinute: 20
    },
    commercialLicense: true,
    hdExport: true,
    fourKExport: false,
    watermarkRemoval: true,
    priorityQueue: true
  },
  team_pro: {
    id: 'team_pro',
    name: 'Team Pro',
    priceInCents: 9900,   // $99/month
    yearlyPriceInCents: 82800, // $828/year ($69/mo)
    tokensPerMonth: 1000,
    maxTokenRollover: 200,
    templates: true,
    apiAccess: true,
    apiCallsPerMonth: 1000,
    teamMembers: 5,
    support: 'Priority chat support',
    badge: 'Best for Teams',
    buttonLabel: 'Choose Plan',
    features: [
      '1,000 AI prompts/month',
      '500 voice generations',
      '150 Suno music tracks',
      '300 DALL-E 3 images',
      '100 video exports (4K)',
      '2-5 team members',
      'Team workspace',
      '1,000 API calls/month',
      'Priority chat support'
    ],
    limits: {
      promptsPerMonth: 1000,
      voiceGenerations: 500,
      musicTracks: 150,
      videoExports: 100,
      imageGenerations: 300,
      introOutros: 100,
      blueprints: -1 // Unlimited
    },
    stripeIds: {
      monthly: 'price_team_pro_monthly',
      yearly: 'price_team_pro_yearly'
    },
    rateLimits: {
      promptsPerDay: 500,
      promptsPerHour: 100,
      apiCallsPerMinute: 50
    },
    commercialLicense: true,
    hdExport: true,
    fourKExport: true,
    watermarkRemoval: true,
    priorityQueue: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceInCents: 29900,  // $299/month
    yearlyPriceInCents: 299900, // $2999/year (~$250/mo)
    tokensPerMonth: 5000,
    maxTokenRollover: 1000,
    templates: true,
    apiAccess: true,
    apiCallsPerMonth: -1, // Unlimited
    teamMembers: -1, // Unlimited
    support: 'Dedicated account manager',
    badge: 'Contact Sales',
    buttonLabel: 'Contact Sales',
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
      'SSO & advanced security'
    ],
    limits: {
      promptsPerMonth: -1, // Unlimited
      voiceGenerations: -1,
      musicTracks: -1,
      videoExports: -1,
      imageGenerations: -1,
      introOutros: -1,
      blueprints: -1
    },
    stripeIds: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly'
    },
    rateLimits: {
      promptsPerDay: -1, // Unlimited
      promptsPerHour: -1,
      apiCallsPerMinute: -1
    },
    commercialLicense: true,
    hdExport: true,
    fourKExport: true,
    watermarkRemoval: true,
    priorityQueue: true
  }
};

// Free tier upsell configuration
const FREE_TIER_UPSELL = {
  trigger: {
    promptsUsed: 4,
    promptsLimit: 5,
    percentage: 80 // Trigger at 80% usage
  },
  message: "You're almost out of free prompts. Upgrade to Starter or Pro for more!",
  cta: "Upgrade Now",
  recommendedTiers: ['starter', 'pro']
};

// Cost protection settings
const COST_PROTECTION = {
  maxCostPercentageOfPayment: 0.3, // Alert when costs exceed 30% of payment
  hardLimitPercentage: 0.7,        // Hard stop at 70%
  minimumProfitMarginMultiplier: 3.0, // Minimum 3x margin
  tokenExpiryDays: 90
};

// API cost estimates (in cents per request)
const API_COSTS = {
  openai: {
    gpt3_5_turbo: 0.2,    // $0.002 per request estimate
    gpt4: 0.6,            // $0.006 per request estimate
  },
  claude: {
    sonnet: 0.3,          // $0.003 per request estimate
    opus: 1.5,            // $0.015 per request estimate
  }
};

// Billing cycles with discounts
const BILLING_CYCLES = {
  monthly: {
    label: 'Monthly',
    discountPercent: 0,
    multiplier: 1
  },
  yearly: {
    label: 'Yearly',
    discountPercent: 17,  // ~17% discount for yearly (2 months free)
    multiplier: 10        // Pay for 10 months, get 12
  }
};

/**
 * Calculate the effective price per token for a package
 */
function calculateTokenPrice(packageKey) {
  const pkg = TOKEN_PACKAGES[packageKey];
  if (!pkg) throw new Error(`Invalid package key: ${packageKey}`);
  return pkg.pricePerToken;
}

/**
 * Calculate total cost for a number of tokens using the most efficient packages
 */
function calculateOptimalTokenCost(tokensNeeded) {
  const packages = Object.entries(TOKEN_PACKAGES)
    .map(([key, pkg]) => ({ key, ...pkg }))
    .sort((a, b) => a.pricePerToken - b.pricePerToken);

  let remainingTokens = tokensNeeded;
  let totalCost = 0;
  const purchaseBreakdown = [];

  for (const pkg of packages.reverse()) {
    if (remainingTokens <= 0) break;

    const packagesNeeded = Math.floor(remainingTokens / pkg.tokens);
    if (packagesNeeded > 0) {
      const cost = packagesNeeded * pkg.priceInCents;
      totalCost += cost;
      remainingTokens -= packagesNeeded * pkg.tokens;
      purchaseBreakdown.push({
        package: pkg.key,
        quantity: packagesNeeded,
        tokens: packagesNeeded * pkg.tokens,
        cost
      });
    }
  }

  if (remainingTokens > 0) {
    const smallestPkg = TOKEN_PACKAGES.small;
    const cost = smallestPkg.priceInCents;
    totalCost += cost;
    purchaseBreakdown.push({
      package: 'small',
      quantity: 1,
      tokens: smallestPkg.tokens,
      cost
    });
  }

  return {
    totalCostInCents: totalCost,
    breakdown: purchaseBreakdown,
    tokensReceived: purchaseBreakdown.reduce((sum, item) => sum + item.tokens, 0)
  };
}

/**
 * Calculate subscription price with billing cycle discount
 */
function calculateSubscriptionPrice(tierId, billingCycle) {
  const tier = SUBSCRIPTION_TIERS[tierId];
  if (!tier) throw new Error(`Invalid tier ID: ${tierId}`);

  const cycle = BILLING_CYCLES[billingCycle];
  if (!cycle) throw new Error(`Invalid billing cycle: ${billingCycle}`);

  if (billingCycle === 'yearly') {
    return tier.yearlyPriceInCents;
  }

  return tier.priceInCents;
}

/**
 * Get tier information by ID
 */
function getTierInfo(tierId) {
  return SUBSCRIPTION_TIERS[tierId] || null;
}

/**
 * Check if a user has exceeded cost thresholds
 */
function checkCostThreshold(userCosts, userPayments) {
  const costRatio = userCosts / userPayments;
  return {
    isWarning: costRatio >= COST_PROTECTION.maxCostPercentageOfPayment,
    isHardLimit: costRatio >= COST_PROTECTION.hardLimitPercentage,
    ratio: costRatio,
    percentage: Math.round(costRatio * 100)
  };
}

/**
 * Calculate profit margin for a user
 */
function calculateProfitMargin(revenue, costs) {
  if (costs === 0) return Infinity;
  return revenue / costs;
}

/**
 * Validate if a pricing operation maintains minimum margin
 */
function validateMinimumMargin(revenue, estimatedCosts) {
  const margin = calculateProfitMargin(revenue, estimatedCosts);
  return margin >= COST_PROTECTION.minimumProfitMarginMultiplier;
}

export {
  TOKEN_CONSUMPTION,
  TOKEN_PACKAGES,
  ADDON_PACKAGES,
  SUBSCRIPTION_TIERS,
  FREE_TIER_UPSELL,
  COST_PROTECTION,
  API_COSTS,
  BILLING_CYCLES,
  calculateTokenPrice,
  calculateOptimalTokenCost,
  calculateSubscriptionPrice,
  getTierInfo,
  checkCostThreshold,
  calculateProfitMargin,
  validateMinimumMargin
};
