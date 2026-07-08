-- Add Membership Type field to Orchestra Night registrations

ALTER TABLE orchestra_night_registrations
  ADD COLUMN IF NOT EXISTS membership_type TEXT NOT NULL DEFAULT 'JSG PUNE SPARSH';

ALTER TABLE orchestra_night_registrations
  DROP CONSTRAINT IF EXISTS chk_orchestra_night_membership_type;

ALTER TABLE orchestra_night_registrations
  ADD CONSTRAINT chk_orchestra_night_membership_type
  CHECK (membership_type IN ('JSG PUNE SPARSH', 'OTHER'));

ALTER TABLE orchestra_night_registrations
  ALTER COLUMN membership_type DROP DEFAULT;
