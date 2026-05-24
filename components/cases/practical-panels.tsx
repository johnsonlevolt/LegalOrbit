'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { CaseCommunication, CaseEstimate, CaseFile, CaseReview, DocumentCheck, UploadLink } from '@/types/database'
import {
  classifyCaseFile,
  createCaseCommunication,
  createCaseEstimate,
  createCaseReview,
  createUploadLink,
  issueInvoiceFromEstimate,
  markEstimateAccepted,
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
  files,
  documentChecks,
  uploadLinks,
  reviews,
  communications,
  estimates,
}: {
  caseId: string
  customerId: string | null
  files: CaseFile[]
  documentChecks: DocumentCheck[]
  uploadLinks: UploadLink[]
  reviews: CaseReview[]
  communications: CaseCommunication[]
  estimates: CaseEstimate[]
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <EstimatePanel caseId={caseId} estimates={estimates} />
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

function EstimatePanel({ caseId, estimates }: { caseId: string; estimates: CaseEstimate[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  function create(formData: FormData) {
    const caseId = formData.get('case_id') as string
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
  function invoice(id: string) {
    startTransition(async () => {
      const result = await issueInvoiceFromEstimate(id)
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
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">見積名</span>
              <Input name="title" className="bg-white" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">宛名</span>
              <Input name="recipient_name" className="bg-white" />
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

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium">報酬額</span>
              <Input name="fee_amount" className="bg-white text-right" type="number" min={0} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">実費</span>
              <Input name="expense_amount" className="bg-white text-right" type="number" min={0} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">消費税</span>
              <Input name="tax_amount" className="bg-white text-right" type="number" min={0} />
            </label>
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
