CREATE TABLE IF NOT EXISTS adventure_escape_interest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  member_type TEXT NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  kids INTEGER NOT NULL DEFAULT 0,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_number TEXT NOT NULL,
  rafting_addon BOOLEAN NOT NULL DEFAULT false,
  rafting_eligible_count INTEGER,
  rafting_eligibility_confirmed BOOLEAN NOT NULL DEFAULT false,
  risk_terms_accepted BOOLEAN NOT NULL DEFAULT false,
  amount_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT chk_adventure_escape_mobile CHECK (mobile ~ '^[0-9]{10}$'),
  CONSTRAINT chk_adventure_escape_emergency_mobile CHECK (emergency_contact_number ~ '^[0-9]{10}$'),
  CONSTRAINT chk_adventure_escape_counts CHECK (adults >= 0 AND kids >= 0),
  CONSTRAINT chk_adventure_escape_rafting_count CHECK (rafting_eligible_count IS NULL OR rafting_eligible_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_adventure_escape_interest_created_at ON adventure_escape_interest(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adventure_escape_interest_mobile ON adventure_escape_interest(mobile);

ALTER TABLE adventure_escape_interest ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'adventure_escape_interest'
      AND policyname = 'Allow admin all adventure_escape_interest'
  ) THEN
    CREATE POLICY "Allow admin all adventure_escape_interest"
      ON adventure_escape_interest
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
