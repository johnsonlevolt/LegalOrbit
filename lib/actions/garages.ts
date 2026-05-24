'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Garage } from '@/types/database'
import type { GarageFormValues } from '@/types/forms'
import { isMissingUserIdColumn, userOwnsCase } from './supabase-compat'

export async function getGarages(caseId: string): Promise<Garage[]> {
  const { supabase, user, owns } = await userOwnsCase(caseId)
  if (!user || !owns) return []

  let { data, error } = await supabase
    .from('garages')
    .select('*')
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  if (isMissingUserIdColumn(error, 'garages')) {
    ;({ data, error } = await supabase
      .from('garages')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true }))
  }
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getGarage(id: string): Promise<Garage | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.from('garages').select('*').eq('id', id).eq('user_id', user.id).single()
  if (error) return null
  return data
}

export async function createGarage(caseId: string, values: GarageFormValues): Promise<ActionResult<Garage>> {
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

  let { data, error } = await supabase.from('garages').insert({ ...values, case_id: caseId, user_id: user.id }).select().single()
  if (isMissingUserIdColumn(error, 'garages')) {
    ;({ data, error } = await supabase.from('garages').insert({ ...values, case_id: caseId }).select().single())
  }
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data }
}

export async function updateGarage(id: string, caseId: string, values: GarageFormValues): Promise<ActionResult<Garage>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('garages')
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

export async function deleteGarage(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: garage } = await supabase.from('garages').select('case_id').eq('id', id).eq('user_id', user.id).single()
  const { error } = await supabase.from('garages').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  if (garage) revalidatePath(`/cases/${garage.case_id}`)
  return { success: true, data: undefined }
}

