import { notFound } from 'next/navigation'
import { getDocumentTemplate } from '@/lib/actions/document-templates'
import { DocumentTemplateForm } from '@/components/forms/document-template-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props { params: Promise<{ id: string }> }

export default async function EditTemplatePage(props: Props) {
  const params = await props.params;
  const template = await getDocumentTemplate(params.id)
  if (!template) notFound()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">テンプレート編集</h1>
        <Button asChild variant="outline" size="sm" className="ml-auto">
          <Link href="/settings/templates">← 一覧</Link>
        </Button>
      </div>
      <DocumentTemplateForm template={template} />
    </div>
  )
}
