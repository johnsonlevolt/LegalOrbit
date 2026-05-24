'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateDraftContent, markDraftReviewed } from '@/lib/actions/document-drafts'
import { toast } from '@/hooks/use-toast'
import type { DocumentDraft } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Save } from 'lucide-react'

interface Props {
  draft: DocumentDraft
}

export function DocumentDraftContentForm({ draft }: Props) {
  const router = useRouter()
  const [content, setContent] = useState(draft.generated_content ?? '')
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateDraftContent(draft.id, content)
      if (!result.success) {
        toast({ title: '保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'プレビューを保存しました' })
      router.refresh()
    })
  }

  function handleReview() {
    startTransition(async () => {
      const saveResult = await updateDraftContent(draft.id, content)
      if (!saveResult.success) {
        toast({ title: '保存できませんでした', description: saveResult.error, variant: 'destructive' })
        return
      }
      const reviewResult = await markDraftReviewed(draft.id)
      if (!reviewResult.success) {
        toast({ title: '確認済みにできませんでした', description: reviewResult.error, variant: 'destructive' })
        return
      }
      toast({ title: '確認済みにしました' })
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={event => setContent(event.target.value)}
        rows={24}
        className="font-mono text-sm leading-6"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          保存
        </Button>
        <Button type="button" variant="outline" onClick={handleReview} disabled={isPending}>
          <CheckCircle className="mr-2 h-4 w-4" />
          人間確認済みにする
        </Button>
      </div>
    </div>
  )
}
