-- Create table for Hampi Heritage & Adoni Tirth Expedition registrations (1st-4th Oct 2026).
-- Registration is per family/group (a headcount per age tier), not per individual. Payment is
-- NOT collected through this form - it's cash, collected in person at a collection centre after
-- registration, so there are no payment-method/screenshot/transaction fields here. There is
-- intentionally no slot-cap column or enforcement anywhere for this event.

CREATE TABLE IF NOT EXISTS sparsh_hampi_heritage_adoni_tirth_2026_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  adult_count INTEGER NOT NULL DEFAULT 0 CHECK (adult_count >= 0),
  child_above8_count INTEGER NOT NULL DEFAULT 0 CHECK (child_above8_count >= 0),
  child_5_to_8_count INTEGER NOT NULL DEFAULT 0 CHECK (child_5_to_8_count >= 0),
  child_below5_count INTEGER NOT NULL DEFAULT 0 CHECK (child_below5_count >= 0),
  travel_mode TEXT NOT NULL CHECK (travel_mode IN ('Own Transportation', 'Bus', 'AC Train', 'Sleeper Train')),
  -- Below-5 children travel free without a dedicated seat/berth by default; this is only ticked
  -- when a family wants a separate seat booked for a below-5 child anyway.
  below5_needs_seat BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_hampi_2026_at_least_one_adult CHECK (adult_count >= 1),
  CONSTRAINT chk_hampi_2026_has_members CHECK (
    adult_count + child_above8_count + child_5_to_8_count + child_below5_count >= 1
  )
);

CREATE INDEX IF NOT EXISTS idx_hampi_2026_created_at
  ON sparsh_hampi_heritage_adoni_tirth_2026_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_hampi_2026_mobile
  ON sparsh_hampi_heritage_adoni_tirth_2026_registrations(mobile_number);

-- Duplicate-prevention: same contact name (case-insensitive) + same mobile number should only be
-- registerable once (standard pattern for every event - see event-creator skill).
CREATE UNIQUE INDEX IF NOT EXISTS idx_hampi_2026_name_mobile_unique
  ON sparsh_hampi_heritage_adoni_tirth_2026_registrations (LOWER(TRIM(primary_name)), mobile_number);

ALTER TABLE sparsh_hampi_heritage_adoni_tirth_2026_registrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'sparsh_hampi_heritage_adoni_tirth_2026_registrations'
      AND policyname = 'Allow insert for hampi 2026'
  ) THEN
    CREATE POLICY "Allow insert for hampi 2026"
      ON sparsh_hampi_heritage_adoni_tirth_2026_registrations
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
      AND tablename = 'sparsh_hampi_heritage_adoni_tirth_2026_registrations'
      AND policyname = 'Allow select for hampi 2026'
  ) THEN
    CREATE POLICY "Allow select for hampi 2026"
      ON sparsh_hampi_heritage_adoni_tirth_2026_registrations
      FOR SELECT
      USING (true);
  END IF;
END
$$;
