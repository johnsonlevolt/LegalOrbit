'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, DocumentCheck } from '@/types/database'
import type { DocumentCheckFormValues } from '@/types/forms'
import { isMissingUserIdColumn, userOwnsCase } from './supabase-compat'

export async function getDocumentChecks(caseId: string): Promise<DocumentCheck[]> {
  const { supabase, user, owns } = await userOwnsCase(caseId)
  if (!user || !owns) return []

  let { data, error } = await supabase
    .from('document_checks')
    .select('*')
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (isMissingUserIdColumn(error, 'document_checks')) {
    ;({ data, error } = await supabase
      .from('document_checks')
      .select('*')
      .eq('case_id', caseId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }))
  }
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDocumentCheck(id: string): Promise<DocumentCheck | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from('document_checks').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error) return null
  return data
}

export async function createDocumentCheck(caseId: string, values: DocumentCheckFormValues): Promise<ActionResult<DocumentCheck>> {
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

  let { data, error } = await supabase
    .from('document_checks')
    .insert({ ...values, case_id: caseId, user_id: user.id })
    .select()
    .single()
  if (isMissingUserIdColumn(error, 'document_checks')) {
    ;({ data, error } = await supabase
      .from('document_checks')
      .insert({ ...values, case_id: caseId })
      .select()
      .single())
  }
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data }
}

export async function toggleDocumentCheck(
  id: string,
  field: 'obtained' | 'verified',
  value: boolean
): Promise<ActionResult<DocumentCheck>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('document_checks')
    .update({ [field]: value })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${data.case_id}`)
  return { success: true, data }
}

export async function bulkUpdateDocumentChecks(
  caseId: string,
  mode: 'required_obtained' | 'obtained_verified'
): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const query = supabase
    .from('document_checks')
    .update(mode === 'required_obtained' ? { obtained: true } : { verified: true })
    .eq('case_id', caseId)
    .eq('user_id', user.id)

  if (mode === 'required_obtained') {
    query.eq('required', true).eq('obtained', false)
  } else {
    query.eq('obtained', true).eq('verified', false)
  }

  const { data, error } = await query.select('id')
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data: { count: data?.length ?? 0 } }
}

export async function updateDocumentCheck(
  id: string,
  caseId: string,
  values: DocumentCheckFormValues
): Promise<ActionResult<DocumentCheck>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('document_checks')
    .update(values)
    .eq('id', id)
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data }
}

export async function deleteDocumentCheck(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: doc } = await supabase.from('document_checks').select('case_id').eq('id', id).eq('user_id', user.id).single()
  const { error } = await supabase.from('document_checks').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  if (doc) revalidatePath(`/cases/${doc.case_id}`)
  return { success: true, data: undefined }
}

