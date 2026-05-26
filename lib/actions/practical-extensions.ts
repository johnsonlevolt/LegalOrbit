'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { hashCouponCode } from '@/lib/security/hash'
import { getBillingProfile } from '@/lib/actions/billing'
import type {
  ActionResult,
  BankAccount,
  AgencyRule,
  CaseCommunication,
  CaseEstimate,
  CaseFile,
  CaseReview,
  DocumentCheck,
  EstimateLineItem,
  TaxSummaryLine,
  UploadLink,
} from '@/types/database'

const REVIEW_ITEMS = [
  '氏名・法人名・所在地の表記を確認',
  '日付・申請区分を確認',
  '添付書類の有効期限を確認',
  '署名・押印・委任状を確認',
  '提出先の手数料・部数を確認',
]

export async function getUploadLinks(caseId: string): Promise<UploadLink[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('upload_links').select('*').eq('case_id', caseId).eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) {
    if (error.message.includes('upload_links') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as UploadLink[]
}

export async function createUploadLink(caseId: string, formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '')
  const days = Number(formData.get('days') ?? 14)
  const expiresAt = new Date(Date.now() + Math.max(1, days) * 86400000).toISOString()
  const label = String(formData.get('label') ?? '').trim() || '資料アップロード'

  const { error } = await supabase.from('upload_links').insert({
    user_id: user.id,
    case_id: caseId,
    token_hash: hashCouponCode(token),
    label,
    expires_at: expiresAt,
    max_uploads: Number(formData.get('max_uploads') ?? '') || null,
  })
  if (error) return { success: false, error: error.message }

  revalidatePath(`/cases/${caseId}`)
  return { success: true, data: { url: `/upload/${token}` } }
}

export async function getCaseReviews(caseId: string): Promise<CaseReview[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('case_reviews').select('*').eq('case_id', caseId).eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) {
    if (error.message.includes('case_reviews') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseReview[]
}

export async function createCaseReview(caseId: string): Promise<ActionResult<CaseReview>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const { data, error } = await supabase.from('case_reviews').insert({
    user_id: user.id,
    case_id: caseId,
    checklist: REVIEW_ITEMS.map(label => ({ label, checked: false })),
  }).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data: data as CaseReview }
}

export async function updateCaseReview(reviewId: string, formData: FormData): Promise<ActionResult<CaseReview>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const checklist = REVIEW_ITEMS.map((label, index) => ({ label, checked: formData.get(`item_${index}`) === 'on' }))
  const status = String(formData.get('status') ?? 'pending')
  const { data, error } = await supabase.from('case_reviews').update({
    checklist,
    status,
    note: String(formData.get('note') ?? '').trim() || null,
    reviewed_by: status === 'pending' ? null : user.id,
    reviewed_at: status === 'pending' ? null : new Date().toISOString(),
  }).eq('id', reviewId).eq('user_id', user.id).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${data.case_id}`)
  return { success: true, data: data as CaseReview }
}

export async function getCaseCommunications(caseId: string): Promise<CaseCommunication[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('case_communications').select('*').eq('case_id', caseId).eq('user_id', user.id).order('contacted_at', { ascending: false })
  if (error) {
    if (error.message.includes('case_communications') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseCommunication[]
}

export async function getCaseMemos(caseId?: string): Promise<CaseCommunication[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  let query = supabase
    .from('case_communications')
    .select('*, cases(id, name, assignee, customers(company_name))')
    .eq('user_id', user.id)
    .eq('channel', 'memo')
    .order('contacted_at', { ascending: false })
  if (caseId) query = query.eq('case_id', caseId)
  const { data, error } = await query
  if (error) {
    if (error.message.includes('case_communications') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseCommunication[]
}

export async function createCaseMemo(caseId: string, customerId: string | null, formData: FormData): Promise<ActionResult<CaseCommunication>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const body = String(formData.get('body') ?? '').trim()
  if (!body) return { success: false, error: 'メモを入力してください。' }
  const subject = String(formData.get('subject') ?? '').trim() || body.slice(0, 40)
  const { data, error } = await supabase.from('case_communications').insert({
    user_id: user.id,
    case_id: caseId,
    customer_id: customerId,
    channel: 'memo',
    direction: 'outbound',
    subject,
    body,
    contacted_at: new Date().toISOString(),
  }).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  revalidatePath('/tasks')
  return { success: true, data: data as CaseCommunication }
}

export async function createCaseCommunication(caseId: string, customerId: string | null, formData: FormData): Promise<ActionResult<CaseCommunication>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const subject = String(formData.get('subject') ?? '').trim()
  if (!subject) return { success: false, error: '件名を入力してください。' }
  const { data, error } = await supabase.from('case_communications').insert({
    user_id: user.id,
    case_id: caseId,
    customer_id: customerId,
    channel: String(formData.get('channel') ?? 'phone'),
    direction: String(formData.get('direction') ?? 'outbound'),
    subject,
    body: String(formData.get('body') ?? '').trim() || null,
    contacted_at: String(formData.get('contacted_at') ?? '').trim() || new Date().toISOString(),
  }).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data: data as CaseCommunication }
}

export async function getAgencyRules(): Promise<AgencyRule[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('agency_rules').select('*, agencies(id, name)').eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) {
    if (error.message.includes('agency_rules') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as AgencyRule[]
}

export async function createAgencyRule(formData: FormData): Promise<ActionResult<AgencyRule>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const title = String(formData.get('title') ?? '').trim()
  const detail = String(formData.get('detail') ?? '').trim()
  if (!title || !detail) return { success: false, error: 'ルール名と内容を入力してください。' }
  const agencyId = String(formData.get('agency_id') ?? '').trim()
  const checklist = String(formData.get('checklist') ?? '')
    .split(/\r?\n/)
    .map(label => label.trim())
    .filter(Boolean)
    .map(label => ({ label, required: true }))
  const { data, error } = await supabase.from('agency_rules').insert({
    user_id: user.id,
    agency_id: agencyId || null,
    business_type: String(formData.get('business_type') ?? '').trim() || null,
    title,
    detail,
    checklist,
    effective_from: String(formData.get('effective_from') ?? '').trim() || null,
    source_url: String(formData.get('source_url') ?? '').trim() || null,
  }).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath('/agencies')
  return { success: true, data: data as AgencyRule }
}

export async function getCaseEstimates(caseId: string): Promise<CaseEstimate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase.from('case_estimates').select('*').eq('case_id', caseId).eq('user_id', user.id).order('created_at', { ascending: false })
  if (error) {
    if (error.message.includes('case_estimates') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseEstimate[]
}

export async function createCaseEstimate(caseId: string, formData: FormData): Promise<ActionResult<CaseEstimate>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const taxInclusion = String(formData.get('tax_inclusion') ?? 'exclusive') === 'inclusive' ? 'inclusive' : 'exclusive'
  const estimateItems = parseEstimateItems(String(formData.get('line_items') ?? '[]'), taxInclusion)
  const fee = estimateItems.filter(item => item.category === 'fee').reduce((sum, item) => sum + item.net_amount, 0)
  const expense = estimateItems.filter(item => item.category === 'expense').reduce((sum, item) => sum + item.net_amount, 0)
  const tax = estimateItems.reduce((sum, item) => sum + item.tax_amount, 0)
  const taxSummary = summarizeTax(estimateItems)
  const { data, error } = await supabase.from('case_estimates').insert({
    user_id: user.id,
    case_id: caseId,
    title: String(formData.get('title') ?? '').trim() || '見積',
    recipient_name: String(formData.get('recipient_name') ?? '').trim() || null,
    issued_at: String(formData.get('issued_at') ?? '').trim() || new Date().toISOString().split('T')[0],
    due_date: String(formData.get('due_date') ?? '').trim() || null,
    line_items: estimateItems,
    tax_inclusion: taxInclusion,
    tax_summary: taxSummary,
    fee_amount: fee,
    expense_amount: expense,
    tax_amount: tax,
    memo: String(formData.get('memo') ?? '').trim() || null,
  }).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${caseId}`)
  return { success: true, data: data as CaseEstimate }
}

export async function updateCaseEstimate(estimateId: string, formData: FormData): Promise<ActionResult<CaseEstimate>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const taxInclusion = String(formData.get('tax_inclusion') ?? 'exclusive') === 'inclusive' ? 'inclusive' : 'exclusive'
  const estimateItems = parseEstimateItems(String(formData.get('line_items') ?? '[]'), taxInclusion)
  const fee = estimateItems.filter(item => item.category === 'fee').reduce((sum, item) => sum + item.net_amount, 0)
  const expense = estimateItems.filter(item => item.category === 'expense').reduce((sum, item) => sum + item.net_amount, 0)
  const tax = estimateItems.reduce((sum, item) => sum + item.tax_amount, 0)
  const taxSummary = summarizeTax(estimateItems)
  const { data, error } = await supabase.from('case_estimates').update({
    title: String(formData.get('title') ?? '').trim() || '見積',
    recipient_name: String(formData.get('recipient_name') ?? '').trim() || null,
    issued_at: String(formData.get('issued_at') ?? '').trim() || new Date().toISOString().split('T')[0],
    due_date: String(formData.get('due_date') ?? '').trim() || null,
    line_items: estimateItems,
    tax_inclusion: taxInclusion,
    tax_summary: taxSummary,
    fee_amount: fee,
    expense_amount: expense,
    tax_amount: tax,
    memo: String(formData.get('memo') ?? '').trim() || null,
  }).eq('id', estimateId).eq('user_id', user.id).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${data.case_id}`)
  return { success: true, data: data as CaseEstimate }
}

export async function issueInvoiceFromEstimate(estimateId: string, formData?: FormData): Promise<ActionResult<{ document_id: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }

  const { data: estimate, error: estimateError } = await supabase
    .from('case_estimates')
    .select('*, cases(name, customers(company_name))')
    .eq('id', estimateId)
    .eq('user_id', user.id)
    .single()
  if (estimateError || !estimate) return { success: false, error: estimateError?.message ?? '見積が見つかりません。' }

  const documentNumber = `INV-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${String(Date.now()).slice(-5)}`
  const amount = Number(estimate.fee_amount ?? 0) + Number(estimate.expense_amount ?? 0)
  const taxAmount = Number(estimate.tax_amount ?? 0)
  const recipient = estimate.recipient_name || estimate.cases?.customers?.company_name || 'お客様'
  const lineItems = Array.isArray(estimate.line_items) ? estimate.line_items : []
  const taxSummary = Array.isArray(estimate.tax_summary) ? estimate.tax_summary : []
  const profile = await getBillingProfile()
  const selectedBankIds = parseSelectedBankIds(String(formData?.get('bank_account_ids') ?? '[]'))
  const bankAccounts = selectBankAccounts(profile?.bank_accounts ?? [], selectedBankIds)
  const paymentDueDate = String(formData?.get('payment_due_date') ?? '').trim() || null
  const issuerSnapshot = {
    billing_name: profile?.billing_name ?? null,
    billing_email: profile?.billing_email ?? null,
    phone: profile?.phone ?? null,
    postal_code: profile?.postal_code ?? null,
    address: profile?.address ?? null,
    tax_id: profile?.tax_id ?? null,
    seal_image_path: profile?.seal_image_path ?? null,
  }

  const { data: document, error } = await supabase.from('billing_documents').insert({
    user_id: user.id,
    document_type: 'invoice',
    document_number: documentNumber,
    issue_date: new Date().toISOString().split('T')[0],
    title: estimate.title || estimate.cases?.name || '案件請求',
    recipient_name: recipient,
    amount,
    tax_amount: taxAmount,
    line_items: lineItems,
    tax_inclusion: estimate.tax_inclusion ?? 'exclusive',
    tax_summary: taxSummary,
    issuer_snapshot: issuerSnapshot,
    bank_accounts: bankAccounts,
    payment_due_date: paymentDueDate,
    status: 'draft',
    memo: estimate.memo ?? null,
  }).select('id').single()
  if (error || !document) return { success: false, error: error?.message ?? '請求書を作成できませんでした。' }

  await supabase.from('case_estimates').update({
    status: 'invoiced',
    invoice_document_id: document.id,
  }).eq('id', estimateId).eq('user_id', user.id)

  revalidatePath(`/cases/${estimate.case_id}`)
  revalidatePath('/settings/account')
  return { success: true, data: { document_id: document.id as string } }
}

export async function markEstimateAccepted(estimateId: string): Promise<ActionResult<CaseEstimate>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const { data, error } = await supabase.from('case_estimates').update({
    status: 'accepted',
    accepted_at: new Date().toISOString(),
  }).eq('id', estimateId).eq('user_id', user.id).select().single()
  if (error) return { success: false, error: error.message }
  revalidatePath(`/cases/${data.case_id}`)
  return { success: true, data: data as CaseEstimate }
}

export async function getAllCaseEstimates(): Promise<CaseEstimate[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('case_estimates')
    .select('*, cases(id, name, customers(company_name))')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) {
    if (error.message.includes('case_estimates') && error.message.includes('schema cache')) return []
    throw new Error(error.message)
  }
  return (data ?? []) as CaseEstimate[]
}

function parseSelectedBankIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

function selectBankAccounts(accounts: BankAccount[], ids: string[]): BankAccount[] {
  if (ids.length === 0) return []
  const idSet = new Set(ids)
  return accounts.filter(account => idSet.has(account.id))
}

function parseEstimateItems(raw: string, taxInclusion: 'exclusive' | 'inclusive'): EstimateLineItem[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = []
  }

  const rows = Array.isArray(parsed) ? parsed : []
  const items = rows
    .map(row => {
      if (!row || typeof row !== 'object') return null
      const record = row as Record<string, unknown>
      const description = String(record.description ?? '').trim()
      const category = record.category === 'expense' ? 'expense' : 'fee'
      const quantity = Math.max(1, Number(record.quantity ?? 1) || 1)
      const unit = String(record.unit ?? '').trim() || '式'
      const unitPrice = Math.max(0, Math.round(Number(record.unit_price ?? 0) || 0))
      const taxRate = Number(record.tax_rate ?? 10) === 8 ? 8 : Number(record.tax_rate ?? 10) === 0 ? 0 : 10
      const inputAmount = Math.round(quantity * unitPrice)
      const netAmount = taxInclusion === 'inclusive'
        ? Math.round(inputAmount / (1 + taxRate / 100))
        : inputAmount
      const taxAmount = taxInclusion === 'inclusive'
        ? inputAmount - netAmount
        : Math.round(netAmount * taxRate / 100)
      const totalAmount = netAmount + taxAmount

      if (!description && inputAmount === 0) return null
      return {
        description: description || (category === 'fee' ? '報酬' : '実費'),
        category,
        quantity,
        unit,
        unit_price: unitPrice,
        tax_rate: taxRate,
        net_amount: netAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      } satisfies EstimateLineItem
    })
    .filter((item): item is EstimateLineItem => Boolean(item))

  return items.length > 0 ? items : [{
    description: '報酬',
    category: 'fee',
    quantity: 1,
    unit: '式',
    unit_price: 0,
    tax_rate: 10,
    net_amount: 0,
    tax_amount: 0,
    total_amount: 0,
  }]
}

function summarizeTax(items: EstimateLineItem[]): TaxSummaryLine[] {
  const map = new Map<number, TaxSummaryLine>()
  for (const item of items) {
    const current = map.get(item.tax_rate) ?? {
      tax_rate: item.tax_rate,
      net_amount: 0,
      tax_amount: 0,
      total_amount: 0,
    }
    current.net_amount += item.net_amount
    current.tax_amount += item.tax_amount
    current.total_amount += item.total_amount
    map.set(item.tax_rate, current)
  }
  return Array.from(map.values()).sort((a, b) => b.tax_rate - a.tax_rate)
}

export async function classifyCaseFile(fileId: string, category: string, documentCheckId?: string): Promise<ActionResult<CaseFile>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '未認証です。' }
  const { data, error } = await supabase.from('case_files').update({
    category: category || null,
    document_check_id: documentCheckId || null,
  }).eq('id', fileId).eq('user_id', user.id).select().single()
  if (error) return { success: false, error: error.message }
  if (documentCheckId) {
    await supabase.from('document_checks').update({ matched_file_id: fileId, obtained: true }).eq('id', documentCheckId).eq('user_id', user.id)
  }
  revalidatePath(`/cases/${data.case_id}`)
  return { success: true, data: data as CaseFile }
}
