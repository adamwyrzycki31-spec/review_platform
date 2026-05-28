import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import prisma from '@/lib/db'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  // Mock post data (in production, fetch from WordPress)
  const mockPost = {
    slug,
    title: 'How to Build Trust Online: A Complete Guide for Businesses',
    content: `
      <p>In today's digital marketplace, trust is everything. Customers have more choices than ever before, and they're more cautious about who they give their money to. That's why building trust online has become essential for any business that wants to succeed.</p>
      
      <h2>Why Trust Matters</h2>
      <p>Studies show that customers are more likely to purchase from businesses they trust. In fact, according to recent research, <strong>81% of consumers</strong> say trust is a major factor in their purchasing decisions. This means that if you're not actively working to build trust, you're likely losing customers to competitors who are.</p>
      
      <h2>The Traffic Light System</h2>
      <p>One of the most effective ways to build trust is through transparent verification. Our Traffic Light System allows businesses to demonstrate their commitment to customer protection by providing documentation of:</p>
      <ul>
        <li>Insurance policies</li>
        <li>Refund and promise policies</li>
        <li>Insurance claim procedures</li>
        <li>Terms and conditions</li>
      </ul>
      
      <h2>How to Get Verified</h2>
      <p>Getting verified is simple. Just follow these steps:</p>
      <ol>
        <li>Create an account on MyProtector</li>
        <li>Add your business information</li>
        <li>Upload your insurance and policy documentation</li>
        <li>Submit for verification</li>
        <li>Receive your traffic light status</li>
      </ol>
      
      <h2>Benefits of Verification</h2>
      <p>Businesses that achieve GREEN status (fully verified) enjoy numerous benefits:</p>
      <ul>
        <li>Higher conversion rates</li>
        <li>Better search rankings</li>
        <li>Increased customer confidence</li>
        <li>Featured placement in search results</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Building trust online isn't optional anymore—it's essential. By taking advantage of verification systems and being transparent about your business practices, you can differentiate yourself from competitors and build lasting relationships with your customers.</p>
    `,
    date: '2024-05-15',
    modified: '2024-05-15',
    featuredImage: null,
    categories: [{ name: 'Business Tips', slug: 'business-tips' }],
    author: { name: 'MyProtector Team', avatar: null },
    readingTime: '5 min read',
  }

  const relatedPosts = [
    {
      id: 2,
      slug: 'understanding-traffic-light-system',
      title: 'Understanding the Traffic Light Trust System',
      date: '2024-05-10',
    },
    {
      id: 3,
      slug: 'respond-to-reviews-effectively',
      title: 'How to Respond to Reviews Effectively',
      date: '2024-05-05',
    },
  ]

  // Try to fetch from WordPress in production
  if (process.env.WORDPRESS_API_URL) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/wordpress?slug=${slug}`,
        { next: { revalidate: 3600 } }
      )

      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          // Use WordPress post data
        }
      }
    } catch (error) {
      console.error('Failed to fetch WordPress post:', error)
    }
  }

  const post = mockPost // In production, use the fetched data

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8 max-w-4xl">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Article */}
        <article>
          {/* Header */}
          <header className="mb-8">
            {post.categories.length > 0 && (
              <Link 
                href={`/blog?category=${post.categories[0].slug}`}
                className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              >
                {post.categories[0].name}
              </Link>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <div dangerouslySetInnerHTML={{ __html: post.title }} />
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Share Buttons */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="font-medium">Share this article:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://myprotector.org/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://myprotector.org/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://myprotector.org/blog/${post.slug}`)}`} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(relatedPost.date).toLocaleDateString()}
                      </p>
                      <h3 className="font-semibold hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}