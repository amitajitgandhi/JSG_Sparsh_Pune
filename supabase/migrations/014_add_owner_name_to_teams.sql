-- Add owner_name field to sports_teams table
ALTER TABLE sports_teams
ADD COLUMN IF NOT EXISTS owner_name TEXT;

-- Create index for potential future queries
CREATE INDEX IF NOT EXISTS idx_sports_teams_owner_name ON sports_teams(owner_name);
