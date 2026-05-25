'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { createCaseTask, deleteCaseTask, updateCaseTaskStatus } from '@/lib/actions/case-tasks'
import type { CaseTask } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CaseTaskPanel({ caseId, tasks, showCaseLink = false }: { caseId?: string; tasks: CaseTask[]; showCaseLink?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [customerFilter, setCustomerFilter] = useState('all')
  const [caseFilter, setCaseFilter] = useState('all')

  const assignees = useMemo(
    () => Array.from(new Set(tasks.map(task => task.cases?.assignee).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'ja')),
    [tasks],
  )

  const customers = useMemo(
    () => Array.from(new Set(tasks.map(task => task.cases?.customers?.company_name).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'ja')),
    [tasks],
  )

  const cases = useMemo(
    () => Array.from(new Map(tasks.map(task => [task.case_id, task.cases])).values()).filter(Boolean),
    [tasks],
  )

  const visibleTasks = tasks.filter(task => {
    if (assigneeFilter !== 'all' && task.cases?.assignee !== assigneeFilter) return false
    if (customerFilter !== 'all' && task.cases?.customers?.company_name !== customerFilter) return false
    if (caseFilter !== 'all' && task.case_id !== caseFilter) return false
    return true
  })

  function addTask(formData: FormData) {
    if (!caseId) return
    startTransition(async () => {
      const result = await createCaseTask(caseId, formData)
      if (!result.success) {
        toast({ title: 'タスクを作成できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'タスクを追加しました' })
      router.refresh()
    })
  }

  function toggleTask(task: CaseTask) {
    startTransition(async () => {
      const result = await updateCaseTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
      if (!result.success) toast({ title: '更新できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }

  function removeTask(id: string) {
    if (!confirm('このタスクを削除しますか？')) return
    startTransition(async () => {
      const result = await deleteCaseTask(id)
      if (!result.success) toast({ title: '削除できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">タスク</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {caseId && (
          <form action={addTask} className="grid gap-2 md:grid-cols-[1fr_150px_110px_auto]">
            <Input name="title" placeholder="次にやる作業" />
            <Input name="due_date" type="date" />
            <select name="priority" className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="normal">通常</option>
              <option value="high">高</option>
              <option value="urgent">緊急</option>
              <option value="low">低</option>
            </select>
            <Button disabled={isPending}>追加</Button>
          </form>
        )}

        {showCaseLink && tasks.length > 0 && (
          <div className="grid gap-2 md:grid-cols-3">
            <select value={customerFilter} onChange={event => setCustomerFilter(event.target.value)} className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm">
              <option value="all">すべての会社</option>
              {customers.map(customer => <option key={customer} value={customer}>{customer}</option>)}
            </select>
            <select value={assigneeFilter} onChange={event => setAssigneeFilter(event.target.value)} className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm">
              <option value="all">すべての担当者</option>
              {assignees.map(assignee => <option key={assignee} value={assignee}>{assignee}</option>)}
            </select>
            <select value={caseFilter} onChange={event => setCaseFilter(event.target.value)} className="h-10 rounded-md border border-input bg-white px-3 py-2 text-sm">
              <option value="all">すべての案件</option>
              {cases.map(item => item && <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        )}

        {visibleTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">タスクはありません。</p>
        ) : (
          <div className="space-y-2">
            {visibleTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 rounded-md border p-3">
                <button onClick={() => toggleTask(task)} disabled={isPending} className="shrink-0">
                  {task.status === 'done' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'text-muted-foreground line-through' : ''}`}>{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.due_date ? `期限: ${task.due_date}` : '期限なし'} / 優先度: {priorityLabel(task.priority)}
                    {task.cases?.customers?.company_name ? ` / ${task.cases.customers.company_name}` : ''}
                    {task.cases?.assignee ? ` / 担当: ${task.cases.assignee}` : ''}
                    {showCaseLink && task.cases && (
                      <>
                        {' / '}
                        <Link href={`/cases/${task.case_id}`} className="underline">{task.cases.name}</Link>
                      </>
                    )}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeTask(task.id)} disabled={isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function priorityLabel(priority: string) {
  if (priority === 'urgent') return '緊急'
  if (priority === 'high') return '高'
  if (priority === 'low') return '低'
  return '通常'
}
