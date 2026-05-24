import { notFound } from 'next/navigation'
import { getCaseEstimates } from '@/lib/actions/practical-extensions'
import { getCase } from '@/lib/actions/cases'
import { formatYen } from '@/lib/billing/plans'

interface Props {
  params: Promise<{ id: string; estimateId: string }>
}

export default async function EstimatePrintPage(props: Props) {
  const params = await props.params
  const [caseData, estimates] = await Promise.all([
    getCase(params.id),
    getCaseEstimates(params.id),
  ])
  const estimate = estimates.find(item => item.id === params.estimateId)
  if (!caseData || !estimate) notFound()

  const amount = estimate.fee_amount + estimate.expense_amount
  const total = amount + estimate.tax_amount

  return (
    <main className="mx-auto max-w-3xl bg-white p-10 text-gray-950 print:p-0">
      <p className="mb-6 text-right text-sm text-gray-600 print:hidden">ブラウザの印刷機能でPDF保存できます。</p>
      <section className="border border-gray-300 p-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-widest">見積書</h1>
            <p className="mt-2 text-sm">発行日: {estimate.issued_at ? new Date(estimate.issued_at).toLocaleDateString('ja-JP') : new Date().toLocaleDateString('ja-JP')}</p>
            {estimate.due_date && <p className="text-sm">有効期限: {new Date(estimate.due_date).toLocaleDateString('ja-JP')}</p>}
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Legal Orbit 行政書士</p>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-lg font-semibold underline underline-offset-4">{estimate.recipient_name || caseData.customers?.company_name || 'お客様'} 御中</p>
          <p className="mt-6 text-sm">下記の通りお見積り申し上げます。</p>
        </div>

        <div className="mt-8 rounded-md border border-gray-300 bg-gray-50 p-5">
          <p className="text-sm text-gray-600">税込見積金額</p>
          <p className="mt-1 text-3xl font-bold">{formatYen(total)}</p>
        </div>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">内容</th>
              <th className="border px-3 py-2 text-right">金額</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-3 py-2">報酬</td>
              <td className="border px-3 py-2 text-right">{formatYen(estimate.fee_amount)}</td>
            </tr>
            <tr>
              <td className="border px-3 py-2">実費</td>
              <td className="border px-3 py-2 text-right">{formatYen(estimate.expense_amount)}</td>
            </tr>
            <tr>
              <td className="border px-3 py-2">消費税</td>
              <td className="border px-3 py-2 text-right">{formatYen(estimate.tax_amount)}</td>
            </tr>
            <tr>
              <td className="border px-3 py-2 font-semibold">合計</td>
              <td className="border px-3 py-2 text-right font-semibold">{formatYen(total)}</td>
            </tr>
          </tbody>
        </table>

        {estimate.memo && (
          <div className="mt-8 whitespace-pre-wrap rounded-md border p-4 text-sm">
            {estimate.memo}
          </div>
        )}
      </section>
    </main>
  )
}
