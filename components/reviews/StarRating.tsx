"use client"

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index)
    }
  }

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isFilled = interactive
            ? hoverRating ? starValue <= hoverRating : starValue <= rating
            : starValue <= rating
          
          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                "transition-transform",
                interactive && "cursor-pointer hover:scale-110 active:scale-95",
                !interactive && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  isFilled ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-slate-300"
                )}
              />
            </button>
          )
        })}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

interface RatingSummaryProps {
  rating: number
  totalReviews: number
  distribution: Record<number, number>
  className?: string
}

export function RatingSummary({ rating, totalReviews, distribution, className }: RatingSummaryProps) {
  const getPercentage = (stars: number) => {
    if (totalReviews === 0) return 0
    return Math.round((distribution[stars] / totalReviews) * 100)
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-4">
        <div className="text-5xl font-bold text-foreground">{rating.toFixed(1)}</div>
        <div className="flex flex-col">
          <StarRating rating={Math.round(rating)} size="lg" />
          <span className="text-sm text-muted-foreground mt-1">
            {totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="flex items-center gap-3">
            <span className="text-sm w-3">{stars}</span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${getPercentage(stars)}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground w-10 text-right">
              {getPercentage(stars)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
