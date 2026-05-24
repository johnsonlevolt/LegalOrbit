import { getAgencies } from '@/lib/actions/agencies'
import { getAgencyRules } from '@/lib/actions/practical-extensions'
import { AgencyManager } from '@/components/agencies/agency-manager'

export default async function AgenciesPage() {
  const [agencies, rules] = await Promise.all([getAgencies(), getAgencyRules()])
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">提出先マスタ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          運輸支局、警察署、保健所、入管、法務局などの提出先情報を保存します。
        </p>
      </div>
      <AgencyManager agencies={agencies} rules={rules} />
    </div>
  )
}
