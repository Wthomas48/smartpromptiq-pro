-- ═══════════════════════════════════════════════════════════════════════════════
-- SmartPromptIQ Supabase Storage RLS Policies
-- Run this in your Supabase Dashboard SQL Editor or via Supabase CLI
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Enable RLS on storage.objects (if not already enabled)
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Create storage buckets (if not exists)
-- Note: These should already exist from init-storage-buckets.ts
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('voice-output', 'voice-output', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/webm']),
  ('audio-files', 'audio-files', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/webm']),
  ('music-files', 'music-files', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/webm']),
  ('voice-files', 'voice-files', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/webm'])
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Drop existing policies (clean slate)
-- ═══════════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can upload to voice-output" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own voice-output files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own voice-output files" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to voice-output" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload to audio-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own audio-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own audio-files" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to audio-files" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload to music-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own music-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own music-files" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to music-files" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload to voice-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own voice-files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own voice-files" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access to voice-files" ON storage.objects;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: VOICE-OUTPUT Bucket Policies
-- Files stored as: voice-output/{user_id}/... or voice-output/{date}/{user_id}/...
-- ═══════════════════════════════════════════════════════════════════════════════

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload to voice-output"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-output' AND
  (
    -- Path format: {user_id}/filename.ext
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Path format: {date}/{user_id}/filename.ext
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Policy: Users can only view their own files
CREATE POLICY "Users can view own voice-output files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-output' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own voice-output files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-output' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Policy: Service role has full access (for backend operations)
CREATE POLICY "Service role full access to voice-output"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'voice-output')
WITH CHECK (bucket_id = 'voice-output');

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 5: AUDIO-FILES Bucket Policies
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can upload to audio-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Users can view own audio-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own audio-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Service role full access to audio-files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'audio-files')
WITH CHECK (bucket_id = 'audio-files');

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 6: MUSIC-FILES Bucket Policies
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can upload to music-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'music-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Users can view own music-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'music-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own music-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'music-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Service role full access to music-files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'music-files')
WITH CHECK (bucket_id = 'music-files');

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 7: VOICE-FILES Bucket Policies (Voice clones - most sensitive)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "Users can upload to voice-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Users can view own voice-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own voice-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'voice-files' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Service role full access to voice-files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'voice-files')
WITH CHECK (bucket_id = 'voice-files');

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 8: Admin policies (optional - for admin dashboard)
-- Admins can view all files across all buckets
-- ═══════════════════════════════════════════════════════════════════════════════

-- First, create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'ADMIN',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin read-only access to all buckets (for admin dashboard)
CREATE POLICY "Admins can view all voice-output files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-output' AND
  public.is_admin()
);

CREATE POLICY "Admins can view all audio-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  public.is_admin()
);

CREATE POLICY "Admins can view all music-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'music-files' AND
  public.is_admin()
);

CREATE POLICY "Admins can view all voice-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'voice-files' AND
  public.is_admin()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run these to verify policies)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check all storage policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check buckets:
-- SELECT id, name, public, file_size_limit FROM storage.buckets;

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTES:
-- 1. Backend uses service_role key which bypasses RLS (full access)
-- 2. Frontend (if direct upload) uses anon key and must follow RLS
-- 3. Signed URLs bypass RLS but expire after 10 minutes
-- 4. File paths should always include user_id for proper RLS enforcement
-- ═══════════════════════════════════════════════════════════════════════════════
