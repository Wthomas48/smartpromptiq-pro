/**
 * Supabase Configuration for Backend
 *
 * This module provides the Supabase client for server-side operations,
 * particularly for Storage operations (audio file uploads).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable');
}

// Use service role key for backend operations (bypasses RLS)
// Falls back to anon key if service role not available
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase key (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)');
}

// Create singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance && SUPABASE_URL && supabaseKey) {
    supabaseInstance = createClient(SUPABASE_URL, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('✅ Supabase client initialized for backend');
  }

  if (!supabaseInstance) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }

  return supabaseInstance;
};

// Export a default instance
export const supabase = SUPABASE_URL && supabaseKey
  ? createClient(SUPABASE_URL, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Storage bucket configuration
export const STORAGE_BUCKETS = {
  VOICE_OUTPUT: 'voice-output',  // Primary bucket for generated speech audio
  AUDIO: 'audio-files',
  MUSIC: 'music-files',
  VOICE: 'voice-files',
} as const;

// Signed URL expiration (in seconds)
export const SIGNED_URL_EXPIRY = {
  VOICE_OUTPUT: 600,  // 10 minutes - Phase 1 requirement
  SHORT: 3600,        // 1 hour
  MEDIUM: 86400,      // 24 hours
  LONG: 604800,       // 7 days
} as const;

export default supabase;
