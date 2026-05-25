import { getPdfFormOutputs, getPdfFormTemplates } from '@/lib/actions/pdf-forms'
import { getBillingDocuments } from '@/lib/actions/billing'
import { getAllCaseEstimates } from '@/lib/actions/practical-extensions'
import { PdfFormTemplateForm } from '@/components/pdf-forms/pdf-form-template-form'
import { BillingLedgerPanel } from '@/components/billing/billing-ledger-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function PdfFormsPage() {
  const [templates, outputs, billingDocuments, estimates] = await Promise.all([
    getPdfFormTemplates(),
    getPdfFormOutputs(),
    getBillingDocuments(),
    getAllCaseEstimates(),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">PDF帳票</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          正式様式PDFへの転記テンプレートと、見積書・請求書をまとめて確認します。
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">使い方</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-md border bg-white p-3">
            <p className="font-medium text-foreground">1. 正式PDFを登録</p>
            <p className="mt-1">官公署などの正式様式PDFをアップロードして、帳票テンプレートとして保管します。</p>
          </div>
          <div className="rounded-md border bg-white p-3">
            <p className="font-medium text-foreground">2. 転記位置を指定</p>
            <p className="mt-1">案件データをどの位置に差し込むかを設定します。通常利用では既定テンプレートを使います。</p>
          </div>
          <div className="rounded-md border bg-white p-3">
            <p className="font-medium text-foreground">3. 案件詳細から出力</p>
            <p className="mt-1">案件詳細のPDF帳票欄でテンプレートを選ぶと、案件データ入りPDFを作成します。</p>
          </div>
        </CardContent>
      </Card>

      <PdfFormTemplateForm />

      <Card>
        <CardHeader><CardTitle className="text-base">登録済みテンプレート</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>帳票名</TableHead>
                <TableHead>業務種別</TableHead>
                <TableHead>項目数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">PDF帳票テンプレートはまだありません</TableCell>
                </TableRow>
              ) : templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.business_type ?? '-'}</TableCell>
                  <TableCell>{template.field_mappings.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">出力履歴</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>帳票</TableHead>
                <TableHead>保存先</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outputs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">出力履歴はまだありません</TableCell>
                </TableRow>
              ) : outputs.map(output => (
                <TableRow key={output.id}>
                  <TableCell>{new Date(output.created_at).toLocaleString('ja-JP')}</TableCell>
                  <TableCell>{output.pdf_form_templates?.name ?? output.template_id}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{output.storage_path}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">見積書・請求書</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingLedgerPanel documents={billingDocuments} estimates={estimates} />
        </CardContent>
      </Card>
    </div>
  )
}
