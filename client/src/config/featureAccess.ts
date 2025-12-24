/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - FEATURE ACCESS CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Defines which features are available for each subscription tier.
 * This is the single source of truth for feature gating across the app.
 *
 * UPDATED TIERS:
 * - free: Basic access, limited features
 * - starter: Entry paid tier ($19/mo) - Basic creative tools
 * - academy_plus: Academy + creative tier ($29/mo) - Education focused
 * - pro: Professional tier ($49/mo) - Most popular, content creators
 * - team_pro: Team tier ($99/mo) - Teams and agencies
 * - enterprise: Enterprise tier ($299/mo) - Large organizations
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type SubscriptionTier = 'free' | 'starter' | 'academy_plus' | 'pro' | 'team_pro' | 'enterprise';

export const TIER_HIERARCHY: SubscriptionTier[] = ['free', 'starter', 'academy_plus', 'pro', 'team_pro', 'enterprise'];

export const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  academy_plus: 'Academy+',
  pro: 'Pro',
  team_pro: 'Team Pro',
  enterprise: 'Enterprise',
};

export const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'from-gray-400 to-gray-500',
  starter: 'from-blue-400 to-cyan-500',
  academy_plus: 'from-teal-400 to-emerald-500',
  pro: 'from-purple-500 to-pink-500',
  team_pro: 'from-amber-500 to-orange-500',
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
  | 'video'
  | 'builderiq'
  | 'academy'
  | 'intro_outro'
  | 'downloads'
  | 'api'
  | 'team'
  | 'support'
  | 'quality';

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
  voiceClonesAllowed: number; // NEW: Number of custom voice clones

  // Music & Suno
  musicTracksPerMonth: number;
  sunoMusicAccess: boolean; // NEW: Suno AI music generation
  premiumMusicLibrary: boolean;
  voiceMusicMixing: boolean;
  musicCommercialUse: boolean; // NEW

  // Video Builder
  videoExportsPerMonth: number; // NEW
  hdVideoExport: boolean; // NEW: 1080p
  fourKVideoExport: boolean; // NEW: 4K
  videoCommercialUse: boolean; // NEW

  // Intro/Outro Builder
  introOutroAccess: boolean;
  introOutroPerMonth: number; // NEW: Specific limit
  introOutroDownloads: boolean;

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
  customCertificates: boolean; // NEW: Enterprise custom branding
  earlyAccess: boolean;
  playgroundTests: number;

  // Downloads & Exports
  pdfExport: boolean;
  jsonExport: boolean;
  audioDownloads: boolean;
  videoExport: boolean;
  removeBranding: boolean; // Watermark removal
  priorityQueue: boolean; // NEW: Skip generation queue

  // Quality Options
  draftQuality: boolean; // NEW
  standardQuality: boolean; // NEW
  premiumQuality: boolean; // NEW

  // API & Integration
  apiAccess: boolean;
  apiCallsPerMonth: number;
  webhooks: boolean;

  // Team
  teamMembers: number;
  teamWorkspace: boolean;
  adminDashboard: boolean;

  // Support
  supportLevel: 'community' | 'email' | 'priority' | 'priority_chat' | 'dedicated';
  responseTime: string;

  // Storage & History
  historyRetentionDays: number; // NEW: How long to keep generation history
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
    promptsPerMonth: 5,
    tokensPerMonth: 50,
    advancedModels: false,

    // Voice
    voiceGenerationsPerMonth: 5,
    openAIVoices: true,
    elevenLabsVoices: false,
    premiumElevenLabsVoices: false,
    voiceDownloads: false, // Preview only
    voiceCommercialUse: false,
    voiceClonesAllowed: 0,

    // Music
    musicTracksPerMonth: 3,
    sunoMusicAccess: true, // Basic access
    premiumMusicLibrary: false,
    voiceMusicMixing: false,
    musicCommercialUse: false,

    // Video
    videoExportsPerMonth: 0,
    hdVideoExport: false,
    fourKVideoExport: false,
    videoCommercialUse: false,

    // Intro/Outro
    introOutroAccess: false,
    introOutroPerMonth: 0,
    introOutroDownloads: false,

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
    customCertificates: false,
    earlyAccess: false,
    playgroundTests: 5,

    // Downloads
    pdfExport: false,
    jsonExport: false,
    audioDownloads: false,
    videoExport: false,
    removeBranding: false,
    priorityQueue: false,

    // Quality
    draftQuality: true,
    standardQuality: false,
    premiumQuality: false,

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

    // History
    historyRetentionDays: 7,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STARTER TIER - $19/month - Entry-level creators
  // ─────────────────────────────────────────────────────────────────────────────
  starter: {
    // Prompts
    promptsPerMonth: 50,
    tokensPerMonth: 250,
    advancedModels: false, // GPT-3.5 only

    // Voice
    voiceGenerationsPerMonth: 50,
    openAIVoices: true,
    elevenLabsVoices: false,
    premiumElevenLabsVoices: false,
    voiceDownloads: true,
    voiceCommercialUse: false,
    voiceClonesAllowed: 0,

    // Music
    musicTracksPerMonth: 10,
    sunoMusicAccess: true,
    premiumMusicLibrary: false,
    voiceMusicMixing: false,
    musicCommercialUse: false,

    // Video
    videoExportsPerMonth: 5,
    hdVideoExport: true,
    fourKVideoExport: false,
    videoCommercialUse: false,

    // Intro/Outro
    introOutroAccess: true,
    introOutroPerMonth: 5,
    introOutroDownloads: true,

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
    customCertificates: false,
    earlyAccess: false,
    playgroundTests: 25,

    // Downloads
    pdfExport: true,
    jsonExport: false,
    audioDownloads: true,
    videoExport: true,
    removeBranding: false,
    priorityQueue: false,

    // Quality
    draftQuality: true,
    standardQuality: true,
    premiumQuality: false,

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

    // History
    historyRetentionDays: 14,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ACADEMY+ TIER - $29/month - Education + Basic Creative
  // ─────────────────────────────────────────────────────────────────────────────
  academy_plus: {
    // Prompts
    promptsPerMonth: 100,
    tokensPerMonth: 500,
    advancedModels: false, // GPT-3.5 only

    // Voice
    voiceGenerationsPerMonth: 75,
    openAIVoices: true,
    elevenLabsVoices: true, // 10 basic voices
    premiumElevenLabsVoices: false,
    voiceDownloads: true,
    voiceCommercialUse: false,
    voiceClonesAllowed: 0,

    // Music
    musicTracksPerMonth: 20,
    sunoMusicAccess: true,
    premiumMusicLibrary: false,
    voiceMusicMixing: false,
    musicCommercialUse: false,

    // Video
    videoExportsPerMonth: 10,
    hdVideoExport: true,
    fourKVideoExport: false,
    videoCommercialUse: false,

    // Intro/Outro
    introOutroAccess: true,
    introOutroPerMonth: 10,
    introOutroDownloads: true,

    // Design
    imageGenerationsPerMonth: 50,
    stableDiffusion: true,
    dalleAccess: true,
    dalle3Access: false,
    printIntegration: false,
    impossiblePrintPriority: false,

    // BuilderIQ
    blueprintsPerMonth: 5,
    storyModeVoice: false,
    appTemplates: true,
    deploymentHub: false,
    codeExport: false,

    // Academy - FULL ACCESS
    freeCourses: true,
    allCourses: true, // All 57 courses
    certificates: true,
    customCertificates: false,
    earlyAccess: false,
    playgroundTests: 50,

    // Downloads
    pdfExport: true,
    jsonExport: false,
    audioDownloads: true,
    videoExport: true,
    removeBranding: false,
    priorityQueue: false,

    // Quality
    draftQuality: true,
    standardQuality: true,
    premiumQuality: false,

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

    // History
    historyRetentionDays: 30,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // PRO TIER - $49/month - Content creators & marketers (MOST POPULAR)
  // ─────────────────────────────────────────────────────────────────────────────
  pro: {
    // Prompts
    promptsPerMonth: 200,
    tokensPerMonth: 2000,
    advancedModels: true, // GPT-4, Claude

    // Voice
    voiceGenerationsPerMonth: 200,
    openAIVoices: true,
    elevenLabsVoices: true, // 25+ voices
    premiumElevenLabsVoices: false,
    voiceDownloads: true,
    voiceCommercialUse: true,
    voiceClonesAllowed: 0, // Voice cloning feature not implemented

    // Music
    musicTracksPerMonth: 50,
    sunoMusicAccess: true,
    premiumMusicLibrary: true,
    voiceMusicMixing: true,
    musicCommercialUse: true,

    // Video
    videoExportsPerMonth: 30,
    hdVideoExport: true,
    fourKVideoExport: false,
    videoCommercialUse: true,

    // Intro/Outro
    introOutroAccess: true,
    introOutroPerMonth: 30,
    introOutroDownloads: true,

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
    customCertificates: false,
    earlyAccess: false,
    playgroundTests: 200,

    // Downloads
    pdfExport: true,
    jsonExport: true,
    audioDownloads: true,
    videoExport: true,
    removeBranding: true, // Can remove watermarks
    priorityQueue: true,

    // Quality
    draftQuality: true,
    standardQuality: true,
    premiumQuality: true,

    // API
    apiAccess: false,
    apiCallsPerMonth: 100,
    webhooks: false,

    // Team
    teamMembers: 1,
    teamWorkspace: false,
    adminDashboard: false,

    // Support
    supportLevel: 'priority',
    responseTime: '12-24 hours',

    // History
    historyRetentionDays: 90,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEAM PRO TIER - $99/month - Teams and agencies
  // ─────────────────────────────────────────────────────────────────────────────
  team_pro: {
    // Prompts
    promptsPerMonth: 1000,
    tokensPerMonth: 5000,
    advancedModels: true,

    // Voice
    voiceGenerationsPerMonth: 500,
    openAIVoices: true,
    elevenLabsVoices: true,
    premiumElevenLabsVoices: true, // Premium voices
    voiceDownloads: true,
    voiceCommercialUse: true,
    voiceClonesAllowed: 0, // Voice cloning feature not implemented

    // Music
    musicTracksPerMonth: 150,
    sunoMusicAccess: true,
    premiumMusicLibrary: true,
    voiceMusicMixing: true,
    musicCommercialUse: true,

    // Video
    videoExportsPerMonth: 100,
    hdVideoExport: true,
    fourKVideoExport: true, // 4K enabled
    videoCommercialUse: true,

    // Intro/Outro
    introOutroAccess: true,
    introOutroPerMonth: 100,
    introOutroDownloads: true,

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
    customCertificates: false,
    earlyAccess: true,
    playgroundTests: 500,

    // Downloads
    pdfExport: true,
    jsonExport: true,
    audioDownloads: true,
    videoExport: true,
    removeBranding: true, // White-label
    priorityQueue: true,

    // Quality
    draftQuality: true,
    standardQuality: true,
    premiumQuality: true,

    // API
    apiAccess: true,
    apiCallsPerMonth: 1000,
    webhooks: true,

    // Team
    teamMembers: 5,
    teamWorkspace: true,
    adminDashboard: true,

    // Support
    supportLevel: 'priority_chat',
    responseTime: '4-12 hours',

    // History
    historyRetentionDays: 180,
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
    voiceClonesAllowed: 0, // Voice cloning feature not implemented

    // Music
    musicTracksPerMonth: -1, // Unlimited
    sunoMusicAccess: true,
    premiumMusicLibrary: true,
    voiceMusicMixing: true,
    musicCommercialUse: true,

    // Video
    videoExportsPerMonth: -1, // Unlimited
    hdVideoExport: true,
    fourKVideoExport: true,
    videoCommercialUse: true,

    // Intro/Outro
    introOutroAccess: true,
    introOutroPerMonth: -1, // Unlimited
    introOutroDownloads: true,

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
    customCertificates: true, // Custom branding
    earlyAccess: true,
    playgroundTests: -1, // Unlimited

    // Downloads
    pdfExport: true,
    jsonExport: true,
    audioDownloads: true,
    videoExport: true,
    removeBranding: true,
    priorityQueue: true,

    // Quality
    draftQuality: true,
    standardQuality: true,
    premiumQuality: true,

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

    // History
    historyRetentionDays: 365, // 1 year
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
 * Format a limit value for display
 */
export function formatLimitValue(value: number): string {
  if (value === -1) return 'Unlimited';
  if (value === 0) return '—';
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

/**
 * Normalize tier string to SubscriptionTier type
 */
export function normalizeTier(tier: string | undefined | null): SubscriptionTier {
  if (!tier) return 'free';

  const lowerTier = tier.toLowerCase().replace('-', '_');

  // Handle various tier name formats
  if (lowerTier === 'free' || lowerTier === 'trial') return 'free';
  if (lowerTier === 'starter' || lowerTier === 'basic') return 'starter';
  if (lowerTier === 'academy_plus' || lowerTier === 'academy' || lowerTier === 'academyplus') return 'academy_plus';
  if (lowerTier === 'pro' || lowerTier === 'professional') return 'pro';
  if (lowerTier === 'team_pro' || lowerTier === 'team' || lowerTier === 'business') return 'team_pro';
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
    features.push('ElevenLabs voices');
  }

  if (!currentLimits.premiumElevenLabsVoices && targetLimits.premiumElevenLabsVoices) {
    features.push('Premium ElevenLabs voices');
  }

  // Voice cloning feature removed - not implemented
  // if (currentLimits.voiceClonesAllowed < targetLimits.voiceClonesAllowed) { ... }

  if (!currentLimits.voiceDownloads && targetLimits.voiceDownloads) {
    features.push('Voice audio downloads');
  }

  if (!currentLimits.voiceCommercialUse && targetLimits.voiceCommercialUse) {
    features.push('Commercial voice license');
  }

  if (!currentLimits.sunoMusicAccess && targetLimits.sunoMusicAccess) {
    features.push('Suno AI music generation');
  }

  if (!currentLimits.premiumMusicLibrary && targetLimits.premiumMusicLibrary) {
    features.push('Premium music library');
  }

  if (!currentLimits.musicCommercialUse && targetLimits.musicCommercialUse) {
    features.push('Commercial music license');
  }

  if (!currentLimits.fourKVideoExport && targetLimits.fourKVideoExport) {
    features.push('4K video exports');
  }

  if (!currentLimits.introOutroAccess && targetLimits.introOutroAccess) {
    features.push('Intro/Outro Builder');
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

  if (!currentLimits.removeBranding && targetLimits.removeBranding) {
    features.push('Remove watermarks');
  }

  if (!currentLimits.priorityQueue && targetLimits.priorityQueue) {
    features.push('Priority generation queue');
  }

  if (!currentLimits.apiAccess && targetLimits.apiAccess) {
    features.push('API access');
  }

  if (currentLimits.teamMembers < targetLimits.teamMembers) {
    features.push(`Up to ${targetLimits.teamMembers === -1 ? 'unlimited' : targetLimits.teamMembers} team members`);
  }

  return features;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

export const TIER_PRICING: Record<SubscriptionTier, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  starter: { monthly: 1900, yearly: 15600 }, // $19/mo, $156/yr ($13/mo)
  academy_plus: { monthly: 2900, yearly: 24000 }, // $29/mo, $240/yr ($20/mo)
  pro: { monthly: 4900, yearly: 40800 }, // $49/mo, $408/yr ($34/mo)
  team_pro: { monthly: 9900, yearly: 82800 }, // $99/mo, $828/yr ($69/mo)
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
  formatLimitValue,
  normalizeTier,
  getUpgradeFeatures,
};
