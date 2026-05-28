import { NextRequest, NextResponse } from 'next/server'

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || ''
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY || ''

interface WPPost {
  id: number
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  date: string
  modified: string
  featured_media: number
  categories: number[]
  tags: number[]
  link: string
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>
    'wp:term'?: Array<Array<{ name: string; slug: string }>>
  }
}

interface WPCategory {
  id: number
  name: string
  slug: string
  count: number
}

// GET /api/wordpress/posts - Get blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const slug = searchParams.get('slug')

    if (!WORDPRESS_API_URL) {
      return NextResponse.json({ error: 'WordPress API not configured' }, { status: 500 })
    }

    // Get single post by slug
    if (slug) {
      const postResponse = await fetch(
        `${WORDPRESS_API_URL}/wp/v2/posts?slug=${slug}&_embed`,
        WORDPRESS_API_KEY ? {
          headers: { 'Authorization': `Bearer ${WORDPRESS_API_KEY}` }
        } : {}
      )

      if (!postResponse.ok) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      const posts = await postResponse.json() as WPPost[]
      
      if (posts.length === 0) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      const post = posts[0]
      
      return NextResponse.json({
        id: post.id,
        slug: post.slug,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered,
        content: post.content.rendered,
        date: post.date,
        modified: post.modified,
        featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
        categories: post._embedded?.['wp:term']?.[0]?.map(c => c.name).join(', ') || '',
        tags: post._embedded?.['wp:term']?.[1]?.map(t => t.name) || [],
        link: post.link,
      })
    }

    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      _embed: 'true',
    })

    if (category) {
      // First get category ID from slug
      const catResponse = await fetch(
        `${WORDPRESS_API_URL}/wp/v2/categories?slug=${category}`,
        WORDPRESS_API_KEY ? { headers: { 'Authorization': `Bearer ${WORDPRESS_API_KEY}` } } : {}
      )
      
      if (catResponse.ok) {
        const cats = await catResponse.json() as WPCategory[]
        if (cats.length > 0) {
          params.set('categories', cats[0].id.toString())
        }
      }
    }

    if (search) {
      params.set('search', search)
    }

    const response = await fetch(
      `${WORDPRESS_API_URL}/wp/v2/posts?${params}`,
      WORDPRESS_API_KEY ? { headers: { 'Authorization': `Bearer ${WORDPRESS_API_KEY}` } } : {}
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from WordPress')
    }

    const posts = await response.json() as WPPost[]
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0')

    const formattedPosts = posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title.rendered,
      excerpt: post.excerpt.rendered,
      date: post.date,
      featuredImage: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null,
      categories: post._embedded?.['wp:term']?.[0]?.map(c => ({ name: c.name, slug: c.slug })) || [],
      tags: post._embedded?.['wp:term']?.[1]?.map(t => ({ name: t.name, slug: t.slug })) || [],
      link: post.link,
    }))

    return NextResponse.json({
      posts: formattedPosts,
      page,
      perPage,
      totalPosts,
      totalPages,
    })
  } catch (error) {
    console.error('WordPress API error:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}