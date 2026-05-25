import { notFound } from 'next/navigation'
import { getBillingDocument, getBillingProfile, getSealImageUrl } from '@/lib/actions/billing'
import { formatYen } from '@/lib/billing/plans'
import type { BillingDocument, EstimateLineItem, TaxSummaryLine } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BillingDocumentPrintPage(props: Props) {
  const params = await props.params
  const [document, profile] = await Promise.all([
    getBillingDocument(params.id),
    getBillingProfile(),
  ])
  if (!document) notFound()

  const typeLabel = document.document_type === 'invoice' ? '請求書' : '領収書'
  const issuer = { ...profile, ...(document.issuer_snapshot ?? {}) }
  const sealUrl = await getSealImageUrl(issuer.seal_image_path)
  const lineItems = getBillingLineItems(document)
  const taxSummary = getTaxSummary(document, lineItems)
  const subtotal = lineItems.reduce((sum, item) => sum + item.net_amount, 0)
  const taxTotal = lineItems.reduce((sum, item) => sum + item.tax_amount, 0)
  const total = lineItems.reduce((sum, item) => sum + item.total_amount, 0)

  return (
    <main className="mx-auto max-w-4xl bg-white p-10 text-gray-950 print:p-0">
      <p className="mb-6 text-right text-sm text-gray-600 print:hidden">ブラウザの印刷機能でPDF保存できます。</p>
      <section className="border border-gray-300 p-10">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-widest">{typeLabel}</h1>
            <p className="mt-2 text-sm">発行日: {new Date(document.issue_date).toLocaleDateString('ja-JP')}</p>
            <p className="text-sm">番号: {document.document_number}</p>
          </div>
          <div className="relative min-w-64 text-right text-sm leading-6">
            <p className="font-semibold">{issuer.billing_name ?? 'Legal Orbit 行政書士'}</p>
            {sealUrl && (
              <img
                src={sealUrl}
                alt="角印"
                className="absolute -right-2 top-0 h-[72px] w-[72px] object-contain opacity-90"
              />
            )}
            {issuer.tax_id && <p>登録番号: {issuer.tax_id}</p>}
            {issuer.postal_code && <p>〒{issuer.postal_code}</p>}
            {issuer.address && <p>{issuer.address}</p>}
            {issuer.phone && <p>TEL: {issuer.phone}</p>}
            {issuer.billing_email && <p>{issuer.billing_email}</p>}
          </div>
        </div>

        <div className="mt-10">
          <p className="text-lg font-semibold underline underline-offset-4">{document.recipient_name} 御中</p>
          <p className="mt-6 text-sm">
            {document.document_type === 'invoice'
              ? '下記の通りご請求申し上げます。'
              : '下記の金額を領収いたしました。'}
          </p>
        </div>

        <div className="mt-8 rounded-md border border-gray-300 bg-gray-50 p-5">
          <p className="text-sm text-gray-600">税込金額</p>
          <p className="mt-1 text-3xl font-bold">{formatYen(total)}</p>
          {document.payment_due_date && (
            <p className="mt-2 text-sm text-gray-700">振込期日: {new Date(document.payment_due_date).toLocaleDateString('ja-JP')}</p>
          )}
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
        <p className="mt-2 text-xs text-gray-500">税計算: {document.tax_inclusion === 'inclusive' ? '内税' : '外税'}</p>

        {document.memo && <div className="mt-8 whitespace-pre-wrap rounded-md border p-4 text-sm">{document.memo}</div>}
        {document.document_type === 'invoice' && (document.bank_accounts ?? []).length > 0 && (
          <div className="mt-8 rounded-md border p-4 text-sm">
            <p className="font-semibold">振込先</p>
            <div className="mt-3 space-y-2">
              {(document.bank_accounts ?? []).map(account => (
                <div key={account.id}>
                  <p className="font-medium">{account.label || account.bank_name}</p>
                  <p>{account.bank_name} {account.branch_name} / {account.account_type} {account.account_number}</p>
                  <p>口座名義: {account.account_holder}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function getBillingLineItems(document: BillingDocument): EstimateLineItem[] {
  if (Array.isArray(document.line_items) && document.line_items.length > 0) return document.line_items
  return [{
    description: document.title,
    category: 'fee',
    quantity: 1,
    unit: '式',
    unit_price: document.amount,
    tax_rate: document.tax_amount > 0 ? 10 : 0,
    net_amount: document.amount,
    tax_amount: document.tax_amount,
    total_amount: document.amount + document.tax_amount,
  }]
}

function getTaxSummary(document: BillingDocument, items: EstimateLineItem[]): TaxSummaryLine[] {
  if (Array.isArray(document.tax_summary) && document.tax_summary.length > 0) return document.tax_summary
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
