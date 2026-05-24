'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { seedDefaultTemplates } from '@/lib/actions/seed-templates'
import { toast } from '@/hooks/use-toast'

export function AutoSeedTemplates({ enabled }: { enabled: boolean }) {
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (!enabled || ran.current) return
    ran.current = true

    seedDefaultTemplates().then(result => {
      if (result.success && result.data.count > 0) {
        toast({ title: `${result.data.count}件のテンプレートを追加しました` })
        router.refresh()
      }
    })
  }, [enabled, router])

  return null
}
