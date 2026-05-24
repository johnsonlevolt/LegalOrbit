'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, AssigneeSetting } from '@/types/database'

function isMissingTableError(message: string) {
  return message.includes('assignee_settings') && message.includes('schema cache')
}

export async function getAssigneeSettings(): Promise<AssigneeSetting[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('assignee_settings')
    .select('*')
    .eq('user_id', user.id)
    .order('code', { ascending: true })

  if (error) {
    if (isMissingTableError(error.message)) return []
    throw new Error(error.message)
  }
  return (data ?? []) as AssigneeSetting[]
}

export async function saveAssigneeSettings(rows: Array<{ code: string; name: string }>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const cleaned = rows
    .map(row => ({ code: row.code.trim(), name: row.name.trim() }))
    .filter(row => row.code && row.name)

  const duplicated = cleaned.find((row, index) => cleaned.findIndex(other => other.code === row.code) !== index)
  if (duplicated) return { success: false, error: `担当者番号 ${duplicated.code} が重複しています。` }

  const { error: deleteError } = await supabase.from('assignee_settings').delete().eq('user_id', user.id)
  if (deleteError) return { success: false, error: deleteError.message }

  if (cleaned.length > 0) {
    const { error: insertError } = await supabase.from('assignee_settings').insert(
      cleaned.map(row => ({ ...row, user_id: user.id }))
    )
    if (insertError) return { success: false, error: insertError.message }
  }

  revalidatePath('/settings/account')
  revalidatePath('/cases/new')
  return { success: true, data: undefined }
}
