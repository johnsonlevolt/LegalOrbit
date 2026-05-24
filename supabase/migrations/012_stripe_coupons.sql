ALTER TABLE billing_profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS scheduled_plan_name TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_billing_cycle TEXT;

ALTER TABLE billing_documents
  ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS receipt_url TEXT,
  ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS subscription_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL UNIQUE,
  code_hint TEXT NOT NULL,
  label TEXT NOT NULL,
  plan_name TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount', 'free_months', 'free_until')),
  discount_value INTEGER NOT NULL DEFAULT 0,
  free_until DATE,
  expires_at TIMESTAMPTZ,
  max_redemptions INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_coupon_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscription_coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES subscription_coupons(id) ON DELETE CASCADE,
  redeemer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_profile_id UUID REFERENCES billing_profiles(id) ON DELETE SET NULL,
  plan_name TEXT,
  billing_cycle TEXT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TRIGGER trg_subscription_coupons_updated_at
  BEFORE UPDATE ON subscription_coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE subscription_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscription_coupons_owner_all" ON subscription_coupons;
CREATE POLICY "subscription_coupons_owner_all" ON subscription_coupons
  FOR ALL
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "subscription_coupon_redemptions_owner_select" ON subscription_coupon_redemptions;
CREATE POLICY "subscription_coupon_redemptions_owner_select" ON subscription_coupon_redemptions
  FOR SELECT
  USING (
    redeemer_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM subscription_coupons
      WHERE subscription_coupons.id = subscription_coupon_redemptions.coupon_id
        AND subscription_coupons.owner_user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_subscription_coupons_owner ON subscription_coupons(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_coupon_redemptions_coupon ON subscription_coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_stripe_customer ON billing_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_stripe_subscription ON billing_profiles(stripe_subscription_id);

CREATE OR REPLACE FUNCTION increment_coupon_used_count(coupon_id_arg UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE subscription_coupons
  SET used_count = used_count + 1
  WHERE id = coupon_id_arg;
$$;
