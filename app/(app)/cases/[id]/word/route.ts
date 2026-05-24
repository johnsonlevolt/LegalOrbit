import { notFound } from 'next/navigation'
import { getCase } from '@/lib/actions/cases'
import { getVehicles } from '@/lib/actions/vehicles'
import { getOffices } from '@/lib/actions/offices'
import { getGarages } from '@/lib/actions/garages'
import { getPeople } from '@/lib/actions/people'
import { getDocumentChecks } from '@/lib/actions/document-checks'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, props: Props) {
  const params = await props.params;
  const [caseData, vehicles, offices, garages, people, documentChecks] = await Promise.all([
    getCase(params.id),
    getVehicles(params.id),
    getOffices(params.id),
    getGarages(params.id),
    getPeople(params.id),
    getDocumentChecks(params.id),
  ])
  if (!caseData) notFound()

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: "Yu Gothic", "Meiryo", sans-serif; font-size: 11pt; line-height: 1.6; }
    h1 { font-size: 20pt; border-bottom: 2px solid #222; padding-bottom: 8px; }
    h2 { font-size: 14pt; margin-top: 24px; border-bottom: 1px solid #777; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
    th, td { border: 1px solid #bbb; padding: 6px 8px; vertical-align: top; }
    th { background: #f2f2f2; width: 28%; text-align: left; }
  </style>
</head>
<body>
  <h1>${escapeHtml(caseData.name)}</h1>
  <p>顧客: ${escapeHtml(caseData.customers?.company_name ?? '')}</p>
  ${section('基本情報', rows([
    ['業務種別', caseData.business_type],
    ['申請区分', caseData.application_type],
    ['ステータス', caseData.status],
    ['担当者', caseData.assignee],
    ['受任日', caseData.accepted_date],
    ['申請予定日', caseData.planned_submission_date],
    ['申請日', caseData.submission_date],
    ['完了日', caseData.completion_date],
    ['メモ', caseData.memo],
  ]))}
  ${vehicles.map((v, i) => section(`車両 ${i + 1}`, rows([
    ['登録番号', v.registration_number],
    ['車台番号', v.chassis_number],
    ['車名', v.vehicle_name],
    ['型式', v.model],
    ['用途', v.usage],
    ['区分', v.ownership_type],
    ['最大積載量', v.max_loading_capacity],
    ['車両総重量', v.gross_vehicle_weight],
    ['車検満了日', v.inspection_expiry_date],
    ['所有者', v.owner_name],
    ['使用者', v.user_name],
    ['使用の本拠', v.base_location],
  ]))).join('')}
  ${offices.map((o, i) => section(`営業所 ${i + 1}`, rows([
    ['名称', o.name],
    ['郵便番号', o.postal_code],
    ['所在地', o.address],
    ['電話番号', o.phone],
    ['面積', o.area],
    ['使用権原', o.usage_rights],
    ['メモ', o.memo],
  ]))).join('')}
  ${garages.map((g, i) => section(`車庫 ${i + 1}`, rows([
    ['名称', g.name],
    ['郵便番号', g.postal_code],
    ['所在地', g.address],
    ['面積', g.area],
    ['収容台数', g.capacity],
    ['使用権原', g.usage_rights],
    ['営業所からの距離', g.distance_from_office],
    ['メモ', g.memo],
  ]))).join('')}
  ${people.map((p, i) => section(`人員 ${i + 1}`, rows([
    ['氏名', p.full_name],
    ['フリガナ', p.furigana],
    ['役割', p.role],
    ['生年月日', p.birth_date],
    ['住所', p.address],
    ['電話番号', p.phone],
    ['資格者証番号', p.license_number],
    ['選任日', p.appointment_date],
  ]))).join('')}
  ${section('添付書類チェック', `<table><thead><tr><th>書類名</th><th>必須</th><th>入手済</th><th>確認済</th><th>不備内容</th></tr></thead><tbody>${documentChecks.map(d => `<tr><td>${escapeHtml(d.document_name)}</td><td>${d.required ? '必須' : ''}</td><td>${d.obtained ? '済' : ''}</td><td>${d.verified ? '済' : ''}</td><td>${escapeHtml(d.deficiency_note ?? '')}</td></tr>`).join('')}</tbody></table>`)}
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'application/msword; charset=utf-8',
      'Content-Disposition': `attachment; filename="case-${params.id}.doc"`,
    },
  })
}

function section(title: string, content: string) {
  return `<h2>${escapeHtml(title)}</h2>${content}`
}

function rows(items: Array<[string, string | null | undefined]>) {
  return `<table><tbody>${items.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value ?? '')}</td></tr>`).join('')}</tbody></table>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
