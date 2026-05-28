import { NextRequest, NextResponse } from 'next/server'
import { auth, isAdmin, canManageReviews } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/admin/reviews - List all reviews with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canManageReviews(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const businessId = searchParams.get('businessId')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const sortBy = searchParams.get('sortBy') || 'recent'

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (businessId) {
      where.businessId = businessId
    }

    // Non-admins can only see their own business reviews
    if (session.user.role === 'BUSINESS' && session.user.businessId) {
      where.businessId = session.user.businessId
    }

    const orderBy: Record<string, string> = {}
    switch (sortBy) {
      case 'recent':
        orderBy.createdAt = 'desc'
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
              email: true,
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
          _count: {
            select: { reports: true }
          }
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

// PATCH /api/admin/reviews - Update review status (approve/reject/flag)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canManageReviews(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reviewId, status, adminNotes } = body

    if (!reviewId || !status) {
      return NextResponse.json(
        { error: 'Review ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        publishedAt: status === 'APPROVED' ? new Date() : undefined,
        updatedAt: new Date(),
      },
      include: {
        business: {
          select: { id: true, name: true, slug: true, trustScore: true, reviewCount: true }
        },
      },
    })

    // If approved, update business stats
    if (status === 'APPROVED' && review.business) {
      // Recalculate average rating
      const allReviews = await prisma.review.findMany({
        where: {
          businessId: review.business.id,
          status: 'APPROVED'
        },
        select: { rating: true }
      })

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0

      // Update business trust score and review count
      await prisma.business.update({
        where: { id: review.business.id },
        data: {
          trustScore: avgRating,
          reviewCount: allReviews.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/reviews - Delete a review (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}