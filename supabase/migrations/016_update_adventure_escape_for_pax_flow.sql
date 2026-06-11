ALTER TABLE adventure_escape_interest
  ALTER COLUMN employee_id DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN emergency_contact_name DROP NOT NULL,
  ALTER COLUMN emergency_contact_number DROP NOT NULL;

ALTER TABLE adventure_escape_interest
  ADD COLUMN IF NOT EXISTS pax_mode TEXT,
  ADD COLUMN IF NOT EXISTS kids_5_8_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kids_8_plus_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS guest_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coming_by_own_car BOOLEAN,
  ADD COLUMN IF NOT EXISTS rafting_count INTEGER,
  ADD COLUMN IF NOT EXISTS payment_note TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_adventure_escape_kids_5_8_count'
  ) THEN
    ALTER TABLE adventure_escape_interest
      ADD CONSTRAINT chk_adventure_escape_kids_5_8_count CHECK (kids_5_8_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_adventure_escape_kids_8_plus_count'
  ) THEN
    ALTER TABLE adventure_escape_interest
      ADD CONSTRAINT chk_adventure_escape_kids_8_plus_count CHECK (kids_8_plus_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_adventure_escape_guest_count'
  ) THEN
    ALTER TABLE adventure_escape_interest
      ADD CONSTRAINT chk_adventure_escape_guest_count CHECK (guest_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_adventure_escape_rafting_count_nonneg'
  ) THEN
    ALTER TABLE adventure_escape_interest
      ADD CONSTRAINT chk_adventure_escape_rafting_count_nonneg CHECK (rafting_count IS NULL OR rafting_count >= 0);
  END IF;
END $$;
