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
    categories: number | 'unlimited';
    teamMembers: number | 'unlimited';
    templatesCustom: number | 'unlimited';
    apiCalls: number | 'unlimited';
    promptHistory: number; // days
    exportFormats: string[];
    support: 'community' | 'email' | 'priority' | 'dedicated';
  };
  popular?: boolean;
  color: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for individuals getting started with AI prompts',
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: '',
      yearly: '',
    },
    features: [
      '10 AI-generated prompts per month',
      'Access to 3 basic categories',
      '5 pre-built templates',
      'Basic customization options',
      'Community support',
      '7-day prompt history',
    ],
    limits: {
      promptsPerMonth: 10,
      tokensPerMonth: 5000,
      categories: 3,
      teamMembers: 1,
      templatesCustom: 0,
      apiCalls: 0,
      promptHistory: 7,
      exportFormats: ['txt'],
      support: 'community',
    },
    color: 'slate',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Ideal for professionals and small teams',
    price: {
      monthly: 19,
      yearly: 190, // 2 months free
    },
    stripeIds: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly',
    },
    features: [
      '500 AI-generated prompts per month',
      'Access to all 15+ categories',
      'Unlimited custom templates',
      'Advanced customization & refinement',
      'Team collaboration (up to 5 members)',
      'Analytics dashboard',
      'Priority email support',
      '30-day prompt history',
      'Export to PDF, DOC, JSON',
      'Prompt versioning',
    ],
    limits: {
      promptsPerMonth: 500,
      tokensPerMonth: 125000,
      categories: 'unlimited',
      teamMembers: 5,
      templatesCustom: 'unlimited',
      apiCalls: 1000,
      promptHistory: 30,
      exportFormats: ['txt', 'pdf', 'doc', 'json'],
      support: 'email',
    },
    popular: true,
    color: 'indigo',
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Best for growing teams and departments',
    price: {
      monthly: 49,
      yearly: 490, // 2 months free
    },
    stripeIds: {
      monthly: 'price_team_monthly',
      yearly: 'price_team_yearly',
    },
    features: [
      '2,000 AI-generated prompts per month',
      'Access to all categories + custom categories',
      'Unlimited custom templates',
      'Advanced team collaboration (up to 25 members)',
      'Team analytics & insights',
      'Centralized billing management',
      'Advanced prompt sharing & permissions',
      'Priority support',
      '90-day prompt history',
      'All export formats + API access',
      'Custom integrations',
      'White-label options',
    ],
    limits: {
      promptsPerMonth: 2000,
      tokensPerMonth: 500000,
      categories: 'unlimited',
      teamMembers: 25,
      templatesCustom: 'unlimited',
      apiCalls: 10000,
      promptHistory: 90,
      exportFormats: ['txt', 'pdf', 'doc', 'json', 'csv', 'xml'],
      support: 'priority',
    },
    color: 'purple',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    price: {
      monthly: 199,
      yearly: 1990, // 2 months free
    },
    stripeIds: {
      monthly: 'price_enterprise_monthly',
      yearly: 'price_enterprise_yearly',
    },
    features: [
      'Unlimited AI-generated prompts',
      'Custom categories & workflows',
      'Unlimited team members',
      'Advanced analytics & reporting',
      'SSO & advanced security',
      'Dedicated account manager',
      'Custom integrations & API',
      'White-label solutions',
      'Unlimited prompt history',
      'All export formats',
      'Custom model training',
      'On-premise deployment options',
      'SLA guarantees',
    ],
    limits: {
      promptsPerMonth: -1, // unlimited
      tokensPerMonth: -1, // unlimited
      categories: 'unlimited',
      teamMembers: 'unlimited',
      templatesCustom: 'unlimited',
      apiCalls: 'unlimited',
      promptHistory: -1, // unlimited
      exportFormats: ['txt', 'pdf', 'doc', 'json', 'csv', 'xml', 'yaml'],
      support: 'dedicated',
    },
    color: 'amber',
  },
];

export const ADDON_FEATURES = {
  extra_prompts: {
    name: 'Additional Prompts',
    description: 'Add 100 extra prompts to your monthly limit',
    price: 5,
    stripeId: 'price_addon_prompts',
  },
  extra_team_members: {
    name: 'Additional Team Members',
    description: 'Add up to 10 more team members',
    price: 8,
    stripeId: 'price_addon_team_members',
  },
  priority_processing: {
    name: 'Priority Processing',
    description: 'Get your prompts generated 3x faster',
    price: 10,
    stripeId: 'price_addon_priority',
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
  return limit === 'unlimited' || (typeof limit === 'number' && limit > 0);
}

export function getUsagePercentage(used: number, limit: number | 'unlimited'): number {
  if (limit === 'unlimited' || limit === -1) return 0;
  if (typeof limit !== 'number') return 0;
  return Math.min((used / limit) * 100, 100);
}