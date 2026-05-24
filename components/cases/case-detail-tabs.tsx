'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2, FileText, CheckSquare, Send, Sparkles } from 'lucide-react'
import type { Case, Vehicle, Office, Garage, Person, DocumentCheck, DocumentDraft, CaseFile } from '@/types/database'
import { deleteVehicle } from '@/lib/actions/vehicles'
import { deleteOffice } from '@/lib/actions/offices'
import { deleteGarage } from '@/lib/actions/garages'
import { deletePerson } from '@/lib/actions/people'
import { bulkUpdateDocumentChecks, toggleDocumentCheck, deleteDocumentCheck } from '@/lib/actions/document-checks'
import { toast } from '@/hooks/use-toast'
import type { DocumentTemplate } from '@/types/database'
import { ApplyTemplateDialog } from './apply-template-dialog'

const TABS = [
  { value: 'basic', label: '基本情報' },
  { value: 'vehicles', label: '車両' },
  { value: 'offices', label: '営業所' },
  { value: 'garages', label: '車庫' },
  { value: 'people', label: '人員' },
  { value: 'documents', label: '添付書類' },
  { value: 'drafts', label: '書類作成' },
  { value: 'memo', label: 'メモ' },
]

const TAB_LABELS: Record<string, string> = {
  basic: '基本情報',
  vehicles: '車両',
  offices: '営業所',
  garages: '車庫',
  people: '人員',
  documents: '添付書類',
  drafts: '書類作成',
  memo: 'メモ',
}

interface Props {
  caseId: string
  caseData: Case
  activeTab: string
  vehicles: Vehicle[]
  offices: Office[]
  garages: Garage[]
  people: Person[]
  documentChecks: DocumentCheck[]
  documentDrafts: DocumentDraft[]
  caseFiles: CaseFile[]
  templates?: DocumentTemplate[]
}

export function CaseDetailTabs({ caseId, caseData, activeTab, vehicles, offices, garages, people, documentChecks, documentDrafts, caseFiles, templates = [] }: Props) {
  const router = useRouter()
  const [currentTab, setCurrentTab] = useState(activeTab)

  function handleTabChange(value: string) {
    setCurrentTab(value)
    window.history.replaceState(null, '', `/cases/${caseId}?tab=${value}`)
  }

  async function handleDeleteVehicle(id: string) {
    if (!confirm('この車両を削除しますか？')) return
    const result = await deleteVehicle(id)
    if (!result.success) toast({ title: 'エラー', description: result.error, variant: 'destructive' })
    else { toast({ title: '削除しました' }); router.refresh() }
  }

  async function handleDeleteOffice(id: string) {
    if (!confirm('この営業所を削除しますか？')) return
    const result = await deleteOffice(id)
    if (!result.success) toast({ title: 'エラー', description: result.error, variant: 'destructive' })
    else { toast({ title: '削除しました' }); router.refresh() }
  }

  async function handleDeleteGarage(id: string) {
    if (!confirm('この車庫を削除しますか？')) return
    const result = await deleteGarage(id)
    if (!result.success) toast({ title: 'エラー', description: result.error, variant: 'destructive' })
    else { toast({ title: '削除しました' }); router.refresh() }
  }

  async function handleDeletePerson(id: string) {
    if (!confirm('この人員を削除しますか？')) return
    const result = await deletePerson(id)
    if (!result.success) toast({ title: 'エラー', description: result.error, variant: 'destructive' })
    else { toast({ title: '削除しました' }); router.refresh() }
  }

  async function handleToggleDoc(id: string, field: 'obtained' | 'verified', current: boolean) {
    const result = await toggleDocumentCheck(id, field, !current)
    if (!result.success) toast({ title: 'エラー', description: result.error, variant: 'destructive' })
    else router.refresh()
  }

  async function handleDeleteDoc(id: string) {
    if (!confirm('この書類チェックを削除しますか？')) return
    const result = await deleteDocumentCheck(id)
    if (!result.success) toast({ title: 'エラー', description: result.error, variant: 'destructive' })
    else { toast({ title: '削除しました' }); router.refresh() }
  }

  async function handleBulkDocUpdate(mode: 'required_obtained' | 'obtained_verified') {
    const result = await bulkUpdateDocumentChecks(caseId, mode)
    if (!result.success) {
      toast({ title: 'エラー', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: `${result.data.count}件を更新しました` })
    router.refresh()
  }


  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList className="flex-wrap h-auto">
        {TABS.map(t => (
          <TabsTrigger key={t.value} value={t.value}>{TAB_LABELS[t.value] ?? t.label}</TabsTrigger>
        ))}
      </TabsList>

      {/* 基本情報 */}
      <TabsContent value="basic">
        <Card>
          <CardHeader><CardTitle>基本情報</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: '顧客', value: caseData.customers?.company_name },
                { label: '案件名', value: caseData.name },
                { label: '業務種別', value: caseData.business_type },
                { label: '申請区分', value: caseData.application_type },
                { label: 'ステータス', value: caseData.status },
                { label: '担当者', value: caseData.assignee },
                { label: '受任日', value: caseData.accepted_date },
                { label: '申請予定日', value: caseData.planned_submission_date },
                { label: '申請日', value: caseData.submission_date },
                { label: '完了日', value: caseData.completion_date },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm mt-0.5">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </TabsContent>

      {/* 車両 */}
      <TabsContent value="vehicles">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href={`/cases/${caseId}/vehicles/new`}>
                <Plus className="mr-2 h-4 w-4" />車両追加
              </Link>
            </Button>
          </div>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>登録番号</TableHead>
                  <TableHead>車名</TableHead>
                  <TableHead>型式</TableHead>
                  <TableHead>区分</TableHead>
                  <TableHead>車検満了日</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">車両が登録されていません</TableCell></TableRow>
                ) : vehicles.map(v => (
                  <TableRow key={v.id}>
                    <TableCell>{v.registration_number ?? '—'}</TableCell>
                    <TableCell>{v.vehicle_name ?? '—'}</TableCell>
                    <TableCell>{v.model ?? '—'}</TableCell>
                    <TableCell>{v.ownership_type ?? '—'}</TableCell>
                    <TableCell>{v.inspection_expiry_date ?? '—'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/cases/${caseId}/vehicles/${v.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(v.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>

      {/* 営業所 */}
      <TabsContent value="offices">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href={`/cases/${caseId}/offices/new`}>
                <Plus className="mr-2 h-4 w-4" />営業所追加
              </Link>
            </Button>
          </div>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>所在地</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>面積</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offices.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">営業所が登録されていません</TableCell></TableRow>
                ) : offices.map(o => (
                  <TableRow key={o.id}>
                    <TableCell>{o.name}</TableCell>
                    <TableCell>{o.address ?? '—'}</TableCell>
                    <TableCell>{o.phone ?? '—'}</TableCell>
                    <TableCell>{o.area ?? '—'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/cases/${caseId}/offices/${o.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteOffice(o.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {caseFiles.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">アップロード済み資料</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2">
                  {caseFiles.map(file => (
                    <div key={file.id} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(file.size_bytes / 1024)}KB ・ {new Date(file.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      {/* 車庫 */}
      <TabsContent value="garages">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href={`/cases/${caseId}/garages/new`}>
                <Plus className="mr-2 h-4 w-4" />車庫追加
              </Link>
            </Button>
          </div>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>所在地</TableHead>
                  <TableHead>面積</TableHead>
                  <TableHead>収容台数</TableHead>
                  <TableHead>営業所からの距離</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {garages.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">車庫が登録されていません</TableCell></TableRow>
                ) : garages.map(g => (
                  <TableRow key={g.id}>
                    <TableCell>{g.name}</TableCell>
                    <TableCell>{g.address ?? '—'}</TableCell>
                    <TableCell>{g.area ?? '—'}</TableCell>
                    <TableCell>{g.capacity ?? '—'}</TableCell>
                    <TableCell>{g.distance_from_office ?? '—'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/cases/${caseId}/garages/${g.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteGarage(g.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>

      {/* 人員 */}
      <TabsContent value="people">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href={`/cases/${caseId}/people/new`}>
                <Plus className="mr-2 h-4 w-4" />人員追加
              </Link>
            </Button>
          </div>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>フリガナ</TableHead>
                  <TableHead>役割</TableHead>
                  <TableHead>電話番号</TableHead>
                  <TableHead>選任日</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">人員が登録されていません</TableCell></TableRow>
                ) : people.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.full_name}</TableCell>
                    <TableCell>{p.furigana ?? '—'}</TableCell>
                    <TableCell><Badge variant="outline">{p.role}</Badge></TableCell>
                    <TableCell>{p.phone ?? '—'}</TableCell>
                    <TableCell>{p.appointment_date ?? '—'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/cases/${caseId}/people/${p.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePerson(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>

      {/* 添付書類 */}
      <TabsContent value="documents">
        <div className="space-y-4">
          {/* 申請フロー案内バナー */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1.5">📋 申請書類の管理フロー</p>
            <div className="flex items-center gap-2 flex-wrap text-xs text-blue-600">
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" />①テンプレートから書類リスト生成</span>
              <span className="text-blue-300">→</span>
              <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3" />②書類を収集しながら入手済チェック</span>
              <span className="text-blue-300">→</span>
              <span className="flex items-center gap-1"><Send className="h-3 w-3" />③全書類揃ったら印刷して提出先へ提出</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {documentChecks.some(d => d.required && !d.obtained) && (
              <Button size="sm" variant="outline" onClick={() => handleBulkDocUpdate('required_obtained')}>
                必須書類を一括入手済
              </Button>
            )}
            {documentChecks.some(d => d.obtained && !d.verified) && (
              <Button size="sm" variant="outline" onClick={() => handleBulkDocUpdate('obtained_verified')}>
                入手済を一括確認済
              </Button>
            )}
            <ApplyTemplateDialog caseId={caseId} caseData={caseData} templates={templates} />
            <Button asChild size="sm">
              <Link href={`/cases/${caseId}/documents/new`}>
                <Plus className="mr-2 h-4 w-4" />書類を個別追加
              </Link>
            </Button>
          </div>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>書類名</TableHead>
                  <TableHead>必須</TableHead>
                  <TableHead>入手済</TableHead>
                  <TableHead>確認済</TableHead>
                  <TableHead>不備内容</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentChecks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10">
                      <div className="flex flex-col items-center text-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground opacity-40" />
                        <p className="text-sm text-muted-foreground">書類チェックリストがまだありません</p>
                        <p className="text-xs text-muted-foreground">「テンプレートから追加」ボタンで業務種別に合った書類リストを一括生成できます</p>
                        <ApplyTemplateDialog caseId={caseId} caseData={caseData} templates={templates} />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : documentChecks.map(d => (
                  <TableRow key={d.id} className={!d.obtained && d.required ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{d.document_name}</TableCell>
                    <TableCell>
                      {d.required ? <Badge variant="destructive" className="text-xs">必須</Badge> : <Badge variant="outline" className="text-xs">任意</Badge>}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleDoc(d.id, 'obtained', d.obtained)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${d.obtained ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {d.obtained ? '✓ 入手済' : '未入手'}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleDoc(d.id, 'verified', d.verified)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${d.verified ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {d.verified ? '✓ 確認済' : '未確認'}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.deficiency_note ?? '—'}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/cases/${caseId}/documents/${d.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(d.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 書類進捗サマリー */}
          {documentChecks.length > 0 && (() => {
            const required = documentChecks.filter(d => d.required)
            const requiredObtained = required.filter(d => d.obtained)
            const allObtained = required.every(d => d.obtained)
            const pct = required.length === 0 ? 100 : Math.round((requiredObtained.length / required.length) * 100)
            return (
              <div className={`rounded-lg border p-3 ${allObtained ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-semibold ${allObtained ? 'text-green-700' : 'text-orange-700'}`}>
                    {allObtained ? '✅ 必須書類がすべて揃いました！申請できます' : `📂 必須書類の収集状況 ${requiredObtained.length}/${required.length}件`}
                  </p>
                  <span className={`text-xs font-bold ${allObtained ? 'text-green-700' : 'text-orange-600'}`}>{pct}%</span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${allObtained ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
                </div>
                {allObtained && (
                  <p className="text-xs text-green-600 mt-2">
                    「印刷」ボタンから申請書類一覧を印刷し、管轄窓口またはオンライン申請システムで申請してください。
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      </TabsContent>

      <TabsContent value="drafts">
        <div className="space-y-4">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <p className="text-xs font-semibold text-purple-700 mb-1.5">AI書類作成フロー</p>
            <div className="flex items-center gap-2 flex-wrap text-xs text-purple-700">
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" />①資料を添付</span>
              <span className="text-purple-300">→</span>
              <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />②AIがテンプレートへ自動入力</span>
              <span className="text-purple-300">→</span>
              <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3" />③不足項目だけ回答</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button asChild size="sm">
              <Link href={`/cases/${caseId}/drafts/new`}>
                <Sparkles className="mr-2 h-4 w-4" />AIで書類作成
              </Link>
            </Button>
          </div>

          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>作成名</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>添付</TableHead>
                  <TableHead>不足項目</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentDrafts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="h-8 w-8 text-muted-foreground opacity-40" />
                        <p className="text-sm text-muted-foreground">AI書類作成ドラフトはまだありません</p>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <Link href={`/cases/${caseId}/drafts/new`}>最初のドラフトを作成</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : documentDrafts.map(draft => {
                  const unanswered = draft.missing_fields.filter(field => !draft.answers[field.key]).length
                  return (
                    <TableRow key={draft.id}>
                      <TableCell className="font-medium">
                        <Link href={`/cases/${caseId}/drafts/${draft.id}`} className="hover:underline">
                          {draft.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={draft.status === 'completed' ? 'default' : 'outline'}>
                          {draft.status === 'completed' ? '完成' : draft.status === 'needs_input' ? '追加入力あり' : '作成中'}
                        </Badge>
                      </TableCell>
                      <TableCell>{draft.uploaded_files.length}件</TableCell>
                      <TableCell className={unanswered > 0 ? 'font-semibold text-orange-600' : 'text-muted-foreground'}>
                        {unanswered > 0 ? `${unanswered}項目` : 'なし'}
                      </TableCell>
                      <TableCell>{new Date(draft.created_at).toLocaleDateString('ja-JP')}</TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/cases/${caseId}/drafts/${draft.id}`}>確認</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>

      {/* メモ */}
      <TabsContent value="memo">
        <Card>
          <CardHeader><CardTitle>メモ</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{caseData.memo || '（メモなし）'}</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
