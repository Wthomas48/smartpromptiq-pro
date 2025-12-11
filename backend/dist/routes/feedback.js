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
// Submit rating (specific endpoint for rating popup)
router.post('/rating', auth_1.authenticate, async (req, res) => {
    try {
        const { category, feature, rating, feedback, context, timestamp } = req.body;
        const userId = req.user.id;
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }
        // Create feedback entry with rating data structure
        const feedbackEntry = await database_1.default.feedback.create({
            data: {
                rating: parseInt(rating),
                feedback: feedback || null,
                page: feature || category || 'general',
                userAgent: req.headers['user-agent'] || null,
                userId,
                submittedAt: timestamp ? new Date(timestamp) : new Date()
            }
        });
        // Update user feedback statistics
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                updatedAt: new Date()
            }
        });
        res.status(201).json({
            success: true,
            data: {
                id: feedbackEntry.id,
                rating: feedbackEntry.rating,
                category: category || 'general',
                feature: feature || 'overall',
                submittedAt: feedbackEntry.submittedAt
            },
            message: 'Rating submitted successfully'
        });
    }
    catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Submit feedback
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Invalid email address'),
    (0, express_validator_1.body)('feedback').optional().trim(),
    (0, express_validator_1.body)('timestamp').isISO8601().withMessage('Invalid timestamp'),
    (0, express_validator_1.body)('userAgent').optional().trim(),
    (0, express_validator_1.body)('page').optional().trim()
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
        const { rating, email, feedback, timestamp, userAgent, page } = req.body;
        const userId = req.user.id;
        // Create feedback entry
        const feedbackEntry = await database_1.default.feedback.create({
            data: {
                rating,
                email: email || null,
                feedback: feedback || null,
                page: page || null,
                userAgent: userAgent || null,
                userId,
                submittedAt: new Date(timestamp)
            }
        });
        // Update user feedback statistics
        await database_1.default.user.update({
            where: { id: userId },
            data: {
                // Add feedback count if we add this field later
                updatedAt: new Date()
            }
        });
        res.status(201).json({
            success: true,
            data: {
                id: feedbackEntry.id,
                rating: feedbackEntry.rating,
                submittedAt: feedbackEntry.submittedAt
            },
            message: 'Feedback submitted successfully'
        });
    }
    catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get feedback analytics (admin only)
router.get('/analytics', auth_1.authenticate, async (req, res) => {
    try {
        // Check if user has admin role (you might need to adjust this based on your role system)
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }
        // Get feedback statistics
        const totalFeedback = await database_1.default.feedback.count();
        const averageRating = await database_1.default.feedback.aggregate({
            _avg: {
                rating: true
            }
        });
        const ratingDistribution = await database_1.default.feedback.groupBy({
            by: ['rating'],
            _count: {
                rating: true
            }
        });
        const recentFeedback = await database_1.default.feedback.findMany({
            orderBy: { submittedAt: 'desc' },
            take: 10,
            include: {
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        // Get feedback by page
        const feedbackByPage = await database_1.default.feedback.groupBy({
            by: ['page'],
            _count: {
                page: true
            },
            _avg: {
                rating: true
            },
            where: {
                page: {
                    not: null
                }
            }
        });
        // Get feedback trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const feedbackTrends = await database_1.default.feedback.groupBy({
            by: ['submittedAt'],
            _count: {
                id: true
            },
            _avg: {
                rating: true
            },
            where: {
                submittedAt: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });
        res.json({
            success: true,
            data: {
                summary: {
                    totalFeedback,
                    averageRating: averageRating._avg.rating || 0,
                    responseRate: totalFeedback > 0 ? 100 : 0 // This would be calculated based on total users vs feedback submissions
                },
                ratingDistribution: ratingDistribution.map(item => ({
                    rating: item.rating,
                    count: item._count.rating
                })),
                recentFeedback: recentFeedback.map(item => ({
                    id: item.id,
                    rating: item.rating,
                    feedback: item.feedback,
                    email: item.email,
                    page: item.page,
                    submittedAt: item.submittedAt,
                    user: {
                        name: item.user.firstName && item.user.lastName
                            ? `${item.user.firstName} ${item.user.lastName}`
                            : item.user.email
                    }
                })),
                pageAnalytics: feedbackByPage.map(item => ({
                    page: item.page,
                    feedbackCount: item._count.page,
                    averageRating: item._avg.rating || 0
                })),
                trends: feedbackTrends
            }
        });
    }
    catch (error) {
        console.error('Get feedback analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get user's own feedback history
router.get('/my-feedback', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const userFeedback = await database_1.default.feedback.findMany({
            where: { userId },
            orderBy: { submittedAt: 'desc' },
            select: {
                id: true,
                rating: true,
                feedback: true,
                page: true,
                submittedAt: true
            }
        });
        const feedbackStats = await database_1.default.feedback.aggregate({
            where: { userId },
            _count: {
                id: true
            },
            _avg: {
                rating: true
            }
        });
        res.json({
            success: true,
            data: {
                feedback: userFeedback,
                statistics: {
                    totalSubmissions: feedbackStats._count.id,
                    averageRating: feedbackStats._avg.rating || 0
                }
            }
        });
    }
    catch (error) {
        console.error('Get user feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Update feedback (within 24 hours of submission)
router.put('/:id', auth_1.authenticate, [
    (0, express_validator_1.body)('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('feedback').optional().trim()
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
        const feedbackId = req.params.id;
        const userId = req.user.id;
        const { rating, feedback } = req.body;
        // Find the feedback entry
        const existingFeedback = await database_1.default.feedback.findFirst({
            where: {
                id: feedbackId,
                userId
            }
        });
        if (!existingFeedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        // Check if feedback was submitted within last 24 hours
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        if (existingFeedback.submittedAt < twentyFourHoursAgo) {
            return res.status(403).json({
                success: false,
                message: 'Feedback can only be updated within 24 hours of submission'
            });
        }
        // Update the feedback
        const updatedFeedback = await database_1.default.feedback.update({
            where: { id: feedbackId },
            data: {
                ...(rating && { rating }),
                ...(feedback !== undefined && { feedback }),
                updatedAt: new Date()
            }
        });
        res.json({
            success: true,
            data: {
                id: updatedFeedback.id,
                rating: updatedFeedback.rating,
                feedback: updatedFeedback.feedback,
                updatedAt: updatedFeedback.updatedAt
            },
            message: 'Feedback updated successfully'
        });
    }
    catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Delete feedback (within 24 hours of submission)
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const userId = req.user.id;
        // Find the feedback entry
        const existingFeedback = await database_1.default.feedback.findFirst({
            where: {
                id: feedbackId,
                userId
            }
        });
        if (!existingFeedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }
        // Check if feedback was submitted within last 24 hours
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        if (existingFeedback.submittedAt < twentyFourHoursAgo) {
            return res.status(403).json({
                success: false,
                message: 'Feedback can only be deleted within 24 hours of submission'
            });
        }
        // Delete the feedback
        await database_1.default.feedback.delete({
            where: { id: feedbackId }
        });
        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get feedback summary for a specific page
router.get('/page-summary', auth_1.authenticate, [
    (0, express_validator_1.body)('page').optional().trim()
], async (req, res) => {
    try {
        const { page } = req.query;
        const whereClause = page ? { page: page } : {};
        const summary = await database_1.default.feedback.aggregate({
            where: whereClause,
            _count: {
                id: true
            },
            _avg: {
                rating: true
            }
        });
        const ratingDistribution = await database_1.default.feedback.groupBy({
            by: ['rating'],
            where: whereClause,
            _count: {
                rating: true
            }
        });
        res.json({
            success: true,
            data: {
                page: page || 'all',
                totalFeedback: summary._count.id,
                averageRating: summary._avg.rating || 0,
                ratingDistribution: ratingDistribution.map(item => ({
                    rating: item.rating,
                    count: item._count.rating
                }))
            }
        });
    }
    catch (error) {
        console.error('Get page summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
