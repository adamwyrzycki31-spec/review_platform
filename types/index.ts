// TypeScript types for myprotector.org

// User Types
export type UserRole = 'INDIVIDUAL' | 'BUSINESS' | 'RESELLER' | 'SUPPORT' | 'ADMIN'

export interface User {
  id: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  avatarUrl?: string
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  business?: Business
  reseller?: Reseller
}

// Business Types
export type SubscriptionTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'EXPIRED'
export type TrafficLightStatus = 'RED' | 'AMBER' | 'GREEN'

export interface Business {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  businessEmail?: string
  categoryId?: string
  category?: Category
  trustScore: number
  reviewCount: number
  subscriptionTier: SubscriptionTier
  subscriptionStatus: SubscriptionStatus
  subscriptionExpiresAt?: Date
  trafficLightStatus: TrafficLightStatus
  insuranceUrl?: string
  termsUrl?: string
  promisePageUrl?: string
  claimPageUrl?: string
  createdAt: Date
  updatedAt: Date
  verifiedAt?: Date
  reviews?: Review[]
}

export interface BusinessProfile extends Business {
  trafficSignal?: TrafficSignal
  reviews?: Review[]
  stats?: BusinessStats
}

export interface BusinessStats {
  totalReviews: number
  averageRating: number
  positiveReviews: number
  neutralReviews: number
  negativeReviews: number
  trustScore: number
}

// Review Types
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
export type Recommendation = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'

export interface Review {
  id: string
  userId: string
  user?: User
  businessId: string
  business?: Business
  rating: number
  title: string
  content: string
  pros?: string
  cons?: string
  recommendation: Recommendation
  status: ReviewStatus
  verifiedPurchase: boolean
  helpfulCount: number
  reportCount: number
  images?: ReviewImage[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface ReviewImage {
  id: string
  reviewId: string
  url: string
  cloudinaryId?: string
  caption?: string
  order: number
  createdAt: Date
}

export interface CreateReviewInput {
  businessId: string
  rating: number
  title: string
  content: string
  pros?: string
  cons?: string
  recommendation?: Recommendation
  images?: File[]
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  reviewCount: number
  businessCount?: number
  createdAt: Date
  updatedAt: Date
}

// Traffic Signal Types
export interface TrafficSignal {
  id: string
  businessId: string
  hasInsurance: boolean
  hasRefundPromise: boolean
  hasClaimPage: boolean
  hasTermsClauses: boolean
  hasActiveSubscription: boolean
  verifiedAt?: Date
  expiresAt?: Date
  verifiedById?: string
  notes?: string
}

export interface TrafficSignalCheck {
  label: string
  description: string
  status: boolean
  icon: string
}

// Blacklist Types
export type BlacklistStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Blacklist {
  id: string
  businessId: string
  business?: Business
  reporterId: string
  reporter?: User
  reason: string
  evidenceUrls?: string[]
  status: BlacklistStatus
  adminNotes?: string
  createdAt: Date
  resolvedAt?: Date
}

// Reseller Types
export interface Reseller {
  id: string
  userId: string
  user?: User
  referralCode: string
  commissionRate: number
  totalCommission: number
  paidCommission: number
  clientCount: number
  stripeAccountId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Commission {
  id: string
  resellerId: string
  businessId: string
  business?: Business
  amount: number
  status: 'PENDING' | 'APPROVED' | 'PAID'
  description?: string
  createdAt: Date
  paidAt?: Date
}

// Widget Types
export type WidgetType = 'BADGE' | 'CAROUSEL' | 'SCORE' | 'COMPACT'

export interface Widget {
  id: string
  businessId: string
  type: WidgetType
  name: string
  config: WidgetConfig
  embedCode: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WidgetConfig {
  theme?: 'light' | 'dark'
  accentColor?: string
  showLogo?: boolean
  maxReviews?: number
  style?: Record<string, string>
}

// Support Ticket Types
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface SupportTicket {
  id: string
  userId: string
  user?: User
  businessId?: string
  business?: Business
  subject: string
  content: string
  status: TicketStatus
  priority: TicketPriority
  assignedTo?: string
  assignee?: User
  messages?: TicketMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface TicketMessage {
  id: string
  ticketId: string
  userId: string
  user?: User
  content: string
  isInternal: boolean
  createdAt: Date
}

// Report Types
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED'

export interface Report {
  id: string
  reviewId: string
  review?: Review
  reporterId: string
  reporter?: User
  reason: string
  description?: string
  status: ReportStatus
  adminNotes?: string
  createdAt: Date
  resolvedAt?: Date
}

// SEO Types
export interface PageSeo {
  pagePath: string
  metaTitle?: string
  metaDescription?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonicalUrl?: string
  robots?: {
    index?: boolean
    follow?: boolean
  }
  schemaMarkup?: Record<string, unknown>
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Dashboard Types
export interface DashboardStats {
  totalBusinesses: number
  totalReviews: number
  totalUsers: number
  averageRating: number
  pendingReviews: number
  pendingTickets: number
  newThisMonth: {
    businesses: number
    reviews: number
    users: number
  }
}

export interface BusinessDashboardStats {
  totalReviews: number
  averageRating: number
  trustScore: number
  totalViews: number
  thisMonth: {
    reviews: number
    rating: number
  }
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// Email Types
export interface EmailTemplate {
  id: string
  name: string
  slug: string
  subject: string
  body: string
  variables?: string[]
  isActive: boolean
}

// Search Types
export interface SearchFilters {
  query?: string
  category?: string
  rating?: number
  trafficLight?: TrafficLightStatus
  location?: string
  sortBy?: 'rating' | 'reviews' | 'trust' | 'recent'
}

export interface SearchResult {
  businesses: Business[]
  categories: Category[]
  total: number
  page: number
  pageSize: number
}

// Form Types
export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  role: UserRole
}

export interface BusinessSignupFormData extends SignupFormData {
  businessName: string
  website?: string
  category?: string
}

export interface ResellerSignupFormData extends SignupFormData {
  companyName?: string
  referralCode?: string
}

// Subscription Plans
export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    reviews?: number
    images?: number
    widgets?: number
    employees?: number
  }
}
