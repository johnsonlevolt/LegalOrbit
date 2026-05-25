import { getCustomers } from '@/lib/actions/customers'
import { getAssigneeSettings } from '@/lib/actions/assignee-settings'
import { getDocumentTemplates } from '@/lib/actions/document-templates'
import { ensureDefaultTemplates } from '@/lib/actions/seed-templates'
import { CaseForm } from '@/components/forms/case-form'

export default async function NewCasePage() {
  await ensureDefaultTemplates()
  const [customers, assignees, templates] = await Promise.all([
    getCustomers(),
    getAssigneeSettings(),
    getDocumentTemplates(),
  ])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">案件登録</h1>
      <CaseForm customers={customers} assignees={assignees} templates={templates} />
    </div>
  )
}
