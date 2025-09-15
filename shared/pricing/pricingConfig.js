/**
 * Core pricing configuration for Smart PromptIQ
 * All monetary values are in cents to avoid floating point errors
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
  small: {
    tokens: 25,
    priceInCents: 499,    // $4.99
    pricePerToken: 19.96, // $0.200/token in cents
    stripeId: 'price_tokens_25'
  },
  medium: {
    tokens: 100,
    priceInCents: 1799,   // $17.99
    pricePerToken: 17.99, // $0.180/token in cents
    stripeId: 'price_tokens_100'
  },
  large: {
    tokens: 500,
    priceInCents: 7999,   // $79.99
    pricePerToken: 16.00, // $0.160/token in cents
    stripeId: 'price_tokens_500'
  },
  bulk: {
    tokens: 1000,
    priceInCents: 14999,  // $149.99
    pricePerToken: 15.00, // $0.150/token in cents
    stripeId: 'price_tokens_1000'
  }
};

// Subscription tiers
const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    priceInCents: 0,
    tokensPerMonth: 5,
    maxTokenRollover: 0,
    templates: false,
    apiAccess: false,
    apiCallsPerMonth: 0,
    teamMembers: 1,
    support: 'Community support',
    features: [
      '5 free prompts',
      'Basic categories',
      'Community support'
    ],
    stripeIds: {
      monthly: null,
      yearly: null
    },
    rateLimits: {
      promptsPerDay: 5,
      promptsPerHour: 2,
      requireCaptcha: true,
      requireEmailVerification: true
    }
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceInCents: 1499,   // $14.99/month
    tokensPerMonth: 200,
    maxTokenRollover: 50,
    templates: true,
    apiAccess: false,
    apiCallsPerMonth: 0,
    teamMembers: 1,
    support: 'Email support',
    popular: true,
    features: [
      '200 prompts/month',
      'All categories',
      'Email support',
      'Templates',
      'Basic analytics'
    ],
    stripeIds: {
      monthly: 'price_starter_monthly',
      yearly: 'price_starter_yearly'
    },
    rateLimits: {
      promptsPerDay: 50,
      promptsPerHour: 10,
      apiCallsPerMinute: 0
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceInCents: 4999,   // $49.99/month
    tokensPerMonth: 1000,
    maxTokenRollover: 200,
    templates: true,
    apiAccess: true,
    apiCallsPerMonth: 1000,
    teamMembers: 5,
    support: 'Priority support',
    features: [
      '1000 prompts/month',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
      'API access'
    ],
    stripeIds: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly'
    },
    rateLimits: {
      promptsPerDay: 200,
      promptsPerHour: 50,
      apiCallsPerMinute: 20
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    priceInCents: 14999,  // $149.99/month
    tokensPerMonth: 5000,
    maxTokenRollover: 1000,
    templates: true,
    apiAccess: true,
    apiCallsPerMonth: 10000,
    teamMembers: 25,
    support: '24/7 support',
    features: [
      '5000 prompts/month',
      '24/7 support',
      'Custom categories',
      'White-label options',
      'Advanced integrations'
    ],
    stripeIds: {
      monthly: 'price_business_monthly',
      yearly: 'price_business_yearly'
    },
    rateLimits: {
      promptsPerDay: 500,
      promptsPerHour: 100,
      apiCallsPerMinute: 100
    }
  },
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
    discountPercent: 20,  // 20% discount for yearly
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
    .sort((a, b) => a.pricePerToken - b.pricePerToken); // Sort by price per token

  let remainingTokens = tokensNeeded;
  let totalCost = 0;
  const purchaseBreakdown = [];

  // Start with the most cost-effective packages
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

  // Handle remaining tokens with the smallest package
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
  
  const basePrice = tier.priceInCents;
  if (billingCycle === 'yearly') {
    return Math.floor(basePrice * cycle.multiplier);
  }
  
  return basePrice;
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

module.exports = {
  TOKEN_CONSUMPTION,
  TOKEN_PACKAGES,
  SUBSCRIPTION_TIERS,
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