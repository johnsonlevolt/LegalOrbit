import { notFound } from 'next/navigation'
import { getBillingDocument, getBillingProfile } from '@/lib/actions/billing'

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
  const total = document.amount + document.tax_amount

  return (
    <main className="mx-auto max-w-3xl bg-white p-10 text-gray-950 print:p-0">
      <p className="mb-6 text-right text-sm text-gray-600 print:hidden">ブラウザの印刷機能でPDF保存できます。</p>
      <section className="border border-gray-300 p-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-widest">{typeLabel}</h1>
            <p className="mt-2 text-sm">発行日: {new Date(document.issue_date).toLocaleDateString('ja-JP')}</p>
            <p className="text-sm">番号: {document.document_number}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">Legal Orbit 行政書士</p>
            {profile?.tax_id && <p>登録番号: {profile.tax_id}</p>}
            {profile?.billing_email && <p>{profile.billing_email}</p>}
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
          <p className="mt-1 text-3xl font-bold">{total.toLocaleString('ja-JP')}円</p>
        </div>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">内容</th>
              <th className="border px-3 py-2 text-right">税抜</th>
              <th className="border px-3 py-2 text-right">消費税</th>
              <th className="border px-3 py-2 text-right">税込</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-3 py-2">{document.title}</td>
              <td className="border px-3 py-2 text-right">{document.amount.toLocaleString('ja-JP')}円</td>
              <td className="border px-3 py-2 text-right">{document.tax_amount.toLocaleString('ja-JP')}円</td>
              <td className="border px-3 py-2 text-right">{total.toLocaleString('ja-JP')}円</td>
            </tr>
          </tbody>
        </table>

        {document.memo && (
          <div className="mt-8 whitespace-pre-wrap rounded-md border p-4 text-sm">
            {document.memo}
          </div>
        )}
      </section>
    </main>
  )
}
