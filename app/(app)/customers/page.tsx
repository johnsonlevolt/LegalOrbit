import Link from 'next/link'
import { getCustomers } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CustomerFilters } from '@/components/customers/customer-filters'
import { Plus } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function CustomersPage(props: Props) {
  const searchParams = await props.searchParams;
  const customers = await getCustomers({ q: searchParams.q })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客管理</h1>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Link>
        </Button>
      </div>
      <div className="rounded-md border bg-white">
        <CustomerFilters initialQ={searchParams.q ?? ''} />
      </div>
      <p className="text-sm text-muted-foreground">{customers.length}件</p>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>法人名・屋号</TableHead>
              <TableHead>法人番号</TableHead>
              <TableHead>代表者名</TableHead>
              <TableHead>電話番号</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  顧客が登録されていません
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.company_name}</TableCell>
                  <TableCell>{c.corporate_number ?? '—'}</TableCell>
                  <TableCell>{c.representative_name ?? '—'}</TableCell>
                  <TableCell>{c.phone ?? '—'}</TableCell>
                  <TableCell>{c.contact_person ?? '—'}</TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/customers/${c.id}`}>詳細</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
