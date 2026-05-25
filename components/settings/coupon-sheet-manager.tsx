'use client'

import { ShieldCheck, TableProperties, Workflow } from 'lucide-react'
import type { CouponSheetSetting, CouponSheetSyncLog } from '@/types/database'

export function CouponSheetManager({
  logs,
}: {
  setting: CouponSheetSetting | null
  logs: CouponSheetSyncLog[]
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <TableProperties className="h-5 w-5 text-primary" />
          <p className="mt-3 font-medium">Googleシートを原本にする</p>
          <p className="mt-1 text-sm text-muted-foreground">
            コード、期限、回数、紹介者、無料内容はシートだけで管理します。アプリへCSV取込は不要です。
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <Workflow className="h-5 w-5 text-primary" />
          <p className="mt-3 font-medium">GASで自動照会</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ユーザーが決済画面でコードを入力すると、サーバーがGASへ照会して条件を確認します。
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="mt-3 font-medium">コード漏洩対策</p>
          <p className="mt-1 text-sm text-muted-foreground">
            アプリDBにはコード本文を保存せず、照合用ハッシュと表示用ヒントだけを残します。
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <p className="font-medium">設定する環境変数</p>
        <div className="mt-3 grid gap-2 text-sm">
          <code className="rounded bg-muted px-2 py-1">COUPON_GAS_ENDPOINT</code>
          <code className="rounded bg-muted px-2 py-1">COUPON_GAS_SECRET</code>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          GAS WebアプリのURLと共通シークレットをVercelに設定すると、クーポン入力時に自動で有効化されます。
        </p>
      </div>

      {logs.length > 0 && (
        <div className="rounded-lg border bg-white p-4">
          <p className="font-medium">過去の取込ログ</p>
          <p className="mt-1 text-sm text-muted-foreground">
            以前のCSV/API取込ログです。今後はGAS照会方式のため、通常操作では取込は発生しません。
          </p>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {logs.map(log => (
              <p key={log.id}>
                {new Date(log.created_at).toLocaleString('ja-JP')} / {log.status} / {log.imported_count}件 / {log.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
