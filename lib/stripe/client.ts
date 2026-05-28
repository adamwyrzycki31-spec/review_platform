import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

export default stripe

// Subscription Tiers Configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic business profile',
      'Up to 10 reviews/month',
      'Basic trust badge',
      'Email support',
    ],
  },
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    price: 29,
    interval: 'month',
    features: [
      'Enhanced business profile',
      'Unlimited reviews',
      'Premium trust badge',
      'Widget embed codes',
      'Email support',
      'Basic analytics',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    price: 79,
    interval: 'month',
    features: [
      'Everything in Starter',
      'Traffic light verification',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    price: 199,
    interval: 'month',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'White-label options',
      'Custom integrations',
      'SLA guarantee',
      '24/7 phone support',
    ],
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

// Helper functions
export async function createCheckoutSession(
  priceId: string,
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string>
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata,
    },
  })

  return session
}

export async function createCustomer(email: string, name: string, metadata?: Record<string, string>) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })

  return customer
}

export async function getCustomerSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 10,
  })

  return subscriptions.data
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscriptionId,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })

  return subscription
}

export async function getOrCreateCustomer(userId: string, email: string, name: string) {
  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Create new customer
  return await createCustomer(email, name, { userId })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.retrieve(invoiceId)
  return invoice
}

export async function listInvoices(customerId: string, limit = 10) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  })

  return invoices.data
}

export async function createInvoiceItem(
  customerId: string,
  amount: number,
  currency: string,
  description: string
) {
  const item = await stripe.invoiceItems.create({
    customer: customerId,
    amount,
    currency,
    description,
  })

  return item
}

export async function finalizeAndPayInvoice(invoiceId: string) {
  const invoice = await stripe.invoices.finalizeAndPay(invoiceId)
  return invoice
}

// Webhook event handlers
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.businessId
  const tier = subscription.metadata?.tier

  if (businessId && tier) {
    // Update business subscription status in database
    // This would typically call Prisma here
    console.log(`Subscription created for business ${businessId}: ${tier}`)
  }
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.businessId

  if (businessId) {
    const newStatus = subscription.status === 'active' ? 'ACTIVE' : 'CANCELLED'
    console.log(`Subscription updated for business ${businessId}: ${newStatus}`)
  }
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.businessId

  if (businessId) {
    console.log(`Subscription cancelled for business ${businessId}`)
  }
}

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const businessId = subscription.metadata?.businessId

    if (businessId) {
      console.log(`Payment succeeded for business ${businessId}`)
    }
  }
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const businessId = subscription.metadata?.businessId

    if (businessId) {
      console.log(`Payment failed for business ${businessId}`)
      // Could trigger notification here
    }
  }
}

// Construct webhook event handler
export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}