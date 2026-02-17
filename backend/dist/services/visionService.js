"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVisionConfigured = isVisionConfigured;
exports.getVisionProviders = getVisionProviders;
exports.analyzeImage = analyzeImage;
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const generative_ai_1 = require("@google/generative-ai");
// ============================================
// VISION / IMAGE ANALYSIS SERVICE
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
// Supported MIME types for vision
const SUPPORTED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];
// ============================================
// CONFIGURATION
// ============================================
function isVisionConfigured() {
    return !!(openai || anthropic || gemini);
}
function getVisionProviders() {
    return [
        { id: 'openai', name: 'GPT-4o Vision', available: !!openai },
        { id: 'anthropic', name: 'Claude Vision', available: !!anthropic },
        { id: 'gemini', name: 'Gemini Vision', available: !!gemini },
    ];
}
// ============================================
// PROVIDER-SPECIFIC ANALYSIS
// ============================================
async function analyzeWithOpenAI(imageBase64, mimeType, prompt, detail = 'auto') {
    if (!openai)
        throw new Error('OpenAI not configured');
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${imageBase64}`,
                            detail,
                        },
                    },
                ],
            },
        ],
        max_tokens: 2000,
        temperature: 0.3,
    });
    return {
        analysis: response.choices[0]?.message?.content || 'No analysis generated',
        provider: 'openai',
        model: 'gpt-4o',
        usage: {
            prompt_tokens: response.usage?.prompt_tokens || 0,
            completion_tokens: response.usage?.completion_tokens || 0,
            total_tokens: response.usage?.total_tokens || 0,
        },
    };
}
async function analyzeWithAnthropic(imageBase64, mimeType, prompt) {
    if (!anthropic)
        throw new Error('Anthropic not configured');
    const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: mimeType,
                            data: imageBase64,
                        },
                    },
                    {
                        type: 'text',
                        text: prompt,
                    },
                ],
            },
        ],
    });
    const text = response.content[0]?.type === 'text' ? response.content[0].text : 'No analysis generated';
    return {
        analysis: text,
        provider: 'anthropic',
        model: 'claude-3-haiku',
        usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.input_tokens + response.usage.output_tokens,
        },
    };
}
async function analyzeWithGemini(imageBase64, mimeType, prompt) {
    if (!gemini)
        throw new Error('Gemini not configured');
    const result = await gemini.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType,
                            data: imageBase64,
                        },
                    },
                ],
            },
        ],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
    });
    const resp = result.response;
    return {
        analysis: resp.text() || 'No analysis generated',
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        usage: {
            prompt_tokens: resp.usageMetadata?.promptTokenCount || 0,
            completion_tokens: resp.usageMetadata?.candidatesTokenCount || 0,
            total_tokens: resp.usageMetadata?.totalTokenCount || 0,
        },
    };
}
// ============================================
// PROVIDER RESOLUTION
// ============================================
function resolveProvider(preferred) {
    if (preferred === 'openai' && openai)
        return 'openai';
    if (preferred === 'anthropic' && anthropic)
        return 'anthropic';
    if (preferred === 'gemini' && gemini)
        return 'gemini';
    // Auto: prefer Gemini (cheapest for vision), then OpenAI, then Anthropic
    if (gemini)
        return 'gemini';
    if (openai)
        return 'openai';
    if (anthropic)
        return 'anthropic';
    return 'none';
}
// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================
async function analyzeImage(imageBase64, mimeType, prompt, options = {}) {
    // Validate MIME type
    if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
        throw new Error(`Unsupported image type: ${mimeType}. Supported: ${SUPPORTED_MIME_TYPES.join(', ')}`);
    }
    const provider = resolveProvider(options.provider);
    if (provider === 'none') {
        throw new Error('No AI provider configured for vision analysis');
    }
    // Build analysis prompt with system context
    const fullPrompt = `You are an expert image analyst. Analyze the provided image and answer the user's question thoroughly.

User's request: ${prompt}

Provide a detailed, well-structured analysis. Use markdown formatting where helpful.`;
    switch (provider) {
        case 'openai':
            return analyzeWithOpenAI(imageBase64, mimeType, fullPrompt, options.detail);
        case 'anthropic':
            return analyzeWithAnthropic(imageBase64, mimeType, fullPrompt);
        case 'gemini':
            return analyzeWithGemini(imageBase64, mimeType, fullPrompt);
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}
