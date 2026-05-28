import { z } from 'zod'

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  role: z.enum(['INDIVIDUAL', 'BUSINESS', 'RESELLER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const businessSignupSchema = signupSchema.extend({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  category: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Profile Schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})

// Business Schemas
export const createBusinessSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().max(1000).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  businessEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  categoryId: z.string().uuid('Invalid category').optional(),
})

export const updateBusinessSchema = createBusinessSchema.partial().extend({
  insuranceUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  termsUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  promisePageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  claimPageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
})

// Review Schemas
export const createReviewSchema = z.object({
  businessId: z.string().uuid('Invalid business'),
  rating: z.number().min(1).max(5),
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  content: z.string().min(50, 'Review must be at least 50 characters').max(5000),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
  recommendation: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']).optional(),
})

export const reportReviewSchema = z.object({
  reviewId: z.string().uuid('Invalid review'),
  reason: z.string().min(10, 'Please provide a detailed reason'),
  description: z.string().max(1000).optional(),
})

// Blacklist Schemas
export const createBlacklistSchema = z.object({
  businessId: z.string().uuid('Invalid business'),
  reason: z.string().min(20, 'Please provide a detailed reason'),
  evidenceUrls: z.array(z.string().url()).max(5).optional(),
})

// Support Ticket Schemas
export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  content: z.string().min(20, 'Message must be at least 20 characters').max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  businessId: z.string().uuid('Invalid business').optional(),
})

export const ticketMessageSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket'),
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  isInternal: z.boolean().optional(),
})

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  parentId: z.string().uuid('Invalid parent category').optional(),
})

// Widget Schemas
export const createWidgetSchema = z.object({
  businessId: z.string().uuid('Invalid business'),
  type: z.enum(['BADGE', 'CAROUSEL', 'SCORE', 'COMPACT']),
  name: z.string().min(2, 'Widget name must be at least 2 characters'),
  config: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color').optional(),
    showLogo: z.boolean().optional(),
    maxReviews: z.number().min(3).max(20).optional(),
  }).optional(),
})

// Search Schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  trafficLight: z.enum(['RED', 'AMBER', 'GREEN']).optional(),
  location: z.string().optional(),
  sortBy: z.enum(['rating', 'reviews', 'trust', 'recent']).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})

// SEO Schemas
export const updateSeoSchema = z.object({
  pagePath: z.string(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  ogTitle: z.string().max(70).optional(),
  ogDescription: z.string().max(95).optional(),
  ogImage: z.string().url().optional().or(z.literal('')),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  robots: z.object({
    index: z.boolean().optional(),
    follow: z.boolean().optional(),
  }).optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type BusinessSignupInput = z.infer<typeof businessSignupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type ReportReviewInput = z.infer<typeof reportReviewSchema>
export type CreateBlacklistInput = z.infer<typeof createBlacklistSchema>
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type UpdateSeoInput = z.infer<typeof updateSeoSchema>
