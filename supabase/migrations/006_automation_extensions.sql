CREATE TABLE IF NOT EXISTS case_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  days_before INTEGER[] NOT NULL DEFAULT ARRAY[7,3,1],
  webhook_url TEXT,
  email_to TEXT,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pdf_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT,
  storage_path TEXT NOT NULL,
  field_mappings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pdf_form_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES pdf_form_templates(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE case_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_form_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_tasks_user_select" ON case_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "case_tasks_user_insert" ON case_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "case_tasks_user_update" ON case_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "case_tasks_user_delete" ON case_tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "notification_settings_user_select" ON notification_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_settings_user_insert" ON notification_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_settings_user_update" ON notification_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notification_settings_user_delete" ON notification_settings FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "pdf_form_templates_user_select" ON pdf_form_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pdf_form_templates_user_insert" ON pdf_form_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pdf_form_templates_user_update" ON pdf_form_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pdf_form_templates_user_delete" ON pdf_form_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "pdf_form_outputs_user_select" ON pdf_form_outputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pdf_form_outputs_user_insert" ON pdf_form_outputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pdf_form_outputs_user_delete" ON pdf_form_outputs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_case_tasks_user_due ON case_tasks(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_case_tasks_case ON case_tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_pdf_form_templates_user ON pdf_form_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_form_outputs_case ON pdf_form_outputs(case_id);
