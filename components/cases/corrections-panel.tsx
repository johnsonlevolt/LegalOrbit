'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import type { CaseCorrection, CaseCorrectionStatus } from '@/types/database'
import { createCaseCorrection, updateCaseCorrectionStatus } from '@/lib/actions/corrections'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function CorrectionsPanel({ caseId, corrections }: { caseId: string; corrections: CaseCorrection[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const openCorrections = corrections.filter(item => item.status !== 'done')

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createCaseCorrection(caseId, formData)
      if (!result.success) {
        toast({ title: '補正を登録できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: '補正を登録しました' })
      router.refresh()
    })
  }

  function update(id: string, status: CaseCorrectionStatus) {
    startTransition(async () => {
      const result = await updateCaseCorrectionStatus(id, status)
      if (!result.success) toast({ title: '更新できませんでした', description: result.error, variant: 'destructive' })
      else router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">補正管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <form action={create} className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]">
          <Input name="title" placeholder="補正内容 例: 役員住所の確認" />
          <Input name="due_date" type="date" />
          <Input name="agency_staff" placeholder="役所担当者" />
          <Button type="submit" disabled={isPending}>追加</Button>
          <Input name="detail" placeholder="詳細メモ" className="md:col-span-4" />
        </form>
        {corrections.length === 0 ? (
          <p className="text-sm text-muted-foreground">補正は登録されていません</p>
        ) : (
          <div className="space-y-2">
            {corrections.map(item => (
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.due_date ? `期限: ${item.due_date}` : '期限未設定'}
                      {item.agency_staff ? ` / 担当: ${item.agency_staff}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'done' ? 'secondary' : item.status === 'working' ? 'default' : 'outline'}>
                      {item.status === 'done' ? '完了' : item.status === 'working' ? '対応中' : '未対応'}
                    </Badge>
                    {item.status !== 'working' && item.status !== 'done' && (
                      <Button type="button" variant="outline" size="sm" onClick={() => update(item.id, 'working')}>対応中</Button>
                    )}
                    {item.status !== 'done' && (
                      <Button type="button" size="sm" onClick={() => update(item.id, 'done')}>完了</Button>
                    )}
                  </div>
                </div>
                {item.detail && <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{item.detail}</p>}
              </div>
            ))}
          </div>
        )}
        {openCorrections.length > 0 && (
          <p className="text-xs text-orange-600">未完了の補正が {openCorrections.length} 件あります。</p>
        )}
      </CardContent>
    </Card>
  )
}
