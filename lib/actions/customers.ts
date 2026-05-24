'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Case, Customer } from '@/types/database'
import type { CustomerFormValues } from '@/types/forms'

function toCustomerPayload(values: CustomerFormValues) {
  return {
    company_name: values.company_name,
    corporate_number: values.corporate_number || null,
    representative_name: values.representative_name || null,
    postal_code: values.postal_code || null,
    address: values.address || [values.prefecture, values.city, values.street, values.building].filter(Boolean).join('') || null,
    phone: values.phone || null,
    email: values.email || null,
    contact_person: values.contact_person || null,
    memo: values.memo || null,
  }
}

export async function getCustomers(filters?: { q?: string }): Promise<Customer[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  const customers = data ?? []

  if (filters?.q) {
    const lower = filters.q.toLowerCase()
    return customers.filter(c =>
      c.company_name.toLowerCase().includes(lower) ||
      c.representative_name?.toLowerCase().includes(lower) ||
      c.contact_person?.toLowerCase().includes(lower)
    )
  }
  return customers
}

export async function getCasesByCustomerId(customerId: string): Promise<Case[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('customer_id', customerId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Case[]
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (error) return null
  return data
}

export async function createCustomer(values: CustomerFormValues): Promise<ActionResult<Customer>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('customers')
    .insert({ ...toCustomerPayload(values), user_id: user.id })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/customers')
  return { success: true, data }
}

export async function updateCustomer(id: string, values: CustomerFormValues): Promise<ActionResult<Customer>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data, error } = await supabase
    .from('customers')
    .update(toCustomerPayload(values))
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return { success: true, data }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { count, error: countError } = await supabase
    .from('cases')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', id)
    .eq('user_id', user.id)
  if (countError) return { success: false, error: countError.message }
  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: `この顧客には案件が${count}件あります。案件を削除するか、別顧客へ変更してから削除してください。`,
    }
  }

  const { error } = await supabase.from('customers').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/customers')
  return { success: true, data: undefined }
}

