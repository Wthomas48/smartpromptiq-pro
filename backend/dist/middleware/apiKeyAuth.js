"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashApiKey = hashApiKey;
exports.generateApiKey = generateApiKey;
exports.authenticateApiKey = authenticateApiKey;
exports.requirePermission = requirePermission;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("../config/database"));
// In-memory rate limit tracking (use Redis in production)
const rateLimitStore = new Map();
/**
 * Hash an API key for secure storage/comparison
 */
function hashApiKey(key) {
    return crypto_1.default.createHash('sha256').update(key).digest('hex');
}
/**
 * Generate a new API key with prefix
 */
function generateApiKey() {
    const prefix = 'spiq_' + crypto_1.default.randomBytes(4).toString('hex');
    const secret = crypto_1.default.randomBytes(24).toString('base64url');
    const key = `${prefix}_${secret}`;
    const hash = hashApiKey(key);
    return { key, prefix, hash };
}
/**
 * Middleware to authenticate requests using API key
 * Supports both header (X-API-Key) and query parameter (?api_key=)
 */
async function authenticateApiKey(req, res, next) {
    try {
        // Extract API key from header or query
        const apiKeyHeader = req.headers['x-api-key'];
        const apiKeyQuery = req.query.api_key;
        const rawKey = apiKeyHeader || apiKeyQuery;
        if (!rawKey) {
            return res.status(401).json({
                success: false,
                error: 'API key required',
                code: 'MISSING_API_KEY'
            });
        }
        // Hash the provided key for comparison
        const keyHash = hashApiKey(rawKey);
        // Look up the API key in database
        const apiKeyRecord = await database_1.default.apiKey.findFirst({
            where: {
                keyHash,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            include: {
                agent: true
            }
        });
        if (!apiKeyRecord) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired API key',
                code: 'INVALID_API_KEY'
            });
        }
        // Check CORS/origin restrictions
        const origin = req.headers.origin;
        if (apiKeyRecord.allowedOrigins && origin) {
            const allowedOrigins = JSON.parse(apiKeyRecord.allowedOrigins);
            const isAllowed = allowedOrigins.some(allowed => {
                if (allowed === '*')
                    return true;
                if (allowed.startsWith('*.')) {
                    const domain = allowed.slice(2);
                    return origin.endsWith(domain);
                }
                return origin === allowed;
            });
            if (!isAllowed) {
                return res.status(403).json({
                    success: false,
                    error: 'Origin not allowed',
                    code: 'ORIGIN_NOT_ALLOWED'
                });
            }
        }
        // Rate limiting check
        const now = Date.now();
        const minuteKey = `${apiKeyRecord.id}:minute`;
        const dayKey = `${apiKeyRecord.id}:day`;
        // Check minute rate limit
        const minuteLimit = rateLimitStore.get(minuteKey);
        if (minuteLimit) {
            if (now < minuteLimit.resetTime) {
                if (minuteLimit.count >= apiKeyRecord.rateLimitPerMinute) {
                    return res.status(429).json({
                        success: false,
                        error: 'Rate limit exceeded (per minute)',
                        code: 'RATE_LIMIT_EXCEEDED',
                        retryAfter: Math.ceil((minuteLimit.resetTime - now) / 1000)
                    });
                }
                minuteLimit.count++;
            }
            else {
                rateLimitStore.set(minuteKey, { count: 1, resetTime: now + 60000 });
            }
        }
        else {
            rateLimitStore.set(minuteKey, { count: 1, resetTime: now + 60000 });
        }
        // Check daily rate limit
        const dayLimit = rateLimitStore.get(dayKey);
        if (dayLimit) {
            if (now < dayLimit.resetTime) {
                if (dayLimit.count >= apiKeyRecord.rateLimitPerDay) {
                    return res.status(429).json({
                        success: false,
                        error: 'Rate limit exceeded (daily)',
                        code: 'RATE_LIMIT_EXCEEDED',
                        retryAfter: Math.ceil((dayLimit.resetTime - now) / 1000)
                    });
                }
                dayLimit.count++;
            }
            else {
                rateLimitStore.set(dayKey, { count: 1, resetTime: now + 86400000 });
            }
        }
        else {
            rateLimitStore.set(dayKey, { count: 1, resetTime: now + 86400000 });
        }
        // Update last used timestamp (async, don't await)
        database_1.default.apiKey.update({
            where: { id: apiKeyRecord.id },
            data: {
                lastUsedAt: new Date(),
                usageCount: { increment: 1 }
            }
        }).catch(err => console.error('Failed to update API key usage:', err));
        // Attach API key and agent info to request
        req.apiKey = {
            id: apiKeyRecord.id,
            userId: apiKeyRecord.userId,
            agentId: apiKeyRecord.agentId,
            permissions: JSON.parse(apiKeyRecord.permissions || '["chat"]'),
            rateLimitPerMinute: apiKeyRecord.rateLimitPerMinute,
            rateLimitPerDay: apiKeyRecord.rateLimitPerDay
        };
        req.agent = {
            id: apiKeyRecord.agent.id,
            name: apiKeyRecord.agent.name,
            slug: apiKeyRecord.agent.slug,
            systemPrompt: apiKeyRecord.agent.systemPrompt,
            provider: apiKeyRecord.agent.provider,
            model: apiKeyRecord.agent.model,
            temperature: apiKeyRecord.agent.temperature,
            maxTokens: apiKeyRecord.agent.maxTokens,
            welcomeMessage: apiKeyRecord.agent.welcomeMessage,
            voiceEnabled: apiKeyRecord.agent.voiceEnabled,
            voiceId: apiKeyRecord.agent.voiceId
        };
        next();
    }
    catch (error) {
        console.error('API key authentication error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication failed',
            code: 'AUTH_ERROR'
        });
    }
}
/**
 * Middleware to check specific permission
 */
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.apiKey) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'NOT_AUTHENTICATED'
            });
        }
        if (!req.apiKey.permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                error: `Permission '${permission}' required`,
                code: 'PERMISSION_DENIED'
            });
        }
        next();
    };
}
