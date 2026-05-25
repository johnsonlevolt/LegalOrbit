'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import type { BankAccount, BillingProfile, CaseCommunication, CaseEstimate, CaseFile, CaseReview, DocumentCheck, EstimateLineItem, TaxSummaryLine, UploadLink } from '@/types/database'
import {
  classifyCaseFile,
  createCaseCommunication,
  createCaseEstimate,
  createCaseReview,
  createUploadLink,
  issueInvoiceFromEstimate,
  markEstimateAccepted,
  updateCaseEstimate,
  updateCaseReview,
} from '@/lib/actions/practical-extensions'
import { formatYen } from '@/lib/billing/plans'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PracticalPanels({
  caseId,
  customerId,
  customerName,
  files,
  documentChecks,
  uploadLinks,
  reviews,
  communications,
  estimates,
  billingProfile,
}: {
  caseId: string
  customerId: string | null
  customerName?: string | null
  files: CaseFile[]
  documentChecks: DocumentCheck[]
  uploadLinks: UploadLink[]
  reviews: CaseReview[]
  communications: CaseCommunication[]
  estimates: CaseEstimate[]
  billingProfile?: BillingProfile | null
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <EstimatePanelV2 caseId={caseId} customerName={customerName} estimates={estimates} billingProfile={billingProfile} />
      <UploadLinkPanel caseId={caseId} links={uploadLinks} />
      <FileClassificationPanel files={files} documentChecks={documentChecks} />
      <ReviewPanel caseId={caseId} reviews={reviews} />
      <CommunicationPanel caseId={caseId} customerId={customerId} communications={communications} />
    </div>
  )
}

function UploadLinkPanel({ caseId, links }: { caseId: string; links: UploadLink[] }) {
  const router = useRouter()
  const [createdUrl, setCreatedUrl] = useState('')
  const [isPending, startTransition] = useTransition()
  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createUploadLink(caseId, formData)
      if (!result.success) {
        toast({ title: 'リンクを作成できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      const absolute = `${window.location.origin}${result.data.url}`
      setCreatedUrl(absolute)
      await navigator.clipboard.writeText(absolute)
      toast({ title: 'アップロードリンクを作成し、コピーしました' })
      router.refresh()
    })
  }
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">資料アップロードリンク</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <form action={create} className="grid gap-2 md:grid-cols-[1fr_7rem_7rem_auto]">
          <Input name="label" className="bg-white" placeholder="顧客向け資料提出" />
          <Input name="days" className="bg-white" type="number" defaultValue={14} min={1} />
          <Input name="max_uploads" className="bg-white" type="number" placeholder="上限" min={1} />
          <Button disabled={isPending}>発行</Button>
        </form>
        {createdUrl && <Input readOnly value={createdUrl} className="bg-white" />}
        <div className="space-y-1">
          {links.slice(0, 3).map(link => (
            <p key={link.id} className="text-xs text-muted-foreground">
              {link.label} / 期限 {new Date(link.expires_at).toLocaleDateString('ja-JP')} / {link.upload_count}件
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function FileClassificationPanel({ files, documentChecks }: { files: CaseFile[]; documentChecks: DocumentCheck[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  function classify(fileId: string, category: string, documentCheckId: string) {
    startTransition(async () => {
      const result = await classifyCaseFile(fileId, category, documentCheckId === 'none' ? undefined : documentCheckId)
      if (!result.success) toast({ title: '分類できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">ファイル分類・不足資料照合</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {files.length === 0 ? <p className="text-sm text-muted-foreground">ファイルはまだありません</p> : files.slice(0, 8).map(file => (
          <div key={file.id} className="rounded-md border p-2">
            <p className="text-sm font-medium">{file.name}</p>
            {(file.classification_source || file.classification_confidence != null) && (
              <p className="text-xs text-muted-foreground">
                自動分類: {file.classification_source === 'ai' ? 'AI' : 'ルール'}
                {file.classification_confidence != null ? ` / 信頼度 ${Math.round(file.classification_confidence * 100)}%` : ''}
                {file.classification_reason ? ` / ${file.classification_reason}` : ''}
              </p>
            )}
            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <Input placeholder="分類名" className="bg-white" defaultValue={file.category ?? ''} id={`cat-${file.id}`} />
              <Select defaultValue={file.document_check_id ?? 'none'} onValueChange={value => {
                const input = document.getElementById(`cat-${file.id}`) as HTMLInputElement | null
                classify(file.id, input?.value ?? '', value)
              }}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="書類チェックと紐づけ" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未紐づけ</SelectItem>
                  {documentChecks.map(check => <SelectItem key={check.id} value={check.id}>{check.document_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => {
                const input = document.getElementById(`cat-${file.id}`) as HTMLInputElement | null
                classify(file.id, input?.value ?? '', file.document_check_id ?? 'none')
              }}>保存</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function ReviewPanel({ caseId, reviews }: { caseId: string; reviews: CaseReview[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const review = reviews[0]
  function create() {
    startTransition(async () => {
      const result = await createCaseReview(caseId)
      if (!result.success) toast({ title: 'レビューを作成できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }
  function update(formData: FormData) {
    if (!review) return
    startTransition(async () => {
      const result = await updateCaseReview(review.id, formData)
      if (!result.success) toast({ title: 'レビューを更新できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">提出前レビュー承認</CardTitle></CardHeader>
      <CardContent>
        {!review ? (
          <Button onClick={create} disabled={isPending}>レビューを作成</Button>
        ) : (
          <form action={update} className="space-y-2">
            {review.checklist.map((item, index) => (
              <label key={item.label} className="flex gap-2 text-sm">
                <input type="checkbox" name={`item_${index}`} defaultChecked={item.checked} />
                {item.label}
              </label>
            ))}
            <Textarea name="note" className="bg-white" defaultValue={review.note ?? ''} placeholder="レビュー所見" />
            <div className="flex gap-2">
              <Button name="status" value="approved" disabled={isPending}>承認</Button>
              <Button name="status" value="rejected" variant="outline" disabled={isPending}>差し戻し</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function CommunicationPanel({ caseId, customerId, communications }: { caseId: string; customerId: string | null; communications: CaseCommunication[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createCaseCommunication(caseId, customerId, formData)
      if (!result.success) toast({ title: '連絡履歴を保存できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">顧客連絡履歴</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <form action={create} className="space-y-2">
          <div className="grid gap-2 md:grid-cols-3">
            <Input name="subject" className="bg-white" placeholder="件名" />
            <Input name="channel" className="bg-white" placeholder="電話/メール/LINE" />
            <Input name="contacted_at" className="bg-white" type="datetime-local" />
          </div>
          <Textarea name="body" className="bg-white" placeholder="内容" rows={3} />
          <Button disabled={isPending}>保存</Button>
        </form>
        {communications.slice(0, 5).map(item => (
          <div key={item.id} className="rounded-md border p-2 text-sm">
            <p className="font-medium">{item.subject}</p>
            <p className="text-xs text-muted-foreground">{item.channel} / {new Date(item.contacted_at).toLocaleString('ja-JP')}</p>
            {item.body && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.body}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

type EstimateInputLine = {
  description: string
  category: 'fee' | 'expense'
  quantity: number
  unit?: string
  unit_price: number
  tax_rate: number
}

function EstimatePanelV2({
  caseId,
  customerName,
  estimates,
  billingProfile,
}: {
  caseId: string
  customerName?: string | null
  estimates: CaseEstimate[]
  billingProfile?: BillingProfile | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingEstimateId, setEditingEstimateId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [recipientName, setRecipientName] = useState(customerName ?? '')
  const [issuedAt, setIssuedAt] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [memo, setMemo] = useState('')
  const [taxInclusion, setTaxInclusion] = useState<'exclusive' | 'inclusive'>('exclusive')
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>((billingProfile?.bank_accounts ?? []).map(account => account.id))
  const [paymentDueDate, setPaymentDueDate] = useState('')
  const [lines, setLines] = useState<EstimateInputLine[]>([
    { description: '申請手続報酬', category: 'fee', quantity: 1, unit: '式', unit_price: 0, tax_rate: 10 },
    { description: '証紙・行政手数料等', category: 'expense', quantity: 1, unit: '式', unit_price: 0, tax_rate: 0 },
  ])
  const calculated = useMemo(() => calculateEstimateLines(lines, taxInclusion), [lines, taxInclusion])
  const latestEstimate = estimates[0]

  function updateLine(index: number, values: Partial<EstimateInputLine>) {
    setLines(current => current.map((line, i) => i === index ? { ...line, ...values } : line))
  }

  function addLine(category: 'fee' | 'expense') {
    setLines(current => [
      ...current,
      { description: category === 'fee' ? '報酬項目' : '実費項目', category, quantity: 1, unit: '式', unit_price: 0, tax_rate: category === 'fee' ? 10 : 0 },
    ])
  }

  function removeLine(index: number) {
    setLines(current => current.length <= 1 ? current : current.filter((_, i) => i !== index))
  }

  function resetForm() {
    setEditingEstimateId(null)
    setTitle('')
    setRecipientName(customerName ?? '')
    setIssuedAt('')
    setDueDate('')
    setMemo('')
    setTaxInclusion('exclusive')
    setLines([
      { description: '申請手続報酬', category: 'fee', quantity: 1, unit: '式', unit_price: 0, tax_rate: 10 },
      { description: '証紙・行政手数料等', category: 'expense', quantity: 1, unit: '式', unit_price: 0, tax_rate: 0 },
    ])
  }

  function editEstimate(item: CaseEstimate) {
    setEditingEstimateId(item.id)
    setTitle(item.title)
    setRecipientName(item.recipient_name ?? customerName ?? '')
    setIssuedAt(item.issued_at ?? '')
    setDueDate(item.due_date ?? '')
    setMemo(item.memo ?? '')
    setTaxInclusion(item.tax_inclusion ?? 'exclusive')
    setLines((Array.isArray(item.line_items) && item.line_items.length > 0 ? item.line_items : []).map(line => ({
      description: line.description,
      category: line.category,
      quantity: line.quantity,
      unit: line.unit ?? '式',
      unit_price: line.unit_price,
      tax_rate: line.tax_rate,
    })))
  }

  function saveEstimate(formData: FormData) {
    formData.set('line_items', JSON.stringify(lines))
    formData.set('tax_inclusion', taxInclusion)
    startTransition(async () => {
      const result = editingEstimateId
        ? await updateCaseEstimate(editingEstimateId, formData)
        : await createCaseEstimate(caseId, formData)
      if (!result.success) {
        toast({ title: '見積を保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: editingEstimateId ? '見積を更新しました' : '見積を保存しました' })
      resetForm()
      router.refresh()
    })
  }

  function accept(id: string) {
    startTransition(async () => {
      const result = await markEstimateAccepted(id)
      if (!result.success) toast({ title: '見積を承認済みにできませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }

  function toggleBankAccount(account: BankAccount, checked: boolean) {
    setSelectedBankIds(current => checked
      ? Array.from(new Set([...current, account.id]))
      : current.filter(id => id !== account.id)
    )
  }

  function invoice(id: string) {
    const formData = new FormData()
    formData.set('bank_account_ids', JSON.stringify(selectedBankIds))
    formData.set('payment_due_date', paymentDueDate)
    startTransition(async () => {
      const result = await issueInvoiceFromEstimate(id, formData)
      if (!result.success) {
        toast({ title: '請求書を作成できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '請求書を作成しました' })
      router.push(`/settings/account/billing/${result.data.document_id}/print`)
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">見積・請求</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">見積を保存し、PDF確認、編集、受注処理、請求書発行まで進めます。</p>
          </div>
          {latestEstimate && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/cases/${latestEstimate.case_id}/estimates/${latestEstimate.id}/print`}>最新見積PDF</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={saveEstimate} className="rounded-md border bg-slate-50 p-4">
          <input type="hidden" name="case_id" value={caseId} />
          <input type="hidden" name="line_items" value={JSON.stringify(lines)} />
          <input type="hidden" name="tax_inclusion" value={taxInclusion} />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">見積名</span>
              <Input name="title" className="bg-white" value={title} onChange={event => setTitle(event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">宛名</span>
              <Input name="recipient_name" className="bg-white" value={recipientName} onChange={event => setRecipientName(event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">発行日</span>
              <Input name="issued_at" className="bg-white" type="date" value={issuedAt} onChange={event => setIssuedAt(event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">支払期限</span>
              <Input name="due_date" className="bg-white" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} />
            </label>
          </div>

          <div className="mt-4 rounded-md border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
              <div>
                <p className="text-sm font-semibold">見積明細</p>
                <p className="text-xs text-muted-foreground">名目、区分、数量、単位、単価、税率を入力します。</p>
              </div>
              <Select value={taxInclusion} onValueChange={value => setTaxInclusion(value as 'exclusive' | 'inclusive')}>
                <SelectTrigger className="h-9 w-32 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclusive">外税</SelectItem>
                  <SelectItem value="inclusive">内税</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 p-3">
              <div className="hidden gap-2 px-2 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[2fr_6rem_5rem_5rem_8rem_6rem_7rem_auto]">
                <span>名目</span><span>区分</span><span>数量</span><span>単位</span><span>単価</span><span>税率</span><span className="text-right">金額</span><span />
              </div>
              {lines.map((line, index) => (
                <div key={index} className="grid gap-2 rounded-md border bg-slate-50 p-2 md:grid-cols-[2fr_6rem_5rem_5rem_8rem_6rem_7rem_auto]">
                  <label className="space-y-1 md:space-y-0">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">名目</span>
                    <Input className="bg-white" value={line.description} onChange={event => updateLine(index, { description: event.target.value })} />
                  </label>
                  <label className="space-y-1 md:space-y-0">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">区分</span>
                    <Select value={line.category} onValueChange={value => updateLine(index, { category: value as 'fee' | 'expense' })}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fee">報酬</SelectItem>
                        <SelectItem value="expense">実費</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-1 md:space-y-0">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">数量</span>
                    <Input className="bg-white text-right" type="number" min={1} value={line.quantity} onChange={event => updateLine(index, { quantity: Number(event.target.value) || 1 })} />
                  </label>
                  <label className="space-y-1 md:space-y-0">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">単位</span>
                    <Input className="bg-white" value={line.unit ?? ''} onChange={event => updateLine(index, { unit: event.target.value })} />
                  </label>
                  <label className="space-y-1 md:space-y-0">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">単価</span>
                    <div className="relative">
                      <Input className="bg-white pr-8 text-right" type="number" min={0} value={line.unit_price} onChange={event => updateLine(index, { unit_price: Number(event.target.value) || 0 })} />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">円</span>
                    </div>
                  </label>
                  <label className="space-y-1 md:space-y-0">
                    <span className="text-xs font-medium text-muted-foreground md:hidden">税率</span>
                    <Select value={String(line.tax_rate)} onValueChange={value => updateLine(index, { tax_rate: Number(value) })}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10%</SelectItem>
                        <SelectItem value="8">8%</SelectItem>
                        <SelectItem value="0">非課税</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <div className="flex items-center justify-end text-sm font-medium">
                    {formatYen(calculated.items[index]?.total_amount ?? 0)}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(index)}>削除</Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addLine('fee')}>報酬を追加</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addLine('expense')}>実費を追加</Button>
              </div>
            </div>
            <div className="grid gap-2 border-t bg-slate-50 p-3 text-sm md:grid-cols-4">
              <div><span className="text-muted-foreground">報酬</span><p className="font-semibold">{formatYen(calculated.fee)}</p></div>
              <div><span className="text-muted-foreground">実費</span><p className="font-semibold">{formatYen(calculated.expense)}</p></div>
              <div><span className="text-muted-foreground">消費税</span><p className="font-semibold">{formatYen(calculated.tax)}</p></div>
              <div><span className="text-muted-foreground">税込合計</span><p className="text-lg font-bold">{formatYen(calculated.total)}</p></div>
            </div>
          </div>

          <label className="mt-4 block space-y-1 text-sm">
            <span className="font-medium">条件・メモ</span>
            <Textarea name="memo" className="min-h-24 bg-white" value={memo} onChange={event => setMemo(event.target.value)} />
          </label>

          <div className="mt-4 flex justify-end gap-2">
            {editingEstimateId && <Button type="button" variant="outline" onClick={resetForm}>新規作成に戻す</Button>}
            <Button disabled={isPending}>{editingEstimateId ? '見積を更新' : '見積を保存'}</Button>
          </div>
        </form>

        {estimates.length === 0 && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">見積はまだありません。</div>
        )}

        {estimates.length > 0 && (
          <div className="rounded-md border bg-white p-3 text-sm">
            <p className="font-medium">請求書発行設定</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">振込期限</span>
                <Input type="date" className="bg-white" value={paymentDueDate} onChange={event => setPaymentDueDate(event.target.value)} />
              </label>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">表示する振込口座</span>
                <div className="space-y-1 rounded-md border bg-slate-50 p-2">
                  {(billingProfile?.bank_accounts ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">設定の会社情報で振込口座を登録してください。</p>
                  ) : (billingProfile?.bank_accounts ?? []).map(account => (
                    <label key={account.id} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={selectedBankIds.includes(account.id)} onChange={event => toggleBankAccount(account, event.target.checked)} />
                      <span>{account.label || account.bank_name} / {account.bank_name} {account.branch_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {estimates.slice(0, 5).map(item => {
          const total = item.fee_amount + item.expense_amount + item.tax_amount
          return (
            <div key={item.id} className="rounded-md border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{estimateStatusLabel(item.status)}</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">{formatYen(total)}</p>
                  <p className="text-xs text-muted-foreground">
                    報酬 {formatYen(item.fee_amount)} / 実費 {formatYen(item.expense_amount)} / 税 {formatYen(item.tax_amount)}
                    {item.tax_inclusion === 'inclusive' ? ' / 内税' : ' / 外税'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => editEstimate(item)} disabled={isPending}>編集</Button>
                  <Button asChild size="sm" variant="outline"><Link href={`/cases/${item.case_id}/estimates/${item.id}/print`}>見積書PDF</Link></Button>
                  <Button size="sm" variant="outline" onClick={() => accept(item.id)} disabled={isPending}>受注済みにする</Button>
                  <Button size="sm" onClick={() => invoice(item.id)} disabled={isPending}>請求書を作成して開く</Button>
                </div>
              </div>
              {item.memo && <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-muted-foreground"><p className="whitespace-pre-wrap">{item.memo}</p></div>}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function EstimatePanel({
  caseId,
  customerName,
  estimates,
  billingProfile,
}: {
  caseId: string
  customerName?: string | null
  estimates: CaseEstimate[]
  billingProfile?: BillingProfile | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [taxInclusion, setTaxInclusion] = useState<'exclusive' | 'inclusive'>('exclusive')
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>((billingProfile?.bank_accounts ?? []).map(account => account.id))
  const [paymentDueDate, setPaymentDueDate] = useState('')
  const [editingEstimateId, setEditingEstimateId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [recipientName, setRecipientName] = useState(customerName ?? '')
  const [issuedAt, setIssuedAt] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [memo, setMemo] = useState('')
  const [lines, setLines] = useState<EstimateInputLine[]>([
    { description: '申請手続報酬', category: 'fee', quantity: 1, unit_price: 0, tax_rate: 10 },
    { description: '証紙・行政手数料等', category: 'expense', quantity: 1, unit_price: 0, tax_rate: 0 },
  ])

  const calculated = useMemo(() => calculateEstimateLines(lines, taxInclusion), [lines, taxInclusion])

  function updateLine(index: number, values: Partial<EstimateInputLine>) {
    setLines(current => current.map((line, i) => i === index ? { ...line, ...values } : line))
  }

  function addLine(category: 'fee' | 'expense') {
    setLines(current => [
      ...current,
      { description: category === 'fee' ? '報酬項目' : '実費項目', category, quantity: 1, unit_price: 0, tax_rate: category === 'fee' ? 10 : 0 },
    ])
  }

  function removeLine(index: number) {
    setLines(current => current.length <= 1 ? current : current.filter((_, i) => i !== index))
  }

  function create(formData: FormData) {
    const caseId = formData.get('case_id') as string
    formData.set('line_items', JSON.stringify(lines))
    formData.set('tax_inclusion', taxInclusion)
    startTransition(async () => {
      const result = await createCaseEstimate(caseId, formData)
      if (!result.success) toast({ title: '見積を保存できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }
  function accept(id: string) {
    startTransition(async () => {
      const result = await markEstimateAccepted(id)
      if (!result.success) toast({ title: '見積を承認済みにできませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }
  function toggleBankAccount(account: BankAccount, checked: boolean) {
    setSelectedBankIds(current => checked
      ? Array.from(new Set([...current, account.id]))
      : current.filter(id => id !== account.id)
    )
  }

  function invoice(id: string) {
    const formData = new FormData()
    formData.set('bank_account_ids', JSON.stringify(selectedBankIds))
    formData.set('payment_due_date', paymentDueDate)
    startTransition(async () => {
      const result = await issueInvoiceFromEstimate(id, formData)
      if (!result.success) {
        toast({ title: '請求書を作成できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '請求書を作成しました' })
      router.push(`/settings/account/billing/${result.data.document_id}/print`)
    })
  }
  const latestEstimate = estimates[0]
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">見積・請求</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              見積を保存し、PDF確認、受注処理、請求書発行まで進めます。
            </p>
          </div>
          {latestEstimate && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/cases/${latestEstimate.case_id}/estimates/${latestEstimate.id}/print`}>最新見積PDF</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={create} className="rounded-md border bg-slate-50 p-4">
          <input type="hidden" name="case_id" value={caseId} />
          <input type="hidden" name="line_items" value={JSON.stringify(lines)} />
          <input type="hidden" name="tax_inclusion" value={taxInclusion} />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">見積名</span>
              <Input name="title" className="bg-white" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">宛名</span>
              <Input name="recipient_name" className="bg-white" defaultValue={customerName ?? ''} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">発行日</span>
              <Input name="issued_at" className="bg-white" type="date" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">支払期限</span>
              <Input name="due_date" className="bg-white" type="date" />
            </label>
          </div>

          <div className="mt-4 rounded-md border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
              <div>
                <p className="text-sm font-semibold">見積明細</p>
                <p className="text-xs text-muted-foreground">報酬・実費を行ごとに追加できます。税額は自動計算します。</p>
              </div>
              <Select value={taxInclusion} onValueChange={value => setTaxInclusion(value as 'exclusive' | 'inclusive')}>
                <SelectTrigger className="h-9 w-32 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclusive">外税</SelectItem>
                  <SelectItem value="inclusive">内税</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 p-3">
              {lines.map((line, index) => (
                <div key={index} className="grid gap-2 rounded-md border bg-slate-50 p-2 md:grid-cols-[1.2fr_6rem_5rem_8rem_6rem_6rem_auto]">
                  <Input
                    className="bg-white"
                    value={line.description}
                    onChange={event => updateLine(index, { description: event.target.value })}
                    placeholder="内容"
                  />
                  <Select value={line.category} onValueChange={value => updateLine(index, { category: value as 'fee' | 'expense' })}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fee">報酬</SelectItem>
                      <SelectItem value="expense">実費</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="bg-white text-right"
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={event => updateLine(index, { quantity: Number(event.target.value) || 1 })}
                    aria-label="数量"
                  />
                  <Input
                    className="bg-white text-right"
                    type="number"
                    min={0}
                    value={line.unit_price}
                    onChange={event => updateLine(index, { unit_price: Number(event.target.value) || 0 })}
                    aria-label="単価"
                  />
                  <Select value={String(line.tax_rate)} onValueChange={value => updateLine(index, { tax_rate: Number(value) })}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="8">8%</SelectItem>
                      <SelectItem value="0">非課税</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center justify-end text-sm font-medium">
                    {formatYen(calculated.items[index]?.total_amount ?? 0)}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(index)}>削除</Button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addLine('fee')}>報酬を追加</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addLine('expense')}>実費を追加</Button>
              </div>
            </div>
            <div className="grid gap-2 border-t bg-slate-50 p-3 text-sm md:grid-cols-4">
              <div><span className="text-muted-foreground">報酬</span><p className="font-semibold">{formatYen(calculated.fee)}</p></div>
              <div><span className="text-muted-foreground">実費</span><p className="font-semibold">{formatYen(calculated.expense)}</p></div>
              <div><span className="text-muted-foreground">消費税</span><p className="font-semibold">{formatYen(calculated.tax)}</p></div>
              <div><span className="text-muted-foreground">税込合計</span><p className="text-lg font-bold">{formatYen(calculated.total)}</p></div>
            </div>
          </div>

          <label className="mt-4 block space-y-1 text-sm">
            <span className="font-medium">条件・メモ</span>
            <Textarea name="memo" className="min-h-24 bg-white" />
          </label>

          <div className="mt-4 flex justify-end">
            <Button disabled={isPending}>見積を保存</Button>
          </div>
        </form>

        {estimates.length === 0 && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            見積はまだありません。
          </div>
        )}

        {estimates.length > 0 && (
          <div className="rounded-md border bg-white p-3 text-sm">
            <p className="font-medium">請求書発行設定</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">振込期日</span>
                <Input type="date" className="bg-white" value={paymentDueDate} onChange={event => setPaymentDueDate(event.target.value)} />
              </label>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">表示する振込口座</span>
                <div className="space-y-1 rounded-md border bg-slate-50 p-2">
                  {(billingProfile?.bank_accounts ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">設定の会社情報で振込口座を登録してください。</p>
                  ) : (billingProfile?.bank_accounts ?? []).map(account => (
                    <label key={account.id} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedBankIds.includes(account.id)}
                        onChange={event => toggleBankAccount(account, event.target.checked)}
                      />
                      <span>{account.label || account.bank_name} / {account.bank_name} {account.branch_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {estimates.slice(0, 5).map(item => {
          const total = item.fee_amount + item.expense_amount + item.tax_amount
          return (
            <div key={item.id} className="rounded-md border bg-white p-4 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {estimateStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">{formatYen(total)}</p>
                  <p className="text-xs text-muted-foreground">
                    報酬 {formatYen(item.fee_amount)} / 実費 {formatYen(item.expense_amount)} / 税 {formatYen(item.tax_amount)}
                    {item.tax_inclusion === 'inclusive' ? ' / 内税' : ' / 外税'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/cases/${item.case_id}/estimates/${item.id}/print`}>見積書PDF</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => accept(item.id)} disabled={isPending}>
                    受注済みにする
                  </Button>
                  <Button size="sm" onClick={() => invoice(item.id)} disabled={isPending}>
                    請求書を作成して開く
                  </Button>
                </div>
              </div>
              {item.memo && (
                <div className="mt-3 rounded-md bg-slate-50 p-3 text-xs text-muted-foreground">
                  <p className="whitespace-pre-wrap">{item.memo}</p>
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function estimateStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: '下書き',
    accepted: '受注済み',
    invoiced: '請求書作成済み',
  }
  return labels[status] ?? status
}

function calculateEstimateLines(lines: EstimateInputLine[], taxInclusion: 'exclusive' | 'inclusive') {
  const items: EstimateLineItem[] = lines.map(line => {
    const quantity = Math.max(1, Number(line.quantity) || 1)
    const unitPrice = Math.max(0, Math.round(Number(line.unit_price) || 0))
    const taxRate = line.tax_rate === 8 ? 8 : line.tax_rate === 0 ? 0 : 10
    const inputAmount = Math.round(quantity * unitPrice)
    const netAmount = taxInclusion === 'inclusive'
      ? Math.round(inputAmount / (1 + taxRate / 100))
      : inputAmount
    const taxAmount = taxInclusion === 'inclusive'
      ? inputAmount - netAmount
      : Math.round(netAmount * taxRate / 100)
    const totalAmount = netAmount + taxAmount

    return {
      description: line.description.trim() || (line.category === 'fee' ? '報酬' : '実費'),
      category: line.category,
      quantity,
      unit: line.unit?.trim() || '式',
      unit_price: unitPrice,
      tax_rate: taxRate,
      net_amount: netAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
    }
  })
  const taxSummary = summarizeEstimateTax(items)
  const fee = items.filter(item => item.category === 'fee').reduce((sum, item) => sum + item.net_amount, 0)
  const expense = items.filter(item => item.category === 'expense').reduce((sum, item) => sum + item.net_amount, 0)
  const tax = items.reduce((sum, item) => sum + item.tax_amount, 0)
  const total = items.reduce((sum, item) => sum + item.total_amount, 0)
  return { items, taxSummary, fee, expense, tax, total }
}

function summarizeEstimateTax(items: EstimateLineItem[]): TaxSummaryLine[] {
  const map = new Map<number, TaxSummaryLine>()
  for (const item of items) {
    const current = map.get(item.tax_rate) ?? { tax_rate: item.tax_rate, net_amount: 0, tax_amount: 0, total_amount: 0 }
    current.net_amount += item.net_amount
    current.tax_amount += item.tax_amount
    current.total_amount += item.total_amount
    map.set(item.tax_rate, current)
  }
  return Array.from(map.values()).sort((a, b) => b.tax_rate - a.tax_rate)
}
