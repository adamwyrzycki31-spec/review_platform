import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// GET /api/admin/businesses - List all businesses
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const trafficLight = searchParams.get('trafficLight') || ''
    const tab = searchParams.get('tab') || 'all'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { businessEmail: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status && status !== 'all') {
      where.subscriptionStatus = status
    }

    if (trafficLight && trafficLight !== 'all') {
      where.trafficLightStatus = trafficLight
    }

    if (tab && tab !== 'all') {
      const tabFilters: Record<string, any> = {
        pending: { trafficLightStatus: 'RED' },
        verified: { trafficLightStatus: 'GREEN' },
        amber: { trafficLightStatus: 'AMBER' },
        subscribed: { subscriptionStatus: 'ACTIVE' },
      }
      if (tabFilters[tab]) {
        Object.assign(where, tabFilters[tab])
      }
    }

    const businesses = await prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        website: true,
        logoUrl: true,
        city: true,
        country: true,
        phone: true,
        businessEmail: true,
        trustScore: true,
        reviewCount: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trafficLightStatus: true,
        insuranceUrl: true,
        termsUrl: true,
        promisePageUrl: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get stats
    const trafficLightStats = await prisma.business.groupBy({
      by: ['trafficLightStatus'],
      _count: { trafficLightStatus: true },
    })

    const subscriptionStats = await prisma.business.groupBy({
      by: ['subscriptionStatus'],
      _count: { subscriptionStatus: true },
    })

    const totalCount = await prisma.business.count()

    const trafficLightMap = trafficLightStats.reduce((acc, item) => {
      acc[item.trafficLightStatus] = item._count.trafficLightStatus
      return acc
    }, {} as Record<string, number>)

    const subscriptionMap = subscriptionStats.reduce((acc, item) => {
      acc[item.subscriptionStatus] = item._count.subscriptionStatus
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      businesses,
      stats: {
        total: totalCount,
        green: trafficLightMap['GREEN'] || 0,
        amber: trafficLightMap['AMBER'] || 0,
        red: trafficLightMap['RED'] || 0,
        active: subscriptionMap['ACTIVE'] || 0,
        expired: subscriptionMap['EXPIRED'] || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}

// POST /api/admin/businesses - Create or update business
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, businessId, data } = body

    switch (action) {
      case 'create': {
        // Create a new business
        const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        
        // Check if slug exists
        const existingSlug = await prisma.business.findUnique({ where: { slug } })
        const finalSlug = existingSlug ? `${slug}-${uuidv4().substring(0, 8)}` : slug

        const newBusiness = await prisma.business.create({
          data: {
            userId: data.userId || session.user.id,
            name: data.name,
            slug: finalSlug,
            description: data.description || '',
            website: data.website || '',
            businessEmail: data.businessEmail || '',
            city: data.city || '',
            country: data.country || '',
            phone: data.phone || '',
          },
        })

        return NextResponse.json({ success: true, business: newBusiness })
      }

      case 'update': {
        // Update business
        const updatedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: {
            name: data.name,
            description: data.description,
            website: data.website,
            businessEmail: data.businessEmail,
            city: data.city,
            country: data.country,
            phone: data.phone,
            insuranceUrl: data.insuranceUrl,
            termsUrl: data.termsUrl,
            promisePageUrl: data.promisePageUrl,
          },
        })
        return NextResponse.json({ success: true, business: updatedBusiness })
      }

      case 'delete': {
        // Delete business
        await prisma.business.delete({
          where: { id: businessId },
        })
        return NextResponse.json({ success: true, message: 'Business deleted' })
      }

      case 'verify': {
        // Mark business as verified
        const verifiedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: {
            verifiedAt: new Date(),
            trafficLightStatus: 'GREEN',
          },
        })
        return NextResponse.json({ success: true, business: verifiedBusiness })
      }

      case 'update-traffic-light': {
        // Update traffic light status
        const updatedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: {
            trafficLightStatus: data.trafficLightStatus,
          },
        })
        return NextResponse.json({ success: true, business: updatedBusiness })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing business action:', error)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}
