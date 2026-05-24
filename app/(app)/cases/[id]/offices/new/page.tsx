import { OfficeForm } from '@/components/forms/office-form'

interface Props { params: Promise<{ id: string }> }

export default async function NewOfficePage(props: Props) {
  const params = await props.params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">営業所追加</h1>
      <OfficeForm caseId={params.id} />
    </div>
  )
}
