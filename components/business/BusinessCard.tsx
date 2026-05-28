"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Star, ExternalLink, Building2 } from 'lucide-react'
import { TrafficLightBadge } from './TrafficLight'
import { StarRating } from '@/components/reviews/StarRating'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatNumber } from '@/lib/utils'
import type { Business } from '@/types'

interface BusinessCardProps {
  business: Business
  className?: string
}

export function BusinessCard({ business, className }: BusinessCardProps) {
  return (
    <Link href={`/business/${business.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn("h-full overflow-hidden hover:shadow-lg transition-shadow", className)}>
          <div className="relative h-32 bg-gradient-to-br from-primary/10 to-emerald-500/10">
            {business.coverImageUrl ? (
              <Image
                src={business.coverImageUrl}
                alt={business.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-primary/20" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <TrafficLightBadge status={business.trafficLightStatus} />
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 -mt-8 border-2 border-background shadow-md">
                {business.logoUrl ? (
                  <Image
                    src={business.logoUrl}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{business.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={Number(business.trustScore)} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {Number(business.trustScore).toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({formatNumber(business.reviewCount)})
                  </span>
                </div>
              </div>
            </div>
            
            {business.description && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {business.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {business.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{business.city}</span>
                </div>
              )}
              {business.website && (
                <a 
                  href={business.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}

interface BusinessListItemProps {
  business: Business
  className?: string
}

export function BusinessListItem({ business, className }: BusinessListItemProps) {
  return (
    <Link href={`/business/${business.slug}`}>
      <div className={cn("flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors", className)}>
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {business.logoUrl ? (
            <Image
              src={business.logoUrl}
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{business.name}</h3>
            <TrafficLightBadge status={business.trafficLightStatus} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={Number(business.trustScore)} size="sm" />
            <span className="text-sm text-muted-foreground">
              {Number(business.trustScore).toFixed(1)} ({formatNumber(business.reviewCount)} reviews)
            </span>
          </div>
        </div>
        
        {business.category && (
          <div className="hidden md:block text-sm text-muted-foreground">
            {business.category.name}
          </div>
        )}
        
        {business.city && (
          <div className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {business.city}
          </div>
        )}
      </div>
    </Link>
  )
}
