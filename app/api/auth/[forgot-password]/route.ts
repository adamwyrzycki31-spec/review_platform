import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Simple token generator
function generateResetToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration attacks
    // This is a security best practice
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    // Check if user has a password (OAuth users may not)
    if (!user.passwordHash) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // In production, store reset token in database
    // For now, we generate a token that can be used in the reset URL
    // The actual implementation would store this in a PasswordReset table

    // TODO: Send password reset email
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
    // await sendPasswordResetEmail(email, resetUrl)

    // For demo purposes, log the token (in production, don't do this!)
    console.log(`Password reset token for ${email}: ${resetToken}`)

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Include token in dev for testing (remove in production!)
      ...(process.env.NODE_ENV === 'development' && { 
        devToken: resetToken,
        devMessage: 'Development mode: Token is shown for testing purposes only'
      })
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}