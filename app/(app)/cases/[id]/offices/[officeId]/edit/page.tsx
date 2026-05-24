import { notFound } from 'next/navigation'
import { getOffice } from '@/lib/actions/offices'
import { OfficeForm } from '@/components/forms/office-form'

interface Props { params: Promise<{ id: string; officeId: string }> }

export default async function EditOfficePage(props: Props) {
  const params = await props.params;
  const office = await getOffice(params.officeId)
  if (!office || office.case_id !== params.id) notFound()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">営業所編集</h1>
      <OfficeForm caseId={params.id} office={office} />
    </div>
  )
}
