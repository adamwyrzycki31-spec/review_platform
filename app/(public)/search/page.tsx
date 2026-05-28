import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Star, Filter, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TrafficLightBadge } from '@/components/business/TrafficLight'
import { StarRating } from '@/components/reviews/StarRating'
import { Card } from '@/components/ui/card'
import prisma from '@/lib/db'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search Businesses',
  description: 'Search for trusted businesses and read verified reviews on MyProtector.',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; traffic?: string }>
}

interface BusinessSearchResult {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  city: string | null
  country: string | null
  trustScore: unknown
  reviewCount: number
  trafficLightStatus: 'RED' | 'AMBER' | 'GREEN'
  category: { name: string } | null
}

async function SearchResults({ query, category, traffic }: { query?: string; category?: string; traffic?: string }) {
  const where: Record<string, unknown> = {}

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.category = { slug: category }
  }

  if (traffic) {
    where.trafficLightStatus = traffic
  }

  const businesses = await prisma.business.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { trustScore: 'desc' },
    take: 50,
  }) as BusinessSearchResult[]

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No businesses found</h2>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <Link key={business.id} href={`/business/${business.slug}`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {business.logoUrl ? (
                  <Image
                    src={business.logoUrl}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <span className="text-2xl font-bold">{business.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{business.name}</h3>
                  <TrafficLightBadge status={business.trafficLightStatus} />
                </div>
                
                {business.category && (
                  <Badge variant="secondary" className="mb-2">
                    {business.category.name}
                  </Badge>
                )}
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <StarRating rating={Number(business.trustScore)} size="sm" />
                    <span className="font-medium">{Number(business.trustScore).toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({business.reviewCount} reviews)
                  </span>
                </div>
                
                {business.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {business.description}
                  </p>
                )}
                
                {(business.city || business.country) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{[business.city, business.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q
  const category = params.category
  const traffic = params.traffic

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  }) as { id: string; name: string; slug: string }[]

  return (
    <div className="container-app py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Businesses</h1>
        
        {/* Search Form */}
        <form className="mb-8">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search for businesses..."
                className="pl-12 h-12"
              />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <select
              name="category"
              defaultValue={category}
              className="px-4 py-2 rounded-lg border border-input bg-background"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            <select
              name="traffic"
              defaultValue={traffic}
              className="px-4 py-2 rounded-lg border border-input bg-background"
            >
              <option value="">All Trust Levels</option>
              <option value="GREEN">🟢 Trusted (Green)</option>
              <option value="AMBER">🟡 Partial (Amber)</option>
              <option value="RED">🔴 Untrusted (Red)</option>
            </select>
          </div>
        </form>
        
        {/* Results */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-4">Searching...</p>
          </div>
        }>
          <SearchResults query={query} category={category} traffic={traffic} />
        </Suspense>
      </div>
    </div>
  )
}
