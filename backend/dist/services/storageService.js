"use strict";
/**
 * Supabase Storage Service
 *
 * Handles all audio file storage operations:
 * - Upload audio buffers to Supabase Storage
 * - Generate signed streaming URLs
 * - Manage file lifecycle (cleanup old files)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAudioToStorage = uploadAudioToStorage;
exports.refreshSignedUrl = refreshSignedUrl;
exports.deleteAudioFromStorage = deleteAudioFromStorage;
exports.listUserAudioFiles = listUserAudioFiles;
exports.initializeStorageBuckets = initializeStorageBuckets;
const supabase_1 = require("../config/supabase");
const uuid_1 = require("uuid");
// Audio file types and their MIME types
const AUDIO_MIME_TYPES = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    webm: 'audio/webm',
};
/**
 * Generate a unique file path for audio storage
 */
function generateFilePath(userId, category, format) {
    const fileId = (0, uuid_1.v4)();
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
async function uploadAudioToStorage(audioBuffer, options = {}) {
    const { userId, category = 'voice', format = 'mp3', metadata = {}, } = options;
    if (!supabase_1.supabase) {
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
            ? supabase_1.STORAGE_BUCKETS.MUSIC
            : category === 'voice'
                ? supabase_1.STORAGE_BUCKETS.VOICE_OUTPUT
                : supabase_1.STORAGE_BUCKETS.AUDIO;
        const mimeType = AUDIO_MIME_TYPES[format] || 'audio/mpeg';
        console.log(`📤 Uploading audio to Supabase: ${filePath}`);
        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase_1.supabase.storage
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
            ? supabase_1.SIGNED_URL_EXPIRY.VOICE_OUTPUT // 10 minutes for voice
            : supabase_1.SIGNED_URL_EXPIRY.MEDIUM; // 24 hours for others
        const { data: signedUrlData, error: signedUrlError } = await supabase_1.supabase.storage
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
        const { data: publicUrlData } = supabase_1.supabase.storage
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
    }
    catch (error) {
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
async function refreshSignedUrl(filePath, bucket = supabase_1.STORAGE_BUCKETS.AUDIO, expiresIn = supabase_1.SIGNED_URL_EXPIRY.MEDIUM) {
    if (!supabase_1.supabase) {
        return { signedUrl: '', error: 'Supabase client not initialized' };
    }
    try {
        const { data, error } = await supabase_1.supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, expiresIn);
        if (error) {
            return { signedUrl: '', error: error.message };
        }
        return { signedUrl: data.signedUrl };
    }
    catch (error) {
        return { signedUrl: '', error: error.message };
    }
}
/**
 * Delete an audio file from storage
 */
async function deleteAudioFromStorage(filePath, bucket = supabase_1.STORAGE_BUCKETS.AUDIO) {
    if (!supabase_1.supabase) {
        return { success: false, error: 'Supabase client not initialized' };
    }
    try {
        const { error } = await supabase_1.supabase.storage
            .from(bucket)
            .remove([filePath]);
        if (error) {
            return { success: false, error: error.message };
        }
        console.log(`🗑️ Deleted audio file: ${filePath}`);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
}
/**
 * List audio files for a user
 */
async function listUserAudioFiles(userId, category = 'voice', limit = 50) {
    if (!supabase_1.supabase) {
        return { files: [], error: 'Supabase client not initialized' };
    }
    try {
        const bucket = category === 'music' ? supabase_1.STORAGE_BUCKETS.MUSIC : supabase_1.STORAGE_BUCKETS.AUDIO;
        const prefix = `${category}`;
        const { data, error } = await supabase_1.supabase.storage
            .from(bucket)
            .list(prefix, {
            limit,
            search: userId,
        });
        if (error) {
            return { files: [], error: error.message };
        }
        return { files: data || [] };
    }
    catch (error) {
        return { files: [], error: error.message };
    }
}
/**
 * Initialize storage buckets (run once during setup)
 * Note: This requires admin/service role permissions
 */
async function initializeStorageBuckets() {
    if (!supabase_1.supabase) {
        console.error('❌ Cannot initialize buckets: Supabase client not available');
        return;
    }
    const buckets = [
        { name: supabase_1.STORAGE_BUCKETS.VOICE_OUTPUT, public: false }, // Phase 1: Primary voice bucket
        { name: supabase_1.STORAGE_BUCKETS.AUDIO, public: false },
        { name: supabase_1.STORAGE_BUCKETS.MUSIC, public: false },
        { name: supabase_1.STORAGE_BUCKETS.VOICE, public: false },
    ];
    for (const bucket of buckets) {
        try {
            // Check if bucket exists
            const { data: existingBucket } = await supabase_1.supabase.storage.getBucket(bucket.name);
            if (!existingBucket) {
                // Create bucket
                const { error } = await supabase_1.supabase.storage.createBucket(bucket.name, {
                    public: bucket.public,
                    fileSizeLimit: 52428800, // 50MB max file size
                    allowedMimeTypes: Object.values(AUDIO_MIME_TYPES),
                });
                if (error) {
                    console.error(`❌ Failed to create bucket ${bucket.name}:`, error);
                }
                else {
                    console.log(`✅ Created storage bucket: ${bucket.name}`);
                }
            }
            else {
                console.log(`✅ Bucket already exists: ${bucket.name}`);
            }
        }
        catch (error) {
            console.error(`❌ Error initializing bucket ${bucket.name}:`, error);
        }
    }
}
exports.default = {
    uploadAudioToStorage,
    refreshSignedUrl,
    deleteAudioFromStorage,
    listUserAudioFiles,
    initializeStorageBuckets,
};
