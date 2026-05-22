-- Create table for SPARSH KHELOTSAV 2026 registrations

CREATE TABLE IF NOT EXISTS sparsh_khelotsav_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0),
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  category TEXT NOT NULL CHECK (category IN ('Member', 'Kid')),
  selected_sports JSONB NOT NULL,
  sport_ratings JSONB NOT NULL,
  fee_amount INTEGER NOT NULL DEFAULT 500 CHECK (fee_amount = 500),
  is_refundable BOOLEAN NOT NULL DEFAULT false,
  transaction_id TEXT NOT NULL,
  payment_screenshot_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sparsh_khelotsav_registrations_created_at
  ON sparsh_khelotsav_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_sparsh_khelotsav_registrations_mobile
  ON sparsh_khelotsav_registrations(mobile);

ALTER TABLE sparsh_khelotsav_registrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sparsh_khelotsav_registrations'
      AND policyname = 'Allow insert for sparsh khelotsav registrations'
  ) THEN
    CREATE POLICY "Allow insert for sparsh khelotsav registrations"
      ON sparsh_khelotsav_registrations
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
      AND tablename = 'sparsh_khelotsav_registrations'
      AND policyname = 'Allow select for sparsh khelotsav registrations'
  ) THEN
    CREATE POLICY "Allow select for sparsh khelotsav registrations"
      ON sparsh_khelotsav_registrations
      FOR SELECT
      USING (true);
  END IF;
END
$$;
