import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the perfect plan for your business. From free basic profiles to premium enterprise solutions.',
}

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    tier: 'FREE',
    features: [
      'Basic business profile',
      'Up to 10 reviews/month',
      'Simple review badge widget',
      'Email support',
      'Basic analytics',
    ],
    notIncluded: [
      'Trust verification badge',
      'Custom widgets',
      'Priority support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Starter',
    description: 'For growing businesses',
    price: 29,
    tier: 'STARTER',
    features: [
      'Everything in Free',
      'Unlimited reviews',
      'Full review analytics',
      'Response to reviews',
      '3 custom widgets',
      'Priority email support',
      'Remove branding',
    ],
    notIncluded: [
      'Traffic light verification',
      'White-label widgets',
      'Dedicated account manager',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Professional',
    description: 'For established businesses',
    price: 79,
    tier: 'PROFESSIONAL',
    features: [
      'Everything in Starter',
      'Traffic light verification',
      'Trust badge display',
      'White-label widgets',
      'API access',
      'Advanced analytics',
      'Dedicated account manager',
      'Custom integrations',
    ],
    notIncluded: [],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    tier: 'ENTERPRISE',
    features: [
      'Everything in Professional',
      'Multi-location support',
      'Unlimited users',
      'Custom integrations',
      'SLA guarantee',
      'White-glove onboarding',
      'Volume discounts',
      '24/7 phone support',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="bg-muted/30">
      <div className="container-app py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your business needs. All plans include our core review management features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">—</span>
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Starter, Professional, and Enterprise plans include a 14-day free trial. No credit card required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. Your data remains accessible.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee for all paid plans. Contact support for assistance.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-card rounded-lg p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
