ALTER TABLE billing_profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bank_accounts JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE billing_documents
  ADD COLUMN IF NOT EXISTS issuer_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS bank_accounts JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_due_date DATE;

CREATE INDEX IF NOT EXISTS idx_billing_documents_user_type_date
  ON billing_documents(user_id, document_type, issue_date DESC);

CREATE INDEX IF NOT EXISTS idx_billing_documents_user_recipient
  ON billing_documents(user_id, recipient_name);
