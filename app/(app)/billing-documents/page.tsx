import { getBillingDocuments } from '@/lib/actions/billing'
import { getAllCaseEstimates } from '@/lib/actions/practical-extensions'
import { BillingLedgerPanel } from '@/components/billing/billing-ledger-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function BillingDocumentsPage() {
  const [billingDocuments, estimates] = await Promise.all([
    getBillingDocuments(),
    getAllCaseEstimates(),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">請求書・見積書</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          発行済みの見積書と請求書を、月別・会社別に確認します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">帳票一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingLedgerPanel documents={billingDocuments} estimates={estimates} />
        </CardContent>
      </Card>
    </div>
  )
}
