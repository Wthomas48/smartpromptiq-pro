"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const apiKeyAuth_1 = require("../middleware/apiKeyAuth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
/**
 * GET /api/agents
 * List all agents owned by the authenticated user
 */
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const agents = await database_1.default.agent.findMany({
            where: { userId: req.user.id },
            include: {
                _count: {
                    select: {
                        conversations: true,
                        apiKeys: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({
            success: true,
            data: agents.map(agent => ({
                id: agent.id,
                name: agent.name,
                slug: agent.slug,
                description: agent.description,
                provider: agent.provider,
                model: agent.model,
                isActive: agent.isActive,
                isPublic: agent.isPublic,
                totalConversations: agent.totalConversations,
                totalMessages: agent.totalMessages,
                apiKeyCount: agent._count.apiKeys,
                createdAt: agent.createdAt,
                updatedAt: agent.updatedAt
            }))
        });
    }
    catch (error) {
        console.error('List agents error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to list agents'
        });
    }
});
/**
 * GET /api/agents/:id
 * Get a specific agent by ID
 */
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                apiKeys: {
                    select: {
                        id: true,
                        name: true,
                        keyPrefix: true,
                        isActive: true,
                        lastUsedAt: true,
                        usageCount: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }
        return res.json({
            success: true,
            data: agent
        });
    }
    catch (error) {
        console.error('Get agent error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get agent'
        });
    }
});
/**
 * POST /api/agents
 * Create a new agent
 */
router.post('/', [
    auth_1.authenticate,
    (0, express_validator_1.body)('name').notEmpty().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('slug').notEmpty().trim().isLength({ min: 2, max: 50 })
        .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase alphanumeric with hyphens'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('systemPrompt').notEmpty().trim().isLength({ min: 10, max: 10000 }),
    (0, express_validator_1.body)('provider').optional().isIn(['anthropic', 'openai']),
    (0, express_validator_1.body)('model').optional().isString(),
    (0, express_validator_1.body)('temperature').optional().isFloat({ min: 0, max: 2 }),
    (0, express_validator_1.body)('maxTokens').optional().isInt({ min: 100, max: 8000 }),
    (0, express_validator_1.body)('welcomeMessage').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('suggestedQueries').optional().isArray()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { name, slug, description, systemPrompt, provider = 'anthropic', model = 'claude-3-haiku-20240307', temperature = 0.7, maxTokens = 1024, welcomeMessage, suggestedQueries, primaryColor, position, theme, voiceEnabled = false } = req.body;
        // Check if slug is already taken
        const existingAgent = await database_1.default.agent.findUnique({
            where: { slug }
        });
        if (existingAgent) {
            return res.status(400).json({
                success: false,
                error: 'An agent with this slug already exists'
            });
        }
        // Create the agent
        const agent = await database_1.default.agent.create({
            data: {
                userId: req.user.id,
                name,
                slug,
                description,
                systemPrompt,
                provider,
                model,
                temperature,
                maxTokens,
                welcomeMessage,
                suggestedQueries: suggestedQueries ? JSON.stringify(suggestedQueries) : null,
                primaryColor: primaryColor || '#6366f1',
                position: position || 'bottom-right',
                theme: theme || 'light',
                voiceEnabled,
                isActive: true,
                isPublic: false
            }
        });
        // Generate an initial API key for the agent
        const { key, prefix, hash } = (0, apiKeyAuth_1.generateApiKey)();
        await database_1.default.apiKey.create({
            data: {
                userId: req.user.id,
                agentId: agent.id,
                name: 'Default API Key',
                keyPrefix: prefix,
                keyHash: hash,
                permissions: JSON.stringify(['chat', 'history', 'feedback']),
                rateLimitPerMinute: 60,
                rateLimitPerDay: 10000,
                isActive: true
            }
        });
        return res.status(201).json({
            success: true,
            data: {
                agent,
                apiKey: key // Return the raw key only on creation (never stored)
            },
            message: 'Agent created successfully. Save your API key - it will not be shown again.'
        });
    }
    catch (error) {
        console.error('Create agent error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create agent'
        });
    }
});
/**
 * PATCH /api/agents/:id
 * Update an existing agent
 */
router.patch('/:id', [
    auth_1.authenticate,
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('systemPrompt').optional().trim().isLength({ min: 10, max: 10000 }),
    (0, express_validator_1.body)('provider').optional().isIn(['anthropic', 'openai']),
    (0, express_validator_1.body)('model').optional().isString(),
    (0, express_validator_1.body)('temperature').optional().isFloat({ min: 0, max: 2 }),
    (0, express_validator_1.body)('maxTokens').optional().isInt({ min: 100, max: 8000 }),
    (0, express_validator_1.body)('welcomeMessage').optional().trim().isLength({ max: 500 }),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('isPublic').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        // Check ownership
        const existingAgent = await database_1.default.agent.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }
        // Build update data
        const updateData = {};
        const allowedFields = [
            'name', 'description', 'systemPrompt', 'provider', 'model',
            'temperature', 'maxTokens', 'welcomeMessage', 'primaryColor',
            'position', 'theme', 'voiceEnabled', 'isActive', 'isPublic',
            'dailyMessageLimit', 'monthlyMessageLimit', 'allowedDomains'
        ];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (field === 'suggestedQueries' || field === 'allowedDomains') {
                    updateData[field] = JSON.stringify(req.body[field]);
                }
                else {
                    updateData[field] = req.body[field];
                }
            }
        }
        const agent = await database_1.default.agent.update({
            where: { id: req.params.id },
            data: updateData
        });
        return res.json({
            success: true,
            data: agent
        });
    }
    catch (error) {
        console.error('Update agent error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update agent'
        });
    }
});
/**
 * DELETE /api/agents/:id
 * Delete an agent
 */
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }
        // Delete agent (cascades to API keys and conversations)
        await database_1.default.agent.delete({
            where: { id: req.params.id }
        });
        return res.json({
            success: true,
            message: 'Agent deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete agent error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete agent'
        });
    }
});
/**
 * POST /api/agents/:id/api-keys
 * Generate a new API key for an agent
 */
router.post('/:id/api-keys', [
    auth_1.authenticate,
    (0, express_validator_1.body)('name').notEmpty().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('permissions').optional().isArray(),
    (0, express_validator_1.body)('allowedOrigins').optional().isArray(),
    (0, express_validator_1.body)('rateLimitPerMinute').optional().isInt({ min: 1, max: 1000 }),
    (0, express_validator_1.body)('rateLimitPerDay').optional().isInt({ min: 1, max: 1000000 })
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        // Check agent ownership
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }
        const { name, permissions = ['chat'], allowedOrigins, rateLimitPerMinute = 60, rateLimitPerDay = 10000 } = req.body;
        // Generate new API key
        const { key, prefix, hash } = (0, apiKeyAuth_1.generateApiKey)();
        const apiKey = await database_1.default.apiKey.create({
            data: {
                userId: req.user.id,
                agentId: agent.id,
                name,
                keyPrefix: prefix,
                keyHash: hash,
                permissions: JSON.stringify(permissions),
                allowedOrigins: allowedOrigins ? JSON.stringify(allowedOrigins) : null,
                rateLimitPerMinute,
                rateLimitPerDay,
                isActive: true
            }
        });
        return res.status(201).json({
            success: true,
            data: {
                id: apiKey.id,
                name: apiKey.name,
                prefix: prefix,
                apiKey: key, // Raw key - only shown once
                permissions,
                allowedOrigins,
                rateLimitPerMinute,
                rateLimitPerDay
            },
            message: 'API key created. Save it now - it will not be shown again.'
        });
    }
    catch (error) {
        console.error('Create API key error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create API key'
        });
    }
});
/**
 * DELETE /api/agents/:id/api-keys/:keyId
 * Revoke an API key
 */
router.delete('/:id/api-keys/:keyId', auth_1.authenticate, async (req, res) => {
    try {
        const apiKey = await database_1.default.apiKey.findFirst({
            where: {
                id: req.params.keyId,
                agentId: req.params.id,
                userId: req.user.id
            }
        });
        if (!apiKey) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }
        await database_1.default.apiKey.delete({
            where: { id: req.params.keyId }
        });
        return res.json({
            success: true,
            message: 'API key revoked successfully'
        });
    }
    catch (error) {
        console.error('Revoke API key error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to revoke API key'
        });
    }
});
/**
 * GET /api/agents/:id/conversations
 * Get conversations for an agent
 */
router.get('/:id/conversations', auth_1.authenticate, async (req, res) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;
        const [conversations, total] = await Promise.all([
            database_1.default.conversation.findMany({
                where: { agentId: req.params.id },
                include: {
                    _count: {
                        select: { messages: true }
                    }
                },
                orderBy: { lastMessageAt: 'desc' },
                skip,
                take: limit
            }),
            database_1.default.conversation.count({
                where: { agentId: req.params.id }
            })
        ]);
        return res.json({
            success: true,
            data: {
                conversations: conversations.map(c => ({
                    id: c.id,
                    sessionId: c.sessionId,
                    title: c.title,
                    source: c.source,
                    sourceUrl: c.sourceUrl,
                    status: c.status,
                    rating: c.rating,
                    messageCount: c._count.messages,
                    tokenCount: c.tokenCount,
                    createdAt: c.createdAt,
                    lastMessageAt: c.lastMessageAt
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Get conversations error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get conversations'
        });
    }
});
/**
 * GET /api/agents/:id/analytics
 * Get analytics for an agent
 */
router.get('/:id/analytics', auth_1.authenticate, async (req, res) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }
        // Get date range (default last 30 days)
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Aggregate stats
        const [totalConversations, totalMessages, averageRating, conversationsByDay] = await Promise.all([
            database_1.default.conversation.count({
                where: {
                    agentId: req.params.id,
                    createdAt: { gte: startDate }
                }
            }),
            database_1.default.message.count({
                where: {
                    conversation: {
                        agentId: req.params.id,
                        createdAt: { gte: startDate }
                    }
                }
            }),
            database_1.default.conversation.aggregate({
                where: {
                    agentId: req.params.id,
                    rating: { not: null }
                },
                _avg: { rating: true }
            }),
            database_1.default.conversation.groupBy({
                by: ['createdAt'],
                where: {
                    agentId: req.params.id,
                    createdAt: { gte: startDate }
                },
                _count: true,
                orderBy: { createdAt: 'asc' }
            })
        ]);
        return res.json({
            success: true,
            data: {
                period: { days, startDate, endDate: new Date() },
                totalConversations,
                totalMessages,
                averageRating: averageRating._avg.rating || 0,
                lifetimeStats: {
                    totalConversations: agent.totalConversations,
                    totalMessages: agent.totalMessages,
                    averageRating: agent.averageRating
                }
            }
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get analytics'
        });
    }
});
/**
 * GET /api/agents/:id/embed-code
 * Get the embed code snippet for an agent
 */
router.get('/:id/embed-code', auth_1.authenticate, async (req, res) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: {
                apiKeys: {
                    where: { isActive: true },
                    take: 1,
                    select: { keyPrefix: true }
                }
            }
        });
        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }
        const baseUrl = process.env.FRONTEND_URL || 'https://smartpromptiq.com';
        const apiKeyPlaceholder = agent.apiKeys[0]?.keyPrefix
            ? `${agent.apiKeys[0].keyPrefix}_YOUR_SECRET_HERE`
            : 'YOUR_API_KEY_HERE';
        const embedCode = `<!-- SmartPromptIQ Chat Widget -->
<script
  src="${baseUrl}/widget.js"
  data-api-key="${apiKeyPlaceholder}"
  data-agent="${agent.slug}"
  data-theme="${agent.theme}"
  data-position="${agent.position}"
  data-primary-color="${agent.primaryColor}"
  data-voice-enabled="${agent.voiceEnabled}"
></script>`;
        return res.json({
            success: true,
            data: {
                embedCode,
                instructions: [
                    '1. Copy the embed code above',
                    '2. Replace YOUR_API_KEY_HERE with your actual API key',
                    '3. Paste the code before the closing </body> tag of your website',
                    '4. The chat widget will appear automatically'
                ]
            }
        });
    }
    catch (error) {
        console.error('Get embed code error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate embed code'
        });
    }
});
// ============================================
// KNOWLEDGE BASE — Agent Document Management
// ============================================
/**
 * GET /api/agents/:id/documents
 * List documents attached to an agent
 */
router.get('/:id/documents', auth_1.authenticate, async (req, res) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        const agentDocs = await database_1.default.agentDocument.findMany({
            where: { agentId: agent.id },
            include: {
                document: {
                    select: {
                        id: true,
                        title: true,
                        fileName: true,
                        fileType: true,
                        fileSize: true,
                        status: true,
                        chunkCount: true,
                        totalTokens: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({
            success: true,
            data: agentDocs.map((ad) => ({
                id: ad.id,
                attachedAt: ad.createdAt,
                ...ad.document,
            })),
        });
    }
    catch (error) {
        console.error('List agent documents error:', error);
        return res.status(500).json({ success: false, error: 'Failed to list agent documents' });
    }
});
/**
 * POST /api/agents/:id/documents
 * Attach a document to an agent's knowledge base
 */
router.post('/:id/documents', [
    auth_1.authenticate,
    (0, express_validator_1.body)('documentId').notEmpty().withMessage('documentId is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
        }
        const agent = await database_1.default.agent.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        // Verify document belongs to user and is ready
        const document = await database_1.default.document.findFirst({
            where: { id: req.body.documentId, userId: req.user.id },
        });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }
        if (document.status !== 'ready') {
            return res.status(400).json({ success: false, error: 'Document is not ready yet' });
        }
        // Create link (upsert to handle duplicates gracefully)
        const agentDoc = await database_1.default.agentDocument.upsert({
            where: {
                agentId_documentId: {
                    agentId: agent.id,
                    documentId: document.id,
                },
            },
            update: {},
            create: {
                agentId: agent.id,
                documentId: document.id,
            },
        });
        return res.json({
            success: true,
            data: {
                id: agentDoc.id,
                agentId: agentDoc.agentId,
                documentId: agentDoc.documentId,
                attachedAt: agentDoc.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Attach document error:', error);
        return res.status(500).json({ success: false, error: 'Failed to attach document' });
    }
});
/**
 * DELETE /api/agents/:id/documents/:docId
 * Detach a document from an agent's knowledge base
 */
router.delete('/:id/documents/:docId', auth_1.authenticate, async (req, res) => {
    try {
        const agent = await database_1.default.agent.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        await database_1.default.agentDocument.deleteMany({
            where: {
                agentId: agent.id,
                documentId: req.params.docId,
            },
        });
        return res.json({ success: true, message: 'Document detached from agent' });
    }
    catch (error) {
        console.error('Detach document error:', error);
        return res.status(500).json({ success: false, error: 'Failed to detach document' });
    }
});
exports.default = router;
