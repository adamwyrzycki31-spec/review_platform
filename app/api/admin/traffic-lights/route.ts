import { NextRequest, NextResponse } from 'next/server'
import { auth, isAdmin } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/admin/traffic-lights - List all traffic light configurations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // RED, AMBER, GREEN, or undefined for all
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where = status ? { business: { trafficLightStatus: status } } : {}

    const [trafficSignals, total] = await Promise.all([
      prisma.trafficSignal.findMany({
        where,
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              trafficLightStatus: true,
              subscriptionStatus: true,
            }
          },
          verifiedBy: {
            select: { firstName: true, lastName: true }
          }
        },
        orderBy: { business: { createdAt: 'desc' } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.trafficSignal.count({ where }),
    ])

    // Calculate status for each signal
    const signalsWithStatus = trafficSignals.map(signal => {
      const conditionsMet = [
        signal.hasInsurance,
        signal.hasRefundPromise,
        signal.hasClaimPage,
        signal.hasTermsClauses,
        signal.hasActiveSubscription,
      ].filter(Boolean).length

      return {
        ...signal,
        conditionsCount: conditionsMet,
        status: conditionsMet === 5 ? 'GREEN' : conditionsMet >= 2 ? 'AMBER' : 'RED',
      }
    })

    return NextResponse.json({
      items: signalsWithStatus,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching traffic lights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch traffic light data' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/traffic-lights - Update traffic light verification (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { businessId, hasInsurance, hasRefundPromise, hasClaimPage, hasTermsClauses, notes } = body

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Update or create traffic signal
    const trafficSignal = await prisma.trafficSignal.upsert({
      where: { businessId },
      create: {
        businessId,
        hasInsurance: hasInsurance || false,
        hasRefundPromise: hasRefundPromise || false,
        hasClaimPage: hasClaimPage || false,
        hasTermsClauses: hasTermsClauses || false,
        hasActiveSubscription: business.subscriptionStatus === 'ACTIVE',
        verifiedById: session.user.id,
        verifiedAt: new Date(),
        notes,
      },
      update: {
        hasInsurance: hasInsurance !== undefined ? hasInsurance : undefined,
        hasRefundPromise: hasRefundPromise !== undefined ? hasRefundPromise : undefined,
        hasClaimPage: hasClaimPage !== undefined ? hasClaimPage : undefined,
        hasTermsClauses: hasTermsClauses !== undefined ? hasTermsClauses : undefined,
        hasActiveSubscription: business.subscriptionStatus === 'ACTIVE',
        verifiedById: session.user.id,
        verifiedAt: new Date(),
        notes,
      },
    })

    // Update business traffic light status based on conditions
    const conditionsCount = [
      trafficSignal.hasInsurance,
      trafficSignal.hasRefundPromise,
      trafficSignal.hasClaimPage,
      trafficSignal.hasTermsClauses,
      trafficSignal.hasActiveSubscription,
    ].filter(Boolean).length

    let newStatus: 'RED' | 'AMBER' | 'GREEN' = 'RED'
    if (conditionsCount === 5) {
      newStatus = 'GREEN'
    } else if (conditionsCount >= 2) {
      newStatus = 'AMBER'
    }

    // Update business status
    await prisma.business.update({
      where: { id: businessId },
      data: { 
        trafficLightStatus: newStatus,
        verifiedAt: newStatus === 'GREEN' ? new Date() : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      trafficSignal,
      businessStatus: newStatus,
    })
  } catch (error) {
    console.error('Error updating traffic light:', error)
    return NextResponse.json(
      { error: 'Failed to update traffic light' },
      { status: 500 }
    )
  }
}