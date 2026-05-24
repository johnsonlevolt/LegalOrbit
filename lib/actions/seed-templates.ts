'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types/database'
import type { TemplateData } from '@/lib/data/template-types'
import { GENERAL_ADMIN_TEMPLATES } from '@/lib/data/templates-general-admin'
import { TEMPLATES_KENSETSU } from '@/lib/data/templates-kensetsu'
import { TEMPLATES_IMMIGRATION } from '@/lib/data/templates-immigration'
import { NOUCHI_SOUZOKU_TEMPLATES } from '@/lib/data/templates-nouchi-souzoku'
import { WELFARE_NPO_TEMPLATES } from '@/lib/data/templates-welfare-npo'
import { foodEntertainmentTemplates } from '@/lib/data/templates-food-entertainment'

const DEFAULT_TEMPLATES: TemplateData[] = [
  ...GENERAL_ADMIN_TEMPLATES,
  ...TEMPLATES_KENSETSU,
  ...TEMPLATES_IMMIGRATION,
  ...NOUCHI_SOUZOKU_TEMPLATES,
  ...WELFARE_NPO_TEMPLATES,
  ...foodEntertainmentTemplates,
]

export async function seedDefaultTemplates(): Promise<ActionResult<{ count: number }>> {
  const result = await insertMissingDefaultTemplates()
  if (!result.success) return result
  revalidatePath('/settings/templates')
  return result
}

export async function ensureDefaultTemplates(): Promise<ActionResult<{ count: number }>> {
  return insertMissingDefaultTemplates()
}

async function insertMissingDefaultTemplates(): Promise<ActionResult<{ count: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: existing, error: existingError } = await supabase
    .from('document_templates')
    .select('name')
    .eq('user_id', user.id)
  if (existingError) return { success: false, error: existingError.message }

  const existingNames = new Set((existing ?? []).map(row => row.name))
  const targets = DEFAULT_TEMPLATES.filter(template => !existingNames.has(template.name))
  if (targets.length === 0) return { success: false, error: 'すべての標準テンプレートは登録済みです。' }

  let count = 0
  for (const template of targets) {
    let { data, error } = await supabase
      .from('document_templates')
      .insert({
        user_id: user.id,
        name: template.name,
        business_type: template.business_type,
        description: template.description,
        input_fields: template.input_fields ?? [],
      })
      .select('id')
      .single()
    if (error?.message.includes('input_fields')) {
      ;({ data, error } = await supabase
        .from('document_templates')
        .insert({
          user_id: user.id,
          name: template.name,
          business_type: template.business_type,
          description: template.description,
        })
        .select('id')
        .single())
    }
    if (error) return { success: false, error: error.message }
    if (!data) return { success: false, error: 'テンプレート登録結果を取得できませんでした。' }

    if (template.items.length > 0) {
      const { error: itemsError } = await supabase.from('document_template_items').insert(
        template.items.map((item, index) => ({
          template_id: data.id,
          document_name: item.document_name,
          required: item.required,
          sort_order: index,
        }))
      )
      if (itemsError) return { success: false, error: itemsError.message }
    }
    count++
  }

  return { success: true, data: { count } }
}
