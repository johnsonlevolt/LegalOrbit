'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { CaseDeadline } from '@/types/database'
import { createCaseDeadline, toggleCaseDeadline } from '@/lib/actions/deadlines'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DeadlinesPanel({
  caseId,
  customerId,
  deadlines,
}: {
  caseId: string
  customerId: string | null
  deadlines: CaseDeadline[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createCaseDeadline(caseId, customerId, formData)
      if (!result.success) {
        toast({ title: '期限を登録できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '期限を登録しました' })
      router.refresh()
    })
  }

  function toggle(id: string, completed: boolean) {
    startTransition(async () => {
      const result = await toggleCaseDeadline(id, completed)
      if (!result.success) toast({ title: '更新できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">期限・リマインド</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form action={create} className="grid gap-2 md:grid-cols-[1.3fr_1fr_1fr_auto]">
          <Input name="title" className="bg-white" placeholder="期限名 例: 許可更新期限" />
          <Input name="deadline_date" className="bg-white" type="date" />
          <Input name="kind" className="bg-white" placeholder="種別 例: 更新期限" />
          <Button type="submit" disabled={isPending}>追加</Button>
          <Input name="note" className="bg-white md:col-span-2" placeholder="メモ" />
          <Input name="reminder_days_before" className="bg-white" placeholder="通知日 例: 14,7,3,1" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="reminder_enabled" defaultChecked />
            リマインド対象
          </label>
        </form>
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">期限は登録されていません</p>
        ) : (
          <div className="space-y-2">
            {deadlines.map(item => (
              <label key={item.id} className="flex items-start gap-2 rounded-md border p-3">
                <input type="checkbox" checked={item.completed} onChange={event => toggle(item.id, event.target.checked)} className="mt-1" />
                <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                  <span className="block text-sm font-medium">{item.deadline_date} {item.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {item.kind}
                    {item.reminder_enabled ? ` / 通知 ${item.reminder_days_before?.join(', ') || '7, 3, 1'}日前` : ' / 通知なし'}
                    {item.note ? ` / ${item.note}` : ''}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
