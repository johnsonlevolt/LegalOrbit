'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, SubscriptionCoupon, SubscriptionCouponRedemption } from '@/types/database'
import { couponHint, createCouponCode, hashCouponCode, normalizeCouponCode } from '@/lib/security/hash'

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''))
  const parseLine = (line: string) => {
    const values: string[] = []
    let current = ''
    let quoted = false
    for (let index = 0; index < line.length; index++) {
      const char = line[index]
      if (char === '"' && line[index + 1] === '"') {
        current += '"'
        index++
      } else if (char === '"') {
        quoted = !quoted
      } else if (char === ',' && !quoted) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return values
  }
  return lines.slice(1).map(line => {
    const values = parseLine(line)
    return Object.fromEntries(headers.map((header, index) => {
      const value = values[index] ?? ''
      return [header, value.trim().replace(/^"|"$/g, '').replace(/""/g, '"')]
    }))
  })
}

export async function getCoupons(): Promise<SubscriptionCoupon[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('subscription_coupons').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false })
  if (error?.message.includes('schema cache')) return []
  if (error) throw new Error(error.message)
  return (data ?? []) as SubscriptionCoupon[]
}

export async function getCouponRedemptions(): Promise<SubscriptionCouponRedemption[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('subscription_coupon_redemptions')
    .select('*, subscription_coupons(label, code_hint, referrer_name, referrer_email)')
    .order('redeemed_at', { ascending: false })
    .limit(100)
  if (error?.message.includes('schema cache')) return []
  if (error) throw new Error(error.message)
  return (data ?? []) as SubscriptionCouponRedemption[]
}

export async function createCoupon(formData: FormData): Promise<ActionResult<{ code: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const rawCode = String(formData.get('code') ?? '').trim() || createCouponCode(String(formData.get('prefix') ?? 'COUPON'))
  const code = normalizeCouponCode(rawCode)
  const payload = {
    owner_user_id: user.id,
    code_hash: hashCouponCode(code),
    code_hint: couponHint(code),
    label: String(formData.get('label') ?? '').trim() || 'クーポン',
    campaign_type: String(formData.get('campaign_type') ?? '').trim() || 'manual',
    referrer_name: String(formData.get('referrer_name') ?? '').trim() || null,
    referrer_email: String(formData.get('referrer_email') ?? '').trim() || null,
    referrer_user_id: String(formData.get('referrer_user_id') ?? '').trim() || null,
    plan_name: String(formData.get('plan_name') ?? '').trim() || null,
    discount_type: String(formData.get('discount_type') ?? 'free_months'),
    discount_value: Number(formData.get('discount_value') ?? 0),
    free_until: String(formData.get('free_until') ?? '').trim() || null,
    expires_at: String(formData.get('expires_at') ?? '').trim() || null,
    max_redemptions: String(formData.get('max_redemptions') ?? '').trim() ? Number(formData.get('max_redemptions')) : null,
    stripe_coupon_id: String(formData.get('stripe_coupon_id') ?? '').trim() || null,
    note: String(formData.get('note') ?? '').trim() || null,
    status: 'active',
  }
  const { error } = await supabase.from('subscription_coupons').insert(payload)
  if (error?.message.includes('schema cache')) return { success: false, error: 'クーポン管理テーブルが未作成です。012_stripe_coupons.sqlと016_coupon_referrals.sqlを実行してください。' }
  if (error) return { success: false, error: error.message }
  revalidatePath('/settings/coupons')
  return { success: true, data: { code } }
}

export async function importCouponsCsv(formData: FormData): Promise<ActionResult<{ count: number }>> {
  const file = formData.get('file')
  if (!(file instanceof File)) return { success: false, error: 'CSVファイルを選択してください。' }
  const text = await file.text()
  const rows = parseCsv(text)
  let count = 0
  for (const row of rows) {
    const data = new FormData()
    for (const [key, value] of Object.entries(row)) data.set(key, value)
    const result = await createCoupon(data)
    if (!result.success) return result
    count++
  }
  revalidatePath('/settings/coupons')
  return { success: true, data: { count } }
}

export async function exportCouponsCsv(): Promise<ActionResult<{ csv: string }>> {
  const coupons = await getCoupons()
  const header = ['label', 'code_hint', 'campaign_type', 'referrer_name', 'referrer_email', 'referrer_user_id', 'plan_name', 'discount_type', 'discount_value', 'free_until', 'expires_at', 'max_redemptions', 'used_count', 'status', 'stripe_coupon_id', 'note']
  const rows = coupons.map(coupon => [
    coupon.label,
    coupon.code_hint,
    coupon.campaign_type,
    coupon.referrer_name ?? '',
    coupon.referrer_email ?? '',
    coupon.referrer_user_id ?? '',
    coupon.plan_name ?? '',
    coupon.discount_type,
    String(coupon.discount_value),
    coupon.free_until ?? '',
    coupon.expires_at ?? '',
    coupon.max_redemptions?.toString() ?? '',
    String(coupon.used_count),
    coupon.status,
    coupon.stripe_coupon_id ?? '',
    coupon.note ?? '',
  ])
  const csv = [header, ...rows].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n')
  return { success: true, data: { csv } }
}
