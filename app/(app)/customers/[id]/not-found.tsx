import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CustomerNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">顧客が見つかりませんでした</h1>
        <p className="text-sm text-muted-foreground">
          この顧客は存在しないか、削除された可能性があります。
        </p>
      </div>
      <Button asChild>
        <Link href="/customers">顧客一覧へ</Link>
      </Button>
    </div>
  )
}
