import { DocumentCheckForm } from '@/components/forms/document-check-form'

interface Props { params: Promise<{ id: string }> }

export default async function NewDocumentCheckPage(props: Props) {
  const params = await props.params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">書類チェック追加</h1>
      <DocumentCheckForm caseId={params.id} />
    </div>
  )
}
