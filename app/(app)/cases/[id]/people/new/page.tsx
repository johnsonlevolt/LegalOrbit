import { PersonForm } from '@/components/forms/person-form'

interface Props { params: Promise<{ id: string }> }

export default async function NewPersonPage(props: Props) {
  const params = await props.params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">人員追加</h1>
      <PersonForm caseId={params.id} />
    </div>
  )
}
