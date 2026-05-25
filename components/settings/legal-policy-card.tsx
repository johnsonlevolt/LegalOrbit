import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LegalPolicyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>規約とポリシー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <details className="rounded-md border bg-white">
          <summary className="cursor-pointer px-4 py-3 font-medium text-foreground">サブスクリプション規約</summary>
          <div className="space-y-2 border-t px-4 py-3">
            <p>月額契約は契約日から1か月、年額契約は契約日から1年の契約です。新規契約に月末締めの日割りはありません。</p>
            <p>年額契約は11か月分の料金で12か月利用できます。契約期間中は更新日まで利用できます。</p>
            <p>アップグレードは即時反映し、残期間分の差額を日割り請求します。ダウングレードは即時反映せず、次回更新日から反映します。</p>
          </div>
        </details>
        <details className="rounded-md border bg-white">
          <summary className="cursor-pointer px-4 py-3 font-medium text-foreground">データ管理ポリシー</summary>
          <div className="space-y-2 border-t px-4 py-3">
            <p>顧客情報、案件情報、添付資料はログインユーザーに紐づけて管理します。</p>
            <p>添付ファイルは非公開ストレージに保存し、アプリ内の認証済み操作を前提に扱います。</p>
            <p>AI書類作成を利用する場合、入力資料や案件情報がAI処理に送信されることがあります。機密性の高い資料は内容を確認してから利用してください。</p>
          </div>
        </details>
        <details className="rounded-md border bg-white">
          <summary className="cursor-pointer px-4 py-3 font-medium text-foreground">決済・領収書ポリシー</summary>
          <div className="space-y-2 border-t px-4 py-3">
            <p>決済はStripeで処理します。カード情報は本サービスでは保持しません。</p>
            <p>領収書・請求履歴はStripe決済後に自動作成され、設定画面から確認できます。</p>
            <p>正式な利用規約・プライバシーポリシーは公開前に別ページ化し、申込導線から確認できるようにします。</p>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
