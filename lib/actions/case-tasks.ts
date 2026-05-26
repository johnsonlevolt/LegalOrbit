'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, CaseTask, CaseTaskPriority, CaseTaskStatus } from '@/types/database'

export async function getCaseTasks(caseId?: string): Promise<CaseTask[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('case_tasks')
    .select('*, cases(id, name, planned_submission_date, assignee, customers(company_name))')
    .eq('user_id', user.id)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (caseId) query = query.eq('case_id', caseId)
  const { data, error } = await query
  if (error) {
    if (error.message.includes('case_tasks') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseTask[]
}

export async function createCaseTask(caseId: string, formData: FormData): Promise<ActionResult<CaseTask>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select('id')
    .eq('id', caseId)
    .eq('user_id', user.id)
    .single()
  if (caseError || !caseRow) return { success: false, error: '案件が見つからないか、権限がありません。' }

  const title = String(formData.get('title') ?? '').trim()
  if (!title) return { success: false, error: 'タスク名を入力してください。' }

  const payload = {
    user_id: user.id,
    case_id: caseId,
    title,
    description: String(formData.get('description') ?? '').trim() || null,
    priority: String(formData.get('priority') ?? 'normal') as CaseTaskPriority,
    due_date: String(formData.get('due_date') ?? '').trim() || null,
  }
  const { data, error } = await supabase.from('case_tasks').insert(payload).select().single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/tasks')
  return { success: true, data: data as CaseTask }
}

export async function createCaseTaskFromMemo(caseId: string, memoId: string): Promise<ActionResult<CaseTask>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: memo, error: memoError } = await supabase
    .from('case_communications')
    .select('id, case_id, subject, body')
    .eq('id', memoId)
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .eq('channel', 'memo')
    .single()
  if (memoError || !memo) return { success: false, error: 'メモが見つかりません。' }

  const title = String(memo.subject ?? '').trim() || String(memo.body ?? '').trim().slice(0, 40) || 'メモ確認'
  const { data, error } = await supabase.from('case_tasks').insert({
    user_id: user.id,
    case_id: caseId,
    title,
    description: String(memo.body ?? '').trim() || null,
    priority: 'normal' as CaseTaskPriority,
    due_date: null,
  }).select().single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/tasks')
  return { success: true, data: data as CaseTask }
}

export async function updateCaseTaskStatus(id: string, status: CaseTaskStatus): Promise<ActionResult<CaseTask>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('case_tasks')
    .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${data.case_id}`)
  revalidatePath('/tasks')
  return { success: true, data: data as CaseTask }
}

export async function deleteCaseTask(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: task } = await supabase
    .from('case_tasks')
    .select('case_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  const { error } = await supabase.from('case_tasks').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }

  if (task?.case_id) revalidatePath(`/cases/${task.case_id}`)
  revalidatePath('/tasks')
  return { success: true, data: undefined }
}

