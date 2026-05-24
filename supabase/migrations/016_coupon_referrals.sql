ALTER TABLE subscription_coupons
  ADD COLUMN IF NOT EXISTS campaign_type TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS referrer_name TEXT,
  ADD COLUMN IF NOT EXISTS referrer_email TEXT,
  ADD COLUMN IF NOT EXISTS referrer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE subscription_coupon_redemptions
  ADD COLUMN IF NOT EXISTS referrer_name TEXT,
  ADD COLUMN IF NOT EXISTS referrer_email TEXT,
  ADD COLUMN IF NOT EXISTS referrer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subscription_coupons_campaign_type
  ON subscription_coupons(owner_user_id, campaign_type);

CREATE INDEX IF NOT EXISTS idx_subscription_coupons_referrer_email
  ON subscription_coupons(owner_user_id, referrer_email);

CREATE INDEX IF NOT EXISTS idx_subscription_coupon_redemptions_referrer
  ON subscription_coupon_redemptions(referrer_user_id, referrer_email);

CREATE INDEX IF NOT EXISTS idx_subscription_coupon_redemptions_coupon_redeemer
  ON subscription_coupon_redemptions(coupon_id, redeemer_user_id);
