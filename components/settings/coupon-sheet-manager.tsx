'use client'

import { useTransition } from 'react'
import { RefreshCw, Upload } from 'lucide-react'
import {
  importCouponsFromSheetCsv,
  saveCouponSheetSetting,
  syncCouponsFromGoogleSheet,
} from '@/lib/actions/coupon-sheet'
import type { CouponSheetSetting, CouponSheetSyncLog } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function CouponSheetManager({
  setting,
  logs,
}: {
  setting: CouponSheetSetting | null
  logs: CouponSheetSyncLog[]
}) {
  const [isPending, startTransition] = useTransition()

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await saveCouponSheetSetting(formData)
      if (!result.success) {
        toast({ title: '保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Googleシート連携設定を保存しました' })
    })
  }

  function importCsv(formData: FormData) {
    startTransition(async () => {
      const result = await importCouponsFromSheetCsv(formData)
      if (!result.success) {
        toast({ title: '取り込みできませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: `${result.data.count}件のクーポンを取り込みました` })
    })
  }

  function syncApi() {
    startTransition(async () => {
      const result = await syncCouponsFromGoogleSheet()
      if (!result.success) {
        toast({ title: 'API同期できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: `${result.data.count}件のクーポンを同期しました` })
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-blue-50 p-3 text-sm text-blue-950">
        Googleシートをクーポンの原本にします。シートはサービスアカウントのメールだけに共有し、一般公開しないでください。
        アプリにはコード全文を保存せず、照合用ハッシュと表示用ヒントだけを保存します。
      </div>

      <form action={save} className="grid gap-3 rounded-md border bg-white p-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Spreadsheet ID</Label>
          <Input name="spreadsheet_id" className="bg-white" defaultValue={setting?.spreadsheet_id ?? ''} />
        </div>
        <div className="space-y-1">
          <Label>シート名</Label>
          <Input name="sheet_name" className="bg-white" defaultValue={setting?.sheet_name ?? 'coupons'} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>サービスアカウントメール</Label>
          <Input name="service_account_email" className="bg-white" defaultValue={setting?.service_account_email ?? ''} />
        </div>
        <details className="rounded-md border bg-muted/30 p-3 md:col-span-2">
          <summary className="cursor-pointer text-sm font-medium">秘密鍵を設定する</summary>
          <p className="mt-2 text-xs text-muted-foreground">
            Google Sheets APIで直接同期する場合だけ入力します。ベータ中はCSV取込だけでも運用できます。
          </p>
          <textarea name="private_key" className="mt-2 min-h-28 w-full rounded-md border bg-white p-2 text-xs" />
        </details>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={setting?.enabled ?? false} />
          シート連携を有効にする
        </label>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button disabled={isPending}>連携設定を保存</Button>
          <Button type="button" variant="outline" onClick={syncApi} disabled={isPending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Google Sheets APIで同期
          </Button>
        </div>
      </form>

      <form action={importCsv} className="flex flex-wrap items-end gap-2 rounded-md border bg-white p-4">
        <div className="space-y-1">
          <Label>CSV取込</Label>
          <Input name="file" type="file" accept=".csv,text/csv" className="bg-white" />
        </div>
        <Button variant="outline" disabled={isPending}>
          <Upload className="mr-2 h-4 w-4" />
          CSVを取り込む
        </Button>
      </form>

      <div className="rounded-md border bg-white p-4">
        <p className="text-sm font-medium">必要な列</p>
        <p className="mt-1 text-xs text-muted-foreground">
          code, label, campaign_type, referrer_name, referrer_email, plan_name, discount_type,
          discount_value, free_until, expires_at, max_redemptions, stripe_coupon_id, status, note
        </p>
      </div>

      {logs.length > 0 && (
        <div className="rounded-md border bg-white p-4">
          <p className="text-sm font-medium">同期ログ</p>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
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
