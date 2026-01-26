"use strict";
/**
 * Supabase Configuration for Backend
 *
 * This module provides the Supabase client for server-side operations,
 * particularly for Storage operations (audio file uploads).
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNED_URL_EXPIRY = exports.STORAGE_BUCKETS = exports.supabase = exports.getSupabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
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
let supabaseInstance = null;
const getSupabaseClient = () => {
    if (!supabaseInstance && SUPABASE_URL && supabaseKey) {
        supabaseInstance = (0, supabase_js_1.createClient)(SUPABASE_URL, supabaseKey, {
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
exports.getSupabaseClient = getSupabaseClient;
// Export a default instance
exports.supabase = SUPABASE_URL && supabaseKey
    ? (0, supabase_js_1.createClient)(SUPABASE_URL, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;
// Storage bucket configuration
exports.STORAGE_BUCKETS = {
    VOICE_OUTPUT: 'voice-output', // Primary bucket for generated speech audio
    AUDIO: 'audio-files',
    MUSIC: 'music-files',
    VOICE: 'voice-files',
};
// Signed URL expiration (in seconds)
exports.SIGNED_URL_EXPIRY = {
    VOICE_OUTPUT: 600, // 10 minutes - Phase 1 requirement
    SHORT: 3600, // 1 hour
    MEDIUM: 86400, // 24 hours
    LONG: 604800, // 7 days
};
exports.default = exports.supabase;
