-- Client upload portal, file classification, review, communications, rules, and estimates.

ALTER TABLE case_files ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE case_files ADD COLUMN IF NOT EXISTS document_check_id UUID REFERENCES document_checks(id) ON DELETE SET NULL;
ALTER TABLE case_files ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'internal';

ALTER TABLE document_checks ADD COLUMN IF NOT EXISTS matched_file_id UUID REFERENCES case_files(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS upload_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uploads INTEGER,
  upload_count INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '提出前レビュー',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  note TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'phone',
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  subject TEXT NOT NULL,
  body TEXT,
  contacted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agency_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  business_type TEXT,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '見積',
  fee_amount INTEGER NOT NULL DEFAULT 0,
  expense_amount INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE upload_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upload_links_user_all" ON upload_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "case_reviews_user_all" ON case_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "case_communications_user_all" ON case_communications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agency_rules_user_all" ON agency_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "case_estimates_user_all" ON case_estimates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_upload_links_case ON upload_links(user_id, case_id, enabled);
CREATE INDEX IF NOT EXISTS idx_upload_links_token ON upload_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_case_reviews_case ON case_reviews(user_id, case_id, status);
CREATE INDEX IF NOT EXISTS idx_case_communications_case ON case_communications(user_id, case_id, contacted_at DESC);
CREATE INDEX IF NOT EXISTS idx_agency_rules_agency ON agency_rules(user_id, agency_id);
CREATE INDEX IF NOT EXISTS idx_case_estimates_case ON case_estimates(user_id, case_id);
