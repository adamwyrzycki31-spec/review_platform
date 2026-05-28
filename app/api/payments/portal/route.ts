import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createBillingPortalSession } from '@/lib/stripe/client'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'BUSINESS' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only businesses can manage billing' }, { status: 403 })
    }

    // Get business and Stripe subscription
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
      include: { stripeSubscription: true },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (!business.stripeSubscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/dashboard/business/subscription`

    // Create billing portal session
    const portalSession = await createBillingPortalSession(
      business.stripeSubscription.stripeCustomerId,
      returnUrl
    )

    return NextResponse.json({
      url: portalSession.url,
    })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}