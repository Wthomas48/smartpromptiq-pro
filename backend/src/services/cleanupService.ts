/**
 * Cleanup Service - TTL Worker for Auto-Deleting Old Audio Files
 *
 * Purpose: Keep Supabase storage costs low by automatically deleting old files
 *
 * Strategy:
 * - Run every 24 hours (via cron or scheduled task)
 * - Delete files older than X days (default: 7 days)
 * - Targets both voice-output and music-output buckets
 *
 * Usage:
 *   - As a cron job: node -e "require('./cleanupService').runCleanup()"
 *   - Via API endpoint: POST /api/admin/cleanup
 *   - Scheduled: setInterval(runCleanup, 24 * 60 * 60 * 1000)
 */

import {
  supabase,
  VOICE_OUTPUT_BUCKET,
  MUSIC_OUTPUT_BUCKET,
  STORAGE_BUCKETS,
} from '../lib/supabase';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Default retention period in days
 * Files older than this will be deleted
 */
export const DEFAULT_RETENTION_DAYS = 7;

/**
 * Maximum files to delete per batch (to avoid timeout)
 */
export const MAX_BATCH_SIZE = 100;

/**
 * Delay between batches in ms (to avoid rate limiting)
 */
export const BATCH_DELAY_MS = 1000;

// =============================================================================
// TYPES
// =============================================================================

export interface CleanupResult {
  success: boolean;
  bucket: string;
  filesDeleted: number;
  filesSkipped: number;
  errors: string[];
  duration: number;
}

export interface CleanupSummary {
  success: boolean;
  totalFilesDeleted: number;
  totalFilesSkipped: number;
  totalErrors: number;
  results: CleanupResult[];
  duration: number;
  timestamp: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the cutoff date for file deletion
 */
function getCutoffDate(retentionDays: number): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  return cutoff;
}

/**
 * Parse date from file path (expects format: YYYY-MM-DD/timestamp-filename)
 */
function getFileDateFromPath(filePath: string): Date | null {
  try {
    // Try to extract date from path (e.g., "2024-12-14/1702567890123-voice.mp3")
    const dateMatch = filePath.match(/^(\d{4}-\d{2}-\d{2})\//);
    if (dateMatch) {
      return new Date(dateMatch[1]);
    }

    // Try to extract timestamp from filename
    const timestampMatch = filePath.match(/\/(\d{13})-/);
    if (timestampMatch) {
      return new Date(parseInt(timestampMatch[1]));
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =============================================================================
// CLEANUP FUNCTIONS
// =============================================================================

/**
 * Clean up a single bucket
 *
 * @param bucket - Bucket name to clean
 * @param retentionDays - Number of days to retain files
 * @returns CleanupResult with details
 */
export async function cleanupBucket(
  bucket: string,
  retentionDays: number = DEFAULT_RETENTION_DAYS
): Promise<CleanupResult> {
  const startTime = Date.now();
  const result: CleanupResult = {
    success: true,
    bucket,
    filesDeleted: 0,
    filesSkipped: 0,
    errors: [],
    duration: 0,
  };

  if (!supabase) {
    result.success = false;
    result.errors.push('Supabase client not initialized');
    result.duration = Date.now() - startTime;
    return result;
  }

  const cutoffDate = getCutoffDate(retentionDays);
  console.log(`🧹 Cleaning bucket "${bucket}" - Deleting files older than ${cutoffDate.toISOString()}`);

  try {
    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    if (listError) {
      result.success = false;
      result.errors.push(`Failed to list files: ${listError.message}`);
      result.duration = Date.now() - startTime;
      return result;
    }

    if (!files || files.length === 0) {
      console.log(`   No files found in bucket "${bucket}"`);
      result.duration = Date.now() - startTime;
      return result;
    }

    console.log(`   Found ${files.length} files to check`);

    // Process files in date folders
    const filesToDelete: string[] = [];

    for (const item of files) {
      // If it's a folder (date folder like "2024-12-14"), list its contents
      if (item.id === null) {
        const folderName = item.name;
        const folderDate = new Date(folderName);

        // If the entire folder is older than cutoff, mark all files for deletion
        if (!isNaN(folderDate.getTime()) && folderDate < cutoffDate) {
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from(bucket)
            .list(folderName, { limit: 1000 });

          if (folderError) {
            result.errors.push(`Failed to list folder ${folderName}: ${folderError.message}`);
            continue;
          }

          if (folderFiles) {
            for (const file of folderFiles) {
              if (file.id !== null) {
                filesToDelete.push(`${folderName}/${file.name}`);
              }
            }
          }
        }
      } else {
        // It's a file at root level - check its date
        const fileDate = getFileDateFromPath(item.name);
        if (fileDate && fileDate < cutoffDate) {
          filesToDelete.push(item.name);
        } else {
          result.filesSkipped++;
        }
      }
    }

    console.log(`   Files to delete: ${filesToDelete.length}`);

    // Delete files in batches
    for (let i = 0; i < filesToDelete.length; i += MAX_BATCH_SIZE) {
      const batch = filesToDelete.slice(i, i + MAX_BATCH_SIZE);

      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove(batch);

      if (deleteError) {
        result.errors.push(`Batch delete error: ${deleteError.message}`);
        console.error(`   ❌ Failed to delete batch: ${deleteError.message}`);
      } else {
        result.filesDeleted += batch.length;
        console.log(`   ✅ Deleted ${batch.length} files (${result.filesDeleted}/${filesToDelete.length})`);
      }

      // Delay between batches to avoid rate limiting
      if (i + MAX_BATCH_SIZE < filesToDelete.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.success = false;
    result.errors.push(`Unexpected error: ${errorMessage}`);
    console.error(`   ❌ Cleanup error: ${errorMessage}`);
  }

  result.duration = Date.now() - startTime;
  return result;
}

/**
 * Run cleanup on all audio buckets
 *
 * @param retentionDays - Number of days to retain files
 * @returns CleanupSummary with overall results
 */
export async function runCleanup(
  retentionDays: number = DEFAULT_RETENTION_DAYS
): Promise<CleanupSummary> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log('');
  console.log('='.repeat(60));
  console.log(`🧹 AUDIO CLEANUP WORKER - ${timestamp}`);
  console.log(`   Retention: ${retentionDays} days`);
  console.log(`   Buckets: ${Object.values(STORAGE_BUCKETS).join(', ')}`);
  console.log('='.repeat(60));

  const results: CleanupResult[] = [];

  // Clean each bucket
  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    const result = await cleanupBucket(bucket, retentionDays);
    results.push(result);
  }

  // Calculate summary
  const totalFilesDeleted = results.reduce((sum, r) => sum + r.filesDeleted, 0);
  const totalFilesSkipped = results.reduce((sum, r) => sum + r.filesSkipped, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const overallSuccess = results.every((r) => r.success) && totalErrors === 0;
  const duration = Date.now() - startTime;

  console.log('');
  console.log('-'.repeat(60));
  console.log('CLEANUP SUMMARY');
  console.log('-'.repeat(60));
  console.log(`   Status: ${overallSuccess ? '✅ SUCCESS' : '⚠️ COMPLETED WITH ERRORS'}`);
  console.log(`   Files deleted: ${totalFilesDeleted}`);
  console.log(`   Files skipped: ${totalFilesSkipped}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Duration: ${duration}ms`);
  console.log('='.repeat(60));
  console.log('');

  return {
    success: overallSuccess,
    totalFilesDeleted,
    totalFilesSkipped,
    totalErrors,
    results,
    duration,
    timestamp,
  };
}

/**
 * Delete a specific file from storage
 *
 * @param bucket - Bucket name
 * @param filePath - Full path to file
 * @returns Success status
 */
export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Get storage statistics for a bucket
 *
 * @param bucket - Bucket name
 * @returns Stats including file count and total size
 */
export async function getBucketStats(
  bucket: string
): Promise<{
  success: boolean;
  fileCount: number;
  totalSize: number;
  oldestFile?: string;
  newestFile?: string;
  error?: string;
}> {
  if (!supabase) {
    return { success: false, fileCount: 0, totalSize: 0, error: 'Supabase client not initialized' };
  }

  try {
    // List files with metadata
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: 1000 });

    if (error) {
      return { success: false, fileCount: 0, totalSize: 0, error: error.message };
    }

    if (!files || files.length === 0) {
      return { success: true, fileCount: 0, totalSize: 0 };
    }

    // Count files (recursively check folders)
    let fileCount = 0;
    let totalSize = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;
    let oldestFile: string | undefined;
    let newestFile: string | undefined;

    for (const item of files) {
      if (item.id === null) {
        // It's a folder - list contents
        const { data: folderFiles } = await supabase.storage
          .from(bucket)
          .list(item.name, { limit: 1000 });

        if (folderFiles) {
          fileCount += folderFiles.filter((f) => f.id !== null).length;
        }
      } else {
        fileCount++;
        // Note: Supabase doesn't return file size in list
        // Would need to fetch each file's metadata for accurate size
      }

      // Track dates from folder names
      const folderDate = new Date(item.name);
      if (!isNaN(folderDate.getTime())) {
        if (!oldestDate || folderDate < oldestDate) {
          oldestDate = folderDate;
          oldestFile = item.name;
        }
        if (!newestDate || folderDate > newestDate) {
          newestDate = folderDate;
          newestFile = item.name;
        }
      }
    }

    return {
      success: true,
      fileCount,
      totalSize,
      oldestFile,
      newestFile,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, fileCount: 0, totalSize: 0, error: errorMessage };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  runCleanup,
  cleanupBucket,
  deleteFile,
  getBucketStats,
  DEFAULT_RETENTION_DAYS,
  MAX_BATCH_SIZE,
};
