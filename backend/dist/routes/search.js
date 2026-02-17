"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const costs_1 = require("../config/costs");
const costTracking_1 = require("../middleware/costTracking");
const searchService_1 = require("../services/searchService");
const router = express_1.default.Router();
// ============================================
// GET /api/search/status
// Check if web search is configured
// ============================================
router.get('/status', auth_1.authenticate, async (req, res) => {
    try {
        return res.json({
            success: true,
            data: {
                configured: (0, searchService_1.isSearchConfigured)(),
            },
        });
    }
    catch (error) {
        console.error('Search status error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
// ============================================
// POST /api/search
// Raw web search (returns results only)
// ============================================
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('query').notEmpty().trim().isLength({ min: 2, max: 500 }).withMessage('Query must be 2-500 characters'),
    (0, express_validator_1.body)('searchDepth').optional().isIn(['basic', 'advanced']).withMessage('searchDepth must be basic or advanced'),
    (0, express_validator_1.body)('maxResults').optional().isInt({ min: 1, max: 10 }).withMessage('maxResults must be 1-10'),
    (0, express_validator_1.body)('topic').optional().isIn(['general', 'news']).withMessage('topic must be general or news'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        if (!(0, searchService_1.isSearchConfigured)()) {
            return res.status(503).json({ success: false, message: 'Web search is not configured' });
        }
        const userId = req.user.id;
        const { query, searchDepth = 'basic', maxResults, topic } = req.body;
        // Deduct tokens
        const costKey = searchDepth === 'advanced' ? 'search-advanced' : 'search-basic';
        const tokenCost = (0, costs_1.getTokenCost)('search', costKey);
        const deducted = await (0, costTracking_1.deductTokens)(userId, tokenCost);
        if (!deducted) {
            return res.status(402).json({ success: false, message: 'Insufficient tokens' });
        }
        const options = { searchDepth, maxResults, topic };
        const result = await (0, searchService_1.searchWeb)(query, options);
        return res.json({
            success: true,
            data: {
                ...result,
                tokensUsed: tokenCost,
            },
        });
    }
    catch (error) {
        console.error('Web search error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Web search failed' });
    }
});
// ============================================
// POST /api/search/synthesize
// Search + AI synthesis with citations
// ============================================
router.post('/synthesize', auth_1.authenticate, [
    (0, express_validator_1.body)('query').notEmpty().trim().isLength({ min: 2, max: 500 }).withMessage('Query must be 2-500 characters'),
    (0, express_validator_1.body)('searchDepth').optional().isIn(['basic', 'advanced']).withMessage('searchDepth must be basic or advanced'),
    (0, express_validator_1.body)('maxResults').optional().isInt({ min: 1, max: 10 }).withMessage('maxResults must be 1-10'),
    (0, express_validator_1.body)('topic').optional().isIn(['general', 'news']).withMessage('topic must be general or news'),
    (0, express_validator_1.body)('provider').optional().isIn(['openai', 'anthropic', 'gemini']).withMessage('Invalid provider'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        if (!(0, searchService_1.isSearchConfigured)()) {
            return res.status(503).json({ success: false, message: 'Web search is not configured' });
        }
        const userId = req.user.id;
        const { query, searchDepth = 'basic', maxResults, topic, provider } = req.body;
        // Deduct tokens
        const costKey = searchDepth === 'advanced' ? 'synthesize-advanced' : 'synthesize-basic';
        const tokenCost = (0, costs_1.getTokenCost)('search', costKey);
        const deducted = await (0, costTracking_1.deductTokens)(userId, tokenCost);
        if (!deducted) {
            return res.status(402).json({ success: false, message: 'Insufficient tokens' });
        }
        const options = { searchDepth, maxResults, topic };
        const result = await (0, searchService_1.searchAndSynthesize)(query, options, provider);
        return res.json({
            success: true,
            data: {
                answer: result.answer,
                sources: result.sources,
                query: result.searchResult.query,
                provider: result.provider,
                model: result.model,
                usage: result.usage,
                searchDepth: result.searchResult.searchDepth,
                timeTakenMs: result.searchResult.timeTakenMs,
                tokensUsed: tokenCost,
            },
        });
    }
    catch (error) {
        console.error('Search synthesis error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Search synthesis failed' });
    }
});
exports.default = router;
