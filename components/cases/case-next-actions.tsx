import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, FileQuestion, FileText, Sparkles } from 'lucide-react'
import type { Case, DocumentCheck, DocumentDraft, Garage, Office, Person, Vehicle } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  caseId: string
  caseData: Case
  vehicles: Vehicle[]
  offices: Office[]
  garages: Garage[]
  people: Person[]
  documentChecks: DocumentCheck[]
  documentDrafts: DocumentDraft[]
}

export function CaseNextActions({ caseId, caseData, vehicles, offices, garages, people, documentChecks, documentDrafts }: Props) {
  const actions = buildNextActions({ caseId, caseData, vehicles, offices, garages, people, documentChecks, documentDrafts })
  if (actions.length === 0) return null

  return (
    <Card className="border-blue-200 bg-blue-50/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-blue-600" />
          次にやること
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-2">
        {actions.slice(0, 6).map(action => (
          <div key={action.title} className="flex items-start gap-3 rounded-md border bg-white p-3">
            <action.icon className={`mt-0.5 h-4 w-4 shrink-0 ${action.tone}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{action.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </div>
            {action.href && (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href={action.href}>開く</Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function buildNextActions(input: Props) {
  const { caseId, caseData, vehicles, offices, garages, people, documentChecks, documentDrafts } = input
  const actions: Array<{
    title: string
    description: string
    href?: string
    icon: typeof AlertTriangle
    tone: string
    priority: number
  }> = []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (caseData.planned_submission_date) {
    const due = new Date(caseData.planned_submission_date)
    due.setHours(0, 0, 0, 0)
    const days = Math.round((due.getTime() - today.getTime()) / 86400000)
    if (days < 0) {
      actions.push({
        title: '申請予定日を過ぎています',
        description: `${Math.abs(days)}日前が予定日です。申請日または予定日の更新が必要です。`,
        href: `/cases/${caseId}/edit`,
        icon: AlertTriangle,
        tone: 'text-red-600',
        priority: 100,
      })
    } else if (days <= 7) {
      actions.push({
        title: '申請予定日が近いです',
        description: days === 0 ? '本日が申請予定日です。' : `申請予定日まで${days}日です。`,
        href: `/cases/${caseId}?tab=documents`,
        icon: Clock,
        tone: 'text-orange-600',
        priority: 90,
      })
    }
  } else {
    actions.push({
      title: '申請予定日が未入力です',
      description: 'ダッシュボードの期限管理に出すため、予定日を入れてください。',
      href: `/cases/${caseId}/edit`,
      icon: Clock,
      tone: 'text-orange-600',
      priority: 70,
    })
  }

  const requiredMissing = documentChecks.filter(d => d.required && !d.obtained)
  if (requiredMissing.length > 0) {
    actions.push({
      title: `必須書類が${requiredMissing.length}件未入手です`,
      description: requiredMissing.slice(0, 2).map(d => d.document_name).join('、') + (requiredMissing.length > 2 ? ' ほか' : ''),
      href: `/cases/${caseId}?tab=documents`,
      icon: FileText,
      tone: 'text-red-600',
      priority: 95,
    })
  }

  const unverified = documentChecks.filter(d => d.obtained && !d.verified)
  if (unverified.length > 0) {
    actions.push({
      title: `入手済書類の確認が${unverified.length}件残っています`,
      description: '確認済にすると提出前チェックが進みます。',
      href: `/cases/${caseId}?tab=documents`,
      icon: CheckCircle2,
      tone: 'text-blue-600',
      priority: 60,
    })
  }

  const needsInput = documentDrafts.filter(d => d.status === 'needs_input')
  if (needsInput.length > 0) {
    actions.push({
      title: `AI書類作成の質問が${needsInput.length}件あります`,
      description: '不足項目に回答するとドラフトを完成に近づけられます。',
      href: `/cases/${caseId}?tab=drafts`,
      icon: FileQuestion,
      tone: 'text-purple-600',
      priority: 85,
    })
  }

  if (documentChecks.length === 0) {
    actions.push({
      title: '書類チェックリストが未作成です',
      description: 'テンプレートを適用して必要書類を一括作成してください。',
      href: `/cases/${caseId}?tab=documents`,
      icon: FileText,
      tone: 'text-blue-600',
      priority: 80,
    })
  }

  const text = `${caseData.name} ${caseData.business_type ?? ''}`
  if (/運輸|貨物|旅客|車庫|自動車/.test(text)) {
    if (vehicles.length === 0) actions.push({ title: '車両情報が未登録です', description: '車検証などから車両情報を登録してください。', href: `/cases/${caseId}/vehicles/new`, icon: FileText, tone: 'text-blue-600', priority: 50 })
    if (offices.length === 0) actions.push({ title: '営業所情報が未登録です', description: '所在地・面積・使用権原を登録してください。', href: `/cases/${caseId}/offices/new`, icon: FileText, tone: 'text-blue-600', priority: 49 })
    if (garages.length === 0) actions.push({ title: '車庫情報が未登録です', description: '所在地・収容台数・営業所からの距離を登録してください。', href: `/cases/${caseId}/garages/new`, icon: FileText, tone: 'text-blue-600', priority: 48 })
    if (people.length === 0) actions.push({ title: '人員情報が未登録です', description: '役員・管理者・担当者を登録してください。', href: `/cases/${caseId}/people/new`, icon: FileText, tone: 'text-blue-600', priority: 47 })
  }

  return actions.sort((a, b) => b.priority - a.priority)
}
