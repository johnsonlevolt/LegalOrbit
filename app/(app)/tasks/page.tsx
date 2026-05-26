import { getCaseTasks } from '@/lib/actions/case-tasks'
import { getCases } from '@/lib/actions/cases'
import { getCaseMemos } from '@/lib/actions/practical-extensions'
import { CaseTaskMemoSwitch } from '@/components/cases/case-task-memo-switch'

export default async function TasksPage() {
  const [tasks, memos, cases] = await Promise.all([
    getCaseTasks(),
    getCaseMemos(),
    getCases(),
  ])
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">タスク・メモ</h1>
        <p className="mt-1 text-sm text-muted-foreground">案件横断でタスクとメモを確認します。</p>
      </div>
      <CaseTaskMemoSwitch tasks={tasks} memos={memos} cases={cases} showCaseLink />
    </div>
  )
}
