import { GarageForm } from '@/components/forms/garage-form'

interface Props { params: Promise<{ id: string }> }

export default async function NewGaragePage(props: Props) {
  const params = await props.params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">車庫追加</h1>
      <GarageForm caseId={params.id} />
    </div>
  )
}
