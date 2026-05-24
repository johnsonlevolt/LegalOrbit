'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DatabaseZap } from 'lucide-react'
import { applyDraftExtractedFields } from '@/lib/actions/document-drafts'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export function ApplyDraftExtractedFieldsButton({ draftId, disabled }: { draftId: string; disabled?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm('AIが抽出した情報を、案件・顧客・車両・営業所・車庫の登録データへ反映します。反映後も各画面で確認してください。続行しますか？')) return
    startTransition(async () => {
      const result = await applyDraftExtractedFields(draftId)
      if (!result.success) {
        toast({ title: '反映できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '抽出情報を反映しました', description: `更新 ${result.data.updated}件 / 作成 ${result.data.created}件` })
      router.refresh()
    })
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={disabled || isPending}>
      <DatabaseZap className="mr-2 h-4 w-4" />
      {isPending ? '反映中...' : '抽出情報を案件へ反映'}
    </Button>
  )
}
