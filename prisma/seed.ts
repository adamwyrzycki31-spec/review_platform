import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@myprotector.org' },
    update: {},
    create: {
      email: 'admin@myprotector.org',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created admin user')

  // Create demo individual user
  const userPassword = await bcrypt.hash('User@123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@myprotector.org' },
    update: {},
    create: {
      email: 'demo@myprotector.org',
      passwordHash: userPassword,
      role: 'INDIVIDUAL',
      firstName: 'Demo',
      lastName: 'User',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created demo user')

  // Create categories
  const categories = [
    { name: 'Retail & E-commerce', slug: 'retail-ecommerce', icon: 'ShoppingBag', description: 'Online and physical retail businesses' },
    { name: 'Financial Services', slug: 'financial-services', icon: 'DollarSign', description: 'Banks, insurance, investments' },
    { name: 'Technology', slug: 'technology', icon: 'Cpu', description: 'Software, hardware, IT services' },
    { name: 'Healthcare', slug: 'healthcare', icon: 'Heart', description: 'Medical services, pharmacies, clinics' },
    { name: 'Real Estate', slug: 'real-estate', icon: 'Home', description: 'Agents, agencies, property management' },
    { name: 'Automotive', slug: 'automotive', icon: 'Car', description: 'Dealers, repair, rental services' },
    { name: 'Home Services', slug: 'home-services', icon: 'Wrench', description: 'Contractors, plumbers, electricians' },
    { name: 'Travel & Hospitality', slug: 'travel-hospitality', icon: 'Plane', description: 'Hotels, airlines, travel agencies' },
    { name: 'Education', slug: 'education', icon: 'GraduationCap', description: 'Schools, courses, training' },
    { name: 'Professional Services', slug: 'professional-services', icon: 'Briefcase', description: 'Lawyers, accountants, consultants' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Created categories')

  // Create demo businesses
  const businesses = [
    {
      name: 'TechCorp Solutions',
      slug: 'techcorp-solutions',
      description: 'Leading provider of enterprise software solutions with 15+ years of experience.',
      website: 'https://techcorp.example.com',
      city: 'San Francisco',
      country: 'USA',
      categorySlug: 'technology',
      trustScore: 4.8,
      reviewCount: 156,
      trafficLightStatus: 'GREEN' as const,
      hasFullTrust: true,
    },
    {
      name: 'SecureBank Financial',
      slug: 'securebank-financial',
      description: 'Trusted financial services with FDIC insurance and excellent customer service.',
      website: 'https://securebank.example.com',
      city: 'New York',
      country: 'USA',
      categorySlug: 'financial-services',
      trustScore: 4.6,
      reviewCount: 89,
      trafficLightStatus: 'GREEN' as const,
      hasFullTrust: true,
    },
    {
      name: 'HealthFirst Medical',
      slug: 'healthfirst-medical',
      description: 'Comprehensive healthcare services with experienced medical professionals.',
      website: 'https://healthfirst.example.com',
      city: 'Chicago',
      country: 'USA',
      categorySlug: 'healthcare',
      trustScore: 4.2,
      reviewCount: 67,
      trafficLightStatus: 'AMBER' as const,
      hasFullTrust: false,
    },
    {
      name: 'QuickFix Home Services',
      slug: 'quickfix-home-services',
      description: 'Professional home repair and maintenance services.',
      website: 'https://quickfix.example.com',
      city: 'Austin',
      country: 'USA',
      categorySlug: 'home-services',
      trustScore: 3.8,
      reviewCount: 45,
      trafficLightStatus: 'RED' as const,
      hasFullTrust: false,
    },
    {
      name: 'Luxury Motors Auto',
      slug: 'luxury-motors-auto',
      description: 'Premium automotive dealership with certified pre-owned vehicles.',
      website: 'https://luxurymotors.example.com',
      city: 'Los Angeles',
      country: 'USA',
      categorySlug: 'automotive',
      trustScore: 4.5,
      reviewCount: 123,
      trafficLightStatus: 'GREEN' as const,
      hasFullTrust: true,
    },
    {
      name: 'Global Travel Agency',
      slug: 'global-travel-agency',
      description: 'Full-service travel agency specializing in luxury vacations.',
      website: 'https://globaltravel.example.com',
      city: 'Miami',
      country: 'USA',
      categorySlug: 'travel-hospitality',
      trustScore: 4.4,
      reviewCount: 98,
      trafficLightStatus: 'AMBER' as const,
      hasFullTrust: false,
    },
  ]

  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } })
  const financeCategory = await prisma.category.findUnique({ where: { slug: 'financial-services' } })
  const healthCategory = await prisma.category.findUnique({ where: { slug: 'healthcare' } })
  const homeCategory = await prisma.category.findUnique({ where: { slug: 'home-services' } })
  const autoCategory = await prisma.category.findUnique({ where: { slug: 'automotive' } })
  const travelCategory = await prisma.category.findUnique({ where: { slug: 'travel-hospitality' } })

  const categoryMap: Record<string, string | null> = {
    'technology': techCategory?.id || null,
    'financial-services': financeCategory?.id || null,
    'healthcare': healthCategory?.id || null,
    'home-services': homeCategory?.id || null,
    'automotive': autoCategory?.id || null,
    'travel-hospitality': travelCategory?.id || null,
  }

  for (const business of businesses) {
    const businessUser = await prisma.user.upsert({
      where: { email: `business.${business.slug}@example.com` },
      update: {},
      create: {
        email: `business.${business.slug}@example.com`,
        passwordHash: userPassword,
        role: 'BUSINESS',
        firstName: 'Business',
        lastName: 'Owner',
        emailVerified: new Date(),
      },
    })

    const createdBusiness = await prisma.business.upsert({
      where: { slug: business.slug },
      update: {},
      create: {
        name: business.name,
        slug: business.slug,
        description: business.description,
        website: business.website,
        city: business.city,
        country: business.country,
        userId: businessUser.id,
        categoryId: categoryMap[business.categorySlug],
        trustScore: business.trustScore,
        reviewCount: business.reviewCount,
        trafficLightStatus: business.trafficLightStatus,
        subscriptionStatus: business.hasFullTrust ? 'ACTIVE' : 'EXPIRED',
        insuranceUrl: business.hasFullTrust ? 'https://example.com/insurance' : null,
        termsUrl: business.hasFullTrust ? 'https://example.com/terms' : null,
        promisePageUrl: business.hasFullTrust ? 'https://example.com/refund' : null,
        claimPageUrl: business.hasFullTrust ? 'https://example.com/claims' : null,
      },
    })

    // Create traffic signal
    await prisma.trafficSignal.upsert({
      where: { businessId: createdBusiness.id },
      update: {},
      create: {
        businessId: createdBusiness.id,
        hasInsurance: business.hasFullTrust,
        hasRefundPromise: business.hasFullTrust,
        hasClaimPage: business.hasFullTrust,
        hasTermsClauses: business.hasFullTrust,
        hasActiveSubscription: business.hasFullTrust,
        verifiedAt: business.hasFullTrust ? new Date() : null,
      },
    })

    console.log(`✅ Created business: ${business.name}`)
  }

  // Create some demo reviews
  const techCorpBusiness = await prisma.business.findUnique({ where: { slug: 'techcorp-solutions' } })
  if (techCorpBusiness) {
    const reviewTitles = [
      'Excellent software solutions',
      'Great customer support',
      'Reliable and professional',
      'Met all expectations',
      'Highly recommended',
    ]
    const reviewContents = [
      'We have been using TechCorp Solutions for over 3 years now and they have consistently delivered excellent results. Their team is responsive and professional.',
      'The customer support team is outstanding. Any issues are resolved quickly and efficiently. Very satisfied with their service.',
      'Professional, reliable, and always delivered on time. We recommend them to anyone looking for quality software solutions.',
      'Great experience working with them. The software met all our requirements and the implementation was smooth.',
      'I highly recommend TechCorp Solutions. Their expertise and dedication to customer satisfaction sets them apart.',
    ]

    for (let i = 0; i < 5; i++) {
      await prisma.review.create({
        data: {
          userId: demoUser.id,
          businessId: techCorpBusiness.id,
          rating: 5 - (i % 2),
          title: reviewTitles[i],
          content: reviewContents[i],
          pros: i % 2 === 0 ? 'Professional team, great results' : 'Fast response time, quality work',
          cons: i % 3 === 0 ? 'Slightly higher cost than competitors' : null,
          recommendation: i % 4 === 0 ? 'POSITIVE' : 'POSITIVE',
          status: 'APPROVED',
          verifiedPurchase: true,
          publishedAt: new Date(),
        },
      })
    }
    console.log('✅ Created demo reviews')
  }

  // Update category review counts
  await prisma.category.update({
    where: { slug: 'technology' },
    data: { reviewCount: 156 },
  })

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Demo Credentials:')
  console.log('   Admin: admin@myprotector.org / Admin@123')
  console.log('   User:  demo@myprotector.org / User@123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
