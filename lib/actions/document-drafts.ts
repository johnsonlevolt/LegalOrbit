'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  ActionResult,
  DocumentDraft,
  DocumentTemplate,
  ExtractedField,
  MissingField,
  UploadedDraftFile,
} from '@/types/database'
import { extractTextFromUpload, type ParsedFileText } from '@/lib/document-extraction'
import { autoClassifyCaseFile } from '@/lib/file-classification'

type AiDraftResult = {
  extracted_fields: ExtractedField[]
  missing_fields: MissingField[]
  completed_markdown: string
  notes: string[]
}

const MAX_FILE_SIZE = 20 * 1024 * 1024
const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export async function getDocumentDrafts(caseId: string): Promise<DocumentDraft[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('document_drafts')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
  if (error) {
    if (error.message.includes('document_drafts') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as DocumentDraft[]
}

export async function getDocumentDraft(id: string): Promise<DocumentDraft | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('document_drafts').select('*').eq('id', id).single()
  if (error) return null
  return data as DocumentDraft
}

export async function createDocumentDraft(caseId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  if (!process.env.OPENAI_API_KEY) return { success: false, error: 'OPENAI_API_KEY が未設定です。' }

  const title = String(formData.get('title') ?? '').trim() || '譖ｸ鬘樔ｽ懈・繝峨Λ繝輔ヨ'
  const templateIdValue = String(formData.get('template_id') ?? '').trim()
  const templateId = templateIdValue || null
  const extraInstructions = String(formData.get('extra_instructions') ?? '').trim()
  const files = formData.getAll('files').filter((item): item is File => item instanceof File && item.size > 0)
  if (files.length === 0) return { success: false, error: '読み込む資料を1つ以上添付してください。' }

  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select(`
      id,
      name,
      business_type,
      application_type,
      status,
      accepted_date,
      planned_submission_date,
      submission_date,
      completion_date,
      assignee,
      memo,
      customers(company_name, corporate_number, representative_name, postal_code, address, phone, email, contact_person),
      vehicles(registration_number, chassis_number, vehicle_name, model, usage, ownership_type, max_loading_capacity, gross_vehicle_weight, first_registration_date, inspection_expiry_date, owner_name, user_name, base_location, memo),
      offices(name, postal_code, address, phone, area, usage_rights, memo),
      garages(name, postal_code, address, area, capacity, usage_rights, distance_from_office, memo),
      people(full_name, furigana, role, birth_date, address, phone, license_number, appointment_date, memo),
      document_checks(document_name, required, obtained, verified, deficiency_note, memo)
    `)
    .eq('id', caseId)
    .single()
  if (caseError || !caseData) return { success: false, error: '案件が見つからないか、権限がありません。' }

  const template = templateId ? await getTemplateForDraft(templateId) : null
  const draftId = crypto.randomUUID()
  const uploadedFiles: UploadedDraftFile[] = []
  const fileBuffers: Array<{ name: string; type: string; buffer: Buffer; parsedText?: string }> = []
  const aiInputs = []
  const parsedTexts: ParsedFileText[] = []

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) return { success: false, error: `${file.name} は20MBを超えています。` }
    if (file.type && !SUPPORTED_FILE_TYPES.includes(file.type)) {
      return { success: false, error: `${file.name} は未対応の形式です。PDF、画像、テキスト、Word、Excelを添付してください。` }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const safeName = file.name.replace(/[^\w.\-()\u3040-\u30ff\u3400-\u9fff]/g, '_')
    const path = `${user.id}/${caseId}/${draftId}/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('case-documents')
      .upload(path, buffer, { contentType: file.type || 'application/octet-stream', upsert: false })
    if (uploadError) return { success: false, error: `繝輔ぃ繧､繝ｫ菫晏ｭ倥↓螟ｱ謨励＠縺ｾ縺励◆: ${uploadError.message}` }

    uploadedFiles.push({ name: file.name, path, type: file.type || 'application/octet-stream', size: file.size })
    aiInputs.push(toOpenAiInput(file, buffer))
    const parsedText = extractTextFromUpload(file, buffer)
    if (parsedText) parsedTexts.push(parsedText)
    fileBuffers.push({ name: file.name, type: file.type || 'application/octet-stream', buffer, parsedText: parsedText?.text })
  }

  let aiResult: AiDraftResult
  try {
    aiResult = await analyzeFilesWithOpenAi({
      caseData,
      template,
      extraInstructions,
      fileInputs: aiInputs,
      parsedTexts,
    })
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'AI解析に失敗しました。' }
  }
  aiResult = withTemplateRequiredQuestions(aiResult, template)

  const status = aiResult.missing_fields.length > 0 ? 'needs_input' : 'completed'
  const { error } = await supabase.from('document_drafts').insert({
    id: draftId,
    user_id: user.id,
    case_id: caseId,
    template_id: templateId,
    title,
    status,
    uploaded_files: uploadedFiles,
    extracted_fields: aiResult.extracted_fields,
    missing_fields: aiResult.missing_fields,
    generated_content: aiResult.completed_markdown,
    notes: aiResult.notes,
  })

  if (error) return { success: false, error: error.message }

  if (uploadedFiles.length > 0) {
    const { data: insertedFiles } = await supabase.from('case_files').insert(uploadedFiles.map(file => ({
      user_id: user.id,
      case_id: caseId,
      draft_id: draftId,
      name: file.name,
      storage_path: file.path,
      content_type: file.type,
      size_bytes: file.size,
      source: 'ai_draft',
    }))).select('id, name')
    for (const inserted of insertedFiles ?? []) {
      const source = fileBuffers.find(file => file.name === inserted.name)
      if (!source) continue
      await autoClassifyCaseFile({
        supabase,
        userId: user.id,
        caseId,
        fileId: inserted.id,
        fileName: source.name,
        contentType: source.type,
        buffer: source.buffer,
        parsedText: source.parsedText,
      })
    }
  }

  await writeAuditLog({
    userId: user.id,
    caseId,
    action: 'document_draft.create',
    targetType: 'document_draft',
    targetId: draftId,
    details: { title, file_count: uploadedFiles.length, template_id: templateId },
  })

  revalidatePath(`/cases/${caseId}`)
  return { success: true, data: { id: draftId } }
}

export async function answerDraftQuestions(draftId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  if (!process.env.OPENAI_API_KEY) return { success: false, error: 'OPENAI_API_KEY が未設定です。' }

  const draft = await getDocumentDraft(draftId)
  if (!draft) return { success: false, error: 'ドラフトが見つかりません。' }

  const answers = { ...draft.answers }
  for (const field of draft.missing_fields) {
    const value = String(formData.get(`answer_${field.key}`) ?? '').trim()
    if (value) answers[field.key] = value
  }

  const stillMissing = draft.missing_fields.filter(field => !answers[field.key])
  let aiResult: AiDraftResult
  try {
    aiResult = await regenerateWithAnswers({
      draft,
      answers,
      stillMissing,
    })
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'ドラフト更新に失敗しました。' }
  }

  const { error } = await supabase
    .from('document_drafts')
    .update({
      answers,
      missing_fields: aiResult.missing_fields,
      generated_content: aiResult.completed_markdown,
      notes: aiResult.notes,
      status: aiResult.missing_fields.length > 0 ? 'needs_input' : 'completed',
    })
    .eq('id', draftId)

  if (error) return { success: false, error: error.message }
  await writeAuditLog({
    userId: user.id,
    caseId: draft.case_id,
    action: 'document_draft.answer',
    targetType: 'document_draft',
    targetId: draftId,
    details: { answered_keys: Object.keys(answers), remaining_missing: aiResult.missing_fields.length },
  })
  revalidatePath(`/cases/${draft.case_id}`)
  revalidatePath(`/cases/${draft.case_id}/drafts/${draft.id}`)
  return { success: true, data: { id: draftId } }
}

export async function saveDraftAnswers(draftId: string, formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const draft = await getDocumentDraft(draftId)
  if (!draft) return { success: false, error: 'ドラフトが見つかりません。' }

  const answers = { ...draft.answers }
  for (const field of draft.missing_fields) {
    const value = String(formData.get(`answer_${field.key}`) ?? '').trim()
    if (value) answers[field.key] = value
  }

  const { error } = await supabase
    .from('document_drafts')
    .update({ answers })
    .eq('id', draftId)
  if (error) return { success: false, error: error.message }

  await writeAuditLog({
    userId: user.id,
    caseId: draft.case_id,
    action: 'document_draft.save_answers',
    targetType: 'document_draft',
    targetId: draftId,
    details: { answered_keys: Object.keys(answers) },
  })
  revalidatePath(`/cases/${draft.case_id}/drafts/${draftId}`)
  return { success: true, data: { id: draftId } }
}

export async function updateDraftContent(draftId: string, content: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const draft = await getDocumentDraft(draftId)
  if (!draft) return { success: false, error: 'ドラフトが見つかりません。' }

  const { error } = await supabase
    .from('document_drafts')
    .update({ generated_content: content, status: 'completed' })
    .eq('id', draftId)
  if (error) return { success: false, error: error.message }

  await writeAuditLog({
    userId: user.id,
    caseId: draft.case_id,
    action: 'document_draft.manual_edit',
    targetType: 'document_draft',
    targetId: draftId,
    details: { content_length: content.length },
  })
  revalidatePath(`/cases/${draft.case_id}`)
  revalidatePath(`/cases/${draft.case_id}/drafts/${draftId}`)
  return { success: true, data: { id: draftId } }
}

export async function markDraftReviewed(draftId: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const draft = await getDocumentDraft(draftId)
  if (!draft) return { success: false, error: 'ドラフトが見つかりません。' }

  const { error } = await supabase
    .from('document_drafts')
    .update({ reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', draftId)
  if (error) return { success: false, error: error.message }

  await writeAuditLog({
    userId: user.id,
    caseId: draft.case_id,
    action: 'document_draft.review',
    targetType: 'document_draft',
    targetId: draftId,
    details: {},
  })
  revalidatePath(`/cases/${draft.case_id}`)
  revalidatePath(`/cases/${draft.case_id}/drafts/${draftId}`)
  return { success: true, data: { id: draftId } }
}

export async function deleteDocumentDraft(draftId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const draft = await getDocumentDraft(draftId)
  if (!draft) return { success: false, error: 'ドラフトが見つかりません。' }

  for (const file of draft.uploaded_files) {
    await supabase.storage.from('case-documents').remove([file.path])
  }
  await supabase.from('case_files').delete().eq('draft_id', draftId)

  const { error } = await supabase.from('document_drafts').delete().eq('id', draftId)
  if (error) return { success: false, error: error.message }

  await writeAuditLog({
    userId: user.id,
    caseId: draft.case_id,
    action: 'document_draft.delete',
    targetType: 'document_draft',
    targetId: draftId,
    details: { title: draft.title, file_count: draft.uploaded_files.length },
  })
  revalidatePath(`/cases/${draft.case_id}`)
  return { success: true, data: undefined }
}

export async function applyDraftExtractedFields(draftId: string): Promise<ActionResult<{ updated: number; created: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const draft = await getDocumentDraft(draftId)
  if (!draft) return { success: false, error: 'ドラフトが見つかりません。' }

  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('id, customer_id')
    .eq('id', draft.case_id)
    .single()
  if (caseError || !caseData) return { success: false, error: '案件が見つからないか、権限がありません。' }

  const buckets = mapExtractedFields(draft.extracted_fields)
  let updated = 0
  let created = 0

  if (Object.keys(buckets.customer).length > 0) {
    const { error } = await supabase.from('customers').update(buckets.customer).eq('id', caseData.customer_id)
    if (error) return { success: false, error: error.message }
    updated++
  }

  if (Object.keys(buckets.case).length > 0) {
    const { error } = await supabase.from('cases').update(buckets.case).eq('id', draft.case_id)
    if (error) return { success: false, error: error.message }
    updated++
  }

  if (Object.keys(buckets.vehicle).length > 0) {
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('case_id', draft.case_id)
      .limit(1)
      .maybeSingle()
    if (existingVehicle?.id) {
      const { error } = await supabase.from('vehicles').update(buckets.vehicle).eq('id', existingVehicle.id)
      if (error) return { success: false, error: error.message }
      updated++
    } else {
      const { error } = await supabase.from('vehicles').insert({ ...buckets.vehicle, case_id: draft.case_id, user_id: user.id })
      if (error) return { success: false, error: error.message }
      created++
    }
  }

  if (Object.keys(buckets.office).length > 0) {
    const { data: existingOffice } = await supabase
      .from('offices')
      .select('id')
      .eq('case_id', draft.case_id)
      .limit(1)
      .maybeSingle()
    if (existingOffice?.id) {
      const { error } = await supabase.from('offices').update(buckets.office).eq('id', existingOffice.id)
      if (error) return { success: false, error: error.message }
      updated++
    } else if (buckets.office.name || buckets.office.address) {
      const { error } = await supabase.from('offices').insert({ name: buckets.office.name ?? '蝟ｶ讌ｭ謇', ...buckets.office, case_id: draft.case_id, user_id: user.id })
      if (error) return { success: false, error: error.message }
      created++
    }
  }

  if (Object.keys(buckets.garage).length > 0) {
    const { data: existingGarage } = await supabase
      .from('garages')
      .select('id')
      .eq('case_id', draft.case_id)
      .limit(1)
      .maybeSingle()
    if (existingGarage?.id) {
      const { error } = await supabase.from('garages').update(buckets.garage).eq('id', existingGarage.id)
      if (error) return { success: false, error: error.message }
      updated++
    } else if (buckets.garage.name || buckets.garage.address) {
      const { error } = await supabase.from('garages').insert({ name: buckets.garage.name ?? '霆雁ｺｫ', ...buckets.garage, case_id: draft.case_id, user_id: user.id })
      if (error) return { success: false, error: error.message }
      created++
    }
  }

  await writeAuditLog({
    userId: user.id,
    caseId: draft.case_id,
    action: 'document_draft.apply_extracted_fields',
    targetType: 'document_draft',
    targetId: draftId,
    details: { updated, created },
  })
  revalidatePath(`/cases/${draft.case_id}`)
  revalidatePath(`/cases/${draft.case_id}/drafts/${draft.id}`)
  return { success: true, data: { updated, created } }
}

async function getTemplateForDraft(templateId: string): Promise<DocumentTemplate | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('document_templates')
    .select('*, document_template_items(id, document_name, required, sort_order)')
    .eq('id', templateId)
    .single()
  return data as DocumentTemplate | null
}

async function writeAuditLog(input: {
  userId: string
  caseId: string | null
  action: string
  targetType: string
  targetId: string | null
  details: Record<string, unknown>
}) {
  const supabase = await createClient()
  await supabase.from('audit_logs').insert({
    user_id: input.userId,
    case_id: input.caseId,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    details: input.details,
  })
}

function toOpenAiInput(file: File, buffer: Buffer) {
  const mimeType = file.type || 'application/octet-stream'
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
  if (mimeType.startsWith('image/')) {
    return { type: 'input_image', image_url: dataUrl, detail: 'auto' }
  }
  return { type: 'input_file', filename: file.name, file_data: dataUrl }
}

function withTemplateRequiredQuestions(result: AiDraftResult, template: DocumentTemplate | null): AiDraftResult {
  const requiredFields = (template?.input_fields ?? []).filter(field => field.required)
  if (requiredFields.length === 0) return result

  const knownKeys = new Set([
    ...result.extracted_fields.map(field => field.key),
    ...result.missing_fields.map(field => field.key),
  ])
  const knownLabels = new Set([
    ...result.extracted_fields.map(field => field.label),
    ...result.missing_fields.map(field => field.label),
  ])
  const additionalMissing = requiredFields
    .filter(field => !knownKeys.has(field.key) && !knownLabels.has(field.label))
    .map(field => ({
      key: field.key,
      label: field.label,
      question: field.question,
      reason: 'テンプレート上の必須入力項目です。',
      required: true,
    }))

  if (additionalMissing.length === 0) return result
  return {
    ...result,
    missing_fields: [...result.missing_fields, ...additionalMissing],
    notes: [...result.notes, 'テンプレートの必須入力項目を不足質問に追加しました。'],
  }
}

function mapExtractedFields(fields: ExtractedField[]) {
  const buckets: {
    customer: Record<string, string>
    case: Record<string, string>
    vehicle: Record<string, string>
    office: Record<string, string>
    garage: Record<string, string>
  } = { customer: {}, case: {}, vehicle: {}, office: {}, garage: {} }

  for (const field of fields) {
    const value = field.value?.trim()
    if (!value || field.confidence < 0.55) continue
    const label = `${field.key} ${field.label}`.toLowerCase()

    assignIf(label, value, buckets.customer, [
      ['company_name', ['法人名', '会社名', '屋号', '商号', 'company']],
      ['corporate_number', ['法人番号']],
      ['representative_name', ['代表者', '代表取締役']],
      ['postal_code', ['郵便番号']],
      ['address', ['所在地', '住所']],
      ['phone', ['電話', 'tel']],
      ['email', ['メール', 'email']],
      ['contact_person', ['担当者', '連絡先担当']],
    ])
    assignIf(label, value, buckets.case, [
      ['business_type', ['業務種別', '業務内容']],
      ['application_type', ['申請区分', '申請種別']],
      ['assignee', ['担当者', '担当']],
      ['accepted_date', ['受任日']],
      ['planned_submission_date', ['申請予定日', '提出予定日']],
      ['submission_date', ['申請日', '提出日']],
      ['completion_date', ['完了日']],
    ])
    assignIf(label, value, buckets.vehicle, [
      ['registration_number', ['登録番号', '車両番号', 'ナンバー']],
      ['chassis_number', ['車台番号']],
      ['vehicle_name', ['車名']],
      ['model', ['型式']],
      ['usage', ['用途']],
      ['ownership_type', ['自家用', '事業用']],
      ['max_loading_capacity', ['最大積載量']],
      ['gross_vehicle_weight', ['車両総重量']],
      ['first_registration_date', ['初度登録']],
      ['inspection_expiry_date', ['車検満了']],
      ['owner_name', ['所有者']],
      ['user_name', ['使用者']],
      ['base_location', ['使用の本拠']],
    ])
    assignIf(label, value, buckets.office, [
      ['name', ['営業所名', '営業所名称']],
      ['postal_code', ['営業所郵便番号']],
      ['address', ['営業所所在地', '営業所住所']],
      ['phone', ['営業所電話']],
      ['area', ['営業所面積', '面積']],
      ['usage_rights', ['営業所使用権原', '使用権原']],
    ])
    assignIf(label, value, buckets.garage, [
      ['name', ['車庫名', '車庫名称']],
      ['postal_code', ['車庫郵便番号']],
      ['address', ['車庫所在地', '車庫住所', '保管場所']],
      ['area', ['車庫面積']],
      ['capacity', ['収容台数']],
      ['usage_rights', ['車庫使用権原', '使用権原']],
      ['distance_from_office', ['営業所からの距離', '距離']],
    ])
  }

  return buckets
}

function assignIf(targetText: string, value: string, target: Record<string, string>, mappings: Array<[string, string[]]>) {
  for (const [column, keywords] of mappings) {
    if (target[column]) continue
    if (keywords.some(keyword => targetText.includes(keyword.toLowerCase()))) {
      target[column] = value
    }
  }
}

async function analyzeFilesWithOpenAi(input: {
  caseData: unknown
  template: DocumentTemplate | null
  extraInstructions: string
  fileInputs: Array<Record<string, unknown>>
  parsedTexts: ParsedFileText[]
}): Promise<AiDraftResult> {
  const prompt = [
    'あなたは行政書士事務所の書類作成補助AIです。',
    '添付資料から申請、届出、許認可書類に転記できる情報を抽出し、選択テンプレートに沿って完成プレビューをMarkdownで作成してください。',
    '推測で埋めてはいけません。不明な項目は missing_fields に質問として出してください。',
    '本人確認番号、法人番号、住所、日付、資格者証番号などは原文を優先し、表記を勝手に正規化しすぎないでください。',
    `案件情報: ${JSON.stringify(input.caseData)}`,
    `テンプレート: ${JSON.stringify(input.template)}`,
    input.parsedTexts.length > 0 ? `ファイル種別ごとの事前抽出テキスト: ${JSON.stringify(input.parsedTexts)}` : '',
    input.extraInstructions ? `追加指示: ${input.extraInstructions}` : '',
  ].filter(Boolean).join('\n\n')

  return callOpenAi([
    {
      role: 'user',
      content: [
        { type: 'input_text', text: prompt },
        ...input.fileInputs,
      ],
    },
  ])
}

async function regenerateWithAnswers(input: {
  draft: DocumentDraft
  answers: Record<string, string>
  stillMissing: MissingField[]
}): Promise<AiDraftResult> {
  const prompt = [
    '行政書士事務所の書類作成ドラフトを更新してください。',
    '抽出済み情報とユーザー回答を使い、完成プレビューをMarkdownで再作成してください。',
    'まだ回答がない必須項目は missing_fields に残してください。',
    `抽出済み情報: ${JSON.stringify(input.draft.extracted_fields)}`,
    `前回の不足項目: ${JSON.stringify(input.draft.missing_fields)}`,
    `ユーザー回答: ${JSON.stringify(input.answers)}`,
    `未回答項目: ${JSON.stringify(input.stillMissing)}`,
    `現在のプレビュー: ${input.draft.generated_content ?? ''}`,
  ].join('\n\n')

  return callOpenAi([{ role: 'user', content: [{ type: 'input_text', text: prompt }] }])
}

async function callOpenAi(input: unknown): Promise<AiDraftResult> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input,
      text: {
        format: {
          type: 'json_schema',
          name: 'document_draft_result',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['extracted_fields', 'missing_fields', 'completed_markdown', 'notes'],
            properties: {
              extracted_fields: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['key', 'label', 'value', 'confidence', 'source'],
                  properties: {
                    key: { type: 'string' },
                    label: { type: 'string' },
                    value: { type: 'string' },
                    confidence: { type: 'number' },
                    source: { type: ['string', 'null'] },
                  },
                },
              },
              missing_fields: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['key', 'label', 'question', 'reason', 'required'],
                  properties: {
                    key: { type: 'string' },
                    label: { type: 'string' },
                    question: { type: 'string' },
                    reason: { type: 'string' },
                    required: { type: 'boolean' },
                  },
                },
              },
              completed_markdown: { type: 'string' },
              notes: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`OpenAI APIエラー: ${message}`)
  }

  const json = await response.json()
  const outputText = json.output_text ?? json.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? []).map((content: { text?: string }) => content.text).filter(Boolean).join('\n')
  if (!outputText) throw new Error('AIの解析結果が空でした。')
  return JSON.parse(outputText) as AiDraftResult
}

