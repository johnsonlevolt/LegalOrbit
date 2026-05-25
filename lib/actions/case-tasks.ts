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

