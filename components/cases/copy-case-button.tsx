'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Copy } from 'lucide-react'
import { copyCase } from '@/lib/actions/case-copy'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

export function CopyCaseButton({ caseId, defaultName }: { caseId: string; defaultName: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleCopy() {
    const name = window.prompt('コピー後の案件名', `${defaultName} のコピー`)
    if (name === null) return
    const data = new FormData()
    data.set('name', name.trim() || `${defaultName} のコピー`)
    data.set('include_related', 'on')
    data.set('include_tasks', 'on')

    startTransition(async () => {
      const result = await copyCase(caseId, data)
      if (!result.success) {
        toast({ title: 'コピーできませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '案件をコピーしました' })
      router.push(`/cases/${result.data.id}`)
    })
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={handleCopy}>
      <Copy className="mr-1 h-4 w-4" />
      コピー
    </Button>
  )
}
