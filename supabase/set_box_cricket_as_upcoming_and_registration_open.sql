-- Run this once in the Supabase SQL editor to:
--   1. Point the home page's "Upcoming Event" button at the Box Cricket Mini Tournament page.
--   2. Explicitly set that event's registration status to "open" (same as the default, but this
--      makes it explicit in app_navigation_settings so the admin dashboard's Registration Status
--      card shows a definitive state rather than an implicit fallback).
--
-- Both rows live in the existing app_navigation_settings table (setting_key/setting_value),
-- the same table the Upcoming Event button already used before this event existed.

INSERT INTO app_navigation_settings (setting_key, setting_value)
VALUES ('upcoming_event_target', '/events/sparsh-box-cricket-mini-tournament-2026')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();

INSERT INTO app_navigation_settings (setting_key, setting_value)
VALUES ('registration_status_sparsh-box-cricket-mini-tournament-2026', 'open')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW();
