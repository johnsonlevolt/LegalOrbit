'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'

const RELATED_TABLES = ['vehicles', 'offices', 'garages', 'people', 'document_checks'] as const

export async function copyCase(caseId: string, formData?: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: source, error: sourceError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .single()
  if (sourceError || !source) return { success: false, error: 'コピー元の案件が見つかりません。' }

  const name = String(formData?.get('name') ?? '').trim() || `${source.name} のコピー`
  const includeRelated = formData?.get('include_related') !== 'off'
  const includeTasks = formData?.get('include_tasks') === 'on'

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, customers: _customers, ...casePayload } = source as Record<string, unknown>
  const { data: copied, error } = await supabase
    .from('cases')
    .insert({
      ...casePayload,
      name,
      user_id: user.id,
      status: '相談中',
      submission_date: null,
      completion_date: null,
    })
    .select('id')
    .single()
  if (error || !copied?.id) return { success: false, error: error?.message ?? '案件コピーに失敗しました。' }

  if (includeRelated) {
    for (const table of RELATED_TABLES) {
      const { data } = await supabase.from(table).select('*').eq('case_id', caseId).eq('user_id', user.id)
      const rows = (data ?? []).map(row => stripRow(row, copied.id as string, user.id))
      if (rows.length > 0) await supabase.from(table).insert(rows)
    }
  }

  if (includeTasks) {
    const { data } = await supabase.from('case_tasks').select('*').eq('case_id', caseId).eq('user_id', user.id)
    const rows = (data ?? []).map(row => ({ ...stripRow(row, copied.id as string, user.id), status: 'todo', completed_at: null }))
    if (rows.length > 0) await supabase.from('case_tasks').insert(rows)
  }

  revalidatePath('/cases')
  return { success: true, data: { id: copied.id as string } }
}

function stripRow(row: Record<string, unknown>, caseId: string, userId: string) {
  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, cases: _cases, ...payload } = row
  return { ...payload, user_id: userId, case_id: caseId }
}
