'use client'

import type { Case, CaseCommunication, CaseTask } from '@/types/database'
import { CaseMemoPanel } from '@/components/cases/case-memo-panel'
import { CaseTaskPanel } from '@/components/cases/case-task-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function CaseTaskMemoSwitch({
  caseId,
  customerId,
  tasks,
  memos,
  cases = [],
  showCaseLink = false,
}: {
  caseId?: string
  customerId?: string | null
  tasks: CaseTask[]
  memos: CaseCommunication[]
  cases?: Case[]
  showCaseLink?: boolean
}) {
  return (
    <Tabs defaultValue="tasks" className="space-y-3">
      <TabsList>
        <TabsTrigger value="tasks">タスク</TabsTrigger>
        <TabsTrigger value="memos">メモ</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">
        <CaseTaskPanel caseId={caseId} tasks={tasks} showCaseLink={showCaseLink} />
      </TabsContent>
      <TabsContent value="memos">
        <CaseMemoPanel caseId={caseId} customerId={customerId} memos={memos} cases={cases} showCaseLink={showCaseLink} />
      </TabsContent>
    </Tabs>
  )
}
