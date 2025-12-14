/**
 * Music Generation Service
 *
 * Handles AI music generation via external APIs:
 * - Suno API (primary) - High-quality AI music generation
 * - Loudly API (alternative) - Royalty-free music
 * - Demo mode (fallback) - When no API keys configured
 *
 * Pipeline:
 * 1. Accept prompt (mood, tempo, genre, duration)
 * 2. Call music generation API
 * 3. Download/receive audio file (MP3)
 * 4. Upload to Supabase Storage (music-output bucket)
 * 5. Generate signed URL (10-minute expiry)
 * 6. Return signed URL to client
 */

import {
  uploadToBucketAndGetSignedUrl,
  MUSIC_OUTPUT_BUCKET,
  SIGNED_URL_EXPIRY_SECONDS,
} from '../lib/supabase';

// =============================================================================
// CONFIGURATION
// =============================================================================

// Suno API Configuration (via third-party providers)
const SUNO_API_URL = process.env.SUNO_API_URL || 'https://api.sunoapi.org/v1';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

// Alternative: AI Music API (aimusicapi.ai)
const AI_MUSIC_API_URL = process.env.AI_MUSIC_API_URL || 'https://api.aimusicapi.ai/v1';
const AI_MUSIC_API_KEY = process.env.AI_MUSIC_API_KEY;

// =============================================================================
// TYPES
// =============================================================================

export interface MusicGenerationParams {
  prompt: string;
  genre?: string;
  mood?: string;
  tempo?: 'slow' | 'medium' | 'fast';
  duration?: number;  // seconds
  instrumental?: boolean;
  lyrics?: string;
}

export interface MusicGenerationResult {
  success: boolean;
  audioUrl?: string;
  signedUrl?: string;
  isSignedUrl?: boolean;
  expiresIn?: number;
  filePath?: string;
  trackId?: string;
  title?: string;
  duration?: number;
  genre?: string;
  provider?: string;
  error?: string;
  isDemo?: boolean;
}

// Genre configurations for better prompts
const GENRE_PROMPTS: Record<string, string> = {
  upbeat: 'energetic, motivational, happy, uplifting electronic pop',
  calm: 'peaceful, relaxing, ambient, meditation, soft piano',
  corporate: 'professional, business, inspiring, modern technology',
  cinematic: 'epic, orchestral, dramatic, movie trailer, hollywood',
  electronic: 'EDM, synth-wave, futuristic, dance, electronic beats',
  hiphop: 'hip-hop, trap, urban, 808 bass, rap instrumental',
  rock: 'rock, guitar-driven, powerful, drums, alternative',
  jazz: 'smooth jazz, saxophone, lounge, sophisticated',
  lofi: 'lo-fi, chill hop, study music, vinyl, nostalgic beats',
  ambient: 'ambient, atmospheric, drone, soundscape, ethereal',
  podcast: 'podcast intro, talk show, professional, welcoming',
};

const TEMPO_BPM: Record<string, string> = {
  slow: '60-80 BPM, slow tempo',
  medium: '100-120 BPM, moderate tempo',
  fast: '130-150 BPM, fast tempo, energetic',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build a detailed music generation prompt
 */
function buildMusicPrompt(params: MusicGenerationParams): string {
  const parts: string[] = [];

  // User's main prompt
  parts.push(params.prompt);

  // Add genre context
  if (params.genre && GENRE_PROMPTS[params.genre]) {
    parts.push(`Style: ${GENRE_PROMPTS[params.genre]}`);
  }

  // Add mood
  if (params.mood) {
    parts.push(`Mood: ${params.mood}`);
  }

  // Add tempo
  if (params.tempo && TEMPO_BPM[params.tempo]) {
    parts.push(TEMPO_BPM[params.tempo]);
  }

  // Add duration context
  if (params.duration) {
    if (params.duration <= 30) {
      parts.push('Short form, jingle style');
    } else if (params.duration <= 60) {
      parts.push('Medium length, suitable for videos');
    } else {
      parts.push('Full length composition');
    }
  }

  // Instrumental flag
  if (params.instrumental) {
    parts.push('Instrumental only, no vocals');
  }

  return parts.join('. ');
}

/**
 * Generate a track title from prompt
 */
function generateTrackTitle(prompt: string, genre?: string): string {
  const words = prompt.split(' ').filter((w) => w.length > 3).slice(0, 3);
  const baseTitle = words.length > 0 ? words.join(' ') : genre || 'Track';
  return baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1).substring(0, 30);
}

/**
 * Download audio from URL and return as buffer
 */
async function downloadAudioAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// =============================================================================
// MUSIC GENERATION FUNCTIONS
// =============================================================================

/**
 * Generate music using Suno API
 */
async function generateWithSunoAPI(
  params: MusicGenerationParams
): Promise<{ audioUrl?: string; trackId?: string; error?: string }> {
  if (!SUNO_API_KEY) {
    return { error: 'SUNO_API_KEY not configured' };
  }

  try {
    const prompt = buildMusicPrompt(params);

    console.log(`🎵 Calling Suno API: "${prompt.substring(0, 50)}..."`);

    const response = await fetch(`${SUNO_API_URL}/music/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        make_instrumental: params.instrumental ?? true,
        duration: params.duration || 30,
        ...(params.lyrics && { lyrics: params.lyrics }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Suno API error:', response.status, errorText);
      return { error: `Suno API error: ${response.status}` };
    }

    const data = await response.json();

    // Handle async generation (polling may be required)
    if (data.status === 'processing' || data.taskId) {
      // For async APIs, we'd need to poll - for now return the task ID
      return {
        trackId: data.taskId || data.id,
        audioUrl: data.audioUrl || data.audio_url,
      };
    }

    return {
      audioUrl: data.audioUrl || data.audio_url || data.data?.[0]?.audio_url,
      trackId: data.id || data.taskId,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Suno API request failed:', errorMessage);
    return { error: `Suno API request failed: ${errorMessage}` };
  }
}

/**
 * Generate music using AI Music API (alternative)
 */
async function generateWithAIMusicAPI(
  params: MusicGenerationParams
): Promise<{ audioUrl?: string; trackId?: string; error?: string }> {
  if (!AI_MUSIC_API_KEY) {
    return { error: 'AI_MUSIC_API_KEY not configured' };
  }

  try {
    const prompt = buildMusicPrompt(params);

    console.log(`🎵 Calling AI Music API: "${prompt.substring(0, 50)}..."`);

    const response = await fetch(`${AI_MUSIC_API_URL}/suno/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_MUSIC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        custom_mode: true,
        gpt_description_prompt: prompt,
        make_instrumental: params.instrumental ?? true,
        mv: 'chirp-v4',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI Music API error:', response.status, errorText);
      return { error: `AI Music API error: ${response.status}` };
    }

    const data = await response.json();

    return {
      audioUrl: data.audioUrl || data.audio_url || data.data?.[0]?.audio_url,
      trackId: data.id || data.taskId,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ AI Music API request failed:', errorMessage);
    return { error: `AI Music API request failed: ${errorMessage}` };
  }
}

/**
 * Generate demo music (fallback when no API configured)
 * Returns a simple generated tone or silence
 */
function generateDemoMusic(params: MusicGenerationParams): {
  audioBuffer: Buffer;
  title: string;
} {
  // Generate a simple silent/placeholder MP3
  // In production, this could be replaced with a Web Audio API generated track
  // For now, we return an indicator for client-side generation

  // Create a minimal valid MP3 frame (silence)
  // This is a valid but very short MP3
  const mp3Header = Buffer.from([
    0xFF, 0xFB, 0x90, 0x00, // MPEG Audio Layer 3, 128kbps, 44.1kHz
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);

  // Repeat for minimal duration
  const frames: Buffer[] = [];
  const framesNeeded = Math.ceil((params.duration || 5) * 38); // ~38 frames per second
  for (let i = 0; i < Math.min(framesNeeded, 200); i++) {
    frames.push(mp3Header);
  }

  return {
    audioBuffer: Buffer.concat(frames),
    title: generateTrackTitle(params.prompt, params.genre),
  };
}

// =============================================================================
// MAIN EXPORT FUNCTION
// =============================================================================

/**
 * Generate music and upload to Supabase Storage
 *
 * Pipeline:
 * 1. Call music generation API (Suno or AI Music API)
 * 2. Download the generated audio
 * 3. Upload to Supabase Storage (music-output bucket)
 * 4. Generate signed URL (10-minute expiry)
 * 5. Return the signed URL
 *
 * @param params - Music generation parameters
 * @returns MusicGenerationResult with signed URL
 */
export async function generateMusicWithCloudStorage(
  params: MusicGenerationParams
): Promise<MusicGenerationResult> {
  const startTime = Date.now();

  console.log(`🎵 Music Generation Pipeline Started`);
  console.log(`   Prompt: "${params.prompt.substring(0, 50)}..."`);
  console.log(`   Genre: ${params.genre || 'default'}`);
  console.log(`   Duration: ${params.duration || 30}s`);
  console.log(`   Instrumental: ${params.instrumental ?? true}`);

  // Determine which API to use
  let apiResult: { audioUrl?: string; trackId?: string; error?: string };
  let provider: string;

  if (SUNO_API_KEY) {
    provider = 'suno';
    apiResult = await generateWithSunoAPI(params);
  } else if (AI_MUSIC_API_KEY) {
    provider = 'aimusicapi';
    apiResult = await generateWithAIMusicAPI(params);
  } else {
    // Demo mode - no API configured
    console.log('⚠️ No music API configured - using demo mode');
    const demoResult = generateDemoMusic(params);

    // Upload demo audio to Supabase
    const uploadResult = await uploadToBucketAndGetSignedUrl(
      demoResult.audioBuffer,
      `demo-${Date.now()}.mp3`,
      MUSIC_OUTPUT_BUCKET,
      'audio/mpeg'
    );

    if (uploadResult.success) {
      return {
        success: true,
        audioUrl: uploadResult.signedUrl,
        signedUrl: uploadResult.signedUrl,
        isSignedUrl: true,
        expiresIn: uploadResult.expiresIn,
        filePath: uploadResult.filePath,
        title: demoResult.title,
        duration: params.duration || 30,
        genre: params.genre,
        provider: 'demo',
        isDemo: true,
      };
    } else {
      // Fallback: return indicator for client-side generation
      return {
        success: true,
        audioUrl: `generate-client-side:${params.genre || 'upbeat'}`,
        isSignedUrl: false,
        title: demoResult.title,
        duration: params.duration || 30,
        genre: params.genre,
        provider: 'demo',
        isDemo: true,
        error: 'No API configured and Supabase upload failed. Use client-side generation.',
      };
    }
  }

  // Check for API errors
  if (apiResult.error) {
    console.error(`❌ Music API error: ${apiResult.error}`);
    return {
      success: false,
      error: apiResult.error,
      provider,
    };
  }

  // Check if we got an audio URL
  if (!apiResult.audioUrl) {
    // API returned but no audio yet (async processing)
    if (apiResult.trackId) {
      return {
        success: true,
        trackId: apiResult.trackId,
        title: generateTrackTitle(params.prompt, params.genre),
        duration: params.duration || 30,
        genre: params.genre,
        provider,
        error: 'Track is being generated. Poll /api/music/status/:trackId for completion.',
      };
    }
    return {
      success: false,
      error: 'No audio URL returned from API',
      provider,
    };
  }

  // Download the generated audio
  console.log(`📥 Downloading generated audio...`);
  let audioBuffer: Buffer;

  try {
    audioBuffer = await downloadAudioAsBuffer(apiResult.audioUrl);
    console.log(`✅ Downloaded ${audioBuffer.length} bytes`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Failed to download audio: ${errorMessage}`);
    return {
      success: false,
      error: `Failed to download generated audio: ${errorMessage}`,
      provider,
    };
  }

  // Upload to Supabase Storage
  const fileName = `music-${Date.now()}.mp3`;
  const uploadResult = await uploadToBucketAndGetSignedUrl(
    audioBuffer,
    fileName,
    MUSIC_OUTPUT_BUCKET,
    'audio/mpeg'
  );

  if (!uploadResult.success) {
    console.error(`❌ Supabase upload failed: ${uploadResult.error}`);
    // Return the original API URL as fallback
    return {
      success: true,
      audioUrl: apiResult.audioUrl,
      isSignedUrl: false,
      trackId: apiResult.trackId,
      title: generateTrackTitle(params.prompt, params.genre),
      duration: params.duration || 30,
      genre: params.genre,
      provider,
      error: `Supabase upload failed: ${uploadResult.error}. Returning direct API URL.`,
    };
  }

  const elapsed = Date.now() - startTime;
  console.log(`✅ Music generation complete in ${elapsed}ms`);

  return {
    success: true,
    audioUrl: uploadResult.signedUrl,
    signedUrl: uploadResult.signedUrl,
    isSignedUrl: true,
    expiresIn: uploadResult.expiresIn,
    filePath: uploadResult.filePath,
    trackId: apiResult.trackId,
    title: generateTrackTitle(params.prompt, params.genre),
    duration: params.duration || 30,
    genre: params.genre,
    provider,
  };
}

// =============================================================================
// ADDITIONAL EXPORTS
// =============================================================================

export { GENRE_PROMPTS, TEMPO_BPM, buildMusicPrompt, generateTrackTitle };

export default {
  generateMusicWithCloudStorage,
  GENRE_PROMPTS,
  TEMPO_BPM,
};
