import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/reviews - List all reviews (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status') || 'APPROVED'
    const sortBy = searchParams.get('sortBy') || 'recent'

    const where: Record<string, unknown> = {
      status: status === 'all' ? undefined : status,
    }

    if (businessId) {
      where.businessId = businessId
    }

    const orderBy: Record<string, string> = {}
    switch (sortBy) {
      case 'recent':
        orderBy.createdAt = 'desc'
        break
      case 'helpful':
        orderBy.helpfulCount = 'desc'
        break
      case 'rating_high':
        orderBy.rating = 'desc'
        break
      case 'rating_low':
        orderBy.rating = 'asc'
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
          images: true,
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      items: reviews,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, businessId, rating, title, content, pros, cons, recommendation } = body

    if (!userId || !businessId || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this business
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        businessId,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this business' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        userId,
        businessId,
        rating,
        title,
        content,
        pros,
        cons,
        recommendation,
        status: 'PENDING', // Reviews require moderation
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
