"use client"

import { Star } from 'lucide-react'
import { TrafficLightIndicator } from '@/components/business/TrafficLight'

interface BadgeWidgetProps {
  businessName: string
  trustScore: number
  reviewCount: number
  trafficLightStatus: 'GREEN' | 'AMBER' | 'RED'
  theme?: 'light' | 'dark'
  linkUrl?: string
}

export function BadgeWidget({
  businessName,
  trustScore,
  reviewCount,
  trafficLightStatus,
  theme = 'light',
  linkUrl
}: BadgeWidgetProps) {
  const isDark = theme === 'dark'
  
  const content = (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-lg border`}>
      <div className="flex items-center gap-2">
        <TrafficLightIndicator status={trafficLightStatus} size="sm" />
        <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {businessName}
        </span>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded ${isDark ? 'bg-slate-800' : 'bg-muted'}`}>
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {trustScore.toFixed(1)}
        </span>
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
          ({reviewCount})
        </span>
      </div>
    </div>
  )

  if (linkUrl) {
    return <a href={linkUrl} target="_blank" rel="noopener noreferrer">{content}</a>
  }
  
  return content
}

export function BadgeWidgetCode({ businessSlug }: { businessSlug: string }) {
  return `<!-- MyProtector Badge Widget -->
<script src="https://cdn.myprotector.org/widgets/badge.js" async></script>
<div class="mp-badge" data-business="${businessSlug}"></div>`
}