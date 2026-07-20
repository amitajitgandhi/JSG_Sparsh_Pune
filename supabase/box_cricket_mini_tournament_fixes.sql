-- Fixes for SPARSH Box Cricket Mini Tournament - Season 03
-- Run this once in the Supabase SQL editor.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Prevent duplicate registrations: same name (case-insensitive) + same mobile
--    number should only be allowed once. The API route now also does a pre-check
--    query for a friendlier error message - this index is the DB-level backstop
--    for concurrent submissions.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_box_cricket_mini_name_mobile_unique
  ON sparsh_box_cricket_mini_tournament_registrations (LOWER(TRIM(name)), mobile_number);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. "Bucket not found" on player photo upload: the `registration-photos` bucket
--    exists but isn't marked public, which causes the anon-key client used by
--    uploadPhoto() to fail resolving it. Mark it public (matching the other two
--    working buckets) and make sure permissive upload/view policies exist.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE storage.buckets
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = '{"image/jpeg","image/jpg","image/png","image/heic"}'
WHERE id = 'registration-photos';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can upload to registration-photos'
  ) THEN
    CREATE POLICY "Anyone can upload to registration-photos" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'registration-photos');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can view registration-photos'
  ) THEN
    CREATE POLICY "Anyone can view registration-photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'registration-photos');
  END IF;
END $$;

-- Note: the transaction-screenshot upload for this event now targets the existing
-- `registration-transaction-ss` bucket (already Public, already has its own policies) instead of
-- creating a new `membership-fees-ss` bucket - see app/events/sparsh-box-cricket-mini-tournament-2026/
-- utils.ts (uploadTransactionScreenshot). No bucket changes needed for that one.
