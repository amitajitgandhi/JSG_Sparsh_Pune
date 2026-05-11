CREATE TABLE IF NOT EXISTS app_navigation_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE app_navigation_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'app_navigation_settings'
      AND policyname = 'Allow read app navigation settings'
  ) THEN
    CREATE POLICY "Allow read app navigation settings"
      ON app_navigation_settings
      FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'app_navigation_settings'
      AND policyname = 'Allow write app navigation settings'
  ) THEN
    CREATE POLICY "Allow write app navigation settings"
      ON app_navigation_settings
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'app_navigation_settings'
      AND policyname = 'Allow update app navigation settings'
  ) THEN
    CREATE POLICY "Allow update app navigation settings"
      ON app_navigation_settings
      FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

INSERT INTO app_navigation_settings (setting_key, setting_value)
VALUES ('upcoming_event_target', '/events/upcoming')
ON CONFLICT (setting_key) DO NOTHING;
