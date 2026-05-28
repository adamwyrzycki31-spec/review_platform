"use client"

import { motion } from 'framer-motion'
import { Shield, ShieldCheck, ShieldAlert, CheckCircle, XCircle, RefreshCw, FileText, Scale, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrafficLightStatus, TrafficSignal } from '@/types'

interface TrafficLightIndicatorProps {
  status: TrafficLightStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export function TrafficLightIndicator({
  status,
  size = 'md',
  showLabel = true,
  animated = true,
  className
}: TrafficLightIndicatorProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'h-4 w-4', text: 'text-xs' },
    md: { container: 'w-12 h-12', icon: 'h-6 w-6', text: 'text-sm' },
    lg: { container: 'w-16 h-16', icon: 'h-8 w-8', text: 'text-base' },
  }

  const colors = {
    GREEN: {
      bg: 'bg-green-500',
      icon: ShieldCheck,
      label: 'Trusted',
      shadow: 'shadow-green-500/50',
      gradient: 'from-green-500 to-emerald-600',
    },
    AMBER: {
      bg: 'bg-amber-500',
      icon: ShieldAlert,
      label: 'Partial',
      shadow: 'shadow-amber-500/50',
      gradient: 'from-amber-500 to-orange-500',
    },
    RED: {
      bg: 'bg-red-500',
      icon: ShieldAlert,
      label: 'Untrusted',
      shadow: 'shadow-red-500/50',
      gradient: 'from-red-500 to-rose-600',
    },
  }

  const config = colors[status]
  const Icon = config.icon

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.div
        initial={animated ? { scale: 0.8, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "rounded-full flex items-center justify-center shadow-lg",
          config.bg,
          sizes[size].container,
          config.shadow
        )}
      >
        <Icon className={cn("text-white", sizes[size].icon)} />
      </motion.div>
      {showLabel && (
        <span className={cn("font-semibold text-foreground", sizes[size].text)}>
          {config.label}
        </span>
      )}
    </div>
  )
}

interface TrafficLightBadgeProps {
  status: TrafficLightStatus
  className?: string
}

export function TrafficLightBadge({ status, className }: TrafficLightBadgeProps) {
  const colors = {
    GREEN: 'bg-green-500 text-white',
    AMBER: 'bg-amber-500 text-black',
    RED: 'bg-red-500 text-white',
  }

  const labels = {
    GREEN: '✓ Trusted',
    AMBER: '⚠ Partial',
    RED: '✕ Untrusted',
  }

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold", colors[status], className)}>
      {labels[status]}
    </span>
  )
}

interface TrafficLightChecklistProps {
  signal: TrafficSignal
  className?: string
}

export function TrafficLightChecklist({ signal, className }: TrafficLightChecklistProps) {
  const checks = [
    {
      key: 'hasInsurance',
      label: 'Insurance Policy',
      description: 'Company has verified insurance coverage',
      icon: Shield,
      url: signal.business?.insuranceUrl,
    },
    {
      key: 'hasRefundPromise',
      label: 'Refund Promise',
      description: 'Company offers refund guarantee',
      icon: RefreshCw,
      url: signal.business?.promisePageUrl,
    },
    {
      key: 'hasClaimPage',
      label: 'Claim Process',
      description: 'Company has a clear insurance claim process',
      icon: FileText,
      url: signal.business?.claimPageUrl,
    },
    {
      key: 'hasTermsClauses',
      label: 'Terms & Conditions',
      description: 'Terms include proper clauses',
      icon: Scale,
      url: signal.business?.termsUrl,
    },
    {
      key: 'hasActiveSubscription',
      label: 'Premium Partner',
      description: 'Active paid subscription',
      icon: Star,
    },
  ]

  return (
    <div className={cn("space-y-3", className)}>
      {checks.map((check) => {
        const isComplete = signal[check.key as keyof TrafficSignal] as boolean
        const Icon = check.icon

        return (
          <div key={check.key} className="flex items-start gap-3">
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              isComplete ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
            )}>
              {isComplete ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{check.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{check.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface TrafficLightProgressProps {
  completedCount: number
  totalCount?: number
  className?: string
}

export function TrafficLightProgress({ completedCount, totalCount = 5, className }: TrafficLightProgressProps) {
  const percentage = (completedCount / totalCount) * 100
  
  const getStatus = () => {
    if (percentage === 100) return { color: 'bg-green-500', status: 'GREEN' as const }
    if (percentage >= 40) return { color: 'bg-amber-500', status: 'AMBER' as const }
    return { color: 'bg-red-500', status: 'RED' as const }
  }

  const { color, status } = getStatus()

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Trust Progress</span>
        <span className="font-medium">{completedCount}/{totalCount} checks</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
      <div className="flex items-center gap-2">
        <TrafficLightBadge status={status} />
        <span className="text-sm text-muted-foreground">
          {percentage === 100 ? 'Fully verified' : percentage >= 40 ? 'Partially verified' : 'Needs verification'}
        </span>
      </div>
    </div>
  )
}
