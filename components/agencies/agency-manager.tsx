'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import type { Agency, AgencyRule } from '@/types/database'
import { createAgency, deleteAgency } from '@/lib/actions/agencies'
import { createAgencyRule } from '@/lib/actions/practical-extensions'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AgencyManager({ agencies, rules = [] }: { agencies: Agency[]; rules?: AgencyRule[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createAgency(formData)
      if (!result.success) {
        toast({ title: '保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '提出先を保存しました' })
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('この提出先を削除しますか？')) return
    startTransition(async () => {
      const result = await deleteAgency(id)
      if (!result.success) toast({ title: '削除できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }

  function createRule(formData: FormData) {
    startTransition(async () => {
      const result = await createAgencyRule(formData)
      if (!result.success) {
        toast({ title: 'ルールを保存できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '提出先ルールを保存しました' })
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-base">提出先登録</CardTitle></CardHeader>
          <CardContent>
            <form action={create} className="space-y-2">
              <Input name="name" className="bg-white" placeholder="提出先名 例: 東京運輸支局" />
              <Input name="department" className="bg-white" placeholder="部署 例: 輸送担当" />
              <Input name="postal_code" className="bg-white" placeholder="郵便番号" />
              <Input name="address" className="bg-white" placeholder="所在地" />
              <Input name="phone" className="bg-white" placeholder="電話番号" />
              <Input name="reception_hours" className="bg-white" placeholder="受付時間" />
              <Textarea name="memo" className="bg-white" placeholder="必要部数、予約方法、担当者メモなど" rows={4} />
              <Button type="submit" disabled={isPending}>保存</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {agencies.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">提出先はまだ登録されていません</CardContent></Card>
          ) : agencies.map(agency => (
            <Card key={agency.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{agency.name}</p>
                  <p className="text-sm text-muted-foreground">{agency.department ?? ''}</p>
                  <p className="text-sm">{agency.address ?? ''}</p>
                  <p className="text-sm text-muted-foreground">{agency.phone ?? ''}{agency.reception_hours ? ` / ${agency.reception_hours}` : ''}</p>
                  {agency.memo && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{agency.memo}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(agency.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">提出先別ルール</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <form action={createRule} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
            <select name="agency_id" className="h-10 rounded-md border border-input bg-white px-3 text-sm">
              <option value="">提出先未指定</option>
              {agencies.map(agency => <option key={agency.id} value={agency.id}>{agency.name}</option>)}
            </select>
            <Input name="business_type" className="bg-white" placeholder="業務種別" />
            <Input name="title" className="bg-white" placeholder="ルール名" />
            <Button disabled={isPending}>追加</Button>
            <Textarea name="detail" className="bg-white md:col-span-4" placeholder="必要部数、独自様式、受付時間、注意点など" />
            <Textarea name="checklist" className="bg-white md:col-span-2" placeholder="チェック項目を1行ずつ入力" />
            <Input name="effective_from" className="bg-white" type="date" />
            <Input name="source_url" className="bg-white" placeholder="根拠URL 任意" />
          </form>
          <div className="grid gap-2 md:grid-cols-2">
            {rules.map(rule => (
              <div key={rule.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{rule.title}</p>
                <p className="text-xs text-muted-foreground">{rule.agencies?.name ?? '提出先未指定'} {rule.business_type ? `/ ${rule.business_type}` : ''}</p>
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{rule.detail}</p>
                {rule.checklist?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                    {rule.checklist.map(item => <li key={item.label}>{item.label}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
