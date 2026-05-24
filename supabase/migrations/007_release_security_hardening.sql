-- Release security hardening:
-- - dependent records must belong to a case owned by the authenticated user
-- - audit log inserts are allowed only for the authenticated user's own rows

DROP POLICY IF EXISTS "case_tasks_user_insert" ON case_tasks;
CREATE POLICY "case_tasks_user_insert" ON case_tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_tasks.case_id
        AND cases.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "case_tasks_user_update" ON case_tasks;
CREATE POLICY "case_tasks_user_update" ON case_tasks
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_tasks.case_id
        AND cases.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_tasks.case_id
        AND cases.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pdf_form_outputs_user_insert" ON pdf_form_outputs;
CREATE POLICY "pdf_form_outputs_user_insert" ON pdf_form_outputs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = pdf_form_outputs.case_id
        AND cases.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM pdf_form_templates
      WHERE pdf_form_templates.id = pdf_form_outputs.template_id
        AND pdf_form_templates.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "audit_logs_user_insert" ON audit_logs;
CREATE POLICY "audit_logs_user_insert" ON audit_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      case_id IS NULL
      OR EXISTS (
        SELECT 1 FROM cases
        WHERE cases.id = audit_logs.case_id
          AND cases.user_id = auth.uid()
      )
    )
  );
