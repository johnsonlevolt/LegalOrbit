ALTER TABLE billing_profiles
  ADD COLUMN IF NOT EXISTS seal_image_path TEXT;
