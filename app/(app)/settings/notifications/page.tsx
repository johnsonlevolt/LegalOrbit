import { getNotificationSetting } from '@/lib/actions/notification-settings'
import { NotificationSettingsForm } from '@/components/settings/notification-settings-form'

export default async function NotificationsPage() {
  const setting = await getNotificationSetting()
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">通知設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          申請予定日が近い案件を、指定したタイミングでWebhook通知します。
        </p>
      </div>
      <NotificationSettingsForm setting={setting} />
    </div>
  )
}
