'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, CaseCorrection, CaseCorrectionStatus } from '@/types/database'

export async function getCaseCorrections(caseId?: string): Promise<CaseCorrection[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('case_corrections')
    .select('*')
    .eq('user_id', user.id)
    .order('status', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (caseId) query = query.eq('case_id', caseId)
  const { data, error } = await query
  if (error) {
    if (error.message.includes('case_corrections') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseCorrection[]
}

export async function createCaseCorrection(caseId: string, formData: FormData): Promise<ActionResult<CaseCorrection>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const title = String(formData.get('title') ?? '').trim()
  if (!title) return { success: false, error: '補正内容を入力してください。' }

  const { data, error } = await supabase
    .from('case_corrections')
    .insert({
      user_id: user.id,
      case_id: caseId,
      title,
      detail: String(formData.get('detail') ?? '').trim() || null,
      requested_at: String(formData.get('requested_at') ?? '').trim() || new Date().toISOString().split('T')[0],
      due_date: String(formData.get('due_date') ?? '').trim() || null,
      agency_staff: String(formData.get('agency_staff') ?? '').trim() || null,
    })
    .select()
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/workbench')
  return { success: true, data: data as CaseCorrection }
}

export async function updateCaseCorrectionStatus(id: string, status: CaseCorrectionStatus): Promise<ActionResult<CaseCorrection>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('case_corrections')
    .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${data.case_id}`)
  revalidatePath('/workbench')
  return { success: true, data: data as CaseCorrection }
}
