import { notFound } from 'next/navigation'
import { getDocumentCheck } from '@/lib/actions/document-checks'
import { DocumentCheckForm } from '@/components/forms/document-check-form'

interface Props {
  params: Promise<{ id: string; documentId: string }>
}

export default async function EditDocumentCheckPage(props: Props) {
  const params = await props.params;
  const documentCheck = await getDocumentCheck(params.documentId)
  if (!documentCheck || documentCheck.case_id !== params.id) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">添付書類チェック編集</h1>
      <DocumentCheckForm caseId={params.id} documentCheck={documentCheck} />
    </div>
  )
}
