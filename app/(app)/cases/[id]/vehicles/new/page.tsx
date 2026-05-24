import { VehicleForm } from '@/components/forms/vehicle-form'

interface Props { params: Promise<{ id: string }> }

export default async function NewVehiclePage(props: Props) {
  const params = await props.params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">車両追加</h1>
      <VehicleForm caseId={params.id} />
    </div>
  )
}
