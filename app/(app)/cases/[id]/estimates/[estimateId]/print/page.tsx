import { notFound } from 'next/navigation'
import { getCaseEstimates } from '@/lib/actions/practical-extensions'
import { getCase } from '@/lib/actions/cases'
import { getBillingProfile, getSealImageUrl } from '@/lib/actions/billing'
import { formatYen } from '@/lib/billing/plans'
import type { CaseEstimate, EstimateLineItem, TaxSummaryLine } from '@/types/database'

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

  return (
    <main className="mx-auto max-w-4xl bg-white p-10 text-gray-950 print:p-0">
      <p className="mb-6 text-right text-sm text-gray-600 print:hidden">ブラウザの印刷機能でPDF保存できます。</p>
      <section className="border border-gray-300 p-10">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-widest">見積書</h1>
            <p className="mt-2 text-sm">発行日: {issuedAt.toLocaleDateString('ja-JP')}</p>
            {estimate.due_date && <p className="text-sm">支払期限: {new Date(estimate.due_date).toLocaleDateString('ja-JP')}</p>}
          </div>
          <div className="relative min-w-64 text-right text-sm leading-6">
            <p className="font-semibold">{profile?.billing_name ?? 'Legal Orbit 行政書士'}</p>
            {sealUrl && (
              <img
                src={sealUrl}
                alt="角印"
                className="absolute -right-2 top-0 h-[72px] w-[72px] object-contain opacity-90"
              />
            )}
            {profile?.tax_id && <p>登録番号: {profile.tax_id}</p>}
            {profile?.postal_code && <p>〒{profile.postal_code}</p>}
            {profile?.address && <p>{profile.address}</p>}
            {profile?.phone && <p>TEL: {profile.phone}</p>}
            {profile?.billing_email && <p>{profile.billing_email}</p>}
          </div>
        </div>

        <div className="mt-10">
          <p className="text-lg font-semibold underline underline-offset-4">
            {estimate.recipient_name || caseData.customers?.company_name || 'お客様'} 御中
          </p>
          <p className="mt-6 text-sm">下記の通りお見積り申し上げます。</p>
        </div>

        <div className="mt-8 rounded-md border border-gray-300 bg-gray-50 p-5">
          <p className="text-sm text-gray-600">税込見積金額</p>
          <p className="mt-1 text-3xl font-bold">{formatYen(total)}</p>
          {estimate.due_date && <p className="mt-2 text-sm text-gray-700">支払期限: {new Date(estimate.due_date).toLocaleDateString('ja-JP')}</p>}
        </div>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">名目</th>
              <th className="border px-3 py-2 text-center">区分</th>
              <th className="border px-3 py-2 text-right">数量</th>
              <th className="border px-3 py-2 text-center">単位</th>
              <th className="border px-3 py-2 text-right">単価</th>
              <th className="border px-3 py-2 text-right">税率</th>
              <th className="border px-3 py-2 text-right">税抜金額</th>
              <th className="border px-3 py-2 text-right">消費税</th>
              <th className="border px-3 py-2 text-right">税込金額</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td className="border px-3 py-2">{item.description}</td>
                <td className="border px-3 py-2 text-center">{item.category === 'fee' ? '報酬' : '実費'}</td>
                <td className="border px-3 py-2 text-right">{item.quantity}</td>
                <td className="border px-3 py-2 text-center">{item.unit ?? '式'}</td>
                <td className="border px-3 py-2 text-right">{formatYen(item.unit_price)}</td>
                <td className="border px-3 py-2 text-right">{item.tax_rate === 0 ? '非課税' : `${item.tax_rate}%`}</td>
                <td className="border px-3 py-2 text-right">{formatYen(item.net_amount)}</td>
                <td className="border px-3 py-2 text-right">{formatYen(item.tax_amount)}</td>
                <td className="border px-3 py-2 text-right">{formatYen(item.total_amount)}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="border px-3 py-2" colSpan={6}>合計</td>
              <td className="border px-3 py-2 text-right">{formatYen(subtotal)}</td>
              <td className="border px-3 py-2 text-right">{formatYen(taxTotal)}</td>
              <td className="border px-3 py-2 text-right">{formatYen(total)}</td>
            </tr>
          </tbody>
        </table>

        <table className="mt-6 w-full max-w-lg border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">税率区分</th>
              <th className="border px-3 py-2 text-right">対象額 税抜</th>
              <th className="border px-3 py-2 text-right">消費税額</th>
              <th className="border px-3 py-2 text-right">税込対象額</th>
            </tr>
          </thead>
          <tbody>
            {taxSummary.map(row => (
              <tr key={row.tax_rate}>
                <td className="border px-3 py-2">{row.tax_rate === 0 ? '非課税' : `${row.tax_rate}%対象`}</td>
                <td className="border px-3 py-2 text-right">{formatYen(row.net_amount)}</td>
                <td className="border px-3 py-2 text-right">{formatYen(row.tax_amount)}</td>
                <td className="border px-3 py-2 text-right">{formatYen(row.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-gray-500">税計算: {estimate.tax_inclusion === 'inclusive' ? '内税' : '外税'}</p>

        {estimate.memo && <div className="mt-8 whitespace-pre-wrap rounded-md border p-4 text-sm">{estimate.memo}</div>}
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
