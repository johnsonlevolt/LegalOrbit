import Link from 'next/link'
import { Plus, Pencil, FileText, Download } from 'lucide-react'
import { getDocumentTemplates } from '@/lib/actions/document-templates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteTemplateButton } from '@/components/settings/delete-template-button'
import { SeedTemplatesButton } from '@/components/settings/seed-templates-button'
import { cn } from '@/lib/utils'
import type { DocumentTemplate } from '@/types/database'
import { AutoSeedTemplates } from '@/components/settings/auto-seed-templates'

const templateTabs = [
  { id: 'all', label: 'すべて', description: '全分野', keywords: [] },
  { id: 'transport', label: '運輸', description: '貨物・旅客・変更届', keywords: ['運輸', '貨物', '旅客', '軽貨物', '自動車運送', '車庫', '登録'] },
  { id: 'construction', label: '建設・産廃', description: '建設業・廃棄物', keywords: ['建設', '産業廃棄物', '宅建', '不動産'] },
  { id: 'immigration', label: '入管・国籍', description: '在留・永住・帰化', keywords: ['入管', '外国人', '在留', '帰化', '国籍'] },
  { id: 'food', label: '営業許可', description: '飲食・風俗・酒類・古物', keywords: ['飲食', '風俗', '酒類', '古物', '営業'] },
  { id: 'life', label: '生活衛生・薬事', description: '旅館・民泊・薬局・医療法人', keywords: ['生活衛生', '旅館', '民泊', '薬事', '薬局', '医療'] },
  { id: 'land', label: '農地', description: '農地法・農業', keywords: ['農地', '農業'] },
  { id: 'inheritance', label: '相続・法人', description: '遺言・法人設立', keywords: ['相続', '遺言', '法人設立', '一般社団'] },
  { id: 'civil', label: '市民法務', description: '契約・内容証明・後見', keywords: ['契約', '内容証明', '後見', '市民法務'] },
  { id: 'welfare', label: '福祉・補助金', description: '介護・NPO・補助金', keywords: ['介護', '福祉', 'NPO', '補助金', '助成金'] },
  { id: 'drone', label: 'ドローン', description: '航空法・DIPS', keywords: ['ドローン', '航空'] },
  { id: 'other', label: 'その他', description: '未分類・手動追加', keywords: [] },
] as const

type TemplateTabId = (typeof templateTabs)[number]['id']

function matchesTab(template: DocumentTemplate, tabId: TemplateTabId) {
  if (tabId === 'all') return true
  const text = [template.name, template.business_type ?? '', template.description ?? ''].join(' ')
  if (tabId === 'other') {
    return !templateTabs
      .filter(tab => tab.id !== 'all' && tab.id !== 'other')
      .some(tab => tab.keywords.some(keyword => text.includes(keyword)))
  }
  const tab = templateTabs.find(item => item.id === tabId)
  return Boolean(tab?.keywords.some(keyword => text.includes(keyword)))
}

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function TemplatesPage(props: Props) {
  const searchParams = await props.searchParams
  const templates = await getDocumentTemplates()

  const selectedTab = templateTabs.some(tab => tab.id === searchParams.category)
    ? (searchParams.category as TemplateTabId)
    : 'all'
  const q = (searchParams.q ?? '').trim().toLowerCase()
  const visibleTemplates = templates.filter(template => {
    if (!matchesTab(template, selectedTab)) return false
    if (!q) return true
    return (
      template.name.toLowerCase().includes(q) ||
      (template.business_type ?? '').toLowerCase().includes(q) ||
      (template.description ?? '').toLowerCase().includes(q) ||
      (template.document_template_items ?? []).some(item => item.document_name.toLowerCase().includes(q))
    )
  })

  const grouped = visibleTemplates.reduce<Record<string, typeof visibleTemplates>>((acc, template) => {
    const key = template.business_type ?? 'その他'
    if (!acc[key]) acc[key] = []
    acc[key].push(template)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <AutoSeedTemplates enabled={templates.length < 20} />
        <div>
          <h1 className="text-2xl font-bold">書類テンプレート</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            行政書士業務の分野ごとに、案件へ一括適用できる必要書類リストを管理します。
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <SeedTemplatesButton />
          <Button asChild>
            <Link href="/settings/templates/new">
              <Plus className="mr-2 h-4 w-4" />新規作成
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-white p-3">
        <form action="/settings/templates" className="flex flex-wrap gap-2">
          {selectedTab !== 'all' && <input type="hidden" name="category" value={selectedTab} />}
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="テンプレート名・業務種別・書類名で検索"
            className="h-10 min-w-64 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" variant="outline">検索</Button>
          {(searchParams.q || selectedTab !== 'all') && (
            <Button asChild type="button" variant="ghost">
              <Link href="/settings/templates">クリア</Link>
            </Button>
          )}
        </form>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {templateTabs.map(tab => {
            const count = templates.filter(template => matchesTab(template, tab.id)).length
            const active = selectedTab === tab.id
            return (
              <Link
                key={tab.id}
                href={tab.id === 'all' ? '/settings/templates' : `/settings/templates?category=${tab.id}`}
                className={cn(
                  'rounded-md border px-3 py-2 transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-white hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{tab.label}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs', active ? 'bg-white/20' : 'bg-muted text-muted-foreground')}>
                    {count}
                  </span>
                </div>
                <p className={cn('mt-1 text-xs', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{tab.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-1 text-muted-foreground">テンプレートがまだ登録されていません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {visibleTemplates.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">この条件のテンプレートはありません</p>
              </CardContent>
            </Card>
          )}
          {Object.entries(grouped).map(([category, list]) => (
            <div key={category}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <span className="flex-1 border-b border-border" />
                <span>{category}</span>
                <span className="flex-1 border-b border-border" />
              </h2>
              <div className="grid gap-3">
                {list.map(template => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              書類 {template.document_template_items?.length ?? 0}件
                            </span>
                            {template.description && <span className="text-xs text-muted-foreground">・{template.description}</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-1">
                          <Button asChild variant="outline" size="sm" className="h-8 px-2">
                            <Link href={`/settings/templates/${template.id}/download?format=word`}>
                              <Download className="mr-1 h-3.5 w-3.5" />DOCX
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="h-8 px-2">
                            <Link href={`/settings/templates/${template.id}/download?format=excel`}>
                              XLSX
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="h-8 px-2">
                            <Link href={`/settings/templates/${template.id}/download?format=pdf`}>
                              PDF
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/settings/templates/${template.id}/edit`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <DeleteTemplateButton templateId={template.id} />
                        </div>
                      </div>
                    </CardHeader>
                    {(template.document_template_items?.length ?? 0) > 0 && (
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1.5">
                          {(template.document_template_items ?? [])
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map(item => (
                              <span
                                key={item.id}
                                className={cn(
                                  'rounded border px-2 py-0.5 text-xs',
                                  item.required
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-gray-200 bg-gray-50 text-gray-600'
                                )}
                              >
                                {item.required && '必須: '}{item.document_name}
                              </span>
                            ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
