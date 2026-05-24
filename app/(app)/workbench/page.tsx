import Link from 'next/link'
import type React from 'react'
import { AlertTriangle, CalendarClock, FileQuestion, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCaseTasks } from '@/lib/actions/case-tasks'
import { getCaseCorrections } from '@/lib/actions/corrections'
import { getCaseDeadlines } from '@/lib/actions/deadlines'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type CaseJoin = { id: string; name: string; customers?: { company_name: string } | { company_name: string }[] | null } | { id: string; name: string; customers?: { company_name: string } | { company_name: string }[] | null }[] | null

function firstCase(cases: CaseJoin) {
  return Array.isArray(cases) ? cases[0] ?? null : cases
}

function customerName(cases: CaseJoin) {
  const item = firstCase(cases)
  const customers = item?.customers
  if (Array.isArray(customers)) return customers[0]?.company_name ?? ''
  return customers?.company_name ?? ''
}

export default async function WorkbenchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  if (!user) return null

  const [tasks, corrections, deadlines, missingDocsResult, draftsResult] = await Promise.all([
    getCaseTasks(),
    getCaseCorrections(),
    getCaseDeadlines(),
    supabase
      .from('document_checks')
      .select('id, document_name, case_id, cases(id, name, customers(company_name))')
      .eq('user_id', user.id)
      .eq('required', true)
      .eq('obtained', false)
      .limit(20),
    supabase
      .from('document_drafts')
      .select('id, title, case_id, status, cases(id, name, customers(company_name))')
      .eq('user_id', user.id)
      .eq('status', 'needs_input')
      .limit(20),
  ])

  const activeTasks = tasks.filter(task => task.status !== 'done')
  const activeCorrections = corrections.filter(item => item.status !== 'done')
  const activeDeadlines = deadlines.filter(item => !item.completed && item.deadline_date <= sevenDaysLater)
  const missingDocs = (missingDocsResult.data ?? []) as Array<{ id: string; document_name: string; case_id: string; cases: CaseJoin }>
  const drafts = (draftsResult.data ?? []) as Array<{ id: string; title: string; case_id: string; cases: CaseJoin }>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">今日やること</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          期限、補正、不足資料、AI質問を横断して確認します。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="未完了タスク" count={activeTasks.length} icon={<CalendarClock className="h-4 w-4" />} />
        <SummaryCard title="補正対応" count={activeCorrections.length} icon={<AlertTriangle className="h-4 w-4" />} />
        <SummaryCard title="不足資料" count={missingDocs.length} icon={<FileQuestion className="h-4 w-4" />} />
        <SummaryCard title="AI質問" count={drafts.length} icon={<Sparkles className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">期限が近いもの</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {activeDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">7日以内の期限はありません</p>
            ) : activeDeadlines.map(item => (
              <Link key={item.id} href={item.case_id ? `/cases/${item.case_id}` : '/customers'} className="block rounded-md border p-3 hover:bg-muted">
                <p className="text-sm font-medium">{item.deadline_date} {item.title}</p>
                <p className="text-xs text-muted-foreground">{item.cases?.name ?? item.customers?.company_name ?? ''}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">補正対応</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {activeCorrections.length === 0 ? (
              <p className="text-sm text-muted-foreground">未完了の補正はありません</p>
            ) : activeCorrections.map(item => (
              <Link key={item.id} href={`/cases/${item.case_id}`} className="block rounded-md border p-3 hover:bg-muted">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.due_date ? `期限: ${item.due_date}` : '期限未設定'}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">不足資料</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {missingDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">不足資料はありません</p>
            ) : missingDocs.map(item => (
              <Link key={item.id} href={`/cases/${item.case_id}?tab=documents`} className="block rounded-md border p-3 hover:bg-muted">
                <p className="text-sm font-medium">{item.document_name}</p>
                <p className="text-xs text-muted-foreground">{firstCase(item.cases)?.name ?? ''} {customerName(item.cases)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">AI追加質問</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {drafts.length === 0 ? (
              <p className="text-sm text-muted-foreground">回答が必要なAI質問はありません</p>
            ) : drafts.map(item => (
              <Link key={item.id} href={`/cases/${item.case_id}/drafts/${item.id}`} className="block rounded-md border p-3 hover:bg-muted">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{firstCase(item.cases)?.name ?? ''}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">基準日: {today}</p>
    </div>
  )
}

function SummaryCard({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{count}</p>
        </div>
        <Badge variant={count > 0 ? 'default' : 'outline'}>{icon}</Badge>
      </CardContent>
    </Card>
  )
}
