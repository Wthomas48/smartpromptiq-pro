"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocument = parseDocument;
exports.chunkText = chunkText;
exports.generateEmbeddings = generateEmbeddings;
exports.processDocument = processDocument;
const openai_1 = __importDefault(require("openai"));
const database_1 = require("../config/database");
// ============================================
// DOCUMENT PROCESSING SERVICE
// ============================================
const openaiKey = process.env.OPENAI_API_KEY;
let openai = null;
if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
    openai = new openai_1.default({ apiKey: openaiKey });
}
const MAX_CHUNKS = 50;
const CHARS_PER_TOKEN = 4;
const MAX_CHUNK_TOKENS = 500;
const OVERLAP_TOKENS = 100;
// ============================================
// TEXT EXTRACTION
// ============================================
async function parseDocument(buffer, fileType) {
    switch (fileType.toLowerCase()) {
        case 'pdf': {
            const pdfParse = require('pdf-parse');
            const data = await pdfParse(buffer);
            return data.text || '';
        }
        case 'docx': {
            const mammoth = await Promise.resolve().then(() => __importStar(require('mammoth')));
            const result = await mammoth.extractRawText({ buffer });
            return result.value || '';
        }
        case 'txt':
        case 'md':
        case 'markdown':
            return buffer.toString('utf-8');
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}
function chunkText(text, maxChunkTokens = MAX_CHUNK_TOKENS, overlapTokens = OVERLAP_TOKENS) {
    const maxChunkChars = maxChunkTokens * CHARS_PER_TOKEN;
    const overlapChars = overlapTokens * CHARS_PER_TOKEN;
    // Split by double-newline (paragraph boundaries)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks = [];
    let currentChunk = '';
    let chunkIndex = 0;
    let currentHeading;
    for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        // Detect headings (lines starting with # or short ALL-CAPS lines)
        if (/^#{1,6}\s/.test(trimmed) || (trimmed.length < 100 && trimmed === trimmed.toUpperCase() && trimmed.length > 3)) {
            currentHeading = trimmed.replace(/^#+\s*/, '').substring(0, 200);
        }
        if ((currentChunk.length + trimmed.length) > maxChunkChars && currentChunk.length > 0) {
            chunks.push({
                content: currentChunk.trim(),
                chunkIndex: chunkIndex++,
                tokenCount: Math.ceil(currentChunk.length / CHARS_PER_TOKEN),
                heading: currentHeading,
            });
            // Keep overlap from end of current chunk
            const overlapText = currentChunk.slice(-overlapChars);
            currentChunk = overlapText + '\n\n' + trimmed;
        }
        else {
            currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
        }
    }
    // Add remaining text
    if (currentChunk.trim()) {
        chunks.push({
            content: currentChunk.trim(),
            chunkIndex: chunkIndex,
            tokenCount: Math.ceil(currentChunk.length / CHARS_PER_TOKEN),
            heading: currentHeading,
        });
    }
    return chunks.slice(0, MAX_CHUNKS);
}
// ============================================
// EMBEDDING GENERATION
// ============================================
async function generateEmbeddings(texts) {
    if (!openai) {
        throw new Error('OpenAI not configured — embeddings unavailable');
    }
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
    });
    return response.data.map(d => d.embedding);
}
// ============================================
// DOCUMENT PROCESSING ORCHESTRATOR
// ============================================
async function processDocument(documentId, buffer, fileType) {
    try {
        // Update status to processing
        await database_1.prisma.document.update({
            where: { id: documentId },
            data: { status: 'processing' },
        });
        // 1. Parse document text
        console.log(`📄 Parsing ${fileType} document ${documentId}...`);
        const text = await parseDocument(buffer, fileType);
        if (!text || text.trim().length === 0) {
            throw new Error('No text content could be extracted from the document');
        }
        // 2. Chunk the text
        console.log(`✂️ Chunking text (${text.length} chars)...`);
        const chunks = chunkText(text);
        if (chunks.length === 0) {
            throw new Error('Document produced no text chunks');
        }
        // 3. Generate embeddings
        console.log(`🧠 Generating embeddings for ${chunks.length} chunks...`);
        const chunkTexts = chunks.map(c => c.content);
        const embeddings = await generateEmbeddings(chunkTexts);
        // 4. Store chunks with embeddings
        console.log(`💾 Storing ${chunks.length} chunks...`);
        const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);
        await database_1.prisma.$transaction([
            // Create all chunks
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
            // Update document status
            database_1.prisma.document.update({
                where: { id: documentId },
                data: {
                    status: 'ready',
                    textContent: text.substring(0, 50000), // Store up to 50K chars of raw text
                    chunkCount: chunks.length,
                    totalTokens,
                },
            }),
        ]);
        console.log(`✅ Document ${documentId} processed: ${chunks.length} chunks, ${totalTokens} tokens`);
    }
    catch (error) {
        console.error(`❌ Document processing failed for ${documentId}:`, error.message);
        await database_1.prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'failed',
                errorMessage: error.message || 'Processing failed',
            },
        });
    }
}
