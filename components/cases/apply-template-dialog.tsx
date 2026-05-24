'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, FileText, X } from 'lucide-react'
import { applyTemplateToCase } from '@/lib/actions/document-templates'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Case, DocumentTemplate } from '@/types/database'

interface Props {
  caseId: string
  caseData: Case
  templates: DocumentTemplate[]
}

export function ApplyTemplateDialog({ caseId, caseData, templates }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<DocumentTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const recommendedTemplates = useMemo(() => recommendTemplates(templates, caseData), [templates, caseData])
  const normalizedQuery = query.trim().toLowerCase()

  const visibleTemplates = useMemo(() => {
    return templates.filter(template => {
      if (!normalizedQuery) return true
      return templateSearchText(template).includes(normalizedQuery)
    })
  }, [templates, normalizedQuery])

  const grouped = useMemo(() => {
    return visibleTemplates.reduce<Record<string, DocumentTemplate[]>>((acc, template) => {
      const key = template.business_type ?? 'その他'
      if (!acc[key]) acc[key] = []
      acc[key].push(template)
      return acc
    }, {})
  }, [visibleTemplates])

  async function handleApply() {
    if (!selected) return
    setLoading(true)
    const result = await applyTemplateToCase(caseId, selected.id)
    setLoading(false)

    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }

    toast({
      title: `「${selected.name}」を適用しました`,
      description: `${selected.document_template_items?.length ?? 0}件の書類を追加しました`,
    })
    setOpen(false)
    setSelected(null)
    router.refresh()
  }

  if (templates.length === 0) return null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelected(recommendedTemplates[0] ?? templates[0] ?? null)
          setOpen(true)
        }}
      >
        <FileText className="mr-1.5 h-4 w-4" />
        テンプレートから追加
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setOpen(false); setSelected(null) }} />
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-base font-bold">書類テンプレートを適用</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  テンプレートを選ぶと、必要書類チェックリストへ一括追加します。
                </p>
              </div>
              <button onClick={() => { setOpen(false); setSelected(null) }} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-72 shrink-0 space-y-3 overflow-y-auto border-r bg-gray-50 p-3">
                <Input
                  value={query}
                  onChange={event => setQuery(event.currentTarget.value)}
                  placeholder="テンプレート検索"
                  className="h-9 bg-white"
                />

                {recommendedTemplates.length > 0 && !normalizedQuery && (
                  <TemplateListGroup
                    title="おすすめ"
                    templates={recommendedTemplates}
                    selectedId={selected?.id}
                    onSelect={setSelected}
                    recommended
                  />
                )}

                {Object.entries(grouped).map(([category, list]) => (
                  <TemplateListGroup
                    key={category}
                    title={category}
                    templates={list}
                    selectedId={selected?.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {!selected ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                    <FileText className="mb-2 h-10 w-10 opacity-30" />
                    <p className="text-sm">左のリストからテンプレートを選択してください。</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold">{selected.name}</h3>
                      {selected.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{selected.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.business_type && (
                          <span className="rounded border bg-gray-50 px-2 py-0.5 text-xs">{selected.business_type}</span>
                        )}
                        <span className="rounded border bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                          計 {selected.document_template_items?.length ?? 0} 件
                        </span>
                        <span className="rounded border bg-red-50 px-2 py-0.5 text-xs text-red-700">
                          必須 {selected.document_template_items?.filter(item => item.required).length ?? 0} 件
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {(selected.document_template_items ?? [])
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map(item => (
                          <div key={item.id} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${item.required ? 'text-red-500' : 'text-gray-300'}`} />
                            <span className={item.required ? 'font-medium' : 'text-gray-600'}>
                              {item.document_name}
                              {item.required && <span className="ml-1.5 text-[10px] font-normal text-red-600">必須</span>}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {selected
                  ? `「${selected.name}」の書類 ${selected.document_template_items?.length ?? 0}件を現在のチェックリストに追加します。`
                  : 'テンプレートを選択すると内容が表示されます。'}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setOpen(false); setSelected(null) }}>
                  キャンセル
                </Button>
                <Button size="sm" onClick={handleApply} disabled={!selected || loading}>
                  {loading ? '適用中...' : '追加する'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TemplateListGroup({
  title,
  templates,
  selectedId,
  onSelect,
  recommended = false,
}: {
  title: string
  templates: DocumentTemplate[]
  selectedId?: string
  onSelect: (template: DocumentTemplate) => void
  recommended?: boolean
}) {
  return (
    <div>
      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-0.5">
        {templates.map(template => (
          <button
            key={`${recommended ? 'recommended-' : ''}${template.id}`}
            onClick={() => onSelect(template)}
            className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
              selectedId === template.id
                ? 'bg-primary text-primary-foreground'
                : recommended
                  ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="line-clamp-2 leading-tight">{template.name}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        ))}
      </div>
    </div>
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
