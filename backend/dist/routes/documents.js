"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = require("../config/database");
const costs_1 = require("../config/costs");
const costTracking_1 = require("../middleware/costTracking");
const supabase_1 = require("../lib/supabase");
const documentService_1 = require("../services/documentService");
const ragService_1 = require("../services/ragService");
const router = express_1.default.Router();
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = ['pdf', 'txt', 'md', 'markdown', 'docx'];
// ============================================
// POST /api/documents/upload
// Upload a document (base64 JSON body)
// ============================================
router.post('/upload', auth_1.authenticate, async (req, res) => {
    const authReq = req;
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
        const tokenCost = (0, costs_1.getTokenCost)('document', 'upload-process');
        const deducted = await (0, costTracking_1.deductTokens)(userId, tokenCost);
        if (!deducted) {
            return res.status(402).json({ success: false, error: 'Insufficient tokens' });
        }
        // Upload to Supabase Storage
        let filePath = null;
        if (supabase_1.supabase) {
            const date = new Date().toISOString().split('T')[0];
            const storagePath = `${userId}/${date}/${Date.now()}-${fileName}`;
            const mimeMap = {
                pdf: 'application/pdf',
                txt: 'text/plain',
                md: 'text/markdown',
                markdown: 'text/markdown',
                docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            };
            const { error: uploadError } = await supabase_1.supabase.storage
                .from(supabase_1.DOCUMENT_UPLOADS_BUCKET)
                .upload(storagePath, buffer, {
                contentType: mimeMap[normalizedType] || 'application/octet-stream',
                upsert: false,
            });
            if (uploadError) {
                console.error('Document storage upload failed:', uploadError.message);
            }
            else {
                filePath = storagePath;
            }
        }
        // Create document record
        const document = await database_1.prisma.document.create({
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
    }
    catch (error) {
        console.error('Document upload error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to upload document' });
    }
});
// Async document processing (runs after response is sent)
async function processDocumentAsync(documentId, buffer, fileType) {
    try {
        // 1. Parse document text
        console.log(`Processing document ${documentId}...`);
        const text = await (0, documentService_1.parseDocument)(buffer, fileType);
        if (!text || text.trim().length === 0) {
            throw new Error('No text content could be extracted from the document');
        }
        // 2. Chunk the text
        const chunks = (0, documentService_1.chunkText)(text);
        if (chunks.length === 0) {
            throw new Error('Document produced no text chunks');
        }
        // 3. Generate embeddings
        const chunkTexts = chunks.map((c) => c.content);
        const embeddings = await (0, documentService_1.generateEmbeddings)(chunkTexts);
        // 4. Store chunks with embeddings
        const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
        await database_1.prisma.$transaction([
            ...chunks.map((chunk, i) => database_1.prisma.documentChunk.create({
                data: {
                    documentId,
                    content: chunk.content,
                    chunkIndex: chunk.chunkIndex,
                    tokenCount: chunk.tokenCount,
                    embedding: JSON.stringify(embeddings[i]),
                    heading: chunk.heading,
                    pageNumber: chunk.pageNumber,
                },
            })),
            database_1.prisma.document.update({
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
    }
    catch (error) {
        console.error(`Document processing failed for ${documentId}:`, error.message);
        await database_1.prisma.document.update({
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
router.get('/', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const documents = await database_1.prisma.document.findMany({
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
    }
    catch (error) {
        console.error('List documents error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to list documents' });
    }
});
// ============================================
// GET /api/documents/:id
// Get document details + status
// ============================================
router.get('/:id', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const document = await database_1.prisma.document.findFirst({
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
    }
    catch (error) {
        console.error('Get document error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to get document' });
    }
});
// ============================================
// DELETE /api/documents/:id
// Delete document + chunks + storage
// ============================================
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const document = await database_1.prisma.document.findFirst({
            where: { id: req.params.id, userId },
        });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }
        // Delete from Supabase Storage
        if (document.filePath && supabase_1.supabase) {
            await supabase_1.supabase.storage.from(supabase_1.DOCUMENT_UPLOADS_BUCKET).remove([document.filePath]);
        }
        // Delete all related records in a transaction
        await database_1.prisma.$transaction([
            database_1.prisma.documentChatMessage.deleteMany({
                where: { chat: { documentId: document.id } },
            }),
            database_1.prisma.documentChat.deleteMany({
                where: { documentId: document.id },
            }),
            database_1.prisma.documentChunk.deleteMany({
                where: { documentId: document.id },
            }),
            database_1.prisma.document.delete({
                where: { id: document.id },
            }),
        ]);
        return res.json({ success: true, message: 'Document deleted' });
    }
    catch (error) {
        console.error('Delete document error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to delete document' });
    }
});
// ============================================
// POST /api/documents/:id/chat
// Send chat message (RAG query)
// ============================================
router.post('/:id/chat', auth_1.authenticate, async (req, res) => {
    const authReq = req;
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
        const document = await database_1.prisma.document.findFirst({
            where: { id: req.params.id, userId },
        });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }
        if (document.status !== 'ready') {
            return res.status(400).json({ success: false, error: `Document is not ready (status: ${document.status})` });
        }
        // Deduct chat tokens
        const tokenCost = (0, costs_1.getTokenCost)('document', 'chat-standard');
        const deducted = await (0, costTracking_1.deductTokens)(userId, tokenCost);
        if (!deducted) {
            return res.status(402).json({ success: false, error: 'Insufficient tokens' });
        }
        // Run RAG chat
        const options = { chatId, provider };
        const result = await (0, ragService_1.chat)(req.params.id, userId, message.trim(), options);
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
    }
    catch (error) {
        console.error('Document chat error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to process chat message' });
    }
});
// ============================================
// GET /api/documents/:id/chats
// List chat sessions for a document
// ============================================
router.get('/:id/chats', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        // Verify document ownership
        const document = await database_1.prisma.document.findFirst({
            where: { id: req.params.id, userId },
        });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }
        const chats = await database_1.prisma.documentChat.findMany({
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
    }
    catch (error) {
        console.error('List chats error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to list chats' });
    }
});
// ============================================
// GET /api/documents/:id/chats/:chatId
// Get chat history
// ============================================
router.get('/:id/chats/:chatId', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const chatSession = await database_1.prisma.documentChat.findFirst({
            where: { id: req.params.chatId, documentId: req.params.id, userId },
        });
        if (!chatSession) {
            return res.status(404).json({ success: false, error: 'Chat session not found' });
        }
        const messages = await database_1.prisma.documentChatMessage.findMany({
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
    }
    catch (error) {
        console.error('Get chat history error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to get chat history' });
    }
});
// ============================================
// DELETE /api/documents/:id/chats/:chatId
// Delete chat session
// ============================================
router.delete('/:id/chats/:chatId', auth_1.authenticate, async (req, res) => {
    const authReq = req;
    const userId = authReq.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    try {
        const chatSession = await database_1.prisma.documentChat.findFirst({
            where: { id: req.params.chatId, documentId: req.params.id, userId },
        });
        if (!chatSession) {
            return res.status(404).json({ success: false, error: 'Chat session not found' });
        }
        await database_1.prisma.$transaction([
            database_1.prisma.documentChatMessage.deleteMany({ where: { chatId: chatSession.id } }),
            database_1.prisma.documentChat.delete({ where: { id: chatSession.id } }),
        ]);
        return res.json({ success: true, message: 'Chat session deleted' });
    }
    catch (error) {
        console.error('Delete chat error:', error.message);
        return res.status(500).json({ success: false, error: 'Failed to delete chat session' });
    }
});
exports.default = router;
