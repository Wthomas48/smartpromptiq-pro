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
// Create new generation
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('projectId').notEmpty(),
    (0, express_validator_1.body)('prompt').notEmpty().trim(),
    (0, express_validator_1.body)('model').notEmpty().trim(),
    (0, express_validator_1.body)('category').notEmpty().trim()
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
        // Check user's generation limit
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.id }
        });
        if (user.generationsUsed >= user.generationsLimit) {
            return res.status(403).json({
                success: false,
                message: 'Generation limit exceeded. Please upgrade your plan.'
            });
        }
        const { projectId, prompt, model, category, response, tokenCount, cost, metadata } = req.body;
        // Verify project ownership
        const project = await database_1.default.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.id
            }
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        // Create generation and update user usage
        const [generation] = await database_1.default.$transaction([
            database_1.default.generation.create({
                data: {
                    projectId,
                    userId: req.user.id,
                    prompt,
                    response: response || 'Processing...',
                    model,
                    category,
                    tokenCount,
                    cost,
                    metadata
                }
            }),
            database_1.default.user.update({
                where: { id: req.user.id },
                data: {
                    generationsUsed: { increment: 1 }
                }
            })
        ]);
        res.status(201).json({
            success: true,
            message: 'Generation created successfully',
            data: { generation }
        });
    }
    catch (error) {
        console.error('Create generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get user's generations
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 20, projectId, category } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { userId: req.user.id };
        if (projectId)
            where.projectId = projectId;
        if (category)
            where.category = category;
        const generations = await database_1.default.generation.findMany({
            where,
            include: {
                project: {
                    select: { title: true, category: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit)
        });
        const total = await database_1.default.generation.count({ where });
        res.json({
            success: true,
            data: {
                generations,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Get generations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get single generation
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const generation = await database_1.default.generation.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                project: {
                    select: { title: true, category: true }
                }
            }
        });
        if (!generation) {
            return res.status(404).json({
                success: false,
                message: 'Generation not found'
            });
        }
        res.json({
            success: true,
            data: { generation }
        });
    }
    catch (error) {
        console.error('Get generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Rate generation
router.patch('/:id/rate', auth_1.authenticate, [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 })
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
        const { rating } = req.body;
        const generation = await database_1.default.generation.updateMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            data: {
                quality: rating
            }
        });
        if (generation.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Generation not found'
            });
        }
        res.json({
            success: true,
            message: 'Rating updated successfully'
        });
    }
    catch (error) {
        console.error('Rate generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
