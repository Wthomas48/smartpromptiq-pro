import express, { Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { getTokenCost } from '../config/costs';
import { deductTokens } from '../middleware/costTracking';
import { supabase, DOCUMENT_UPLOADS_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from '../lib/supabase';
import { parseDocument, chunkText, generateEmbeddings } from '../services/documentService';
import { chat as ragChat, ChatOptions } from '../services/ragService';

const router = express.Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = ['pdf', 'txt', 'md', 'markdown', 'docx'];

// ============================================
// POST /api/documents/upload
// Upload a document (base64 JSON body)
// ============================================

router.post('/upload', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const { fileName, fileType, fileData, title } = req.body;

    // Validate inputs
    if (!fileName || !fileType || !fileData) {
      return res.status(400).json({ success: false, error: 'fileName, fileType, and fileData (base64) are required' });
    }

    const normalizedType = fileType.toLowerCase().replace('.', '');
    if (!ALLOWED_FILE_TYPES.includes(normalizedType)) {
      return res.status(400).json({ success: false, error: `Unsupported file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}` });
    }

    // Decode base64
    const buffer = Buffer.from(fileData, 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ success: false, error: 'File exceeds 10 MB limit' });
    }

    // Deduct upload tokens
    const tokenCost = getTokenCost('document' as any, 'upload-process');
    const deducted = await deductTokens(userId, tokenCost);
    if (!deducted) {
      return res.status(402).json({ success: false, error: 'Insufficient tokens' });
    }

    // Upload to Supabase Storage
    let filePath: string | null = null;
    if (supabase) {
      const date = new Date().toISOString().split('T')[0];
      const storagePath = `${userId}/${date}/${Date.now()}-${fileName}`;
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf',
        txt: 'text/plain',
        md: 'text/markdown',
        markdown: 'text/markdown',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      const { error: uploadError } = await supabase.storage
        .from(DOCUMENT_UPLOADS_BUCKET)
        .upload(storagePath, buffer, {
          contentType: mimeMap[normalizedType] || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error('Document storage upload failed:', uploadError.message);
      } else {
        filePath = storagePath;
      }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        userId,
        title: title || fileName,
        fileName,
        fileType: normalizedType,
        fileSize: buffer.length,
        mimeType: `application/${normalizedType}`,
        filePath,
        status: 'processing',
      },
    });

    // Fire-and-forget async processing
    processDocumentAsync(document.id, buffer, normalizedType);

    return res.status(201).json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt,
      },
      tokensUsed: tokenCost,
    });
  } catch (error: any) {
    console.error('Document upload error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to upload document' });
  }
});

// Async document processing (runs after response is sent)
async function processDocumentAsync(documentId: string, buffer: Buffer, fileType: string) {
  try {
    // 1. Parse document text
    console.log(`Processing document ${documentId}...`);
    const text = await parseDocument(buffer, fileType);

    if (!text || text.trim().length === 0) {
      throw new Error('No text content could be extracted from the document');
    }

    // 2. Chunk the text
    const chunks = chunkText(text);
    if (chunks.length === 0) {
      throw new Error('Document produced no text chunks');
    }

    // 3. Generate embeddings
    const chunkTexts = chunks.map((c) => c.content);
    const embeddings = await generateEmbeddings(chunkTexts);

    // 4. Store chunks with embeddings
    const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);

    await prisma.$transaction([
      ...chunks.map((chunk, i) =>
        prisma.documentChunk.create({
          data: {
            documentId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            tokenCount: chunk.tokenCount,
            embedding: JSON.stringify(embeddings[i]),
            heading: chunk.heading,
            pageNumber: chunk.pageNumber,
          },
        })
      ),
      prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'ready',
          textContent: text.substring(0, 50000),
          chunkCount: chunks.length,
          totalTokens,
        },
      }),
    ]);

    console.log(`Document ${documentId} ready: ${chunks.length} chunks, ${totalTokens} tokens`);
  } catch (error: any) {
    console.error(`Document processing failed for ${documentId}:`, error.message);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'failed',
        errorMessage: error.message || 'Processing failed',
      },
    });
  }
}

// ============================================
// GET /api/documents
// List user's documents
// ============================================

router.get('/', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        chunkCount: true,
        totalTokens: true,
        chatCount: true,
        lastChatAt: true,
        createdAt: true,
        updatedAt: true,
        errorMessage: true,
      },
    });

    return res.json({ success: true, documents });
  } catch (error: any) {
    console.error('List documents error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to list documents' });
  }
});

// ============================================
// GET /api/documents/:id
// Get document details + status
// ============================================

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId },
      select: {
        id: true,
        title: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        chunkCount: true,
        totalTokens: true,
        chatCount: true,
        lastChatAt: true,
        createdAt: true,
        updatedAt: true,
        errorMessage: true,
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    return res.json({ success: true, document });
  } catch (error: any) {
    console.error('Get document error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to get document' });
  }
});

// ============================================
// DELETE /api/documents/:id
// Delete document + chunks + storage
// ============================================

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Delete from Supabase Storage
    if (document.filePath && supabase) {
      await supabase.storage.from(DOCUMENT_UPLOADS_BUCKET).remove([document.filePath]);
    }

    // Delete all related records in a transaction
    await prisma.$transaction([
      prisma.documentChatMessage.deleteMany({
        where: { chat: { documentId: document.id } },
      }),
      prisma.documentChat.deleteMany({
        where: { documentId: document.id },
      }),
      prisma.documentChunk.deleteMany({
        where: { documentId: document.id },
      }),
      prisma.document.delete({
        where: { id: document.id },
      }),
    ]);

    return res.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    console.error('Delete document error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to delete document' });
  }
});

// ============================================
// POST /api/documents/:id/chat
// Send chat message (RAG query)
// ============================================

router.post('/:id/chat', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const { message, chatId, provider } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Verify document belongs to user and is ready
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    if (document.status !== 'ready') {
      return res.status(400).json({ success: false, error: `Document is not ready (status: ${document.status})` });
    }

    // Deduct chat tokens
    const tokenCost = getTokenCost('document' as any, 'chat-standard');
    const deducted = await deductTokens(userId, tokenCost);
    if (!deducted) {
      return res.status(402).json({ success: false, error: 'Insufficient tokens' });
    }

    // Run RAG chat
    const options: ChatOptions = { chatId, provider };
    const result = await ragChat(req.params.id, userId, message.trim(), options);

    return res.json({
      success: true,
      chatId: result.chatId,
      messageId: result.messageId,
      answer: result.answer,
      provider: result.provider,
      model: result.model,
      chunksUsed: result.chunksUsed,
      usage: result.usage,
      tokensUsed: tokenCost,
    });
  } catch (error: any) {
    console.error('Document chat error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to process chat message' });
  }
});

// ============================================
// GET /api/documents/:id/chats
// List chat sessions for a document
// ============================================

router.get('/:id/chats', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    const chats = await prisma.documentChat.findMany({
      where: { documentId: req.params.id, userId },
      orderBy: { lastMessageAt: 'desc' },
      select: {
        id: true,
        title: true,
        provider: true,
        model: true,
        messageCount: true,
        tokenCount: true,
        createdAt: true,
        lastMessageAt: true,
      },
    });

    return res.json({ success: true, chats });
  } catch (error: any) {
    console.error('List chats error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to list chats' });
  }
});

// ============================================
// GET /api/documents/:id/chats/:chatId
// Get chat history
// ============================================

router.get('/:id/chats/:chatId', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const chatSession = await prisma.documentChat.findFirst({
      where: { id: req.params.chatId, documentId: req.params.id, userId },
    });

    if (!chatSession) {
      return res.status(404).json({ success: false, error: 'Chat session not found' });
    }

    const messages = await prisma.documentChatMessage.findMany({
      where: { chatId: req.params.chatId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        chunksUsed: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      chat: {
        id: chatSession.id,
        title: chatSession.title,
        provider: chatSession.provider,
        model: chatSession.model,
        messageCount: chatSession.messageCount,
        createdAt: chatSession.createdAt,
      },
      messages: messages.map((m) => ({
        ...m,
        chunksUsed: m.chunksUsed ? JSON.parse(m.chunksUsed) : null,
      })),
    });
  } catch (error: any) {
    console.error('Get chat history error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to get chat history' });
  }
});

// ============================================
// DELETE /api/documents/:id/chats/:chatId
// Delete chat session
// ============================================

router.delete('/:id/chats/:chatId', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const chatSession = await prisma.documentChat.findFirst({
      where: { id: req.params.chatId, documentId: req.params.id, userId },
    });

    if (!chatSession) {
      return res.status(404).json({ success: false, error: 'Chat session not found' });
    }

    await prisma.$transaction([
      prisma.documentChatMessage.deleteMany({ where: { chatId: chatSession.id } }),
      prisma.documentChat.delete({ where: { id: chatSession.id } }),
    ]);

    return res.json({ success: true, message: 'Chat session deleted' });
  } catch (error: any) {
    console.error('Delete chat error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to delete chat session' });
  }
});

export default router;
