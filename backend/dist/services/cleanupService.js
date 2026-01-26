"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BATCH_DELAY_MS = exports.MAX_BATCH_SIZE = exports.DEFAULT_RETENTION_DAYS = void 0;
exports.cleanupBucket = cleanupBucket;
exports.runCleanup = runCleanup;
exports.deleteFile = deleteFile;
exports.getBucketStats = getBucketStats;
const supabase_1 = require("../lib/supabase");
// =============================================================================
// CONFIGURATION
// =============================================================================
/**
 * Default retention period in days
 * Files older than this will be deleted
 */
exports.DEFAULT_RETENTION_DAYS = 7;
/**
 * Maximum files to delete per batch (to avoid timeout)
 */
exports.MAX_BATCH_SIZE = 100;
/**
 * Delay between batches in ms (to avoid rate limiting)
 */
exports.BATCH_DELAY_MS = 1000;
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Get the cutoff date for file deletion
 */
function getCutoffDate(retentionDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    return cutoff;
}
/**
 * Parse date from file path (expects format: YYYY-MM-DD/timestamp-filename)
 */
function getFileDateFromPath(filePath) {
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
    }
    catch {
        return null;
    }
}
/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
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
async function cleanupBucket(bucket, retentionDays = exports.DEFAULT_RETENTION_DAYS) {
    const startTime = Date.now();
    const result = {
        success: true,
        bucket,
        filesDeleted: 0,
        filesSkipped: 0,
        errors: [],
        duration: 0,
    };
    if (!supabase_1.supabase) {
        result.success = false;
        result.errors.push('Supabase client not initialized');
        result.duration = Date.now() - startTime;
        return result;
    }
    const cutoffDate = getCutoffDate(retentionDays);
    console.log(`🧹 Cleaning bucket "${bucket}" - Deleting files older than ${cutoffDate.toISOString()}`);
    try {
        // List all files in the bucket
        const { data: files, error: listError } = await supabase_1.supabase.storage
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
        const filesToDelete = [];
        for (const item of files) {
            // If it's a folder (date folder like "2024-12-14"), list its contents
            if (item.id === null) {
                const folderName = item.name;
                const folderDate = new Date(folderName);
                // If the entire folder is older than cutoff, mark all files for deletion
                if (!isNaN(folderDate.getTime()) && folderDate < cutoffDate) {
                    const { data: folderFiles, error: folderError } = await supabase_1.supabase.storage
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
            }
            else {
                // It's a file at root level - check its date
                const fileDate = getFileDateFromPath(item.name);
                if (fileDate && fileDate < cutoffDate) {
                    filesToDelete.push(item.name);
                }
                else {
                    result.filesSkipped++;
                }
            }
        }
        console.log(`   Files to delete: ${filesToDelete.length}`);
        // Delete files in batches
        for (let i = 0; i < filesToDelete.length; i += exports.MAX_BATCH_SIZE) {
            const batch = filesToDelete.slice(i, i + exports.MAX_BATCH_SIZE);
            const { error: deleteError } = await supabase_1.supabase.storage
                .from(bucket)
                .remove(batch);
            if (deleteError) {
                result.errors.push(`Batch delete error: ${deleteError.message}`);
                console.error(`   ❌ Failed to delete batch: ${deleteError.message}`);
            }
            else {
                result.filesDeleted += batch.length;
                console.log(`   ✅ Deleted ${batch.length} files (${result.filesDeleted}/${filesToDelete.length})`);
            }
            // Delay between batches to avoid rate limiting
            if (i + exports.MAX_BATCH_SIZE < filesToDelete.length) {
                await sleep(exports.BATCH_DELAY_MS);
            }
        }
    }
    catch (error) {
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
async function runCleanup(retentionDays = exports.DEFAULT_RETENTION_DAYS) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    console.log('');
    console.log('='.repeat(60));
    console.log(`🧹 AUDIO CLEANUP WORKER - ${timestamp}`);
    console.log(`   Retention: ${retentionDays} days`);
    console.log(`   Buckets: ${Object.values(supabase_1.STORAGE_BUCKETS).join(', ')}`);
    console.log('='.repeat(60));
    const results = [];
    // Clean each bucket
    for (const bucket of Object.values(supabase_1.STORAGE_BUCKETS)) {
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
async function deleteFile(bucket, filePath) {
    if (!supabase_1.supabase) {
        return { success: false, error: 'Supabase client not initialized' };
    }
    try {
        const { error } = await supabase_1.supabase.storage.from(bucket).remove([filePath]);
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    }
    catch (error) {
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
async function getBucketStats(bucket) {
    if (!supabase_1.supabase) {
        return { success: false, fileCount: 0, totalSize: 0, error: 'Supabase client not initialized' };
    }
    try {
        // List files with metadata
        const { data: files, error } = await supabase_1.supabase.storage
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
        let oldestDate = null;
        let newestDate = null;
        let oldestFile;
        let newestFile;
        for (const item of files) {
            if (item.id === null) {
                // It's a folder - list contents
                const { data: folderFiles } = await supabase_1.supabase.storage
                    .from(bucket)
                    .list(item.name, { limit: 1000 });
                if (folderFiles) {
                    fileCount += folderFiles.filter((f) => f.id !== null).length;
                }
            }
            else {
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
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, fileCount: 0, totalSize: 0, error: errorMessage };
    }
}
// =============================================================================
// EXPORTS
// =============================================================================
exports.default = {
    runCleanup,
    cleanupBucket,
    deleteFile,
    getBucketStats,
    DEFAULT_RETENTION_DAYS: exports.DEFAULT_RETENTION_DAYS,
    MAX_BATCH_SIZE: exports.MAX_BATCH_SIZE,
};
