import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// Simple token generator
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'INDIVIDUAL',
      businessName,
      companyName
    } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Validate role
    const validRoles = ['INDIVIDUAL', 'BUSINESS', 'RESELLER']
    const userRole = validRoles.includes(role) ? role : 'INDIVIDUAL'

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create verification token
    const verificationToken = generateToken()
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          firstName: firstName || null,
          lastName: lastName || null,
          role: userRole as any,
        },
      })

      // If business role, create business profile
      if (userRole === 'BUSINESS') {
        const businessNameToUse = businessName || companyName || `${firstName || ''} ${lastName || ''}'s Business`.trim()
        
        // Generate unique slug
        let slug = businessNameToUse
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        // Check for existing slug
        const existingSlug = await tx.business.findUnique({ where: { slug } })
        if (existingSlug) {
          slug = `${slug}-${Date.now()}`
        }

        await tx.business.create({
          data: {
            userId: user.id,
            name: businessNameToUse,
            slug,
            businessEmail: email.toLowerCase(),
          },
        })
      }

      // If reseller role, create reseller profile
      if (userRole === 'RESELLER') {
        const referralCode = generateToken().substring(0, 8).toUpperCase()
        
        await tx.reseller.create({
          data: {
            userId: user.id,
            referralCode,
          },
        })
      }

      return { userId: user.id, role: userRole }
    })

    // TODO: Send verification email
    // For now, we'll auto-verify users (in production, send actual email)
    // await sendVerificationEmail(email, verificationToken)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: result.userId,
        email: email.toLowerCase(),
        role: result.role,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}