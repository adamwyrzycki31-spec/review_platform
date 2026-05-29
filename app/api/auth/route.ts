import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'
import { signIn } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail, generateVerificationEmailHtml, generatePasswordResetHtml, generateWelcomeEmailHtml } from '@/lib/email'

// Unified Auth API - Combines login, register, forgot-password, reset-password, verify-email
// Use the action query parameter to specify the operation: ?action=login|register|forgot-password|reset-password|verify-email

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const body = await request.json()

    switch (action) {
      case 'login':
        return handleLogin(body)
      case 'register':
        return handleRegister(body)
      case 'forgot-password':
        return handleForgotPassword(body)
      case 'reset-password':
        return handleResetPassword(body)
      case 'verify-email':
        return handleVerifyEmail(body)
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: login, register, forgot-password, reset-password, or verify-email' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    )
  }
}

// LOGIN
async function handleLogin(body: { email: string; password: string }) {
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

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

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: 'Please use the login method that was used during registration' },
      { status: 401 }
    )
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)

  if (!isValidPassword) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }

  try {
    await signIn('credentials', {
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
}

// REGISTER
async function handleRegister(body: { email: string; password: string; firstName?: string; lastName?: string; role?: string; businessName?: string }) {
  const { email, password, firstName, lastName, role = 'INDIVIDUAL', businessName } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long' },
      { status: 400 }
    )
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existingUser) {
    return NextResponse.json(
      { error: 'An account with this email already exists' },
      { status: 409 }
    )
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)

  // Generate verification token
  const verificationToken = uuidv4()
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || '',
      lastName: lastName || '',
      role: role as any,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    },
    include: {
      business: { select: { id: true } },
      reseller: { select: { id: true } },
    },
  })

  // If business role, create business profile
  if (role === 'BUSINESS') {
    const business = await prisma.business.create({
      data: {
        userId: user.id,
        name: businessName || `${firstName || email}'s Business`,
        slug: businessName?.toLowerCase().replace(/\s+/g, '-') || `${email.split('@')[0]}-business`,
        trafficLightStatus: 'RED',
      },
    })

    // Create traffic signal
    await prisma.trafficSignal.create({
      data: {
        businessId: business.id,
      },
    })
  }

  // If reseller role, create reseller profile
  if (role === 'RESELLER') {
    await prisma.reseller.create({
      data: {
        userId: user.id,
        referralCode: uuidv4().substring(0, 8).toUpperCase(),
      },
    })
  }

  // Send verification email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${verificationToken}`

  await sendEmail({
    to: user.email,
    subject: 'Verify your MyProtector account',
    html: generateVerificationEmailHtml(verifyUrl, firstName || 'there'),
  })

  return NextResponse.json({
    success: true,
    message: 'Account created successfully. Please check your email to verify your account.',
    userId: user.id,
  })
}

// FORGOT PASSWORD
async function handleForgotPassword(body: { email: string }) {
  const { email } = body

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    // Don't reveal if user exists for security
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    })
  }

  // Generate reset token
  const resetToken = uuidv4()
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    },
  })

  // Send reset email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

  await sendEmail({
    to: user.email,
    subject: 'Reset your MyProtector password',
    html: generatePasswordResetHtml(resetUrl, user.firstName || 'there'),
  })

  return NextResponse.json({
    success: true,
    message: 'If an account with that email exists, we have sent a password reset link.',
  })
}

// RESET PASSWORD
async function handleResetPassword(body: { token: string; password: string }) {
  const { token, password } = body

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and new password are required' },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long' },
      { status: 400 }
    )
  }

  // Find user with valid reset token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired reset token. Please request a new password reset.' },
      { status: 400 }
    )
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12)

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.',
  })
}

// VERIFY EMAIL
async function handleVerifyEmail(body: { token: string }) {
  const { token } = body

  if (!token) {
    return NextResponse.json(
      { error: 'Verification token is required' },
      { status: 400 }
    )
  }

  // Find user with valid verification token
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiry: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired verification token. Please request a new verification email.' },
      { status: 400 }
    )
  }

  // Update user
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  })

  // Send welcome email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  await sendEmail({
    to: user.email,
    subject: 'Welcome to MyProtector!',
    html: generateWelcomeEmailHtml(user.firstName || 'there'),
  })

  return NextResponse.json({
    success: true,
    message: 'Email verified successfully. You can now login.',
  })
}