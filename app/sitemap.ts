import { MetadataRoute } from 'next'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://myprotector.org'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blacklist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/trust-signals`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic business pages
  try {
    const businesses = await prisma.business.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      where: {
        subscriptionStatus: 'ACTIVE',
      },
      take: 1000,
    })

    const businessPages: MetadataRoute.Sitemap = (businesses as { slug: string; updatedAt: Date }[]).map((business) => ({
      url: `${baseUrl}/business/${business.slug}`,
      lastModified: business.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    // Dynamic category pages
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      take: 100,
    })

    const categoryPages: MetadataRoute.Sitemap = (categories as { slug: string; updatedAt: Date }[]).map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...staticPages, ...businessPages, ...categoryPages]
  } catch {
    return staticPages
  }
}
