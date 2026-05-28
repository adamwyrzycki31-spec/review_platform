"use client"

import { Star, Shield } from 'lucide-react'

interface CompactWidgetProps {
  trustScore: number
  trafficLightStatus: 'GREEN' | 'AMBER' | 'RED'
}

export function CompactWidget({
  trustScore,
  trafficLightStatus
}: CompactWidgetProps) {
  const colors = {
    GREEN: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
    AMBER: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30' },
    RED: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
  }

  const color = colors[trafficLightStatus]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${color.bg} ${color.border}`}>
      <Shield className={`h-4 w-4 ${color.text}`} />
      <span className={`text-sm font-bold ${color.text}`}>{trustScore.toFixed(1)}</span>
      <Star className={`h-3 w-3 text-yellow-500 fill-yellow-500 ${color.text}`} />
    </div>
  )
}

export function CompactWidgetCode({ businessSlug }: { businessSlug: string }) {
  return `<!-- MyProtector Compact Widget -->
<script src="https://cdn.myprotector.org/widgets/compact.js" async></script>
<div class="mp-compact" data-business="${businessSlug}"></div>`
}