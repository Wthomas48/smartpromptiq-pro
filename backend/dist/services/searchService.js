"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSearchConfigured = isSearchConfigured;
exports.searchWeb = searchWeb;
exports.buildSearchSynthesisPrompt = buildSearchSynthesisPrompt;
exports.searchAndSynthesize = searchAndSynthesize;
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const generative_ai_1 = require("@google/generative-ai");
// ============================================
// WEB SEARCH SERVICE (Tavily AI)
// ============================================
// --- Provider clients (same env vars as aiService / ragService) ---
const openaiKey = process.env.OPENAI_API_KEY;
let openai = null;
if (openaiKey && !openaiKey.includes('REPLACE') && openaiKey.startsWith('sk-')) {
    openai = new openai_1.default({ apiKey: openaiKey });
}
const anthropicKey = process.env.ANTHROPIC_API_KEY;
let anthropic = null;
if (anthropicKey && !anthropicKey.includes('REPLACE') && anthropicKey.startsWith('sk-ant-')) {
    anthropic = new sdk_1.default({ apiKey: anthropicKey });
}
const geminiKey = process.env.GOOGLE_API_KEY;
let gemini = null;
if (geminiKey && !geminiKey.includes('REPLACE') && geminiKey.length > 10) {
    const genAI = new generative_ai_1.GoogleGenerativeAI(geminiKey);
    gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}
// --- Tavily config ---
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = 'https://api.tavily.com/search';
// ============================================
// CONFIGURATION CHECK
// ============================================
function isSearchConfigured() {
    return !!(TAVILY_API_KEY && !TAVILY_API_KEY.includes('REPLACE') && TAVILY_API_KEY.length > 5);
}
// ============================================
// WEB SEARCH (Tavily API)
// ============================================
async function searchWeb(query, options = {}) {
    if (!isSearchConfigured()) {
        throw new Error('Web search is not configured — TAVILY_API_KEY missing');
    }
    const searchDepth = options.searchDepth || 'basic';
    const maxResults = Math.min(options.maxResults || 5, 10);
    const topic = options.topic || 'general';
    const startTime = Date.now();
    const response = await fetch(TAVILY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query,
            search_depth: searchDepth,
            max_results: maxResults,
            include_answer: true,
            topic,
        }),
    });
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Tavily search failed (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    const timeTakenMs = Date.now() - startTime;
    const results = (data.results || []).map((r) => ({
        title: r.title || 'Untitled',
        url: r.url || '',
        content: r.content || '',
        score: r.score || 0,
        publishedDate: r.published_date || undefined,
    }));
    return {
        query,
        results,
        tavilyAnswer: data.answer || undefined,
        searchDepth,
        timeTakenMs,
    };
}
// ============================================
// PROMPT BUILDING (Same pattern as ragService.buildRAGPrompt)
// ============================================
function buildSearchSynthesisPrompt(query, searchResults) {
    const contextBlocks = searchResults
        .map((r, i) => {
        const date = r.publishedDate ? ` (${r.publishedDate})` : '';
        return `[${i + 1}] ${r.title}${date}\nURL: ${r.url}\n${r.content}`;
    })
        .join('\n\n---\n\n');
    return `You are a helpful web research assistant. Answer the user's question using ONLY the web search results provided below. Be comprehensive and accurate.

Rules:
- Cite sources using [1], [2], etc. inline with your answer
- If sources conflict, note the discrepancy
- If the search results don't contain enough information to fully answer, say so
- Be concise but thorough
- Format your answer in clear paragraphs with markdown where helpful

## Web Search Results
${contextBlocks}

## User Question
${query}

Provide a well-structured answer with inline source citations.`;
}
// ============================================
// LLM PROVIDER RESOLUTION
// ============================================
function resolveProvider(preferred) {
    if (preferred === 'openai' && openai)
        return 'openai';
    if (preferred === 'anthropic' && anthropic)
        return 'anthropic';
    if (preferred === 'gemini' && gemini)
        return 'gemini';
    if (openai)
        return 'openai';
    if (anthropic)
        return 'anthropic';
    if (gemini)
        return 'gemini';
    return 'none';
}
async function generateSynthesis(prompt, preferredProvider) {
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
        const text = response.content[0]?.type === 'text' ? response.content[0].text : 'No response generated';
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
    throw new Error('No AI provider configured for web search synthesis');
}
// ============================================
// SEARCH + SYNTHESIZE ORCHESTRATOR
// ============================================
async function searchAndSynthesize(query, options = {}, preferredProvider) {
    // 1. Search the web
    const searchResult = await searchWeb(query, options);
    if (searchResult.results.length === 0) {
        throw new Error('No search results found for this query');
    }
    // 2. Build synthesis prompt
    const prompt = buildSearchSynthesisPrompt(query, searchResult.results);
    // 3. Generate AI synthesis
    const llmResponse = await generateSynthesis(prompt, preferredProvider);
    // 4. Extract sources array
    const sources = searchResult.results.map((r, i) => ({
        index: i + 1,
        title: r.title,
        url: r.url,
    }));
    return {
        answer: llmResponse.content,
        sources,
        provider: llmResponse.provider,
        model: llmResponse.model,
        usage: llmResponse.usage,
        searchResult,
    };
}
