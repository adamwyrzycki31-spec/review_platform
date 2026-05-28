"use client"

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface ReviewItem {
  id: string
  rating: number
  title: string
  content: string
  userName: string
  date: string
}

interface CarouselWidgetProps {
  reviews: ReviewItem[]
  autoPlay?: boolean
  interval?: number
}

export function CarouselWidget({
  reviews,
  autoPlay = true,
  interval = 5000
}: CarouselWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  if (reviews.length === 0) {
    return null
  }

  const currentReview = reviews[currentIndex]

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 p-4 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Customer Reviews</span>
          <div className="flex gap-1">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="p-6 min-h-[200px] flex flex-col">
        <Quote className="h-8 w-8 text-primary/20 mb-4" />
        
        <div className="flex mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= currentReview.rating
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2">{currentReview.title}</h3>
        <p className="text-muted-foreground flex-1">{currentReview.content}</p>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {currentReview.userName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium">{currentReview.userName}</p>
              <p className="text-sm text-muted-foreground">{currentReview.date}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {reviews.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white shadow hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  )
}

export function CarouselWidgetCode({ businessSlug }: { businessSlug: string }) {
  return `<!-- MyProtector Carousel Widget -->
<script src="https://cdn.myprotector.org/widgets/carousel.js" async></script>
<div class="mp-carousel" data-business="${businessSlug}" data-count="5"></div>`
}