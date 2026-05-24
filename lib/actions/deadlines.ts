'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, CaseDeadline } from '@/types/database'

export async function getCaseDeadlines(caseId?: string): Promise<CaseDeadline[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('case_deadlines')
    .select('*, cases(id, name, planned_submission_date), customers(id, company_name)')
    .eq('user_id', user.id)
    .order('completed', { ascending: true })
    .order('deadline_date', { ascending: true })
  if (caseId) query = query.eq('case_id', caseId)
  const { data, error } = await query
  if (error) {
    if (error.message.includes('case_deadlines') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseDeadline[]
}

export async function createCaseDeadline(caseId: string, customerId: string | null, formData: FormData): Promise<ActionResult<CaseDeadline>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const title = String(formData.get('title') ?? '').trim()
  const deadlineDate = String(formData.get('deadline_date') ?? '').trim()
  if (!title || !deadlineDate) return { success: false, error: '期限名と期限日を入力してください。' }

  const { data, error } = await supabase
    .from('case_deadlines')
    .insert({
      user_id: user.id,
      case_id: caseId,
      customer_id: customerId,
      title,
      deadline_date: deadlineDate,
      kind: String(formData.get('kind') ?? '').trim() || 'other',
      note: String(formData.get('note') ?? '').trim() || null,
      reminder_enabled: formData.get('reminder_enabled') === 'on',
      reminder_days_before: String(formData.get('reminder_days_before') ?? '7,3,1')
        .split(',')
        .map(value => Number(value.trim()))
        .filter(value => Number.isFinite(value) && value >= 0),
    })
    .select()
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/workbench')
  return { success: true, data: data as CaseDeadline }
}

export async function toggleCaseDeadline(id: string, completed: boolean): Promise<ActionResult<CaseDeadline>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('case_deadlines')
    .update({ completed })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }

  if (data.case_id) revalidatePath(`/cases/${data.case_id}`)
  revalidatePath('/workbench')
  return { success: true, data: data as CaseDeadline }
}
