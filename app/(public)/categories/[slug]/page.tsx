import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrafficLightBadge } from '@/components/business/TrafficLight'
import { StarRating } from '@/components/reviews/StarRating'
import prisma from '@/lib/db'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

interface BusinessWithReviews {
  id: string
  name: string
  slug: string
  description: string | null
  city: string | null
  country: string | null
  trustScore: unknown
  trafficLightStatus: 'RED' | 'AMBER' | 'GREEN'
  reviews: { id: string }[]
}

interface CategoryWithBusinesses {
  id: string
  name: string
  slug: string
  description: string | null
  businesses: BusinessWithReviews[]
  _count: { businesses: number }
}

async function getCategory(slug: string): Promise<CategoryWithBusinesses | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      businesses: {
        take: 20,
        orderBy: { trustScore: 'desc' },
        include: {
          reviews: {
            where: { status: 'APPROVED' },
            select: { id: true },
          },
        },
      },
      _count: {
        select: { businesses: true },
      },
    },
  })
  return category as CategoryWithBusinesses | null
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  
  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: category.name,
    description: category.description || `Browse trusted ${category.name} businesses on MyProtector`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="bg-muted/30 py-12">
      <div className="container-app">
        <Link href="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          All Categories
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-xl text-muted-foreground">{category.description}</p>
          )}
          <p className="text-primary font-medium mt-2">
            {category._count.businesses.toLocaleString()} businesses
          </p>
        </div>

        {category.businesses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.businesses.map((business) => (
              <Link key={business.id} href={`/business/${business.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{business.name}</h3>
                        <TrafficLightBadge status={business.trafficLightStatus} />
                      </div>
                    </div>
                    
                    {business.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <StarRating rating={Number(business.trustScore)} size="sm" />
                        <span className="font-medium">{Number(business.trustScore).toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({business.reviews.length} reviews)
                      </span>
                    </div>
                    
                    {(business.city || business.country) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
                        <MapPin className="h-4 w-4" />
                        <span>{[business.city, business.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No businesses found in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
