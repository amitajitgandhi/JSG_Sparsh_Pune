-- Create table for SPARSH Box Cricket Mini Tournament – Season 03 registrations
-- 42-player cap, 6 teams formed via player auction after registrations close.
-- Payment can be cash (paid to one of a fixed set of committee members) or online
-- (QR code + screenshot + OCR-detected transaction reference).

CREATE TABLE IF NOT EXISTS sparsh_box_cricket_mini_tournament_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 16 AND age <= 70),
  category TEXT NOT NULL CHECK (category IN ('Member', 'Kid')),
  skillset TEXT NOT NULL CHECK (skillset IN ('Batsman', 'Bowler', 'Allrounder')),
  cricketing_skill TEXT NOT NULL CHECK (cricketing_skill IN ('Beginner', 'Intermediate', 'Advance', 'Pro')),
  cricheroes_link TEXT,
  photo_url TEXT NOT NULL,
  fee_amount INTEGER NOT NULL DEFAULT 400 CHECK (fee_amount = 400),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'online')),
  cash_paid_to TEXT CHECK (
    cash_paid_to IS NULL OR cash_paid_to IN (
      'Amit Gandhi',
      'Mukesh Jain (MA Hardware)',
      'Satish Jain (Jaliwala)',
      'Jitendra Jain (Unique Ladder)'
    )
  ),
  transaction_reference_number TEXT,
  payment_screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_box_cricket_mini_payment_details CHECK (
    (payment_method = 'cash' AND cash_paid_to IS NOT NULL AND transaction_reference_number IS NULL AND payment_screenshot_url IS NULL)
    OR
    (payment_method = 'online' AND cash_paid_to IS NULL AND transaction_reference_number IS NOT NULL AND payment_screenshot_url IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_sparsh_box_cricket_mini_tournament_registrations_created_at
  ON sparsh_box_cricket_mini_tournament_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_sparsh_box_cricket_mini_tournament_registrations_mobile
  ON sparsh_box_cricket_mini_tournament_registrations(mobile_number);

ALTER TABLE sparsh_box_cricket_mini_tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Registrations go through the server API route (service role), so client-side insert/select
-- policies aren't strictly required, but kept for consistency with every other event table and
-- to allow the admin dashboard/anon client to read rows if it ever queries directly.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sparsh_box_cricket_mini_tournament_registrations'
      AND policyname = 'Allow insert for box cricket mini tournament'
  ) THEN
    CREATE POLICY "Allow insert for box cricket mini tournament"
      ON sparsh_box_cricket_mini_tournament_registrations
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
      AND tablename = 'sparsh_box_cricket_mini_tournament_registrations'
      AND policyname = 'Allow select for box cricket mini tournament'
  ) THEN
    CREATE POLICY "Allow select for box cricket mini tournament"
      ON sparsh_box_cricket_mini_tournament_registrations
      FOR SELECT
      USING (true);
  END IF;
END
$$;
