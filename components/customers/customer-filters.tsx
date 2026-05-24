'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface Props {
  initialQ?: string
}

export function CustomerFilters({ initialQ = '' }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(initialQ)

  function applyFilters(overrides?: { q?: string }) {
    const params = new URLSearchParams()
    const fq = overrides?.q !== undefined ? overrides.q : q
    if (fq) params.set('q', fq)
    startTransition(() => {
      router.push(`/customers${params.size ? '?' + params.toString() : ''}`)
    })
  }

  function clearFilters() {
    setQ('')
    router.push('/customers')
  }

  const hasFilters = q

  return (
    <div className="flex flex-wrap gap-2 items-center p-1">
      <div className="relative flex-1 min-w-52">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="会社名・担当者名で検索..."
          className="pl-8"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilters()}
        />
      </div>
      <Button size="sm" onClick={() => applyFilters()}>
        <Search className="h-4 w-4 mr-1" />検索
      </Button>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />クリア
        </Button>
      )}
    </div>
  )
}
