import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

// ============================================
// TEMPLATES
// ============================================

/**
 * GET /api/builderiq/templates
 * Get all published templates with optional filtering
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { industry, category, complexity, featured, search, limit = '50', offset = '0' } = req.query;

    const where: any = {
      isPublished: true,
    };

    if (industry && industry !== 'all') {
      where.industry = industry as string;
    }

    if (category && category !== 'all') {
      where.category = category as string;
    }

    if (complexity && complexity !== 'all') {
      where.complexity = complexity as string;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const templates = await prisma.builderIQTemplate.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { usageCount: 'desc' },
        { rating: 'desc' },
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.builderIQTemplate.count({ where });

    res.json({
      success: true,
      data: templates,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
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
router.get('/templates/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const template = await prisma.builderIQTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Increment usage count
    await prisma.builderIQTemplate.update({
      where: { slug },
      data: { usageCount: { increment: 1 } },
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
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
router.get('/industries', async (req: Request, res: Response) => {
  try {
    const industries = await prisma.builderIQIndustry.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    res.json({
      success: true,
      data: industries,
    });
  } catch (error: any) {
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
router.post('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionType, industry, category, voiceEnabled } = req.body;

    // Generate a unique share code
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const session = await prisma.builderIQSession.create({
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
  } catch (error: any) {
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
router.put('/sessions/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { responses, storyInput, voiceTranscript, status, appName, appDescription } = req.body;

    // Verify ownership
    const existing = await prisma.builderIQSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied',
      });
    }

    const session = await prisma.builderIQSession.update({
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
  } catch (error: any) {
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
router.get('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const sessions = await prisma.builderIQSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
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
router.get('/sessions/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const session = await prisma.builderIQSession.findFirst({
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
  } catch (error: any) {
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
router.post('/apps', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      description,
      industry,
      category,
      masterPrompt,
      blueprint,
      features,
      techStack,
      userPersonas,
      compliance,
      monetization,
      marketingCopy,
      designStyle,
      colorScheme,
      sessionId,
    } = req.body;

    const app = await prisma.builderIQGeneratedApp.create({
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
  } catch (error: any) {
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
router.get('/apps', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const apps = await prisma.builderIQGeneratedApp.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: apps,
    });
  } catch (error: any) {
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
router.get('/apps/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const app = await prisma.builderIQGeneratedApp.findFirst({
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
  } catch (error: any) {
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
router.put('/apps/:id/export', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const app = await prisma.builderIQGeneratedApp.updateMany({
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
  } catch (error: any) {
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
router.post('/saved-templates', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { templateId, customizations, notes } = req.body;

    const saved = await prisma.builderIQSavedTemplate.upsert({
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
  } catch (error: any) {
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
router.get('/saved-templates', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const saved = await prisma.builderIQSavedTemplate.findMany({
      where: { userId },
      include: { template: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
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
router.delete('/saved-templates/:templateId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { templateId } = req.params;

    await prisma.builderIQSavedTemplate.deleteMany({
      where: { userId, templateId },
    });

    res.json({
      success: true,
      message: 'Template removed from saved',
    });
  } catch (error: any) {
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
router.get('/shared/:shareCode', async (req: Request, res: Response) => {
  try {
    const { shareCode } = req.params;

    const session = await prisma.builderIQSession.findUnique({
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
  } catch (error: any) {
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
router.put('/sessions/:id/share', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { isShared } = req.body;

    const session = await prisma.builderIQSession.updateMany({
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
    const updated = await prisma.builderIQSession.findUnique({
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
  } catch (error: any) {
    console.error('Error updating share status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update share status',
      error: error.message,
    });
  }
});

export default router;
