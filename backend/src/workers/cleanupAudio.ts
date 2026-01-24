/**
 * Audio Cleanup Worker
 *
 * Deletes old audio files from Supabase Storage to keep costs low.
 *
 * Run via:
 * - Railway cron
 * - GitHub Actions
 * - Supabase Edge Function
 * - Simple setInterval job
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn("⚠️ Supabase not configured - audio cleanup disabled");
    return null;
  }

  supabase = createClient(url, key);
  return supabase;
}

const BUCKETS = ["voice-output", "music-output"];
const MAX_AGE_DAYS = 7;

/**
 * Delete files older than MAX_AGE_DAYS from all audio buckets
 */
export async function cleanupOldFiles(): Promise<{
  success: boolean;
  deleted: number;
  errors: string[];
}> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      success: false,
      deleted: 0,
      errors: ["Supabase not configured - skipping cleanup"],
    };
  }

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  let deleted = 0;
  const errors: string[] = [];

  console.log(`🧹 Cleanup: Deleting files older than ${MAX_AGE_DAYS} days`);

  for (const bucket of BUCKETS) {
    try {
      const { data: files, error } = await client.storage
        .from(bucket)
        .list("", { limit: 1000 });

      if (error) {
        errors.push(`${bucket}: ${error.message}`);
        continue;
      }

      for (const file of files || []) {
        // Skip folders (they have null id)
        if (file.id === null) {
          // List folder contents
          const { data: folderFiles } = await client.storage
            .from(bucket)
            .list(file.name, { limit: 1000 });

          for (const f of folderFiles || []) {
            if (f.created_at && new Date(f.created_at).getTime() < cutoff) {
              const { error: delError } = await client.storage
                .from(bucket)
                .remove([`${file.name}/${f.name}`]);

              if (!delError) deleted++;
            }
          }
          continue;
        }

        // Direct file
        if (file.created_at && new Date(file.created_at).getTime() < cutoff) {
          const { error: delError } = await client.storage
            .from(bucket)
            .remove([file.name]);

          if (!delError) deleted++;
        }
      }

      console.log(`   ✅ ${bucket}: processed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`${bucket}: ${msg}`);
    }
  }

  console.log(`🧹 Cleanup complete: ${deleted} files deleted`);

  return {
    success: errors.length === 0,
    deleted,
    errors,
  };
}

/**
 * Start cleanup on an interval (for simple deployment)
 * @param intervalHours - Hours between cleanups (default: 24)
 */
export function startCleanupScheduler(intervalHours: number = 24): void {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`⏰ Cleanup scheduler started (every ${intervalHours}h)`);

  // Run immediately on start
  cleanupOldFiles().catch(console.error);

  // Then run on interval
  setInterval(() => {
    cleanupOldFiles().catch(console.error);
  }, intervalMs);
}

// Export for direct execution
export default cleanupOldFiles;

// Allow direct execution: npx ts-node src/workers/cleanupAudio.ts
if (require.main === module) {
  cleanupOldFiles()
    .then((result) => {
      console.log("Result:", result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}
