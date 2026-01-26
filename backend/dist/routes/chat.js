"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_validator_1 = require("express-validator");
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const database_1 = __importDefault(require("../config/database"));
const apiKeyAuth_1 = require("../middleware/apiKeyAuth");
const router = express_1.default.Router();
// ============================================
// PERMISSIVE CORS FOR WIDGET EMBEDDING
// ============================================
// The chat API must be accessible from ANY website since
// users embed the widget on their own domains.
// This overrides the global CORS for /api/chat routes only.
const widgetCors = (0, cors_1.default)({
    origin: true, // Allow ANY origin
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'X-API-Key',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Content-Length'],
    maxAge: 86400 // Cache preflight for 24 hours
});
// Apply permissive CORS to all chat routes
router.use(widgetCors);
// Handle preflight requests explicitly
router.options('*', widgetCors);
// Initialize AI clients
let openai = null;
let anthropic = null;
const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
    openai = new openai_1.default({ apiKey: openaiKey });
}
const anthropicKey = process.env.ANTHROPIC_API_KEY;
if (anthropicKey && !anthropicKey.includes('REPLACE') && anthropicKey.startsWith('sk-ant-')) {
    anthropic = new sdk_1.default({ apiKey: anthropicKey });
}
/**
 * POST /api/chat
 * Main chat endpoint for widget communication
 *
 * Request body:
 * {
 *   message: string,           // User's message
 *   session_id?: string,       // Client-generated session ID for conversation continuity
 *   context?: object,          // Optional context from embedding site (page URL, user data, etc.)
 *   stream?: boolean           // Whether to stream the response (future feature)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     message: string,         // Assistant's response
 *     conversation_id: string, // Conversation ID for reference
 *     session_id: string,      // Echo back session ID
 *     metadata: {
 *       model: string,
 *       tokens_used: number,
 *       latency_ms: number
 *     }
 *   }
 * }
 */
router.post('/', [
    apiKeyAuth_1.authenticateApiKey,
    (0, apiKeyAuth_1.requirePermission)('chat'),
    (0, express_validator_1.body)('message').notEmpty().trim().isLength({ max: 10000 }),
    (0, express_validator_1.body)('session_id').optional().isString().isLength({ max: 100 }),
    (0, express_validator_1.body)('context').optional().isObject()
], async (req, res) => {
    const startTime = Date.now();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { message, session_id, context } = req.body;
        const agent = req.agent;
        const apiKey = req.apiKey;
        // Generate or use provided session ID
        const sessionId = session_id || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Find or create conversation
        let conversation = await database_1.default.conversation.findFirst({
            where: {
                agentId: agent.id,
                sessionId: sessionId,
                status: 'active'
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 20 // Limit context window
                }
            }
        });
        if (!conversation) {
            conversation = await database_1.default.conversation.create({
                data: {
                    agentId: agent.id,
                    sessionId: sessionId,
                    source: 'widget',
                    sourceUrl: context?.page_url || null,
                    userAgent: req.headers['user-agent'] || null,
                    ipAddress: req.ip || null,
                    context: context ? JSON.stringify(context) : null,
                    status: 'active'
                },
                include: {
                    messages: true
                }
            });
            // Update agent stats
            database_1.default.agent.update({
                where: { id: agent.id },
                data: { totalConversations: { increment: 1 } }
            }).catch(err => console.error('Failed to update agent conversation count:', err));
        }
        // Build conversation history for context
        const conversationHistory = conversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        // Add the new user message
        conversationHistory.push({
            role: 'user',
            content: message
        });
        // Generate AI response
        let assistantMessage = '';
        let tokensUsed = 0;
        try {
            if (agent.provider === 'anthropic' && anthropic) {
                const response = await anthropic.messages.create({
                    model: agent.model,
                    max_tokens: agent.maxTokens,
                    temperature: agent.temperature,
                    system: agent.systemPrompt,
                    messages: conversationHistory.map(msg => ({
                        role: msg.role === 'system' ? 'user' : msg.role,
                        content: msg.content
                    }))
                });
                assistantMessage = response.content[0]?.type === 'text'
                    ? response.content[0].text
                    : 'I apologize, but I could not generate a response.';
                tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
            }
            else if (agent.provider === 'openai' && openai) {
                const response = await openai.chat.completions.create({
                    model: agent.model,
                    max_tokens: agent.maxTokens,
                    temperature: agent.temperature,
                    messages: [
                        { role: 'system', content: agent.systemPrompt },
                        ...conversationHistory
                    ]
                });
                assistantMessage = response.choices[0]?.message?.content ||
                    'I apologize, but I could not generate a response.';
                tokensUsed = response.usage?.total_tokens || 0;
            }
            else {
                // Fallback response when no AI provider is configured
                assistantMessage = generateFallbackResponse(agent.name, message);
            }
        }
        catch (aiError) {
            console.error('AI generation error:', aiError);
            assistantMessage = `I apologize, but I'm experiencing technical difficulties. Please try again in a moment.`;
        }
        const latencyMs = Date.now() - startTime;
        // Save messages to database
        await database_1.default.$transaction([
            // Save user message
            database_1.default.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'user',
                    content: message
                }
            }),
            // Save assistant message
            database_1.default.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'assistant',
                    content: assistantMessage,
                    totalTokens: tokensUsed,
                    latencyMs: latencyMs
                }
            }),
            // Update conversation stats
            database_1.default.conversation.update({
                where: { id: conversation.id },
                data: {
                    messageCount: { increment: 2 },
                    tokenCount: { increment: tokensUsed },
                    lastMessageAt: new Date(),
                    title: conversation.title || message.substring(0, 100)
                }
            }),
            // Update agent stats
            database_1.default.agent.update({
                where: { id: agent.id },
                data: { totalMessages: { increment: 2 } }
            })
        ]);
        // Set CORS headers for widget
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.json({
            success: true,
            data: {
                message: assistantMessage,
                conversation_id: conversation.id,
                session_id: sessionId,
                metadata: {
                    model: agent.model,
                    tokens_used: tokensUsed,
                    latency_ms: latencyMs
                }
            }
        });
    }
    catch (error) {
        console.error('Chat endpoint error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            code: 'SERVER_ERROR'
        });
    }
});
/**
 * GET /api/chat/agent
 * Get agent configuration for widget initialization
 */
router.get('/agent', apiKeyAuth_1.authenticateApiKey, async (req, res) => {
    try {
        const agent = req.agent;
        // Parse suggested queries if present
        let suggestedQueries = [];
        try {
            if (agent.welcomeMessage) {
                // Try to extract any suggested queries from agent config
                const agentFull = await database_1.default.agent.findUnique({
                    where: { id: agent.id },
                    select: { suggestedQueries: true, primaryColor: true, position: true, theme: true }
                });
                if (agentFull?.suggestedQueries) {
                    suggestedQueries = JSON.parse(agentFull.suggestedQueries);
                }
            }
        }
        catch (e) {
            // Ignore parsing errors
        }
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.json({
            success: true,
            data: {
                id: agent.id,
                name: agent.name,
                welcome_message: agent.welcomeMessage || `Hi! I'm ${agent.name}. How can I help you today?`,
                suggested_queries: suggestedQueries,
                voice_enabled: agent.voiceEnabled,
                branding: {
                    primary_color: '#6366f1',
                    position: 'bottom-right',
                    theme: 'light'
                }
            }
        });
    }
    catch (error) {
        console.error('Get agent error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get agent configuration'
        });
    }
});
/**
 * GET /api/chat/history
 * Get conversation history for a session
 */
router.get('/history', [
    apiKeyAuth_1.authenticateApiKey,
    (0, apiKeyAuth_1.requirePermission)('history')
], async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'session_id query parameter required'
            });
        }
        const conversation = await database_1.default.conversation.findFirst({
            where: {
                agentId: req.agent.id,
                sessionId: sessionId
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        role: true,
                        content: true,
                        createdAt: true
                    }
                }
            }
        });
        if (!conversation) {
            return res.json({
                success: true,
                data: {
                    messages: []
                }
            });
        }
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        return res.json({
            success: true,
            data: {
                conversation_id: conversation.id,
                messages: conversation.messages.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.createdAt.toISOString()
                }))
            }
        });
    }
    catch (error) {
        console.error('Get history error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get conversation history'
        });
    }
});
/**
 * POST /api/chat/feedback
 * Submit feedback for a conversation
 */
router.post('/feedback', [
    apiKeyAuth_1.authenticateApiKey,
    (0, apiKeyAuth_1.requirePermission)('feedback'),
    (0, express_validator_1.body)('conversation_id').notEmpty(),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('feedback').optional().isString().isLength({ max: 1000 })
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
        const { conversation_id, rating, feedback } = req.body;
        const conversation = await database_1.default.conversation.findFirst({
            where: {
                id: conversation_id,
                agentId: req.agent.id
            }
        });
        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }
        await database_1.default.conversation.update({
            where: { id: conversation_id },
            data: {
                rating: rating,
                feedback: feedback || null
            }
        });
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        return res.json({
            success: true,
            message: 'Feedback submitted successfully'
        });
    }
    catch (error) {
        console.error('Submit feedback error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to submit feedback'
        });
    }
});
/**
 * OPTIONS handler for CORS preflight
 */
router.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(204);
});
/**
 * Generate a fallback response when no AI provider is configured
 */
function generateFallbackResponse(agentName, userMessage) {
    const lowercaseMessage = userMessage.toLowerCase();
    // Common greeting responses
    if (lowercaseMessage.match(/^(hi|hello|hey|greetings)/)) {
        return `Hello! I'm ${agentName}. I'm currently running in demo mode. How can I assist you today?`;
    }
    // Help request
    if (lowercaseMessage.includes('help')) {
        return `I'd be happy to help! I'm ${agentName}, your AI assistant. While I'm currently in demo mode, I can still provide general guidance. What would you like to know more about?`;
    }
    // Thank you response
    if (lowercaseMessage.includes('thank')) {
        return `You're welcome! Is there anything else I can help you with?`;
    }
    // Default response
    return `Thank you for your message. I'm ${agentName}, and I'm here to assist you. While I'm currently running in demo mode with limited capabilities, I've received your inquiry about: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}". In full mode, I would provide a comprehensive response tailored to your specific needs.`;
}
exports.default = router;
