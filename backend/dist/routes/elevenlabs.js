"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const costs_1 = require("../config/costs");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Cost tracking helper - logs actual API costs for admin dashboard
async function logElevenLabsCost(userId, action, cost, tokensUsed, model) {
    try {
        await prisma.usageLog.create({
            data: {
                userId: userId || 'anonymous',
                action: `elevenlabs:${action}`,
                tokensUsed,
                cost,
                provider: 'elevenlabs',
                model,
                responseTime: 0,
                metadata: JSON.stringify({ feature: action }),
            },
        });
        if (costs_1.COST_CONTROL_FLAGS.logAllAPICosts) {
            console.log(`💰 ElevenLabs Cost: $${cost.toFixed(4)} | Tokens: ${tokensUsed} | Model: ${model} | Action: ${action}`);
        }
    }
    catch (error) {
        console.error('Failed to log ElevenLabs cost:', error);
    }
}
// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_cdca5619fb6e46dc10eb80f2d1047d631e93d0f531764844';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
// Token cost per character (ElevenLabs pricing)
const ELEVENLABS_TOKEN_COST_PER_100_CHARS = 8;
const MAX_CHARS_PER_REQUEST = 5000;
// Premium ElevenLabs voices with natural personas - 25+ voices!
const ELEVENLABS_VOICES = {
    // ==================== FEMALE VOICES (11) ====================
    'rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', style: 'warm', description: 'Warm American female - perfect for narration & storytelling' },
    'domi': { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', style: 'confident', description: 'Strong, confident female - great for business & marketing' },
    'bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', style: 'soft', description: 'Soft & expressive - ideal for meditation & wellness' },
    'elli': { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female', style: 'young', description: 'Young & playful female - perfect for education & tutorials' },
    'charlotte': { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', gender: 'female', style: 'british', description: 'British accent - sophisticated & professional' },
    'matilda': { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', gender: 'female', style: 'friendly', description: 'Warm & friendly - great for customer service' },
    'emily': { id: 'LcfcDJNUP1GQjkzn1xUU', name: 'Emily', gender: 'female', style: 'news', description: 'Clear news anchor style - perfect for announcements' },
    'jessie': { id: 't0jbNlBVZ17f02VDIeMI', name: 'Jessie', gender: 'female', style: 'energetic', description: 'High-energy female - great for exciting content' },
    'grace': { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', gender: 'female', style: 'elegant', description: 'Elegant sophisticated voice - ideal for luxury brands' },
    'lily': { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'female', style: 'gentle', description: 'Sweet gentle voice - perfect for soft content' },
    'nicole': { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', gender: 'female', style: 'business', description: 'Professional business voice - ideal for corporate' },
    // ==================== MALE VOICES (14) ====================
    'adam': { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male', style: 'deep', description: 'Deep & authoritative - perfect for documentaries & corporate' },
    'antoni': { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', style: 'friendly', description: 'Friendly & natural male - versatile for all content' },
    'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male', style: 'young', description: 'Young American male - great for tech & modern content' },
    'arnold': { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male', style: 'powerful', description: 'Powerful & crisp - excellent for announcements' },
    'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male', style: 'warm', description: 'Warm & engaging - ideal for podcasts & storytelling' },
    'callum': { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male', style: 'british', description: 'British accent male - sophisticated narrator' },
    'clyde': { id: '2EiwWnXFnvU5JabPnv8n', name: 'Clyde', gender: 'male', style: 'serious', description: 'Deep & serious - great for dramatic content' },
    'fin': { id: 'D38z5RcWu1voky8WS1ja', name: 'Fin', gender: 'male', style: 'irish', description: 'Irish accent - friendly & engaging narrator' },
    'brian': { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'male', style: 'podcast', description: 'Smooth conversational voice - perfect for podcasts' },
    'daniel': { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', gender: 'male', style: 'reporter', description: 'Professional reporter voice - clear and articulate' },
    'george': { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'male', style: 'mentor', description: 'Mature wise voice - ideal for educational content' },
    'liam': { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'male', style: 'entrepreneur', description: 'Young ambitious voice - great for startup content' },
    'james': { id: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', gender: 'male', style: 'executive', description: 'Executive-level voice - perfect for leadership content' },
    'ethan': { id: 'g5CIjZEefAph4nQFvHAz', name: 'Ethan', gender: 'male', style: 'gamer', description: 'High-energy gaming voice - perfect for entertainment' },
    'harry': { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', gender: 'male', style: 'charming', description: 'Charismatic smooth voice - great for persuasive content' },
};
// Voice categories for different use cases - expanded for 25+ voices!
const VOICE_CATEGORIES = {
    academy: ['rachel', 'elli', 'george', 'sam', 'matilda'], // Best for learning
    education: ['rachel', 'elli', 'charlotte', 'george', 'adam'], // Educational content
    marketing: ['domi', 'harry', 'emily', 'josh', 'liam'], // Best for ads/marketing
    meditation: ['bella', 'lily', 'rachel', 'sam'], // Best for calm content
    storytelling: ['sam', 'fin', 'clyde', 'matilda', 'charlotte'], // Best for narratives
    business: ['adam', 'james', 'nicole', 'charlotte', 'daniel'], // Best for corporate
    entertainment: ['ethan', 'jessie', 'arnold', 'brian', 'sam'], // Best for fun content
    tech: ['josh', 'liam', 'adam', 'antoni', 'daniel'], // Tech content
    wellness: ['bella', 'lily', 'rachel', 'grace'], // Wellness & relaxation
    general: ['antoni', 'rachel', 'adam', 'sam', 'emily'], // General purpose
    gaming: ['ethan', 'arnold', 'jessie', 'josh'], // Gaming content
    podcast: ['brian', 'sam', 'antoni', 'rachel', 'fin'], // Podcast hosting
    luxury: ['grace', 'callum', 'charlotte', 'james'], // High-end brands
    news: ['emily', 'daniel', 'adam', 'nicole'], // News & announcements
    action: ['arnold', 'clyde', 'ethan', 'josh'], // Action/dramatic content
    kids: ['elli', 'lily', 'matilda', 'jessie'], // Kids & family content
    corporate: ['adam', 'james', 'nicole', 'charlotte', 'daniel'], // Corporate presentations
    documentary: ['adam', 'clyde', 'callum', 'sam', 'george'], // Documentary narration
};
// Voice settings presets
const VOICE_PRESETS = {
    natural: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    clear: { stability: 0.7, similarity_boost: 0.8, style: 0.0, use_speaker_boost: true },
    expressive: { stability: 0.3, similarity_boost: 0.85, style: 0.5, use_speaker_boost: true },
    dramatic: { stability: 0.4, similarity_boost: 0.9, style: 0.8, use_speaker_boost: true },
    calm: { stability: 0.8, similarity_boost: 0.7, style: 0.0, use_speaker_boost: false },
};
/**
 * POST /api/elevenlabs/generate
 * Generate premium AI voice using ElevenLabs
 */
router.post('/generate', async (req, res) => {
    try {
        const { text, voiceId, voiceName = 'rachel', model = 'eleven_multilingual_v2', preset = 'natural', settings, category, } = req.body;
        // Validate input
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ message: 'Text is required' });
        }
        if (text.length > MAX_CHARS_PER_REQUEST) {
            return res.status(400).json({
                message: `Text too long. Maximum ${MAX_CHARS_PER_REQUEST} characters allowed.`
            });
        }
        // Get voice ID
        const voice = ELEVENLABS_VOICES[voiceName];
        const finalVoiceId = voiceId || voice?.id || ELEVENLABS_VOICES.rachel.id;
        // Get voice settings from preset or custom
        const voiceSettings = settings || VOICE_PRESETS[preset] || VOICE_PRESETS.natural;
        // Check user authentication (optional for demo)
        const userId = req.userId;
        const tokenCost = Math.ceil(text.length / 100) * ELEVENLABS_TOKEN_COST_PER_100_CHARS;
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { tokenBalance: true, subscriptionTier: true },
            });
            if (user && user.subscriptionTier !== 'enterprise' && user.tokenBalance < tokenCost) {
                return res.status(402).json({
                    message: 'Insufficient tokens for ElevenLabs voice',
                    required: tokenCost,
                    available: user.tokenBalance,
                });
            }
        }
        console.log(`🎙️ ElevenLabs: Generating voice with ${voiceName} (${finalVoiceId})`);
        console.log(`🎙️ Text length: ${text.length}, Model: ${model}, Preset: ${preset}`);
        // Call ElevenLabs API
        const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${finalVoiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: model,
                voice_settings: {
                    stability: voiceSettings.stability,
                    similarity_boost: voiceSettings.similarity_boost,
                    style: voiceSettings.style || 0,
                    use_speaker_boost: voiceSettings.use_speaker_boost ?? true,
                },
            }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('ElevenLabs API error:', errorData);
            throw new Error(errorData.detail?.message || `ElevenLabs API error: ${response.status}`);
        }
        // Get audio buffer
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        // Deduct tokens if user is authenticated
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    tokenBalance: { decrement: tokenCost },
                    tokensUsed: { increment: tokenCost },
                },
            });
            await prisma.generation.create({
                data: {
                    userId,
                    prompt: text.slice(0, 500),
                    response: `ElevenLabs voice: ${voiceName}, ${text.length} chars`,
                    model: `elevenlabs-${model}`,
                    category: category || 'voice',
                    tokenCount: tokenCost,
                },
            });
        }
        const wordCount = text.trim().split(/\s+/).length;
        const estimatedDuration = Math.ceil(wordCount / 150 * 60);
        // Calculate and log actual API cost
        const actualAPICost = (text.length / 1000) * costs_1.API_COSTS.elevenlabs['standard'];
        await logElevenLabsCost(userId, 'tts-generate', actualAPICost, tokenCost, model);
        console.log(`🎙️ ElevenLabs: Voice generated successfully!`);
        res.json({
            success: true,
            audioUrl,
            format: 'mp3',
            duration: estimatedDuration,
            voice: voiceName,
            voiceId: finalVoiceId,
            model,
            tokensUsed: tokenCost,
            charCount: text.length,
            provider: 'elevenlabs',
        });
    }
    catch (error) {
        console.error('ElevenLabs generation error:', error);
        res.status(500).json({
            message: 'Failed to generate ElevenLabs voice',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * POST /api/elevenlabs/generate-stream
 * Stream audio generation for real-time playback
 */
router.post('/generate-stream', async (req, res) => {
    try {
        const { text, voiceName = 'rachel', model = 'eleven_multilingual_v2' } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }
        const voice = ELEVENLABS_VOICES[voiceName];
        const voiceId = voice?.id || ELEVENLABS_VOICES.rachel.id;
        console.log(`🎙️ ElevenLabs Stream: Starting with ${voiceName}`);
        const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}/stream`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: model,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`ElevenLabs stream error: ${response.status}`);
        }
        // Set streaming headers
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Transfer-Encoding', 'chunked');
        // Pipe the stream directly to response
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No stream reader available');
        }
        const pump = async () => {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    res.end();
                    break;
                }
                res.write(Buffer.from(value));
            }
        };
        await pump();
    }
    catch (error) {
        console.error('ElevenLabs stream error:', error);
        res.status(500).json({ message: 'Stream generation failed' });
    }
});
/**
 * POST /api/elevenlabs/academy/generate
 * Generate voice for Academy lessons with optimized settings
 */
router.post('/academy/generate', async (req, res) => {
    try {
        const { lessonContent, lessonTitle, voiceName = 'rachel', speed = 'normal', style = 'teacher' } = req.body;
        if (!lessonContent) {
            return res.status(400).json({ message: 'Lesson content is required' });
        }
        // Choose optimal voice for Academy
        const academyVoice = ELEVENLABS_VOICES[voiceName]
            || ELEVENLABS_VOICES.rachel;
        // Adjust stability for teaching content (clearer speech)
        const teacherSettings = {
            stability: style === 'calm' ? 0.85 : 0.65,
            similarity_boost: 0.8,
            style: style === 'engaging' ? 0.3 : 0,
            use_speaker_boost: true,
        };
        console.log(`🎓 Academy Voice: Generating lesson narration with ${voiceName}`);
        const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${academyVoice.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: lessonContent.slice(0, MAX_CHARS_PER_REQUEST),
                model_id: 'eleven_multilingual_v2',
                voice_settings: teacherSettings,
            }),
        });
        if (!response.ok) {
            throw new Error(`ElevenLabs error: ${response.status}`);
        }
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        const wordCount = lessonContent.trim().split(/\s+/).length;
        const estimatedDuration = Math.ceil(wordCount / 140 * 60); // Slightly slower for learning
        res.json({
            success: true,
            audioUrl,
            format: 'mp3',
            duration: estimatedDuration,
            voice: voiceName,
            voiceDescription: academyVoice.description,
            lessonTitle,
            charCount: lessonContent.length,
            wordCount,
            provider: 'elevenlabs',
        });
    }
    catch (error) {
        console.error('Academy voice generation error:', error);
        res.status(500).json({ message: 'Failed to generate lesson narration' });
    }
});
/**
 * POST /api/elevenlabs/page/narrate
 * Narrate any page content (for app-wide voice)
 */
router.post('/page/narrate', async (req, res) => {
    try {
        const { content, pageTitle, pageType = 'general', voiceName, summarize = false } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }
        // Select optimal voice based on page type
        const pageVoiceMap = {
            academy: 'rachel',
            dashboard: 'emily',
            pricing: 'domi',
            documentation: 'charlotte',
            marketing: 'josh',
            meditation: 'bella',
            general: 'antoni',
        };
        const selectedVoice = voiceName || pageVoiceMap[pageType] || 'rachel';
        const voice = ELEVENLABS_VOICES[selectedVoice];
        let textToSpeak = content;
        // Optionally summarize long content
        if (summarize && content.length > 3000) {
            // Use first 3000 chars for now - could integrate GPT for summarization
            textToSpeak = content.slice(0, 3000) + '... [Content continues]';
        }
        console.log(`📄 Page Narration: ${pageTitle || 'Unknown'} with ${selectedVoice}`);
        const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: textToSpeak.slice(0, MAX_CHARS_PER_REQUEST),
                model_id: 'eleven_multilingual_v2',
                voice_settings: VOICE_PRESETS.natural,
            }),
        });
        if (!response.ok) {
            throw new Error(`Page narration failed: ${response.status}`);
        }
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        res.json({
            success: true,
            audioUrl,
            format: 'mp3',
            voice: selectedVoice,
            voiceDescription: voice.description,
            pageTitle,
            charCount: textToSpeak.length,
            provider: 'elevenlabs',
        });
    }
    catch (error) {
        console.error('Page narration error:', error);
        res.status(500).json({ message: 'Failed to narrate page' });
    }
});
/**
 * GET /api/elevenlabs/voices
 * Get all available ElevenLabs voices
 */
router.get('/voices', (_req, res) => {
    const voices = Object.entries(ELEVENLABS_VOICES).map(([key, voice]) => ({
        key,
        ...voice,
    }));
    res.json({
        voices,
        categories: VOICE_CATEGORIES,
        presets: Object.keys(VOICE_PRESETS),
        total: voices.length,
    });
});
/**
 * GET /api/elevenlabs/voices/:category
 * Get voices recommended for a specific category
 */
router.get('/voices/:category', (req, res) => {
    const { category } = req.params;
    const voiceKeys = VOICE_CATEGORIES[category] || VOICE_CATEGORIES.academy;
    const voices = voiceKeys.map(key => ({
        key,
        ...ELEVENLABS_VOICES[key],
    }));
    res.json({
        category,
        voices,
        total: voices.length,
    });
});
/**
 * GET /api/elevenlabs/presets
 * Get voice setting presets
 */
router.get('/presets', (_req, res) => {
    const presets = Object.entries(VOICE_PRESETS).map(([name, settings]) => ({
        name,
        ...settings,
        description: {
            natural: 'Balanced & versatile - great for most content',
            clear: 'High clarity - ideal for educational content',
            expressive: 'More emotion & variation - great for storytelling',
            dramatic: 'Maximum expression - perfect for dramatic narration',
            calm: 'Stable & soothing - ideal for meditation & relaxation',
        }[name],
    }));
    res.json({ presets });
});
/**
 * POST /api/elevenlabs/batch-generate
 * Generate multiple audio clips in one request
 */
router.post('/batch-generate', async (req, res) => {
    try {
        const { items, voiceName = 'rachel' } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Items array is required' });
        }
        if (items.length > 5) {
            return res.status(400).json({ message: 'Maximum 5 items per batch' });
        }
        const voice = ELEVENLABS_VOICES[voiceName] || ELEVENLABS_VOICES.rachel;
        console.log(`🎙️ Batch Generation: ${items.length} items with ${voiceName}`);
        const results = await Promise.all(items.map(async (item, index) => {
            try {
                const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice.id}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVENLABS_API_KEY,
                    },
                    body: JSON.stringify({
                        text: item.text.slice(0, MAX_CHARS_PER_REQUEST),
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: VOICE_PRESETS.natural,
                    }),
                });
                if (!response.ok) {
                    return { id: item.id || index, success: false, error: 'Generation failed' };
                }
                const audioBuffer = Buffer.from(await response.arrayBuffer());
                const base64Audio = audioBuffer.toString('base64');
                return {
                    id: item.id || index,
                    success: true,
                    audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
                    charCount: item.text.length,
                };
            }
            catch (err) {
                return { id: item.id || index, success: false, error: 'Generation error' };
            }
        }));
        const successful = results.filter(r => r.success).length;
        res.json({
            success: true,
            results,
            summary: {
                total: items.length,
                successful,
                failed: items.length - successful,
            },
        });
    }
    catch (error) {
        console.error('Batch generation error:', error);
        res.status(500).json({ message: 'Batch generation failed' });
    }
});
/**
 * GET /api/elevenlabs/usage
 * Get ElevenLabs API usage stats
 */
router.get('/usage', async (_req, res) => {
    try {
        const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch usage');
        }
        const data = await response.json();
        res.json({
            success: true,
            usage: {
                charactersUsed: data.character_count,
                charactersLimit: data.character_limit,
                remainingCharacters: data.character_limit - data.character_count,
                percentUsed: Math.round((data.character_count / data.character_limit) * 100),
                tier: data.tier,
                resetDate: data.next_character_count_reset_unix
                    ? new Date(data.next_character_count_reset_unix * 1000).toISOString()
                    : null,
            },
        });
    }
    catch (error) {
        console.error('Usage fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch usage stats' });
    }
});
// ==============================================================
// ELEVENLABS SOUND EFFECTS API - Music Enhancement
// ==============================================================
// Sound effect categories for music enhancement
const SOUND_EFFECT_CATEGORIES = {
    transitions: ['whoosh', 'swoosh', 'impact', 'riser', 'downlifter', 'reverse cymbal'],
    atmospheres: ['ambient pad', 'nature sounds', 'city ambiance', 'space atmosphere', 'underwater'],
    musical: ['drum hit', 'bass drop', 'synth stab', 'piano chord', 'guitar strum', 'brass hit'],
    impacts: ['boom', 'explosion', 'punch', 'thud', 'crash', 'slam'],
    electronic: ['glitch', 'synth sweep', 'laser', 'beep', 'digital noise', 'wobble bass'],
    foley: ['footsteps', 'door', 'glass break', 'paper rustle', 'typing', 'clock tick'],
    alerts: ['notification', 'success chime', 'error buzz', 'level up', 'achievement unlock'],
    nature: ['rain', 'thunder', 'wind', 'birds', 'ocean waves', 'fire crackling'],
};
// Preset sound effect prompts for quick generation
const SOUND_EFFECT_PRESETS = {
    // Transitions
    'whoosh-fast': { prompt: 'fast whoosh sound effect, cinematic transition', duration: 1.0, description: 'Quick transition whoosh' },
    'whoosh-slow': { prompt: 'slow dramatic whoosh, epic trailer style', duration: 2.0, description: 'Slow dramatic whoosh' },
    'riser-tension': { prompt: 'tension building riser sound, cinematic buildup', duration: 4.0, description: 'Tension building riser' },
    'impact-deep': { prompt: 'deep bass impact hit, trailer style boom', duration: 1.5, description: 'Deep bass impact' },
    'reverse-cymbal': { prompt: 'reverse cymbal crash, building tension', duration: 3.0, description: 'Reverse cymbal buildup' },
    // Musical accents
    'bass-drop': { prompt: 'heavy electronic bass drop, EDM style', duration: 2.0, description: 'Heavy bass drop' },
    'synth-stab': { prompt: 'sharp synth stab chord, electronic music', duration: 0.5, description: 'Sharp synth accent' },
    'piano-chord': { prompt: 'beautiful piano chord, emotional cinematic', duration: 3.0, description: 'Emotional piano chord' },
    'orchestral-hit': { prompt: 'orchestral hit, full orchestra stab', duration: 1.5, description: 'Full orchestra hit' },
    'brass-fanfare': { prompt: 'triumphant brass fanfare, victory theme', duration: 2.5, description: 'Triumphant brass fanfare' },
    // Atmospheres
    'space-ambiance': { prompt: 'deep space ambient atmosphere, sci-fi', duration: 10.0, description: 'Deep space atmosphere' },
    'forest-ambient': { prompt: 'peaceful forest ambiance with birds', duration: 10.0, description: 'Forest nature sounds' },
    'rain-gentle': { prompt: 'gentle rain falling, relaxing atmosphere', duration: 10.0, description: 'Gentle rain sounds' },
    'ocean-waves': { prompt: 'calm ocean waves on beach, meditation', duration: 10.0, description: 'Ocean waves on beach' },
    'city-night': { prompt: 'city nighttime ambiance, distant traffic', duration: 10.0, description: 'City night atmosphere' },
    // UI/App sounds
    'notification-soft': { prompt: 'soft notification chime, pleasant alert', duration: 0.5, description: 'Soft notification' },
    'success-bright': { prompt: 'bright success sound, achievement', duration: 0.8, description: 'Success achievement sound' },
    'error-gentle': { prompt: 'gentle error sound, not harsh', duration: 0.5, description: 'Gentle error alert' },
    'click-ui': { prompt: 'clean UI click sound, button press', duration: 0.2, description: 'UI button click' },
    'level-up': { prompt: 'level up achievement sound, gaming', duration: 1.5, description: 'Level up fanfare' },
    // Electronic
    'glitch-digital': { prompt: 'digital glitch sound effect, electronic', duration: 0.8, description: 'Digital glitch effect' },
    'laser-beam': { prompt: 'sci-fi laser beam sound', duration: 0.5, description: 'Sci-fi laser sound' },
    'cyber-beep': { prompt: 'futuristic cyber beep, tech interface', duration: 0.3, description: 'Cyber interface beep' },
    // Podcast/Voice
    'intro-jingle': { prompt: 'short podcast intro jingle, professional', duration: 3.0, description: 'Podcast intro jingle' },
    'outro-fade': { prompt: 'smooth outro fade sound, podcast ending', duration: 2.0, description: 'Smooth outro fade' },
    'transition-smooth': { prompt: 'smooth transition sound for podcast', duration: 1.0, description: 'Podcast transition' },
};
/**
 * POST /api/elevenlabs/sound-effects/generate
 * Generate AI sound effects using ElevenLabs
 */
router.post('/sound-effects/generate', async (req, res) => {
    try {
        const { prompt, duration = 2.0, promptInfluence = 0.3, } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required for sound effect generation' });
        }
        // Validate duration (ElevenLabs supports 0.5 to 22 seconds)
        const validDuration = Math.max(0.5, Math.min(22, duration));
        console.log(`🔊 ElevenLabs Sound Effect: "${prompt.slice(0, 50)}..." (${validDuration}s)`);
        const response = await fetch(`${ELEVENLABS_BASE_URL}/sound-generation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: prompt,
                duration_seconds: validDuration,
                prompt_influence: promptInfluence,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('ElevenLabs Sound Effect error:', errorData);
            throw new Error(errorData.detail?.message || `Sound effect generation failed: ${response.status}`);
        }
        // Get audio buffer
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        console.log(`🔊 Sound effect generated: ${validDuration}s`);
        // Log sound effect cost
        const sfxCost = costs_1.API_COSTS.elevenlabs['sound-effect'];
        await logElevenLabsCost(null, 'sound-effect', sfxCost, 5, 'sound-generation');
        res.json({
            success: true,
            audioUrl,
            format: 'mp3',
            duration: validDuration,
            prompt: prompt.slice(0, 100),
            provider: 'elevenlabs-sound-effects',
        });
    }
    catch (error) {
        console.error('Sound effect generation error:', error);
        res.status(500).json({
            message: 'Failed to generate sound effect',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * POST /api/elevenlabs/sound-effects/preset
 * Generate sound effect from preset
 */
router.post('/sound-effects/preset', async (req, res) => {
    try {
        const { presetId, customDuration } = req.body;
        const preset = SOUND_EFFECT_PRESETS[presetId];
        if (!preset) {
            return res.status(400).json({
                message: 'Invalid preset ID',
                availablePresets: Object.keys(SOUND_EFFECT_PRESETS),
            });
        }
        const duration = customDuration || preset.duration;
        console.log(`🔊 ElevenLabs Preset: ${presetId} (${duration}s)`);
        const response = await fetch(`${ELEVENLABS_BASE_URL}/sound-generation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: preset.prompt,
                duration_seconds: duration,
                prompt_influence: 0.3,
            }),
        });
        if (!response.ok) {
            throw new Error(`Preset generation failed: ${response.status}`);
        }
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        res.json({
            success: true,
            audioUrl,
            format: 'mp3',
            duration,
            presetId,
            presetDescription: preset.description,
            provider: 'elevenlabs-sound-effects',
        });
    }
    catch (error) {
        console.error('Preset sound effect error:', error);
        res.status(500).json({ message: 'Failed to generate preset sound effect' });
    }
});
/**
 * GET /api/elevenlabs/sound-effects/presets
 * Get all available sound effect presets
 */
router.get('/sound-effects/presets', (_req, res) => {
    const presets = Object.entries(SOUND_EFFECT_PRESETS).map(([id, preset]) => ({
        id,
        ...preset,
    }));
    res.json({
        presets,
        categories: SOUND_EFFECT_CATEGORIES,
        total: presets.length,
    });
});
/**
 * GET /api/elevenlabs/sound-effects/categories
 * Get sound effect categories
 */
router.get('/sound-effects/categories', (_req, res) => {
    res.json({
        categories: SOUND_EFFECT_CATEGORIES,
        tips: {
            transitions: 'Use for scene changes, logo reveals, and video transitions',
            atmospheres: 'Layer under music for depth and immersion',
            musical: 'Accent key moments in your compositions',
            impacts: 'Emphasize important visual moments',
            electronic: 'Perfect for tech content and gaming',
            foley: 'Add realism to videos and presentations',
            alerts: 'Use for app notifications and UI feedback',
            nature: 'Create relaxing or outdoor atmospheres',
        },
    });
});
/**
 * POST /api/elevenlabs/sound-effects/batch
 * Generate multiple sound effects in one request
 */
router.post('/sound-effects/batch', async (req, res) => {
    try {
        const { effects } = req.body;
        if (!effects || !Array.isArray(effects) || effects.length === 0) {
            return res.status(400).json({ message: 'Effects array is required' });
        }
        if (effects.length > 5) {
            return res.status(400).json({ message: 'Maximum 5 effects per batch' });
        }
        console.log(`🔊 Batch Sound Effects: ${effects.length} effects`);
        const results = await Promise.all(effects.map(async (effect, index) => {
            try {
                const response = await fetch(`${ELEVENLABS_BASE_URL}/sound-generation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVENLABS_API_KEY,
                    },
                    body: JSON.stringify({
                        text: effect.prompt,
                        duration_seconds: Math.min(10, effect.duration || 2),
                        prompt_influence: 0.3,
                    }),
                });
                if (!response.ok) {
                    return { id: effect.id || index, success: false, error: 'Generation failed' };
                }
                const audioBuffer = Buffer.from(await response.arrayBuffer());
                const base64Audio = audioBuffer.toString('base64');
                return {
                    id: effect.id || index,
                    success: true,
                    audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
                    duration: effect.duration || 2,
                    prompt: effect.prompt.slice(0, 50),
                };
            }
            catch (err) {
                return { id: effect.id || index, success: false, error: 'Generation error' };
            }
        }));
        const successful = results.filter(r => r.success).length;
        res.json({
            success: true,
            results,
            summary: {
                total: effects.length,
                successful,
                failed: effects.length - successful,
            },
        });
    }
    catch (error) {
        console.error('Batch sound effects error:', error);
        res.status(500).json({ message: 'Batch generation failed' });
    }
});
// ==============================================================
// VOICE + MUSIC MIXING HELPERS
// ==============================================================
/**
 * POST /api/elevenlabs/music/voice-over
 * Generate voice-over with timing markers for music mixing
 */
router.post('/music/voice-over', async (req, res) => {
    try {
        const { script, voiceName = 'rachel', musicGenre, pacing = 'normal', } = req.body;
        if (!script) {
            return res.status(400).json({ message: 'Script is required' });
        }
        // Get optimal voice for the music genre
        const genreVoiceMap = {
            upbeat: 'josh',
            calm: 'bella',
            corporate: 'adam',
            cinematic: 'clyde',
            electronic: 'ethan',
            lofi: 'sam',
            epic: 'arnold',
            inspirational: 'rachel',
            hiphop: 'liam',
            podcast: 'brian',
        };
        const selectedVoice = voiceName || genreVoiceMap[musicGenre] || 'rachel';
        const voice = ELEVENLABS_VOICES[selectedVoice];
        // Adjust stability based on pacing
        const pacingSettings = {
            slow: { stability: 0.8, similarity: 0.7 },
            normal: { stability: 0.5, similarity: 0.75 },
            fast: { stability: 0.4, similarity: 0.8 },
        };
        const settings = pacingSettings[pacing] || pacingSettings.normal;
        console.log(`🎵 Voice-Over: ${selectedVoice} for ${musicGenre || 'general'} music`);
        const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: script.slice(0, MAX_CHARS_PER_REQUEST),
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: settings.stability,
                    similarity_boost: settings.similarity,
                    style: 0,
                    use_speaker_boost: true,
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`Voice-over generation failed: ${response.status}`);
        }
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        // Estimate duration based on word count and pacing
        const wordCount = script.trim().split(/\s+/).length;
        const wordsPerMinute = pacing === 'slow' ? 120 : pacing === 'fast' ? 180 : 150;
        const estimatedDuration = Math.ceil(wordCount / wordsPerMinute * 60);
        res.json({
            success: true,
            audioUrl,
            format: 'mp3',
            duration: estimatedDuration,
            voice: selectedVoice,
            voiceDescription: voice.description,
            musicGenre,
            pacing,
            wordCount,
            charCount: script.length,
            mixingTips: {
                musicVolume: 'Lower music to 20-30% during voice-over',
                ducking: 'Use sidechain compression or auto-ducking',
                eq: 'Cut 200-400Hz in music to make room for voice',
                suggestedMusicBPM: musicGenre === 'calm' ? '60-80' : musicGenre === 'upbeat' ? '120-140' : '90-120',
            },
            provider: 'elevenlabs',
        });
    }
    catch (error) {
        console.error('Voice-over generation error:', error);
        res.status(500).json({ message: 'Failed to generate voice-over' });
    }
});
/**
 * GET /api/elevenlabs/music/recommendations
 * Get voice recommendations for different music genres
 */
router.get('/music/recommendations', (_req, res) => {
    const recommendations = {
        voiceForGenre: {
            upbeat: { voice: 'josh', reason: 'Energetic young voice matches high-energy music' },
            calm: { voice: 'bella', reason: 'Soft & expressive voice for meditation content' },
            corporate: { voice: 'adam', reason: 'Deep & authoritative for business presentations' },
            cinematic: { voice: 'clyde', reason: 'Deep & serious for dramatic content' },
            electronic: { voice: 'ethan', reason: 'High-energy for tech/gaming content' },
            lofi: { voice: 'sam', reason: 'Warm & engaging for chill content' },
            epic: { voice: 'arnold', reason: 'Powerful voice for grand themes' },
            inspirational: { voice: 'rachel', reason: 'Warm & perfect for motivation' },
            hiphop: { voice: 'liam', reason: 'Young ambitious voice for urban content' },
            podcast: { voice: 'brian', reason: 'Smooth conversational for podcasts' },
            ambient: { voice: 'lily', reason: 'Gentle voice for ethereal content' },
        },
        mixingSettings: {
            voiceOverMusic: {
                musicVolume: 0.25, // 25% during voice
                fadeTime: 0.5, // seconds
                duckingThreshold: -20, // dB
            },
            introOutro: {
                musicVolume: 0.8, // 80% for intros/outros
                voiceFadeIn: 1.0,
                voiceFadeOut: 1.5,
            },
        },
        soundEffectTips: [
            'Use whoosh transitions between sections',
            'Add subtle risers before key moments',
            'Use impacts to emphasize important points',
            'Layer ambient sounds under narration for depth',
        ],
    };
    res.json(recommendations);
});
/**
 * GET /api/elevenlabs/status
 * Check ElevenLabs API status and available features
 */
router.get('/status', async (_req, res) => {
    try {
        // Check subscription for features
        const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            return res.json({
                configured: true,
                connected: false,
                error: 'Could not verify API connection',
            });
        }
        const data = await response.json();
        res.json({
            configured: true,
            connected: true,
            tier: data.tier,
            features: {
                textToSpeech: true,
                soundEffects: true,
                voiceCloning: data.can_use_instant_voice_cloning || false,
                streaming: true,
            },
            usage: {
                charactersUsed: data.character_count,
                charactersLimit: data.character_limit,
                remainingPercent: Math.round((1 - data.character_count / data.character_limit) * 100),
            },
            voicesAvailable: Object.keys(ELEVENLABS_VOICES).length,
            soundEffectPresetsAvailable: Object.keys(SOUND_EFFECT_PRESETS).length,
        });
    }
    catch (error) {
        res.json({
            configured: true,
            connected: false,
            error: error.message,
        });
    }
});
// ==============================================================
// MODELS API - Access Available TTS Models
// ==============================================================
/**
 * GET /api/elevenlabs/models
 * Get all available ElevenLabs TTS models
 * Requires: Models (Read) permission
 */
router.get('/models', async (_req, res) => {
    try {
        const response = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status}`);
        }
        const models = await response.json();
        // Format models for easy consumption
        const formattedModels = models.map((model) => ({
            id: model.model_id,
            name: model.name,
            description: model.description,
            canDoTextToSpeech: model.can_do_text_to_speech,
            canDoVoiceConversion: model.can_do_voice_conversion,
            canBeFinetuned: model.can_be_finetuned,
            canUseSpeakerBoost: model.can_use_speaker_boost,
            canUseStyle: model.can_use_style,
            servesProVoices: model.serves_pro_voices,
            tokenCostFactor: model.token_cost_factor,
            languages: model.languages?.map((lang) => ({
                id: lang.language_id,
                name: lang.name,
            })) || [],
            maxCharactersRequestFreeUser: model.max_characters_request_free_user,
            maxCharactersRequestSubscribedUser: model.max_characters_request_subscribed_user,
        }));
        // Recommend models for different use cases
        const recommendations = {
            highQuality: 'eleven_multilingual_v2',
            fastSpeed: 'eleven_turbo_v2',
            englishOnly: 'eleven_monolingual_v1',
            multilingual: 'eleven_multilingual_v2',
        };
        res.json({
            success: true,
            models: formattedModels,
            recommendations,
            total: formattedModels.length,
        });
    }
    catch (error) {
        console.error('Failed to fetch ElevenLabs models:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch models',
        });
    }
});
/**
 * GET /api/elevenlabs/models/:modelId
 * Get details for a specific model
 */
router.get('/models/:modelId', async (req, res) => {
    try {
        const { modelId } = req.params;
        const response = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status}`);
        }
        const models = await response.json();
        const model = models.find((m) => m.model_id === modelId);
        if (!model) {
            return res.status(404).json({
                success: false,
                error: `Model ${modelId} not found`,
            });
        }
        res.json({
            success: true,
            model: {
                id: model.model_id,
                name: model.name,
                description: model.description,
                features: {
                    textToSpeech: model.can_do_text_to_speech,
                    voiceConversion: model.can_do_voice_conversion,
                    finetuning: model.can_be_finetuned,
                    speakerBoost: model.can_use_speaker_boost,
                    styleControl: model.can_use_style,
                },
                languages: model.languages || [],
                limits: {
                    freeUserChars: model.max_characters_request_free_user,
                    subscribedUserChars: model.max_characters_request_subscribed_user,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// ==============================================================
// HISTORY API - Monitor Usage & Generation History
// ==============================================================
/**
 * GET /api/elevenlabs/history
 * Get voice generation history
 * Requires: History (Read) permission
 */
router.get('/history', async (req, res) => {
    try {
        const pageSize = Math.min(parseInt(req.query.page_size) || 20, 100);
        const startAfterHistoryItemId = req.query.start_after;
        let url = `${ELEVENLABS_BASE_URL}/history?page_size=${pageSize}`;
        if (startAfterHistoryItemId) {
            url += `&start_after_history_item_id=${startAfterHistoryItemId}`;
        }
        const response = await fetch(url, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.status}`);
        }
        const data = await response.json();
        // Format history items
        const history = data.history.map((item) => ({
            id: item.history_item_id,
            requestId: item.request_id,
            voiceId: item.voice_id,
            voiceName: item.voice_name,
            modelId: item.model_id,
            text: item.text,
            dateCreated: item.date_unix ? new Date(item.date_unix * 1000).toISOString() : null,
            characterCount: item.character_count_change_from,
            characterCountAfter: item.character_count_change_to,
            contentType: item.content_type,
            state: item.state,
            settings: item.settings,
            feedback: item.feedback,
        }));
        // Calculate usage stats
        const totalCharacters = history.reduce((sum, item) => {
            const chars = item.characterCount || 0;
            return sum + chars;
        }, 0);
        res.json({
            success: true,
            history,
            pagination: {
                hasMore: data.has_more,
                lastHistoryItemId: data.last_history_item_id,
                pageSize,
            },
            stats: {
                itemsInPage: history.length,
                totalCharactersInPage: totalCharacters,
            },
        });
    }
    catch (error) {
        console.error('Failed to fetch ElevenLabs history:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch history',
        });
    }
});
/**
 * GET /api/elevenlabs/history/:historyItemId
 * Get a specific history item
 */
router.get('/history/:historyItemId', async (req, res) => {
    try {
        const { historyItemId } = req.params;
        const response = await fetch(`${ELEVENLABS_BASE_URL}/history/${historyItemId}`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch history item: ${response.status}`);
        }
        const item = await response.json();
        res.json({
            success: true,
            item: {
                id: item.history_item_id,
                voiceId: item.voice_id,
                voiceName: item.voice_name,
                modelId: item.model_id,
                text: item.text,
                dateCreated: item.date_unix ? new Date(item.date_unix * 1000).toISOString() : null,
                characterCount: item.character_count_change_from,
                settings: item.settings,
                state: item.state,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * GET /api/elevenlabs/history/:historyItemId/audio
 * Download audio from history
 */
router.get('/history/:historyItemId/audio', async (req, res) => {
    try {
        const { historyItemId } = req.params;
        const response = await fetch(`${ELEVENLABS_BASE_URL}/history/${historyItemId}/audio`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = audioBuffer.toString('base64');
        res.json({
            success: true,
            audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
            historyItemId,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
/**
 * DELETE /api/elevenlabs/history/:historyItemId
 * Delete a history item
 * Requires: History (Write) permission
 */
router.delete('/history/:historyItemId', async (req, res) => {
    try {
        const { historyItemId } = req.params;
        const response = await fetch(`${ELEVENLABS_BASE_URL}/history/${historyItemId}`, {
            method: 'DELETE',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to delete history item: ${response.status}`);
        }
        res.json({
            success: true,
            message: 'History item deleted',
            historyItemId,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// ==============================================================
// USER API - Subscription & Account Info
// ==============================================================
/**
 * GET /api/elevenlabs/user
 * Get current user info and subscription details
 * Requires: User (Read) permission
 */
router.get('/user', async (_req, res) => {
    try {
        const response = await fetch(`${ELEVENLABS_BASE_URL}/user`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.status}`);
        }
        const user = await response.json();
        res.json({
            success: true,
            user: {
                id: user.user_id,
                subscriptionTier: user.subscription?.tier || 'free',
                characterCount: user.subscription?.character_count || 0,
                characterLimit: user.subscription?.character_limit || 0,
                remainingCharacters: (user.subscription?.character_limit || 0) - (user.subscription?.character_count || 0),
                usagePercent: user.subscription?.character_limit
                    ? Math.round((user.subscription.character_count / user.subscription.character_limit) * 100)
                    : 0,
                nextResetDate: user.subscription?.next_character_count_reset_unix
                    ? new Date(user.subscription.next_character_count_reset_unix * 1000).toISOString()
                    : null,
                features: {
                    voiceCloning: user.subscription?.can_use_instant_voice_cloning || false,
                    professionalVoiceCloning: user.subscription?.can_use_professional_voice_cloning || false,
                    delayedProfessionalVoice: user.subscription?.can_use_delayed_professional_voice_cloning || false,
                    speakerBoost: user.subscription?.can_use_speaker_boost || true,
                    voiceLibrary: user.subscription?.available_models?.length > 0,
                },
                maxVoiceAddEdits: user.subscription?.max_voice_add_edits || 0,
                voiceLimit: user.subscription?.voice_limit || 3,
                professionalVoiceLimit: user.subscription?.professional_voice_limit || 0,
                allowedToExtendCharacterLimit: user.subscription?.allowed_to_extend_character_limit || false,
                invoicing: user.subscription?.can_extend_character_limit || false,
            },
        });
    }
    catch (error) {
        console.error('Failed to fetch ElevenLabs user:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch user info',
        });
    }
});
/**
 * GET /api/elevenlabs/user/subscription
 * Get detailed subscription information
 */
router.get('/user/subscription', async (_req, res) => {
    try {
        const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch subscription: ${response.status}`);
        }
        const sub = await response.json();
        res.json({
            success: true,
            subscription: {
                tier: sub.tier,
                status: sub.status,
                billing: {
                    currency: sub.currency,
                    nextInvoiceAmount: sub.next_invoice?.amount_due_cents
                        ? (sub.next_invoice.amount_due_cents / 100).toFixed(2)
                        : null,
                    nextInvoiceDate: sub.next_invoice?.next_payment_attempt_unix
                        ? new Date(sub.next_invoice.next_payment_attempt_unix * 1000).toISOString()
                        : null,
                },
                usage: {
                    charactersUsed: sub.character_count,
                    charactersLimit: sub.character_limit,
                    remainingCharacters: sub.character_limit - sub.character_count,
                    usagePercent: Math.round((sub.character_count / sub.character_limit) * 100),
                    resetDate: sub.next_character_count_reset_unix
                        ? new Date(sub.next_character_count_reset_unix * 1000).toISOString()
                        : null,
                },
                limits: {
                    maxVoiceAddEdits: sub.max_voice_add_edits,
                    voiceLimit: sub.voice_limit,
                    professionalVoiceLimit: sub.professional_voice_limit,
                },
                features: {
                    instantVoiceCloning: sub.can_use_instant_voice_cloning,
                    professionalVoiceCloning: sub.can_use_professional_voice_cloning,
                    speakerBoost: sub.can_use_speaker_boost,
                    extendCharacterLimit: sub.allowed_to_extend_character_limit,
                },
                availableModels: sub.available_models || [],
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// ==============================================================
// ADMIN DASHBOARD STATS - Combined Usage Overview
// ==============================================================
/**
 * GET /api/elevenlabs/admin/stats
 * Get comprehensive stats for admin dashboard
 * Combines user, subscription, and history data
 */
router.get('/admin/stats', async (_req, res) => {
    try {
        // Fetch user/subscription data
        const userResponse = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        // Fetch recent history
        const historyResponse = await fetch(`${ELEVENLABS_BASE_URL}/history?page_size=50`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        // Fetch models
        const modelsResponse = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
            },
        });
        if (!userResponse.ok) {
            throw new Error('Failed to fetch subscription data');
        }
        const sub = await userResponse.json();
        const history = historyResponse.ok ? await historyResponse.json() : { history: [] };
        const models = modelsResponse.ok ? await modelsResponse.json() : [];
        // Calculate history stats
        const recentGenerations = history.history || [];
        const totalCharsToday = recentGenerations
            .filter((item) => {
            const itemDate = new Date(item.date_unix * 1000);
            const today = new Date();
            return itemDate.toDateString() === today.toDateString();
        })
            .reduce((sum, item) => sum + (item.character_count_change_from || 0), 0);
        // Group by voice
        const voiceUsage = {};
        recentGenerations.forEach((item) => {
            const voice = item.voice_name || 'Unknown';
            voiceUsage[voice] = (voiceUsage[voice] || 0) + (item.character_count_change_from || 0);
        });
        // Group by model
        const modelUsage = {};
        recentGenerations.forEach((item) => {
            const model = item.model_id || 'Unknown';
            modelUsage[model] = (modelUsage[model] || 0) + 1;
        });
        // Calculate estimated cost
        const estimatedCostPerChar = 0.00003; // ~$0.03 per 1000 chars
        const estimatedMonthlyCost = sub.character_count * estimatedCostPerChar;
        res.json({
            success: true,
            stats: {
                subscription: {
                    tier: sub.tier,
                    status: sub.status || 'active',
                },
                usage: {
                    charactersUsed: sub.character_count,
                    charactersLimit: sub.character_limit,
                    remainingCharacters: sub.character_limit - sub.character_count,
                    usagePercent: Math.round((sub.character_count / sub.character_limit) * 100),
                    resetDate: sub.next_character_count_reset_unix
                        ? new Date(sub.next_character_count_reset_unix * 1000).toISOString()
                        : null,
                    daysUntilReset: sub.next_character_count_reset_unix
                        ? Math.ceil((sub.next_character_count_reset_unix * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
                        : null,
                },
                today: {
                    charactersUsed: totalCharsToday,
                    generationCount: recentGenerations.filter((item) => {
                        const itemDate = new Date(item.date_unix * 1000);
                        const today = new Date();
                        return itemDate.toDateString() === today.toDateString();
                    }).length,
                },
                costs: {
                    estimatedMonthlyCost: `$${estimatedMonthlyCost.toFixed(2)}`,
                    costPerChar: estimatedCostPerChar,
                    budgetRemaining: `$${((sub.character_limit - sub.character_count) * estimatedCostPerChar).toFixed(2)}`,
                },
                breakdown: {
                    byVoice: Object.entries(voiceUsage)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([voice, chars]) => ({ voice, characters: chars })),
                    byModel: Object.entries(modelUsage)
                        .map(([model, count]) => ({ model, generations: count })),
                },
                features: {
                    instantVoiceCloning: sub.can_use_instant_voice_cloning,
                    professionalVoiceCloning: sub.can_use_professional_voice_cloning,
                    speakerBoost: sub.can_use_speaker_boost,
                },
                availableModels: models.length,
                recentGenerations: recentGenerations.length,
            },
        });
    }
    catch (error) {
        console.error('Failed to fetch ElevenLabs admin stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch admin stats',
        });
    }
});
exports.default = router;
