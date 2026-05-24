ALTER TABLE case_estimates
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS issued_at DATE,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS invoice_document_id UUID REFERENCES billing_documents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

ALTER TABLE case_deadlines
  ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER[] NOT NULL DEFAULT ARRAY[7,3,1],
  ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ;

ALTER TABLE agency_rules
  ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS effective_from DATE,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

CREATE TABLE IF NOT EXISTS coupon_sheet_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL DEFAULT 'google_sheets',
  spreadsheet_id TEXT,
  sheet_name TEXT NOT NULL DEFAULT 'coupons',
  service_account_email TEXT,
  encrypted_private_key TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_sheet_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  imported_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE coupon_sheet_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_sheet_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupon_sheet_settings_user_all" ON coupon_sheet_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "coupon_sheet_sync_logs_user_select" ON coupon_sheet_sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_case_estimates_case_status ON case_estimates(user_id, case_id, status);
CREATE INDEX IF NOT EXISTS idx_case_deadlines_reminders ON case_deadlines(user_id, completed, deadline_date) WHERE reminder_enabled = true;
CREATE INDEX IF NOT EXISTS idx_coupon_sheet_sync_logs_user ON coupon_sheet_sync_logs(user_id, created_at DESC);
