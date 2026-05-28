import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent, handleSubscriptionCreated, handleSubscriptionUpdated, handleSubscriptionDeleted, handlePaymentSucceeded, handlePaymentFailed } from '@/lib/stripe/client'
import prisma from '@/lib/db'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Construct event
    const event = await constructWebhookEvent(body, signature, webhookSecret) as Stripe.Event

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const businessId = session.metadata?.businessId
        const tier = session.metadata?.tier

        if (businessId && tier) {
          // Update business subscription
          await prisma.business.update({
            where: { id: businessId },
            data: {
              subscriptionTier: tier as any,
              subscriptionStatus: 'ACTIVE',
              subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          })

          // Update stripe subscription record
          await prisma.stripeSubscription.updateMany({
            where: { businessId },
            data: {
              status: 'active',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          })

          // Update traffic signal
          await prisma.trafficSignal.updateMany({
            where: { businessId },
            data: { hasActiveSubscription: true },
          })
        }
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (businessId) {
          const newStatus = subscription.status === 'active' ? 'ACTIVE' : 
                           subscription.status === 'canceled' ? 'CANCELLED' : 
                           subscription.status === 'past_due' ? 'PAST_DUE' : 'EXPIRED'

          await prisma.business.update({
            where: { id: businessId },
            data: { subscriptionStatus: newStatus as any },
          })

          await prisma.trafficSignal.updateMany({
            where: { businessId },
            data: { hasActiveSubscription: subscription.status === 'active' },
          })
        }

        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const businessId = subscription.metadata?.businessId

        if (businessId) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              subscriptionStatus: 'CANCELLED',
              subscriptionTier: 'FREE',
            },
          })

          await prisma.trafficSignal.updateMany({
            where: { businessId },
            data: { hasActiveSubscription: false },
          })
        }

        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)

        // Log transaction
        if (invoice.subscription) {
          const subscription = await prisma.stripeSubscription.findFirst({
            where: { stripeSubscriptionId: invoice.subscription as string },
          })

          if (subscription) {
            await prisma.transaction.create({
              data: {
                businessId: subscription.businessId,
                type: 'SUBSCRIPTION',
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                stripeId: invoice.id,
                status: 'completed',
                metadata: { invoiceId: invoice.id },
              },
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)

        // Update subscription status to past_due
        if (invoice.subscription) {
          await prisma.stripeSubscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: 'past_due' },
          })

          await prisma.business.updateMany({
            where: { stripeSubscriptions: { some: { stripeSubscriptionId: invoice.subscription as string } } },
            data: { subscriptionStatus: 'PAST_DUE' },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}