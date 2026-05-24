import { notFound } from 'next/navigation'
import { getVehicle } from '@/lib/actions/vehicles'
import { VehicleForm } from '@/components/forms/vehicle-form'

interface Props { params: Promise<{ id: string; vehicleId: string }> }

export default async function EditVehiclePage(props: Props) {
  const params = await props.params;
  const vehicle = await getVehicle(params.vehicleId)
  if (!vehicle || vehicle.case_id !== params.id) notFound()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">車両編集</h1>
      <VehicleForm caseId={params.id} vehicle={vehicle} />
    </div>
  )
}
