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
// Get all templates for user
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { search, category } = req.query;
        const whereClause = {
            OR: [
                { userId: req.user.id }, // User's own templates
                { isPublic: true }, // Public templates
                {
                    teamId: {
                        in: [] // TODO: Get user's team IDs when team functionality is implemented
                    }
                }
            ]
        };
        // Add search filter
        if (search) {
            whereClause.AND = [
                {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { tags: { has: search } }
                    ]
                }
            ];
        }
        // Add category filter
        if (category && category !== 'all') {
            if (whereClause.AND) {
                whereClause.AND.push({ category: category });
            }
            else {
                whereClause.AND = [{ category: category }];
            }
        }
        const templates = await database_1.default.template.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { usageCount: 'desc' },
                { createdAt: 'desc' }
            ]
        });
        const formattedTemplates = templates.map(template => ({
            id: template.id,
            title: template.title,
            description: template.description,
            category: template.category,
            content: template.content,
            tags: template.tags,
            isPublic: template.isPublic,
            usageCount: template.usageCount,
            createdBy: template.user.name || template.user.email,
            teamId: template.teamId,
            createdAt: template.createdAt.toISOString()
        }));
        res.json({
            success: true,
            data: formattedTemplates
        });
    }
    catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Create new template
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('title').notEmpty().trim().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().trim().withMessage('Description is required'),
    (0, express_validator_1.body)('category').notEmpty().trim().withMessage('Category is required'),
    (0, express_validator_1.body)('content').notEmpty().trim().withMessage('Content is required'),
    (0, express_validator_1.body)('tags').isArray().withMessage('Tags must be an array'),
    (0, express_validator_1.body)('isPublic').isBoolean().withMessage('isPublic must be a boolean')
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
        const { title, description, category, content, tags, isPublic } = req.body;
        const template = await database_1.default.template.create({
            data: {
                title,
                description,
                category,
                content,
                tags,
                isPublic,
                userId: req.user.id,
                usageCount: 0
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        const formattedTemplate = {
            id: template.id,
            title: template.title,
            description: template.description,
            category: template.category,
            content: template.content,
            tags: template.tags,
            isPublic: template.isPublic,
            usageCount: template.usageCount,
            createdBy: template.user.name || template.user.email,
            teamId: template.teamId,
            createdAt: template.createdAt.toISOString()
        };
        res.status(201).json({
            success: true,
            data: formattedTemplate,
            message: 'Template created successfully'
        });
    }
    catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get single template
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const templateId = parseInt(req.params.id);
        const template = await database_1.default.template.findFirst({
            where: {
                id: templateId,
                OR: [
                    { userId: req.user.id },
                    { isPublic: true }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        const formattedTemplate = {
            id: template.id,
            title: template.title,
            description: template.description,
            category: template.category,
            content: template.content,
            tags: template.tags,
            isPublic: template.isPublic,
            usageCount: template.usageCount,
            createdBy: template.user.name || template.user.email,
            teamId: template.teamId,
            createdAt: template.createdAt.toISOString()
        };
        res.json({
            success: true,
            data: formattedTemplate
        });
    }
    catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Update template
router.put('/:id', auth_1.authenticate, [
    (0, express_validator_1.body)('title').optional().notEmpty().trim(),
    (0, express_validator_1.body)('description').optional().notEmpty().trim(),
    (0, express_validator_1.body)('category').optional().notEmpty().trim(),
    (0, express_validator_1.body)('content').optional().notEmpty().trim(),
    (0, express_validator_1.body)('tags').optional().isArray(),
    (0, express_validator_1.body)('isPublic').optional().isBoolean()
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
        const templateId = parseInt(req.params.id);
        // Check if template exists and user owns it
        const existingTemplate = await database_1.default.template.findFirst({
            where: {
                id: templateId,
                userId: req.user.id
            }
        });
        if (!existingTemplate) {
            return res.status(404).json({
                success: false,
                message: 'Template not found or access denied'
            });
        }
        const updateData = {};
        const { title, description, category, content, tags, isPublic } = req.body;
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (category !== undefined)
            updateData.category = category;
        if (content !== undefined)
            updateData.content = content;
        if (tags !== undefined)
            updateData.tags = tags;
        if (isPublic !== undefined)
            updateData.isPublic = isPublic;
        const template = await database_1.default.template.update({
            where: { id: templateId },
            data: updateData,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        const formattedTemplate = {
            id: template.id,
            title: template.title,
            description: template.description,
            category: template.category,
            content: template.content,
            tags: template.tags,
            isPublic: template.isPublic,
            usageCount: template.usageCount,
            createdBy: template.user.name || template.user.email,
            teamId: template.teamId,
            createdAt: template.createdAt.toISOString()
        };
        res.json({
            success: true,
            data: formattedTemplate,
            message: 'Template updated successfully'
        });
    }
    catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Delete template
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const templateId = parseInt(req.params.id);
        // Check if template exists and user owns it
        const template = await database_1.default.template.findFirst({
            where: {
                id: templateId,
                userId: req.user.id
            }
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found or access denied'
            });
        }
        await database_1.default.template.delete({
            where: { id: templateId }
        });
        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Use template (increment usage count)
router.post('/:id/use', auth_1.authenticate, async (req, res) => {
    try {
        const templateId = parseInt(req.params.id);
        const template = await database_1.default.template.findFirst({
            where: {
                id: templateId,
                OR: [
                    { userId: req.user.id },
                    { isPublic: true }
                ]
            }
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }
        const updatedTemplate = await database_1.default.template.update({
            where: { id: templateId },
            data: {
                usageCount: { increment: 1 }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        const formattedTemplate = {
            id: updatedTemplate.id,
            title: updatedTemplate.title,
            description: updatedTemplate.description,
            category: updatedTemplate.category,
            content: updatedTemplate.content,
            tags: updatedTemplate.tags,
            isPublic: updatedTemplate.isPublic,
            usageCount: updatedTemplate.usageCount,
            createdBy: updatedTemplate.user.name || updatedTemplate.user.email,
            teamId: updatedTemplate.teamId,
            createdAt: updatedTemplate.createdAt.toISOString()
        };
        res.json({
            success: true,
            data: formattedTemplate,
            message: 'Template usage recorded'
        });
    }
    catch (error) {
        console.error('Use template error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get template categories
router.get('/categories/list', auth_1.authenticate, async (req, res) => {
    try {
        const categories = await database_1.default.template.findMany({
            where: {
                OR: [
                    { userId: req.user.id },
                    { isPublic: true }
                ]
            },
            select: {
                category: true
            },
            distinct: ['category']
        });
        const categoryList = categories.map(cat => cat.category);
        res.json({
            success: true,
            data: categoryList
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
