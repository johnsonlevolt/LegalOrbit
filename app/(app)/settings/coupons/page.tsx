import { getCouponRedemptions, getCoupons } from '@/lib/actions/coupons'
import { getCouponSheetSetting, getCouponSheetSyncLogs } from '@/lib/actions/coupon-sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CouponManager } from '@/components/settings/coupon-manager'
import { CouponSheetManager } from '@/components/settings/coupon-sheet-manager'

export default async function CouponsPage() {
  const [coupons, redemptions, sheetSetting, sheetLogs] = await Promise.all([
    getCoupons(),
    getCouponRedemptions(),
    getCouponSheetSetting(),
    getCouponSheetSyncLogs(),
  ])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">クーポン管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Googleシートを原本として管理し、アプリ側には利用判定に必要な情報だけを同期します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Googleシート連携</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponSheetManager setting={sheetSetting} logs={sheetLogs} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>同期済みクーポン・利用ログ</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponManager coupons={coupons} redemptions={redemptions} />
        </CardContent>
      </Card>
    </div>
  )
}
