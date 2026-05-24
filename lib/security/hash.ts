import { createHash, randomBytes } from 'crypto'

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}

export function hashCouponCode(code: string) {
  const salt = process.env.COUPON_CODE_SALT || process.env.NEXT_PUBLIC_SUPABASE_URL || 'local-dev-salt'
  return createHash('sha256').update(`${salt}:${normalizeCouponCode(code)}`).digest('hex')
}

export function createCouponCode(prefix = 'COUPON') {
  return `${prefix.toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`
}

export function couponHint(code: string) {
  const normalized = normalizeCouponCode(code)
  return normalized.length <= 4 ? '****' : `****-${normalized.slice(-4)}`
}
