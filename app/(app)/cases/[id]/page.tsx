import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileDown, Printer } from 'lucide-react'
import { getCase } from '@/lib/actions/cases'
import { getVehicles } from '@/lib/actions/vehicles'
import { getOffices } from '@/lib/actions/offices'
import { getGarages } from '@/lib/actions/garages'
import { getPeople } from '@/lib/actions/people'
import { getDocumentChecks } from '@/lib/actions/document-checks'
import { getDocumentDrafts } from '@/lib/actions/document-drafts'
import { getCaseFiles } from '@/lib/actions/case-files'
import { getDocumentTemplates } from '@/lib/actions/document-templates'
import { getCaseTasks } from '@/lib/actions/case-tasks'
import { getPdfFormOutputs, getPdfFormTemplates } from '@/lib/actions/pdf-forms'
import { getCaseCorrections } from '@/lib/actions/corrections'
import { getCaseDeadlines } from '@/lib/actions/deadlines'
import { getBillingProfile } from '@/lib/actions/billing'
import { CaseDetailTabs } from '@/components/cases/case-detail-tabs'
import { CaseNextActions } from '@/components/cases/case-next-actions'
import { CaseTaskMemoSwitch } from '@/components/cases/case-task-memo-switch'
import { GeneratePdfForm } from '@/components/pdf-forms/generate-pdf-form'
import { CopyCaseButton } from '@/components/cases/copy-case-button'
import { CorrectionsPanel } from '@/components/cases/corrections-panel'
import { DeadlinesPanel } from '@/components/cases/deadlines-panel'
import { MissingDocsRequestBox } from '@/components/cases/missing-docs-request-box'
import { PracticalPanels } from '@/components/cases/practical-panels'
import {
  getCaseCommunications,
  getCaseEstimates,
  getCaseMemos,
  getCaseReviews,
  getUploadLinks,
} from '@/lib/actions/practical-extensions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteCaseButton } from '@/components/cases/delete-case-button'
import type { CaseStatus } from '@/types/database'

function statusVariant(status: CaseStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case '完了': return 'secondary'
    case '申請済': return 'default'
    case '補正対応中': return 'destructive'
    case '保留': return 'outline'
    default: return 'outline'
  }
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function CaseDetailPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const caseData = await getCase(params.id)
  if (!caseData) notFound()

  const tab = searchParams.tab ?? 'basic'

  // 全タブのデータを並列取得（タブ切り替えを瞬時にするため）
  const [
    vehicles,
    offices,
    garages,
    people,
    documentChecks,
    documentDrafts,
    caseFiles,
    templates,
    tasks,
    memos,
    pdfTemplates,
    pdfOutputs,
    corrections,
    deadlines,
    uploadLinks,
    reviews,
    communications,
    estimates,
    billingProfile,
  ] = await Promise.all([
    getVehicles(params.id),
    getOffices(params.id),
    getGarages(params.id),
    getPeople(params.id),
    getDocumentChecks(params.id),
    getDocumentDrafts(params.id),
    getCaseFiles(params.id),
    getDocumentTemplates(),
    getCaseTasks(params.id),
    getCaseMemos(params.id),
    getPdfFormTemplates(),
    getPdfFormOutputs(params.id),
    getCaseCorrections(params.id),
    getCaseDeadlines(params.id),
    getUploadLinks(params.id),
    getCaseReviews(params.id),
    getCaseCommunications(params.id),
    getCaseEstimates(params.id),
    getBillingProfile(),
  ])

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b bg-gray-50/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{caseData.name}</h1>
          <Badge variant={statusVariant(caseData.status)}>{caseData.status}</Badge>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/customers/${caseData.customer_id}/edit`}>顧客情報編集</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/cases/${params.id}/edit`}>案件詳細編集</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/cases/${params.id}/print`}>
              <Printer className="h-4 w-4 mr-1" />印刷・PDF保存
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/cases/${params.id}/word`}>
              <FileDown className="h-4 w-4 mr-1" />Word一式
            </Link>
          </Button>
          <CopyCaseButton caseId={params.id} defaultName={caseData.name} />
          <DeleteCaseButton caseId={params.id} />
          <Button asChild variant="outline" size="sm">
            <Link href="/cases">← 一覧</Link>
          </Button>
        </div>
      </div>
      <CaseNextActions
        caseId={params.id}
        caseData={caseData}
        vehicles={vehicles}
        offices={offices}
        garages={garages}
        people={people}
        documentChecks={documentChecks}
        documentDrafts={documentDrafts}
      />
      <CaseTaskMemoSwitch caseId={params.id} customerId={caseData.customer_id} tasks={tasks} memos={memos} />
      <div className="grid gap-4 xl:grid-cols-3">
        <MissingDocsRequestBox caseData={caseData} documentChecks={documentChecks} />
        <CorrectionsPanel caseId={params.id} corrections={corrections} />
        <DeadlinesPanel caseId={params.id} customerId={caseData.customer_id} deadlines={deadlines} />
      </div>
      <PracticalPanels
        caseId={params.id}
        customerId={caseData.customer_id}
        customerName={caseData.customers?.company_name ?? null}
        files={caseFiles}
        documentChecks={documentChecks}
        uploadLinks={uploadLinks}
        reviews={reviews}
        communications={communications}
        estimates={estimates}
        billingProfile={billingProfile}
      />
      {pdfTemplates.length > 0 && (
        <div className="rounded-lg border bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">PDF帳票転記</p>
            <p className="text-xs text-muted-foreground">出力済み {pdfOutputs.length}件</p>
          </div>
          <GeneratePdfForm caseId={params.id} templates={pdfTemplates} />
        </div>
      )}
      <CaseDetailTabs
        caseId={params.id}
        caseData={caseData}
        activeTab={tab}
        vehicles={vehicles}
        offices={offices}
        garages={garages}
        people={people}
        documentChecks={documentChecks}
        documentDrafts={documentDrafts}
        caseFiles={caseFiles}
        templates={templates}
      />
    </div>
  )
}
