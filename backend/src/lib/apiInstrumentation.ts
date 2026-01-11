/**
 * SmartPromptIQ External API Instrumentation
 *
 * Features:
 * - Automatic timing and logging for external API calls
 * - Retry tracking
 * - Error classification
 * - Rate limit detection
 * - Cost tracking integration
 */

import { logger } from './logger';
import { metrics } from './metrics';
import { trackApiError } from './alerting';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ApiCallResult<T> {
  success: boolean;
  data?: T;
  error?: {
    type: string;
    message: string;
    statusCode?: number;
    retryable: boolean;
  };
  duration: number;
  retries: number;
}

export interface InstrumentedApiConfig {
  name: string;
  operation: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API CALL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wraps an external API call with instrumentation
 */
export async function instrumentedApiCall<T>(
  config: InstrumentedApiConfig,
  apiCall: () => Promise<T>
): Promise<ApiCallResult<T>> {
  const startTime = performance.now();
  let retries = 0;
  const maxRetries = config.maxRetries ?? 2;
  const retryDelay = config.retryDelay ?? 1000;

  const attempt = async (): Promise<ApiCallResult<T>> => {
    try {
      const data = await apiCall();
      const duration = Math.round(performance.now() - startTime);

      // Log success
      logger.externalApi(config.name, config.operation, true, duration, { retries });

      // Record metrics
      metrics.recordExternalApiCall(config.name, config.operation, duration, true);

      return {
        success: true,
        data,
        duration,
        retries
      };
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      const errorType = classifyApiError(error);
      const retryable = isRetryableError(error);

      // Should we retry?
      if (retryable && retries < maxRetries) {
        retries++;
        logger.warn(`Retrying ${config.name} ${config.operation} (attempt ${retries + 1})`, {
          error: error.message,
          errorType
        });

        await sleep(retryDelay * retries); // Exponential backoff
        return attempt();
      }

      // Log failure
      logger.error(`${config.name} ${config.operation} failed`, error, {
        duration,
        retries,
        errorType
      });

      // Record metrics
      metrics.recordExternalApiCall(config.name, config.operation, duration, false);

      // Track for alerting
      trackApiError(config.name.toLowerCase());

      return {
        success: false,
        error: {
          type: errorType,
          message: error.message || 'Unknown error',
          statusCode: error.status || error.statusCode,
          retryable
        },
        duration,
        retries
      };
    }
  };

  return attempt();
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

function classifyApiError(error: any): string {
  const status = error.status || error.statusCode;
  const message = error.message?.toLowerCase() || '';

  if (status === 429 || message.includes('rate limit')) {
    return 'rate_limit';
  }

  if (status === 401 || status === 403) {
    return 'auth_error';
  }

  if (status === 400) {
    return 'bad_request';
  }

  if (status === 404) {
    return 'not_found';
  }

  if (status >= 500) {
    return 'server_error';
  }

  if (message.includes('timeout') || error.code === 'ETIMEDOUT') {
    return 'timeout';
  }

  if (message.includes('network') || error.code === 'ENOTFOUND') {
    return 'network_error';
  }

  if (message.includes('insufficient') || message.includes('quota')) {
    return 'quota_exceeded';
  }

  return 'unknown';
}

function isRetryableError(error: any): boolean {
  const status = error.status || error.statusCode;
  const errorType = classifyApiError(error);

  // Don't retry auth errors or bad requests
  if (['auth_error', 'bad_request', 'not_found', 'quota_exceeded'].includes(errorType)) {
    return false;
  }

  // Retry rate limits, timeouts, network errors, and server errors
  if (['rate_limit', 'timeout', 'network_error', 'server_error'].includes(errorType)) {
    return true;
  }

  // Retry on specific status codes
  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════════
// API-SPECIFIC INSTRUMENTATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Stripe API instrumentation
 */
export const stripeApi = {
  async call<T>(operation: string, apiCall: () => Promise<T>): Promise<ApiCallResult<T>> {
    return instrumentedApiCall({ name: 'Stripe', operation }, apiCall);
  },

  recordPayment(amount: number, currency: string, success: boolean): void {
    if (success) {
      metrics.recordRevenue(amount, 'payment');
    }
    logger.businessEvent('payment_processed', {
      amount,
      currency,
      success
    });
  },

  recordSubscription(event: 'created' | 'updated' | 'cancelled', plan: string): void {
    metrics.recordSubscriptionEvent(event, plan);
    logger.businessEvent(`subscription_${event}`, { plan });
  }
};

/**
 * OpenAI API instrumentation
 */
export const openaiApi = {
  async call<T>(operation: string, apiCall: () => Promise<T>): Promise<ApiCallResult<T>> {
    return instrumentedApiCall(
      { name: 'OpenAI', operation, maxRetries: 2, retryDelay: 2000 },
      apiCall
    );
  },

  recordTokenUsage(promptTokens: number, completionTokens: number, model: string): void {
    const totalTokens = promptTokens + completionTokens;
    metrics.recordTokenUsage(totalTokens, 'completion', 'openai');

    logger.debug('OpenAI token usage', {
      promptTokens,
      completionTokens,
      totalTokens,
      model
    });
  },

  recordTtsUsage(characters: number): void {
    metrics.recordTokenUsage(characters, 'tts', 'openai');
  }
};

/**
 * ElevenLabs API instrumentation
 */
export const elevenlabsApi = {
  async call<T>(operation: string, apiCall: () => Promise<T>): Promise<ApiCallResult<T>> {
    return instrumentedApiCall(
      { name: 'ElevenLabs', operation, maxRetries: 1, retryDelay: 1000 },
      apiCall
    );
  },

  recordVoiceGeneration(characters: number, voiceId: string): void {
    metrics.recordTokenUsage(characters, 'voice_generation', 'elevenlabs');

    logger.businessEvent('voice_generated', {
      characters,
      voiceId,
      provider: 'elevenlabs'
    });
  }
};

/**
 * Anthropic API instrumentation
 */
export const anthropicApi = {
  async call<T>(operation: string, apiCall: () => Promise<T>): Promise<ApiCallResult<T>> {
    return instrumentedApiCall(
      { name: 'Anthropic', operation, maxRetries: 2, retryDelay: 2000 },
      apiCall
    );
  },

  recordTokenUsage(inputTokens: number, outputTokens: number, model: string): void {
    const totalTokens = inputTokens + outputTokens;
    metrics.recordTokenUsage(totalTokens, 'completion', 'anthropic');

    logger.debug('Anthropic token usage', {
      inputTokens,
      outputTokens,
      totalTokens,
      model
    });
  }
};

/**
 * Supabase API instrumentation
 */
export const supabaseApi = {
  async call<T>(operation: string, apiCall: () => Promise<T>): Promise<ApiCallResult<T>> {
    return instrumentedApiCall(
      { name: 'Supabase', operation, maxRetries: 2 },
      apiCall
    );
  },

  recordStorageOperation(operation: 'upload' | 'download' | 'delete', bytes: number): void {
    logger.debug('Supabase storage operation', {
      operation,
      bytes
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// API HEALTH TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

interface ApiHealth {
  name: string;
  lastSuccess?: Date;
  lastFailure?: Date;
  successCount: number;
  failureCount: number;
  avgLatency: number;
  isHealthy: boolean;
}

const apiHealthMap: Map<string, ApiHealth> = new Map();

export const trackApiHealth = (
  name: string,
  success: boolean,
  latency: number
): void => {
  let health = apiHealthMap.get(name);

  if (!health) {
    health = {
      name,
      successCount: 0,
      failureCount: 0,
      avgLatency: 0,
      isHealthy: true
    };
    apiHealthMap.set(name, health);
  }

  if (success) {
    health.lastSuccess = new Date();
    health.successCount++;
  } else {
    health.lastFailure = new Date();
    health.failureCount++;
  }

  // Calculate rolling average
  const totalCalls = health.successCount + health.failureCount;
  health.avgLatency = ((health.avgLatency * (totalCalls - 1)) + latency) / totalCalls;

  // Determine health status (>90% success rate in last calls)
  const recentSuccessRate = health.successCount / totalCalls;
  health.isHealthy = recentSuccessRate > 0.9;
};

export const getApiHealth = (): ApiHealth[] => {
  return Array.from(apiHealthMap.values());
};

export const getUnhealthyApis = (): ApiHealth[] => {
  return Array.from(apiHealthMap.values()).filter(h => !h.isHealthy);
};

export default {
  instrumentedApiCall,
  stripeApi,
  openaiApi,
  elevenlabsApi,
  anthropicApi,
  supabaseApi,
  getApiHealth,
  getUnhealthyApis
};
