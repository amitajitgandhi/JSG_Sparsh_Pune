-- Create table for Healing Harmony 2026 - Orchestra Night registrations

CREATE TABLE IF NOT EXISTS orchestra_night_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  passes INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_orchestra_night_mobile CHECK (mobile ~ '^[0-9]{10}$'),
  CONSTRAINT chk_orchestra_night_passes CHECK (passes >= 1 AND passes <= 7)
);

CREATE INDEX IF NOT EXISTS idx_orchestra_night_registrations_created_at
  ON orchestra_night_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_orchestra_night_registrations_mobile
  ON orchestra_night_registrations(mobile);

ALTER TABLE orchestra_night_registrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orchestra_night_registrations'
      AND policyname = 'Allow insert for orchestra night registrations'
  ) THEN
    CREATE POLICY "Allow insert for orchestra night registrations"
      ON orchestra_night_registrations
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orchestra_night_registrations'
      AND policyname = 'Allow select for orchestra night registrations'
  ) THEN
    CREATE POLICY "Allow select for orchestra night registrations"
      ON orchestra_night_registrations
      FOR SELECT
      USING (true);
  END IF;
END
$$;
