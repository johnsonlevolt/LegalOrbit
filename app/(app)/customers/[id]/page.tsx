import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomer, getCasesByCustomerId } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeleteCustomerButton } from '@/components/customers/delete-customer-button'

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('ja-JP')
}

export default async function CustomerDetailPage(props: Props) {
  const params = await props.params
  const customer = await getCustomer(params.id)
  if (!customer) notFound()

  const cases = await getCasesByCustomerId(customer.id)

  const fields = [
    { label: '法人名・屋号', value: customer.company_name },
    { label: '法人番号', value: customer.corporate_number },
    { label: '代表者名', value: customer.representative_name },
    { label: '郵便番号', value: customer.postal_code },
    { label: '所在地', value: customer.address },
    { label: '電話番号', value: customer.phone },
    { label: 'メール', value: customer.email },
    { label: '担当者名', value: customer.contact_person },
    { label: '登録日', value: formatDate(customer.created_at) },
    { label: '更新日', value: formatDate(customer.updated_at) },
    { label: 'メモ', value: customer.memo },
  ]

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{customer.company_name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/customers/${customer.id}/edit`}>編集</Link>
          </Button>
          <DeleteCustomerButton customerId={customer.id} />
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>顧客情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 md:grid-cols-3">
            {fields.map(({ label, value }) => (
              <div key={label} className={label === 'メモ' ? 'md:col-span-3' : ''}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>案件履歴</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cases.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              この顧客に紐づく案件はありません。
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>案件名</TableHead>
                  <TableHead>業務種別</TableHead>
                  <TableHead>申請区分</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>受任日</TableHead>
                  <TableHead>申請予定日</TableHead>
                  <TableHead>申請日</TableHead>
                  <TableHead>完了日</TableHead>
                  <TableHead>登録日</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/cases/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>{c.business_type ?? '—'}</TableCell>
                    <TableCell>{c.application_type ?? '—'}</TableCell>
                    <TableCell><Badge variant="outline">{c.status}</Badge></TableCell>
                    <TableCell>{formatDate(c.accepted_date)}</TableCell>
                    <TableCell>{formatDate(c.planned_submission_date)}</TableCell>
                    <TableCell>{formatDate(c.submission_date)}</TableCell>
                    <TableCell>{formatDate(c.completion_date)}</TableCell>
                    <TableCell>{formatDate(c.created_at)}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/cases/${c.id}`}>詳細</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="text-right">
        <Button asChild variant="outline">
          <Link href="/customers">一覧へ戻る</Link>
        </Button>
      </div>
    </div>
  )
}
