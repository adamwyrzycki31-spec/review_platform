import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Globe, Phone, Mail, ExternalLink, Share2, Flag, Calendar, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TrafficLightIndicator, TrafficLightChecklist } from '@/components/business/TrafficLight'
import { StarRating, RatingSummary } from '@/components/reviews/StarRating'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import prisma from '@/lib/db'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface BusinessPageProps {
  params: Promise<{ slug: string }>
}

interface ReviewWithUser {
  id: string
  userId: string
  businessId: string
  rating: number
  title: string
  content: string
  pros: string | null
  cons: string | null
  recommendation: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  verifiedPurchase: boolean
  helpfulCount: number
  reportCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  user: { id: string; firstName: string | null; lastName: string | null; avatarUrl: string | null }
}

interface TrafficSignalData {
  id: string
  businessId: string
  hasInsurance: boolean
  hasRefundPromise: boolean
  hasClaimPage: boolean
  hasTermsClauses: boolean
  hasActiveSubscription: boolean
}

interface BusinessData {
  id: string
  name: string
  slug: string
  description: string | null
  website: string | null
  logoUrl: string | null
  coverImageUrl: string | null
  address: string | null
  city: string | null
  country: string | null
  phone: string | null
  businessEmail: string | null
  trustScore: unknown
  reviewCount: number
  trafficLightStatus: 'RED' | 'AMBER' | 'GREEN'
  insuranceUrl: string | null
  termsUrl: string | null
  promisePageUrl: string | null
  claimPageUrl: string | null
  reviews: ReviewWithUser[]
  trafficSignal: TrafficSignalData | null
  category: { name: string } | null
  createdAt: Date
  updatedAt: Date
}

async function getBusiness(slug: string): Promise<BusinessData | null> {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      category: true,
      trafficSignal: true,
      reviews: {
        where: { status: 'APPROVED' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: 10,
      },
    },
  })

  return business as BusinessData | null
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await getBusiness(slug)
  
  if (!business) {
    return { title: 'Business Not Found' }
  }

  return {
    title: business.name,
    description: business.description || `Read reviews and trust signals for ${business.name}`,
    openGraph: {
      title: `${business.name} - MyProtector`,
      description: business.description || `Reviews and trust information for ${business.name}`,
      images: business.logoUrl ? [business.logoUrl] : undefined,
    },
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    notFound()
  }

  // Calculate rating distribution
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  business.reviews.forEach((review: ReviewWithUser) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[review.rating]++
    }
  })

  return (
    <div className="bg-muted/30">
      {/* Cover & Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 to-emerald-500/20">
        {business.coverImageUrl && (
          <Image
            src={business.coverImageUrl}
            alt={business.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="container-app absolute bottom-0 left-0 right-0 pb-6">
          <div className="flex items-end gap-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-background border-4 border-background shadow-xl">
              {business.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt={business.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-primary">
                  {business.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{business.name}</h1>
              <div className="flex items-center gap-4 text-white/90 text-sm">
                {business.category && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {business.category.name}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <StarRating rating={Number(business.trustScore)} size="sm" />
                  <span className="font-medium">{Number(business.trustScore).toFixed(1)}</span>
                </div>
                <span>({business.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="hidden md:block pb-2">
              <TrafficLightIndicator status={business.trafficLightStatus} size="lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {business.description && (
              <section>
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{business.description}</p>
              </section>
            )}

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Reviews ({business.reviewCount})</h2>
                <Link href={`/leave-review/${business.slug}`}>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </Link>
              </div>

              {business.reviews.length > 0 ? (
                <div className="space-y-4">
                  {business.reviews.map((review: ReviewWithUser) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to share your experience</p>
                  <Link href={`/leave-review/${business.slug}`}>
                    <Button variant="outline">Write a Review</Button>
                  </Link>
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Score Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Trust Score</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl font-bold">{Number(business.trustScore).toFixed(1)}</div>
                    <StarRating rating={Number(business.trustScore)} showValue />
                  </div>
                  <TrafficLightIndicator status={business.trafficLightStatus} size="md" />
                </div>
                
                <div className="border-t pt-4">
                  <RatingSummary
                    rating={Number(business.trustScore)}
                    totalReviews={business.reviewCount}
                    distribution={ratingDistribution}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Trust Signals */}
            {business.trafficSignal && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Trust Verification</h3>
                  <TrafficLightChecklist signal={business.trafficSignal} business={business} />
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {(business.city || business.country) && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[business.city, business.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm hover:text-primary"
                    >
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>Visit Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.businessEmail && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{business.businessEmail}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Link href={`/leave-review/${business.slug}`} className="w-full">
                    <Button className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Write a Review
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" className="w-full text-destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Report Business
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Business Since */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Listed since {new Date(business.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
