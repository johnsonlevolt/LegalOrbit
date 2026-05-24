'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, NotificationSetting } from '@/types/database'

export async function getNotificationSetting(): Promise<NotificationSetting | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('notification_settings').select('*').eq('user_id', user.id).maybeSingle()
  if (error && error.message.includes('schema cache')) return null
  return data as NotificationSetting | null
}

export async function saveNotificationSetting(formData: FormData): Promise<ActionResult<NotificationSetting>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const selectedDays = formData.getAll('days_before').map(value => Number(value))
  const customDays = String(formData.get('custom_days_before') ?? '')
    .split(',')
    .map(value => Number(value.trim()))
  const days = Array.from(new Set([...selectedDays, ...customDays].filter(value => Number.isFinite(value) && value >= 0)))
    .sort((a, b) => a - b)

  const payload = {
    user_id: user.id,
    enabled: formData.get('enabled') === 'on',
    days_before: days.length > 0 ? days : [1, 3, 7],
    webhook_url: String(formData.get('webhook_url') ?? '').trim() || null,
    email_to: String(formData.get('email_to') ?? '').trim() || null,
  }

  const { data, error } = await supabase
    .from('notification_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()
  if (error && error.message.includes('schema cache')) {
    return { success: false, error: '通知設定テーブルが未作成です。Supabaseで006_automation_extensions.sqlを実行してください。' }
  }
  if (error) return { success: false, error: error.message }
  revalidatePath('/settings/notifications')
  return { success: true, data: data as NotificationSetting }
}

export async function sendDeadlineWebhookNow(): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const setting = await getNotificationSetting()
  if (!setting?.enabled || !setting.webhook_url) return { success: false, error: 'Webhook通知が有効化されていません。' }

  const today = new Date()
  const dateStrings = setting.days_before.map(days => {
    const d = new Date(today.getTime() + days * 86400000)
    return d.toISOString().split('T')[0]
  })
  const { data: cases, error } = await supabase
    .from('cases')
    .select('id, name, planned_submission_date, status, customers(company_name)')
    .eq('user_id', user.id)
    .in('planned_submission_date', dateStrings)
  if (error) return { success: false, error: error.message }

  type NotifyCase = {
    planned_submission_date: string | null
    name: string
    customers: { company_name: string | null } | { company_name: string | null }[] | null
  }
  const notifyCases = (cases ?? []) as unknown as NotifyCase[]
  const text = notifyCases.length === 0
    ? '申請予定日の通知対象案件はありません。'
    : ['申請予定日が近い案件', ...notifyCases.map(c => {
        const customerName = Array.isArray(c.customers) ? c.customers[0]?.company_name ?? '' : c.customers?.company_name ?? ''
        return `- ${c.planned_submission_date} ${c.name}（${customerName}）`
      })].join('\n')

  const response = await fetch(setting.webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, cases }),
  })
  if (!response.ok) return { success: false, error: await response.text() }

  await supabase.from('notification_settings').update({ last_sent_at: new Date().toISOString() }).eq('id', setting.id).eq('user_id', user.id)
  revalidatePath('/settings/notifications')
  return { success: true, data: { count: cases?.length ?? 0 } }
}
