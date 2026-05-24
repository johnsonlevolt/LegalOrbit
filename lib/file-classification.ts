import type { DocumentCheck } from '@/types/database'

type SupabaseLike = {
  from: (table: string) => {
    select: (columns?: string) => any
    update: (values: Record<string, unknown>) => any
  }
}

type ClassifyInput = {
  supabase: SupabaseLike
  userId: string
  caseId: string
  fileId: string
  fileName: string
  contentType: string
  buffer?: Buffer
  parsedText?: string
}

type Classification = {
  category: string
  document_check_id: string | null
  confidence: number
  source: 'ai' | 'rule' | 'manual'
  reason: string
}

const KEYWORD_MAP: Array<[string, string[]]> = [
  ['車検証', ['車検証', '自動車検査証', '車検', '検査証']],
  ['委任状', ['委任状', '委任']],
  ['履歴事項全部証明書', ['履歴事項', '登記事項', '登記簿', '法人登記']],
  ['住民票', ['住民票']],
  ['印鑑証明書', ['印鑑証明', '印鑑登録証明']],
  ['定款', ['定款']],
  ['納税証明書', ['納税証明']],
  ['賃貸借契約書', ['賃貸借', '使用承諾', '使用権原']],
  ['許可証', ['許可証', '認可書']],
]

export async function autoClassifyCaseFile(input: ClassifyInput): Promise<Classification | null> {
  const checks = await getDocumentChecks(input.supabase, input.caseId, input.userId)
  if (checks.length === 0) return null

  const rule = classifyByRule(input.fileName, input.parsedText ?? '', checks)
  const ai = process.env.OPENAI_API_KEY
    ? await classifyByAi(input, checks).catch(() => null)
    : null
  const classification = ai && ai.confidence >= Math.max(0.72, rule?.confidence ?? 0)
    ? ai
    : rule

  if (!classification) return null
  await applyClassification(input.supabase, input.fileId, input.userId, classification)
  return classification
}

async function getDocumentChecks(supabase: SupabaseLike, caseId: string, userId: string): Promise<DocumentCheck[]> {
  const { data, error } = await supabase
    .from('document_checks')
    .select('id, document_name, required, obtained, verified, deficiency_note, memo, sort_order')
    .eq('case_id', caseId)
    .eq('user_id', userId)
  if (error) return []
  return (data ?? []) as DocumentCheck[]
}

function classifyByRule(fileName: string, parsedText: string, checks: DocumentCheck[]): Classification | null {
  const haystack = normalize(`${fileName} ${parsedText.slice(0, 5000)}`)
  let best: Classification | null = null

  for (const check of checks) {
    const docName = normalize(check.document_name)
    const compactDocName = docName.replace(/\s/g, '')
    let score = 0
    if (docName && haystack.includes(docName)) score += 0.72
    if (compactDocName.length >= 4 && haystack.replace(/\s/g, '').includes(compactDocName.slice(0, 8))) score += 0.18

    for (const [category, keywords] of KEYWORD_MAP) {
      const docMatchesCategory = normalize(check.document_name).includes(normalize(category)) || keywords.some(keyword => normalize(check.document_name).includes(normalize(keyword)))
      const fileMatchesKeyword = keywords.some(keyword => haystack.includes(normalize(keyword)))
      if (docMatchesCategory && fileMatchesKeyword) score += 0.68
    }

    if (score > (best?.confidence ?? 0)) {
      best = {
        category: check.document_name,
        document_check_id: check.id,
        confidence: Math.min(0.98, score),
        source: 'rule',
        reason: 'ファイル名または抽出テキストが必要書類名・関連キーワードと一致しました。',
      }
    }
  }

  if (best && best.confidence >= 0.55) return best

  for (const [category, keywords] of KEYWORD_MAP) {
    if (keywords.some(keyword => haystack.includes(normalize(keyword)))) {
      return {
        category,
        document_check_id: null,
        confidence: 0.5,
        source: 'rule',
        reason: '一般的な書類キーワードから分類しました。該当チェックリストは未確定です。',
      }
    }
  }
  return null
}

async function classifyByAi(input: ClassifyInput, checks: DocumentCheck[]): Promise<Classification | null> {
  const content = [
    {
      type: 'input_text',
      text: [
        '行政書士事務所の添付資料を分類してください。',
        '候補のdocument_check_idに該当する場合は必ずそのidを返してください。',
        '不確実な場合はdocument_check_idをnullにしてください。',
        `ファイル名: ${input.fileName}`,
        `contentType: ${input.contentType}`,
        input.parsedText ? `抽出テキスト: ${input.parsedText.slice(0, 12000)}` : '',
        `候補書類: ${JSON.stringify(checks.map(check => ({ id: check.id, name: check.document_name, required: check.required, deficiency_note: check.deficiency_note })))}`,
      ].filter(Boolean).join('\n\n'),
    },
  ] as Array<Record<string, unknown>>

  if (input.buffer && input.contentType.startsWith('image/')) {
    content.push({
      type: 'input_image',
      image_url: `data:${input.contentType};base64,${input.buffer.toString('base64')}`,
      detail: 'auto',
    })
  } else if (input.buffer && input.contentType === 'application/pdf') {
    content.push({
      type: 'input_file',
      filename: input.fileName,
      file_data: `data:${input.contentType};base64,${input.buffer.toString('base64')}`,
    })
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input: [{ role: 'user', content }],
      text: {
        format: {
          type: 'json_schema',
          name: 'file_classification',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['category', 'document_check_id', 'confidence', 'reason'],
            properties: {
              category: { type: 'string' },
              document_check_id: { type: ['string', 'null'] },
              confidence: { type: 'number' },
              reason: { type: 'string' },
            },
          },
        },
      },
    }),
  })
  if (!response.ok) return null
  const json = await response.json()
  const outputText = json.output_text ?? json.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? []).map((item: { text?: string }) => item.text).filter(Boolean).join('\n')
  if (!outputText) return null
  const parsed = JSON.parse(outputText) as Omit<Classification, 'source'>
  const validId = parsed.document_check_id && checks.some(check => check.id === parsed.document_check_id)
  return {
    category: parsed.category,
    document_check_id: validId ? parsed.document_check_id : null,
    confidence: Math.max(0, Math.min(1, parsed.confidence)),
    source: 'ai',
    reason: parsed.reason,
  }
}

async function applyClassification(supabase: SupabaseLike, fileId: string, userId: string, classification: Classification) {
  await supabase
    .from('case_files')
    .update({
      category: classification.category || null,
      document_check_id: classification.document_check_id,
      classification_confidence: classification.confidence,
      classification_source: classification.source,
      classification_reason: classification.reason,
    })
    .eq('id', fileId)
    .eq('user_id', userId)

  if (classification.document_check_id && classification.confidence >= 0.7) {
    await supabase
      .from('document_checks')
      .update({
        matched_file_id: fileId,
        obtained: true,
      })
      .eq('id', classification.document_check_id)
      .eq('user_id', userId)
  }
}

function normalize(value: string) {
  return value.toLowerCase().normalize('NFKC').replace(/[‐‑‒–—―ーｰ\-_\s]+/g, '')
}
