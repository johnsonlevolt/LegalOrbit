import { getCaseTasks } from '@/lib/actions/case-tasks'
import { CaseTaskPanel } from '@/components/cases/case-task-panel'

export default async function TasksPage() {
  const tasks = await getCaseTasks()
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">タスク</h1>
        <p className="mt-1 text-sm text-muted-foreground">案件横断で未完了タスクと期限を確認します。</p>
      </div>
      <CaseTaskPanel tasks={tasks} showCaseLink />
    </div>
  )
}
