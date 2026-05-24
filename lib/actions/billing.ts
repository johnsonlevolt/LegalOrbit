'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, BillingDocument, BillingProfile } from '@/types/database'
import { getAppUrl, getStripe } from '@/lib/stripe/server'
import { canUpgrade, getStripePriceEnvKey, type BillingCycle, type PlanName } from '@/lib/billing/plans'
import { hashCouponCode, normalizeCouponCode } from '@/lib/security/hash'

function isMissingBillingTable(error: { message?: string } | null | undefined) {
  const message = error?.message ?? ''
  return message.includes('billing_profiles') || message.includes('billing_documents') || message.includes('schema cache')
}

function asPlanName(value: FormDataEntryValue | string | null | undefined): PlanName {
  const plan = String(value ?? 'Free')
  return plan === 'Starter' || plan === 'Pro' || plan === 'Office' ? plan : 'Free'
}

function asBillingCycle(value: FormDataEntryValue | string | null | undefined): BillingCycle {
  return String(value ?? 'monthly') === 'yearly' ? 'yearly' : 'monthly'
}

export async function getBillingProfile(): Promise<BillingProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('billing_profiles').select('*').eq('user_id', user.id).maybeSingle()
  if (isMissingBillingTable(error)) return null
  return data as BillingProfile | null
}

export async function getBillingDocuments(): Promise<BillingDocument[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('billing_documents')
    .select('*')
    .eq('user_id', user.id)
    .order('issue_date', { ascending: false })
    .limit(24)
  if (isMissingBillingTable(error)) return []
  if (error) throw new Error(error.message)
  return (data ?? []) as BillingDocument[]
}

export async function getBillingDocument(id: string): Promise<BillingDocument | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('billing_documents').select('*').eq('id', id).eq('user_id', user.id).single()
  if (isMissingBillingTable(error) || error) return null
  return data as BillingDocument
}

export async function createCheckoutSession(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { success: false, error: '未認証です。' }

  const nextPlan = asPlanName(formData.get('plan_name'))
  const billingCycle = asBillingCycle(formData.get('billing_cycle'))
  if (nextPlan === 'Free') return { success: false, error: 'Freeプランは決済不要です。' }

  const currentProfile = await getBillingProfile()
  const currentPlan = asPlanName(currentProfile?.plan_name)
  if (!canUpgrade(currentPlan, nextPlan)) {
    return { success: false, error: 'ダウングレードは次回更新時からのみ可能です。' }
  }

  const priceId = process.env[getStripePriceEnvKey(nextPlan, billingCycle)]
  if (!priceId) return { success: false, error: `${nextPlan}/${billingCycle} のStripe価格IDが未設定です。` }

  const stripe = getStripe()
  let customerId = currentProfile?.stripe_customer_id ?? null
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    })
    customerId = customer.id
  }

  const couponCode = normalizeCouponCode(String(formData.get('coupon_code') ?? ''))
  let stripeCouponId: string | undefined
  let localCouponId: string | undefined
  if (couponCode) {
    const { data: coupon, error } = await supabase
      .from('subscription_coupons')
      .select('*')
      .eq('code_hash', hashCouponCode(couponCode))
      .eq('status', 'active')
      .maybeSingle()
    if (error && !error.message.includes('schema cache')) return { success: false, error: error.message }
    if (!coupon) return { success: false, error: 'クーポンコードが見つかりません。' }
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return { success: false, error: 'クーポンの有効期限が切れています。' }
    if (coupon.plan_name && coupon.plan_name !== nextPlan) return { success: false, error: 'このクーポンは選択したプランでは使えません。' }
    if (coupon.max_redemptions !== null && coupon.used_count >= coupon.max_redemptions) return { success: false, error: 'このクーポンは利用上限に達しています。' }
    stripeCouponId = coupon.stripe_coupon_id ?? undefined
    localCouponId = coupon.id
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
    allow_promotion_codes: !stripeCouponId,
    success_url: `${getAppUrl()}/settings/account?checkout=success`,
    cancel_url: `${getAppUrl()}/settings/account?checkout=cancel`,
    metadata: {
      user_id: user.id,
      plan_name: nextPlan,
      billing_cycle: billingCycle,
      local_coupon_id: localCouponId ?? '',
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        plan_name: nextPlan,
        billing_cycle: billingCycle,
        local_coupon_id: localCouponId ?? '',
      },
    },
  })

  await supabase.from('billing_profiles').upsert({
    user_id: user.id,
    stripe_customer_id: customerId,
    plan_name: currentProfile?.plan_name ?? 'Free',
    plan_status: currentProfile?.plan_status ?? 'checkout_started',
  }, { onConflict: 'user_id' })

  return { success: true, data: { url: session.url ?? `${getAppUrl()}/settings/account` } }
}

export async function createCustomerPortalSession(): Promise<never> {
  const profile = await getBillingProfile()
  if (!profile?.stripe_customer_id) redirect('/settings/account?billing=missing_customer')
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getAppUrl()}/settings/account`,
  })
  redirect(session.url)
}

export async function saveBillingProfile(formData: FormData): Promise<ActionResult<BillingProfile>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const payload = {
    user_id: user.id,
    billing_name: String(formData.get('billing_name') ?? '').trim() || null,
    billing_email: String(formData.get('billing_email') ?? '').trim() || null,
    postal_code: String(formData.get('postal_code') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    tax_id: String(formData.get('tax_id') ?? '').trim() || null,
  }

  const { data, error } = await supabase.from('billing_profiles').upsert(payload, { onConflict: 'user_id' }).select().single()
  if (isMissingBillingTable(error)) return { success: false, error: '課金管理テーブルが未作成です。Supabaseで010/012の課金マイグレーションを実行してください。' }
  if (error) return { success: false, error: error.message }
  revalidatePath('/settings/account')
  return { success: true, data: data as BillingProfile }
}
