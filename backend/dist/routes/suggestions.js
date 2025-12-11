"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
// Mock suggestion database - in production this would be a real database or ML model
const mockSuggestions = [
    {
        id: 'marketing-1',
        title: 'Social Media Content Strategy',
        description: 'Create engaging social media content that drives engagement and conversions',
        category: 'marketing',
        prompt: 'Create a comprehensive social media content strategy for [BRAND/PRODUCT] targeting [AUDIENCE]. Include content pillars, posting schedule, engagement tactics, and performance metrics.',
        tags: ['social media', 'content strategy', 'engagement', 'branding'],
        relevanceScore: 0.95,
        estimatedTokens: 180,
        popularity: 95,
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date()
    },
    {
        id: 'marketing-2',
        title: 'Email Marketing Campaign',
        description: 'Design effective email marketing campaigns that convert subscribers into customers',
        category: 'marketing',
        prompt: 'Design a 5-email nurture sequence for [PRODUCT/SERVICE] targeting [AUDIENCE]. Include subject lines, compelling copy, clear CTAs, and follow-up strategies.',
        tags: ['email marketing', 'nurture sequence', 'conversion', 'automation'],
        relevanceScore: 0.92,
        estimatedTokens: 220,
        popularity: 88,
        createdAt: new Date('2024-01-10'),
        lastUsed: new Date()
    },
    {
        id: 'creative-1',
        title: 'Brand Storytelling Framework',
        description: 'Develop compelling brand stories that resonate with your target audience',
        category: 'creative',
        prompt: 'Create a brand storytelling framework for [BRAND] that includes origin story, mission narrative, customer success stories, and emotional connection points.',
        tags: ['storytelling', 'branding', 'narrative', 'emotional connection'],
        relevanceScore: 0.89,
        estimatedTokens: 200,
        popularity: 82,
        createdAt: new Date('2024-01-12'),
        lastUsed: new Date()
    },
    {
        id: 'technical-1',
        title: 'API Documentation Generator',
        description: 'Generate comprehensive API documentation with examples and best practices',
        category: 'technical',
        prompt: 'Generate detailed API documentation for [API NAME] including endpoints, request/response examples, authentication methods, error handling, and integration guides.',
        tags: ['api', 'documentation', 'technical writing', 'integration'],
        relevanceScore: 0.87,
        estimatedTokens: 250,
        popularity: 78,
        createdAt: new Date('2024-01-08'),
        lastUsed: new Date()
    },
    {
        id: 'business-1',
        title: 'Business Model Canvas',
        description: 'Create a comprehensive business model canvas for startup or new product ideas',
        category: 'business',
        prompt: 'Develop a detailed business model canvas for [BUSINESS/PRODUCT IDEA] including value propositions, customer segments, revenue streams, key partnerships, and cost structure.',
        tags: ['business model', 'strategy', 'startup', 'planning'],
        relevanceScore: 0.91,
        estimatedTokens: 300,
        popularity: 85,
        createdAt: new Date('2024-01-14'),
        lastUsed: new Date()
    },
    {
        id: 'education-1',
        title: 'Curriculum Development Plan',
        description: 'Design engaging educational curricula with learning objectives and assessments',
        category: 'education',
        prompt: 'Create a comprehensive curriculum plan for [SUBJECT/TOPIC] including learning objectives, module breakdown, assessment methods, and engagement strategies.',
        tags: ['curriculum', 'education', 'learning', 'assessment'],
        relevanceScore: 0.88,
        estimatedTokens: 270,
        popularity: 75,
        createdAt: new Date('2024-01-11'),
        lastUsed: new Date()
    },
    {
        id: 'general-1',
        title: 'Problem-Solution Framework',
        description: 'Systematic approach to identifying and solving complex problems',
        category: 'general',
        prompt: 'Apply a structured problem-solving framework to [PROBLEM/CHALLENGE]: Define the problem, analyze root causes, generate solutions, evaluate options, and create implementation plan.',
        tags: ['problem solving', 'analysis', 'strategy', 'framework'],
        relevanceScore: 0.90,
        estimatedTokens: 190,
        popularity: 90,
        createdAt: new Date('2024-01-13'),
        lastUsed: new Date()
    },
    {
        id: 'marketing-3',
        title: 'Customer Persona Research',
        description: 'Deep dive into customer personas with behavioral insights and preferences',
        category: 'marketing',
        prompt: 'Create detailed customer personas for [PRODUCT/SERVICE] including demographics, psychographics, pain points, goals, preferred channels, and buying journey.',
        tags: ['customer research', 'personas', 'market analysis', 'targeting'],
        relevanceScore: 0.93,
        estimatedTokens: 200,
        popularity: 87,
        createdAt: new Date('2024-01-09'),
        lastUsed: new Date()
    }
];
// Get trending suggestions
router.get('/trending', auth_1.authenticate, [
    (0, express_validator_1.query)('timeframe').optional().isIn(['day', 'week', 'month']).withMessage('Invalid timeframe'),
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
        const { timeframe = 'week', category, limit = 10 } = req.query;
        let filteredSuggestions = [...mockSuggestions];
        // Filter by category if specified
        if (category && category !== 'all') {
            filteredSuggestions = filteredSuggestions.filter(s => s.category === category);
        }
        // Sort by popularity (trending)
        filteredSuggestions.sort((a, b) => b.popularity - a.popularity);
        // Apply limit
        const limitedSuggestions = filteredSuggestions.slice(0, Number(limit));
        // Format response
        const suggestions = limitedSuggestions.map(suggestion => ({
            id: suggestion.id,
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.category,
            prompt: suggestion.prompt,
            tags: suggestion.tags,
            relevanceScore: suggestion.relevanceScore,
            estimatedTokens: suggestion.estimatedTokens
        }));
        res.json({
            success: true,
            data: {
                suggestions,
                metadata: {
                    timeframe,
                    category: category || 'all',
                    total: suggestions.length,
                    trending: true
                }
            }
        });
    }
    catch (error) {
        console.error('Get trending suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get personalized suggestions
router.get('/personalized', auth_1.authenticate, [
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
        const { category, limit = 10 } = req.query;
        const userId = req.user.id;
        // Get user's recent activity to personalize suggestions
        const recentPrompts = await database_1.default.prompt.findMany({
            where: { userId },
            select: { category: true, content: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        // Calculate user's category preferences
        const categoryPreferences = {};
        recentPrompts.forEach(prompt => {
            categoryPreferences[prompt.category] = (categoryPreferences[prompt.category] || 0) + 1;
        });
        let filteredSuggestions = [...mockSuggestions];
        // Filter by category if specified
        if (category && category !== 'all') {
            filteredSuggestions = filteredSuggestions.filter(s => s.category === category);
        }
        // Personalize relevance scores based on user preferences
        filteredSuggestions = filteredSuggestions.map(suggestion => {
            const userPreference = categoryPreferences[suggestion.category] || 0;
            const personalizedScore = Math.min(1.0, suggestion.relevanceScore + (userPreference * 0.05));
            return {
                ...suggestion,
                relevanceScore: personalizedScore
            };
        });
        // Sort by personalized relevance score
        filteredSuggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
        // Apply limit
        const limitedSuggestions = filteredSuggestions.slice(0, Number(limit));
        // Format response
        const suggestions = limitedSuggestions.map(suggestion => ({
            id: suggestion.id,
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.category,
            prompt: suggestion.prompt,
            tags: suggestion.tags,
            relevanceScore: suggestion.relevanceScore,
            estimatedTokens: suggestion.estimatedTokens
        }));
        res.json({
            success: true,
            data: {
                suggestions,
                metadata: {
                    category: category || 'all',
                    total: suggestions.length,
                    personalized: true,
                    userPreferences: categoryPreferences
                }
            }
        });
    }
    catch (error) {
        console.error('Get personalized suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Record suggestion interaction
router.post('/interaction', auth_1.authenticate, [
    (0, express_validator_1.body)('suggestionId').notEmpty().trim().withMessage('Suggestion ID is required'),
    (0, express_validator_1.body)('action').isIn(['select', 'copy', 'dismiss', 'favorite']).withMessage('Invalid action')
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
        const { suggestionId, action } = req.body;
        const userId = req.user.id;
        // In a real implementation, you would store this interaction in the database
        // For now, we'll just acknowledge the interaction
        // Find the suggestion (in production this would be a database lookup)
        const suggestion = mockSuggestions.find(s => s.id === suggestionId);
        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Suggestion not found'
            });
        }
        // Update last used timestamp (in production, update database)
        suggestion.lastUsed = new Date();
        // Log interaction for analytics (in production, store in analytics table)
        console.log(`User ${userId} performed ${action} on suggestion ${suggestionId}`);
        res.json({
            success: true,
            data: {
                suggestionId,
                action,
                timestamp: new Date()
            },
            message: 'Interaction recorded successfully'
        });
    }
    catch (error) {
        console.error('Record interaction error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get suggestions by category
router.get('/category/:category', auth_1.authenticate, [
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
        const { category } = req.params;
        const { limit = 10 } = req.query;
        const filteredSuggestions = mockSuggestions
            .filter(s => s.category === category)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, Number(limit));
        const suggestions = filteredSuggestions.map(suggestion => ({
            id: suggestion.id,
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.category,
            prompt: suggestion.prompt,
            tags: suggestion.tags,
            relevanceScore: suggestion.relevanceScore,
            estimatedTokens: suggestion.estimatedTokens
        }));
        res.json({
            success: true,
            data: {
                suggestions,
                metadata: {
                    category,
                    total: suggestions.length
                }
            }
        });
    }
    catch (error) {
        console.error('Get category suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Search suggestions
router.get('/search', auth_1.authenticate, [
    (0, express_validator_1.query)('q').notEmpty().trim().withMessage('Search query is required'),
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
        const { q: searchQuery, category, limit = 10 } = req.query;
        let filteredSuggestions = [...mockSuggestions];
        // Filter by category if specified
        if (category && category !== 'all') {
            filteredSuggestions = filteredSuggestions.filter(s => s.category === category);
        }
        // Search in title, description, tags, and prompt
        const query = searchQuery.toLowerCase();
        filteredSuggestions = filteredSuggestions.filter(suggestion => suggestion.title.toLowerCase().includes(query) ||
            suggestion.description.toLowerCase().includes(query) ||
            suggestion.tags.some(tag => tag.toLowerCase().includes(query)) ||
            suggestion.prompt.toLowerCase().includes(query));
        // Sort by relevance (simplified - in production use proper search ranking)
        filteredSuggestions.sort((a, b) => {
            const aScore = a.title.toLowerCase().includes(query) ? 2 :
                a.description.toLowerCase().includes(query) ? 1 : 0.5;
            const bScore = b.title.toLowerCase().includes(query) ? 2 :
                b.description.toLowerCase().includes(query) ? 1 : 0.5;
            return bScore - aScore;
        });
        // Apply limit
        const limitedSuggestions = filteredSuggestions.slice(0, Number(limit));
        const suggestions = limitedSuggestions.map(suggestion => ({
            id: suggestion.id,
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.category,
            prompt: suggestion.prompt,
            tags: suggestion.tags,
            relevanceScore: suggestion.relevanceScore,
            estimatedTokens: suggestion.estimatedTokens
        }));
        res.json({
            success: true,
            data: {
                suggestions,
                metadata: {
                    searchQuery,
                    category: category || 'all',
                    total: suggestions.length,
                    resultsFound: filteredSuggestions.length
                }
            }
        });
    }
    catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get suggestion analytics
router.get('/analytics', auth_1.authenticate, async (req, res) => {
    try {
        // In production, this would query actual analytics data
        const analytics = {
            totalSuggestions: mockSuggestions.length,
            categoriesAvailable: [...new Set(mockSuggestions.map(s => s.category))].length,
            averageRelevanceScore: mockSuggestions.reduce((acc, s) => acc + s.relevanceScore, 0) / mockSuggestions.length,
            mostPopularCategories: Object.entries(mockSuggestions.reduce((acc, s) => {
                acc[s.category] = (acc[s.category] || 0) + 1;
                return acc;
            }, {}))
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => ({ category, count })),
            averageTokens: Math.round(mockSuggestions.reduce((acc, s) => acc + s.estimatedTokens, 0) / mockSuggestions.length)
        };
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error('Get suggestion analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
