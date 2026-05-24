'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Send } from 'lucide-react'
import { saveNotificationSetting, sendDeadlineWebhookNow } from '@/lib/actions/notification-settings'
import type { NotificationSetting } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const dayOptions = [
  { value: 0, label: '当日' },
  { value: 1, label: '1日前' },
  { value: 3, label: '3日前' },
  { value: 7, label: '7日前' },
  { value: 14, label: '14日前' },
  { value: 30, label: '30日前' },
]

export function NotificationSettingsForm({ setting }: { setting: NotificationSetting | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const selectedDays = new Set(setting?.days_before ?? [7, 3, 1])

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await saveNotificationSetting(formData)
      if (!result.success) {
        toast({ title: '保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '通知設定を保存しました' })
      router.refresh()
    })
  }

  function testSend() {
    startTransition(async () => {
      const result = await sendDeadlineWebhookNow()
      if (!result.success) {
        toast({ title: '送信できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'Webhookへ送信しました', description: `${result.data.count}件の案件を通知しました` })
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          期限通知
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={save} className="space-y-5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input name="enabled" type="checkbox" defaultChecked={setting?.enabled ?? false} />
            通知を有効にする
          </label>

          <div className="space-y-2">
            <p className="text-sm font-medium">通知タイミング</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {dayOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm"
                >
                  <input
                    name="days_before"
                    type="checkbox"
                    value={option.value}
                    defaultChecked={selectedDays.has(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                name="custom_days_before"
                inputMode="numeric"
                placeholder="任意の日数を追加 例: 10"
                className="max-w-xs"
              />
              <span className="text-xs text-muted-foreground">申請予定日の何日前に通知するか</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Webhook URL</label>
            <Input name="webhook_url" defaultValue={setting?.webhook_url ?? ''} placeholder="Slack / Teams / LINE連携用Webhook URL" />
            <p className="text-xs text-muted-foreground">チャット通知を使う場合に設定します。</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">通知先メール</label>
            <Input name="email_to" defaultValue={setting?.email_to ?? ''} placeholder="office@example.com" />
            <p className="text-xs text-muted-foreground">メール送信機能を追加する場合の通知先として保存します。</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={isPending}>保存</Button>
            <Button type="button" variant="outline" onClick={testSend} disabled={isPending}>
              <Send className="mr-2 h-4 w-4" />
              Webhookテスト送信
            </Button>
          </div>
          {setting?.last_sent_at && (
            <p className="text-xs text-muted-foreground">最終送信: {new Date(setting.last_sent_at).toLocaleString('ja-JP')}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
