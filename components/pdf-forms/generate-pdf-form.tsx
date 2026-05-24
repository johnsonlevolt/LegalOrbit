'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generatePdfFormOutput } from '@/lib/actions/pdf-forms'
import type { PdfFormTemplate } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export function GeneratePdfForm({ caseId, templates }: { caseId: string; templates: PdfFormTemplate[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  if (templates.length === 0) return null

  function submit(formData: FormData) {
    const templateId = String(formData.get('template_id') ?? '')
    startTransition(async () => {
      const result = await generatePdfFormOutput(caseId, templateId)
      if (!result.success) {
        toast({ title: 'PDFを作成できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'PDF帳票を作成しました' })
      router.refresh()
    })
  }

  return (
    <form action={submit} className="flex flex-wrap gap-2">
      <select name="template_id" className="h-9 min-w-64 rounded-md border border-input bg-background px-3 py-1 text-sm">
        {templates.map(template => (
          <option key={template.id} value={template.id}>{template.business_type ? `${template.business_type} / ` : ''}{template.name}</option>
        ))}
      </select>
      <Button size="sm" disabled={isPending}>{isPending ? '作成中...' : 'PDF帳票へ転記'}</Button>
    </form>
  )
}
