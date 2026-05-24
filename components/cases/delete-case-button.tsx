'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCase } from '@/lib/actions/cases'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

interface Props {
  caseId: string
}

export function DeleteCaseButton({ caseId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('この案件を削除しますか？関連する車両・営業所・車庫・人員・書類も全て削除されます。')) return
    setLoading(true)
    const result = await deleteCase(caseId)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      setLoading(false)
      return
    }
    router.push('/cases')
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? '削除中...' : '削除'}
    </Button>
  )
}
