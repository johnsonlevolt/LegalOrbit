'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDocumentTemplate } from '@/lib/actions/document-templates'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('このテンプレートを削除しますか？')) return
    setLoading(true)
    const result = await deleteDocumentTemplate(templateId)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      setLoading(false)
      return
    }
    toast({ title: '削除しました' })
    router.refresh()
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={loading}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  )
}
