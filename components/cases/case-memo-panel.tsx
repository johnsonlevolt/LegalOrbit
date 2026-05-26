'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { CheckSquare, Plus } from 'lucide-react'
import { createCaseTaskFromMemo } from '@/lib/actions/case-tasks'
import { createCaseMemo } from '@/lib/actions/practical-extensions'
import type { CaseCommunication } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function CaseMemoPanel({
  caseId,
  customerId,
  memos,
  showCaseLink = false,
}: {
  caseId?: string
  customerId?: string | null
  memos: CaseCommunication[]
  showCaseLink?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function addMemo(formData: FormData) {
    if (!caseId) return
    startTransition(async () => {
      const result = await createCaseMemo(caseId, customerId ?? null, formData)
      if (!result.success) {
        toast({ title: 'メモを保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'メモを保存しました' })
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
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">メモ</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {caseId && (
          <form action={addMemo} className="space-y-2 rounded-md border bg-slate-50 p-3">
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

        {memos.length === 0 ? (
          <p className="text-sm text-muted-foreground">メモはありません。</p>
        ) : (
          <div className="space-y-2">
            {memos.map(memo => (
              <div key={memo.id} className="rounded-md border bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{memo.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(memo.contacted_at).toLocaleString('ja-JP')}
                      {memo.cases?.customers?.company_name ? ` / ${memo.cases.customers.company_name}` : ''}
                      {memo.cases?.assignee ? ` / 担当: ${memo.cases.assignee}` : ''}
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
