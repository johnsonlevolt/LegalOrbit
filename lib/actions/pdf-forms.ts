'use server'

import { revalidatePath } from 'next/cache'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, PdfFieldMapping, PdfFormOutput, PdfFormTemplate } from '@/types/database'

export async function getPdfFormTemplates(): Promise<PdfFormTemplate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('pdf_form_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) {
    if (error.message.includes('pdf_form_templates') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as PdfFormTemplate[]
}

export async function getPdfFormOutputs(caseId?: string): Promise<PdfFormOutput[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('pdf_form_outputs')
    .select('*, pdf_form_templates(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (caseId) query = query.eq('case_id', caseId)
  const { data, error } = await query
  if (error) {
    if (error.message.includes('pdf_form_outputs') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as PdfFormOutput[]
}

export async function createPdfFormTemplate(formData: FormData): Promise<ActionResult<PdfFormTemplate>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { success: false, error: 'PDFファイルを選択してください。' }
  if (file.type && file.type !== 'application/pdf') return { success: false, error: 'PDFのみ対応しています。' }

  const name = String(formData.get('name') ?? '').trim() || file.name
  const mappingsText = String(formData.get('field_mappings') ?? '[]')
  let fieldMappings: PdfFieldMapping[]
  try {
    fieldMappings = JSON.parse(mappingsText) as PdfFieldMapping[]
    if (!Array.isArray(fieldMappings)) throw new Error()
  } catch {
    return { success: false, error: '座標マッピングJSONが不正です。' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const safeName = file.name.replace(/[^\w.\-()\u3040-\u30ff\u3400-\u9fff]/g, '_')
  const storagePath = `${user.id}/pdf-templates/${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await supabase.storage.from('case-documents').upload(storagePath, buffer, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (uploadError) return { success: false, error: uploadError.message }

  const { data, error } = await supabase.from('pdf_form_templates').insert({
    user_id: user.id,
    name,
    business_type: String(formData.get('business_type') ?? '').trim() || null,
    storage_path: storagePath,
    field_mappings: fieldMappings,
  }).select().single()
  if (error) return { success: false, error: error.message }

  revalidatePath('/pdf-forms')
  return { success: true, data: data as PdfFormTemplate }
}

export async function generatePdfFormOutput(caseId: string, templateId: string): Promise<ActionResult<{ id: string }>> {
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

  const { data: template, error: templateError } = await supabase
    .from('pdf_form_templates')
    .select('*')
    .eq('id', templateId)
    .eq('user_id', user.id)
    .single()
  if (templateError || !template) return { success: false, error: 'PDF帳票テンプレートが見つからないか、権限がありません。' }

  const { data: fileData, error: downloadError } = await supabase.storage.from('case-documents').download(template.storage_path)
  if (downloadError || !fileData) return { success: false, error: downloadError?.message ?? 'PDFを取得できませんでした。' }

  const context = await loadCaseContext(caseId, user.id)
  const pdfDoc = await PDFDocument.load(await fileData.arrayBuffer())
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const pages = pdfDoc.getPages()

  for (const mapping of (template.field_mappings ?? []) as PdfFieldMapping[]) {
    const page = pages[(mapping.page || 1) - 1]
    if (!page) continue
    const text = resolveValue(context, mapping.source || mapping.key)
    if (!text) continue
    page.drawText(text.slice(0, 120), {
      x: mapping.x,
      y: mapping.y,
      size: mapping.size ?? 10,
      font,
      color: rgb(0, 0, 0),
    })
  }

  const bytes = await pdfDoc.save()
  const outputPath = `${user.id}/${caseId}/pdf-outputs/${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage.from('case-documents').upload(outputPath, bytes, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (uploadError) return { success: false, error: uploadError.message }

  const { data: output, error } = await supabase.from('pdf_form_outputs').insert({
    user_id: user.id,
    case_id: caseId,
    template_id: templateId,
    storage_path: outputPath,
  }).select().single()
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/pdf-forms')
  return { success: true, data: { id: output.id as string } }
}

async function loadCaseContext(caseId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cases')
    .select(`
      *,
      customers(*),
      vehicles(*),
      offices(*),
      garages(*),
      people(*),
      document_checks(*)
    `)
    .eq('id', caseId)
    .eq('user_id', userId)
    .single()
  return data ?? {}
}

function resolveValue(context: unknown, source: string): string {
  const root = context as Record<string, unknown>
  const normalized = source.replace(/\[(\d+)\]/g, '.$1')
  const value = normalized.split('.').reduce<unknown>((acc, key) => {
    if (acc == null) return undefined
    if (Array.isArray(acc)) return acc[Number(key)]
    return (acc as Record<string, unknown>)[key]
  }, root)
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

