import { notFound } from 'next/navigation'
import { PrintActions } from '@/components/print/print-actions'
import { getCaseEstimates } from '@/lib/actions/practical-extensions'
import { getCase } from '@/lib/actions/cases'
import { getBillingProfile, getSealImageUrl } from '@/lib/actions/billing'
import { formatYen } from '@/lib/billing/plans'
import type { CaseEstimate, EstimateLineItem, TaxSummaryLine } from '@/types/database'
import legalOrbitLogo from '../../../../../../../icon/新しいフォルダー/ChatGPT Image 2026年5月25日 20_30_35.png'

interface Props {
  params: Promise<{ id: string; estimateId: string }>
}

export default async function EstimatePrintPage(props: Props) {
  const params = await props.params
  const [caseData, estimates, profile] = await Promise.all([
    getCase(params.id),
    getCaseEstimates(params.id),
    getBillingProfile(),
  ])
  const estimate = estimates.find(item => item.id === params.estimateId)
  if (!caseData || !estimate) notFound()

  const sealUrl = await getSealImageUrl(profile?.seal_image_path)
  const lineItems = getEstimateLineItems(estimate)
  const taxSummary = getTaxSummary(estimate, lineItems)
  const subtotal = lineItems.reduce((sum, item) => sum + item.net_amount, 0)
  const taxTotal = lineItems.reduce((sum, item) => sum + item.tax_amount, 0)
  const total = lineItems.reduce((sum, item) => sum + item.total_amount, 0)
  const issuedAt = estimate.issued_at ? new Date(estimate.issued_at) : new Date()
  const issueDate = issuedAt.toLocaleDateString('ja-JP')
  const dueDate = estimate.due_date ? new Date(estimate.due_date).toLocaleDateString('ja-JP') : null

  return (
    <main className="print-page mx-auto max-w-[900px] bg-neutral-100 p-6 text-slate-950 print:bg-white print:p-0">
      <style>
        {`
          @page { size: A4; margin: 0; }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
            }
            body * {
              visibility: hidden !important;
            }
            .print-page,
            .print-page * {
              visibility: visible !important;
            }
            .print-page {
              position: static !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              width: 210mm !important;
              max-width: 210mm !important;
            }
            .print-sheet {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              overflow: hidden !important;
              box-shadow: none !important;
              border: 0 !important;
              padding: 12mm !important;
            }
            .print-sheet header {
              padding-bottom: 4mm !important;
            }
            .print-sheet table {
              font-size: 10.5px !important;
            }
            .print-sheet th,
            .print-sheet td {
              padding-top: 2mm !important;
              padding-bottom: 2mm !important;
            }
          }
        `}
      </style>
      <PrintActions fileName={`見積書-${estimate.title}`} />
      <section className="print-sheet relative min-h-[1120px] overflow-hidden bg-white px-12 py-10 shadow-sm ring-1 ring-slate-200 print:shadow-none print:ring-0">
        <header className="border-b-2 border-[#070d1a] pb-5">
          <h1 className="text-center text-4xl font-bold tracking-[0.35em] text-[#070d1a]">見積書</h1>
          <div className="mt-5 grid grid-cols-[1fr_auto] items-start gap-8 text-sm leading-7">
            <div className="space-y-1">
              <p><span className="inline-block w-20 text-slate-500">発行日</span>{issueDate}</p>
              {dueDate && <p><span className="inline-block w-20 text-slate-500">有効期限</span>{dueDate}</p>}
              <p><span className="inline-block w-20 text-slate-500">案件名</span>{caseData.name}</p>
            </div>
            <div className="relative min-w-72 text-right leading-7">
              <p className="text-base font-bold">{profile?.billing_name ?? 'Legal Orbit 行政書士'}</p>
              {sealUrl && (
                <img
                  src={sealUrl}
                  alt="角印"
                  className="absolute -right-2 top-1 h-[72px] w-[72px] object-contain opacity-90"
                />
              )}
              {profile?.tax_id && <p>登録番号：{profile.tax_id}</p>}
              {profile?.postal_code && <p>〒{profile.postal_code}</p>}
              {profile?.address && <p className="max-w-80">{profile.address}</p>}
              {profile?.phone && <p>TEL：{profile.phone}</p>}
              {profile?.billing_email && <p>{profile.billing_email}</p>}
            </div>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-[1fr_290px] items-end gap-10">
          <div>
            <p className="inline-block border-b border-[#070d1a] pb-1 text-xl font-bold">
              {estimate.recipient_name || caseData.customers?.company_name || 'お客様'} 御中
            </p>
            <p className="mt-6 text-sm leading-7">下記のとおり、お見積り申し上げます。</p>
          </div>
          <div className="border-y-2 border-[#070d1a] py-4 text-right">
            <p className="text-sm font-semibold text-slate-500">お見積金額（税込）</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">{formatYen(total)}</p>
          </div>
        </div>

        <table className="mt-10 w-full table-fixed border-collapse text-[12px]">
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[7%]" />
            <col className="w-[6%]" />
            <col className="w-[6%]" />
            <col className="w-[13%]" />
            <col className="w-[8%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#070d1a] text-white">
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-left">名目</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-center">区分</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-right">数量</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-center">単位</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-right">単価</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-right">税率</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-right">税抜金額</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-right">消費税</th>
              <th className="whitespace-nowrap border border-[#070d1a] px-2 py-3 text-right">税込金額</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={`${item.description}-${index}`} className="align-top">
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 leading-6">{item.description}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-center">{item.category === 'fee' ? '報酬' : '実費'}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums">{item.quantity}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-center">{item.unit ?? '式'}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums">{formatYen(item.unit_price)}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right">{item.tax_rate === 0 ? '非課税' : `${item.tax_rate}%`}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums">{formatYen(item.net_amount)}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums">{formatYen(item.tax_amount)}</td>
                <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums font-semibold">{formatYen(item.total_amount)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-bold">
              <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right" colSpan={6}>合計</td>
              <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums">{formatYen(subtotal)}</td>
              <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums">{formatYen(taxTotal)}</td>
              <td className="whitespace-nowrap border border-slate-300 px-2 py-3 text-right tabular-nums">{formatYen(total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-7 grid grid-cols-[1fr_280px] items-start gap-8">
          <div>
            <table className="w-full max-w-xl border-collapse text-[12px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="whitespace-nowrap border border-slate-300 px-3 py-2 text-left">税率区分</th>
                  <th className="whitespace-nowrap border border-slate-300 px-3 py-2 text-right">対象額（税抜）</th>
                  <th className="whitespace-nowrap border border-slate-300 px-3 py-2 text-right">消費税額</th>
                  <th className="whitespace-nowrap border border-slate-300 px-3 py-2 text-right">対象額（税込）</th>
                </tr>
              </thead>
              <tbody>
                {taxSummary.map(row => (
                  <tr key={row.tax_rate}>
                    <td className="whitespace-nowrap border border-slate-300 px-3 py-2">{row.tax_rate === 0 ? '非課税' : `${row.tax_rate}%対象`}</td>
                    <td className="whitespace-nowrap border border-slate-300 px-3 py-2 text-right tabular-nums">{formatYen(row.net_amount)}</td>
                    <td className="whitespace-nowrap border border-slate-300 px-3 py-2 text-right tabular-nums">{formatYen(row.tax_amount)}</td>
                    <td className="whitespace-nowrap border border-slate-300 px-3 py-2 text-right tabular-nums">{formatYen(row.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">税計算：{estimate.tax_inclusion === 'inclusive' ? '内税' : '外税'}</p>
          </div>
        </div>

        {estimate.memo && (
          <div className="mt-7 whitespace-pre-wrap border border-slate-300 p-4 text-sm leading-7">
            <p className="mb-2 font-bold">備考</p>
            {estimate.memo}
          </div>
        )}

        <img
          src={legalOrbitLogo.src}
          alt="Legal Orbit"
          className="absolute bottom-8 right-10 h-auto w-[155px] opacity-90 print:bottom-[12mm] print:right-[12mm]"
        />
      </section>
    </main>
  )
}

function getEstimateLineItems(estimate: CaseEstimate): EstimateLineItem[] {
  if (Array.isArray(estimate.line_items) && estimate.line_items.length > 0) return estimate.line_items
  const items: EstimateLineItem[] = []
  if (estimate.fee_amount > 0) items.push(createFallbackItem('報酬', 'fee', estimate.fee_amount, estimate.tax_amount, 10))
  if (estimate.expense_amount > 0) items.push(createFallbackItem('実費', 'expense', estimate.expense_amount, 0, 0))
  return items.length > 0 ? items : [createFallbackItem(estimate.title, 'fee', 0, 0, 10)]
}

function createFallbackItem(description: string, category: 'fee' | 'expense', netAmount: number, taxAmount: number, taxRate: number): EstimateLineItem {
  return {
    description,
    category,
    quantity: 1,
    unit: '式',
    unit_price: netAmount,
    tax_rate: taxRate,
    net_amount: netAmount,
    tax_amount: taxAmount,
    total_amount: netAmount + taxAmount,
  }
}

function getTaxSummary(estimate: CaseEstimate, items: EstimateLineItem[]): TaxSummaryLine[] {
  if (Array.isArray(estimate.tax_summary) && estimate.tax_summary.length > 0) return estimate.tax_summary
  const map = new Map<number, TaxSummaryLine>()
  for (const item of items) {
    const row = map.get(item.tax_rate) ?? { tax_rate: item.tax_rate, net_amount: 0, tax_amount: 0, total_amount: 0 }
    row.net_amount += item.net_amount
    row.tax_amount += item.tax_amount
    row.total_amount += item.total_amount
    map.set(item.tax_rate, row)
  }
  return Array.from(map.values()).sort((a, b) => b.tax_rate - a.tax_rate)
}
