-- Add jersey size to SPARSH KHELOTSAV 2026 registrations

ALTER TABLE IF EXISTS public.sparsh_khelotsav_registrations
ADD COLUMN IF NOT EXISTS jersey_size TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN public.sparsh_khelotsav_registrations.jersey_size IS 'Jersey size selected for Member registrations. Empty for non-member registrations.';
