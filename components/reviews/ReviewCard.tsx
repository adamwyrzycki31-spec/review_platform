"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ThumbsUp, Flag, Share2, MoreHorizontal, CheckCircle } from 'lucide-react'
import { StarRating } from './StarRating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn, timeAgo, getInitials, truncate } from '@/lib/utils'

interface ReviewCardProps {
  review: {
    id: string
    userId: string
    businessId: string
    rating: number
    title: string
    content: string
    pros?: string | null
    cons?: string | null
    recommendation: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
    verifiedPurchase: boolean
    helpfulCount: number
    reportCount: number
    createdAt: Date
    updatedAt: Date
    publishedAt?: Date | null
    user?: {
      id?: string
      firstName?: string | null
      lastName?: string | null
      avatarUrl?: string | null
    }
    business?: {
      slug: string
      name?: string
    }
  }
  showBusiness?: boolean
  showActions?: boolean
  className?: string
}

export function ReviewCard({ review, showBusiness = false, showActions = true, className }: ReviewCardProps) {
  const recommendationColors = {
    POSITIVE: 'bg-green-100 text-green-800',
    NEUTRAL: 'bg-amber-100 text-amber-800',
    NEGATIVE: 'bg-red-100 text-red-800',
  }

  const recommendationLabels = {
    POSITIVE: 'Recommended',
    NEUTRAL: 'Mixed feelings',
    NEGATIVE: 'Not recommended',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card rounded-xl border border-border p-6 shadow-sm", className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.user?.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(review.user?.firstName || undefined, review.user?.lastName || undefined)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {review.user?.firstName && review.user?.lastName
                  ? `${review.user.firstName} ${review.user.lastName}`
                  : 'Verified Reviewer'}
              </span>
              {review.verifiedPurchase && (
                <Badge variant="success" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StarRating rating={review.rating} size="sm" />
              <span>•</span>
              <span>{timeAgo(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{review.title}</h3>

      {/* Content */}
      <p className="text-muted-foreground leading-relaxed mb-4">
        {truncate(review.content, 300)}
      </p>

      {/* Pros & Cons */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {review.pros && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-green-800 mb-1">Pros</div>
              <p className="text-sm text-green-700">{truncate(review.pros, 100)}</p>
            </div>
          )}
          {review.cons && (
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-red-800 mb-1">Cons</div>
              <p className="text-sm text-red-700">{truncate(review.cons, 100)}</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendation Badge */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Badge className={recommendationColors[review.recommendation]}>
          {recommendationLabels[review.recommendation]}
        </Badge>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ThumbsUp className="h-4 w-4 mr-1" />
            Helpful ({review.helpfulCount})
          </Button>
          {showBusiness && review.business && (
            <Link href={`/business/${review.business.slug}`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View Business
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface ReviewImagesProps {
  images: { url: string; caption?: string }[]
  className?: string
}

export function ReviewImages({ images, className }: ReviewImagesProps) {
  if (images.length === 0) return null

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {images.map((image, index) => (
        <div
          key={index}
          className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Image
            src={image.url}
            alt={image.caption || `Review image ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
