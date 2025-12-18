/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SMARTPROMPTIQ - COST MANAGEMENT CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Central configuration for all API costs, token pricing, and usage limits.
 * This ensures profitability and prevents overspending on external APIs.
 *
 * IMPORTANT: Update these values when API providers change their pricing!
 *
 * Last Updated: December 2024
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL API COSTS (What we pay)
// ═══════════════════════════════════════════════════════════════════════════════

export const API_COSTS = {
  // ─────────────────────────────────────────────────────────────────────────────
  // OPENAI COSTS
  // ─────────────────────────────────────────────────────────────────────────────
  openai: {
    // GPT Models (per 1K tokens)
    'gpt-3.5-turbo': {
      input: 0.0005,    // $0.50 per 1M tokens
      output: 0.0015,   // $1.50 per 1M tokens
    },
    'gpt-4': {
      input: 0.03,      // $30 per 1M tokens
      output: 0.06,     // $60 per 1M tokens
    },
    'gpt-4-turbo': {
      input: 0.01,      // $10 per 1M tokens
      output: 0.03,     // $30 per 1M tokens
    },
    'gpt-4o': {
      input: 0.005,     // $5 per 1M tokens
      output: 0.015,    // $15 per 1M tokens
    },
    'gpt-4o-mini': {
      input: 0.00015,   // $0.15 per 1M tokens
      output: 0.0006,   // $0.60 per 1M tokens
    },
    // TTS (Text-to-Speech)
    'tts-1': 0.015,           // $15 per 1M characters
    'tts-1-hd': 0.030,        // $30 per 1M characters
    // DALL-E
    'dall-e-3-standard': 0.04,  // $0.04 per image (1024x1024)
    'dall-e-3-hd': 0.08,        // $0.08 per image (1024x1024 HD)
    'dall-e-2': 0.02,           // $0.02 per image
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ELEVENLABS COSTS
  // ─────────────────────────────────────────────────────────────────────────────
  elevenlabs: {
    // Per character pricing (depends on plan)
    'standard': 0.00018,      // ~$0.18 per 1K characters (Starter plan)
    'professional': 0.00024,  // ~$0.24 per 1K characters (Creator plan)
    'premium': 0.00030,       // ~$0.30 per 1K characters (Pro plan)
    // Sound effects
    'sound-effect': 0.01,     // ~$0.01 per generation
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ANTHROPIC (CLAUDE) COSTS
  // ─────────────────────────────────────────────────────────────────────────────
  anthropic: {
    'claude-3-opus': {
      input: 0.015,     // $15 per 1M tokens
      output: 0.075,    // $75 per 1M tokens
    },
    'claude-3-sonnet': {
      input: 0.003,     // $3 per 1M tokens
      output: 0.015,    // $15 per 1M tokens
    },
    'claude-3-haiku': {
      input: 0.00025,   // $0.25 per 1M tokens
      output: 0.00125,  // $1.25 per 1M tokens
    },
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STABLE DIFFUSION / IMAGE GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  stability: {
    'sdxl-1.0': 0.002,        // ~$0.002 per image (Replicate)
    'sd-3.0': 0.035,          // ~$0.035 per image
    'stable-video': 0.05,     // ~$0.05 per video
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SUNO AI (MUSIC GENERATION)
  // ─────────────────────────────────────────────────────────────────────────────
  suno: {
    'song-full': 0.05,        // ~$0.05 per full song
    'song-instrumental': 0.04, // ~$0.04 per instrumental
    'jingle': 0.02,           // ~$0.02 per jingle (short)
    'stem-separation': 0.03,  // ~$0.03 per separation
    'extension': 0.025,       // ~$0.025 per extension
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // SHOTSTACK (VIDEO GENERATION)
  // ─────────────────────────────────────────────────────────────────────────────
  shotstack: {
    'per-second': 0.05,       // ~$0.05 per second of video
    'per-minute': 3.00,       // ~$3.00 per minute
    'render-sd': 0.03,        // SD quality
    'render-hd': 0.05,        // HD quality
    'render-1080': 0.07,      // 1080p quality
    'render-4k': 0.15,        // 4K quality
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // REPLICATE (MULTI-MODEL)
  // ─────────────────────────────────────────────────────────────────────────────
  replicate: {
    'flux-schnell': 0.003,    // Fast image generation
    'flux-pro': 0.055,        // High quality
    'kandinsky': 0.004,       // Alternative model
    'whisper': 0.0005,        // Audio transcription per second
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN COSTS (What users pay in tokens)
// ═══════════════════════════════════════════════════════════════════════════════

export const TOKEN_COSTS = {
  // ─────────────────────────────────────────────────────────────────────────────
  // PROMPT GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  prompt: {
    'basic': 1,               // Simple prompt (GPT-3.5)
    'standard': 2,            // Standard prompt (GPT-4o-mini)
    'advanced': 5,            // Complex prompt (GPT-4o)
    'premium': 10,            // Premium prompt (GPT-4)
    'refinement': 1,          // Refine existing prompt
    'suggestion': 0,          // Free suggestions (limited)
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VOICE GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  voice: {
    'openai-standard': 2,     // OpenAI TTS standard
    'openai-hd': 4,           // OpenAI TTS HD
    'elevenlabs-standard': 3, // ElevenLabs standard voice
    'elevenlabs-premium': 5,  // ElevenLabs premium voice
    'elevenlabs-clone': 10,   // Voice cloning
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // MUSIC GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  music: {
    'jingle': 5,              // Short jingle (15-30s)
    'instrumental': 8,        // Instrumental track
    'full-song': 12,          // Full song with vocals
    'stem-separation': 6,     // Separate stems
    'extension': 4,           // Extend existing track
    'sound-effect': 2,        // Sound effect
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // VIDEO GENERATION (Shotstack)
  // ─────────────────────────────────────────────────────────────────────────────
  video: {
    'quick-video': 10,        // Quick video (up to 30s)
    'template-video': 15,     // Template-based video
    'scenes-video': 20,       // Multi-scene video
    'intro-5s': 5,            // 5-second intro
    'intro-10s': 8,           // 10-second intro
    'short-15s': 12,          // 15-second short (TikTok, Reels)
    'short-30s': 20,          // 30-second short
    'short-60s': 35,          // 60-second short (YouTube Shorts)
    'tutorial-120s': 60,      // 2-minute tutorial
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // IMAGE GENERATION
  // ─────────────────────────────────────────────────────────────────────────────
  image: {
    'sd-basic': 1,            // Stable Diffusion basic
    'sd-quality': 2,          // Stable Diffusion quality
    'sdxl': 3,                // SDXL high quality
    'dalle-2': 4,             // DALL-E 2
    'dalle-3': 8,             // DALL-E 3 standard
    'dalle-3-hd': 12,         // DALL-E 3 HD
    'midjourney': 10,         // Midjourney style
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BUILDERIQ
  // ─────────────────────────────────────────────────────────────────────────────
  builderiq: {
    'blueprint-basic': 10,    // Basic app blueprint
    'blueprint-standard': 20, // Standard blueprint
    'blueprint-advanced': 35, // Advanced blueprint
    'blueprint-enterprise': 50, // Enterprise blueprint
    'template-customize': 5,  // Customize template
    'export-pdf': 2,          // Export to PDF
    'export-code': 15,        // Export starter code
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ACADEMY
  // ─────────────────────────────────────────────────────────────────────────────
  academy: {
    'certificate': 5,         // Generate certificate
    'quiz-retry': 1,          // Retry quiz
    'playground-run': 1,      // Run playground code
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROFIT MARGINS (Multipliers)
// ═══════════════════════════════════════════════════════════════════════════════

export const PROFIT_MARGINS = {
  minimum: 2.0,               // Minimum 2x markup (100% profit)
  target: 3.0,                // Target 3x markup (200% profit)
  premium: 4.0,               // Premium features 4x markup
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN PRICING (What users pay for tokens)
// ═══════════════════════════════════════════════════════════════════════════════

export const TOKEN_PACKAGES = {
  small: {
    tokens: 100,
    price: 4.99,
    pricePerToken: 0.0499,
    bonus: 0,
  },
  medium: {
    tokens: 500,
    price: 19.99,
    pricePerToken: 0.0400,
    bonus: 50,                // +50 bonus tokens
  },
  large: {
    tokens: 1000,
    price: 34.99,
    pricePerToken: 0.0350,
    bonus: 150,               // +150 bonus tokens
  },
  bulk: {
    tokens: 5000,
    price: 149.99,
    pricePerToken: 0.0300,
    bonus: 1000,              // +1000 bonus tokens
  },
  enterprise: {
    tokens: 20000,
    price: 499.99,
    pricePerToken: 0.0250,
    bonus: 5000,              // +5000 bonus tokens
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION TOKEN ALLOCATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const SUBSCRIPTION_TOKENS = {
  free: {
    monthly: 50,
    rollover: false,
    maxRollover: 0,
  },
  starter: {
    monthly: 500,
    rollover: true,
    maxRollover: 250,         // Can rollover up to 250
  },
  pro: {
    monthly: 2000,
    rollover: true,
    maxRollover: 1000,
  },
  business: {
    monthly: 8000,
    rollover: true,
    maxRollover: 4000,
  },
  enterprise: {
    monthly: 50000,
    rollover: true,
    maxRollover: 25000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// USAGE LIMITS (Per user per day/month)
// ═══════════════════════════════════════════════════════════════════════════════

export const USAGE_LIMITS = {
  free: {
    daily: {
      prompts: 10,
      voiceGenerations: 3,
      musicGenerations: 1,
      imageGenerations: 5,
      videoGenerations: 1,
      builderiqSessions: 1,
    },
    monthly: {
      prompts: 100,
      voiceGenerations: 20,
      musicGenerations: 5,
      imageGenerations: 30,
      videoGenerations: 3,
      builderiqSessions: 3,
      apiCalls: 500,
    },
  },
  starter: {
    daily: {
      prompts: 50,
      voiceGenerations: 20,
      musicGenerations: 5,
      imageGenerations: 20,
      videoGenerations: 5,
      builderiqSessions: 5,
    },
    monthly: {
      prompts: 500,
      voiceGenerations: 200,
      musicGenerations: 50,
      imageGenerations: 200,
      videoGenerations: 30,
      builderiqSessions: 30,
      apiCalls: 5000,
    },
  },
  pro: {
    daily: {
      prompts: 200,
      voiceGenerations: 100,
      musicGenerations: 20,
      imageGenerations: 100,
      videoGenerations: 20,
      builderiqSessions: 20,
    },
    monthly: {
      prompts: 2000,
      voiceGenerations: 1000,
      musicGenerations: 200,
      imageGenerations: 1000,
      videoGenerations: 150,
      builderiqSessions: 100,
      apiCalls: 20000,
    },
  },
  business: {
    daily: {
      prompts: 1000,
      voiceGenerations: 500,
      musicGenerations: 100,
      imageGenerations: 500,
      videoGenerations: 100,
      builderiqSessions: 100,
    },
    monthly: {
      prompts: 10000,
      voiceGenerations: 5000,
      musicGenerations: 1000,
      imageGenerations: 5000,
      videoGenerations: 500,
      builderiqSessions: 500,
      apiCalls: 100000,
    },
  },
  enterprise: {
    daily: {
      prompts: -1,            // Unlimited (-1)
      voiceGenerations: -1,
      musicGenerations: -1,
      imageGenerations: -1,
      videoGenerations: -1,
      builderiqSessions: -1,
    },
    monthly: {
      prompts: -1,
      voiceGenerations: -1,
      musicGenerations: -1,
      imageGenerations: -1,
      videoGenerations: -1,
      builderiqSessions: -1,
      apiCalls: -1,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COST ALERTS & THRESHOLDS
// ═══════════════════════════════════════════════════════════════════════════════

export const COST_ALERTS = {
  // Daily spending alerts (in USD)
  daily: {
    warning: 100,             // Warn at $100/day
    critical: 500,            // Critical at $500/day
    shutdown: 1000,           // Auto-shutdown at $1000/day
  },
  // Monthly spending alerts
  monthly: {
    warning: 2000,            // Warn at $2000/month
    critical: 5000,           // Critical at $5000/month
    shutdown: 10000,          // Auto-shutdown at $10000/month
  },
  // Per-user spending (to detect abuse)
  perUser: {
    daily: 50,                // Max $50/user/day in API costs
    monthly: 500,             // Max $500/user/month in API costs
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the actual API cost for a feature
 */
export function calculateAPICost(
  provider: keyof typeof API_COSTS,
  model: string,
  usage: { inputTokens?: number; outputTokens?: number; characters?: number; images?: number }
): number {
  const providerCosts = API_COSTS[provider] as any;
  if (!providerCosts) return 0;

  const modelCost = providerCosts[model];
  if (!modelCost) return 0;

  // Handle different cost structures
  if (typeof modelCost === 'number') {
    // Simple per-unit cost (images, generations)
    return modelCost * (usage.images || usage.characters || 1);
  } else if (modelCost.input && modelCost.output) {
    // Token-based cost (LLMs)
    const inputCost = ((usage.inputTokens || 0) / 1000) * modelCost.input;
    const outputCost = ((usage.outputTokens || 0) / 1000) * modelCost.output;
    return inputCost + outputCost;
  }

  return 0;
}

/**
 * Calculate token cost for a feature
 */
export function getTokenCost(category: keyof typeof TOKEN_COSTS, feature: string): number {
  const categoryCosts = TOKEN_COSTS[category] as any;
  if (!categoryCosts) return 1; // Default to 1 token
  return categoryCosts[feature] || 1;
}

/**
 * Check if user has enough tokens
 */
export function hasEnoughTokens(userTokens: number, category: keyof typeof TOKEN_COSTS, feature: string): boolean {
  const cost = getTokenCost(category, feature);
  return userTokens >= cost;
}

/**
 * Calculate profit margin for a transaction
 */
export function calculateProfitMargin(apiCost: number, tokensCharged: number, tokenValue: number = 0.035): number {
  const revenue = tokensCharged * tokenValue;
  if (apiCost === 0) return 100; // 100% margin if no API cost
  return ((revenue - apiCost) / apiCost) * 100;
}

/**
 * Check if within usage limits
 */
export function checkUsageLimit(
  tier: keyof typeof USAGE_LIMITS,
  feature: string,
  currentUsage: number,
  period: 'daily' | 'monthly'
): { allowed: boolean; limit: number; remaining: number } {
  const limits = USAGE_LIMITS[tier]?.[period] as any;
  if (!limits) return { allowed: true, limit: -1, remaining: -1 };

  const limit = limits[feature];
  if (limit === -1) return { allowed: true, limit: -1, remaining: -1 }; // Unlimited

  const remaining = Math.max(0, limit - currentUsage);
  return {
    allowed: currentUsage < limit,
    limit,
    remaining,
  };
}

/**
 * Get subscription tier from string
 */
export function getSubscriptionTier(tier: string): keyof typeof USAGE_LIMITS {
  const validTiers: (keyof typeof USAGE_LIMITS)[] = ['free', 'starter', 'pro', 'business', 'enterprise'];
  const normalizedTier = tier.toLowerCase() as keyof typeof USAGE_LIMITS;
  return validTiers.includes(normalizedTier) ? normalizedTier : 'free';
}

/**
 * Calculate estimated monthly cost for a usage pattern
 */
export function estimateMonthlyAPICost(usagePattern: {
  prompts: number;
  voiceMinutes: number;
  musicTracks: number;
  images: number;
}): number {
  let total = 0;

  // Prompts (assuming GPT-4o-mini average)
  total += usagePattern.prompts * 0.001; // ~$0.001 per prompt

  // Voice (assuming ElevenLabs, ~500 chars per minute)
  total += usagePattern.voiceMinutes * 500 * API_COSTS.elevenlabs.standard;

  // Music (assuming mix of types)
  total += usagePattern.musicTracks * 0.04; // Average cost

  // Images (assuming SDXL)
  total += usagePattern.images * API_COSTS.stability['sdxl-1.0'];

  return total;
}

/**
 * Format cost for display
 */
export function formatCost(amount: number): string {
  if (amount < 0.01) {
    return `$${(amount * 100).toFixed(2)}¢`;
  }
  return `$${amount.toFixed(2)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS FOR COST CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

export const COST_CONTROL_FLAGS = {
  // Enable/disable expensive features during high load
  enableGPT4: true,
  enableDALLE3: true,
  enableElevenLabs: true,
  enableSuno: true,

  // Fallback to cheaper alternatives
  fallbackToGPT35: true,      // If GPT-4 disabled, use GPT-3.5
  fallbackToSDXL: true,       // If DALL-E disabled, use SDXL
  fallbackToOpenAITTS: true,  // If ElevenLabs disabled, use OpenAI TTS

  // Rate limiting
  enableRateLimiting: true,
  enableCostThrottling: true,

  // Monitoring
  logAllAPICosts: true,
  alertOnHighCost: true,
  autoShutdownOnCritical: false, // Set to true in production
};

export default {
  API_COSTS,
  TOKEN_COSTS,
  PROFIT_MARGINS,
  TOKEN_PACKAGES,
  SUBSCRIPTION_TOKENS,
  USAGE_LIMITS,
  COST_ALERTS,
  COST_CONTROL_FLAGS,
  calculateAPICost,
  getTokenCost,
  hasEnoughTokens,
  calculateProfitMargin,
  checkUsageLimit,
  getSubscriptionTier,
  estimateMonthlyAPICost,
  formatCost,
};
