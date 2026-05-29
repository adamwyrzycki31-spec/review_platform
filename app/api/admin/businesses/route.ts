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
    if (tab && tab !== 'all') {
      const tabFilters: Record<string, any> = {
        pending: { approvalStatus: 'PENDING' },
        approved: { approvalStatus: 'APPROVED', trafficLightStatus: 'GREEN' },
        approved_amber: { approvalStatus: 'APPROVED', trafficLightStatus: 'AMBER' },
        approved_red: { approvalStatus: 'APPROVED', trafficLightStatus: 'RED' },
        rejected: { approvalStatus: 'REJECTED' },
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
        approvalStatus: true,
        approvedAt: true,
        rejectedAt: true,
        rejectionReason: true,
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

    // Get stats - count by approvalStatus and trafficLightStatus for approved
    const totalCount = await prisma.business.count()
    
    // Count by approval status
    const approvalStatusCounts = await prisma.business.groupBy({
      by: ['approvalStatus'],
      _count: { approvalStatus: true },
    })
    
    // Count approved businesses by traffic light status
    const trafficLightStats = await prisma.business.groupBy({
      by: ['trafficLightStatus'],
      where: { approvalStatus: 'APPROVED' },
      _count: { trafficLightStatus: true },
    })

    const approvalMap = approvalStatusCounts.reduce((acc, item) => {
      acc[item.approvalStatus] = item._count.approvalStatus
      return acc
    }, {} as Record<string, number>)

    const trafficMap = trafficLightStats.reduce((acc, item) => {
      acc[item.trafficLightStatus] = item._count.trafficLightStatus
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      businesses,
      stats: {
        total: totalCount,
        pending: approvalMap['PENDING'] || 0,
        approved: approvalMap['APPROVED'] || 0,
        rejected: approvalMap['REJECTED'] || 0,
        green: trafficMap['GREEN'] || 0,
        amber: trafficMap['AMBER'] || 0,
        red: trafficMap['RED'] || 0,
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
        // Create a new business - default to PENDING status
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
            trafficLightStatus: 'PENDING',
            approvalStatus: 'PENDING',
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
        // Approve business - set approvalStatus to APPROVED, trafficLightStatus to RED
        const verifiedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: {
            approvalStatus: 'APPROVED',
            approvedAt: new Date(),
            trafficLightStatus: 'RED',
            rejectedAt: null,
            rejectionReason: null,
          },
        })
        return NextResponse.json({ success: true, business: verifiedBusiness })
      }

      case 'reject': {
        if (!businessId) {
          return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
        }
        // Reject business
        const rejectedBusiness = await prisma.business.update({
          where: { id: businessId },
          data: {
            approvalStatus: 'REJECTED',
            rejectedAt: new Date(),
            rejectionReason: data.reason || 'No reason provided',
            approvedAt: null,
          },
        })
        return NextResponse.json({ success: true, business: rejectedBusiness })
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
