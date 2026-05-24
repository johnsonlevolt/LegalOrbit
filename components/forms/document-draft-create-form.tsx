'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Upload } from 'lucide-react'
import { createDocumentDraft } from '@/lib/actions/document-drafts'
import { toast } from '@/hooks/use-toast'
import type { Case, DocumentTemplate } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  caseId: string
  caseData: Case
  templates: DocumentTemplate[]
  defaultTemplateId?: string
}

export function DocumentDraftCreateForm({ caseId, caseData, templates, defaultTemplateId: initialTemplateId }: Props) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [fileCount, setFileCount] = useState(0)
  const [templateQuery, setTemplateQuery] = useState('')

  const recommendedTemplates = recommendTemplates(templates, caseData)
  const recommendedIds = new Set(recommendedTemplates.map(template => template.id))
  const normalizedQuery = templateQuery.trim().toLowerCase()
  const filteredTemplates = templates.filter(template => {
    if (!normalizedQuery) return true
    return templateSearchText(template).includes(normalizedQuery)
  })
  const defaultTemplateId = initialTemplateId && templates.some(template => template.id === initialTemplateId)
    ? initialTemplateId
    : recommendedTemplates[0]?.id ?? ''

  function handleSubmit(formData: FormData) {
    if (!confirm('添付資料をAI解析に送信します。個人情報・法人情報を含む資料であることを確認したうえで続行しますか？')) return
    startTransition(async () => {
      const result = await createDocumentDraft(caseId, formData)
      if (!result.success) {
        toast({ title: '作成できませんでした', description: result.error, variant: 'destructive' })
        return
      }
      toast({ title: 'AIドラフトを作成しました' })
      router.push(`/cases/${caseId}/drafts/${result.data.id}`)
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">読み込む資料</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">作成名</Label>
              <Input
                id="title"
                name="title"
                defaultValue={`${caseData.name} 書類作成ドラフト`}
                placeholder="例: 建設業許可 新規申請ドラフト"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_id">使用テンプレート</Label>
              <Input
                value={templateQuery}
                onChange={event => setTemplateQuery(event.currentTarget.value)}
                placeholder="業務種別・書類名でテンプレート検索"
                className="mb-2"
              />
              <select
                id="template_id"
                name="template_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={defaultTemplateId}
              >
                <option value="">指定なし</option>
                {recommendedTemplates.length > 0 && (
                  <optgroup label="おすすめ">
                    {recommendedTemplates.map(template => (
                      <option key={`recommended-${template.id}`} value={template.id}>
                        {template.business_type ? `${template.business_type} / ` : ''}{template.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label={normalizedQuery ? '検索結果' : 'すべて'}>
                  {filteredTemplates
                    .filter(template => !recommendedIds.has(template.id))
                    .map(template => (
                      <option key={template.id} value={template.id}>
                        {template.business_type ? `${template.business_type} / ` : ''}{template.name}
                      </option>
                    ))}
                </optgroup>
              </select>
              {recommendedTemplates.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  案件名・業務種別から近いテンプレートを自動で先頭選択しています。
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">添付資料</Label>
            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center hover:bg-muted/50">
              <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">PDF、画像、Word、Excel、テキストを選択</span>
              <span className="mt-1 text-xs text-muted-foreground">複数ファイル可。1ファイル20MBまで。</span>
              <Input
                id="files"
                name="files"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv,.docx,.xlsx"
                onChange={event => setFileCount(event.currentTarget.files?.length ?? 0)}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              {fileCount > 0 ? `${fileCount}件のファイルを選択中` : 'まだファイルが選択されていません'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="extra_instructions">追加指示</Label>
            <Textarea
              id="extra_instructions"
              name="extra_instructions"
              rows={4}
              defaultValue={[
                caseData.business_type ? `業務種別: ${caseData.business_type}` : '',
                caseData.application_type ? `申請区分: ${caseData.application_type}` : '',
                caseData.assignee ? `担当者: ${caseData.assignee}` : '',
              ].filter(Boolean).join('\n')}
              placeholder="例: 法人番号、役員情報、営業所所在地を優先して抽出。不明な項目は質問にしてください。"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isPending ? 'AI解析中...' : 'AIで読み込んでドラフト作成'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/cases/${caseId}?tab=drafts`)}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}

function templateSearchText(template: DocumentTemplate) {
  return [
    template.name,
    template.business_type ?? '',
    template.description ?? '',
    ...(template.document_template_items ?? []).map(item => item.document_name),
  ].join(' ').toLowerCase()
}

function recommendTemplates(templates: DocumentTemplate[], caseData: Case) {
  const queryParts = [
    caseData.name,
    caseData.business_type ?? '',
    caseData.application_type ?? '',
    caseData.memo ?? '',
  ].filter(Boolean)

  const scored = templates.map(template => {
    const haystack = templateSearchText(template)
    const score = queryParts.reduce((total, part) => {
      const words = String(part).toLowerCase().split(/[\s　/・()（）]+/).filter(Boolean)
      return total + words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0)
    }, 0)
    return { template, score }
  })

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.template.name.localeCompare(b.template.name, 'ja'))
    .slice(0, 5)
    .map(item => item.template)
}
