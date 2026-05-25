'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, BankAccount, BillingDocument, BillingProfile } from '@/types/database'
import { getAppUrl, getStripe } from '@/lib/stripe/server'
import { canUpgrade, getStripePriceEnvKey, type BillingCycle, type PlanName } from '@/lib/billing/plans'
import { couponHint, hashCouponCode, normalizeCouponCode } from '@/lib/security/hash'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>
type CouponDiscountType = 'percent' | 'amount' | 'free_months' | 'free_until'
type CouponActivationType = 'checkout_only' | 'immediate'

type CouponRecord = {
  id: string
  owner_user_id: string
  code_hash: string
  code_hint: string
  label: string
  campaign_type: string
  referrer_name: string | null
  referrer_email: string | null
  referrer_user_id: string | null
  plan_name: string | null
  discount_type: CouponDiscountType
  discount_value: number
  free_until: string | null
  expires_at: string | null
  max_redemptions: number | null
  used_count: number
  status: string
  stripe_coupon_id: string | null
  note: string | null
}

type GasCoupon = Partial<Omit<CouponRecord, 'id' | 'owner_user_id' | 'code_hash' | 'code_hint' | 'used_count'>> & {
  code?: string
  activation_type?: CouponActivationType
}

type GasCouponResponse =
  | { ok: true; coupon: GasCoupon }
  | { ok: false; error?: string }

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

function toNumberOrDefault(value: unknown, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toNullableDate(value: unknown) {
  const text = String(value ?? '').trim()
  return text ? text : null
}

function isPastDate(value: string | null | undefined) {
  return value ? new Date(value).getTime() < Date.now() : false
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function validateCoupon(coupon: CouponRecord, nextPlan: PlanName) {
  if (coupon.status !== 'active') return 'このクーポンは現在使えません。'
  if (isPastDate(coupon.expires_at)) return 'クーポンの有効期限が切れています。'
  if (coupon.discount_type === 'free_until' && isPastDate(coupon.free_until)) return '無料提供期限が切れています。'
  if (coupon.plan_name && coupon.plan_name !== nextPlan) return 'このクーポンは選択したプランでは使えません。'
  if (coupon.max_redemptions !== null && coupon.used_count >= coupon.max_redemptions) return 'このクーポンは利用上限に達しています。'
  return null
}

async function fetchCouponFromGas(params: {
  code: string
  nextPlan: PlanName
  billingCycle: BillingCycle
  userId: string
  email: string
  action?: 'checkout' | 'activate'
}): Promise<ActionResult<GasCoupon | null>> {
  const endpoint = process.env.COUPON_GAS_ENDPOINT
  if (!endpoint) return { success: true, data: null }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.COUPON_GAS_SECRET ?? '',
        code: params.code,
        plan_name: params.nextPlan,
        billing_cycle: params.billingCycle,
        user_id: params.userId,
        email: params.email,
        action: params.action ?? 'checkout',
      }),
      cache: 'no-store',
    })
    const json = (await response.json()) as GasCouponResponse
    if (!response.ok || !json.ok) {
      return {
        success: false,
        error: json.ok ? 'GASクーポン照会に失敗しました。' : (json.error ?? 'クーポンコードが見つかりません。'),
      }
    }
    return { success: true, data: json.coupon }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'GASクーポン照会に失敗しました。' }
  }
}

async function upsertGasCoupon(
  supabase: SupabaseServerClient,
  userId: string,
  code: string,
  coupon: GasCoupon,
): Promise<ActionResult<CouponRecord>> {
  const discountType = (coupon.discount_type ?? 'percent') as CouponDiscountType
  const discountValue = toNumberOrDefault(coupon.discount_value, discountType === 'percent' ? 100 : 0)
  const activationType = coupon.activation_type ?? 'checkout_only'
  const note = [coupon.note, `activation_type=${activationType}`].filter(Boolean).join(' / ')
  const payload = {
    owner_user_id: userId,
    code_hash: hashCouponCode(code),
    code_hint: couponHint(code),
    label: String(coupon.label ?? code).trim() || code,
    campaign_type: String(coupon.campaign_type ?? 'gas_sheet').trim() || 'gas_sheet',
    referrer_name: coupon.referrer_name ?? null,
    referrer_email: coupon.referrer_email ?? null,
    referrer_user_id: coupon.referrer_user_id ?? null,
    plan_name: coupon.plan_name ?? null,
    discount_type: discountType,
    discount_value: discountValue,
    free_until: toNullableDate(coupon.free_until),
    expires_at: toNullableDate(coupon.expires_at),
    max_redemptions: coupon.max_redemptions === undefined || coupon.max_redemptions === null ? null : toNumberOrDefault(coupon.max_redemptions, 0),
    status: coupon.status ?? 'active',
    stripe_coupon_id: coupon.stripe_coupon_id ?? null,
    note: note || 'Google Apps Scriptから自動有効化',
  }

  const { data, error } = await supabase
    .from('subscription_coupons')
    .upsert(payload, { onConflict: 'code_hash' })
    .select('*')
    .single()
  if (error) return { success: false, error: error.message }
  return { success: true, data: data as CouponRecord }
}

async function getOrActivateCoupon(params: {
  supabase: SupabaseServerClient
  code: string
  nextPlan: PlanName
  billingCycle: BillingCycle
  userId: string
  email: string
}): Promise<ActionResult<CouponRecord>> {
  const { data: localCoupon, error } = await params.supabase
    .from('subscription_coupons')
    .select('*')
    .eq('code_hash', hashCouponCode(params.code))
    .maybeSingle()

  if (error && !error.message.includes('schema cache')) return { success: false, error: error.message }
  if (localCoupon) return { success: true, data: localCoupon as CouponRecord }

  const gasResult = await fetchCouponFromGas({ ...params, action: 'checkout' })
  if (!gasResult.success) return gasResult
  if (!gasResult.data) return { success: false, error: 'クーポンコードが見つかりません。' }
  return upsertGasCoupon(params.supabase, params.userId, params.code, gasResult.data)
}

async function ensureStripeCoupon(
  stripe: ReturnType<typeof getStripe>,
  supabase: SupabaseServerClient,
  coupon: CouponRecord,
) {
  if (coupon.stripe_coupon_id) return coupon.stripe_coupon_id

  const duration = coupon.discount_type === 'free_months' ? 'repeating' : 'once'
  const durationInMonths = coupon.discount_type === 'free_months' ? Math.max(1, coupon.discount_value) : undefined
  const stripeCoupon = await stripe.coupons.create({
    name: coupon.label,
    currency: coupon.discount_type === 'amount' ? 'jpy' : undefined,
    amount_off: coupon.discount_type === 'amount' ? Math.max(1, coupon.discount_value) : undefined,
    percent_off: coupon.discount_type === 'amount' ? undefined : Math.min(100, Math.max(1, coupon.discount_value)),
    duration,
    duration_in_months: durationInMonths,
    metadata: {
      local_coupon_id: coupon.id,
      source: 'legal_orbit_gas_coupon',
    },
  })

  await supabase.from('subscription_coupons').update({ stripe_coupon_id: stripeCoupon.id }).eq('id', coupon.id)
  return stripeCoupon.id
}

async function recordCouponRedemption(params: {
  supabase: SupabaseServerClient
  coupon: CouponRecord
  userId: string
  planName: PlanName
  billingCycle: BillingCycle
  metadata?: Record<string, unknown>
}) {
  const { data: existing } = await params.supabase
    .from('subscription_coupon_redemptions')
    .select('id')
    .eq('coupon_id', params.coupon.id)
    .eq('redeemer_user_id', params.userId)
    .maybeSingle()
  if (existing) return

  const { data: profile } = await params.supabase
    .from('billing_profiles')
    .select('id')
    .eq('user_id', params.userId)
    .maybeSingle()

  const { error } = await params.supabase.from('subscription_coupon_redemptions').insert({
    coupon_id: params.coupon.id,
    redeemer_user_id: params.userId,
    billing_profile_id: profile?.id ?? null,
    referrer_name: params.coupon.referrer_name,
    referrer_email: params.coupon.referrer_email,
    referrer_user_id: params.coupon.referrer_user_id,
    plan_name: params.planName,
    billing_cycle: params.billingCycle,
    metadata: params.metadata ?? {},
  })
  if (error) throw new Error(error.message)
  await params.supabase.rpc('increment_coupon_used_count', { coupon_id_arg: params.coupon.id }).throwOnError()
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

export async function markBillingDocumentPaid(id: string, paid: boolean): Promise<ActionResult<BillingDocument>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('billing_documents')
    .update({
      status: paid ? 'paid' : 'draft',
      paid_at: paid ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (isMissingBillingTable(error)) return { success: false, error: '請求管理テーブルが未作成です。' }
  if (error) return { success: false, error: error.message }
  revalidatePath('/settings/account')
  return { success: true, data: data as BillingDocument }
}

export async function getBillingDocument(id: string): Promise<BillingDocument | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('billing_documents').select('*').eq('id', id).eq('user_id', user.id).single()
  if (isMissingBillingTable(error) || error) return null
  return data as BillingDocument
}

export async function activateCouponCode(formData: FormData): Promise<ActionResult<{ message: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { success: false, error: '未認証です。' }

  const code = normalizeCouponCode(String(formData.get('coupon_code') ?? ''))
  if (!code) return { success: false, error: 'クーポンコードを入力してください。' }

  const currentProfile = await getBillingProfile()
  const gasResult = await fetchCouponFromGas({
    code,
    nextPlan: asPlanName(formData.get('plan_name')),
    billingCycle: asBillingCycle(formData.get('billing_cycle')),
    userId: user.id,
    email: user.email,
    action: 'activate',
  })
  if (!gasResult.success) return gasResult
  if (!gasResult.data) return { success: false, error: 'クーポンコードが見つかりません。' }
  if ((gasResult.data.activation_type ?? 'checkout_only') !== 'immediate') {
    return { success: false, error: 'このコードは課金登録時のみ有効です。対象プランの決済へ進むと適用されます。' }
  }

  const couponResult = await upsertGasCoupon(supabase, user.id, code, gasResult.data)
  if (!couponResult.success) return couponResult
  const coupon = couponResult.data
  const planName = asPlanName(coupon.plan_name)
  if (planName === 'Free') return { success: false, error: '即時有効化するコードには対象プランを設定してください。' }
  if (!canUpgrade(asPlanName(currentProfile?.plan_name), planName)) {
    return { success: false, error: '現在のプランより低いプランのコードは有効化できません。' }
  }

  const couponError = validateCoupon(coupon, planName)
  if (couponError) return { success: false, error: couponError }
  if (coupon.discount_type !== 'free_months' && coupon.discount_type !== 'free_until') {
    return { success: false, error: '課金登録なしで有効化できるのは無料期間コードだけです。' }
  }

  const now = new Date()
  const periodEnd = coupon.discount_type === 'free_until' && coupon.free_until
    ? new Date(coupon.free_until)
    : addMonths(now, Math.max(1, coupon.discount_value))
  if (periodEnd.getTime() <= now.getTime()) return { success: false, error: '無料期間が過去日になっています。' }

  const { error } = await supabase.from('billing_profiles').upsert({
    user_id: user.id,
    stripe_customer_id: currentProfile?.stripe_customer_id ?? null,
    stripe_subscription_id: currentProfile?.stripe_subscription_id ?? null,
    plan_name: planName,
    billing_cycle: currentProfile?.billing_cycle ?? 'monthly',
    plan_status: 'coupon_active',
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: true,
  }, { onConflict: 'user_id' })
  if (isMissingBillingTable(error)) return { success: false, error: '課金管理テーブルが未作成です。Supabaseで課金マイグレーションを実行してください。' }
  if (error) return { success: false, error: error.message }

  await recordCouponRedemption({
    supabase,
    coupon,
    userId: user.id,
    planName,
    billingCycle: 'monthly',
    metadata: { activation_type: 'immediate' },
  })

  revalidatePath('/settings/account')
  return {
    success: true,
    data: { message: `${planName}を${periodEnd.toLocaleDateString('ja-JP')}まで有効化しました。` },
  }
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
    const couponResult = await getOrActivateCoupon({
      supabase,
      code: couponCode,
      nextPlan,
      billingCycle,
      userId: user.id,
      email: user.email,
    })
    if (!couponResult.success) return couponResult
    const couponError = validateCoupon(couponResult.data, nextPlan)
    if (couponError) return { success: false, error: couponError }
    stripeCouponId = await ensureStripeCoupon(stripe, supabase, couponResult.data)
    localCouponId = couponResult.data.id
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

  const bankAccounts = parseBankAccounts(String(formData.get('bank_accounts') ?? '[]'))
  const payload = {
    user_id: user.id,
    billing_name: String(formData.get('billing_name') ?? '').trim() || null,
    billing_email: String(formData.get('billing_email') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    postal_code: String(formData.get('postal_code') ?? '').trim() || null,
    address: String(formData.get('address') ?? '').trim() || null,
    tax_id: String(formData.get('tax_id') ?? '').trim() || null,
    bank_accounts: bankAccounts,
  }

  const { data, error } = await supabase.from('billing_profiles').upsert(payload, { onConflict: 'user_id' }).select().single()
  if (isMissingBillingTable(error)) return { success: false, error: '課金管理テーブルが未作成です。Supabaseで課金マイグレーションを実行してください。' }
  if (error) return { success: false, error: error.message }
  revalidatePath('/settings/account')
  return { success: true, data: data as BillingProfile }
}

function parseBankAccounts(raw: string): BankAccount[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = []
  }
  if (!Array.isArray(parsed)) return []
  return parsed
    .map(row => {
      if (!row || typeof row !== 'object') return null
      const record = row as Record<string, unknown>
      const bankName = String(record.bank_name ?? '').trim()
      const branchName = String(record.branch_name ?? '').trim()
      const accountNumber = String(record.account_number ?? '').trim()
      const accountHolder = String(record.account_holder ?? '').trim()
      if (!bankName && !branchName && !accountNumber && !accountHolder) return null
      return {
        id: String(record.id ?? '').trim() || crypto.randomUUID(),
        label: String(record.label ?? '').trim() || bankName || '振込口座',
        bank_name: bankName,
        branch_name: branchName,
        account_type: String(record.account_type ?? '普通').trim() || '普通',
        account_number: accountNumber,
        account_holder: accountHolder,
      } satisfies BankAccount
    })
    .filter((row): row is BankAccount => Boolean(row))
}
