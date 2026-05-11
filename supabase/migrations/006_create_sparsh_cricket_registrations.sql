-- Create table for Sparsh Cricket Championship – Season 02 registrations

CREATE TABLE IF NOT EXISTS sparsh_cricket_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 8 AND age <= 70),
  category TEXT NOT NULL CHECK (category IN ('Member', 'Kid')),
  skillset TEXT NOT NULL CHECK (skillset IN ('Batsman', 'Bowler', 'Allrounder')),
  fullarm_bowling TEXT NOT NULL CHECK (fullarm_bowling IN ('Yes', 'No')),
  cricheroes_link TEXT,
  cricketing_skill TEXT NOT NULL CHECK (cricketing_skill IN ('Beginner', 'Intermediate', 'Advance', 'Pro')),
  jersey_size TEXT NOT NULL CHECK (jersey_size IN ('3XL - 46', 'XXL - 44', 'XL - 42', 'L - 40', 'M - 38', 'S - 36')),
  fees TEXT NOT NULL DEFAULT '₹700',
  payment_screenshot_url TEXT NOT NULL,
  transaction_reference_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sparsh_cricket_registrations_created_at
  ON sparsh_cricket_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_sparsh_cricket_registrations_mobile
  ON sparsh_cricket_registrations(mobile_number);

ALTER TABLE sparsh_cricket_registrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sparsh_cricket_registrations'
      AND policyname = 'Allow insert for sparsh cricket registrations'
  ) THEN
    CREATE POLICY "Allow insert for sparsh cricket registrations"
      ON sparsh_cricket_registrations
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
      AND tablename = 'sparsh_cricket_registrations'
      AND policyname = 'Allow select for sparsh cricket registrations'
  ) THEN
    CREATE POLICY "Allow select for sparsh cricket registrations"
      ON sparsh_cricket_registrations
      FOR SELECT
      USING (true);
  END IF;
END
$$;
