import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/search - Search businesses and reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // all, businesses, reviews
    const category = searchParams.get('category')
    const trafficLight = searchParams.get('trafficLight')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const results: Record<string, unknown> = {}

    // Search businesses
    if (type === 'all' || type === 'businesses') {
      const businessWhere: Record<string, unknown> = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }

      if (category) {
        businessWhere.category = { slug: category }
      }

      if (trafficLight) {
        businessWhere.trafficLightStatus = trafficLight
      }

      const [businesses, businessCount] = await Promise.all([
        prisma.business.findMany({
          where: businessWhere,
          include: {
            category: true,
            _count: { select: { reviews: { where: { status: 'APPROVED' } } } }
          },
          orderBy: { trustScore: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.business.count({ where: businessWhere }),
      ])

      results.businesses = {
        items: businesses.map(b => ({
          ...b,
          reviewCount: b._count.reviews,
          _count: undefined,
        })),
        total: businessCount,
        page,
        pageSize,
        totalPages: Math.ceil(businessCount / pageSize),
      }
    }

    // Search reviews
    if (type === 'all' || type === 'reviews') {
      const reviewWhere: Record<string, unknown> = {
        status: 'APPROVED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      }

      const [reviews, reviewCount] = await Promise.all([
        prisma.review.findMany({
          where: reviewWhere,
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true }
            },
            business: {
              select: { id: true, name: true, slug: true, logoUrl: true }
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.review.count({ where: reviewWhere }),
      ])

      results.reviews = {
        items: reviews,
        total: reviewCount,
        page,
        pageSize,
        totalPages: Math.ceil(reviewCount / pageSize),
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}