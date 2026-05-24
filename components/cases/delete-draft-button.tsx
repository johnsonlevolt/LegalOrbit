'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDocumentDraft } from '@/lib/actions/document-drafts'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Props {
  caseId: string
  draftId: string
}

export function DeleteDraftButton({ caseId, draftId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('このAIドラフトと添付ファイルを削除しますか？')) return
    setLoading(true)
    const result = await deleteDocumentDraft(draftId)
    setLoading(false)
    if (!result.success) {
      toast({ title: '削除できませんでした', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: 'AIドラフトを削除しました' })
    router.push(`/cases/${caseId}?tab=drafts`)
  }

  return (
    <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="mr-2 h-4 w-4" />
      {loading ? '削除中...' : '削除'}
    </Button>
  )
}
