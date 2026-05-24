import Link from 'next/link'
import { getCases } from '@/lib/actions/cases'
import { getCustomers } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CaseFilters } from '@/components/cases/case-filters'
import { Plus, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { CaseStatus } from '@/types/database'

function statusVariant(status: CaseStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case '完了': return 'secondary'
    case '申請済': return 'default'
    case '補正対応中': return 'destructive'
    case '保留': return 'outline'
    default: return 'outline'
  }
}

function SortableHeader({
  label,
  field,
  currentSort,
  currentDir,
  searchParams,
}: {
  label: string
  field: string
  currentSort?: string
  currentDir?: string
  searchParams: Record<string, string | undefined>
}) {
  const isActive = currentSort === field
  const nextDir = isActive && currentDir === 'asc' ? 'desc' : 'asc'
  const params = new URLSearchParams()
  if (searchParams.q) params.set('q', searchParams.q)
  if (searchParams.status) params.set('status', searchParams.status)
  if (searchParams.customer_id) params.set('customer_id', searchParams.customer_id)
  if (searchParams.assignee) params.set('assignee', searchParams.assignee)
  if (searchParams.business_type) params.set('business_type', searchParams.business_type)
  if (searchParams.due_from) params.set('due_from', searchParams.due_from)
  if (searchParams.due_to) params.set('due_to', searchParams.due_to)
  if (searchParams.missing_docs) params.set('missing_docs', searchParams.missing_docs)
  if (searchParams.draft_missing) params.set('draft_missing', searchParams.draft_missing)
  params.set('sort', field)
  params.set('dir', nextDir)

  return (
    <Link href={`/cases?${params.toString()}`} className="flex items-center gap-1 hover:text-foreground">
      {label}
      {isActive ? (
        currentDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
      )}
    </Link>
  )
}

interface Props {
  searchParams: Promise<{
    q?: string
    status?: string
    customer_id?: string
    assignee?: string
    business_type?: string
    due_from?: string
    due_to?: string
    missing_docs?: string
    draft_missing?: string
    sort?: string
    dir?: string
  }>
}

export default async function CasesPage(props: Props) {
  const searchParams = await props.searchParams;
  const sortDir = searchParams.dir === 'asc' || searchParams.dir === 'desc' ? searchParams.dir : undefined

  const [cases, customers] = await Promise.all([
    getCases({
    q: searchParams.q,
    status: searchParams.status,
    customerId: searchParams.customer_id,
    assignee: searchParams.assignee,
    businessType: searchParams.business_type,
    dueFrom: searchParams.due_from,
    dueTo: searchParams.due_to,
    missingDocs: searchParams.missing_docs === '1',
    draftMissing: searchParams.draft_missing === '1',
    sortField: searchParams.sort,
    sortDir,
    }),
    getCustomers(),
  ])

  const isFiltered = searchParams.q || searchParams.status || searchParams.customer_id || searchParams.assignee || searchParams.business_type || searchParams.due_from || searchParams.due_to || searchParams.missing_docs || searchParams.draft_missing

  const spRecord: Record<string, string | undefined> = {
    q: searchParams.q,
    status: searchParams.status,
    customer_id: searchParams.customer_id,
    assignee: searchParams.assignee,
    business_type: searchParams.business_type,
    due_from: searchParams.due_from,
    due_to: searchParams.due_to,
    missing_docs: searchParams.missing_docs,
    draft_missing: searchParams.draft_missing,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">案件管理</h1>
        <Button asChild>
          <Link href="/cases/new">
            <Plus className="mr-2 h-4 w-4" />新規登録
          </Link>
        </Button>
      </div>

      <CaseFilters
        initialQ={searchParams.q ?? ''}
        initialStatus={searchParams.status ?? ''}
        initialCustomerId={searchParams.customer_id ?? ''}
        initialAssignee={searchParams.assignee ?? ''}
        initialBusinessType={searchParams.business_type ?? ''}
        initialDueFrom={searchParams.due_from ?? ''}
        initialDueTo={searchParams.due_to ?? ''}
        initialMissingDocs={searchParams.missing_docs === '1'}
        initialDraftMissing={searchParams.draft_missing === '1'}
        initialSort={searchParams.sort ?? ''}
        initialDir={searchParams.dir ?? ''}
        customers={customers}
      />

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader
                  label="案件名"
                  field="name"
                  currentSort={searchParams.sort}
                  currentDir={searchParams.dir}
                  searchParams={spRecord}
                />
              </TableHead>
              <TableHead>顧客</TableHead>
              <TableHead>業務種別</TableHead>
              <TableHead>
                <SortableHeader
                  label="ステータス"
                  field="status"
                  currentSort={searchParams.sort}
                  currentDir={searchParams.dir}
                  searchParams={spRecord}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="申請予定日"
                  field="planned_submission_date"
                  currentSort={searchParams.sort}
                  currentDir={searchParams.dir}
                  searchParams={spRecord}
                />
              </TableHead>
              <TableHead>担当者</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {isFiltered ? '検索条件に一致する案件がありません' : '案件が登録されていません'}
                </TableCell>
              </TableRow>
            ) : (
              cases.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link href={`/cases/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell>{c.customers?.company_name ?? '—'}</TableCell>
                  <TableCell>{c.business_type ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                  </TableCell>
                  <TableCell>{c.planned_submission_date ?? '—'}</TableCell>
                  <TableCell>{c.assignee ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/cases/${c.id}`}>詳細</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        <Link href={`/cases/${c.id}?tab=documents`}>書類</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {cases.length > 0 && (
        <p className="text-sm text-muted-foreground text-right">{cases.length}件</p>
      )}
    </div>
  )
}
