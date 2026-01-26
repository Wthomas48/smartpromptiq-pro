"use strict";
/**
 * Unified Audio Generation API
 *
 * Complete pipeline for AI speech/music generation:
 * 1. Generate audio via ElevenLabs (premium) or OpenAI TTS (standard)
 * 2. Upload to Supabase Storage
 * 3. Return signed streaming URL
 *
 * Endpoints:
 * - POST /api/audio/generate-speech - Generate AI speech
 * - POST /api/audio/generate-music - Generate AI music (future)
 * - GET /api/audio/refresh-url - Refresh expired signed URL
 * - GET /api/audio/files - List user's audio files
 * - DELETE /api/audio/:fileId - Delete audio file
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
const storageService_1 = require("../services/storageService");
const costs_1 = require("../config/costs");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Initialize OpenAI client (lazy initialization to prevent startup crashes)
let openai = null;
const getOpenAIClient = () => {
    if (!openai) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.includes('REPLACE') || apiKey === 'sk-proj-REPLACE_WITH_YOUR_OPENAI_API_KEY') {
            throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.');
        }
        openai = new openai_1.default({ apiKey });
    }
    return openai;
};
// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
// ElevenLabs premium voices
const ELEVENLABS_VOICES = {
    'rachel': { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
    'adam': { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
    'antoni': { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
    'bella': { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
    'josh': { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
    'sam': { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam' },
    'charlotte': { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
    'brian': { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian' },
};
// OpenAI TTS voices
const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Log API cost for tracking
 */
async function logApiCost(userId, provider, action, cost, tokensUsed, model) {
    try {
        // Use type assertion to handle potential Prisma client mismatch
        await prisma.usageLog.create({
            data: {
                userId: userId || 'anonymous',
                tokensConsumed: tokensUsed,
                provider,
                model,
                category: action,
                cost,
                responseTime: 0,
                metadata: JSON.stringify({ feature: action, provider }),
            }, // Type assertion for flexibility with schema variations
        });
        if (costs_1.COST_CONTROL_FLAGS.logAllAPICosts) {
            console.log(`💰 ${provider} Cost: $${cost.toFixed(4)} | Tokens: ${tokensUsed} | Model: ${model}`);
        }
    }
    catch (error) {
        console.error('Failed to log API cost:', error);
    }
}
/**
 * Generate speech using ElevenLabs API
 */
async function generateWithElevenLabs(text, voiceName, model, settings) {
    if (!ELEVENLABS_API_KEY) {
        return { error: 'ElevenLabs API key not configured' };
    }
    const voice = ELEVENLABS_VOICES[voiceName.toLowerCase()] || ELEVENLABS_VOICES['rachel'];
    try {
        const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text,
                model_id: model || 'eleven_multilingual_v2',
                voice_settings: {
                    stability: settings?.stability ?? 0.5,
                    similarity_boost: settings?.similarity_boost ?? 0.75,
                    style: settings?.style ?? 0,
                    use_speaker_boost: true,
                },
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            return { error: `ElevenLabs API error: ${response.status}` };
        }
        const arrayBuffer = await response.arrayBuffer();
        return {
            buffer: Buffer.from(arrayBuffer),
            format: 'mp3',
        };
    }
    catch (error) {
        console.error('ElevenLabs generation error:', error);
        return { error: error.message || 'ElevenLabs generation failed' };
    }
}
/**
 * Generate speech using OpenAI TTS API
 */
async function generateWithOpenAI(text, voice, settings) {
    try {
        const response = await getOpenAIClient().audio.speech.create({
            model: 'tts-1-hd',
            voice,
            input: text,
            response_format: 'mp3',
            speed: settings?.speed || 1.0,
        });
        const arrayBuffer = await response.arrayBuffer();
        return {
            buffer: Buffer.from(arrayBuffer),
            format: 'mp3',
        };
    }
    catch (error) {
        console.error('OpenAI TTS error:', error);
        return { error: error.message || 'OpenAI TTS generation failed' };
    }
}
// ============================================================================
// API ENDPOINTS
// ============================================================================
/**
 * POST /api/audio/generate-speech
 *
 * Generate AI speech and optionally store in Supabase
 *
 * Request body:
 * - text: string (required) - Text to convert to speech
 * - provider: 'elevenlabs' | 'openai' (default: 'openai')
 * - voice: string (voice name)
 * - model: string (model ID for ElevenLabs)
 * - settings: object (voice settings)
 * - storeInCloud: boolean (default: true) - Store in Supabase and return signed URL
 * - category: string (for organization)
 *
 * Response:
 * - success: boolean
 * - audioUrl: string (signed URL or base64)
 * - isStreamingUrl: boolean
 * - fileId, filePath, expiresIn (if stored)
 * - format, duration, provider, voice, tokensUsed, charCount
 */
router.post('/generate-speech', async (req, res) => {
    try {
        const { text, provider = 'openai', voice = provider === 'elevenlabs' ? 'rachel' : 'nova', model = 'eleven_multilingual_v2', settings = {}, storeInCloud = true, category = 'voice', } = req.body;
        // Validate input
        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Text is required',
            });
        }
        const maxChars = 5000;
        if (text.length > maxChars) {
            return res.status(400).json({
                success: false,
                error: `Text too long. Maximum ${maxChars} characters allowed.`,
            });
        }
        // Get user ID from request (if authenticated)
        const userId = req.userId || null;
        console.log(`🎙️ Generating speech: provider=${provider}, voice=${voice}, chars=${text.length}`);
        // Generate audio based on provider
        let audioResult;
        if (provider === 'elevenlabs') {
            audioResult = await generateWithElevenLabs(text, voice, model, settings);
        }
        else {
            // Validate OpenAI voice
            const openaiVoice = OPENAI_VOICES.includes(voice)
                ? voice
                : 'nova';
            audioResult = await generateWithOpenAI(text, openaiVoice, settings);
        }
        // Check for generation error
        if ('error' in audioResult) {
            return res.status(500).json({
                success: false,
                error: audioResult.error,
            });
        }
        const { buffer: audioBuffer, format } = audioResult;
        // Calculate metrics
        const tokenCost = Math.ceil(text.length / 100) * 10;
        const wordCount = text.trim().split(/\s+/).length;
        const estimatedDuration = Math.ceil(wordCount / 150 * 60);
        // Calculate and log API cost
        const actualAPICost = provider === 'elevenlabs'
            ? (text.length / 1000) * 0.03 // ElevenLabs pricing
            : (text.length / 1000000) * (costs_1.API_COSTS.openai['tts-1-hd'] || 30); // OpenAI pricing
        await logApiCost(userId, provider, 'speech', actualAPICost, tokenCost, model);
        // Response object
        const response = {
            success: true,
            audioUrl: '',
            isStreamingUrl: false,
            format,
            duration: estimatedDuration,
            provider,
            voice,
            tokensUsed: tokenCost,
            charCount: text.length,
        };
        // Either store in Supabase or return as base64
        if (storeInCloud) {
            const uploadResult = await (0, storageService_1.uploadAudioToStorage)(audioBuffer, {
                userId: userId || undefined,
                category: 'voice',
                format: 'mp3',
            });
            if (uploadResult.success) {
                response.audioUrl = uploadResult.signedUrl;
                response.isStreamingUrl = true;
                response.fileId = uploadResult.fileId;
                response.filePath = uploadResult.filePath;
                response.expiresIn = uploadResult.expiresIn;
                console.log(`✅ Speech generated and stored: ${uploadResult.fileId}`);
            }
            else {
                // Fallback to base64 if upload fails
                console.warn('⚠️ Cloud storage failed, returning base64:', uploadResult.error);
                response.audioUrl = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
                response.error = `Storage upload failed: ${uploadResult.error}. Returning base64 instead.`;
            }
        }
        else {
            // Return as base64 data URL
            response.audioUrl = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
        }
        // Update user tokens if authenticated
        if (userId) {
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        tokenBalance: { decrement: tokenCost },
                        tokensUsed: { increment: tokenCost },
                    },
                });
                // Get or create a default project for the user
                let project = await prisma.project.findFirst({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                });
                if (!project) {
                    project = await prisma.project.create({
                        data: {
                            userId,
                            title: 'Audio Generations',
                            description: 'Auto-generated project for audio content',
                            category: 'voice',
                        },
                    });
                }
                await prisma.generation.create({
                    data: {
                        userId,
                        projectId: project.id,
                        prompt: text.slice(0, 500),
                        response: `Speech generated: ${provider}/${voice}, ${text.length} chars`,
                        model: provider === 'elevenlabs' ? model : 'tts-1-hd',
                        category: category || 'voice',
                        tokenCount: tokenCost,
                    },
                });
            }
            catch (err) {
                console.warn('Failed to update user tokens:', err);
            }
        }
        res.json(response);
    }
    catch (error) {
        console.error('Speech generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Speech generation failed',
        });
    }
});
/**
 * POST /api/audio/refresh-url
 *
 * Refresh a signed URL that has expired
 *
 * Request body:
 * - filePath: string (required) - Path to the file in storage
 * - expiresIn: number (optional) - Expiration time in seconds
 */
router.post('/refresh-url', async (req, res) => {
    try {
        const { filePath, expiresIn = 600 } = req.body; // Default 10 minutes
        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: 'filePath is required',
            });
        }
        const result = await (0, storageService_1.refreshSignedUrl)(filePath, 'voice-output', expiresIn);
        if (result.error) {
            return res.status(500).json({
                success: false,
                error: result.error,
            });
        }
        res.json({
            success: true,
            signedUrl: result.signedUrl,
            expiresIn,
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
 * GET /api/audio/files
 *
 * List audio files for the authenticated user
 */
router.get('/files', async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }
        const category = req.query.category || 'voice';
        const limit = parseInt(req.query.limit) || 50;
        const result = await (0, storageService_1.listUserAudioFiles)(userId, category, limit);
        if (result.error) {
            return res.status(500).json({
                success: false,
                error: result.error,
            });
        }
        res.json({
            success: true,
            files: result.files,
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
 * DELETE /api/audio/:filePath
 *
 * Delete an audio file
 */
router.delete('/:filePath(*)', async (req, res) => {
    try {
        const { filePath } = req.params;
        const userId = req.userId;
        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: 'filePath is required',
            });
        }
        // Verify user owns this file (file path should contain their user ID)
        if (userId && !filePath.includes(userId)) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this file',
            });
        }
        const result = await (0, storageService_1.deleteAudioFromStorage)(filePath);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
            });
        }
        res.json({
            success: true,
            message: 'File deleted successfully',
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
 * GET /api/audio/voices
 *
 * Get available voices for each provider
 */
router.get('/voices', async (req, res) => {
    res.json({
        success: true,
        providers: {
            openai: {
                voices: OPENAI_VOICES,
                model: 'tts-1-hd',
                description: 'High-quality standard voices',
            },
            elevenlabs: {
                voices: Object.keys(ELEVENLABS_VOICES),
                models: ['eleven_multilingual_v2', 'eleven_turbo_v2'],
                description: 'Premium ultra-realistic voices',
            },
        },
    });
});
/**
 * GET /api/audio/proxy
 *
 * Proxy external audio files to avoid CORS issues
 * Used for mixing audio in the browser when external sources don't support CORS
 *
 * Query params:
 * - url: string (required) - The external audio URL to fetch
 */
router.get('/proxy', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'URL parameter is required',
            });
        }
        // Validate URL - only allow specific trusted domains for security
        const allowedDomains = [
            'www.soundhelix.com',
            'soundhelix.com',
            'files.freemusicarchive.org',
            'freemusicarchive.org',
            'incompetech.com',
            'www.incompetech.com',
        ];
        let urlObj;
        try {
            urlObj = new URL(url);
        }
        catch {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format',
            });
        }
        if (!allowedDomains.includes(urlObj.hostname)) {
            return res.status(403).json({
                success: false,
                error: 'Domain not allowed for audio proxy',
            });
        }
        console.log(`🎵 Audio proxy: fetching ${url}`);
        // Fetch the audio from external source
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'SmartPromptIQ/1.0',
                'Accept': 'audio/*',
            },
        });
        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                error: `Failed to fetch audio: ${response.status} ${response.statusText}`,
            });
        }
        // Get content type
        const contentType = response.headers.get('content-type') || 'audio/mpeg';
        const contentLength = response.headers.get('content-length');
        // Set response headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        if (contentLength) {
            res.setHeader('Content-Length', contentLength);
        }
        // Stream the audio data
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    }
    catch (error) {
        console.error('Audio proxy error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to proxy audio',
        });
    }
});
/**
 * OPTIONS /api/audio/proxy
 *
 * Handle CORS preflight for audio proxy
 */
router.options('/proxy', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.status(204).send();
});
exports.default = router;
