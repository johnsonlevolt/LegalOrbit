'use client'

import type { SubscriptionCoupon, SubscriptionCouponRedemption } from '@/types/database'

function campaignLabel(value: string) {
  const labels: Record<string, string> = {
    early_user: '初期ユーザー',
    friend_referral: '知人紹介',
    office_trial: 'Office試用',
    sheet: 'Googleシート',
    manual: '手動',
  }
  return labels[value] ?? value
}

function discountLabel(coupon: SubscriptionCoupon) {
  if (coupon.discount_type === 'free_months') return `${coupon.discount_value}か月無料`
  if (coupon.discount_type === 'free_until') return coupon.free_until ? `${coupon.free_until}まで無料` : '指定日まで無料'
  if (coupon.discount_type === 'percent') return `${coupon.discount_value}%割引`
  return `${coupon.discount_value.toLocaleString('ja-JP')}円割引`
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    active: '有効',
    inactive: '停止',
    archived: '保管',
  }
  return labels[value] ?? value
}

export function CouponManager({
  coupons,
  redemptions,
}: {
  coupons: SubscriptionCoupon[]
  redemptions: SubscriptionCouponRedemption[]
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-amber-50 p-3 text-sm text-amber-950">
        クーポンの作成・変更はGoogleシートで行います。アプリ側ではコード全文を保存せず、
        ハッシュ化した照合情報と利用ログだけを保持します。
      </div>

      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">名称</th>
              <th className="px-3 py-2 text-left">コード表示</th>
              <th className="px-3 py-2 text-left">区分</th>
              <th className="px-3 py-2 text-left">紹介者</th>
              <th className="px-3 py-2 text-left">対象</th>
              <th className="px-3 py-2 text-left">内容</th>
              <th className="px-3 py-2 text-left">状態</th>
              <th className="px-3 py-2 text-right">利用</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  まだ同期済みクーポンはありません。
                </td>
              </tr>
            ) : coupons.map(coupon => (
              <tr key={coupon.id} className="border-t">
                <td className="px-3 py-2 font-medium">{coupon.label}</td>
                <td className="px-3 py-2 font-mono text-xs">{coupon.code_hint}</td>
                <td className="px-3 py-2">{campaignLabel(coupon.campaign_type)}</td>
                <td className="px-3 py-2">
                  {coupon.referrer_name || coupon.referrer_email ? (
                    <span>{coupon.referrer_name || '-'}{coupon.referrer_email ? ` / ${coupon.referrer_email}` : ''}</span>
                  ) : '-'}
                </td>
                <td className="px-3 py-2">{coupon.plan_name ?? '全プラン'}</td>
                <td className="px-3 py-2">{discountLabel(coupon)}</td>
                <td className="px-3 py-2">{statusLabel(coupon.status)}</td>
                <td className="px-3 py-2 text-right">{coupon.used_count}/{coupon.max_redemptions ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">利用ログ</p>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">日時</th>
                <th className="px-3 py-2 text-left">クーポン</th>
                <th className="px-3 py-2 text-left">紹介者</th>
                <th className="px-3 py-2 text-left">プラン</th>
                <th className="px-3 py-2 text-left">ユーザーID</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {redemptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    利用ログはまだありません。
                  </td>
                </tr>
              ) : redemptions.map(row => {
                const referrerName = row.referrer_name ?? row.subscription_coupons?.referrer_name
                const referrerEmail = row.referrer_email ?? row.subscription_coupons?.referrer_email
                return (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2">{new Date(row.redeemed_at).toLocaleString('ja-JP')}</td>
                    <td className="px-3 py-2">{row.subscription_coupons?.label ?? row.coupon_id}</td>
                    <td className="px-3 py-2">
                      {referrerName || referrerEmail ? `${referrerName ?? '-'}${referrerEmail ? ` / ${referrerEmail}` : ''}` : '-'}
                    </td>
                    <td className="px-3 py-2">{row.plan_name ?? '-'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.redeemer_user_id}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
