'use client'

import { useState, useTransition } from 'react'
import { Check, ExternalLink, Sparkles } from 'lucide-react'
import { createCheckoutSession, createCustomerPortalSession, saveBillingProfile } from '@/lib/actions/billing'
import { formatYen, paidPlans, plans, type BillingCycle, type PlanName } from '@/lib/billing/plans'
import type { BillingDocument, BillingProfile } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function BillingSettingsForm({
  profile,
  documents,
}: {
  profile: BillingProfile | null
  documents: BillingDocument[]
}) {
  const [isPending, startTransition] = useTransition()
  const [cycle, setCycle] = useState<BillingCycle>('yearly')
  const currentPlan = (profile?.plan_name ?? 'Free') as PlanName

  function checkout(planName: PlanName) {
    const formData = new FormData()
    formData.set('plan_name', planName)
    formData.set('billing_cycle', cycle)
    formData.set('coupon_code', document.querySelector<HTMLInputElement>('#coupon_code')?.value ?? '')
    startTransition(async () => {
      const result = await createCheckoutSession(formData)
      if (!result.success) {
        toast({ title: '決済を開始できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      window.location.href = result.data.url
    })
  }

  function saveProfile(formData: FormData) {
    startTransition(async () => {
      const result = await saveBillingProfile(formData)
      if (!result.success) {
        toast({ title: '保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '会社情報・請求情報を保存しました' })
    })
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">現在のプラン</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{currentPlan}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.billing_cycle === 'yearly' ? '年額契約' : '月額契約'} / {profile?.plan_status ?? '未契約'}
            </p>
            {profile?.current_period_end && (
              <p className="mt-1 text-sm text-muted-foreground">
                次回更新日: {new Date(profile.current_period_end).toLocaleDateString('ja-JP')}
              </p>
            )}
          </div>
          {profile?.stripe_customer_id && (
            <form action={createCustomerPortalSession}>
              <Button variant="outline">支払い方法・解約を管理</Button>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">プランを選択</h2>
            <p className="text-sm text-muted-foreground">
              年額は11か月分の料金です。途中アップグレードは可能、ダウングレードは次回更新時に反映します。
            </p>
          </div>
          <div className="inline-flex rounded-full border bg-muted p-1">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm ${cycle === 'monthly' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setCycle('monthly')}
            >
              月額
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm ${cycle === 'yearly' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setCycle('yearly')}
            >
              年額
            </button>
          </div>
        </div>

        <div className="mt-4 max-w-sm space-y-1">
          <Label htmlFor="coupon_code">クーポンコード</Label>
          <Input id="coupon_code" className="bg-white" placeholder="コードを入力" autoCapitalize="characters" />
          <p className="text-xs text-muted-foreground">コードを入力して決済へ進むと、Googleシート上の条件を自動照会します。</p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {paidPlans.map(planName => {
            const plan = plans[planName]
            const price = cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
            const monthlyEquivalent = cycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice
            return (
              <div key={plan.name} className={`relative rounded-xl border bg-white p-5 ${plan.recommended ? 'border-primary shadow-md' : ''}`}>
                {plan.recommended && (
                  <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    おすすめ
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.recommended && <Sparkles className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-3 text-3xl font-bold">{formatYen(price)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cycle === 'yearly' ? `月あたり約${formatYen(monthlyEquivalent)}。年額は1か月分お得です。` : '月ごとの契約です。'}
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-5 w-full" disabled={isPending} onClick={() => checkout(plan.name)}>
                  {plan.name === currentPlan ? '契約内容を確認' : `${plan.name}で開始`}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      <details className="rounded-lg border bg-white">
        <summary className="cursor-pointer px-5 py-4 font-medium">会社情報・請求情報</summary>
        <form action={saveProfile} className="grid gap-3 border-t p-5 md:grid-cols-2">
          <div className="space-y-1">
            <Label>会社名・事務所名</Label>
            <Input name="billing_name" defaultValue={profile?.billing_name ?? ''} className="bg-white" />
          </div>
          <div className="space-y-1">
            <Label>請求メール</Label>
            <Input name="billing_email" defaultValue={profile?.billing_email ?? ''} className="bg-white" />
          </div>
          <div className="space-y-1">
            <Label>郵便番号</Label>
            <Input name="postal_code" defaultValue={profile?.postal_code ?? ''} className="bg-white" />
          </div>
          <div className="space-y-1">
            <Label>登録番号</Label>
            <Input name="tax_id" defaultValue={profile?.tax_id ?? ''} className="bg-white" placeholder="T..." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>所在地</Label>
            <Input name="address" defaultValue={profile?.address ?? ''} className="bg-white" />
          </div>
          <div className="md:col-span-2">
            <Button disabled={isPending}>保存</Button>
          </div>
        </form>
      </details>

      <details className="rounded-lg border bg-white">
        <summary className="cursor-pointer px-5 py-4 font-medium">請求履歴・領収書</summary>
        <div className="overflow-hidden border-t">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">日付</th>
                <th className="px-3 py-2 text-left">内容</th>
                <th className="px-3 py-2 text-right">税込</th>
                <th className="px-3 py-2 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {documents.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">Stripe決済後に自動表示されます。</td></tr>
              ) : documents.map(document => (
                <tr key={document.id} className="border-t">
                  <td className="px-3 py-2">{new Date(document.issue_date).toLocaleDateString('ja-JP')}</td>
                  <td className="px-3 py-2">{document.title}</td>
                  <td className="px-3 py-2 text-right">{formatYen(document.amount + document.tax_amount)}</td>
                  <td className="px-3 py-2 text-right">
                    {document.invoice_pdf_url ? (
                      <a href={document.invoice_pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline">
                        ダウンロード <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : document.hosted_invoice_url ? (
                      <a href={document.hosted_invoice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline">
                        表示 <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
