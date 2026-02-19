/**
 * Environment loader — MUST be imported before any module that reads process.env.
 *
 * ES imports are hoisted and execute in declaration order, so this file
 * should be the FIRST import in server.ts.  It loads .env and .env.local
 * synchronously so every subsequent import sees the correct env vars.
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath      = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

// 1. Load .env first (defaults / placeholders)
dotenv.config({ path: envPath });

// 2. Override with .env.local if it exists (real secrets)
if (fs.existsSync(envLocalPath)) {
  console.log('🔐 Loading secrets from .env.local');
  dotenv.config({ path: envLocalPath, override: true });
} else {
  console.log('⚠️ No .env.local found — using .env values');
}
