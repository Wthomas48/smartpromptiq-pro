"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const router = express_1.default.Router();
const MAX_MEMORIES = 50; // Max memories per user
// ============================================
// GET /api/memory
// List user's memories
// ============================================
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const activeOnly = req.query.active !== 'false';
        const memories = await database_1.prisma.userMemory.findMany({
            where: {
                userId,
                ...(activeOnly && { isActive: true }),
            },
            orderBy: { updatedAt: 'desc' },
        });
        res.json({
            success: true,
            data: {
                memories,
                count: memories.length,
                maxMemories: MAX_MEMORIES,
            },
        });
    }
    catch (error) {
        console.error('List memories error:', error);
        res.status(500).json({ success: false, error: 'Failed to list memories' });
    }
});
// ============================================
// POST /api/memory
// Add a memory
// ============================================
router.post('/', auth_1.authenticate, [
    (0, express_validator_1.body)('content').notEmpty().trim().isLength({ min: 2, max: 500 }).withMessage('Memory must be 2-500 characters'),
    (0, express_validator_1.body)('category').optional().isIn(['general', 'preference', 'fact', 'instruction']),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const userId = req.user.id;
        const { content, category = 'general' } = req.body;
        // Check memory limit
        const existingCount = await database_1.prisma.userMemory.count({
            where: { userId, isActive: true },
        });
        if (existingCount >= MAX_MEMORIES) {
            return res.status(400).json({
                success: false,
                error: `Maximum ${MAX_MEMORIES} active memories reached. Delete some before adding more.`,
            });
        }
        const memory = await database_1.prisma.userMemory.create({
            data: {
                userId,
                content: content.trim(),
                category,
                source: 'user',
            },
        });
        res.status(201).json({ success: true, data: memory });
    }
    catch (error) {
        console.error('Create memory error:', error);
        res.status(500).json({ success: false, error: 'Failed to create memory' });
    }
});
// ============================================
// PUT /api/memory/:id
// Update a memory
// ============================================
router.put('/:id', auth_1.authenticate, [
    (0, express_validator_1.body)('content').optional().trim().isLength({ min: 2, max: 500 }),
    (0, express_validator_1.body)('category').optional().isIn(['general', 'preference', 'fact', 'instruction']),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const userId = req.user.id;
        const memory = await database_1.prisma.userMemory.findFirst({
            where: { id: req.params.id, userId },
        });
        if (!memory) {
            return res.status(404).json({ success: false, error: 'Memory not found' });
        }
        const updated = await database_1.prisma.userMemory.update({
            where: { id: memory.id },
            data: {
                ...(req.body.content && { content: req.body.content.trim() }),
                ...(req.body.category && { category: req.body.category }),
                ...(typeof req.body.isActive === 'boolean' && { isActive: req.body.isActive }),
            },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error('Update memory error:', error);
        res.status(500).json({ success: false, error: 'Failed to update memory' });
    }
});
// ============================================
// DELETE /api/memory/:id
// Delete a memory
// ============================================
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const memory = await database_1.prisma.userMemory.findFirst({
            where: { id: req.params.id, userId },
        });
        if (!memory) {
            return res.status(404).json({ success: false, error: 'Memory not found' });
        }
        await database_1.prisma.userMemory.delete({ where: { id: memory.id } });
        res.json({ success: true, message: 'Memory deleted' });
    }
    catch (error) {
        console.error('Delete memory error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete memory' });
    }
});
// ============================================
// GET /api/memory/context
// Get formatted memory context for AI prompts
// (Used internally by generation/chat routes)
// ============================================
router.get('/context', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const memories = await database_1.prisma.userMemory.findMany({
            where: { userId, isActive: true },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
        if (memories.length === 0) {
            return res.json({ success: true, data: { context: null, count: 0 } });
        }
        // Format memories into a context block for AI prompts
        const contextLines = memories.map((m) => `- ${m.content}`);
        const context = `## User Context (from saved memories)\n${contextLines.join('\n')}`;
        res.json({
            success: true,
            data: { context, count: memories.length },
        });
    }
    catch (error) {
        console.error('Memory context error:', error);
        res.status(500).json({ success: false, error: 'Failed to get memory context' });
    }
});
// ============================================
// DELETE /api/memory
// Clear all memories
// ============================================
router.delete('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const deleted = await database_1.prisma.userMemory.deleteMany({
            where: { userId },
        });
        res.json({ success: true, message: `Deleted ${deleted.count} memories` });
    }
    catch (error) {
        console.error('Clear memories error:', error);
        res.status(500).json({ success: false, error: 'Failed to clear memories' });
    }
});
exports.default = router;
