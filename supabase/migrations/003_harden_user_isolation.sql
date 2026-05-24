-- Harden user isolation for existing databases.
-- Fresh installs already have these columns and policies in 001_initial_schema.sql.

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE offices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE garages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE people ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE document_checks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

UPDATE vehicles SET user_id = cases.user_id FROM cases WHERE vehicles.case_id = cases.id AND vehicles.user_id IS NULL;
UPDATE offices SET user_id = cases.user_id FROM cases WHERE offices.case_id = cases.id AND offices.user_id IS NULL;
UPDATE garages SET user_id = cases.user_id FROM cases WHERE garages.case_id = cases.id AND garages.user_id IS NULL;
UPDATE people SET user_id = cases.user_id FROM cases WHERE people.case_id = cases.id AND people.user_id IS NULL;
UPDATE document_checks SET user_id = cases.user_id FROM cases WHERE document_checks.case_id = cases.id AND document_checks.user_id IS NULL;

ALTER TABLE vehicles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE offices ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE garages ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE people ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE document_checks ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "own_cases" ON cases;
DROP POLICY IF EXISTS "own_vehicles" ON vehicles;
DROP POLICY IF EXISTS "own_offices" ON offices;
DROP POLICY IF EXISTS "own_garages" ON garages;
DROP POLICY IF EXISTS "own_people" ON people;
DROP POLICY IF EXISTS "own_document_checks" ON document_checks;

CREATE POLICY "own_cases" ON cases
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = cases.customer_id
        AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "own_vehicles" ON vehicles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM cases WHERE cases.id = vehicles.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "own_offices" ON offices
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM cases WHERE cases.id = offices.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "own_garages" ON garages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM cases WHERE cases.id = garages.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "own_people" ON people
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM cases WHERE cases.id = people.case_id AND cases.user_id = auth.uid())
  );

CREATE POLICY "own_document_checks" ON document_checks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM cases WHERE cases.id = document_checks.case_id AND cases.user_id = auth.uid())
  );
