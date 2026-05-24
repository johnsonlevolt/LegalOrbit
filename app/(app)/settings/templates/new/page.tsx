import { DocumentTemplateForm } from '@/components/forms/document-template-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewTemplatePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">テンプレート新規作成</h1>
        <Button asChild variant="outline" size="sm" className="ml-auto">
          <Link href="/settings/templates">← 一覧</Link>
        </Button>
      </div>
      <DocumentTemplateForm />
    </div>
  )
}
