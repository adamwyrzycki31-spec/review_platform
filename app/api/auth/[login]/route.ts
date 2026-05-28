import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { signIn } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        business: { select: { id: true } },
        reseller: { select: { id: true } },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if password is set
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Please use the login method that was used during registration' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified (if verification is enabled)
    // For now, we'll allow login even without verification

    // Sign in using NextAuth credentials provider
    try {
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          businessId: user.business?.id,
          resellerId: user.reseller?.id,
        },
      })
    } catch (authError) {
      console.error('Auth signin error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}