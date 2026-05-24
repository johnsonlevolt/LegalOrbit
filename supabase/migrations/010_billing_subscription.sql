CREATE TABLE IF NOT EXISTS billing_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_name TEXT NOT NULL DEFAULT 'Free',
  plan_status TEXT NOT NULL DEFAULT 'trial',
  billing_name TEXT,
  billing_email TEXT,
  postal_code TEXT,
  address TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('invoice', 'receipt')),
  document_number TEXT NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, document_number)
);

CREATE TRIGGER trg_billing_profiles_updated_at
  BEFORE UPDATE ON billing_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_billing_documents_updated_at
  BEFORE UPDATE ON billing_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "billing_profiles_user_all" ON billing_profiles;
CREATE POLICY "billing_profiles_user_all" ON billing_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "billing_documents_user_all" ON billing_documents;
CREATE POLICY "billing_documents_user_all" ON billing_documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_billing_documents_user_date ON billing_documents(user_id, issue_date DESC);
