-- Run this once in the Supabase SQL editor.
-- Adds a second online payment QR option (Rashmi Gugale, alongside the existing Amit Gandhi) by
-- adding an `online_paid_to` column, mirroring the existing `cash_paid_to` column.

ALTER TABLE sparsh_box_cricket_mini_tournament_registrations
  ADD COLUMN IF NOT EXISTS online_paid_to TEXT
  CHECK (online_paid_to IS NULL OR online_paid_to IN ('Amit Gandhi', 'Rashmi Gugale'));

-- Backfill existing online registrations (all made before the Rashmi Gugale option existed) to
-- Amit Gandhi, so the stricter constraint below doesn't reject rows that predate this column.
UPDATE sparsh_box_cricket_mini_tournament_registrations
SET online_paid_to = 'Amit Gandhi'
WHERE payment_method = 'online' AND online_paid_to IS NULL;

-- Update the payment-details mutual-exclusivity constraint to also require online_paid_to for
-- online payments (and forbid it for cash), matching the existing cash_paid_to pattern.
ALTER TABLE sparsh_box_cricket_mini_tournament_registrations
  DROP CONSTRAINT IF EXISTS chk_box_cricket_mini_payment_details;

ALTER TABLE sparsh_box_cricket_mini_tournament_registrations
  ADD CONSTRAINT chk_box_cricket_mini_payment_details CHECK (
    (payment_method = 'cash' AND cash_paid_to IS NOT NULL AND online_paid_to IS NULL AND transaction_reference_number IS NULL AND payment_screenshot_url IS NULL)
    OR
    (payment_method = 'online' AND cash_paid_to IS NULL AND online_paid_to IS NOT NULL AND transaction_reference_number IS NOT NULL AND payment_screenshot_url IS NOT NULL)
  );
