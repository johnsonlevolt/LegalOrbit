'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { saveBillingProfile } from '@/lib/actions/billing'
import type { BankAccount, BillingProfile } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function CompanyProfileForm({ profile }: { profile: BillingProfile | null }) {
  const [isPending, startTransition] = useTransition()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(profile?.bank_accounts?.length ? profile.bank_accounts : [])

  function save(formData: FormData) {
    formData.set('bank_accounts', JSON.stringify(bankAccounts))
    startTransition(async () => {
      const result = await saveBillingProfile(formData)
      if (!result.success) {
        toast({ title: '会社情報を保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '会社情報を保存しました' })
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

  return (
    <form action={save} className="mt-5 grid gap-3 border-t pt-5 md:grid-cols-2">
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
        <Label>適格請求書発行事業者登録番号</Label>
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
            <p className="text-xs text-muted-foreground">請求書に表示する口座を複数登録できます。</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addBankAccount}>
            <Plus className="mr-1 h-4 w-4" />追加
          </Button>
        </div>
        {bankAccounts.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">振込口座は未登録です</div>
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
        <Button disabled={isPending}>会社情報を保存</Button>
      </div>
    </form>
  )
}
