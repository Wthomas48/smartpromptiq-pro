/**
 * Supabase Client Configuration
 *
 * Server-side Supabase client for Storage operations.
 * Uses service role key to bypass Row Level Security (RLS) for backend operations.
 *
 * Required Environment Variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (has admin access, keep secret!)
 *
 * Usage:
 *   import { supabase, VOICE_OUTPUT_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from '../lib/supabase';
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables at startup
if (!SUPABASE_URL) {
  console.error('❌ FATAL: Missing SUPABASE_URL environment variable');
  console.error('   Please add SUPABASE_URL to your .env file');
  console.error('   Example: SUPABASE_URL=https://your-project.supabase.co');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ FATAL: Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('   Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.error('   Get it from: Supabase Dashboard > Settings > API > service_role key');
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Storage bucket names
 * These buckets must be created in Supabase Dashboard or via API
 * Buckets should be PRIVATE (not public) for security
 */
export const VOICE_OUTPUT_BUCKET = 'voice-output';
export const MUSIC_OUTPUT_BUCKET = 'music-output';

/**
 * All storage buckets for initialization
 */
export const STORAGE_BUCKETS = {
  VOICE: VOICE_OUTPUT_BUCKET,
  MUSIC: MUSIC_OUTPUT_BUCKET,
} as const;

/**
 * Signed URL expiration time in seconds
 * 10 minutes = 600 seconds
 */
export const SIGNED_URL_EXPIRY_SECONDS = 600;

/**
 * Maximum file size for audio uploads (50MB)
 */
export const MAX_AUDIO_FILE_SIZE = 52428800;

/**
 * Allowed audio MIME types
 */
export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',  // .mp3
  'audio/wav',   // .wav
  'audio/ogg',   // .ogg
  'audio/mp4',   // .m4a
  'audio/webm',  // .webm
] as const;

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

/**
 * Singleton Supabase client instance
 * Initialized lazily on first access
 */
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance
 *
 * @returns SupabaseClient instance
 * @throws Error if environment variables are missing
 */
export function getSupabaseClient(): SupabaseClient {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase configuration error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Please check your .env file.'
    );
  }

  // Create new client instance
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      // Disable auto refresh for server-side usage
      autoRefreshToken: false,
      // Don't persist sessions on the server
      persistSession: false,
    },
  });

  console.log('✅ Supabase client initialized successfully');
  console.log(`   Project URL: ${SUPABASE_URL}`);
  console.log(`   Voice bucket: ${VOICE_OUTPUT_BUCKET}`);
  console.log(`   Signed URL expiry: ${SIGNED_URL_EXPIRY_SECONDS}s (${SIGNED_URL_EXPIRY_SECONDS / 60} minutes)`);

  return supabaseInstance;
}

/**
 * Export the Supabase client directly for convenience
 * Note: Will be null if environment variables are missing
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// =============================================================================
// STORAGE HELPER FUNCTIONS
// =============================================================================

/**
 * Upload an audio buffer to Supabase Storage and get a signed URL
 *
 * @param audioBuffer - The audio data as a Buffer
 * @param fileName - The file name (including extension)
 * @param mimeType - MIME type of the audio (default: audio/mpeg)
 * @returns Object containing signedUrl and file path, or error
 */
export async function uploadAudioAndGetSignedUrl(
  audioBuffer: Buffer,
  fileName: string,
  mimeType: string = 'audio/mpeg'
): Promise<{
  success: boolean;
  signedUrl?: string;
  filePath?: string;
  expiresIn?: number;
  error?: string;
}> {
  // Get or validate client
  const client = supabase;

  if (!client) {
    return {
      success: false,
      error: 'Supabase client not initialized. Check environment variables.',
    };
  }

  try {
    // Generate unique file path: YYYY-MM-DD/timestamp-filename
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const filePath = `${date}/${timestamp}-${fileName}`;

    console.log(`📤 Uploading audio to Supabase Storage: ${filePath}`);

    // Upload the audio buffer to storage
    const { data: uploadData, error: uploadError } = await client.storage
      .from(VOICE_OUTPUT_BUCKET)
      .upload(filePath, audioBuffer, {
        contentType: mimeType,
        cacheControl: '3600', // Cache for 1 hour
        upsert: false, // Don't overwrite existing files
      });

    // Handle upload errors
    if (uploadError) {
      console.error('❌ Supabase Storage upload failed:', uploadError.message);
      return {
        success: false,
        error: `Storage upload failed: ${uploadError.message}`,
      };
    }

    console.log(`✅ Upload successful: ${uploadData.path}`);

    // Generate signed URL with 10-minute expiry
    const { data: signedUrlData, error: signedUrlError } = await client.storage
      .from(VOICE_OUTPUT_BUCKET)
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS);

    // Handle signed URL generation errors
    if (signedUrlError) {
      console.error('❌ Failed to generate signed URL:', signedUrlError.message);
      return {
        success: false,
        error: `Signed URL generation failed: ${signedUrlError.message}`,
      };
    }

    console.log(`🔗 Signed URL generated (expires in ${SIGNED_URL_EXPIRY_SECONDS}s)`);

    return {
      success: true,
      signedUrl: signedUrlData.signedUrl,
      filePath: filePath,
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Unexpected error during upload:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Upload audio to a specific bucket and get a signed URL
 *
 * @param audioBuffer - The audio data as a Buffer
 * @param fileName - The file name (including extension)
 * @param bucket - The bucket name (voice-output or music-output)
 * @param mimeType - MIME type of the audio (default: audio/mpeg)
 * @returns Object containing signedUrl and file path, or error
 */
export async function uploadToBucketAndGetSignedUrl(
  audioBuffer: Buffer,
  fileName: string,
  bucket: string,
  mimeType: string = 'audio/mpeg'
): Promise<{
  success: boolean;
  signedUrl?: string;
  filePath?: string;
  expiresIn?: number;
  error?: string;
}> {
  const client = supabase;

  if (!client) {
    return {
      success: false,
      error: 'Supabase client not initialized. Check environment variables.',
    };
  }

  try {
    // Generate unique file path: YYYY-MM-DD/timestamp-filename
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    const filePath = `${date}/${timestamp}-${fileName}`;

    console.log(`📤 Uploading to Supabase Storage [${bucket}]: ${filePath}`);

    // Upload the audio buffer to storage
    const { data: uploadData, error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, audioBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error(`❌ Upload to ${bucket} failed:`, uploadError.message);
      return {
        success: false,
        error: `Storage upload failed: ${uploadError.message}`,
      };
    }

    console.log(`✅ Upload successful: ${uploadData.path}`);

    // Generate signed URL with 10-minute expiry
    const { data: signedUrlData, error: signedUrlError } = await client.storage
      .from(bucket)
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS);

    if (signedUrlError) {
      console.error('❌ Failed to generate signed URL:', signedUrlError.message);
      return {
        success: false,
        error: `Signed URL generation failed: ${signedUrlError.message}`,
      };
    }

    console.log(`🔗 Signed URL generated (expires in ${SIGNED_URL_EXPIRY_SECONDS}s)`);

    return {
      success: true,
      signedUrl: signedUrlData.signedUrl,
      filePath: filePath,
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Unexpected error during upload:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Initialize all storage buckets
 * Run this once during initial setup
 *
 * @returns Object indicating success or failure for each bucket
 */
export async function initializeStorageBuckets(): Promise<{
  success: boolean;
  results: { bucket: string; success: boolean; message: string }[];
}> {
  const client = supabase;

  if (!client) {
    return {
      success: false,
      results: [{ bucket: 'all', success: false, message: 'Supabase client not initialized' }],
    };
  }

  const results: { bucket: string; success: boolean; message: string }[] = [];

  for (const [key, bucketName] of Object.entries(STORAGE_BUCKETS)) {
    try {
      // Check if bucket already exists
      const { data: existingBucket } = await client.storage.getBucket(bucketName);

      if (existingBucket) {
        results.push({
          bucket: bucketName,
          success: true,
          message: `Bucket "${bucketName}" already exists`,
        });
        continue;
      }

      // Create the bucket (private, not public)
      const { error } = await client.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: MAX_AUDIO_FILE_SIZE,
        allowedMimeTypes: [...ALLOWED_AUDIO_MIME_TYPES],
      });

      if (error) {
        results.push({
          bucket: bucketName,
          success: false,
          message: `Failed to create: ${error.message}`,
        });
      } else {
        results.push({
          bucket: bucketName,
          success: true,
          message: `Bucket "${bucketName}" created successfully`,
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        bucket: bucketName,
        success: false,
        message: `Error: ${errorMessage}`,
      });
    }
  }

  const allSuccess = results.every((r) => r.success);
  return { success: allSuccess, results };
}

/**
 * Create the voice-output bucket if it doesn't exist
 * Run this once during initial setup
 *
 * @returns Object indicating success or failure
 */
export async function initializeVoiceOutputBucket(): Promise<{
  success: boolean;
  message: string;
}> {
  const result = await initializeStorageBuckets();
  const voiceResult = result.results.find((r) => r.bucket === VOICE_OUTPUT_BUCKET);
  return {
    success: voiceResult?.success || false,
    message: voiceResult?.message || 'Unknown error',
  };
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

export default {
  supabase,
  getSupabaseClient,
  uploadAudioAndGetSignedUrl,
  uploadToBucketAndGetSignedUrl,
  initializeVoiceOutputBucket,
  initializeStorageBuckets,
  VOICE_OUTPUT_BUCKET,
  MUSIC_OUTPUT_BUCKET,
  STORAGE_BUCKETS,
  SIGNED_URL_EXPIRY_SECONDS,
  MAX_AUDIO_FILE_SIZE,
  ALLOWED_AUDIO_MIME_TYPES,
};
