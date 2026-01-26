"use strict";
/**
 * Music Generation API Routes
 *
 * Phase 2 Implementation:
 * - Generate music via Suno API or AI Music API
 * - Upload generated audio to Supabase Storage (music-output bucket)
 * - Return signed URL with 10-minute expiry
 * - No local file storage
 *
 * Endpoints:
 * - POST /api/music - Primary music generation with cloud storage
 * - POST /api/music/generate - Legacy endpoint (backwards compatible)
 * - GET /api/music/genres - List available genres
 * - GET /api/music/status/:trackId - Check async generation status
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const costs_1 = require("../config/costs");
const musicService_1 = require("../services/musicService");
const supabase_1 = require("../lib/supabase");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Cost tracking helper - logs actual API costs for admin dashboard
async function logMusicCost(userId, action, cost, tokensUsed, model) {
    try {
        await prisma.usageLog.create({
            data: {
                userId: userId || 'anonymous',
                action: `music:${action}`,
                tokensUsed,
                cost,
                provider: 'suno',
                model,
                responseTime: 0,
                metadata: JSON.stringify({ feature: action }),
            },
        });
        if (costs_1.COST_CONTROL_FLAGS.logAllAPICosts) {
            console.log(`💰 Music Cost: $${cost.toFixed(4)} | Tokens: ${tokensUsed} | Model: ${model} | Action: ${action}`);
        }
    }
    catch (error) {
        console.error('Failed to log music cost:', error);
    }
}
// AI Music API Configuration (Suno-powered via aimusicapi.ai)
const AI_MUSIC_API_URL = process.env.AI_MUSIC_API_URL || 'https://api.aimusicapi.ai/v1';
const AI_MUSIC_API_KEY = process.env.AI_MUSIC_API_KEY;
// Token costs for music generation
const MUSIC_TOKEN_COSTS = {
    song_with_vocals: 100, // Full song with AI vocals
    instrumental: 75, // Instrumental track
    jingle: 50, // Short jingle (15-30s)
    sound_effect_pack: 25, // Pack of sound effects
    stem_separation: 30, // Separate vocals/instruments
    music_extension: 40, // Extend existing track
};
// Music generation models
const MUSIC_MODELS = {
    chirp_v4: 'chirp-v4', // Latest Suno model
    producer: 'producer', // FUZZ-2.0 for instrumentals
    nuro: 'nuro', // Alternative model
};
// Genre presets with style descriptions - ENHANCED
const GENRE_PRESETS = {
    upbeat: {
        style: 'upbeat, energetic, motivational, inspiring, positive vibes, feel-good',
        bpm: '120-140',
        instruments: 'electronic drums, synths, piano, bass, claps',
        mood: 'happy, excited, triumphant',
    },
    calm: {
        style: 'calm, relaxing, peaceful, ambient, meditation, spa, zen',
        bpm: '60-80',
        instruments: 'soft piano, strings, gentle pads, nature sounds, acoustic guitar',
        mood: 'serene, tranquil, soothing',
    },
    corporate: {
        style: 'corporate, professional, business, inspiring, modern tech, startup',
        bpm: '100-120',
        instruments: 'clean guitars, light drums, piano, subtle synths, acoustic elements',
        mood: 'confident, innovative, forward-thinking',
    },
    cinematic: {
        style: 'cinematic, epic, dramatic, orchestral, movie trailer, hollywood',
        bpm: '80-120',
        instruments: 'full orchestra, brass, strings, timpani, choir, percussion',
        mood: 'epic, emotional, powerful',
    },
    playful: {
        style: 'playful, fun, cheerful, kids, cartoon, happy, whimsical',
        bpm: '110-130',
        instruments: 'ukulele, whistles, xylophone, light percussion, pizzicato strings',
        mood: 'joyful, carefree, innocent',
    },
    electronic: {
        style: 'electronic, EDM, techno, future bass, synth-wave, cyberpunk',
        bpm: '125-150',
        instruments: 'synthesizers, drum machines, bass drops, arpeggios, vocoders',
        mood: 'futuristic, energetic, hypnotic',
    },
    hiphop: {
        style: 'hip-hop, trap, rap beat, urban, 808s, boom bap',
        bpm: '70-90',
        instruments: '808 bass, hi-hats, snares, samples, vinyl scratches',
        mood: 'confident, street, rhythmic',
    },
    rock: {
        style: 'rock, alternative, indie, guitar-driven, powerful, grunge',
        bpm: '100-140',
        instruments: 'electric guitars, drums, bass, distortion, power chords',
        mood: 'rebellious, intense, raw',
    },
    jazz: {
        style: 'jazz, smooth, lounge, sophisticated, instrumental, swing',
        bpm: '80-120',
        instruments: 'saxophone, piano, upright bass, brushed drums, trumpet',
        mood: 'sophisticated, laid-back, classy',
    },
    lofi: {
        style: 'lo-fi, chill hop, study music, relaxing beats, nostalgic',
        bpm: '70-90',
        instruments: 'vinyl crackle, soft piano, mellow drums, ambient pads, tape hiss',
        mood: 'nostalgic, cozy, introspective',
    },
    rnb: {
        style: 'R&B, soul, smooth, groovy, sensual, neo-soul',
        bpm: '70-100',
        instruments: 'smooth bass, rhodes piano, soft drums, strings, harmonies',
        mood: 'romantic, smooth, soulful',
    },
    country: {
        style: 'country, americana, folk, acoustic, heartland',
        bpm: '90-120',
        instruments: 'acoustic guitar, banjo, fiddle, pedal steel, harmonica',
        mood: 'nostalgic, storytelling, authentic',
    },
    reggae: {
        style: 'reggae, dub, caribbean, laid-back, island vibes',
        bpm: '60-90',
        instruments: 'skank guitar, bass, drums, organ, horns',
        mood: 'relaxed, positive, tropical',
    },
    classical: {
        style: 'classical, orchestral, baroque, romantic, symphony',
        bpm: '60-120',
        instruments: 'full orchestra, strings, woodwinds, brass, piano',
        mood: 'elegant, timeless, sophisticated',
    },
    ambient: {
        style: 'ambient, atmospheric, drone, soundscape, ethereal',
        bpm: '50-80',
        instruments: 'pads, textures, field recordings, reverb, delays',
        mood: 'meditative, spacious, dreamy',
    },
    funk: {
        style: 'funk, groove, disco, retro, dance, boogie',
        bpm: '100-130',
        instruments: 'slap bass, wah guitar, horns, clavinet, drums',
        mood: 'groovy, danceable, party',
    },
    metal: {
        style: 'metal, heavy, aggressive, intense, powerful',
        bpm: '120-180',
        instruments: 'heavy guitars, double bass drums, bass, screams',
        mood: 'aggressive, powerful, intense',
    },
    world: {
        style: 'world music, ethnic, global, cultural, fusion',
        bpm: '80-120',
        instruments: 'traditional instruments, percussion, flutes, strings',
        mood: 'cultural, exotic, spiritual',
    },
    synthwave: {
        style: 'synthwave, retrowave, 80s, neon, outrun, vaporwave',
        bpm: '100-130',
        instruments: 'analog synths, arpeggios, gated reverb, drum machines',
        mood: 'nostalgic, futuristic, dreamy',
    },
    podcast: {
        style: 'podcast intro, talk show, interview, radio, broadcast',
        bpm: '90-110',
        instruments: 'subtle synths, light percussion, acoustic elements',
        mood: 'professional, welcoming, engaging',
    },
};
// =============================================================================
// PHASE 2 ENDPOINT: POST /api/music
// =============================================================================
/**
 * POST /api/music
 *
 * Primary endpoint for music generation with Supabase Storage
 *
 * Request body:
 * - prompt: string (required) - Description of the music to generate
 * - genre: string - Genre preset (upbeat, calm, corporate, cinematic, etc.)
 * - mood: string - Additional mood description
 * - tempo: 'slow' | 'medium' | 'fast' - Tempo preference
 * - duration: number - Duration in seconds (default: 30)
 * - instrumental: boolean - Generate instrumental only (default: true)
 * - lyrics: string - Custom lyrics (if instrumental is false)
 *
 * Response:
 * {
 *   "success": true,
 *   "audioUrl": "https://...supabase.co/storage/v1/object/sign/music-output/...",
 *   "isSignedUrl": true,
 *   "expiresIn": 600,
 *   "filePath": "2024-12-14/1702567890123-music.mp3",
 *   "title": "Energetic Upbeat",
 *   "duration": 30,
 *   "genre": "upbeat",
 *   "provider": "suno",
 *   "tokensUsed": 75
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { prompt, genre = 'upbeat', mood, tempo = 'medium', duration = 30, instrumental = true, lyrics, } = req.body;
        // ==========================================================================
        // INPUT VALIDATION
        // ==========================================================================
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required and must be a string',
            });
        }
        if (prompt.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Prompt must be at least 3 characters',
            });
        }
        if (duration < 5 || duration > 300) {
            return res.status(400).json({
                success: false,
                error: 'Duration must be between 5 and 300 seconds',
            });
        }
        // Get user ID if authenticated
        const userId = req.user?.id || null;
        // Calculate token cost
        const tokenCost = !instrumental
            ? MUSIC_TOKEN_COSTS.song_with_vocals
            : duration <= 30
                ? MUSIC_TOKEN_COSTS.jingle
                : MUSIC_TOKEN_COSTS.instrumental;
        // Check user token balance if authenticated
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { tokenBalance: true },
            });
            if (!user || user.tokenBalance < tokenCost) {
                return res.status(403).json({
                    success: false,
                    error: `Insufficient tokens. Required: ${tokenCost}, Available: ${user?.tokenBalance || 0}`,
                });
            }
        }
        console.log(`🎵 Phase 2 Music Generation: genre=${genre}, duration=${duration}s, instrumental=${instrumental}`);
        // ==========================================================================
        // GENERATE MUSIC WITH CLOUD STORAGE
        // ==========================================================================
        const params = {
            prompt,
            genre,
            mood,
            tempo,
            duration,
            instrumental,
            lyrics,
        };
        const result = await (0, musicService_1.generateMusicWithCloudStorage)(params);
        // Check for generation error
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error || 'Music generation failed',
            });
        }
        // ==========================================================================
        // UPDATE USER TOKENS & LOG COST
        // ==========================================================================
        if (userId && !result.isDemo) {
            try {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        tokenBalance: { decrement: tokenCost },
                        tokensUsed: { increment: tokenCost },
                    },
                });
                // Log usage (using usageLog model)
                await prisma.usageLog.create({
                    data: {
                        userId,
                        action: 'music_generation',
                        tokensUsed: tokenCost,
                        provider: 'music',
                        model: 'suno',
                        cost: 0,
                        responseTime: 0,
                        metadata: JSON.stringify({
                            genre,
                            duration,
                            instrumental,
                            prompt: prompt.substring(0, 100),
                        }),
                    },
                });
            }
            catch (err) {
                console.warn('⚠️ Failed to update user tokens:', err);
            }
        }
        // Log API cost
        const actualAPICost = !instrumental
            ? costs_1.API_COSTS.suno?.['song-full'] || 0.05
            : costs_1.API_COSTS.suno?.['song-instrumental'] || 0.03;
        await logMusicCost(userId, instrumental ? 'instrumental' : 'song-full', result.isDemo ? 0 : actualAPICost, tokenCost, result.provider || 'unknown');
        console.log(`✅ Music generation complete: ${result.title}`);
        // ==========================================================================
        // RETURN RESPONSE
        // ==========================================================================
        res.json({
            success: true,
            audioUrl: result.audioUrl || result.signedUrl,
            isSignedUrl: result.isSignedUrl || false,
            expiresIn: result.expiresIn || supabase_1.SIGNED_URL_EXPIRY_SECONDS,
            filePath: result.filePath,
            trackId: result.trackId,
            title: result.title,
            duration: result.duration || duration,
            genre,
            provider: result.provider,
            tokensUsed: result.isDemo ? 0 : tokenCost,
            isDemo: result.isDemo || false,
            ...(result.error && { warning: result.error }),
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('❌ Music generation error:', errorMessage);
        res.status(500).json({
            success: false,
            error: `Music generation failed: ${errorMessage}`,
        });
    }
});
// =============================================================================
// LEGACY ENDPOINT (backwards compatibility)
// =============================================================================
/**
 * POST /api/music/generate
 * Generate AI music from text prompt (legacy endpoint)
 */
router.post('/generate', async (req, res) => {
    try {
        const { prompt, genre = 'upbeat', duration = 60, withVocals = false, customLyrics, mood, style, purpose = 'full_track', } = req.body;
        // Get user from auth token (if authenticated)
        const userId = req.user?.id;
        // Validate input
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a descriptive prompt for music generation (at least 3 characters)',
            });
        }
        // Check if API key is configured
        if (!AI_MUSIC_API_KEY) {
            console.warn('⚠️ AI Music API key not configured - using demo mode');
            // Return a demo response with sample tracks
            return res.json({
                success: true,
                trackId: `demo-${Date.now()}`,
                audioUrl: getDemoTrackUrl(genre, purpose),
                duration,
                title: generateTrackTitle(prompt, genre),
                tokensUsed: 0,
                status: 'completed',
                message: 'Demo mode - Configure AI_MUSIC_API_KEY for real AI generation',
                isDemo: true,
            });
        }
        // Calculate token cost
        const tokenCost = withVocals
            ? MUSIC_TOKEN_COSTS.song_with_vocals
            : purpose === 'intro_jingle'
                ? MUSIC_TOKEN_COSTS.jingle
                : MUSIC_TOKEN_COSTS.instrumental;
        // Check user's token balance if authenticated
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { tokenBalance: true },
            });
            if (!user || user.tokenBalance < tokenCost) {
                return res.status(403).json({
                    success: false,
                    message: `Insufficient tokens. This generation requires ${tokenCost} tokens.`,
                    required: tokenCost,
                    available: user?.tokenBalance || 0,
                });
            }
        }
        // Build the music generation prompt
        const genrePreset = GENRE_PRESETS[genre] || GENRE_PRESETS.upbeat;
        const fullPrompt = buildMusicPrompt({
            userPrompt: prompt,
            genre,
            genrePreset,
            mood,
            style,
            duration,
            purpose,
            withVocals,
            customLyrics,
        });
        console.log(`🎵 Generating music: "${prompt}" | Genre: ${genre} | Duration: ${duration}s | Vocals: ${withVocals}`);
        // Call AI Music API
        const response = await axios_1.default.post(`${AI_MUSIC_API_URL}/suno/create`, {
            custom_mode: true,
            gpt_description_prompt: fullPrompt,
            make_instrumental: !withVocals,
            mv: MUSIC_MODELS.chirp_v4,
            ...(customLyrics && withVocals && { prompt: customLyrics }),
        }, {
            headers: {
                'Authorization': `Bearer ${AI_MUSIC_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 120000, // 2 minute timeout for generation
        });
        const data = response.data;
        // Deduct tokens if user is authenticated
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    tokenBalance: { decrement: tokenCost },
                    tokensUsed: { increment: tokenCost },
                },
            });
            // Log usage (using usageLog model)
            await prisma.usageLog.create({
                data: {
                    userId,
                    action: 'music_generation_legacy',
                    tokensUsed: tokenCost,
                    provider: 'music',
                    model: 'suno',
                    cost: 0,
                    responseTime: 0,
                    metadata: JSON.stringify({
                        genre,
                        duration,
                        withVocals,
                        purpose,
                        prompt: prompt.substring(0, 100),
                    }),
                },
            });
        }
        // Calculate and log actual API cost
        const actualAPICost = withVocals
            ? costs_1.API_COSTS.suno['song-full']
            : purpose === 'intro_jingle'
                ? costs_1.API_COSTS.suno['jingle']
                : costs_1.API_COSTS.suno['song-instrumental'];
        await logMusicCost(userId, withVocals ? 'song-full' : 'instrumental', actualAPICost, tokenCost, 'chirp-v4');
        // Return success response
        const result = {
            success: true,
            trackId: data.id || data.taskId || `track-${Date.now()}`,
            audioUrl: data.audioUrl || data.audio_url || data.data?.[0]?.audio_url,
            duration,
            title: generateTrackTitle(prompt, genre),
            tokensUsed: tokenCost,
            status: data.status === 'complete' ? 'completed' : 'processing',
            message: 'Music generated successfully!',
        };
        console.log(`✅ Music generated: ${result.trackId}`);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Music generation error:', error.response?.data || error.message);
        // If API fails, return demo track as fallback
        const { genre = 'upbeat', purpose = 'full_track' } = req.body;
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || 'Music generation failed. Please try again.',
            fallbackUrl: getDemoTrackUrl(genre, purpose),
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * GET /api/music/status/:trackId
 * Check status of music generation
 */
router.get('/status/:trackId', async (req, res) => {
    try {
        const { trackId } = req.params;
        if (!AI_MUSIC_API_KEY) {
            return res.json({
                trackId,
                status: 'completed',
                audioUrl: getDemoTrackUrl('upbeat', 'full_track'),
                isDemo: true,
            });
        }
        const response = await axios_1.default.get(`${AI_MUSIC_API_URL}/suno/task/${trackId}`, {
            headers: {
                'Authorization': `Bearer ${AI_MUSIC_API_KEY}`,
            },
        });
        res.json({
            trackId,
            status: response.data.status,
            audioUrl: response.data.audio_url,
            progress: response.data.progress || 100,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check generation status',
        });
    }
});
/**
 * GET /api/music/genres
 * Get available music genres and their descriptions
 */
router.get('/genres', (_req, res) => {
    const genres = Object.entries(GENRE_PRESETS).map(([id, preset]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
        style: preset.style,
        bpm: preset.bpm,
        instruments: preset.instruments,
    }));
    res.json({ genres });
});
/**
 * POST /api/music/extend
 * Extend an existing track
 */
router.post('/extend', async (req, res) => {
    try {
        const { trackId, additionalDuration = 30 } = req.body;
        if (!trackId) {
            return res.status(400).json({ success: false, message: 'Track ID is required' });
        }
        if (!AI_MUSIC_API_KEY) {
            return res.json({
                success: true,
                message: 'Extension queued (demo mode)',
                isDemo: true,
            });
        }
        const response = await axios_1.default.post(`${AI_MUSIC_API_URL}/suno/extend`, {
            audio_id: trackId,
            extend_seconds: additionalDuration,
        }, {
            headers: {
                'Authorization': `Bearer ${AI_MUSIC_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        res.json({
            success: true,
            newTrackId: response.data.id,
            message: `Track extended by ${additionalDuration} seconds`,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to extend track',
        });
    }
});
/**
 * POST /api/music/stems
 * Separate track into stems (vocals, drums, bass, etc.)
 */
router.post('/stems', async (req, res) => {
    try {
        const { audioUrl } = req.body;
        if (!audioUrl) {
            return res.status(400).json({ success: false, message: 'Audio URL is required' });
        }
        if (!AI_MUSIC_API_KEY) {
            return res.json({
                success: true,
                message: 'Stem separation queued (demo mode)',
                stems: {
                    vocals: audioUrl,
                    drums: audioUrl,
                    bass: audioUrl,
                    other: audioUrl,
                },
                isDemo: true,
            });
        }
        const response = await axios_1.default.post(`${AI_MUSIC_API_URL}/stem/separate`, { audio_url: audioUrl }, {
            headers: {
                'Authorization': `Bearer ${AI_MUSIC_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        res.json({
            success: true,
            stems: response.data.stems,
            message: 'Stem separation complete',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to separate stems',
        });
    }
});
/**
 * GET /api/music/samples
 * Get sample/demo tracks for each genre
 * Note: Audio is generated client-side using Web Audio API for reliability
 */
router.get('/samples', (_req, res) => {
    // Sample tracks - audio is generated client-side for each genre
    const samples = [
        {
            id: 'sample-upbeat',
            name: 'Rise & Shine',
            genre: 'upbeat',
            duration: 30,
            generateClientSide: true,
            description: 'Energetic motivational track',
        },
        {
            id: 'sample-calm',
            name: 'Peaceful Moments',
            genre: 'calm',
            duration: 60,
            generateClientSide: true,
            description: 'Relaxing ambient music',
        },
        {
            id: 'sample-corporate',
            name: 'Business Forward',
            genre: 'corporate',
            duration: 45,
            generateClientSide: true,
            description: 'Professional presentation music',
        },
        {
            id: 'sample-cinematic',
            name: 'Epic Adventure',
            genre: 'cinematic',
            duration: 90,
            generateClientSide: true,
            description: 'Dramatic orchestral piece',
        },
        {
            id: 'sample-electronic',
            name: 'Digital Pulse',
            genre: 'electronic',
            duration: 60,
            generateClientSide: true,
            description: 'Modern electronic beats',
        },
        {
            id: 'sample-lofi',
            name: 'Study Session',
            genre: 'lofi',
            duration: 120,
            generateClientSide: true,
            description: 'Chill lo-fi beats',
        },
        {
            id: 'sample-hiphop',
            name: 'Street Beats',
            genre: 'hiphop',
            duration: 60,
            generateClientSide: true,
            description: 'Urban hip-hop vibes',
        },
        {
            id: 'sample-jazz',
            name: 'Smooth Jazz',
            genre: 'jazz',
            duration: 90,
            generateClientSide: true,
            description: 'Sophisticated jazz tones',
        },
        {
            id: 'sample-rock',
            name: 'Power Chords',
            genre: 'rock',
            duration: 60,
            generateClientSide: true,
            description: 'Guitar-driven rock energy',
        },
        {
            id: 'sample-synthwave',
            name: 'Neon Dreams',
            genre: 'synthwave',
            duration: 75,
            generateClientSide: true,
            description: 'Retro 80s synthwave',
        },
    ];
    res.json({ samples, clientSideGeneration: true });
});
// Helper functions
function buildMusicPrompt({ userPrompt, genre, genrePreset, mood, style, duration, purpose, withVocals, customLyrics, }) {
    let prompt = userPrompt;
    // Add genre style
    prompt += `. Style: ${genrePreset.style}`;
    // Add mood if specified
    if (mood) {
        prompt += `. Mood: ${mood}`;
    }
    // Add custom style
    if (style) {
        prompt += `. ${style}`;
    }
    // Add instruments
    prompt += `. Instruments: ${genrePreset.instruments}`;
    // Add BPM
    prompt += `. Tempo: ${genrePreset.bpm} BPM`;
    // Add purpose context
    const purposeContext = {
        app_background: 'Perfect for app background music, looping seamlessly',
        intro_jingle: 'Short, catchy jingle for app intro or notification',
        full_track: 'Full-length track with intro, verses, and outro',
        sound_effect: 'Short sound effect or audio sting',
        podcast_intro: 'Professional podcast intro music',
    };
    prompt += `. Purpose: ${purposeContext[purpose] || purposeContext.full_track}`;
    // Add duration context
    if (duration <= 30) {
        prompt += '. Short form, perfect for social media';
    }
    else if (duration <= 60) {
        prompt += '. Medium length, suitable for videos';
    }
    else {
        prompt += '. Extended version, full composition';
    }
    // Add vocals context
    if (withVocals && customLyrics) {
        prompt += `. With vocals singing: ${customLyrics}`;
    }
    else if (!withVocals) {
        prompt += '. Instrumental only, no vocals';
    }
    return prompt;
}
function generateTrackTitle(prompt, genre) {
    // Extract key words from prompt for title
    const words = prompt.split(' ').filter(w => w.length > 3).slice(0, 3);
    const baseTitle = words.length > 0 ? words.join(' ') : genre;
    return baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1).substring(0, 30);
}
function getDemoTrackUrl(genre, _purpose) {
    // Return indicator for client-side generation
    // The frontend will generate audio using Web Audio API based on genre
    return `generate-client-side:${genre}`;
}
/**
 * POST /api/music/mix
 * Mix voice and music tracks together
 */
router.post('/mix', async (req, res) => {
    try {
        const { tracks, masterVolume = 0.8, autoDuck = true, duckAmount = 0.3 } = req.body;
        if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one track is required' });
        }
        // For now, return mixing instructions - actual mixing would require ffmpeg or similar
        // This endpoint validates the mix configuration and returns metadata
        const voiceTracks = tracks.filter((t) => t.type === 'voice');
        const musicTracks = tracks.filter((t) => t.type === 'music');
        const totalDuration = Math.max(...tracks.map((t) => (t.startTime || 0) + t.duration));
        res.json({
            success: true,
            message: 'Mix configuration validated',
            mixConfig: {
                voiceTrackCount: voiceTracks.length,
                musicTrackCount: musicTracks.length,
                totalDuration,
                masterVolume,
                autoDuck,
                duckAmount,
                estimatedTokenCost: Math.ceil(totalDuration / 30) * 25, // 25 tokens per 30s of audio
            },
            // In production, this would return a processed audio URL
            // For now, provide instructions for client-side mixing
            clientSideMix: true,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to process mix',
        });
    }
});
/**
 * GET /api/music/library
 * Get full music library with categories
 * Note: Audio is generated client-side using Web Audio API
 */
router.get('/library', (_req, res) => {
    const library = {
        clientSideGeneration: true,
        categories: [
            {
                id: 'popular',
                name: 'Popular & Trending',
                icon: '🔥',
                tracks: [
                    { id: 'pop-1', name: 'Rise & Shine', genre: 'upbeat', duration: 30, generateClientSide: true, plays: 12500 },
                    { id: 'pop-2', name: 'Victory Lap', genre: 'upbeat', duration: 60, generateClientSide: true, plays: 9800 },
                    { id: 'pop-3', name: 'Success Story', genre: 'corporate', duration: 45, generateClientSide: true, plays: 7500 },
                ],
            },
            {
                id: 'relaxing',
                name: 'Relaxing & Calm',
                icon: '🌊',
                tracks: [
                    { id: 'relax-1', name: 'Ocean Breeze', genre: 'calm', duration: 120, generateClientSide: true },
                    { id: 'relax-2', name: 'Forest Dawn', genre: 'ambient', duration: 90, generateClientSide: true },
                    { id: 'relax-3', name: 'Study Session', genre: 'lofi', duration: 120, generateClientSide: true },
                    { id: 'relax-4', name: 'Zen Garden', genre: 'calm', duration: 90, generateClientSide: true },
                ],
            },
            {
                id: 'business',
                name: 'Business & Corporate',
                icon: '💼',
                tracks: [
                    { id: 'corp-1', name: 'Innovation Drive', genre: 'corporate', duration: 60, generateClientSide: true },
                    { id: 'corp-2', name: 'Tech Forward', genre: 'corporate', duration: 45, generateClientSide: true },
                    { id: 'corp-3', name: 'Startup Vibes', genre: 'corporate', duration: 50, generateClientSide: true },
                ],
            },
            {
                id: 'cinematic',
                name: 'Cinematic & Epic',
                icon: '🎬',
                tracks: [
                    { id: 'cine-1', name: 'Epic Journey', genre: 'cinematic', duration: 90, generateClientSide: true },
                    { id: 'cine-2', name: 'Dramatic Rise', genre: 'cinematic', duration: 60, generateClientSide: true },
                    { id: 'cine-3', name: 'Hero Theme', genre: 'cinematic', duration: 75, generateClientSide: true },
                ],
            },
            {
                id: 'electronic',
                name: 'Electronic & Modern',
                icon: '⚡',
                tracks: [
                    { id: 'elec-1', name: 'Digital Dreams', genre: 'electronic', duration: 60, generateClientSide: true },
                    { id: 'elec-2', name: 'Cyber Wave', genre: 'electronic', duration: 90, generateClientSide: true },
                    { id: 'elec-3', name: 'Neon Nights', genre: 'synthwave', duration: 75, generateClientSide: true },
                    { id: 'elec-4', name: 'Future Bass', genre: 'electronic', duration: 60, generateClientSide: true },
                ],
            },
            {
                id: 'hiphop',
                name: 'Hip-Hop & Urban',
                icon: '🎤',
                tracks: [
                    { id: 'hip-1', name: 'Street Beats', genre: 'hiphop', duration: 60, generateClientSide: true },
                    { id: 'hip-2', name: 'Trap Nation', genre: 'hiphop', duration: 90, generateClientSide: true },
                    { id: 'hip-3', name: 'Boom Bap Classic', genre: 'hiphop', duration: 75, generateClientSide: true },
                ],
            },
            {
                id: 'jazz',
                name: 'Jazz & Soul',
                icon: '🎷',
                tracks: [
                    { id: 'jazz-1', name: 'Smooth Night', genre: 'jazz', duration: 90, generateClientSide: true },
                    { id: 'jazz-2', name: 'Lounge Vibes', genre: 'jazz', duration: 60, generateClientSide: true },
                    { id: 'rnb-1', name: 'Soul Groove', genre: 'rnb', duration: 75, generateClientSide: true },
                ],
            },
            {
                id: 'rock',
                name: 'Rock & Energy',
                icon: '🎸',
                tracks: [
                    { id: 'rock-1', name: 'Power Chords', genre: 'rock', duration: 60, generateClientSide: true },
                    { id: 'rock-2', name: 'Electric Storm', genre: 'rock', duration: 75, generateClientSide: true },
                    { id: 'metal-1', name: 'Heavy Thunder', genre: 'metal', duration: 90, generateClientSide: true },
                ],
            },
            {
                id: 'world',
                name: 'World & Cultural',
                icon: '🌍',
                tracks: [
                    { id: 'world-1', name: 'Island Vibes', genre: 'reggae', duration: 60, generateClientSide: true },
                    { id: 'world-2', name: 'Global Fusion', genre: 'world', duration: 75, generateClientSide: true },
                    { id: 'country-1', name: 'Country Roads', genre: 'country', duration: 90, generateClientSide: true },
                ],
            },
            {
                id: 'podcast',
                name: 'Podcast & Intros',
                icon: '🎙️',
                tracks: [
                    { id: 'pod-1', name: 'Welcome Intro', genre: 'podcast', duration: 15, generateClientSide: true },
                    { id: 'pod-2', name: 'Outro Chill', genre: 'podcast', duration: 20, generateClientSide: true },
                    { id: 'pod-3', name: 'Transition', genre: 'podcast', duration: 10, generateClientSide: true },
                ],
            },
            {
                id: 'fun',
                name: 'Fun & Playful',
                icon: '🎪',
                tracks: [
                    { id: 'play-1', name: 'Happy Dance', genre: 'playful', duration: 45, generateClientSide: true },
                    { id: 'play-2', name: 'Celebration', genre: 'playful', duration: 60, generateClientSide: true },
                    { id: 'funk-1', name: 'Groovy Time', genre: 'funk', duration: 75, generateClientSide: true },
                ],
            },
        ],
        totalTracks: 38,
        genres: Object.keys(GENRE_PRESETS),
    };
    res.json(library);
});
/**
 * POST /api/music/voice-overlay
 * Generate a voice overlay for a music track
 */
router.post('/voice-overlay', async (req, res) => {
    try {
        const { musicTrackId, voiceText, voiceSettings } = req.body;
        if (!voiceText) {
            return res.status(400).json({ success: false, message: 'Voice text is required' });
        }
        // This would integrate with the voice API to generate TTS
        // Then mix it with the selected music track
        res.json({
            success: true,
            message: 'Voice overlay request received',
            config: {
                musicTrackId,
                voiceText: voiceText.substring(0, 100) + '...',
                voiceSettings,
            },
            // In production, this would return a mixed audio URL
            requiresProcessing: true,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create voice overlay',
        });
    }
});
// ============================================
// USER'S SAVED MUSIC LIBRARY
// ============================================
/**
 * POST /api/music/tracks/save
 * Save a generated music track to user's library
 */
router.post('/tracks/save', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { name, description, prompt, genre, mood, style, duration, withVocals, lyrics, vocalStyle, generationType, generationParams, sourceType, } = req.body;
        if (!name || !genre) {
            return res.status(400).json({ success: false, message: 'Name and genre are required' });
        }
        // Save track to database
        const track = await prisma.musicTrack.create({
            data: {
                userId,
                name,
                description,
                prompt,
                genre,
                mood,
                style,
                duration: duration || 30,
                withVocals: withVocals || false,
                lyrics,
                vocalStyle,
                generationType: generationType || 'procedural',
                generationParams: generationParams ? JSON.stringify(generationParams) : null,
                sourceType: sourceType || 'music-maker',
                status: 'completed',
            },
        });
        res.json({
            success: true,
            message: 'Track saved to your library!',
            track: {
                id: track.id,
                name: track.name,
                genre: track.genre,
                duration: track.duration,
                createdAt: track.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error saving track:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save track',
        });
    }
});
/**
 * GET /api/music/tracks
 * Get user's saved music tracks
 */
router.get('/tracks', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { genre, favorite, limit = 50, offset = 0 } = req.query;
        const where = { userId };
        if (genre)
            where.genre = genre;
        if (favorite === 'true')
            where.isFavorite = true;
        const tracks = await prisma.musicTrack.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: Number(limit),
            skip: Number(offset),
            select: {
                id: true,
                name: true,
                description: true,
                prompt: true,
                genre: true,
                mood: true,
                style: true,
                duration: true,
                withVocals: true,
                lyrics: true,
                vocalStyle: true,
                generationType: true,
                isFavorite: true,
                playCount: true,
                downloadCount: true,
                rating: true,
                isPublic: true,
                shareCode: true,
                sourceType: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        const total = await prisma.musicTrack.count({ where });
        res.json({
            success: true,
            tracks,
            total,
            hasMore: Number(offset) + tracks.length < total,
        });
    }
    catch (error) {
        console.error('Error fetching tracks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tracks',
        });
    }
});
/**
 * GET /api/music/tracks/:id
 * Get a specific music track
 */
router.get('/tracks/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const track = await prisma.musicTrack.findFirst({
            where: {
                id,
                OR: [
                    { userId: userId || '' },
                    { isPublic: true },
                ],
            },
        });
        if (!track) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }
        // Increment play count
        await prisma.musicTrack.update({
            where: { id },
            data: { playCount: { increment: 1 } },
        });
        res.json({ success: true, track });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch track',
        });
    }
});
/**
 * PUT /api/music/tracks/:id
 * Update a music track
 */
router.put('/tracks/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { id } = req.params;
        const { name, description, isFavorite, isPublic, rating } = req.body;
        // Verify ownership
        const existing = await prisma.musicTrack.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }
        const track = await prisma.musicTrack.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(isFavorite !== undefined && { isFavorite }),
                ...(isPublic !== undefined && { isPublic }),
                ...(rating !== undefined && { rating }),
                updatedAt: new Date(),
            },
        });
        res.json({ success: true, track });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update track',
        });
    }
});
/**
 * DELETE /api/music/tracks/:id
 * Delete a music track
 */
router.delete('/tracks/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { id } = req.params;
        // Verify ownership
        const existing = await prisma.musicTrack.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }
        await prisma.musicTrack.delete({ where: { id } });
        res.json({ success: true, message: 'Track deleted' });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete track',
        });
    }
});
/**
 * POST /api/music/tracks/:id/share
 * Generate a share code for a track
 */
router.post('/tracks/:id/share', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const { id } = req.params;
        // Verify ownership
        const existing = await prisma.musicTrack.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Track not found' });
        }
        // Generate unique share code
        const shareCode = `music_${id.slice(-6)}_${Date.now().toString(36)}`;
        const track = await prisma.musicTrack.update({
            where: { id },
            data: {
                isPublic: true,
                shareCode,
            },
        });
        res.json({
            success: true,
            shareCode,
            shareUrl: `${process.env.FRONTEND_URL || 'https://smartpromptiq.com'}/shared/music/${shareCode}`,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create share link',
        });
    }
});
/**
 * GET /api/music/shared/:shareCode
 * Get a shared music track
 */
router.get('/shared/:shareCode', async (req, res) => {
    try {
        const { shareCode } = req.params;
        const track = await prisma.musicTrack.findFirst({
            where: {
                shareCode,
                isPublic: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                genre: true,
                mood: true,
                duration: true,
                withVocals: true,
                playCount: true,
                createdAt: true,
            },
        });
        if (!track) {
            return res.status(404).json({ success: false, message: 'Track not found or no longer shared' });
        }
        // Increment play count
        await prisma.musicTrack.update({
            where: { id: track.id },
            data: { playCount: { increment: 1 } },
        });
        res.json({ success: true, track });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shared track',
        });
    }
});
exports.default = router;
