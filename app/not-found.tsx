import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 text-center">
      <p className="text-8xl font-bold text-gray-300">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">ページが見つかりませんでした</h1>
        <p className="text-sm text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">ダッシュボードに戻る</Link>
      </Button>
    </div>
  )
}
