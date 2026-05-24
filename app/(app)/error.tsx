'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <h2 className="text-xl font-bold">エラーが発生しました</h2>
      <p className="text-muted-foreground text-sm max-w-md">予期せぬエラーが発生しました。しばらく時間をおいてから再度お試しください。</p>
      <Button onClick={reset}>もう一度試す</Button>
      <a href="/dashboard" className="text-sm text-muted-foreground underline">ダッシュボードに戻る</a>
    </div>
  )
}
