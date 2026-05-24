CREATE TABLE IF NOT EXISTS assignee_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, code)
);

CREATE TRIGGER trg_assignee_settings_updated_at
  BEFORE UPDATE ON assignee_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE assignee_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignee_settings_user_all" ON assignee_settings;
CREATE POLICY "assignee_settings_user_all" ON assignee_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assignee_settings_user_code ON assignee_settings(user_id, code);
