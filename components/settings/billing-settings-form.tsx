'use client'

import { useMemo, useState, useTransition } from 'react'
import { Check, ExternalLink, Plus, Sparkles, Trash2 } from 'lucide-react'
import {
  activateCouponCode,
  createCheckoutSession,
  createCustomerPortalSession,
  markBillingDocumentPaid,
  saveBillingProfile,
} from '@/lib/actions/billing'
import { formatYen, paidPlans, plans, type BillingCycle, type PlanName } from '@/lib/billing/plans'
import type { BankAccount, BillingDocument, BillingProfile, CaseEstimate } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function BillingSettingsForm({
  profile,
  documents,
  estimates,
}: {
  profile: BillingProfile | null
  documents: BillingDocument[]
  estimates: CaseEstimate[]
}) {
  const [isPending, startTransition] = useTransition()
  const [cycle, setCycle] = useState<BillingCycle>('yearly')
  const [selectedPlan, setSelectedPlan] = useState<PlanName>('Starter')
  const [couponCode, setCouponCode] = useState('')
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(profile?.bank_accounts?.length ? profile.bank_accounts : [])
  const [documentType, setDocumentType] = useState('all')
  const [documentMonth, setDocumentMonth] = useState('all')
  const [documentRecipient, setDocumentRecipient] = useState('all')
  const currentPlan = (profile?.plan_name ?? 'Free') as PlanName

  const ledgerItems = useMemo(() => {
    const estimateItems = estimates.map(estimate => ({
      id: estimate.id,
      type: 'estimate' as const,
      issueDate: estimate.issued_at ?? estimate.created_at.slice(0, 10),
      recipientName: estimate.recipient_name || estimate.cases?.customers?.company_name || 'お客様',
      title: estimate.title,
      amount: estimate.fee_amount + estimate.expense_amount + estimate.tax_amount,
      status: estimate.status,
      href: `/cases/${estimate.case_id}/estimates/${estimate.id}/print`,
      external: false,
      document: undefined,
    }))
    const documentItems = documents.map(document => ({
      id: document.id,
      type: document.document_type,
      issueDate: document.issue_date,
      recipientName: document.recipient_name,
      title: document.title,
      amount: document.amount + document.tax_amount,
      status: document.status,
      href: document.invoice_pdf_url || `/settings/account/billing/${document.id}/print`,
      external: Boolean(document.invoice_pdf_url),
      document,
    }))
    return [...estimateItems, ...documentItems].sort((a, b) => b.issueDate.localeCompare(a.issueDate))
  }, [documents, estimates])

  const months = useMemo(() => {
    const values = new Set(ledgerItems.map(item => item.issueDate.slice(0, 7)))
    return Array.from(values).sort().reverse()
  }, [ledgerItems])

  const recipients = useMemo(() => {
    const values = new Set(ledgerItems.map(item => item.recipientName).filter(Boolean))
    return Array.from(values).sort((a, b) => a.localeCompare(b, 'ja'))
  }, [ledgerItems])

  const filteredDocuments = ledgerItems.filter(item => {
    if (documentType !== 'all' && item.type !== documentType) return false
    if (documentMonth !== 'all' && item.issueDate.slice(0, 7) !== documentMonth) return false
    if (documentRecipient !== 'all' && item.recipientName !== documentRecipient) return false
    return true
  })

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

  function saveProfile(formData: FormData) {
    formData.set('bank_accounts', JSON.stringify(bankAccounts))
    startTransition(async () => {
      const result = await saveBillingProfile(formData)
      if (!result.success) {
        toast({ title: '保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '会社情報と振込口座を保存しました' })
    })
  }

  function addBankAccount() {
    setBankAccounts(current => [
      ...current,
      {
        id: crypto.randomUUID(),
        label: '',
        bank_name: '',
        branch_name: '',
        account_type: '普通',
        account_number: '',
        account_holder: '',
      },
    ])
  }

  function updateBankAccount(index: number, values: Partial<BankAccount>) {
    setBankAccounts(current => current.map((account, i) => i === index ? { ...account, ...values } : account))
  }

  function removeBankAccount(index: number) {
    setBankAccounts(current => current.filter((_, i) => i !== index))
  }

  function togglePaid(document: BillingDocument) {
    startTransition(async () => {
      const result = await markBillingDocumentPaid(document.id, document.status !== 'paid')
      if (!result.success) {
        toast({ title: '着金状態を更新できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: document.status === 'paid' ? '未着金に戻しました' : '着金済みにしました' })
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
            {profile?.current_period_end && (
              <p className="mt-1 text-sm text-muted-foreground">
                次回更新日: {new Date(profile.current_period_end).toLocaleDateString('ja-JP')}
              </p>
            )}
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
            <p className="text-sm text-muted-foreground">年額は11か月分の料金で12か月利用できます。途中アップグレードは可能、ダウングレードは次回更新時に反映します。</p>
          </div>
          <div className="inline-flex rounded-full border bg-muted p-1">
            <button type="button" className={`rounded-full px-4 py-2 text-sm ${cycle === 'monthly' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`} onClick={() => setCycle('monthly')}>月額</button>
            <button type="button" className={`rounded-full px-4 py-2 text-sm ${cycle === 'yearly' ? 'bg-white shadow-sm' : 'text-muted-foreground'}`} onClick={() => setCycle('yearly')}>年額</button>
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
                <p className="mt-1 text-sm text-muted-foreground">{cycle === 'yearly' ? `実質月額。年額合計 ${formatYen(plan.yearlyPrice)}` : '月ごとの契約です。'}</p>
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
        <summary className="cursor-pointer px-5 py-4 font-medium">会社情報・請求書設定</summary>
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
            <Label>電話番号</Label>
            <Input name="phone" defaultValue={profile?.phone ?? ''} className="bg-white" />
          </div>
          <div className="space-y-1">
            <Label>郵便番号</Label>
            <Input name="postal_code" defaultValue={profile?.postal_code ?? ''} className="bg-white" />
          </div>
          <div className="space-y-1">
            <Label>適格請求書発行事業者 登録番号</Label>
            <Input name="tax_id" defaultValue={profile?.tax_id ?? ''} className="bg-white" placeholder="T1234567890123" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>所在地</Label>
            <Input name="address" defaultValue={profile?.address ?? ''} className="bg-white" />
          </div>

          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">振込口座</p>
                <p className="text-xs text-muted-foreground">請求書発行時に表示する口座を複数登録できます。</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addBankAccount}><Plus className="mr-1 h-4 w-4" />追加</Button>
            </div>
            {bankAccounts.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">振込口座は未登録です。</div>
            ) : bankAccounts.map((account, index) => (
              <div key={account.id} className="grid gap-2 rounded-md border bg-slate-50 p-3 md:grid-cols-6">
                <Input className="bg-white md:col-span-2" placeholder="表示名 例: メイン口座" value={account.label} onChange={event => updateBankAccount(index, { label: event.target.value })} />
                <Input className="bg-white md:col-span-2" placeholder="銀行名" value={account.bank_name} onChange={event => updateBankAccount(index, { bank_name: event.target.value })} />
                <Input className="bg-white md:col-span-2" placeholder="支店名" value={account.branch_name} onChange={event => updateBankAccount(index, { branch_name: event.target.value })} />
                <Select value={account.account_type} onValueChange={value => updateBankAccount(index, { account_type: value })}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="普通">普通</SelectItem>
                    <SelectItem value="当座">当座</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="bg-white md:col-span-2" placeholder="口座番号" value={account.account_number} onChange={event => updateBankAccount(index, { account_number: event.target.value })} />
                <Input className="bg-white md:col-span-2" placeholder="口座名義" value={account.account_holder} onChange={event => updateBankAccount(index, { account_holder: event.target.value })} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeBankAccount(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div className="md:col-span-2">
            <Button disabled={isPending}>保存</Button>
          </div>
        </form>
      </details>

      <details className="rounded-lg border bg-white" open>
        <summary className="cursor-pointer px-5 py-4 font-medium">見積書・請求書・領収書一覧</summary>
        <div className="space-y-3 border-t p-5">
          <div className="grid gap-2 md:grid-cols-3">
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="estimate">見積書</SelectItem>
                <SelectItem value="invoice">請求書</SelectItem>
                <SelectItem value="receipt">領収書</SelectItem>
              </SelectContent>
            </Select>
            <Select value={documentMonth} onValueChange={setDocumentMonth}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="月別" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての月</SelectItem>
                {months.map(month => <SelectItem key={month} value={month}>{month}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={documentRecipient} onValueChange={setDocumentRecipient}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="会社別" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての会社</SelectItem>
                {recipients.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">発行日</th>
                  <th className="px-3 py-2 text-left">種別</th>
                  <th className="px-3 py-2 text-left">宛名</th>
                  <th className="px-3 py-2 text-left">内容</th>
                  <th className="px-3 py-2 text-right">税込</th>
                  <th className="px-3 py-2 text-center">着金</th>
                  <th className="px-3 py-2 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredDocuments.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">該当する帳票はありません。</td></tr>
                ) : filteredDocuments.map(item => (
                  <tr key={`${item.type}-${item.id}`} className="border-t">
                    <td className="px-3 py-2">{new Date(item.issueDate).toLocaleDateString('ja-JP')}</td>
                    <td className="px-3 py-2">{item.type === 'invoice' ? '請求書' : item.type === 'receipt' ? '領収書' : '見積書'}</td>
                    <td className="px-3 py-2">{item.recipientName}</td>
                    <td className="px-3 py-2">{item.title}</td>
                    <td className="px-3 py-2 text-right">{formatYen(item.amount)}</td>
                    <td className="px-3 py-2 text-center">
                      {item.type === 'invoice' && item.document ? (
                        <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => togglePaid(item.document)} disabled={isPending}>
                          {item.status === 'paid' ? '着金済み' : '未着金'}
                        </button>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {item.external ? (
                        <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium underline">PDF<ExternalLink className="h-3 w-3" /></a>
                      ) : (
                        <a href={item.href} className="text-xs font-medium underline">表示</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  )
}
