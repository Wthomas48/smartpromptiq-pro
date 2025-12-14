#!/usr/bin/env ts-node
/**
 * Storage Cleanup Script
 *
 * Run this script to clean up old audio files from Supabase Storage.
 * Can be scheduled as a cron job.
 *
 * Usage:
 *   npx ts-node scripts/cleanup-storage.ts
 *   npx ts-node scripts/cleanup-storage.ts --days=14
 *
 * Cron example (run daily at 3 AM):
 *   0 3 * * * cd /path/to/backend && npx ts-node scripts/cleanup-storage.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { runCleanup, DEFAULT_RETENTION_DAYS } from '../src/services/cleanupService';

// Parse command line arguments
const args = process.argv.slice(2);
let retentionDays = DEFAULT_RETENTION_DAYS;

for (const arg of args) {
  if (arg.startsWith('--days=')) {
    const days = parseInt(arg.split('=')[1]);
    if (!isNaN(days) && days > 0) {
      retentionDays = days;
    }
  }
}

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           SUPABASE STORAGE CLEANUP SCRIPT                    ║
╠══════════════════════════════════════════════════════════════╣
║  This script deletes audio files older than ${String(retentionDays).padStart(2)} days          ║
║  to keep storage costs low.                                  ║
╚══════════════════════════════════════════════════════════════╝
`);

async function main() {
  try {
    const result = await runCleanup(retentionDays);

    if (result.success) {
      console.log('✅ Cleanup completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️ Cleanup completed with errors');
      console.log('Errors:', result.results.flatMap((r) => r.errors));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();
