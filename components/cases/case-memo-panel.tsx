'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { CheckSquare, Plus } from 'lucide-react'
import { createCaseTaskFromMemo } from '@/lib/actions/case-tasks'
import { createCaseMemo } from '@/lib/actions/practical-extensions'
import type { Case, CaseCommunication } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function CaseMemoPanel({
  caseId,
  customerId,
  memos,
  cases = [],
  showCaseLink = false,
}: {
  caseId?: string
  customerId?: string | null
  memos: CaseCommunication[]
  cases?: Case[]
  showCaseLink?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id ?? '')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')

  const activeCase = cases.find(item => item.id === selectedCaseId)
  const activeCaseId = caseId ?? selectedCaseId
  const activeCustomerId = customerId ?? activeCase?.customer_id ?? null
  const canCreateMemo = Boolean(activeCaseId)
  const memoAssignee = (memo: CaseCommunication) =>
    memo.cases?.customers?.contact_person?.trim() || memo.cases?.assignee?.trim() || ''

  const companyOptions = useMemo(() => {
    const values = new Set<string>()
    for (const memo of memos) {
      const company = memo.cases?.customers?.company_name?.trim()
      if (company) values.add(company)
    }
    for (const item of cases) {
      const company = item.customers?.company_name?.trim()
      if (company) values.add(company)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [cases, memos])

  const assigneeOptions = useMemo(() => {
    const values = new Set<string>()
    for (const memo of memos) {
      const assignee = memoAssignee(memo)
      if (assignee) values.add(assignee)
    }
    for (const item of cases) {
      const assignee = item.customers?.contact_person?.trim() || item.assignee?.trim()
      if (assignee) values.add(assignee)
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [cases, memos])

  const visibleMemos = useMemo(() => {
    return memos.filter(memo => {
      const company = memo.cases?.customers?.company_name ?? ''
      const assignee = memoAssignee(memo)
      return (companyFilter === 'all' || company === companyFilter)
        && (assigneeFilter === 'all' || assignee === assigneeFilter)
    })
  }, [assigneeFilter, companyFilter, memos])

  function addMemo(formData: FormData) {
    if (!activeCaseId) return
    startTransition(async () => {
      const result = await createCaseMemo(activeCaseId, activeCustomerId ?? null, formData)
      if (!result.success) {
        toast({ title: 'メモを保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'メモを保存しました' })
      router.refresh()
    })
  }

  function addTaskFromMemo(memo: CaseCommunication) {
    if (!memo.case_id) return
    startTransition(async () => {
      const result = await createCaseTaskFromMemo(memo.case_id!, memo.id)
      if (!result.success) {
        toast({ title: 'タスクに追加できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'メモからタスクを追加しました' })
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">メモ</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {canCreateMemo && (
          <form action={addMemo} className="space-y-2 rounded-md border bg-slate-50 p-3">
            {!caseId && (
              <label className="block space-y-1 text-sm">
                <span className="font-medium">案件</span>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={selectedCaseId}
                  onChange={event => setSelectedCaseId(event.target.value)}
                >
                  {cases.map(item => (
                    <option key={item.id} value={item.id}>
                      {(item.customers?.company_name ?? '会社未設定')} / {item.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Input name="subject" className="bg-white" placeholder="見出し（任意）" />
            <Textarea name="body" className="min-h-28 bg-white" placeholder="対応履歴、気づき、顧客からの連絡内容など" />
            <div className="flex justify-end">
              <Button disabled={isPending}>
                <Plus className="mr-2 h-4 w-4" />
                メモを追加
              </Button>
            </div>
          </form>
        )}

        {showCaseLink && (companyOptions.length > 0 || assigneeOptions.length > 0) && (
          <div className="grid gap-2 rounded-md border bg-white p-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">会社</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                value={companyFilter}
                onChange={event => setCompanyFilter(event.target.value)}
              >
                <option value="all">すべての会社</option>
                {companyOptions.map(company => <option key={company} value={company}>{company}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">担当者</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                value={assigneeFilter}
                onChange={event => setAssigneeFilter(event.target.value)}
              >
                <option value="all">すべての担当者</option>
                {assigneeOptions.map(assignee => <option key={assignee} value={assignee}>{assignee}</option>)}
              </select>
            </label>
          </div>
        )}

        {visibleMemos.length === 0 ? (
          <p className="text-sm text-muted-foreground">メモはありません。</p>
        ) : (
          <div className="space-y-2">
            {visibleMemos.map(memo => (
              <div key={memo.id} className="rounded-md border bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{memo.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(memo.contacted_at).toLocaleString('ja-JP')}
                      {memo.cases?.customers?.company_name ? ` / ${memo.cases.customers.company_name}` : ''}
                      {memoAssignee(memo) ? ` / 担当: ${memoAssignee(memo)}` : ''}
                      {showCaseLink && memo.cases && (
                        <>
                          {' / '}
                          <Link href={`/cases/${memo.case_id}`} className="underline">{memo.cases.name}</Link>
                        </>
                      )}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => addTaskFromMemo(memo)} disabled={isPending || !memo.case_id}>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    タスク化
                  </Button>
                </div>
                {memo.body && <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{memo.body}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
