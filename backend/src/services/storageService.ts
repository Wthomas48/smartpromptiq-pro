/**
 * Supabase Storage Service
 *
 * Handles all audio file storage operations:
 * - Upload audio buffers to Supabase Storage
 * - Generate signed streaming URLs
 * - Manage file lifecycle (cleanup old files)
 */

import { supabase, STORAGE_BUCKETS, SIGNED_URL_EXPIRY } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

// Audio file types and their MIME types
const AUDIO_MIME_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  webm: 'audio/webm',
};

export interface AudioUploadOptions {
  userId?: string;
  category?: 'voice' | 'music' | 'sfx';
  format?: keyof typeof AUDIO_MIME_TYPES;
  metadata?: Record<string, string>;
}

export interface AudioUploadResult {
  success: boolean;
  fileId: string;
  filePath: string;
  signedUrl: string;
  expiresIn: number;
  publicUrl?: string;
  error?: string;
}

/**
 * Generate a unique file path for audio storage
 */
function generateFilePath(
  userId: string | undefined,
  category: string,
  format: string
): { fileId: string; filePath: string } {
  const fileId = uuidv4();
  const timestamp = Date.now();
  const userFolder = userId || 'anonymous';
  const dateFolder = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Path structure: category/date/userId/fileId.format
  const filePath = `${category}/${dateFolder}/${userFolder}/${fileId}.${format}`;

  return { fileId, filePath };
}

/**
 * Upload audio buffer to Supabase Storage and return signed URL
 */
export async function uploadAudioToStorage(
  audioBuffer: Buffer,
  options: AudioUploadOptions = {}
): Promise<AudioUploadResult> {
  const {
    userId,
    category = 'voice',
    format = 'mp3',
    metadata = {},
  } = options;

  if (!supabase) {
    return {
      success: false,
      fileId: '',
      filePath: '',
      signedUrl: '',
      expiresIn: 0,
      error: 'Supabase client not initialized. Check environment variables.',
    };
  }

  try {
    // Generate unique file path
    const { fileId, filePath } = generateFilePath(userId, category, format);

    // Determine bucket based on category
    // Phase 1: Use voice-output bucket for voice generation
    const bucket = category === 'music'
      ? STORAGE_BUCKETS.MUSIC
      : category === 'voice'
        ? STORAGE_BUCKETS.VOICE_OUTPUT
        : STORAGE_BUCKETS.AUDIO;
    const mimeType = AUDIO_MIME_TYPES[format] || 'audio/mpeg';

    console.log(`📤 Uploading audio to Supabase: ${filePath}`);

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, audioBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
        duplex: 'half',
      });

    if (uploadError) {
      console.error('❌ Supabase upload error:', uploadError);
      return {
        success: false,
        fileId,
        filePath,
        signedUrl: '',
        expiresIn: 0,
        error: uploadError.message,
      };
    }

    console.log(`✅ Upload successful: ${uploadData.path}`);

    // Generate signed URL for streaming
    // Phase 1: Use 10-minute expiry for voice-output bucket
    const expiresIn = category === 'voice'
      ? SIGNED_URL_EXPIRY.VOICE_OUTPUT  // 10 minutes for voice
      : SIGNED_URL_EXPIRY.MEDIUM;        // 24 hours for others

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (signedUrlError) {
      console.error('❌ Signed URL error:', signedUrlError);
      return {
        success: false,
        fileId,
        filePath,
        signedUrl: '',
        expiresIn: 0,
        error: signedUrlError.message,
      };
    }

    // Also get public URL (if bucket is public)
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log(`🔗 Signed URL generated (expires in ${expiresIn}s)`);

    return {
      success: true,
      fileId,
      filePath,
      signedUrl: signedUrlData.signedUrl,
      expiresIn,
      publicUrl: publicUrlData.publicUrl,
    };

  } catch (error: any) {
    console.error('❌ Storage service error:', error);
    return {
      success: false,
      fileId: '',
      filePath: '',
      signedUrl: '',
      expiresIn: 0,
      error: error.message || 'Unknown storage error',
    };
  }
}

/**
 * Refresh a signed URL for an existing file
 */
export async function refreshSignedUrl(
  filePath: string,
  bucket: string = STORAGE_BUCKETS.AUDIO,
  expiresIn: number = SIGNED_URL_EXPIRY.MEDIUM
): Promise<{ signedUrl: string; error?: string }> {
  if (!supabase) {
    return { signedUrl: '', error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { signedUrl: '', error: error.message };
    }

    return { signedUrl: data.signedUrl };
  } catch (error: any) {
    return { signedUrl: '', error: error.message };
  }
}

/**
 * Delete an audio file from storage
 */
export async function deleteAudioFromStorage(
  filePath: string,
  bucket: string = STORAGE_BUCKETS.AUDIO
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    console.log(`🗑️ Deleted audio file: ${filePath}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * List audio files for a user
 */
export async function listUserAudioFiles(
  userId: string,
  category: string = 'voice',
  limit: number = 50
): Promise<{ files: any[]; error?: string }> {
  if (!supabase) {
    return { files: [], error: 'Supabase client not initialized' };
  }

  try {
    const bucket = category === 'music' ? STORAGE_BUCKETS.MUSIC : STORAGE_BUCKETS.AUDIO;
    const prefix = `${category}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit,
        search: userId,
      });

    if (error) {
      return { files: [], error: error.message };
    }

    return { files: data || [] };
  } catch (error: any) {
    return { files: [], error: error.message };
  }
}

/**
 * Initialize storage buckets (run once during setup)
 * Note: This requires admin/service role permissions
 */
export async function initializeStorageBuckets(): Promise<void> {
  if (!supabase) {
    console.error('❌ Cannot initialize buckets: Supabase client not available');
    return;
  }

  const buckets = [
    { name: STORAGE_BUCKETS.VOICE_OUTPUT, public: false },  // Phase 1: Primary voice bucket
    { name: STORAGE_BUCKETS.AUDIO, public: false },
    { name: STORAGE_BUCKETS.MUSIC, public: false },
    { name: STORAGE_BUCKETS.VOICE, public: false },
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBucket } = await supabase.storage.getBucket(bucket.name);

      if (!existingBucket) {
        // Create bucket
        const { error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: 52428800, // 50MB max file size
          allowedMimeTypes: Object.values(AUDIO_MIME_TYPES),
        });

        if (error) {
          console.error(`❌ Failed to create bucket ${bucket.name}:`, error);
        } else {
          console.log(`✅ Created storage bucket: ${bucket.name}`);
        }
      } else {
        console.log(`✅ Bucket already exists: ${bucket.name}`);
      }
    } catch (error) {
      console.error(`❌ Error initializing bucket ${bucket.name}:`, error);
    }
  }
}

export default {
  uploadAudioToStorage,
  refreshSignedUrl,
  deleteAudioFromStorage,
  listUserAudioFiles,
  initializeStorageBuckets,
};
