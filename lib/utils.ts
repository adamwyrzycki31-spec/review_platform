import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import slugify from 'slugify'

// Merge Tailwind classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Slugify text
export function slug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true
  })
}

// Generate unique slug
export function uniqueSlug(text: string, existingSlugs: string[] = []): string {
  const baseSlug = slug(text)
  let slug = baseSlug
  let counter = 1
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}

// Format date relative
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

// Format date
export function formatDate(date: Date | string, formatStr = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr)
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

// Generate random string
export function generateId(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Calculate trust score from traffic signals
export function calculateTrustScore(signal: {
  hasInsurance: boolean
  hasRefundPromise: boolean
  hasClaimPage: boolean
  hasTermsClauses: boolean
  hasActiveSubscription: boolean
}): number {
  const conditions = [
    signal.hasInsurance,
    signal.hasRefundPromise,
    signal.hasClaimPage,
    signal.hasTermsClauses,
    signal.hasActiveSubscription
  ]
  
  return (conditions.filter(Boolean).length / 5) * 100
}

// Get traffic light status from score
export function getTrafficLightStatus(score: number): 'RED' | 'AMBER' | 'GREEN' {
  if (score >= 100) return 'GREEN'
  if (score >= 40) return 'AMBER'
  return 'RED'
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

// Calculate average rating
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, r) => acc + r, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

// Get rating distribution
export function getRatingDistribution(reviews: { rating: number }[]): Record<number, number> {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating]++
    }
  })
  return distribution
}

// Validate URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Sanitize HTML (basic)
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}

// Get initials from name
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return first + last || '?'
}

// Rating to percentage
export function ratingToPercent(rating: number): number {
  return (rating / 5) * 100
}

// Get recommendation label
export function getRecommendationLabel(rec: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'): string {
  const labels = {
    POSITIVE: 'Recommended',
    NEUTRAL: 'Mixed Feelings',
    NEGATIVE: 'Not Recommended'
  }
  return labels[rec]
}

// Pluralize word
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`)
}

// Mask email for privacy
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : local
  
  return `${maskedLocal}@${domain}`
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}
