-- Update fee_amount constraint for SPARSH KHELOTSAV 2026 registrations
-- Supports:
-- 0   = Female Member / no payment required
-- 500 = Male Member
-- 600 = Kid age 5-9
-- 900 = Kid age 10+

ALTER TABLE IF EXISTS public.sparsh_khelotsav_registrations
DROP CONSTRAINT IF EXISTS sparsh_khelotsav_registrations_fee_amount_check;

ALTER TABLE IF EXISTS public.sparsh_khelotsav_registrations
ADD CONSTRAINT sparsh_khelotsav_registrations_fee_amount_check
CHECK (fee_amount IN (0, 500, 600, 900));
