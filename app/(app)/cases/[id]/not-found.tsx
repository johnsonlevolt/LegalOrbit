import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CaseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">案件が見つかりませんでした</h1>
        <p className="text-sm text-muted-foreground">
          この案件は存在しないか、削除された可能性があります。
        </p>
      </div>
      <Button asChild>
        <Link href="/cases">案件一覧へ</Link>
      </Button>
    </div>
  )
}
