import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordChangeForm } from '@/components/settings/password-change-form'
import { AssigneeSettingsForm } from '@/components/settings/assignee-settings-form'
import { getAssigneeSettings } from '@/lib/actions/assignee-settings'
import { BillingSettingsForm } from '@/components/settings/billing-settings-form'
import { getBillingDocuments, getBillingProfile } from '@/lib/actions/billing'
import { getAllCaseEstimates } from '@/lib/actions/practical-extensions'

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [assignees, billingProfile, billingDocuments, estimates] = await Promise.all([
    getAssigneeSettings(),
    getBillingProfile(),
    getBillingDocuments(),
    getAllCaseEstimates(),
  ])

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-bold">アカウント設定</h1>

      <Card>
        <CardHeader><CardTitle>ユーザー情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-muted-foreground">メールアドレス</dt>
              <dd className="text-sm font-medium">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">ユーザーID</dt>
              <dd className="text-xs text-muted-foreground font-mono">{user.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>担当者設定</CardTitle></CardHeader>
        <CardContent>
          <AssigneeSettingsForm assignees={assignees} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>サブスクリプション・請求情報</CardTitle></CardHeader>
        <CardContent>
          <BillingSettingsForm profile={billingProfile} documents={billingDocuments} estimates={estimates} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>パスワード変更</CardTitle></CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  )
}

