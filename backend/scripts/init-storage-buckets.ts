/**
 * Initialize Supabase Storage Buckets
 *
 * Run this script once to create the required storage buckets for audio files.
 *
 * Usage:
 *   npx ts-node scripts/init-storage-buckets.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Audio MIME types allowed
const AUDIO_MIME_TYPES = [
  'audio/mpeg',      // mp3
  'audio/wav',       // wav
  'audio/ogg',       // ogg
  'audio/mp4',       // m4a
  'audio/webm',      // webm
];

// Buckets to create
const BUCKETS = [
  {
    name: 'voice-output',
    public: false,
    description: 'Phase 1: Primary bucket for AI-generated speech audio (10-min signed URLs)',
  },
  {
    name: 'audio-files',
    public: false,
    description: 'AI-generated speech and voice files',
  },
  {
    name: 'music-files',
    public: false,
    description: 'AI-generated music tracks',
  },
  {
    name: 'voice-files',
    public: false,
    description: 'Voice clones and samples',
  },
];

async function initializeBuckets() {
  console.log('🚀 Initializing Supabase Storage Buckets...\n');

  for (const bucket of BUCKETS) {
    try {
      // Check if bucket exists
      const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucket.name);

      if (existingBucket) {
        console.log(`✅ Bucket "${bucket.name}" already exists`);
        continue;
      }

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: 52428800, // 50MB max file size
        allowedMimeTypes: AUDIO_MIME_TYPES,
      });

      if (error) {
        console.error(`❌ Failed to create bucket "${bucket.name}":`, error.message);
      } else {
        console.log(`✅ Created bucket "${bucket.name}" - ${bucket.description}`);
      }

    } catch (error: any) {
      console.error(`❌ Error with bucket "${bucket.name}":`, error.message);
    }
  }

  console.log('\n📦 Storage bucket initialization complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Add your ElevenLabs API key to .env');
  console.log('   2. Configure RLS policies in Supabase Dashboard if needed');
  console.log('   3. Test the audio generation endpoint: POST /api/audio/generate-speech');
}

// Run initialization
initializeBuckets().catch(console.error);
