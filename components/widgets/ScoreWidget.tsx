"use client"

import { Star } from 'lucide-react'

interface ScoreWidgetProps {
  trustScore: number
  reviewCount: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export function ScoreWidget({
  trustScore,
  reviewCount,
  size = 'md',
  showCount = true
}: ScoreWidgetProps) {
  const sizeClasses = {
    sm: { star: 'h-3 w-3', text: 'text-sm', count: 'text-xs' },
    md: { star: 'h-4 w-4', text: 'text-base', count: 'text-sm' },
    lg: { star: 'h-5 w-5', text: 'text-xl', count: 'text-base' },
  }

  const classes = sizeClasses[size]

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className={`${classes.star} text-yellow-500 fill-yellow-500`} />
        <span className={`font-bold ${classes.text}`}>{trustScore.toFixed(1)}</span>
      </div>
      {showCount && (
        <span className={`text-muted-foreground ${classes.count}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  )
}

export function ScoreWidgetCode({ businessSlug }: { businessSlug: string }) {
  return `<!-- MyProtector Score Widget -->
<script src="https://cdn.myprotector.org/widgets/score.js" async></script>
<div class="mp-score" data-business="${businessSlug}"></div>`
}