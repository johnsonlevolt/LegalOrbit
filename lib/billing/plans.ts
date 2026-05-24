export type PlanName = 'Free' | 'Starter' | 'Pro' | 'Office'
export type BillingCycle = 'monthly' | 'yearly'

export const planRanks: Record<PlanName, number> = {
  Free: 0,
  Starter: 1,
  Pro: 2,
  Office: 3,
}

export const paidPlans = ['Starter', 'Pro', 'Office'] as const

export const plans: Record<PlanName, {
  name: PlanName
  monthlyPrice: number
  yearlyPrice: number
  aiDraftLimit: number
  caseLimit: number | null
  customerLimit: number | null
  recommended?: boolean
  features: string[]
}> = {
  Free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    aiDraftLimit: 0,
    caseLimit: 5,
    customerLimit: 10,
    features: ['案件5件まで', '顧客10件まで', '基本管理', 'テンプレート閲覧'],
  },
  Starter: {
    name: 'Starter',
    monthlyPrice: 4980,
    yearlyPrice: 4980 * 11,
    aiDraftLimit: 0,
    caseLimit: 50,
    customerLimit: 200,
    features: ['案件50件', '顧客200件', 'テンプレート適用', 'PDF/Word出力', '通知設定'],
  },
  Pro: {
    name: 'Pro',
    monthlyPrice: 12800,
    yearlyPrice: 12800 * 11,
    aiDraftLimit: 100,
    caseLimit: null,
    customerLimit: null,
    recommended: true,
    features: ['案件数無制限', 'AI書類作成 月100回', '添付資料読み込み', 'タスク管理', '監査ログ', '請求履歴'],
  },
  Office: {
    name: 'Office',
    monthlyPrice: 29800,
    yearlyPrice: 29800 * 11,
    aiDraftLimit: 500,
    caseLimit: null,
    customerLimit: null,
    features: ['Pro全機能', 'AI書類作成 月500回', '複数担当者管理', '事務所テンプレート管理', '優先サポート'],
  },
}

export function getStripePriceEnvKey(plan: PlanName, cycle: BillingCycle) {
  return `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`
}

export function canUpgrade(current: PlanName, next: PlanName) {
  return planRanks[next] >= planRanks[current]
}

export function formatYen(amount: number) {
  return `${amount.toLocaleString('ja-JP')}円`
}
