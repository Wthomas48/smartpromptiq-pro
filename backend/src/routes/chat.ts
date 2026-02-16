import express from 'express';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import prisma from '../config/database';
import { authenticateApiKey, ApiKeyRequest, requirePermission } from '../middleware/apiKeyAuth';
import { embedQuery, cosineSimilarity } from '../services/ragService';

const router = express.Router();

// ============================================
// PERMISSIVE CORS FOR WIDGET EMBEDDING
// ============================================
// The chat API must be accessible from ANY website since
// users embed the widget on their own domains.
// This overrides the global CORS for /api/chat routes only.
const widgetCors = cors({
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
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
  openai = new OpenAI({ apiKey: openaiKey });
}

const anthropicKey = process.env.ANTHROPIC_API_KEY;
if (anthropicKey && !anthropicKey.includes('REPLACE') && anthropicKey.startsWith('sk-ant-')) {
  anthropic = new Anthropic({ apiKey: anthropicKey });
}

let gemini: GenerativeModel | null = null;
const geminiKey = process.env.GOOGLE_API_KEY;
if (geminiKey && !geminiKey.includes('REPLACE') && geminiKey.length > 10) {
  const genAI = new GoogleGenerativeAI(geminiKey);
  gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
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
  authenticateApiKey,
  requirePermission('chat'),
  body('message').notEmpty().trim().isLength({ max: 10000 }),
  body('session_id').optional().isString().isLength({ max: 100 }),
  body('context').optional().isObject()
], async (req: ApiKeyRequest, res: any) => {
  const startTime = Date.now();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, session_id, context } = req.body;
    const agent = req.agent!;
    const apiKey = req.apiKey!;

    // Generate or use provided session ID
    const sessionId = session_id || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
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
      conversation = await prisma.conversation.create({
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
      prisma.agent.update({
        where: { id: agent.id },
        data: { totalConversations: { increment: 1 } }
      }).catch(err => console.error('Failed to update agent conversation count:', err));
    }

    // Build conversation history for context
    const conversationHistory: ChatMessage[] = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // ── Knowledge Base RAG Context ──────────────────────────────
    // If the agent has attached documents, retrieve relevant chunks
    // and inject them into the system prompt.
    let systemPrompt = agent.systemPrompt;

    try {
      const agentDocs = await prisma.agentDocument.findMany({
        where: { agentId: agent.id },
        include: {
          document: {
            select: { id: true, status: true },
          },
        },
      });

      const readyDocIds = agentDocs
        .filter((ad) => ad.document.status === 'ready')
        .map((ad) => ad.documentId);

      if (readyDocIds.length > 0 && openai) {
        // Embed user question and search across all attached docs
        const queryEmbedding = await embedQuery(message);

        const allChunks = await prisma.documentChunk.findMany({
          where: { documentId: { in: readyDocIds } },
          select: { content: true, chunkIndex: true, heading: true, embedding: true },
        });

        const scored = allChunks
          .map((chunk) => {
            const emb: number[] = JSON.parse(chunk.embedding);
            return { ...chunk, similarity: cosineSimilarity(queryEmbedding, emb) };
          })
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5);

        if (scored.length > 0 && scored[0].similarity > 0.3) {
          const contextBlocks = scored
            .map((c, i) => {
              const header = c.heading ? ` (${c.heading})` : '';
              return `[${i + 1}]${header}\n${c.content}`;
            })
            .join('\n\n---\n\n');

          systemPrompt += `\n\n## Knowledge Base Context\nThe following excerpts from uploaded documents may help answer the user's question. Use them when relevant and cite sources with [1], [2], etc. If the answer is not in the excerpts, use your general knowledge.\n\n${contextBlocks}`;
        }
      }
    } catch (ragError) {
      console.error('RAG context retrieval error (non-fatal):', ragError);
      // Continue without RAG context — not a fatal error
    }

    // Generate AI response
    let assistantMessage = '';
    let tokensUsed = 0;

    try {
      if (agent.provider === 'anthropic' && anthropic) {
        const response = await anthropic.messages.create({
          model: agent.model,
          max_tokens: agent.maxTokens,
          temperature: agent.temperature,
          system: systemPrompt,
          messages: conversationHistory.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            content: msg.content
          }))
        });

        assistantMessage = response.content[0]?.type === 'text'
          ? response.content[0].text
          : 'I apologize, but I could not generate a response.';
        tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
      } else if (agent.provider === 'openai' && openai) {
        const response = await openai.chat.completions.create({
          model: agent.model,
          max_tokens: agent.maxTokens,
          temperature: agent.temperature,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ]
        });

        assistantMessage = response.choices[0]?.message?.content ||
          'I apologize, but I could not generate a response.';
        tokensUsed = response.usage?.total_tokens || 0;
      } else if (agent.provider === 'gemini' && gemini) {
        const result = await gemini.generateContent({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}` }] },
          ],
          generationConfig: {
            maxOutputTokens: agent.maxTokens,
            temperature: agent.temperature,
          },
        });
        const resp = result.response;
        assistantMessage = resp.text() || 'I apologize, but I could not generate a response.';
        tokensUsed = resp.usageMetadata?.totalTokenCount || 0;
      } else {
        // Fallback response when no AI provider is configured
        assistantMessage = generateFallbackResponse(agent.name, message);
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      assistantMessage = `I apologize, but I'm experiencing technical difficulties. Please try again in a moment.`;
    }

    const latencyMs = Date.now() - startTime;

    // Save messages to database
    await prisma.$transaction([
      // Save user message
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message
        }
      }),
      // Save assistant message
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: assistantMessage,
          totalTokens: tokensUsed,
          latencyMs: latencyMs
        }
      }),
      // Update conversation stats
      prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messageCount: { increment: 2 },
          tokenCount: { increment: tokensUsed },
          lastMessageAt: new Date(),
          title: conversation.title || message.substring(0, 100)
        }
      }),
      // Update agent stats
      prisma.agent.update({
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

  } catch (error) {
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
router.get('/agent', authenticateApiKey, async (req: ApiKeyRequest, res: any) => {
  try {
    const agent = req.agent!;

    // Parse suggested queries if present
    let suggestedQueries: string[] = [];
    try {
      if (agent.welcomeMessage) {
        // Try to extract any suggested queries from agent config
        const agentFull = await prisma.agent.findUnique({
          where: { id: agent.id },
          select: { suggestedQueries: true, primaryColor: true, position: true, theme: true }
        });
        if (agentFull?.suggestedQueries) {
          suggestedQueries = JSON.parse(agentFull.suggestedQueries);
        }
      }
    } catch (e) {
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
  } catch (error) {
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
  authenticateApiKey,
  requirePermission('history')
], async (req: ApiKeyRequest, res: any) => {
  try {
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'session_id query parameter required'
      });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        agentId: req.agent!.id,
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
  } catch (error) {
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
  authenticateApiKey,
  requirePermission('feedback'),
  body('conversation_id').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().isString().isLength({ max: 1000 })
], async (req: ApiKeyRequest, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { conversation_id, rating, feedback } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversation_id,
        agentId: req.agent!.id
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    await prisma.conversation.update({
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
  } catch (error) {
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
function generateFallbackResponse(agentName: string, userMessage: string): string {
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

export default router;
