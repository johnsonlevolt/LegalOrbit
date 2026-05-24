'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Case } from '@/types/database'
import type { CaseFormValues } from '@/types/forms'

function normalizeCasePayload(values: CaseFormValues) {
  return {
    ...values,
    business_type: values.business_type || null,
    application_type: values.application_type || null,
    accepted_date: values.accepted_date || null,
    planned_submission_date: values.planned_submission_date || null,
    submission_date: values.submission_date || null,
    completion_date: values.completion_date || null,
    assignee: values.assignee || null,
    memo: values.memo || null,
  }
}

export async function getCases(filters?: {
  q?: string
  status?: string
  customerId?: string
  assignee?: string
  businessType?: string
  dueFrom?: string
  dueTo?: string
  missingDocs?: boolean
  draftMissing?: boolean
  sortField?: string
  sortDir?: 'asc' | 'desc'
}): Promise<Case[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const sortDir = filters?.sortDir ?? 'desc'
  const ascending = sortDir === 'asc'

  let query = supabase
    .from('cases')
    .select('*, customers(id, company_name)')
    .eq('user_id', user.id)

  if (filters?.sortField === 'planned_submission_date') {
    query = query.order('planned_submission_date', { ascending, nullsFirst: !ascending })
  } else if (filters?.sortField === 'name') {
    query = query.order('name', { ascending })
  } else if (filters?.sortField === 'status') {
    query = query.order('status', { ascending })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.customerId) query = query.eq('customer_id', filters.customerId)
  if (filters?.assignee) query = query.ilike('assignee', `%${filters.assignee}%`)
  if (filters?.businessType) query = query.ilike('business_type', `%${filters.businessType}%`)
  if (filters?.dueFrom) query = query.gte('planned_submission_date', filters.dueFrom)
  if (filters?.dueTo) query = query.lte('planned_submission_date', filters.dueTo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  let cases = (data ?? []) as Case[]

  if (filters?.q) {
    const lower = filters.q.toLowerCase()
    cases = cases.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.customers?.company_name?.toLowerCase().includes(lower) ||
      c.business_type?.toLowerCase().includes(lower)
    )
  }

  if (filters?.missingDocs) {
    const { data: docs } = await supabase
      .from('document_checks')
      .select('case_id')
      .eq('user_id', user.id)
      .eq('required', true)
      .eq('obtained', false)
    const ids = new Set((docs ?? []).map(d => d.case_id))
    cases = cases.filter(c => ids.has(c.id))
  }

  if (filters?.draftMissing) {
    const { data: drafts } = await supabase
      .from('document_drafts')
      .select('case_id')
      .eq('user_id', user.id)
      .eq('status', 'needs_input')
    const ids = new Set((drafts ?? []).map(d => d.case_id))
    cases = cases.filter(c => ids.has(c.id))
  }

  return cases
}

export async function getCase(id: string): Promise<Case | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('cases')
    .select('*, customers(id, company_name)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (error) return null
  return data as Case
}

export async function createCase(values: CaseFormValues): Promise<ActionResult<Case>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('id', values.customer_id)
    .eq('user_id', user.id)
    .single()
  if (customerError || !customer) return { success: false, error: '選択した顧客が見つからないか、権限がありません。' }

  const { data, error } = await supabase
    .from('cases')
    .insert({ ...normalizeCasePayload(values), user_id: user.id })
    .select('*, customers(id, company_name)')
    .single()

  if (error) return { success: false, error: error.message }
  await createInitialCaseTasks(data.id as string, user.id, values.planned_submission_date || null)
  revalidatePath('/cases')
  return { success: true, data: data as Case }
}

export async function updateCase(id: string, values: CaseFormValues): Promise<ActionResult<Case>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('id', values.customer_id)
    .eq('user_id', user.id)
    .single()
  if (customerError || !customer) return { success: false, error: '選択した顧客が見つからないか、権限がありません。' }

  const { data, error } = await supabase
    .from('cases')
    .update(normalizeCasePayload(values))
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, customers(id, company_name)')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/cases')
  revalidatePath(`/cases/${id}`)
  return { success: true, data: data as Case }
}

export async function deleteCase(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { error } = await supabase.from('cases').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/cases')
  return { success: true, data: undefined }
}

async function createInitialCaseTasks(caseId: string, userId: string, plannedSubmissionDate: string | null) {
  const supabase = await createClient()
  const tasks = [
    '顧客へ必要資料を案内',
    '委任状・本人確認資料を確認',
    '申請書ドラフト作成',
    '提出前チェック',
    '申請後の控え・受付情報を保存',
    '完了報告',
  ]
  const dueDate = plannedSubmissionDate || null
  await supabase.from('case_tasks').insert(tasks.map((title, index) => ({
    user_id: userId,
    case_id: caseId,
    title,
    priority: index === 3 ? 'high' : 'normal',
    due_date: dueDate,
  })))
}

