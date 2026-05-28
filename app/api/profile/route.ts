import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        business: true,
        reseller: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      business: user.business,
      reseller: user.reseller,
      createdAt: user.createdAt,
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, phone, address, city, country, website, bio, avatarUrl } = body

    const updateData: Record<string, unknown> = {}

    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    // If user has a business, update business profile too
    if (user.business) {
      const businessUpdateData: Record<string, unknown> = {}
      if (phone !== undefined) businessUpdateData.phone = phone
      if (address !== undefined) businessUpdateData.address = address
      if (city !== undefined) businessUpdateData.city = city
      if (country !== undefined) businessUpdateData.country = country
      if (website !== undefined) businessUpdateData.website = website

      if (Object.keys(businessUpdateData).length > 0) {
        await prisma.business.update({
          where: { id: user.business.id },
          data: businessUpdateData,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}