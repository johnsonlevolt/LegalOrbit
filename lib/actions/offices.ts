'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Office } from '@/types/database'
import type { OfficeFormValues } from '@/types/forms'
import { isMissingUserIdColumn, userOwnsCase } from './supabase-compat'

export async function getOffices(caseId: string): Promise<Office[]> {
  const { supabase, user, owns } = await userOwnsCase(caseId)
  if (!user || !owns) return []

  let { data, error } = await supabase
    .from('offices')
    .select('*')
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  if (isMissingUserIdColumn(error, 'offices')) {
    ;({ data, error } = await supabase
      .from('offices')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true }))
  }
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getOffice(id: string): Promise<Office | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from('offices').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error) return null
  return data
}

export async function createOffice(caseId: string, values: OfficeFormValues): Promise<ActionResult<Office>> {
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

  let { data, error } = await supabase.from('offices').insert({ ...values, case_id: caseId, user_id: user.id }).select().single()
  if (isMissingUserIdColumn(error, 'offices')) {
    ;({ data, error } = await supabase.from('offices').insert({ ...values, case_id: caseId }).select().single())
  }
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data }
}

export async function updateOffice(id: string, caseId: string, values: OfficeFormValues): Promise<ActionResult<Office>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('offices')
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

export async function deleteOffice(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: office } = await supabase.from('offices').select('case_id').eq('id', id).eq('user_id', user.id).single()
  const { error } = await supabase.from('offices').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  if (office) revalidatePath(`/cases/${office.case_id}`)
  return { success: true, data: undefined }
}

