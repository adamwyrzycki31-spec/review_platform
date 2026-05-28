import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './db'
import type { UserRole } from '@/types'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: UserRole
      firstName?: string
      lastName?: string
      avatarUrl?: string
      businessId?: string
      resellerId?: string
    }
  }
  
  interface User {
    role: UserRole
    businessId?: string
    resellerId?: string
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: UserRole
    businessId?: string
    resellerId?: string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    newUser: '/signup',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            business: { select: { id: true } },
            reseller: { select: { id: true } },
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role as UserRole,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          avatarUrl: user.avatarUrl || undefined,
          businessId: user.business?.id,
          resellerId: user.reseller?.id,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id
        token.role = user.role
        token.businessId = user.businessId
        token.resellerId = user.resellerId
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.businessId = token.businessId
        session.user.resellerId = token.resellerId
      }
      return session
    },
  },
})

// Auth helper functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN'
}

export function isBusiness(role: UserRole): boolean {
  return role === 'BUSINESS'
}

export function isReseller(role: UserRole): boolean {
  return role === 'RESELLER'
}

export function isSupport(role: UserRole): boolean {
  return role === 'SUPPORT'
}

export function canManageReviews(role: UserRole): boolean {
  return ['ADMIN', 'BUSINESS', 'SUPPORT'].includes(role)
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === 'ADMIN'
}

export function canAccessSupport(role: UserRole): boolean {
  return ['ADMIN', 'SUPPORT'].includes(role)
}
