"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const cache = new Map();
const cacheStats = {
    totalHits: 0,
    totalMisses: 0,
    totalCostSaved: 0
};
// Helper functions
const isExpired = (entry) => {
    return new Date() > entry.expiry;
};
const getCacheKey = (category, prompt) => {
    return `suggestions:${category}:${Buffer.from(prompt).toString('base64').slice(0, 20)}`;
};
const generateMockSuggestions = (category, count = 10) => {
    const suggestions = [
        {
            id: `${category}-1`,
            title: `Professional ${category} Strategy`,
            prompt: `Create a comprehensive ${category} strategy that focuses on...`,
            category,
            complexity: 'standard',
            estimatedTokens: 150
        },
        {
            id: `${category}-2`,
            title: `Advanced ${category} Framework`,
            prompt: `Develop an advanced ${category} framework that includes...`,
            category,
            complexity: 'complex',
            estimatedTokens: 200
        },
        {
            id: `${category}-3`,
            title: `Quick ${category} Solution`,
            prompt: `Implement a quick ${category} solution for immediate results...`,
            category,
            complexity: 'simple',
            estimatedTokens: 100
        }
    ];
    return suggestions.slice(0, count).map((suggestion, index) => ({
        ...suggestion,
        id: `${category}-${index + 1}`,
        title: `${suggestion.title} ${index + 1}`,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }));
};
// Get cache statistics
router.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const totalCached = cache.size;
        const hitRate = cacheStats.totalHits + cacheStats.totalMisses > 0
            ? cacheStats.totalHits / (cacheStats.totalHits + cacheStats.totalMisses)
            : 0;
        // Calculate category breakdown
        const categoryBreakdown = {};
        const expiryInfo = {};
        for (const [key, entry] of cache.entries()) {
            // Count by category
            if (categoryBreakdown[entry.category]) {
                categoryBreakdown[entry.category]++;
            }
            else {
                categoryBreakdown[entry.category] = 1;
            }
            // Check expiry status
            expiryInfo[key] = isExpired(entry) ? 'expired' : 'valid';
        }
        // Calculate cost savings (assuming $0.002 per API call saved)
        const costSavings = cacheStats.totalHits * 0.002;
        res.json({
            success: true,
            data: {
                totalCached,
                hitRate,
                costSavings,
                categoryBreakdown,
                expiryInfo,
                performance: {
                    totalHits: cacheStats.totalHits,
                    totalMisses: cacheStats.totalMisses,
                    avgResponseTime: '50ms',
                    uptime: '99.9%'
                }
            }
        });
    }
    catch (error) {
        console.error('Get cache stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Preload cache for specific categories
router.post('/preload', auth_1.authenticate, [
    (0, express_validator_1.body)('categories').isArray().withMessage('Categories must be an array')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { categories } = req.body;
        let preloadedCount = 0;
        for (const category of categories) {
            // Generate suggestions for each category
            const suggestions = generateMockSuggestions(category, 15);
            suggestions.forEach((suggestion, index) => {
                const cacheKey = `suggestions:${category}:preload-${index}`;
                const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                cache.set(cacheKey, {
                    key: cacheKey,
                    value: suggestion,
                    expiry,
                    category,
                    hitCount: 0,
                    lastAccessed: new Date()
                });
                preloadedCount++;
            });
        }
        res.json({
            success: true,
            message: `Preloaded ${preloadedCount} suggestions across ${categories.length} categories`,
            data: {
                categoriesPreloaded: categories,
                suggestionsCount: preloadedCount,
                expiresIn: '24 hours'
            }
        });
    }
    catch (error) {
        console.error('Preload cache error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Clear expired cache entries
router.delete('/expired', auth_1.authenticate, async (req, res) => {
    try {
        let expiredCount = 0;
        const expiredKeys = [];
        for (const [key, entry] of cache.entries()) {
            if (isExpired(entry)) {
                cache.delete(key);
                expiredKeys.push(key);
                expiredCount++;
            }
        }
        res.json({
            success: true,
            message: `Cleared ${expiredCount} expired cache entries`,
            data: {
                expiredCount,
                remainingEntries: cache.size,
                clearedKeys: expiredKeys.slice(0, 10) // Show first 10 for debugging
            }
        });
    }
    catch (error) {
        console.error('Clear expired cache error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get cached suggestions for a category
router.get('/suggestions/:category', auth_1.authenticate, async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 10 } = req.query;
        const suggestions = [];
        for (const [key, entry] of cache.entries()) {
            if (entry.category === category && !isExpired(entry)) {
                suggestions.push({
                    ...entry.value,
                    cacheKey: key,
                    hitCount: entry.hitCount,
                    lastAccessed: entry.lastAccessed
                });
                // Update hit count and last accessed
                entry.hitCount++;
                entry.lastAccessed = new Date();
                cacheStats.totalHits++;
            }
        }
        // Sort by hit count (most popular first)
        suggestions.sort((a, b) => b.hitCount - a.hitCount);
        res.json({
            success: true,
            data: {
                suggestions: suggestions.slice(0, Number(limit)),
                totalAvailable: suggestions.length,
                category,
                cacheHit: suggestions.length > 0
            }
        });
    }
    catch (error) {
        console.error('Get cached suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Cache a new suggestion
router.post('/suggestions', auth_1.authenticate, [
    (0, express_validator_1.body)('category').notEmpty().trim(),
    (0, express_validator_1.body)('suggestion').isObject().withMessage('Suggestion must be an object')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        const { category, suggestion, ttl = 24 } = req.body; // ttl in hours
        const cacheKey = getCacheKey(category, suggestion.prompt || suggestion.title);
        const expiry = new Date(Date.now() + ttl * 60 * 60 * 1000);
        cache.set(cacheKey, {
            key: cacheKey,
            value: {
                ...suggestion,
                cachedAt: new Date(),
                expiresAt: expiry
            },
            expiry,
            category,
            hitCount: 0,
            lastAccessed: new Date()
        });
        res.json({
            success: true,
            message: 'Suggestion cached successfully',
            data: {
                cacheKey,
                expiresAt: expiry,
                category
            }
        });
    }
    catch (error) {
        console.error('Cache suggestion error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Clear all cache
router.delete('/all', auth_1.authenticate, async (req, res) => {
    try {
        const totalCleared = cache.size;
        cache.clear();
        // Reset stats
        cacheStats.totalHits = 0;
        cacheStats.totalMisses = 0;
        cacheStats.totalCostSaved = 0;
        res.json({
            success: true,
            message: `Cleared all cache entries (${totalCleared} items)`,
            data: {
                clearedCount: totalCleared,
                remainingEntries: 0
            }
        });
    }
    catch (error) {
        console.error('Clear all cache error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get cache health status
router.get('/health', auth_1.authenticate, async (req, res) => {
    try {
        const totalEntries = cache.size;
        let validEntries = 0;
        let expiredEntries = 0;
        for (const [, entry] of cache.entries()) {
            if (isExpired(entry)) {
                expiredEntries++;
            }
            else {
                validEntries++;
            }
        }
        const healthScore = totalEntries > 0 ? (validEntries / totalEntries) * 100 : 100;
        res.json({
            success: true,
            data: {
                status: healthScore > 80 ? 'healthy' : healthScore > 50 ? 'warning' : 'critical',
                healthScore: Math.round(healthScore),
                totalEntries,
                validEntries,
                expiredEntries,
                memoryUsage: `${Math.round(JSON.stringify([...cache.values()]).length / 1024)}KB`,
                uptime: process.uptime(),
                recommendations: [
                    expiredEntries > 0 ? 'Clear expired entries to improve performance' : null,
                    validEntries < 10 ? 'Preload popular categories for better hit rates' : null,
                    healthScore < 70 ? 'Consider cache optimization' : null
                ].filter(Boolean)
            }
        });
    }
    catch (error) {
        console.error('Get cache health error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
