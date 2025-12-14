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

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { uploadAudioToStorage, refreshSignedUrl, deleteAudioFromStorage, listUserAudioFiles } from '../services/storageService';
import { API_COSTS, COST_CONTROL_FLAGS } from '../config/costs';

const router = Router();
const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TTSProvider = 'elevenlabs' | 'openai';
type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

interface SpeechGenerationRequest {
  text: string;
  provider?: TTSProvider;
  voice?: string;
  model?: string;
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
  };
  storeInCloud?: boolean; // If true, upload to Supabase and return signed URL
  category?: string;
}

interface SpeechGenerationResponse {
  success: boolean;
  audioUrl: string;         // Signed URL or base64 data URL
  isStreamingUrl: boolean;  // True if it's a signed URL from Supabase
  fileId?: string;          // File ID in storage (if stored)
  filePath?: string;        // Storage path (if stored)
  expiresIn?: number;       // Seconds until URL expires (if signed URL)
  format: string;
  duration: number;         // Estimated duration in seconds
  provider: TTSProvider;
  voice: string;
  tokensUsed: number;
  charCount: number;
  error?: string;
}

// ElevenLabs premium voices
const ELEVENLABS_VOICES: Record<string, { id: string; name: string }> = {
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
const OPENAI_VOICES: OpenAIVoice[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log API cost for tracking
 */
async function logApiCost(
  userId: string | null,
  provider: string,
  action: string,
  cost: number,
  tokensUsed: number,
  model: string
) {
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
      } as any, // Type assertion for flexibility with schema variations
    });

    if (COST_CONTROL_FLAGS.logAllAPICosts) {
      console.log(`💰 ${provider} Cost: $${cost.toFixed(4)} | Tokens: ${tokensUsed} | Model: ${model}`);
    }
  } catch (error) {
    console.error('Failed to log API cost:', error);
  }
}

/**
 * Generate speech using ElevenLabs API
 */
async function generateWithElevenLabs(
  text: string,
  voiceName: string,
  model: string,
  settings: any
): Promise<{ buffer: Buffer; format: string } | { error: string }> {
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
  } catch (error: any) {
    console.error('ElevenLabs generation error:', error);
    return { error: error.message || 'ElevenLabs generation failed' };
  }
}

/**
 * Generate speech using OpenAI TTS API
 */
async function generateWithOpenAI(
  text: string,
  voice: OpenAIVoice,
  settings: any
): Promise<{ buffer: Buffer; format: string } | { error: string }> {
  try {
    const response = await openai.audio.speech.create({
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
  } catch (error: any) {
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
router.post('/generate-speech', async (req: Request, res: Response) => {
  try {
    const {
      text,
      provider = 'openai',
      voice = provider === 'elevenlabs' ? 'rachel' : 'nova',
      model = 'eleven_multilingual_v2',
      settings = {},
      storeInCloud = true,
      category = 'voice',
    } = req.body as SpeechGenerationRequest;

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
    const userId = (req as any).userId || null;

    console.log(`🎙️ Generating speech: provider=${provider}, voice=${voice}, chars=${text.length}`);

    // Generate audio based on provider
    let audioResult: { buffer: Buffer; format: string } | { error: string };

    if (provider === 'elevenlabs') {
      audioResult = await generateWithElevenLabs(text, voice, model, settings);
    } else {
      // Validate OpenAI voice
      const openaiVoice = OPENAI_VOICES.includes(voice as OpenAIVoice)
        ? (voice as OpenAIVoice)
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
      : (text.length / 1000000) * (API_COSTS.openai['tts-1-hd'] || 30); // OpenAI pricing

    await logApiCost(userId, provider, 'speech', actualAPICost, tokenCost, model);

    // Response object
    const response: SpeechGenerationResponse = {
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
      const uploadResult = await uploadAudioToStorage(audioBuffer, {
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
      } else {
        // Fallback to base64 if upload fails
        console.warn('⚠️ Cloud storage failed, returning base64:', uploadResult.error);
        response.audioUrl = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
        response.error = `Storage upload failed: ${uploadResult.error}. Returning base64 instead.`;
      }
    } else {
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
      } catch (err) {
        console.warn('Failed to update user tokens:', err);
      }
    }

    res.json(response);

  } catch (error: any) {
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
router.post('/refresh-url', async (req: Request, res: Response) => {
  try {
    const { filePath, expiresIn = 600 } = req.body;  // Default 10 minutes

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'filePath is required',
      });
    }

    const result = await refreshSignedUrl(filePath, 'voice-output', expiresIn);

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

  } catch (error: any) {
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
router.get('/files', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const category = (req.query.category as string) || 'voice';
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await listUserAudioFiles(userId, category, limit);

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

  } catch (error: any) {
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
router.delete('/:filePath(*)', async (req: Request, res: Response) => {
  try {
    const { filePath } = req.params;
    const userId = (req as any).userId;

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

    const result = await deleteAudioFromStorage(filePath);

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

  } catch (error: any) {
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
router.get('/voices', async (req: Request, res: Response) => {
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

export default router;
