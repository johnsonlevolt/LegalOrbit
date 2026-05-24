'use server'

import { createSign } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, CouponSheetSetting, CouponSheetSyncLog } from '@/types/database'
import { couponHint, hashCouponCode, normalizeCouponCode } from '@/lib/security/hash'

type CouponSheetRow = Record<string, string>

function missingTable(error: { message?: string } | null | undefined) {
  const message = error?.message ?? ''
  return message.includes('coupon_sheet_settings') || message.includes('schema cache')
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, '\n').trim()
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

async function logSync(userId: string, status: string, importedCount: number, message: string) {
  const supabase = await createClient()
  await supabase
    .from('coupon_sheet_sync_logs')
    .insert({ user_id: userId, status, imported_count: importedCount, message })
}

export async function getCouponSheetSetting(): Promise<CouponSheetSetting | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('coupon_sheet_settings').select('*').eq('user_id', user.id).maybeSingle()
  if (missingTable(error)) return null
  if (error) throw new Error(error.message)
  return data as CouponSheetSetting | null
}

export async function getCouponSheetSyncLogs(): Promise<CouponSheetSyncLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('coupon_sheet_sync_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)
  if (missingTable(error)) return []
  if (error) throw new Error(error.message)
  return (data ?? []) as CouponSheetSyncLog[]
}

export async function saveCouponSheetSetting(formData: FormData): Promise<ActionResult<CouponSheetSetting>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const payload = {
    user_id: user.id,
    spreadsheet_id: String(formData.get('spreadsheet_id') ?? '').trim() || null,
    sheet_name: String(formData.get('sheet_name') ?? '').trim() || 'coupons',
    service_account_email: String(formData.get('service_account_email') ?? '').trim() || null,
    encrypted_private_key: String(formData.get('private_key') ?? '').trim() || null,
    enabled: formData.get('enabled') === 'on',
  }
  const { data, error } = await supabase
    .from('coupon_sheet_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()
  if (missingTable(error)) {
    return { success: false, error: '017_billing_estimates_reminders_coupon_sheet.sql をSupabaseに適用してください。' }
  }
  if (error) return { success: false, error: error.message }
  revalidatePath('/settings/coupons')
  return { success: true, data: data as CouponSheetSetting }
}

export async function importCouponsFromSheetCsv(formData: FormData): Promise<ActionResult<{ count: number }>> {
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { success: false, error: 'GoogleシートからCSV出力したファイルを選択してください。' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const rows = parseCsv(await file.text())
  const result = await upsertCouponRows(user.id, rows)
  await logSync(user.id, result.success ? 'success' : 'failed', result.success ? result.data.count : 0, result.success ? 'CSV import' : result.error)
  if (!result.success) return result

  revalidatePath('/settings/coupons')
  return result
}

export async function syncCouponsFromGoogleSheet(): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: setting, error } = await supabase
    .from('coupon_sheet_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (missingTable(error)) {
    return { success: false, error: '017_billing_estimates_reminders_coupon_sheet.sql をSupabaseに適用してください。' }
  }
  if (error) return { success: false, error: error.message }
  if (!setting?.spreadsheet_id || !setting.service_account_email || !setting.encrypted_private_key) {
    return { success: false, error: 'Spreadsheet ID、サービスアカウントメール、秘密鍵を設定してください。' }
  }

  const token = await getGoogleAccessToken(setting.service_account_email, setting.encrypted_private_key)
  const range = encodeURIComponent(`${setting.sheet_name || 'coupons'}!A:Z`)
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${setting.spreadsheet_id}/values/${range}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) {
    const message = await response.text()
    await logSync(user.id, 'failed', 0, message.slice(0, 500))
    return { success: false, error: 'Googleシートを読み込めませんでした。共有設定とIDを確認してください。' }
  }

  const body = await response.json() as { values?: string[][] }
  const rows = valuesToRows(body.values ?? [])
  const result = await upsertCouponRows(user.id, rows)
  if (!result.success) {
    await logSync(user.id, 'failed', 0, result.error)
    return result
  }

  await supabase
    .from('coupon_sheet_settings')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', user.id)
  await logSync(user.id, 'success', result.data.count, 'Google Sheets API sync')
  revalidatePath('/settings/coupons')
  return result
}

async function getGoogleAccessToken(serviceAccountEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64Url(JSON.stringify({
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }))
  const unsigned = `${header}.${claim}`
  const signature = createSign('RSA-SHA256')
    .update(unsigned)
    .sign(normalizePrivateKey(privateKey), 'base64url')
  const assertion = `${unsigned}.${signature}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Google認証に失敗しました。サービスアカウント情報を確認してください。')
  const body = await response.json() as { access_token?: string }
  if (!body.access_token) throw new Error('Googleアクセストークンを取得できませんでした。')
  return body.access_token
}

async function upsertCouponRows(userId: string, rows: CouponSheetRow[]): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient()
  let count = 0

  for (const row of rows) {
    const code = normalizeCouponCode(row.code ?? '')
    if (!code) continue
    const payload = {
      owner_user_id: userId,
      code_hash: hashCouponCode(code),
      code_hint: couponHint(code),
      label: row.label || 'シート連携クーポン',
      campaign_type: row.campaign_type || 'sheet',
      referrer_name: row.referrer_name || null,
      referrer_email: row.referrer_email || null,
      plan_name: row.plan_name || null,
      discount_type: row.discount_type || 'free_months',
      discount_value: Number(row.discount_value || 1),
      free_until: row.free_until || null,
      expires_at: row.expires_at || null,
      max_redemptions: row.max_redemptions ? Number(row.max_redemptions) : null,
      stripe_coupon_id: row.stripe_coupon_id || null,
      note: row.note || null,
      status: row.status || 'active',
    }
    const { error } = await supabase.from('subscription_coupons').upsert(payload, { onConflict: 'code_hash' })
    if (error) return { success: false, error: error.message }
    count++
  }

  return { success: true, data: { count } }
}

function valuesToRows(values: string[][]) {
  if (values.length === 0) return []
  const headers = values[0].map(value => String(value).trim())
  return values.slice(1).map(valuesRow => (
    Object.fromEntries(headers.map((header, index) => [header, String(valuesRow[index] ?? '').trim()]))
  ))
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = splitLine(lines[0]).map(value => value.trim())
  return lines.slice(1).map(line => {
    const values = splitLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? '']))
  })
}

function splitLine(line: string) {
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
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values.map(value => value.replace(/^"|"$/g, '').replace(/""/g, '"'))
}
