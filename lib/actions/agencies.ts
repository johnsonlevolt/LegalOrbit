'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Agency } from '@/types/database'

export async function getAgencies(): Promise<Agency[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })
  if (error) {
    if (error.message.includes('agencies') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as Agency[]
}

export async function createAgency(formData: FormData): Promise<ActionResult<Agency>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { success: false, error: '提出先名を入力してください。' }

  const { data, error } = await supabase
    .from('agencies')
    .insert({
      user_id: user.id,
      name,
      department: String(formData.get('department') ?? '').trim() || null,
      postal_code: String(formData.get('postal_code') ?? '').trim() || null,
      address: String(formData.get('address') ?? '').trim() || null,
      phone: String(formData.get('phone') ?? '').trim() || null,
      reception_hours: String(formData.get('reception_hours') ?? '').trim() || null,
      memo: String(formData.get('memo') ?? '').trim() || null,
    })
    .select()
    .single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/agencies')
  return { success: true, data: data as Agency }
}

export async function deleteAgency(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const { error } = await supabase.from('agencies').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/agencies')
  return { success: true, data: undefined }
}
