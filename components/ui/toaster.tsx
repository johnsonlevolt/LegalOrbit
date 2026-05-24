'use client'

import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function Toaster() {
  const { toasts } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'rounded-md border p-4 shadow-lg bg-background text-foreground',
            t.variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground'
          )}
        >
          {t.title && <p className="font-semibold">{t.title}</p>}
          {t.description && <p className="text-sm mt-1">{t.description}</p>}
        </div>
      ))}
    </div>
  )
}
