-- ─────────────────────────────────────────────────────────────────────────────
-- 011_tournament_management.sql
-- Khelotsav Tournament Management Module
-- Reusable for any future tournament (Khelotsav 2027, Indoor Games, etc.)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. TOURNAMENTS ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sports_tournaments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  start_date  DATE,
  end_date    DATE,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sports_tournaments_slug      ON sports_tournaments(slug);
CREATE INDEX IF NOT EXISTS idx_sports_tournaments_is_active ON sports_tournaments(is_active);

ALTER TABLE sports_tournaments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_tournaments' AND policyname = 'public_read_tournaments') THEN
    CREATE POLICY "public_read_tournaments" ON sports_tournaments FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_tournaments' AND policyname = 'admin_all_tournaments') THEN
    CREATE POLICY "admin_all_tournaments" ON sports_tournaments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 2. TEAMS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sports_teams (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES sports_tournaments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  short_name    TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT '#10b981',
  logo_url      TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sports_teams_tournament_id ON sports_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sports_teams_is_active     ON sports_teams(is_active);

ALTER TABLE sports_teams ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_teams' AND policyname = 'public_read_teams') THEN
    CREATE POLICY "public_read_teams" ON sports_teams FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_teams' AND policyname = 'admin_all_teams') THEN
    CREATE POLICY "admin_all_teams" ON sports_teams FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 3. SPORTS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  icon          TEXT NOT NULL DEFAULT '🏅',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sports_is_active     ON sports(is_active);
CREATE INDEX IF NOT EXISTS idx_sports_display_order ON sports(display_order);

ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports' AND policyname = 'public_read_sports') THEN
    CREATE POLICY "public_read_sports" ON sports FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports' AND policyname = 'admin_all_sports') THEN
    CREATE POLICY "admin_all_sports" ON sports FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 4. EVENT CATEGORIES ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sports_event_categories (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id   UUID NOT NULL REFERENCES sports_tournaments(id) ON DELETE CASCADE,
  sport_id        UUID NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  event_type      TEXT NOT NULL DEFAULT 'Individual',
  gender_category TEXT NOT NULL DEFAULT 'Open',
  age_category    TEXT NOT NULL DEFAULT 'Open',
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sec_tournament_id ON sports_event_categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_sec_sport_id      ON sports_event_categories(sport_id);
CREATE INDEX IF NOT EXISTS idx_sec_is_completed  ON sports_event_categories(is_completed);

ALTER TABLE sports_event_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_event_categories' AND policyname = 'public_read_event_categories') THEN
    CREATE POLICY "public_read_event_categories" ON sports_event_categories FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_event_categories' AND policyname = 'admin_all_event_categories') THEN
    CREATE POLICY "admin_all_event_categories" ON sports_event_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 5. SCORING RULES ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sports_scoring_rules (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_category_id UUID NOT NULL REFERENCES sports_event_categories(id) ON DELETE CASCADE,
  rank              INTEGER NOT NULL CHECK (rank > 0),
  points            INTEGER NOT NULL CHECK (points >= 0),
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (event_category_id, rank)
);

CREATE INDEX IF NOT EXISTS idx_ssr_event_category_id ON sports_scoring_rules(event_category_id);

ALTER TABLE sports_scoring_rules ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_scoring_rules' AND policyname = 'public_read_scoring_rules') THEN
    CREATE POLICY "public_read_scoring_rules" ON sports_scoring_rules FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_scoring_rules' AND policyname = 'admin_all_scoring_rules') THEN
    CREATE POLICY "admin_all_scoring_rules" ON sports_scoring_rules FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 6. RESULTS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sports_results (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_category_id UUID NOT NULL REFERENCES sports_event_categories(id) ON DELETE CASCADE,
  team_id           UUID NOT NULL REFERENCES sports_teams(id) ON DELETE CASCADE,
  rank              INTEGER NOT NULL CHECK (rank > 0),
  points_awarded    INTEGER NOT NULL DEFAULT 0,
  remarks           TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (event_category_id, rank),
  UNIQUE (event_category_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_sr_event_category_id ON sports_results(event_category_id);
CREATE INDEX IF NOT EXISTS idx_sr_team_id           ON sports_results(team_id);
CREATE INDEX IF NOT EXISTS idx_sr_rank              ON sports_results(rank);

ALTER TABLE sports_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_results' AND policyname = 'public_read_results') THEN
    CREATE POLICY "public_read_results" ON sports_results FOR SELECT USING (true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sports_results' AND policyname = 'admin_all_results') THEN
    CREATE POLICY "admin_all_results" ON sports_results FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
