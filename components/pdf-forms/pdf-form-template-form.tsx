'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPdfFormTemplate } from '@/lib/actions/pdf-forms'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const DEFAULT_MAPPING = `[
  { "key": "customer", "label": "顧客名", "source": "customers.company_name", "page": 1, "x": 120, "y": 720, "size": 10 },
  { "key": "case_name", "label": "案件名", "source": "name", "page": 1, "x": 120, "y": 700, "size": 10 }
]`

export function PdfFormTemplateForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function submit(formData: FormData) {
    if (!formData.get('field_mappings')) formData.set('field_mappings', DEFAULT_MAPPING)
    startTransition(async () => {
      const result = await createPdfFormTemplate(formData)
      if (!result.success) {
        toast({ title: '登録できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'PDF帳票テンプレートを登録しました' })
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">PDF帳票テンプレート登録</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label>帳票名</Label>
              <Input name="name" className="bg-white" placeholder="例: 一般貨物 許可申請書" />
            </div>
            <div className="space-y-1">
              <Label>業務種別</Label>
              <Input name="business_type" className="bg-white" placeholder="例: 運輸・自動車" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>PDFファイル</Label>
            <Input name="file" type="file" accept="application/pdf,.pdf" required className="bg-white" />
          </div>

          <details className="rounded-md border bg-muted/30 p-3 text-sm">
            <summary className="cursor-pointer font-medium">座標設定を開く</summary>
            <p className="mt-2 text-xs text-muted-foreground">
              PDF帳票は、決まった位置に顧客名や案件名を転記するため座標設定が必要です。通常は触らず、帳票ごとに一度だけ調整します。
            </p>
            <Textarea name="field_mappings" rows={8} defaultValue={DEFAULT_MAPPING} className="mt-3 bg-white font-mono text-xs" />
          </details>

          <Button disabled={isPending}>{isPending ? '登録中...' : '登録'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
