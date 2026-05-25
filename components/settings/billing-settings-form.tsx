'use client'

import { useMemo, useState, useTransition } from 'react'
import { Check, ExternalLink, Sparkles } from 'lucide-react'
import { activateCouponCode, createCheckoutSession, createCustomerPortalSession } from '@/lib/actions/billing'
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
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('Starter')
  const [couponCode, setCouponCode] = useState('')
  const currentPlan = (profile?.plan_name ?? 'Free') as PlanName
  const stripeDocuments = documents.filter(document => (
    document.stripe_invoice_id ||
    document.invoice_pdf_url ||
    document.hosted_invoice_url ||
    document.receipt_url
  ))
  const selectedPeriod = useMemo(() => getContractPeriod(cycle), [cycle])

  function couponFormData(planName = selectedPlan) {
    const formData = new FormData()
    formData.set('plan_name', planName)
    formData.set('billing_cycle', cycle)
    formData.set('coupon_code', couponCode)
    return formData
  }

  function activateCoupon() {
    startTransition(async () => {
      const result = await activateCouponCode(couponFormData())
      if (!result.success) {
        toast({ title: 'クーポンを有効化できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'クーポンを有効化しました', description: result.data.message })
    })
  }

  function checkout(planName: PlanName) {
    setSelectedPlan(planName)
    startTransition(async () => {
      const result = await createCheckoutSession(couponFormData(planName))
      if (!result.success) {
        toast({ title: '決済を開始できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      window.location.href = result.data.url
    })
  }

  function yearlySavings(planName: PlanName) {
    const plan = plans[planName]
    return plan.monthlyPrice * 12 - plan.yearlyPrice
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
            <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
              <p>開始日: {profile?.current_period_start ? new Date(profile.current_period_start).toLocaleDateString('ja-JP') : '-'}</p>
              <p>終了日: {profile?.current_period_end ? new Date(profile.current_period_end).toLocaleDateString('ja-JP') : '-'}</p>
            </div>
          </div>
          {profile?.stripe_customer_id && (
            <form action={createCustomerPortalSession}>
              <Button variant="outline">支払い方法・契約を管理</Button>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">プランを選択</h2>
            <p className="text-sm text-muted-foreground">
              月額は契約日から1か月、年額は契約日から1年の契約です。新規契約に月末締めの日割りはありません。
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              アップグレードは即時反映し、残期間分の差額を日割り請求します。ダウングレードは次回更新日から反映します。
            </p>
          </div>
          <div className="inline-flex rounded-full border bg-muted p-1">
            <button type="button" className={`rounded-full px-4 py-2 text-sm ${cycle === 'monthly' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`} onClick={() => setCycle('monthly')}>月額</button>
            <button type="button" className={`rounded-full px-4 py-2 text-sm ${cycle === 'yearly' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`} onClick={() => setCycle('yearly')}>年額</button>
          </div>
        </div>

        <div className="mt-4 rounded-md border bg-slate-50 p-3 text-sm">
          <p className="font-medium">選択中の契約期間</p>
          <div className="mt-1 grid gap-1 text-muted-foreground sm:grid-cols-2">
            <p>開始日: {selectedPeriod.start}</p>
            <p>終了日: {selectedPeriod.end}</p>
          </div>
        </div>

        <div className="mt-4 max-w-xl space-y-1">
          <Label htmlFor="coupon_code">クーポンコード</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="coupon_code" className="bg-white" value={couponCode} onChange={event => setCouponCode(event.target.value)} />
            <Button type="button" variant="outline" disabled={isPending || !couponCode.trim()} onClick={activateCoupon}>有効化</Button>
          </div>
        </div>

        <div className="mt-5 grid items-stretch gap-4 md:grid-cols-3">
          {paidPlans.map(planName => {
            const plan = plans[planName]
            const displayPrice = cycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice
            return (
              <div key={plan.name} className={`relative flex h-full flex-col rounded-xl border bg-white p-5 ${plan.recommended ? 'border-primary shadow-md' : ''}`}>
                {plan.recommended && <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">おすすめ</div>}
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  {plan.recommended && <Sparkles className="h-4 w-4 text-primary" />}
                </div>
                <p className="mt-3 text-3xl font-bold">{formatYen(displayPrice)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cycle === 'yearly' ? `実質月額。年間総額 ${formatYen(plan.yearlyPrice)}` : '契約日から1か月ごとの契約です。'}
                </p>
                {cycle === 'yearly' && <p className="mt-2 text-sm font-medium text-emerald-700">月額契約より {formatYen(yearlySavings(plan.name))} お得</p>}
                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" /><span>{feature}</span></li>
                  ))}
                </ul>
                <Button className="mt-auto w-full" disabled={isPending} onClick={() => checkout(plan.name)}>
                  {plan.name === currentPlan ? '契約内容を確認' : `${plan.name}で開始`}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      <details className="rounded-lg border bg-white" open>
        <summary className="cursor-pointer px-5 py-4 font-medium">Stripe領収書・請求履歴</summary>
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
              {stripeDocuments.length === 0 ? (
                <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">Stripe決済後に自動表示されます</td></tr>
              ) : stripeDocuments.map(document => (
                <tr key={document.id} className="border-t">
                  <td className="px-3 py-2">{new Date(document.issue_date).toLocaleDateString('ja-JP')}</td>
                  <td className="px-3 py-2">{document.title}</td>
                  <td className="px-3 py-2 text-right">{formatYen(document.amount + document.tax_amount)}</td>
                  <td className="px-3 py-2 text-right">
                    {document.invoice_pdf_url ? (
                      <a href={document.invoice_pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline">PDF<ExternalLink className="h-3 w-3" /></a>
                    ) : document.hosted_invoice_url ? (
                      <a href={document.hosted_invoice_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline">表示<ExternalLink className="h-3 w-3" /></a>
                    ) : document.receipt_url ? (
                      <a href={document.receipt_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline">領収書<ExternalLink className="h-3 w-3" /></a>
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

function getContractPeriod(cycle: BillingCycle) {
  const start = new Date()
  const end = new Date(start)
  if (cycle === 'yearly') end.setFullYear(end.getFullYear() + 1)
  else end.setMonth(end.getMonth() + 1)
  return {
    start: start.toLocaleDateString('ja-JP'),
    end: end.toLocaleDateString('ja-JP'),
  }
}
