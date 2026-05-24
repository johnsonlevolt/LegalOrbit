import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TemplateNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">テンプレートが見つかりませんでした</h1>
        <p className="text-sm text-muted-foreground">
          このテンプレートは存在しません。
        </p>
      </div>
      <Button asChild>
        <Link href="/settings/templates">テンプレート一覧へ</Link>
      </Button>
    </div>
  )
}
