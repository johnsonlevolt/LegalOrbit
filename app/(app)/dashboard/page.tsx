export const revalidate = 30

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { DeadlineNotifier } from '@/components/dashboard/deadline-notifier'

type CustomerJoin = { company_name: string } | { company_name: string }[] | null
type CaseRow = {
  id: string
  name: string
  status: string | null
  planned_submission_date: string | null
  customers: CustomerJoin
}
type CaseRelation = { id: string; name: string; customers: CustomerJoin } | { id: string; name: string; customers: CustomerJoin }[] | null
type MissingCase = { id: string; name: string; company_name: string | null }
type DraftNeed = MissingCase & { draft_title: string }

const statusColors: Record<string, string> = {
  '相談中': 'bg-gray-400',
  '受任済': 'bg-blue-400',
  '資料収集中': 'bg-yellow-400',
  '書類作成中': 'bg-orange-400',
  '確認待ち': 'bg-purple-400',
  '申請済': 'bg-green-400',
  '補正対応中': 'bg-red-400',
  '完了': 'bg-emerald-500',
  '保留': 'bg-gray-300',
}

function customerName(customers: CustomerJoin): string | null {
  if (Array.isArray(customers)) return customers[0]?.company_name ?? null
  return customers?.company_name ?? null
}

function firstCaseRelation(cases: CaseRelation): { id: string; name: string; customers: CustomerJoin } | null {
  if (Array.isArray(cases)) return cases[0] ?? null
  return cases
}

function statusVariant(status: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case '完了':
      return 'secondary'
    case '申請済':
      return 'default'
    case '補正対応中':
      return 'destructive'
    default:
      return 'outline'
  }
}

function daysUntil(dateStr: string, todayStr: string): number {
  const target = new Date(dateStr)
  const today = new Date(todayStr)
  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function daysLabel(days: number): string {
  if (days === 0) return '本日'
  if (days === 1) return '明日'
  return `${days}日後`
}

function casesHref(params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params)
  const query = searchParams.toString()
  return query ? `/cases?${query}` : '/cases'
}

function resultData<T>(result: PromiseSettledResult<{ data: T | null }>): T | null {
  return result.status === 'fulfilled' ? result.value.data : null
}

function resultCount(result: PromiseSettledResult<{ count: number | null }>): number {
  return result.status === 'fulfilled' ? result.value.count ?? 0 : 0
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const [totalResult, allCasesResult, upcomingResult, missingDocsResult, draftsResult] = await Promise.allSettled([
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('cases').select('status'),
    supabase
      .from('cases')
      .select('id, name, planned_submission_date, status, customers(company_name)')
      .gte('planned_submission_date', today)
      .lte('planned_submission_date', sevenDaysLater)
      .order('planned_submission_date'),
    supabase
      .from('document_checks')
      .select('case_id, cases(id, name, customers(company_name))')
      .eq('required', true)
      .eq('obtained', false),
    supabase
      .from('document_drafts')
      .select('case_id, title, cases(id, name, customers(company_name))')
      .eq('status', 'needs_input'),
  ])

  const total = resultCount(totalResult)
  const allCases = (resultData(allCasesResult) ?? []) as Array<{ status: string | null }>
  const upcomingCases = (resultData(upcomingResult) ?? []) as unknown as CaseRow[]
  const missingDocs = (resultData(missingDocsResult) ?? []) as unknown as Array<{
    cases: CaseRelation
  }>
  const draftNeedsInput = (resultData(draftsResult) ?? []) as unknown as Array<{
    title: string
    cases: CaseRelation
  }>

  const statusCounts = allCases.reduce<Record<string, number>>((acc, item) => {
    const status = item.status ?? '未設定'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})

  const missingCaseMap = new Map<string, MissingCase>()
  for (const item of missingDocs) {
    const c = firstCaseRelation(item.cases)
    if (c && !missingCaseMap.has(c.id)) {
      missingCaseMap.set(c.id, { id: c.id, name: c.name, company_name: customerName(c.customers) })
    }
  }
  const missingCases = Array.from(missingCaseMap.values())

  const draftNeedCases: DraftNeed[] = draftNeedsInput
    .map(item => {
      const c = firstCaseRelation(item.cases)
      if (!c) return null
      return {
        id: c.id,
        name: c.name,
        company_name: customerName(c.customers),
        draft_title: item.title,
      }
    })
    .filter((item): item is DraftNeed => Boolean(item))

  const upcomingWithDays = upcomingCases.map(item => ({
    ...item,
    daysUntil: item.planned_submission_date ? daysUntil(item.planned_submission_date, today) : 999,
  }))

  const notifyList = upcomingCases
    .filter(item => item.planned_submission_date)
    .map(item => ({
      id: item.id,
      name: item.name,
      planned_submission_date: item.planned_submission_date as string,
    }))

  const upcomingHref = casesHref({
    due_from: today,
    due_to: sevenDaysLater,
    sort: 'planned_submission_date',
    dir: 'asc',
  })
  const missingDocsHref = casesHref({ missing_docs: '1' })
  const completedHref = casesHref({ status: '完了' })
  const draftMissingHref = casesHref({ draft_missing: '1' })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <DeadlineNotifier upcomingCases={notifyList} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Link href="/cases" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">案件総数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{total}</p></CardContent>
        </Card>
        </Link>
        <Link href={upcomingHref} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">申請予定 7日以内</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-600">{upcomingCases.length}</p></CardContent>
        </Card>
        </Link>
        <Link href={missingDocsHref} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">資料不足案件</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{missingCases.length}</p></CardContent>
        </Card>
        </Link>
        <Link href={completedHref} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">完了済み</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{statusCounts['完了'] ?? 0}</p></CardContent>
        </Card>
        </Link>
        <Link href={draftMissingHref} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">AI追加質問</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-purple-600">{draftNeedCases.length}</p></CardContent>
        </Card>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>ステータス別件数</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(statusCounts).length === 0 ? (
            <p className="text-sm text-muted-foreground">案件がありません</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Link
                  key={status}
                  href={casesHref({ status })}
                  className="flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Badge variant={statusVariant(status)}>{status}</Badge>
                  <div className="h-2 flex-1 rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${statusColors[status] ?? 'bg-gray-400'}`}
                      style={{ width: `${Math.round((count / (total || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold">{count}件</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>申請予定日が近い案件</CardTitle>
          <Link href={upcomingHref} className="text-sm font-medium text-primary hover:underline">一覧を見る</Link>
        </CardHeader>
        <CardContent>
          {upcomingWithDays.length === 0 ? (
            <p className="text-sm text-muted-foreground">該当する案件はありません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>案件名</TableHead>
                  <TableHead>顧客</TableHead>
                  <TableHead>申請予定日</TableHead>
                  <TableHead>期限</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingWithDays.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link href={`/cases/${item.id}`} className="font-medium hover:underline">{item.name}</Link>
                    </TableCell>
                    <TableCell>{customerName(item.customers) ?? '-'}</TableCell>
                    <TableCell>{item.planned_submission_date}</TableCell>
                    <TableCell className={item.daysUntil <= 3 ? 'font-semibold text-red-600' : 'font-semibold text-orange-600'}>
                      {daysLabel(item.daysUntil)}
                    </TableCell>
                    <TableCell><Badge variant={statusVariant(item.status)}>{item.status ?? '未設定'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>資料不足の案件</CardTitle>
          <Link href={missingDocsHref} className="text-sm font-medium text-primary hover:underline">一覧を見る</Link>
        </CardHeader>
        <CardContent>
          {missingCases.length === 0 ? (
            <p className="text-sm text-muted-foreground">資料不足の案件はありません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>案件名</TableHead>
                  <TableHead>顧客</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missingCases.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link href={`/cases/${item.id}?tab=documents`} className="font-medium text-red-600 hover:underline">{item.name}</Link>
                    </TableCell>
                    <TableCell>{item.company_name ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>AI書類作成で追加入力が必要な案件</CardTitle>
          <Link href={draftMissingHref} className="text-sm font-medium text-primary hover:underline">一覧を見る</Link>
        </CardHeader>
        <CardContent>
          {draftNeedCases.length === 0 ? (
            <p className="text-sm text-muted-foreground">追加入力が必要なAIドラフトはありません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>案件名</TableHead>
                  <TableHead>顧客</TableHead>
                  <TableHead>ドラフト</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftNeedCases.map(item => (
                  <TableRow key={`${item.id}-${item.draft_title}`}>
                    <TableCell>
                      <Link href={`/cases/${item.id}?tab=drafts`} className="font-medium text-purple-700 hover:underline">{item.name}</Link>
                    </TableCell>
                    <TableCell>{item.company_name ?? '-'}</TableCell>
                    <TableCell>{item.draft_title}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
