ALTER TABLE case_estimates
  ADD COLUMN IF NOT EXISTS line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_inclusion TEXT NOT NULL DEFAULT 'exclusive'
    CHECK (tax_inclusion IN ('exclusive', 'inclusive')),
  ADD COLUMN IF NOT EXISTS tax_summary JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE billing_documents
  ADD COLUMN IF NOT EXISTS line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tax_inclusion TEXT NOT NULL DEFAULT 'exclusive'
    CHECK (tax_inclusion IN ('exclusive', 'inclusive')),
  ADD COLUMN IF NOT EXISTS tax_summary JSONB NOT NULL DEFAULT '[]'::jsonb;
