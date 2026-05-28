import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession, getOrCreateCustomer, SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/stripe/client'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUSINESS' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only businesses can subscribe' }, { status: 403 })
    }

    const body = await request.json()
    const { tier } = body as { tier: SubscriptionTier }

    if (!tier || !SUBSCRIPTION_TIERS[tier]) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 })
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier]

    if (!tierConfig.priceId) {
      return NextResponse.json({ error: 'Tier not available for purchase' }, { status: 400 })
    }

    // Get business
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(
      session.user.id,
      session.user.email,
      `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || session.user.email
    )

    // Get success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard/business/subscription?success=true&tier=${tier}`
    const cancelUrl = `${baseUrl}/dashboard/business/subscription?canceled=true`

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      tierConfig.priceId,
      customer.id,
      successUrl,
      cancelUrl,
      {
        businessId: business.id,
        tier,
        userId: session.user.id,
      }
    )

    // Store pending subscription in database
    await prisma.stripeSubscription.upsert({
      where: { businessId: business.id },
      create: {
        businessId: business.id,
        stripeSubscriptionId: checkoutSession.subscription as string,
        stripeCustomerId: customer.id,
        status: 'pending',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      update: {
        stripeSubscriptionId: checkoutSession.subscription as string,
        stripeCustomerId: customer.id,
        status: 'pending',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}