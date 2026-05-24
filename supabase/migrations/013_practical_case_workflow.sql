-- Practical workflow additions for administrative scrivener offices.

CREATE TABLE IF NOT EXISTS case_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT,
  requested_at DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  agency_staff TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'working', 'done')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  deadline_date DATE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'other',
  note TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT,
  postal_code TEXT,
  address TEXT,
  phone TEXT,
  reception_hours TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE case_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_corrections_user_select" ON case_corrections;
DROP POLICY IF EXISTS "case_corrections_user_insert" ON case_corrections;
DROP POLICY IF EXISTS "case_corrections_user_update" ON case_corrections;
DROP POLICY IF EXISTS "case_corrections_user_delete" ON case_corrections;
CREATE POLICY "case_corrections_user_select" ON case_corrections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "case_corrections_user_insert" ON case_corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "case_corrections_user_update" ON case_corrections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "case_corrections_user_delete" ON case_corrections FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "case_deadlines_user_select" ON case_deadlines;
DROP POLICY IF EXISTS "case_deadlines_user_insert" ON case_deadlines;
DROP POLICY IF EXISTS "case_deadlines_user_update" ON case_deadlines;
DROP POLICY IF EXISTS "case_deadlines_user_delete" ON case_deadlines;
CREATE POLICY "case_deadlines_user_select" ON case_deadlines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "case_deadlines_user_insert" ON case_deadlines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "case_deadlines_user_update" ON case_deadlines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "case_deadlines_user_delete" ON case_deadlines FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "agencies_user_select" ON agencies;
DROP POLICY IF EXISTS "agencies_user_insert" ON agencies;
DROP POLICY IF EXISTS "agencies_user_update" ON agencies;
DROP POLICY IF EXISTS "agencies_user_delete" ON agencies;
CREATE POLICY "agencies_user_select" ON agencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "agencies_user_insert" ON agencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agencies_user_update" ON agencies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "agencies_user_delete" ON agencies FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_case_corrections_user_case ON case_corrections(user_id, case_id, status);
CREATE INDEX IF NOT EXISTS idx_case_corrections_due ON case_corrections(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_case_deadlines_due ON case_deadlines(user_id, deadline_date, completed);
CREATE INDEX IF NOT EXISTS idx_case_deadlines_case ON case_deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_agencies_user_name ON agencies(user_id, name);
