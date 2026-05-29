import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail } from '@/lib/email'

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const tab = searchParams.get('tab') || 'all'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role && role !== 'all') {
      where.role = role
    } else if (tab && tab !== 'all') {
      // Map tab values to roles
      const tabRoles: Record<string, string> = {
        admins: 'ADMIN',
        businesses: 'BUSINESS',
        individuals: 'INDIVIDUAL',
        resellers: 'RESELLER',
        support: 'SUPPORT',
      }
      if (tabRoles[tab]) {
        where.role = tabRoles[tab]
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        reseller: {
          select: {
            id: true,
            commissionBalance: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get stats
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    })

    const statsMap = stats.reduce((acc, item) => {
      acc[item.role] = item._count.role
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      users,
      stats: {
        total: users.length,
        admins: statsMap['ADMIN'] || 0,
        businesses: statsMap['BUSINESS'] || 0,
        individuals: statsMap['INDIVIDUAL'] || 0,
        resellers: statsMap['RESELLER'] || 0,
        support: statsMap['SUPPORT'] || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/admin/users - Create user or perform action
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, userId, data } = body

    switch (action) {
      case 'create': {
        // Create a new user (admin creation)
        const passwordHash = await bcrypt.hash(data.password || 'TempPass123!', 12)
        const verificationToken = uuidv4()

        const newUser = await prisma.user.create({
          data: {
            email: data.email,
            passwordHash,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            role: data.role,
            emailVerified: new Date(),
            emailVerificationToken: verificationToken,
          },
        })

        return NextResponse.json({ success: true, user: newUser })
      }

      case 'update': {
        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
          },
        })
        return NextResponse.json({ success: true, user: updatedUser })
      }

      case 'delete': {
        // Delete user
        await prisma.user.delete({
          where: { id: userId },
        })
        return NextResponse.json({ success: true, message: 'User deleted' })
      }

      case 'verify-email': {
        // Verify user email
        await prisma.user.update({
          where: { id: userId },
          data: {
            emailVerified: new Date(),
          },
        })
        return NextResponse.json({ success: true, message: 'Email verified' })
      }

      case 'send-email': {
        // Send email notification
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user) {
          await sendEmail({
            to: user.email,
            subject: data.subject || 'Message from MyProtector Admin',
            html: data.html || `<p>${data.message || 'You have a new message.'}</p>`,
          })
        }
        return NextResponse.json({ success: true, message: 'Email sent' })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing user action:', error)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}
