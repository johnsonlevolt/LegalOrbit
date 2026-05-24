import { notFound } from 'next/navigation'
import { getCase } from '@/lib/actions/cases'
import { getVehicles } from '@/lib/actions/vehicles'
import { getOffices } from '@/lib/actions/offices'
import { getGarages } from '@/lib/actions/garages'
import { getPeople } from '@/lib/actions/people'
import { getDocumentChecks } from '@/lib/actions/document-checks'
import { PrintButton } from '@/components/cases/print-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CasePrintPage(props: Props) {
  const params = await props.params
  const [caseData, vehicles, offices, garages, people, documentChecks] = await Promise.all([
    getCase(params.id),
    getVehicles(params.id),
    getOffices(params.id),
    getGarages(params.id),
    getPeople(params.id),
    getDocumentChecks(params.id),
  ])
  if (!caseData) notFound()

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden sticky top-0 bg-white border-b px-6 py-3 flex items-center gap-3 z-10">
        <PrintButton />
        <span className="text-sm text-muted-foreground">印刷プレビューです。ブラウザの印刷画面でPDF保存できます。</span>
        <a href={`/cases/${params.id}/word`} className="text-sm underline text-muted-foreground">Word一式を出力</a>
        <a href={`/cases/${params.id}`} className="ml-auto text-sm underline text-muted-foreground">案件詳細に戻る</a>
      </div>

      <div className="max-w-3xl mx-auto p-8 space-y-8 print:p-4 print:space-y-6">
        <div className="border-b pb-4">
          <p className="text-xs text-gray-500 mb-1">Legal Orbit 行政書士</p>
          <h1 className="text-2xl font-bold">{caseData.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{caseData.customers?.company_name}</p>
        </div>

        <Section title="基本情報">
          <Grid2>
            <Field label="顧客" value={caseData.customers?.company_name} />
            <Field label="業務種別" value={caseData.business_type} />
            <Field label="申請区分" value={caseData.application_type} />
            <Field label="ステータス" value={caseData.status} />
            <Field label="担当者" value={caseData.assignee} />
            <Field label="受任日" value={caseData.accepted_date} />
            <Field label="申請予定日" value={caseData.planned_submission_date} />
            <Field label="申請日" value={caseData.submission_date} />
            <Field label="完了日" value={caseData.completion_date} />
          </Grid2>
          {caseData.memo && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 mb-1">メモ</p>
              <p className="text-sm whitespace-pre-wrap border rounded p-2 bg-gray-50">{caseData.memo}</p>
            </div>
          )}
        </Section>

        {vehicles.length > 0 && (
          <Section title={`車両 (${vehicles.length}台)`}>
            {vehicles.map((v, i) => (
              <div key={v.id} className="border rounded p-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">車両 {i + 1}</p>
                <Grid2>
                  <Field label="登録番号" value={v.registration_number} />
                  <Field label="車名" value={v.vehicle_name} />
                  <Field label="型式" value={v.model} />
                  <Field label="区分" value={v.ownership_type} />
                  <Field label="最大積載量" value={v.max_loading_capacity} />
                  <Field label="車両総重量" value={v.gross_vehicle_weight} />
                  <Field label="車検満了日" value={v.inspection_expiry_date} />
                  <Field label="使用の本拠" value={v.base_location} />
                  <Field label="所有者" value={v.owner_name} />
                  <Field label="使用者" value={v.user_name} />
                </Grid2>
              </div>
            ))}
          </Section>
        )}

        {offices.length > 0 && (
          <Section title={`営業所 (${offices.length}箇所)`}>
            {offices.map((o, i) => (
              <div key={o.id} className="border rounded p-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">営業所 {i + 1}</p>
                <Grid2>
                  <Field label="名称" value={o.name} />
                  <Field label="電話番号" value={o.phone} />
                  <Field label="郵便番号" value={o.postal_code} />
                  <Field label="面積" value={o.area} />
                  <Field label="所在地" value={o.address} />
                  <Field label="使用権原" value={o.usage_rights} />
                </Grid2>
              </div>
            ))}
          </Section>
        )}

        {garages.length > 0 && (
          <Section title={`車庫 (${garages.length}箇所)`}>
            {garages.map((g, i) => (
              <div key={g.id} className="border rounded p-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">車庫 {i + 1}</p>
                <Grid2>
                  <Field label="名称" value={g.name} />
                  <Field label="郵便番号" value={g.postal_code} />
                  <Field label="所在地" value={g.address} />
                  <Field label="面積" value={g.area} />
                  <Field label="収容台数" value={g.capacity} />
                  <Field label="営業所からの距離" value={g.distance_from_office} />
                  <Field label="使用権原" value={g.usage_rights} />
                </Grid2>
              </div>
            ))}
          </Section>
        )}

        {people.length > 0 && (
          <Section title={`人員 (${people.length}名)`}>
            {people.map((p, i) => (
              <div key={p.id} className="border rounded p-3 mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">人員 {i + 1}</p>
                <Grid2>
                  <Field label="氏名" value={p.full_name} />
                  <Field label="フリガナ" value={p.furigana} />
                  <Field label="役割" value={p.role} />
                  <Field label="電話番号" value={p.phone} />
                  <Field label="生年月日" value={p.birth_date} />
                  <Field label="選任日" value={p.appointment_date} />
                  <Field label="資格者証番号" value={p.license_number} />
                  <Field label="住所" value={p.address} />
                </Grid2>
              </div>
            ))}
          </Section>
        )}

        {documentChecks.length > 0 && (
          <Section title={`書類チェックリスト (${documentChecks.length}件)`}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 font-medium text-xs text-gray-600">書類名</th>
                  <th className="text-center py-2 px-3 font-medium text-xs text-gray-600">必須</th>
                  <th className="text-center py-2 px-3 font-medium text-xs text-gray-600">入手済</th>
                  <th className="text-center py-2 px-3 font-medium text-xs text-gray-600">確認済</th>
                  <th className="text-left py-2 px-3 font-medium text-xs text-gray-600">不備内容</th>
                </tr>
              </thead>
              <tbody>
                {documentChecks.map(d => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-2 px-3">{d.document_name}</td>
                    <td className="py-2 px-3 text-center">{d.required ? '○' : '-'}</td>
                    <td className="py-2 px-3 text-center">{d.obtained ? '○' : '-'}</td>
                    <td className="py-2 px-3 text-center">{d.verified ? '○' : '-'}</td>
                    <td className="py-2 px-3 text-xs text-gray-500">{d.deficiency_note ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        <div className="border-t pt-4 text-xs text-gray-400 flex justify-between">
          <span>出力日: {new Date().toLocaleDateString('ja-JP')}</span>
          <span>Legal Orbit 行政書士</span>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold border-b-2 border-gray-800 pb-1 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-2">{children}</div>
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium">{value || '-'}</dd>
    </div>
  )
}
