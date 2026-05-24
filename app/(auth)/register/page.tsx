import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>新規登録は停止中です</CardTitle>
        <CardDescription>
          この環境では、管理者が発行したアカウントだけがログインできます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          アカウントが必要な場合は、管理者にSupabase Authでのユーザー作成を依頼してください。
        </p>
        <Button asChild className="w-full">
          <Link href="/login">ログインへ戻る</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
