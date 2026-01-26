"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnhealthyApis = exports.getApiHealth = exports.trackApiHealth = exports.supabaseApi = exports.anthropicApi = exports.elevenlabsApi = exports.openaiApi = exports.stripeApi = void 0;
exports.instrumentedApiCall = instrumentedApiCall;
const logger_1 = require("./logger");
const metrics_1 = require("./metrics");
const alerting_1 = require("./alerting");
// ═══════════════════════════════════════════════════════════════════════════════
// API CALL WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Wraps an external API call with instrumentation
 */
async function instrumentedApiCall(config, apiCall) {
    const startTime = performance.now();
    let retries = 0;
    const maxRetries = config.maxRetries ?? 2;
    const retryDelay = config.retryDelay ?? 1000;
    const attempt = async () => {
        try {
            const data = await apiCall();
            const duration = Math.round(performance.now() - startTime);
            // Log success
            logger_1.logger.externalApi(config.name, config.operation, true, duration, { retries });
            // Record metrics
            metrics_1.metrics.recordExternalApiCall(config.name, config.operation, duration, true);
            return {
                success: true,
                data,
                duration,
                retries
            };
        }
        catch (error) {
            const duration = Math.round(performance.now() - startTime);
            const errorType = classifyApiError(error);
            const retryable = isRetryableError(error);
            // Should we retry?
            if (retryable && retries < maxRetries) {
                retries++;
                logger_1.logger.warn(`Retrying ${config.name} ${config.operation} (attempt ${retries + 1})`, {
                    error: error.message,
                    errorType
                });
                await sleep(retryDelay * retries); // Exponential backoff
                return attempt();
            }
            // Log failure
            logger_1.logger.error(`${config.name} ${config.operation} failed`, error, {
                duration,
                retries,
                errorType
            });
            // Record metrics
            metrics_1.metrics.recordExternalApiCall(config.name, config.operation, duration, false);
            // Track for alerting
            (0, alerting_1.trackApiError)(config.name.toLowerCase());
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
function classifyApiError(error) {
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
function isRetryableError(error) {
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
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// ═══════════════════════════════════════════════════════════════════════════════
// API-SPECIFIC INSTRUMENTATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Stripe API instrumentation
 */
exports.stripeApi = {
    async call(operation, apiCall) {
        return instrumentedApiCall({ name: 'Stripe', operation }, apiCall);
    },
    recordPayment(amount, currency, success) {
        if (success) {
            metrics_1.metrics.recordRevenue(amount, 'payment');
        }
        logger_1.logger.businessEvent('payment_processed', {
            amount,
            currency,
            success
        });
    },
    recordSubscription(event, plan) {
        metrics_1.metrics.recordSubscriptionEvent(event, plan);
        logger_1.logger.businessEvent(`subscription_${event}`, { plan });
    }
};
/**
 * OpenAI API instrumentation
 */
exports.openaiApi = {
    async call(operation, apiCall) {
        return instrumentedApiCall({ name: 'OpenAI', operation, maxRetries: 2, retryDelay: 2000 }, apiCall);
    },
    recordTokenUsage(promptTokens, completionTokens, model) {
        const totalTokens = promptTokens + completionTokens;
        metrics_1.metrics.recordTokenUsage(totalTokens, 'completion', 'openai');
        logger_1.logger.debug('OpenAI token usage', {
            promptTokens,
            completionTokens,
            totalTokens,
            model
        });
    },
    recordTtsUsage(characters) {
        metrics_1.metrics.recordTokenUsage(characters, 'tts', 'openai');
    }
};
/**
 * ElevenLabs API instrumentation
 */
exports.elevenlabsApi = {
    async call(operation, apiCall) {
        return instrumentedApiCall({ name: 'ElevenLabs', operation, maxRetries: 1, retryDelay: 1000 }, apiCall);
    },
    recordVoiceGeneration(characters, voiceId) {
        metrics_1.metrics.recordTokenUsage(characters, 'voice_generation', 'elevenlabs');
        logger_1.logger.businessEvent('voice_generated', {
            characters,
            voiceId,
            provider: 'elevenlabs'
        });
    }
};
/**
 * Anthropic API instrumentation
 */
exports.anthropicApi = {
    async call(operation, apiCall) {
        return instrumentedApiCall({ name: 'Anthropic', operation, maxRetries: 2, retryDelay: 2000 }, apiCall);
    },
    recordTokenUsage(inputTokens, outputTokens, model) {
        const totalTokens = inputTokens + outputTokens;
        metrics_1.metrics.recordTokenUsage(totalTokens, 'completion', 'anthropic');
        logger_1.logger.debug('Anthropic token usage', {
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
exports.supabaseApi = {
    async call(operation, apiCall) {
        return instrumentedApiCall({ name: 'Supabase', operation, maxRetries: 2 }, apiCall);
    },
    recordStorageOperation(operation, bytes) {
        logger_1.logger.debug('Supabase storage operation', {
            operation,
            bytes
        });
    }
};
const apiHealthMap = new Map();
const trackApiHealth = (name, success, latency) => {
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
    }
    else {
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
exports.trackApiHealth = trackApiHealth;
const getApiHealth = () => {
    return Array.from(apiHealthMap.values());
};
exports.getApiHealth = getApiHealth;
const getUnhealthyApis = () => {
    return Array.from(apiHealthMap.values()).filter(h => !h.isHealthy);
};
exports.getUnhealthyApis = getUnhealthyApis;
exports.default = {
    instrumentedApiCall,
    stripeApi: exports.stripeApi,
    openaiApi: exports.openaiApi,
    elevenlabsApi: exports.elevenlabsApi,
    anthropicApi: exports.anthropicApi,
    supabaseApi: exports.supabaseApi,
    getApiHealth: exports.getApiHealth,
    getUnhealthyApis: exports.getUnhealthyApis
};
