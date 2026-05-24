ALTER TABLE case_files ADD COLUMN IF NOT EXISTS classification_confidence NUMERIC;
ALTER TABLE case_files ADD COLUMN IF NOT EXISTS classification_source TEXT;
ALTER TABLE case_files ADD COLUMN IF NOT EXISTS classification_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_case_files_document_check ON case_files(document_check_id);
