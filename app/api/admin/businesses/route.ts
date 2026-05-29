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

    // Tab filters - map tab values to where conditions
    // Pending = Red + not verified (new businesses need admin approval)
    if (tab && tab !== 'all') {
      const tabFilters: Record<string, any> = {
        green: { trafficLightStatus: 'GREEN' },
        amber: { trafficLightStatus: 'AMBER' },
        red: { trafficLightStatus: 'RED' },
        pending: { trafficLightStatus: 'RED', verifiedAt: null },
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

    // Get stats - count by traffic light status
    const trafficLightStats = await prisma.business.groupBy({
      by: ['trafficLightStatus'],
      _count: { trafficLightStatus: true },
    })

    const totalCount = await prisma.business.count()

    const statsMap = trafficLightStats.reduce((acc, item) => {
      acc[item.trafficLightStatus] = item._count.trafficLightStatus
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      businesses,
      stats: {
        total: totalCount,
        green: statsMap['GREEN'] || 0,
        amber: statsMap['AMBER'] || 0,
        red: statsMap['RED'] || 0,
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
        // Create a new business - default to RED (Pending) status
        if (!data.name) {
          return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
        }
        
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
            trafficLightStatus: 'RED', // Default to Red (Pending)
            verifiedAt: null, // Not verified until admin approves
          },
        })

        // Create traffic signal record
        await prisma.trafficSignal.create({
          data: {
            businessId: newBusiness.id,
          },
        })

        return NextResponse.json({ success: true, business: newBusiness })
      }

      case 'update': {
        // Update business
        if (!businessId) {
          return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
        }
        
        const updateData: any = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.description !== undefined) updateData.description = data.description
        if (data.website !== undefined) updateData.website = data.website
        if (data.businessEmail !== undefined) updateData.businessEmail = data.businessEmail
        if (data.city !== undefined) updateData.city = data.city
        if (data.country !== undefined) updateData.country = data.country
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.insuranceUrl !== undefined) updateData.insuranceUrl = data.insuranceUrl
        if (data.termsUrl !== undefined) updateData.termsUrl = data.termsUrl
        if (data.promisePageUrl !== undefined) updateData.promisePageUrl = data.promisePageUrl

        const updatedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: updateData,
        })
        return NextResponse.json({ success: true, business: updatedBusiness })
      }

      case 'delete': {
        if (!businessId) {
          return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
        }
        // Delete business
        await prisma.business.delete({
          where: { id: businessId },
        })
        return NextResponse.json({ success: true, message: 'Business deleted' })
      }

      case 'verify': {
        if (!businessId) {
          return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
        }
        // Mark business as verified (sets verifiedAt but keeps traffic light status unchanged)
        const verifiedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: {
            verifiedAt: new Date(),
          },
        })
        return NextResponse.json({ success: true, business: verifiedBusiness })
      }

      case 'set-green': {
        if (!businessId) {
          return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
        }
        const updatedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: { trafficLightStatus: 'GREEN' },
        })
        return NextResponse.json({ success: true, business: updatedBusiness })
      }

      case 'set-amber': {
        if (!businessId) {
          return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
        }
        const updatedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: { trafficLightStatus: 'AMBER' },
        })
        return NextResponse.json({ success: true, business: updatedBusiness })
      }

      case 'set-red': {
        if (!businessId) {
          return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
        }
        const updatedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: { trafficLightStatus: 'RED' },
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
