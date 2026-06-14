-- Add category column (Kid/Member) for khelotsav players upload
ALTER TABLE khelotsav_players
ADD COLUMN IF NOT EXISTS category TEXT;

-- Optional backfill from sport when values look like category
UPDATE khelotsav_players
SET category = CASE
  WHEN lower(sport) = 'kid' THEN 'Kid'
  WHEN lower(sport) = 'member' THEN 'Member'
  ELSE category
END
WHERE category IS NULL AND sport IS NOT NULL;

CREATE INDEX IF NOT EXISTS khelotsav_players_category_idx ON khelotsav_players (category);
