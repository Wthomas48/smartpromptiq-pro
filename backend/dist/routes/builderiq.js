"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// ============================================
// TEMPLATES
// ============================================
/**
 * GET /api/builderiq/templates
 * Get all published templates with optional filtering
 */
router.get('/templates', async (req, res) => {
    try {
        const { industry, category, complexity, featured, search, limit = '50', offset = '0' } = req.query;
        const where = {
            isPublished: true,
        };
        if (industry && industry !== 'all') {
            where.industry = industry;
        }
        if (category && category !== 'all') {
            where.category = category;
        }
        if (complexity && complexity !== 'all') {
            where.complexity = complexity;
        }
        if (featured === 'true') {
            where.isFeatured = true;
        }
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }
        const templates = await database_1.default.builderIQTemplate.findMany({
            where,
            orderBy: [
                { isFeatured: 'desc' },
                { usageCount: 'desc' },
                { rating: 'desc' },
            ],
            take: parseInt(limit),
            skip: parseInt(offset),
        });
        const total = await database_1.default.builderIQTemplate.count({ where });
        res.json({
            success: true,
            data: templates,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    }
    catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch templates',
            error: error.message,
        });
    }
});
/**
 * GET /api/builderiq/templates/:slug
 * Get a single template by slug
 */
router.get('/templates/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const template = await database_1.default.builderIQTemplate.findUnique({
            where: { slug },
        });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found',
            });
        }
        // Increment usage count
        await database_1.default.builderIQTemplate.update({
            where: { slug },
            data: { usageCount: { increment: 1 } },
        });
        res.json({
            success: true,
            data: template,
        });
    }
    catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch template',
            error: error.message,
        });
    }
});
// ============================================
// INDUSTRIES
// ============================================
/**
 * GET /api/builderiq/industries
 * Get all active industries
 */
router.get('/industries', async (req, res) => {
    try {
        const industries = await database_1.default.builderIQIndustry.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        res.json({
            success: true,
            data: industries,
        });
    }
    catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch industries',
            error: error.message,
        });
    }
});
// ============================================
// SESSIONS (Authenticated)
// ============================================
/**
 * POST /api/builderiq/sessions
 * Create a new BuilderIQ session
 */
router.post('/sessions', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionType, industry, category, voiceEnabled } = req.body;
        // Generate a unique share code
        const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const session = await database_1.default.builderIQSession.create({
            data: {
                userId,
                sessionType: sessionType || 'questionnaire',
                industry,
                category,
                voiceEnabled: voiceEnabled || false,
                shareCode,
            },
        });
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create session',
            error: error.message,
        });
    }
});
/**
 * PUT /api/builderiq/sessions/:id
 * Update a session with responses
 */
router.put('/sessions/:id', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { responses, storyInput, voiceTranscript, status, appName, appDescription } = req.body;
        // Verify ownership
        const existing = await database_1.default.builderIQSession.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or access denied',
            });
        }
        const session = await database_1.default.builderIQSession.update({
            where: { id },
            data: {
                responses: responses ? JSON.stringify(responses) : undefined,
                storyInput,
                voiceTranscript,
                status,
                appName,
                appDescription,
                updatedAt: new Date(),
                completedAt: status === 'completed' ? new Date() : undefined,
            },
        });
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update session',
            error: error.message,
        });
    }
});
/**
 * GET /api/builderiq/sessions
 * Get user's sessions
 */
router.get('/sessions', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await database_1.default.builderIQSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
        res.json({
            success: true,
            data: sessions,
        });
    }
    catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sessions',
            error: error.message,
        });
    }
});
/**
 * GET /api/builderiq/sessions/:id
 * Get a specific session
 */
router.get('/sessions/:id', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const session = await database_1.default.builderIQSession.findFirst({
            where: { id, userId },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
            });
        }
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session',
            error: error.message,
        });
    }
});
// ============================================
// GENERATED APPS (Authenticated)
// ============================================
/**
 * POST /api/builderiq/apps
 * Save a generated app blueprint
 */
router.post('/apps', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, industry, category, masterPrompt, blueprint, features, techStack, userPersonas, compliance, monetization, marketingCopy, designStyle, colorScheme, sessionId, } = req.body;
        const app = await database_1.default.builderIQGeneratedApp.create({
            data: {
                userId,
                name,
                description,
                industry,
                category,
                masterPrompt,
                blueprint: JSON.stringify(blueprint),
                features: JSON.stringify(features),
                techStack: techStack ? JSON.stringify(techStack) : undefined,
                userPersonas: userPersonas ? JSON.stringify(userPersonas) : undefined,
                compliance: compliance ? JSON.stringify(compliance) : undefined,
                monetization: monetization ? JSON.stringify(monetization) : undefined,
                marketingCopy: marketingCopy ? JSON.stringify(marketingCopy) : undefined,
                designStyle,
                colorScheme,
                sessionId,
            },
        });
        res.json({
            success: true,
            data: app,
        });
    }
    catch (error) {
        console.error('Error saving app:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save app',
            error: error.message,
        });
    }
});
/**
 * GET /api/builderiq/apps
 * Get user's generated apps
 */
router.get('/apps', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const apps = await database_1.default.builderIQGeneratedApp.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
        res.json({
            success: true,
            data: apps,
        });
    }
    catch (error) {
        console.error('Error fetching apps:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch apps',
            error: error.message,
        });
    }
});
/**
 * GET /api/builderiq/apps/:id
 * Get a specific generated app
 */
router.get('/apps/:id', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const app = await database_1.default.builderIQGeneratedApp.findFirst({
            where: { id, userId },
        });
        if (!app) {
            return res.status(404).json({
                success: false,
                message: 'App not found',
            });
        }
        res.json({
            success: true,
            data: app,
        });
    }
    catch (error) {
        console.error('Error fetching app:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch app',
            error: error.message,
        });
    }
});
/**
 * PUT /api/builderiq/apps/:id/export
 * Track app export
 */
router.put('/apps/:id/export', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const app = await database_1.default.builderIQGeneratedApp.updateMany({
            where: { id, userId },
            data: {
                exportCount: { increment: 1 },
                lastExportedAt: new Date(),
            },
        });
        res.json({
            success: true,
            message: 'Export tracked',
        });
    }
    catch (error) {
        console.error('Error tracking export:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track export',
            error: error.message,
        });
    }
});
// ============================================
// SAVED TEMPLATES (Authenticated)
// ============================================
/**
 * POST /api/builderiq/saved-templates
 * Save a template to user's library
 */
router.post('/saved-templates', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { templateId, customizations, notes } = req.body;
        const saved = await database_1.default.builderIQSavedTemplate.upsert({
            where: {
                userId_templateId: { userId, templateId },
            },
            update: {
                customizations: customizations ? JSON.stringify(customizations) : undefined,
                notes,
            },
            create: {
                userId,
                templateId,
                customizations: customizations ? JSON.stringify(customizations) : undefined,
                notes,
            },
        });
        res.json({
            success: true,
            data: saved,
        });
    }
    catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save template',
            error: error.message,
        });
    }
});
/**
 * GET /api/builderiq/saved-templates
 * Get user's saved templates
 */
router.get('/saved-templates', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const saved = await database_1.default.builderIQSavedTemplate.findMany({
            where: { userId },
            include: { template: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: saved,
        });
    }
    catch (error) {
        console.error('Error fetching saved templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved templates',
            error: error.message,
        });
    }
});
/**
 * DELETE /api/builderiq/saved-templates/:templateId
 * Remove a saved template
 */
router.delete('/saved-templates/:templateId', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { templateId } = req.params;
        await database_1.default.builderIQSavedTemplate.deleteMany({
            where: { userId, templateId },
        });
        res.json({
            success: true,
            message: 'Template removed from saved',
        });
    }
    catch (error) {
        console.error('Error removing saved template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove saved template',
            error: error.message,
        });
    }
});
// ============================================
// COLLABORATION
// ============================================
/**
 * GET /api/builderiq/shared/:shareCode
 * Get a shared session by code
 */
router.get('/shared/:shareCode', async (req, res) => {
    try {
        const { shareCode } = req.params;
        const session = await database_1.default.builderIQSession.findUnique({
            where: { shareCode },
        });
        if (!session || !session.isShared) {
            return res.status(404).json({
                success: false,
                message: 'Shared session not found',
            });
        }
        res.json({
            success: true,
            data: {
                appName: session.appName,
                appDescription: session.appDescription,
                industry: session.industry,
                category: session.category,
                generatedPrompt: session.generatedPrompt,
                generatedBlueprint: session.generatedBlueprint,
            },
        });
    }
    catch (error) {
        console.error('Error fetching shared session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shared session',
            error: error.message,
        });
    }
});
/**
 * PUT /api/builderiq/sessions/:id/share
 * Enable/disable sharing for a session
 */
router.put('/sessions/:id/share', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { isShared } = req.body;
        const session = await database_1.default.builderIQSession.updateMany({
            where: { id, userId },
            data: { isShared },
        });
        if (session.count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Session not found',
            });
        }
        // Get the updated session to return the share code
        const updated = await database_1.default.builderIQSession.findUnique({
            where: { id },
        });
        res.json({
            success: true,
            data: {
                isShared: updated?.isShared,
                shareCode: updated?.shareCode,
                shareUrl: updated?.isShared ? `/builderiq/shared/${updated.shareCode}` : null,
            },
        });
    }
    catch (error) {
        console.error('Error updating share status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update share status',
            error: error.message,
        });
    }
});
exports.default = router;
