-- document_templates
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- document_template_items
CREATE TABLE document_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TRIGGER trg_document_templates_updated_at
  BEFORE UPDATE ON document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_document_templates" ON document_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_document_template_items" ON document_template_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM document_templates
      WHERE document_templates.id = document_template_items.template_id
        AND document_templates.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM document_templates
      WHERE document_templates.id = document_template_items.template_id
        AND document_templates.user_id = auth.uid()
    )
  );
