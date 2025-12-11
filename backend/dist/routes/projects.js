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
// Get all projects for user
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = { userId: req.user.id };
        if (category)
            where.category = category;
        if (status)
            where.status = status;
        const projects = await database_1.default.project.findMany({
            where,
            include: {
                _count: {
                    select: { generations: true }
                }
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: Number(limit)
        });
        const total = await database_1.default.project.count({ where });
        res.json({
            success: true,
            data: {
                projects,
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
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Create new project
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('title').notEmpty().trim().escape(),
    (0, express_validator_1.body)('description').optional().trim().escape(),
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
        const { title, description, category, settings } = req.body;
        const project = await database_1.default.project.create({
            data: {
                title,
                description,
                category,
                settings,
                userId: req.user.id
            },
            include: {
                _count: {
                    select: { generations: true }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project }
        });
    }
    catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get single project
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const project = await database_1.default.project.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                generations: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                _count: {
                    select: { generations: true }
                }
            }
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            data: { project }
        });
    }
    catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Update project
router.put('/:id', auth_1.authenticate, [
    (0, express_validator_1.body)('title').optional().trim().escape(),
    (0, express_validator_1.body)('description').optional().trim().escape(),
    (0, express_validator_1.body)('status').optional().isIn(['ACTIVE', 'COMPLETED', 'ARCHIVED'])
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
        const { title, description, status, settings } = req.body;
        const project = await database_1.default.project.updateMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            data: {
                title,
                description,
                status,
                settings
            }
        });
        if (project.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            message: 'Project updated successfully'
        });
    }
    catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Delete project
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const project = await database_1.default.project.deleteMany({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (project.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
