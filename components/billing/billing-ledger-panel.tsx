'use client'

import { useMemo, useState, useTransition } from 'react'
import { ExternalLink } from 'lucide-react'
import { markBillingDocumentPaid } from '@/lib/actions/billing'
import { formatYen } from '@/lib/billing/plans'
import type { BillingDocument, CaseEstimate } from '@/types/database'
import { toast } from '@/hooks/use-toast'

type LedgerItem = {
  id: string
  type: 'estimate' | 'invoice'
  issueDate: string
  recipientName: string
  title: string
  amount: number
  status: string
  href: string
  external: boolean
  document?: BillingDocument
}

export function BillingLedgerPanel({
  documents,
  estimates,
}: {
  documents: BillingDocument[]
  estimates: CaseEstimate[]
}) {
  const [isPending, startTransition] = useTransition()
  const [showEstimates, setShowEstimates] = useState(true)
  const [showInvoices, setShowInvoices] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState('all')

  const ledgerItems = useMemo<LedgerItem[]>(() => {
    const estimateItems: LedgerItem[] = estimates.map(estimate => ({
      id: estimate.id,
      type: 'estimate',
      issueDate: estimate.issued_at ?? estimate.created_at.slice(0, 10),
      recipientName: estimate.recipient_name || estimate.cases?.customers?.company_name || 'お客様',
      title: estimate.title,
      amount: estimate.fee_amount + estimate.expense_amount + estimate.tax_amount,
      status: estimate.status,
      href: `/cases/${estimate.case_id}/estimates/${estimate.id}/print`,
      external: false,
    }))

    const invoiceItems: LedgerItem[] = documents
      .filter(document => document.document_type === 'invoice')
      .map(document => ({
        id: document.id,
        type: 'invoice',
        issueDate: document.issue_date,
        recipientName: document.recipient_name,
        title: document.title,
        amount: document.amount + document.tax_amount,
        status: document.status,
        href: document.invoice_pdf_url || `/settings/account/billing/${document.id}/print`,
        external: Boolean(document.invoice_pdf_url),
        document,
      }))

    return [...estimateItems, ...invoiceItems].sort((a, b) => b.issueDate.localeCompare(a.issueDate))
  }, [documents, estimates])

  const months = useMemo(
    () => Array.from(new Set(ledgerItems.map(item => item.issueDate.slice(0, 7)))).sort().reverse(),
    [ledgerItems],
  )
  const companies = useMemo(
    () => Array.from(new Set(ledgerItems.map(item => item.recipientName).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ja')),
    [ledgerItems],
  )

  const visibleItems = ledgerItems.filter(item => {
    if (item.type === 'estimate' && !showEstimates) return false
    if (item.type === 'invoice' && !showInvoices) return false
    if (selectedMonth !== 'all' && item.issueDate.slice(0, 7) !== selectedMonth) return false
    if (selectedCompany !== 'all' && item.recipientName !== selectedCompany) return false
    return true
  })

  function togglePaid(document: BillingDocument) {
    startTransition(async () => {
      const result = await markBillingDocumentPaid(document.id, document.status !== 'paid')
      if (!result.success) {
        toast({ title: '着金状態を更新できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: document.status === 'paid' ? '未着金に戻しました' : '着金済みにしました' })
    })
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 rounded-md border bg-white p-3 md:grid-cols-[1fr_12rem_14rem]">
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showEstimates} onChange={event => setShowEstimates(event.target.checked)} />
            見積書
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showInvoices} onChange={event => setShowInvoices(event.target.checked)} />
            請求書
          </label>
        </div>
        <select value={selectedMonth} onChange={event => setSelectedMonth(event.target.value)} className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm">
          <option value="all">すべての月</option>
          {months.map(month => <option key={month} value={month}>{month}</option>)}
        </select>
        <select value={selectedCompany} onChange={event => setSelectedCompany(event.target.value)} className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm">
          <option value="all">すべての会社</option>
          {companies.map(company => <option key={company} value={company}>{company}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">発行日</th>
              <th className="px-3 py-2 text-left">種別</th>
              <th className="px-3 py-2 text-left">宛名</th>
              <th className="px-3 py-2 text-left">内容</th>
              <th className="px-3 py-2 text-right">税込</th>
              <th className="px-3 py-2 text-center">着金</th>
              <th className="px-3 py-2 text-right">PDF</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {visibleItems.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">該当する帳票はありません</td></tr>
            ) : visibleItems.map(item => (
              <tr key={`${item.type}-${item.id}`} className="border-t">
                <td className="px-3 py-2">{new Date(item.issueDate).toLocaleDateString('ja-JP')}</td>
                <td className="px-3 py-2">{item.type === 'invoice' ? '請求書' : '見積書'}</td>
                <td className="px-3 py-2">{item.recipientName}</td>
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2 text-right">{formatYen(item.amount)}</td>
                <td className="px-3 py-2 text-center">
                  {item.type === 'invoice' && item.document ? (
                    <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => item.document && togglePaid(item.document)} disabled={isPending}>
                      {item.status === 'paid' ? '着金済み' : '未着金'}
                    </button>
                  ) : '-'}
                </td>
                <td className="px-3 py-2 text-right">
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline">
                      PDF<ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <a href={item.href} className="text-xs font-medium underline">表示</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
