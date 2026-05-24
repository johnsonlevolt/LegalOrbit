import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/server'

export const runtime = 'nodejs'

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service role is not configured.')
  return createClient(url, key, { auth: { persistSession: false } })
}

function unixToIso(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const signature = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook signature is not configured.' }, { status: 400 })
  }

  const body = await request.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid signature' }, { status: 400 })
  }

  const supabase = adminClient()

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const subscriptionPeriod = subscription as Stripe.Subscription & { current_period_start?: number; current_period_end?: number }
    const userId = subscription.metadata.user_id
    if (userId) {
      await supabase.from('billing_profiles').upsert({
        user_id: userId,
        stripe_customer_id: String(subscription.customer),
        stripe_subscription_id: subscription.id,
        plan_name: subscription.metadata.plan_name || 'Free',
        billing_cycle: subscription.metadata.billing_cycle || 'monthly',
        plan_status: subscription.status,
        current_period_start: unixToIso(subscriptionPeriod.current_period_start),
        current_period_end: unixToIso(subscriptionPeriod.current_period_end),
        cancel_at_period_end: subscription.cancel_at_period_end,
      }, { onConflict: 'user_id' })

      const couponId = subscription.metadata.local_coupon_id
      if (couponId) {
        const { data: profile } = await supabase.from('billing_profiles').select('id').eq('user_id', userId).maybeSingle()
        const { data: existingRedemption } = await supabase
          .from('subscription_coupon_redemptions')
          .select('id')
          .eq('coupon_id', couponId)
          .eq('redeemer_user_id', userId)
          .maybeSingle()
        const { data: coupon } = await supabase
          .from('subscription_coupons')
          .select('referrer_name, referrer_email, referrer_user_id')
          .eq('id', couponId)
          .maybeSingle()
        if (!existingRedemption) {
          const { error: redemptionError } = await supabase.from('subscription_coupon_redemptions').insert({
            coupon_id: couponId,
            redeemer_user_id: userId,
            billing_profile_id: profile?.id ?? null,
            referrer_name: coupon?.referrer_name ?? null,
            referrer_email: coupon?.referrer_email ?? null,
            referrer_user_id: coupon?.referrer_user_id ?? null,
            plan_name: subscription.metadata.plan_name || null,
            billing_cycle: subscription.metadata.billing_cycle || null,
            metadata: { stripe_subscription_id: subscription.id },
          })
          if (redemptionError) throw new Error(redemptionError.message)
          await supabase.rpc('increment_coupon_used_count', { coupon_id_arg: couponId }).throwOnError()
        }
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata.user_id
    if (userId) {
      await supabase.from('billing_profiles').update({
        plan_status: 'cancelled',
        cancel_at_period_end: true,
      }).eq('user_id', userId)
    }
  }

  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    const { data: profile } = await supabase.from('billing_profiles').select('*').eq('stripe_customer_id', customerId).maybeSingle()
    if (profile) {
      await supabase.from('billing_documents').upsert({
        user_id: profile.user_id,
        document_type: 'receipt',
        document_number: invoice.number ?? invoice.id,
        issue_date: new Date((invoice.created ?? Math.floor(Date.now() / 1000)) * 1000).toISOString().split('T')[0],
        title: invoice.lines.data[0]?.description ?? 'サブスクリプション利用料',
        recipient_name: profile.billing_name || invoice.customer_name || 'ご契約者',
        amount: Math.max(0, invoice.subtotal ?? 0),
        tax_amount: Math.max(0, (invoice.total ?? 0) - (invoice.subtotal ?? 0)),
        status: 'paid',
        stripe_invoice_id: invoice.id,
        invoice_pdf_url: invoice.invoice_pdf ?? null,
        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        receipt_url: invoice.hosted_invoice_url ?? null,
        paid_at: unixToIso(invoice.status_transitions.paid_at),
      }, { onConflict: 'user_id,document_number' })
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
    await supabase.from('billing_profiles').update({ plan_status: 'past_due' }).eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
