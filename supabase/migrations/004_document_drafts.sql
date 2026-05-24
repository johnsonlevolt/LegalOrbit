-- AI-assisted document drafting.

CREATE TABLE document_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  uploaded_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  extracted_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_content TEXT,
  notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_document_drafts_updated_at
  BEFORE UPDATE ON document_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE document_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_document_drafts" ON document_drafts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM cases WHERE cases.id = document_drafts.case_id AND cases.user_id = auth.uid())
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "own_case_document_files_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'case-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "own_case_document_files_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'case-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "own_case_document_files_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'case-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'case-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "own_case_document_files_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'case-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
