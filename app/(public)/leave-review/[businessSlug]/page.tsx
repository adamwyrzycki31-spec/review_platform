"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarRating } from '@/components/reviews/StarRating'
import { cn } from '@/lib/utils'

interface LeaveReviewPageProps {
  params: Promise<{ businessSlug: string }>
}

export default function LeaveReviewPage({ params }: LeaveReviewPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    pros: '',
    cons: '',
  })

  // In a real app, you'd fetch the business details
  const businessName = "TechCorp Solutions" // This would come from the API

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (rating === 0) {
      setError('Please select a rating')
      setIsLoading(false)
      return
    }

    if (formData.content.length < 50) {
      setError('Review must be at least 50 characters')
      setIsLoading(false)
      return
    }

    try {
      // In production, this would POST to /api/reviews
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/dashboard?review=submitted')
    } catch {
      setError('Failed to submit review. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container-app max-w-2xl">
        <Link href="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Write a Review</CardTitle>
            <p className="text-muted-foreground mt-2">
              Share your experience with <span className="font-semibold">{businessName}</span>
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
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.title.length}/200 characters
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
                  disabled={rating === 0 || formData.content.length < 50}
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
