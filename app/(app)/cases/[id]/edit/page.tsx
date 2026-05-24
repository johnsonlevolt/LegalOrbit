import { notFound } from 'next/navigation'
import { getCase } from '@/lib/actions/cases'
import { getCustomers } from '@/lib/actions/customers'
import { getAssigneeSettings } from '@/lib/actions/assignee-settings'
import { CaseForm } from '@/components/forms/case-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCasePage(props: Props) {
  const params = await props.params
  const [caseData, customers, assignees] = await Promise.all([
    getCase(params.id),
    getCustomers(),
    getAssigneeSettings(),
  ])
  if (!caseData) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">案件編集</h1>
      <CaseForm caseData={caseData} customers={customers} assignees={assignees} />
    </div>
  )
}
