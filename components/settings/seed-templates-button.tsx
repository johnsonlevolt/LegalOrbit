'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { seedDefaultTemplates } from '@/lib/actions/seed-templates'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function SeedTemplatesButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSeed() {
    if (!confirm('行政書士業務でよく使う標準テンプレートを一括追加しますか？\n既に同名のテンプレートがある場合はスキップされます。')) return
    setLoading(true)
    const result = await seedDefaultTemplates()
    setLoading(false)
    if (!result.success) {
      toast({ title: result.error, variant: 'destructive' })
      return
    }
    toast({ title: `${result.data.count}件のテンプレートを追加しました` })
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSeed} disabled={loading}>
      <Download className="h-4 w-4 mr-2" />
      {loading ? '追加中...' : '標準テンプレートを一括追加'}
    </Button>
  )
}
