import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // TODO: Verify token against stored verification tokens
    // For now, we accept any token for demonstration

    // Find user by verification token
    // In production, this would look up a verification token table
    // const user = await prisma.user.findFirst({
    //   where: { verificationToken: token },
    // })

    // For demo purposes, return success
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'Verification token is required' },
      { status: 400 }
    )
  }

  // TODO: Verify token and mark email as verified

  return NextResponse.json({
    success: true,
    message: 'Email verified successfully'
  })
}