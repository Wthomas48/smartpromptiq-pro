import OpenAI from 'openai';
import { prisma } from '../config/database';

// ============================================
// DOCUMENT PROCESSING SERVICE
// ============================================

const openaiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
  openai = new OpenAI({ apiKey: openaiKey });
}

const MAX_CHUNKS = 50;
const CHARS_PER_TOKEN = 4;
const MAX_CHUNK_TOKENS = 500;
const OVERLAP_TOKENS = 100;

// ============================================
// TEXT EXTRACTION
// ============================================

export async function parseDocument(buffer: Buffer, fileType: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case 'pdf': {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text || '';
    }
    case 'docx': {
      const mammoth = await import('mammoth');
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

// ============================================
// TEXT CHUNKING
// ============================================

interface Chunk {
  content: string;
  chunkIndex: number;
  tokenCount: number;
  heading?: string;
  pageNumber?: number;
}

export function chunkText(
  text: string,
  maxChunkTokens: number = MAX_CHUNK_TOKENS,
  overlapTokens: number = OVERLAP_TOKENS
): Chunk[] {
  const maxChunkChars = maxChunkTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  // Split by double-newline (paragraph boundaries)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const chunks: Chunk[] = [];
  let currentChunk = '';
  let chunkIndex = 0;
  let currentHeading: string | undefined;

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
    } else {
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

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
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

export async function processDocument(
  documentId: string,
  buffer: Buffer,
  fileType: string
): Promise<void> {
  try {
    // Update status to processing
    await prisma.document.update({
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

    await prisma.$transaction([
      // Create all chunks
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
      // Update document status
      prisma.document.update({
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
  } catch (error: any) {
    console.error(`❌ Document processing failed for ${documentId}:`, error.message);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'failed',
        errorMessage: error.message || 'Processing failed',
      },
    });
  }
}
