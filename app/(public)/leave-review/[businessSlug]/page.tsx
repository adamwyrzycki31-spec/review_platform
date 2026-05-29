"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Star, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from '@/components/reviews/StarRating'
import { cn } from '@/lib/utils'

interface Business {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  approvalStatus: string
}

export default function LeaveReviewPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status: sessionStatus } = useSession()
  const businessSlug = params.businessSlug as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBusiness, setIsFetchingBusiness] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [business, setBusiness] = useState<Business | null>(null)
  const [notAllowed, setNotAllowed] = useState(false)
  const [rating, setRating] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    pros: '',
    cons: '',
  })

  // Fetch business details
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const response = await fetch(`/api/businesses?slug=${businessSlug}`)
        if (response.ok) {
          const data = await response.json()
          if (data.items && data.items.length > 0) {
            const biz = data.items[0]
            setBusiness(biz)
            
            // Check if business is approved
            if (biz.approvalStatus !== 'APPROVED') {
              setNotAllowed(true)
            }
          } else {
            // Business not found
            setBusiness(null)
          }
        }
      } catch (err) {
        console.error('Failed to fetch business:', err)
      } finally {
        setIsFetchingBusiness(false)
      }
    }
    
    if (businessSlug) {
      fetchBusiness()
    }
  }, [businessSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (rating === 0) {
      setError('Please select a rating')
      setIsLoading(false)
      return
    }

    if (formData.title.length < 10) {
      setError('Title must be at least 10 characters')
      setIsLoading(false)
      return
    }

    if (formData.content.length < 50) {
      setError('Review must be at least 50 characters')
      setIsLoading(false)
      return
    }

    // Check if user is authenticated
    if (!session?.user) {
      router.push(`/login?redirect=/leave-review/${businessSlug}`)
      return
    }
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          businessId: business?.id,
          rating,
          title: formData.title,
          content: formData.content,
          pros: formData.pros || null,
          cons: formData.cons || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (notAllowed) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container-app max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Review Not Available</h2>
              <p className="text-muted-foreground mb-6">
                Reviews cannot be submitted for this business as it has not been approved yet.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href={`/business/${businessSlug}`}>
                  <Button variant="outline">View Business</Button>
                </Link>
                <Link href="/search">
                  <Button>Browse Businesses</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (sessionStatus === 'loading' || isFetchingBusiness) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container-app max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container-app max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Business Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The business you are looking for does not exist or has not been approved.
              </p>
              <Link href="/search">
                <Button>Browse Businesses</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 py-8">
        <div className="container-app max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Review Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your review. It will be visible after moderation.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href={`/business/${businessSlug}`}>
                  <Button variant="outline">View Business</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container-app max-w-2xl">
        <Link href={`/business/${businessSlug}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to business page
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Write a Review</CardTitle>
            <p className="text-muted-foreground mt-2">
              Share your experience with{' '}
              <span className="font-semibold">
                {isFetchingBusiness ? 'Loading...' : business?.name || 'this business'}
              </span>
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="block mb-3">Your Rating</Label>
                <div className="flex flex-col items-center py-4 bg-muted/50 rounded-lg">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {rating === 0 && 'Click to rate'}
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Great'}
                    {rating === 5 && 'Excellent'}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  placeholder="Summarize your experience"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length}/200 characters (minimum 10)
                </p>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Your Review</Label>
                <Textarea
                  id="content"
                  placeholder="Share your detailed experience with this business..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  maxLength={5000}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.content.length}/5000 characters (minimum 50)
                </p>
              </div>

              {/* Pros */}
              <div>
                <Label htmlFor="pros">What did you like? (Optional)</Label>
                <Input
                  id="pros"
                  placeholder="E.g., Great customer service, fast delivery"
                  value={formData.pros}
                  onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                  maxLength={1000}
                />
              </div>

              {/* Cons */}
              <div>
                <Label htmlFor="cons">What could be improved? (Optional)</Label>
                <Input
                  id="cons"
                  placeholder="E.g., Website could be faster"
                  value={formData.cons}
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                  maxLength={1000}
                />
              </div>

              {/* Guidelines */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <h4 className="font-semibold mb-2">Review Guidelines</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Be honest and objective in your review</li>
                  <li>• Focus on your personal experience</li>
                  <li>• Avoid personal attacks or inappropriate language</li>
                  <li>• Do not include sensitive personal information</li>
                </ul>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={isLoading}
                  disabled={rating === 0 || formData.title.length < 10 || formData.content.length < 50}
                >
                  Submit Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Reviews are moderated before being published. This usually takes 24-48 hours.
        </p>
      </div>
    </div>
  )
}
