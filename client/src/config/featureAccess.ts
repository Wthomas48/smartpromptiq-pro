/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - FEATURE ACCESS CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Defines which features are available for each subscription tier.
 * This is the single source of truth for feature gating across the app.
 *
 * TIERS:
 * - free: Basic access, limited features
 * - starter: Entry paid tier ($19/mo) - Good for individuals
 * - pro: Professional tier ($49/mo) - Most popular, content creators
 * - business: Business tier ($99/mo) - Teams and agencies
 * - enterprise: Enterprise tier ($299/mo) - Large organizations
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export const TIER_HIERARCHY: SubscriptionTier[] = ['free', 'starter', 'pro', 'business', 'enterprise'];

export const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
};

export const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'from-gray-400 to-gray-500',
  starter: 'from-blue-400 to-cyan-500',
  pro: 'from-purple-500 to-pink-500',
  business: 'from-amber-500 to-orange-500',
  enterprise: 'from-indigo-600 to-purple-600',
};

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

export type FeatureCategory =
  | 'prompts'
  | 'voice'
  | 'music'
  | 'design'
  | 'builderiq'
  | 'academy'
  | 'intro_outro'
  | 'downloads'
  | 'api'
  | 'team'
  | 'support';

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE LIMITS BY TIER
// ═══════════════════════════════════════════════════════════════════════════════

export interface TierLimits {
  // Prompt Generation
  promptsPerMonth: number;
  tokensPerMonth: number;
  advancedModels: boolean; // GPT-4, Claude, etc.

  // Voice Builder
  voiceGenerationsPerMonth: number;
  openAIVoices: boolean;
  elevenLabsVoices: boolean;
  premiumElevenLabsVoices: boolean;
  voiceDownloads: boolean;
  voiceCommercialUse: boolean;

  // Music & Intro/Outro
  musicTracksPerMonth: number;
  introOutroAccess: boolean;
  introOutroDownloads: boolean;
  premiumMusicLibrary: boolean;
  voiceMusicMixing: boolean;

  // Design Studio
  imageGenerationsPerMonth: number;
  stableDiffusion: boolean;
  dalleAccess: boolean;
  dalle3Access: boolean;
  printIntegration: boolean;
  impossiblePrintPriority: boolean;

  // BuilderIQ
  blueprintsPerMonth: number;
  storyModeVoice: boolean;
  appTemplates: boolean;
  deploymentHub: boolean;
  codeExport: boolean;

  // Academy
  freeCourses: boolean;
  allCourses: boolean;
  certificates: boolean;
  earlyAccess: boolean;
  playgroundTests: number;

  // Downloads & Exports
  pdfExport: boolean;
  jsonExport: boolean;
  audioDownloads: boolean;
  videoExport: boolean;
  removeBranding: boolean;

  // API & Integration
  apiAccess: boolean;
  apiCallsPerMonth: number;
  webhooks: boolean;

  // Team
  teamMembers: number;
  teamWorkspace: boolean;
  adminDashboard: boolean;

  // Support
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  responseTime: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  // ─────────────────────────────────────────────────────────────────────────────
  // FREE TIER - Try before you buy
  // ─────────────────────────────────────────────────────────────────────────────
  free: {
    // Prompts
    promptsPerMonth: 10,
    tokensPerMonth: 50,
    advancedModels: false,

    // Voice
    voiceGenerationsPerMonth: 5,
    openAIVoices: true,
    elevenLabsVoices: false,
    premiumElevenLabsVoices: false,
    voiceDownloads: false, // Preview only
    voiceCommercialUse: false,

    // Music
    musicTracksPerMonth: 3,
    introOutroAccess: false,
    introOutroDownloads: false,
    premiumMusicLibrary: false,
    voiceMusicMixing: false,

    // Design
    imageGenerationsPerMonth: 5,
    stableDiffusion: true,
    dalleAccess: false,
    dalle3Access: false,
    printIntegration: false,
    impossiblePrintPriority: false,

    // BuilderIQ
    blueprintsPerMonth: 1,
    storyModeVoice: false,
    appTemplates: false,
    deploymentHub: false,
    codeExport: false,

    // Academy
    freeCourses: true,
    allCourses: false,
    certificates: false,
    earlyAccess: false,
    playgroundTests: 5,

    // Downloads
    pdfExport: false,
    jsonExport: false,
    audioDownloads: false,
    videoExport: false,
    removeBranding: false,

    // API
    apiAccess: false,
    apiCallsPerMonth: 0,
    webhooks: false,

    // Team
    teamMembers: 1,
    teamWorkspace: false,
    adminDashboard: false,

    // Support
    supportLevel: 'community',
    responseTime: '48-72 hours',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STARTER TIER - $19/month - Individual creators
  // ─────────────────────────────────────────────────────────────────────────────
  starter: {
    // Prompts
    promptsPerMonth: 100,
    tokensPerMonth: 500,
    advancedModels: false, // GPT-3.5 only

    // Voice
    voiceGenerationsPerMonth: 50,
    openAIVoices: true,
    elevenLabsVoices: false,
    premiumElevenLabsVoices: false,
    voiceDownloads: true,
    voiceCommercialUse: false,

    // Music
    musicTracksPerMonth: 10,
    introOutroAccess: true, // Basic
    introOutroDownloads: true,
    premiumMusicLibrary: false,
    voiceMusicMixing: false,

    // Design
    imageGenerationsPerMonth: 30,
    stableDiffusion: true,
    dalleAccess: false,
    dalle3Access: false,
    printIntegration: false,
    impossiblePrintPriority: false,

    // BuilderIQ
    blueprintsPerMonth: 3,
    storyModeVoice: false,
    appTemplates: true, // Basic templates
    deploymentHub: false,
    codeExport: false,

    // Academy
    freeCourses: true,
    allCourses: false,
    certificates: false,
    earlyAccess: false,
    playgroundTests: 25,

    // Downloads
    pdfExport: true,
    jsonExport: false,
    audioDownloads: true,
    videoExport: false,
    removeBranding: false,

    // API
    apiAccess: false,
    apiCallsPerMonth: 0,
    webhooks: false,

    // Team
    teamMembers: 1,
    teamWorkspace: false,
    adminDashboard: false,

    // Support
    supportLevel: 'email',
    responseTime: '24-48 hours',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PRO TIER - $49/month - Content creators & marketers (MOST POPULAR)
  // ─────────────────────────────────────────────────────────────────────────────
  pro: {
    // Prompts
    promptsPerMonth: 500,
    tokensPerMonth: 2000,
    advancedModels: true, // GPT-4, Claude

    // Voice
    voiceGenerationsPerMonth: 200,
    openAIVoices: true,
    elevenLabsVoices: true, // 25+ voices
    premiumElevenLabsVoices: false,
    voiceDownloads: true,
    voiceCommercialUse: true,

    // Music
    musicTracksPerMonth: 50,
    introOutroAccess: true,
    introOutroDownloads: true,
    premiumMusicLibrary: true,
    voiceMusicMixing: true,

    // Design
    imageGenerationsPerMonth: 100,
    stableDiffusion: true,
    dalleAccess: true,
    dalle3Access: true,
    printIntegration: true,
    impossiblePrintPriority: false,

    // BuilderIQ
    blueprintsPerMonth: 10,
    storyModeVoice: true,
    appTemplates: true,
    deploymentHub: true,
    codeExport: true,

    // Academy
    freeCourses: true,
    allCourses: true,
    certificates: true,
    earlyAccess: false,
    playgroundTests: 100,

    // Downloads
    pdfExport: true,
    jsonExport: true,
    audioDownloads: true,
    videoExport: true,
    removeBranding: false,

    // API
    apiAccess: false,
    apiCallsPerMonth: 0,
    webhooks: false,

    // Team
    teamMembers: 1,
    teamWorkspace: false,
    adminDashboard: false,

    // Support
    supportLevel: 'priority',
    responseTime: '12-24 hours',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BUSINESS TIER - $99/month - Teams and agencies
  // ─────────────────────────────────────────────────────────────────────────────
  business: {
    // Prompts
    promptsPerMonth: 2000,
    tokensPerMonth: 5000,
    advancedModels: true,

    // Voice
    voiceGenerationsPerMonth: 500,
    openAIVoices: true,
    elevenLabsVoices: true,
    premiumElevenLabsVoices: true, // Premium voices
    voiceDownloads: true,
    voiceCommercialUse: true,

    // Music
    musicTracksPerMonth: 150,
    introOutroAccess: true,
    introOutroDownloads: true,
    premiumMusicLibrary: true,
    voiceMusicMixing: true,

    // Design
    imageGenerationsPerMonth: 300,
    stableDiffusion: true,
    dalleAccess: true,
    dalle3Access: true,
    printIntegration: true,
    impossiblePrintPriority: true,

    // BuilderIQ
    blueprintsPerMonth: -1, // Unlimited
    storyModeVoice: true,
    appTemplates: true,
    deploymentHub: true,
    codeExport: true,

    // Academy
    freeCourses: true,
    allCourses: true,
    certificates: true,
    earlyAccess: true,
    playgroundTests: 500,

    // Downloads
    pdfExport: true,
    jsonExport: true,
    audioDownloads: true,
    videoExport: true,
    removeBranding: true, // White-label

    // API
    apiAccess: true,
    apiCallsPerMonth: 1000,
    webhooks: true,

    // Team
    teamMembers: 5,
    teamWorkspace: true,
    adminDashboard: true,

    // Support
    supportLevel: 'priority',
    responseTime: '4-12 hours',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ENTERPRISE TIER - $299/month - Large organizations
  // ─────────────────────────────────────────────────────────────────────────────
  enterprise: {
    // Prompts
    promptsPerMonth: -1, // Unlimited
    tokensPerMonth: 20000,
    advancedModels: true,

    // Voice
    voiceGenerationsPerMonth: -1, // Unlimited
    openAIVoices: true,
    elevenLabsVoices: true,
    premiumElevenLabsVoices: true,
    voiceDownloads: true,
    voiceCommercialUse: true,

    // Music
    musicTracksPerMonth: -1, // Unlimited
    introOutroAccess: true,
    introOutroDownloads: true,
    premiumMusicLibrary: true,
    voiceMusicMixing: true,

    // Design
    imageGenerationsPerMonth: -1, // Unlimited
    stableDiffusion: true,
    dalleAccess: true,
    dalle3Access: true,
    printIntegration: true,
    impossiblePrintPriority: true,

    // BuilderIQ
    blueprintsPerMonth: -1, // Unlimited
    storyModeVoice: true,
    appTemplates: true,
    deploymentHub: true,
    codeExport: true,

    // Academy
    freeCourses: true,
    allCourses: true,
    certificates: true,
    earlyAccess: true,
    playgroundTests: -1, // Unlimited

    // Downloads
    pdfExport: true,
    jsonExport: true,
    audioDownloads: true,
    videoExport: true,
    removeBranding: true,

    // API
    apiAccess: true,
    apiCallsPerMonth: -1, // Unlimited
    webhooks: true,

    // Team
    teamMembers: -1, // Unlimited
    teamWorkspace: true,
    adminDashboard: true,

    // Support
    supportLevel: 'dedicated',
    responseTime: '1-4 hours',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get tier index for comparison
 */
export function getTierIndex(tier: SubscriptionTier): number {
  return TIER_HIERARCHY.indexOf(tier);
}

/**
 * Check if a tier meets or exceeds a required tier
 */
export function tierMeetsRequirement(
  currentTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  return getTierIndex(currentTier) >= getTierIndex(requiredTier);
}

/**
 * Get the minimum tier required for a feature
 */
export function getMinimumTierForFeature(
  featureKey: keyof TierLimits
): SubscriptionTier {
  for (const tier of TIER_HIERARCHY) {
    const limits = TIER_LIMITS[tier];
    const value = limits[featureKey];

    // For boolean features
    if (typeof value === 'boolean' && value === true) {
      return tier;
    }

    // For numeric features (> 0 means available)
    if (typeof value === 'number' && value !== 0) {
      return tier;
    }
  }

  return 'enterprise'; // Default to highest tier if not found
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(
  userTier: string | undefined | null,
  featureKey: keyof TierLimits
): boolean {
  const tier = normalizeTier(userTier);
  const limits = TIER_LIMITS[tier];
  const value = limits[featureKey];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return false;
}

/**
 * Get the limit for a feature
 */
export function getFeatureLimit(
  userTier: string | undefined | null,
  featureKey: keyof TierLimits
): number | boolean | string {
  const tier = normalizeTier(userTier);
  return TIER_LIMITS[tier][featureKey];
}

/**
 * Check if a limit is unlimited (-1)
 */
export function isUnlimited(value: number): boolean {
  return value === -1;
}

/**
 * Normalize tier string to SubscriptionTier type
 */
export function normalizeTier(tier: string | undefined | null): SubscriptionTier {
  if (!tier) return 'free';

  const lowerTier = tier.toLowerCase();

  // Handle various tier name formats
  if (lowerTier === 'free' || lowerTier === 'trial') return 'free';
  if (lowerTier === 'starter' || lowerTier === 'basic') return 'starter';
  if (lowerTier === 'pro' || lowerTier === 'professional') return 'pro';
  if (lowerTier === 'business' || lowerTier === 'team' || lowerTier === 'team_pro') return 'business';
  if (lowerTier === 'enterprise' || lowerTier === 'unlimited') return 'enterprise';

  return 'free';
}

/**
 * Get features that would be unlocked by upgrading to a tier
 */
export function getUpgradeFeatures(
  currentTier: SubscriptionTier,
  targetTier: SubscriptionTier
): string[] {
  const features: string[] = [];
  const currentLimits = TIER_LIMITS[currentTier];
  const targetLimits = TIER_LIMITS[targetTier];

  // Compare and list improvements
  if (!currentLimits.advancedModels && targetLimits.advancedModels) {
    features.push('GPT-4 & Claude AI models');
  }

  if (!currentLimits.elevenLabsVoices && targetLimits.elevenLabsVoices) {
    features.push('25+ premium ElevenLabs voices');
  }

  if (!currentLimits.voiceDownloads && targetLimits.voiceDownloads) {
    features.push('Voice audio downloads');
  }

  if (!currentLimits.introOutroAccess && targetLimits.introOutroAccess) {
    features.push('Intro/Outro Builder');
  }

  if (!currentLimits.premiumMusicLibrary && targetLimits.premiumMusicLibrary) {
    features.push('Premium music library');
  }

  if (!currentLimits.storyModeVoice && targetLimits.storyModeVoice) {
    features.push('Story Mode voice assistant');
  }

  if (!currentLimits.allCourses && targetLimits.allCourses) {
    features.push('All 57 Academy courses');
  }

  if (!currentLimits.certificates && targetLimits.certificates) {
    features.push('Completion certificates');
  }

  if (!currentLimits.dalle3Access && targetLimits.dalle3Access) {
    features.push('DALL-E 3 image generation');
  }

  if (!currentLimits.apiAccess && targetLimits.apiAccess) {
    features.push('API access');
  }

  if (currentLimits.teamMembers < targetLimits.teamMembers) {
    features.push(`Up to ${targetLimits.teamMembers === -1 ? 'unlimited' : targetLimits.teamMembers} team members`);
  }

  if (!currentLimits.removeBranding && targetLimits.removeBranding) {
    features.push('Remove branding (white-label)');
  }

  return features;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  starter: { monthly: 1900, yearly: 15600 }, // $19/mo, $156/yr ($13/mo)
  pro: { monthly: 4900, yearly: 40800 }, // $49/mo, $408/yr ($34/mo)
  business: { monthly: 9900, yearly: 82800 }, // $99/mo, $828/yr ($69/mo)
  enterprise: { monthly: 29900, yearly: 299000 }, // $299/mo, $2990/yr (~$249/mo)
};

export default {
  TIER_HIERARCHY,
  TIER_DISPLAY_NAMES,
  TIER_COLORS,
  TIER_LIMITS,
  TIER_PRICING,
  getTierIndex,
  tierMeetsRequirement,
  getMinimumTierForFeature,
  hasFeatureAccess,
  getFeatureLimit,
  isUnlimited,
  normalizeTier,
  getUpgradeFeatures,
};
