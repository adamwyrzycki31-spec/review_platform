import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/businesses - List all businesses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const category = searchParams.get('category')
    const trafficLight = searchParams.get('trafficLight')
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')

    const where: Record<string, unknown> = {
      // Only show APPROVED businesses in public API
      approvalStatus: 'APPROVED',
    }

    if (slug) {
      where.slug = slug
    }

    if (category) {
      where.category = { slug: category }
    }

    if (trafficLight) {
      where.trafficLightStatus = trafficLight
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { trustScore: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.business.count({ where }),
    ])

    return NextResponse.json({
      items: businesses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

// POST /api/businesses - Create a new business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, website, categoryId, userId, ...rest } = body

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check for existing slug
    const existingSlug = await prisma.business.findUnique({
      where: { slug },
    })

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const business = await prisma.business.create({
      data: {
        name,
        slug,
        description,
        website,
        categoryId,
        userId,
        ...rest,
      },
      include: {
        category: true,
      },
    })

    // Create traffic signal record
    await prisma.trafficSignal.create({
      data: {
        businessId: business.id,
      },
    })

    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    )
  }
}
