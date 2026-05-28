import Link from 'next/link'
import Image from 'next/image'
import { FileText, Calendar, ArrowRight, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import prisma from '@/lib/db'

// Mock WordPress posts for when WP API is not configured
const mockPosts = [
  {
    id: 1,
    slug: 'how-to-build-trust-online',
    title: 'How to Build Trust Online: A Complete Guide for Businesses',
    excerpt: 'Learn the essential strategies for establishing credibility and trust with your customers in the digital age.',
    date: '2024-05-15',
    featuredImage: null,
    categories: [{ name: 'Business Tips', slug: 'business-tips' }],
    link: '#',
  },
  {
    id: 2,
    slug: 'understanding-traffic-light-system',
    title: 'Understanding the Traffic Light Trust System',
    excerpt: 'Discover how our unique trust verification system helps consumers make informed decisions.',
    date: '2024-05-10',
    featuredImage: null,
    categories: [{ name: 'Explainer', slug: 'explainer' }],
    link: '#',
  },
  {
    id: 3,
    slug: 'respond-to-reviews-effectively',
    title: 'How to Respond to Reviews Effectively',
    excerpt: 'Master the art of responding to customer feedback to build lasting relationships and improve your reputation.',
    date: '2024-05-05',
    featuredImage: null,
    categories: [{ name: 'Reviews', slug: 'reviews' }],
    link: '#',
  },
]

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const category = params.category
  const search = params.search

  // Try to fetch from WordPress, fall back to mock data
  let posts = mockPosts
  let totalPosts = mockPosts.length

  if (process.env.WORDPRESS_API_URL) {
    try {
      const wpParams = new URLSearchParams()
      wpParams.set('page', page.toString())
      wpParams.set('perPage', '9')
      if (category) wpParams.set('category', category)
      if (search) wpParams.set('search', search)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/wordpress?${wpParams}`,
        { next: { revalidate: 3600 } }
      )

      if (response.ok) {
        const data = await response.json()
        posts = data.posts || mockPosts
        totalPosts = data.totalPosts || mockPosts.length
      }
    } catch (error) {
      console.error('Failed to fetch WordPress posts:', error)
    }
  }

  // Get categories
  const categories = [
    { name: 'All', slug: '' },
    { name: 'Business Tips', slug: 'business-tips' },
    { name: 'Explainer', slug: 'explainer' },
    { name: 'Reviews', slug: 'reviews' },
    { name: 'Trust & Safety', slug: 'trust-safety' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">MyProtector Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tips, and guides on building trust, managing reputation, and growing your business.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              defaultValue={search}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link key={cat.slug} href={cat.slug ? `/blog?category=${cat.slug}` : '/blog'}>
                <Button
                  variant={category === cat.slug ? 'default' : 'outline'}
                  size="sm"
                  className={category === cat.slug ? 'bg-primary' : ''}
                >
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
                  {post.featuredImage && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {!post.featuredImage && (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      {post.categories.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{post.categories[0].name}</span>
                        </>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      <div dangerouslySetInnerHTML={{ __html: post.title }} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-4 text-primary font-medium">
                      <span>Read More</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No articles found</h2>
            <p className="text-muted-foreground">
              {search 
                ? `No articles match your search for "${search}"`
                : 'Check back soon for new content'}
            </p>
          </Card>
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-12">
          {page > 1 && (
            <Link href={`/blog?page=${page - 1}${category ? `&category=${category}` : ''}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          {posts.length === 9 && totalPosts > page * 9 && (
            <Link href={`/blog?page=${page + 1}${category ? `&category=${category}` : ''}`}>
              <Button>Next</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}