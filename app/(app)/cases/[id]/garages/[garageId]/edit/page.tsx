import { notFound } from 'next/navigation'
import { getGarage } from '@/lib/actions/garages'
import { GarageForm } from '@/components/forms/garage-form'

interface Props { params: Promise<{ id: string; garageId: string }> }

export default async function EditGaragePage(props: Props) {
  const params = await props.params;
  const garage = await getGarage(params.garageId)
  if (!garage || garage.case_id !== params.id) notFound()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">車庫編集</h1>
      <GarageForm caseId={params.id} garage={garage} />
    </div>
  )
}
