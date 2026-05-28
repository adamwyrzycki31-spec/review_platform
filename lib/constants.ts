// App Constants for myprotector.org

// App Info
export const APP_NAME = 'MyProtector'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://myprotector.org'
export const APP_DESCRIPTION = 'Trusted Reviews & Business Verification Platform'
export const APP_KEYWORDS = ['reviews', 'trust', 'business verification', 'ratings', 'customer reviews']

// Traffic Light Conditions
export const TRAFFIC_LIGHT_CONDITIONS = [
  {
    key: 'hasInsurance',
    label: 'Insurance Policy',
    description: 'Company has verified insurance coverage',
    icon: 'Shield'
  },
  {
    key: 'hasRefundPromise',
    label: 'Refund Promise',
    description: 'Company offers refund guarantee or promise page',
    icon: 'RefreshCw'
  },
  {
    key: 'hasClaimPage',
    label: 'Claim Process',
    description: 'Company has a clear insurance claim process',
    icon: 'FileText'
  },
  {
    key: 'hasTermsClauses',
    label: 'Terms & Conditions',
    description: 'Terms include proper refund and insurance clauses',
    icon: 'Scale'
  },
  {
    key: 'hasActiveSubscription',
    label: 'Premium Partner',
    description: 'Company has an active paid subscription',
    icon: 'CheckCircle'
  }
] as const

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    tier: 'FREE' as const,
    price: 0,
    interval: 'month' as const,
    features: [
      'Basic business profile',
      'Up to 10 reviews/month',
      'Simple review badge widget',
      'Email support'
    ],
    limits: {
      reviews: 10,
      images: 5,
      widgets: 1
    }
  },
  STARTER: {
    name: 'Starter',
    tier: 'STARTER' as const,
    price: 29,
    interval: 'month' as const,
    features: [
      'Everything in Free',
      'Unlimited reviews',
      'Review analytics',
      'Response to reviews',
      'Custom widgets',
      'Priority support'
    ],
    limits: {
      reviews: -1,
      images: 50,
      widgets: 5
    }
  },
  PROFESSIONAL: {
    name: 'Professional',
    tier: 'PROFESSIONAL' as const,
    price: 79,
    interval: 'month' as const,
    features: [
      'Everything in Starter',
      'Traffic light verification',
      'Trust badge display',
      'White-label widgets',
      'API access',
      'Dedicated account manager'
    ],
    limits: {
      reviews: -1,
      images: -1,
      widgets: -1
    }
  },
  ENTERPRISE: {
    name: 'Enterprise',
    tier: 'ENTERPRISE' as const,
    price: 199,
    interval: 'month' as const,
    features: [
      'Everything in Professional',
      'Multi-location support',
      'Custom integrations',
      'SLA guarantee',
      'White-glove onboarding',
      'Volume discounts'
    ],
    limits: {
      reviews: -1,
      images: -1,
      widgets: -1
    }
  }
}

// Rating Labels
export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent'
}

// Report Reasons
export const REPORT_REASONS = [
  'Fake or spam review',
  'Inappropriate content',
  'Harassment or threats',
  'Offensive language',
  'Misinformation',
  'Conflict of interest',
  'Duplicate review',
  'Other'
]

// Blacklist Reasons
export const BLACKLIST_REASONS = [
  'Fraudulent activity',
  'Scam reports',
  'Unresolved complaints',
  'License violations',
  'Legal issues',
  'Customer protection concern',
  'Other'
]

// Categories
export const DEFAULT_CATEGORIES = [
  {
    name: 'Retail & E-commerce',
    slug: 'retail-ecommerce',
    icon: 'ShoppingBag',
    description: 'Online and physical retail businesses'
  },
  {
    name: 'Financial Services',
    slug: 'financial-services',
    icon: 'DollarSign',
    description: 'Banks, insurance, investments'
  },
  {
    name: 'Technology',
    slug: 'technology',
    icon: 'Cpu',
    description: 'Software, hardware, IT services'
  },
  {
    name: 'Healthcare',
    slug: 'healthcare',
    icon: 'Heart',
    description: 'Medical services, pharmacies, clinics'
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    icon: 'Home',
    description: 'Agents, agencies, property management'
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    icon: 'Car',
    description: 'Dealers, repair, rental services'
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    icon: 'Wrench',
    description: 'Contractors, plumbers, electricians'
  },
  {
    name: 'Travel & Hospitality',
    slug: 'travel-hospitality',
    icon: 'Plane',
    description: 'Hotels, airlines, travel agencies'
  },
  {
    name: 'Education',
    slug: 'education',
    icon: 'GraduationCap',
    description: 'Schools, courses, training'
  },
  {
    name: 'Professional Services',
    slug: 'professional-services',
    icon: 'Briefcase',
    description: 'Lawyers, accountants, consultants'
  }
]

// Email Templates
export const EMAIL_TEMPLATES = {
  VERIFY_EMAIL: 'verify-email',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  REVIEW_INVITATION: 'review-invitation',
  REVIEW_RECEIVED: 'review-received',
  REVIEW_APPROVED: 'review-approved',
  REVIEW_REPORTED: 'review-reported',
  SUBSCRIPTION_CONFIRMED: 'subscription-confirmed',
  SUBSCRIPTION_CANCELLED: 'subscription-cancelled',
  NEW_REVIEW_NOTIFICATION: 'new-review-notification',
  TICKET_CREATED: 'ticket-created',
  TICKET_RESOLVED: 'ticket-resolved'
}

// API Routes
export const API_ROUTES = {
  AUTH: '/api/auth',
  BUSINESSES: '/api/businesses',
  REVIEWS: '/api/reviews',
  CATEGORIES: '/api/categories',
  SEARCH: '/api/search',
  UPLOAD: '/api/upload',
  ADMIN: '/api/admin',
  EMAIL: '/api/email'
}

// Page Paths
export const PAGE_PATHS = {
  HOME: '/',
  ABOUT: '/about',
  PRICING: '/pricing',
  CATEGORIES: '/categories',
  CATEGORY: (slug: string) => `/categories/${slug}`,
  BUSINESS: (slug: string) => `/business/${slug}`,
  BUSINESS_REVIEWS: (slug: string) => `/business/${slug}/reviews`,
  LEAVE_REVIEW: (slug: string) => `/leave-review/${slug}`,
  SEARCH: '/search',
  BLOG: '/blog',
  CONTACT: '/contact',
  SUPPORT: '/support',
  BLACKLIST: '/blacklist',
  TRUST_SIGNALS: '/trust-signals',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SIGNUP_BUSINESS: '/signup/business',
  SIGNUP_RESELLER: '/signup/reseller',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  DASHBOARD_PROFILE: '/dashboard/profile',
  DASHBOARD_BUSINESS: '/dashboard/business',
  DASHBOARD_BUSINESS_ANALYTICS: '/dashboard/business/analytics',
  DASHBOARD_BUSINESS_SUBSCRIPTION: '/dashboard/business/subscription',
  DASHBOARD_BUSINESS_REVIEWS: '/dashboard/business/reviews',
  DASHBOARD_BUSINESS_WIDGETS: '/dashboard/business/widgets',
  DASHBOARD_RESELLER: '/dashboard/reseller',
  DASHBOARD_RESELLER_COMMISSIONS: '/dashboard/reseller/commissions',
  DASHBOARD_RESELLER_CLIENTS: '/dashboard/reseller/clients',
  DASHBOARD_SUPPORT: '/dashboard/support',
  DASHBOARD_SUPPORT_TICKETS: '/dashboard/support/tickets',
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_ADMIN_USERS: '/dashboard/admin/users',
  DASHBOARD_ADMIN_BUSINESSES: '/dashboard/admin/businesses',
  DASHBOARD_ADMIN_REVIEWS: '/dashboard/admin/reviews',
  DASHBOARD_ADMIN_CATEGORIES: '/dashboard/admin/categories',
  DASHBOARD_ADMIN_BLACKLIST: '/dashboard/admin/blacklist',
  DASHBOARD_ADMIN_TRAFFIC_LIGHTS: '/dashboard/admin/traffic-lights',
  DASHBOARD_ADMIN_SEO: '/dashboard/admin/seo',
  DASHBOARD_ADMIN_EMAILS: '/dashboard/admin/emails',
  DASHBOARD_ADMIN_SETTINGS: '/dashboard/admin/settings'
}

// Social Links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/myprotector',
  FACEBOOK: 'https://facebook.com/myprotector',
  LINKEDIN: 'https://linkedin.com/company/myprotector',
  INSTAGRAM: 'https://instagram.com/myprotector'
}

// Meta Defaults
export const DEFAULT_META = {
  title: `${APP_NAME} - Trusted Reviews & Business Verification`,
  description: APP_DESCRIPTION,
  ogImage: '/images/og-image.jpg',
  twitterCard: 'summary_large_image'
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZES: [10, 20, 50, 100]
}

// File Upload
export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_PDF_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_PDF_TYPES: ['application/pdf']
}

// Cache Keys
export const CACHE_KEYS = {
  BUSINESSES: 'businesses',
  BUSINESS: 'business',
  REVIEWS: 'reviews',
  CATEGORIES: 'categories',
  STATS: 'stats'
}

// Redis Rate Limit
export const RATE_LIMITS = {
  GENERAL: { limit: 100, window: '1m' },
  AUTH: { limit: 10, window: '1m' },
  REVIEW: { limit: 5, window: '1h' },
  UPLOAD: { limit: 20, window: '1h' },
  API: { limit: 1000, window: '1d' }
}
