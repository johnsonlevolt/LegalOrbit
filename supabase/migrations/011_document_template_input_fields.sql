ALTER TABLE document_templates
  ADD COLUMN IF NOT EXISTS input_fields JSONB NOT NULL DEFAULT '[]'::jsonb;
