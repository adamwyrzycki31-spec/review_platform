"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Check, CreditCard, ArrowRight, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    description: 'Get started with basic features',
    features: [
      'Basic business profile',
      'Up to 10 reviews/month',
      'Basic trust badge',
      'Email support',
      'Widget embed codes (limited)',
    ],
    notIncluded: [
      'Traffic light verification',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
    ],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: 29,
    priceId: 'price_starter',
    description: 'For growing businesses',
    features: [
      'Enhanced business profile',
      'Unlimited reviews',
      'Premium trust badge',
      'Widget embed codes (full)',
      'Email support',
      'Basic analytics',
      'Review invites (100/month)',
    ],
    notIncluded: [
      'Traffic light verification',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 79,
    priceId: 'price_professional',
    description: 'For established businesses',
    features: [
      'Everything in Starter',
      'Traffic light verification',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Review invites (unlimited)',
      'WhatsApp notifications',
    ],
    notIncluded: [],
    recommended: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 199,
    priceId: 'price_enterprise',
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'White-label options',
      'Custom integrations',
      'SLA guarantee',
      '24/7 phone support',
      'Unlimited everything',
      'Custom contracts',
    ],
    notIncluded: [],
  },
]

const comparisonFeatures = [
  { label: 'Reviews', values: ['10/month', 'Unlimited', 'Unlimited', 'Unlimited'] },
  { label: 'Trust Badge', values: ['Basic', 'Premium', 'Premium +', 'Premium +'] },
  { label: 'Traffic Light Verification', values: [false, false, true, true] },
  { label: 'Widget Embeds', values: ['Limited', 'Full', 'Full', 'Full'] },
  { label: 'Analytics', values: ['Basic', 'Standard', 'Advanced', 'Custom'] },
  { label: 'API Access', values: [false, false, true, true] },
  { label: 'Priority Support', values: [false, false, true, true] },
  { label: 'Account Manager', values: [false, false, false, true] },
  { label: 'White Label', values: [false, false, false, true] },
  { label: 'SLA Guarantee', values: [false, false, false, true] },
]

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const currentTier = 'STARTER'

  const handleSubscribe = async (planId: string) => {
    if (planId === 'FREE') return

    setIsLoading(true)
    setSelectedPlan(planId)

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: planId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/payments/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and billing</p>
          </div>
          {currentTier !== 'FREE' && (
            <Button variant="outline" onClick={handleManageBilling}>
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          )}
        </div>

        {/* Current Plan */}
        {currentTier !== 'FREE' && (
          <Card className="mb-8 border-green-500/30 bg-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="default" className="bg-green-500 mb-2">Current Plan</Badge>
                  <h3 className="text-xl font-bold">{plans.find(p => p.id === currentTier)?.name}</h3>
                  <p className="text-muted-foreground">Your subscription renews on June 28, 2024</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${plans.find(p => p.id === currentTier)?.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <Button variant="ghost" className="text-destructive" onClick={handleManageBilling}>
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentTier
            const isDowngrade = plan.price < (plans.find(p => p.id === currentTier)?.price || 0)

            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.recommended ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'border-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="bg-green-500">Current</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="h-4 w-4 mt-0.5 flex-shrink-0">✕</span>
                        <span className="text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.recommended ? 'default' : 'outline'}
                    disabled={isCurrentPlan || isLoading}
                    loading={isLoading && selectedPlan === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isCurrentPlan 
                      ? 'Current Plan' 
                      : isDowngrade 
                        ? 'Downgrade'
                        : 'Upgrade'}
                    {!isCurrentPlan && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Compare Plans</h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-semibold">Feature</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="p-4 text-center font-semibold">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4 font-medium">{row.label}</td>
                      {row.values.map((value, j) => (
                        <td key={j} className="p-4 text-center">
                          {value === true && <Check className="h-5 w-5 text-green-500 mx-auto" />}
                          {value === false && <span className="text-muted-foreground">—</span>}
                          {typeof value === 'string' && <span className="text-sm">{value}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'Can I change plans at any time?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through our secure Stripe integration.' },
              { q: 'Is there a free trial?', a: 'Yes! All paid plans come with a 14-day free trial. You can cancel anytime without being charged.' },
              { q: 'What happens if I cancel?', a: 'If you cancel, your subscription will remain active until the end of your current billing period. You will then be downgraded to the Free plan.' },
              { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee. If you are not satisfied, contact us within 30 days for a full refund.' },
              { q: 'Can I get a custom enterprise plan?', a: 'Yes! For large organizations with specific needs, we offer custom enterprise plans. Contact our sales team for details.' },
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}