import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { prisma } from '../config/database';

// ============================================
// RAG (Retrieval-Augmented Generation) SERVICE
// ============================================

// --- Provider clients (reuse same env vars as aiService) ---

const openaiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;
if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
  openai = new OpenAI({ apiKey: openaiKey });
}

const anthropicKey = process.env.ANTHROPIC_API_KEY;
let anthropic: Anthropic | null = null;
if (anthropicKey && !anthropicKey.includes('REPLACE') && anthropicKey.startsWith('sk-ant-')) {
  anthropic = new Anthropic({ apiKey: anthropicKey });
}

const geminiKey = process.env.GOOGLE_API_KEY;
let gemini: GenerativeModel | null = null;
if (geminiKey && !geminiKey.includes('REPLACE') && geminiKey.length > 10) {
  const genAI = new GoogleGenerativeAI(geminiKey);
  gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// ============================================
// VECTOR MATH
// ============================================

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ============================================
// QUERY EMBEDDING
// ============================================

export async function embedQuery(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error('OpenAI not configured — embeddings unavailable');
  }
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// ============================================
// CHUNK RETRIEVAL
// ============================================

interface RelevantChunk {
  id: string;
  content: string;
  chunkIndex: number;
  heading?: string | null;
  pageNumber?: number | null;
  similarity: number;
}

export async function retrieveRelevantChunks(
  documentId: string,
  queryEmbedding: number[],
  topK: number = 5
): Promise<RelevantChunk[]> {
  const chunks = await prisma.documentChunk.findMany({
    where: { documentId },
    select: {
      id: true,
      content: true,
      chunkIndex: true,
      heading: true,
      pageNumber: true,
      embedding: true,
    },
  });

  // Score each chunk by cosine similarity
  const scored = chunks.map((chunk) => {
    const embedding: number[] = JSON.parse(chunk.embedding);
    return {
      id: chunk.id,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      heading: chunk.heading,
      pageNumber: chunk.pageNumber,
      similarity: cosineSimilarity(queryEmbedding, embedding),
    };
  });

  // Sort descending by similarity, return top-K
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

// ============================================
// PROMPT BUILDING
// ============================================

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function buildRAGPrompt(
  question: string,
  chunks: RelevantChunk[],
  chatHistory: ChatMessage[] = []
): string {
  const contextBlocks = chunks
    .map((c, i) => {
      const header = c.heading ? ` (${c.heading})` : '';
      const page = c.pageNumber ? ` [Page ${c.pageNumber}]` : '';
      return `[${i + 1}]${header}${page}\n${c.content}`;
    })
    .join('\n\n---\n\n');

  const historyBlock =
    chatHistory.length > 0
      ? chatHistory
          .slice(-6) // keep last 6 messages for context
          .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n\n')
      : '';

  return `You are a helpful document assistant. Answer the user's question based ONLY on the provided document excerpts below. If the answer is not in the excerpts, say so honestly. Cite sources using [1], [2], etc.

${historyBlock ? `## Previous Conversation\n${historyBlock}\n\n` : ''}## Document Excerpts
${contextBlocks}

## User Question
${question}

Provide a clear, accurate answer citing the relevant excerpt numbers.`;
}

// ============================================
// LLM RESPONSE GENERATION
// ============================================

interface RAGResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function resolveProvider(preferred?: string): string {
  if (preferred === 'openai' && openai) return 'openai';
  if (preferred === 'anthropic' && anthropic) return 'anthropic';
  if (preferred === 'gemini' && gemini) return 'gemini';
  // Auto-select first available
  if (openai) return 'openai';
  if (anthropic) return 'anthropic';
  if (gemini) return 'gemini';
  return 'none';
}

async function generateRAGResponse(
  prompt: string,
  preferredProvider?: string
): Promise<RAGResponse> {
  const provider = resolveProvider(preferredProvider);

  if (provider === 'openai' && openai) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.3,
    });
    return {
      content: response.choices[0]?.message?.content || 'No response generated',
      provider: 'openai',
      model: 'gpt-4o',
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      },
    };
  }

  if (provider === 'anthropic' && anthropic) {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });
    const text =
      response.content[0]?.type === 'text' ? response.content[0].text : 'No response generated';
    return {
      content: text,
      provider: 'anthropic',
      model: 'claude-3-haiku',
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  if (provider === 'gemini' && gemini) {
    const result = await gemini.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
    });
    const resp = result.response;
    return {
      content: resp.text() || 'No response generated',
      provider: 'gemini',
      model: 'gemini-2.0-flash',
      usage: {
        prompt_tokens: resp.usageMetadata?.promptTokenCount || 0,
        completion_tokens: resp.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: resp.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  throw new Error('No AI provider configured for RAG chat');
}

// ============================================
// MAIN CHAT ORCHESTRATOR
// ============================================

export interface ChatOptions {
  chatId?: string;
  provider?: string;
  topK?: number;
}

export interface ChatResult {
  chatId: string;
  messageId: string;
  answer: string;
  provider: string;
  model: string;
  chunksUsed: { index: number; heading?: string | null; similarity: number }[];
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export async function chat(
  documentId: string,
  userId: string,
  message: string,
  options: ChatOptions = {}
): Promise<ChatResult> {
  const { chatId: existingChatId, provider, topK = 5 } = options;

  // 1. Embed the user's question
  const queryEmbedding = await embedQuery(message);

  // 2. Retrieve relevant chunks
  const chunks = await retrieveRelevantChunks(documentId, queryEmbedding, topK);

  // 3. Load chat history if continuing a conversation
  let chatHistory: ChatMessage[] = [];
  if (existingChatId) {
    const prevMessages = await prisma.documentChatMessage.findMany({
      where: { chatId: existingChatId },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
      take: 20,
    });
    chatHistory = prevMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
  }

  // 4. Build RAG prompt
  const ragPrompt = buildRAGPrompt(message, chunks, chatHistory);

  // 5. Generate response
  const response = await generateRAGResponse(ragPrompt, provider);

  // 6. Persist chat + messages in a transaction
  const chunksUsed = chunks.map((c) => ({
    index: c.chunkIndex,
    heading: c.heading,
    similarity: Math.round(c.similarity * 1000) / 1000,
  }));

  const result = await prisma.$transaction(async (tx) => {
    // Get or create chat session
    let chatSession;
    if (existingChatId) {
      chatSession = await tx.documentChat.findUnique({ where: { id: existingChatId } });
      if (!chatSession) throw new Error('Chat session not found');
    }

    if (!chatSession) {
      chatSession = await tx.documentChat.create({
        data: {
          documentId,
          userId,
          provider: response.provider,
          model: response.model,
          messageCount: 0,
          tokenCount: 0,
        },
      });
    }

    // Save user message
    await tx.documentChatMessage.create({
      data: {
        chatId: chatSession.id,
        role: 'user',
        content: message,
      },
    });

    // Save assistant message
    const assistantMsg = await tx.documentChatMessage.create({
      data: {
        chatId: chatSession.id,
        role: 'assistant',
        content: response.content,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
        chunksUsed: JSON.stringify(chunksUsed),
      },
    });

    // Update chat session counters
    await tx.documentChat.update({
      where: { id: chatSession.id },
      data: {
        messageCount: { increment: 2 },
        tokenCount: { increment: response.usage.total_tokens },
        lastMessageAt: new Date(),
        provider: response.provider,
        model: response.model,
      },
    });

    // Update document lastChatAt + chatCount
    await tx.document.update({
      where: { id: documentId },
      data: {
        chatCount: { increment: 1 },
        lastChatAt: new Date(),
      },
    });

    return { chatId: chatSession.id, messageId: assistantMsg.id };
  });

  return {
    chatId: result.chatId,
    messageId: result.messageId,
    answer: response.content,
    provider: response.provider,
    model: response.model,
    chunksUsed,
    usage: response.usage,
  };
}
