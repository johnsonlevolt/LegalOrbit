import { notFound } from 'next/navigation'
import { getCase } from '@/lib/actions/cases'
import { getDocumentTemplates } from '@/lib/actions/document-templates'
import { DocumentDraftCreateForm } from '@/components/forms/document-draft-create-form'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ template_id?: string }>
}

export default async function NewDocumentDraftPage(props: Props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])
  const [caseData, templates] = await Promise.all([
    getCase(params.id),
    getDocumentTemplates(),
  ])
  if (!caseData) notFound()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">AI書類作成</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          添付資料を読み込み、テンプレートに沿って自動入力します。不足項目は質問として表示します。
        </p>
      </div>
      <DocumentDraftCreateForm
        caseId={params.id}
        caseData={caseData}
        templates={templates}
        defaultTemplateId={searchParams.template_id}
      />
    </div>
  )
}
