'use server'

import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, DocumentTemplate } from '@/types/database'
import { isMissingUserIdColumn } from './supabase-compat'

export interface TemplateFormValues {
  name: string
  business_type?: string
  description?: string
  input_fields?: Array<{ key: string; label: string; required: boolean; question: string }>
  items: Array<{ document_name: string; required: boolean; sort_order: number }>
}

// React cache: 同一リクエスト内のDB呼び出しを重複排除する
export const getDocumentTemplates = cache(async (): Promise<DocumentTemplate[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('document_templates')
    .select('*, document_template_items(id, document_name, required, sort_order)')
    .order('created_at', { ascending: false })
  return (data ?? []) as DocumentTemplate[]
})

export async function getDocumentTemplate(id: string): Promise<DocumentTemplate | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('document_templates')
    .select('*, document_template_items(id, document_name, required, sort_order)')
    .eq('id', id)
    .single()
  return data as DocumentTemplate | null
}

export async function createDocumentTemplate(values: TemplateFormValues): Promise<ActionResult<DocumentTemplate>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  let { data: tmpl, error } = await supabase
    .from('document_templates')
    .insert({
      name: values.name,
      business_type: values.business_type || null,
      description: values.description || null,
      input_fields: values.input_fields ?? [],
      user_id: user.id,
    })
    .select()
    .single()
  if (error?.message.includes('input_fields')) {
    ;({ data: tmpl, error } = await supabase
      .from('document_templates')
      .insert({
        name: values.name,
        business_type: values.business_type || null,
        description: values.description || null,
        user_id: user.id,
      })
      .select()
      .single())
  }
  if (error) return { success: false, error: error.message }

  if (values.items.length > 0) {
    const { error: itemError } = await supabase
      .from('document_template_items')
      .insert(values.items.map((item, i) => ({ ...item, template_id: tmpl.id, sort_order: i })))
    if (itemError) return { success: false, error: itemError.message }
  }

  revalidatePath('/settings/templates')
  return { success: true, data: tmpl as DocumentTemplate }
}

export async function updateDocumentTemplate(id: string, values: TemplateFormValues): Promise<ActionResult<DocumentTemplate>> {
  const supabase = await createClient()

  let { data: tmpl, error } = await supabase
    .from('document_templates')
    .update({
      name: values.name,
      business_type: values.business_type || null,
      description: values.description || null,
      input_fields: values.input_fields ?? [],
    })
    .eq('id', id)
    .select()
    .single()
  if (error?.message.includes('input_fields')) {
    ;({ data: tmpl, error } = await supabase
      .from('document_templates')
      .update({
        name: values.name,
        business_type: values.business_type || null,
        description: values.description || null,
      })
      .eq('id', id)
      .select()
      .single())
  }
  if (error) return { success: false, error: error.message }

  // 既存アイテムを削除して入れ直す
  await supabase.from('document_template_items').delete().eq('template_id', id)
  if (values.items.length > 0) {
    await supabase
      .from('document_template_items')
      .insert(values.items.map((item, i) => ({ ...item, template_id: id, sort_order: i })))
  }

  revalidatePath('/settings/templates')
  return { success: true, data: tmpl as DocumentTemplate }
}

export async function deleteDocumentTemplate(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('document_templates').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/settings/templates')
  return { success: true, data: undefined }
}

// テンプレートを書類チェックリストへ適用する
export async function applyTemplateToCase(caseId: string, templateId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: items } = await supabase
    .from('document_template_items')
    .select('*')
    .eq('template_id', templateId)
    .order('sort_order')

  if (!items || items.length === 0) return { success: false, error: 'テンプレートに書類が登録されていません。' }

  let { data: existing, error: existingError } = await supabase
    .from('document_checks')
    .select('sort_order')
    .eq('case_id', caseId)
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
  if (isMissingUserIdColumn(existingError, 'document_checks')) {
    ;({ data: existing, error: existingError } = await supabase
      .from('document_checks')
      .select('sort_order')
      .eq('case_id', caseId)
      .order('sort_order', { ascending: false })
      .limit(1))
  }
  if (existingError) return { success: false, error: existingError.message }
  const maxOrder = existing?.[0]?.sort_order ?? -1

  let { error } = await supabase
    .from('document_checks')
    .insert(
      items.map((item, i) => ({
        case_id: caseId,
        user_id: user.id,
        document_name: item.document_name,
        required: item.required,
        obtained: false,
        verified: false,
        sort_order: maxOrder + 1 + i,
      }))
    )
  if (isMissingUserIdColumn(error, 'document_checks')) {
    ;({ error } = await supabase
      .from('document_checks')
      .insert(
        items.map((item, i) => ({
          case_id: caseId,
          document_name: item.document_name,
          required: item.required,
          obtained: false,
          verified: false,
          sort_order: maxOrder + 1 + i,
        }))
      ))
  }

  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data: undefined }
}

