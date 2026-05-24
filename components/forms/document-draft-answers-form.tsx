'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { answerDraftQuestions, saveDraftAnswers } from '@/lib/actions/document-drafts'
import { toast } from '@/hooks/use-toast'
import type { DocumentDraft } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles } from 'lucide-react'

interface Props {
  draft: DocumentDraft
}

export function DocumentDraftAnswersForm({ draft }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const questions = draft.missing_fields.filter(field => !draft.answers[field.key])

  if (questions.length === 0) return null

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await answerDraftQuestions(draft.id, formData)
      if (!result.success) {
        toast({ title: '更新できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '回答を反映しました' })
      router.refresh()
    })
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await saveDraftAnswers(draft.id, formData)
      if (!result.success) {
        toast({ title: '保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '回答を途中保存しました' })
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} data-draft-answer-form="true" className="space-y-4">
      {questions.map(field => (
        <div key={field.key} className="space-y-2 rounded-md border bg-white p-3">
          <Label htmlFor={`answer_${field.key}`} className="text-sm font-semibold">
            {field.label}{field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          <p className="text-sm text-muted-foreground">{field.question}</p>
          {field.reason && <p className="text-xs text-muted-foreground">理由: {field.reason}</p>}
          <Textarea id={`answer_${field.key}`} name={`answer_${field.key}`} rows={3} />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isPending ? '再作成中...' : '回答を反映して再作成'}
        </Button>
        <Button type="button" variant="outline" disabled={isPending} onClick={() => {
          const form = document.querySelector('form[data-draft-answer-form="true"]') as HTMLFormElement | null
          if (form) handleSave(new FormData(form))
        }}>
          途中保存
        </Button>
      </div>
    </form>
  )
}
