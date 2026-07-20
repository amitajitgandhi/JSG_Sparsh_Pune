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

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. The transaction-screenshot upload for online payments uses a
--    `membership-fees-ss` bucket (lib/supabase.ts: uploadRegistrationTransactionScreenshot)
--    which doesn't exist yet in this project (only donation-transaction-ss,
--    registration-transaction-ss, and registration-photos currently exist) - create it now,
--    public from the start, so online-payment registrations don't hit the same error.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id)
VALUES ('membership-fees-ss', 'membership-fees-ss', NULL, NOW(), NOW(), true, false, 10485760, '{"image/jpeg","image/jpg","image/png"}', NULL)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can upload to membership-fees-ss'
  ) THEN
    CREATE POLICY "Anyone can upload to membership-fees-ss" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'membership-fees-ss');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Anyone can view membership-fees-ss'
  ) THEN
    CREATE POLICY "Anyone can view membership-fees-ss" ON storage.objects
      FOR SELECT USING (bucket_id = 'membership-fees-ss');
  END IF;
END $$;
