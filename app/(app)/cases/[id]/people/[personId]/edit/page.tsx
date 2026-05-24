import { notFound } from 'next/navigation'
import { getPerson } from '@/lib/actions/people'
import { PersonForm } from '@/components/forms/person-form'

interface Props { params: Promise<{ id: string; personId: string }> }

export default async function EditPersonPage(props: Props) {
  const params = await props.params;
  const person = await getPerson(params.personId)
  if (!person || person.case_id !== params.id) notFound()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">人員編集</h1>
      <PersonForm caseId={params.id} person={person} />
    </div>
  )
}
