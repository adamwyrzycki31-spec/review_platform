"use client"

import { useState } from 'react'
import { Star, Search, Filter, MoreHorizontal, CheckCircle, XCircle, Flag, Eye, MessageSquare, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Mock reviews for demonstration
const mockReviews = [
  { 
    id: '1', 
    userId: 'user1',
    userName: 'John D.',
    userEmail: 'john@example.com',
    businessName: 'TechCorp Inc',
    rating: 5,
    title: 'Excellent service',
    content: 'Great experience working with TechCorp. Their team was professional and delivered on time.',
    status: 'APPROVED',
    createdAt: '2024-05-15',
  },
  { 
    id: '2', 
    userId: 'user2',
    userName: 'Sarah M.',
    userEmail: 'sarah@example.com',
    businessName: 'TechCorp Inc',
    rating: 3,
    title: 'Good but slow',
    content: 'The service was good but communication could be improved. Took longer than expected.',
    status: 'PENDING',
    createdAt: '2024-05-20',
  },
  { 
    id: '3', 
    userId: 'user3',
    userName: 'Mike R.',
    userEmail: 'mike@example.com',
    businessName: 'TechCorp Inc',
    rating: 1,
    title: 'Terrible experience',
    content: 'Worst experience ever. Completely unprofessional and unreliable.',
    status: 'FLAGGED',
    createdAt: '2024-05-18',
  },
  { 
    id: '4', 
    userId: 'user4',
    userName: 'Emily L.',
    userEmail: 'emily@example.com',
    businessName: 'TechCorp Inc',
    rating: 4,
    title: 'Recommended',
    content: 'Would recommend to others. Good value for money and reliable service.',
    status: 'APPROVED',
    createdAt: '2024-05-10',
  },
  { 
    id: '5', 
    userId: 'user5',
    userName: 'Chris P.',
    userEmail: 'chris@example.com',
    businessName: 'TechCorp Inc',
    rating: 2,
    title: 'Could be better',
    content: 'Average experience. Not bad but not great either. Room for improvement.',
    status: 'PENDING',
    createdAt: '2024-05-22',
  },
]

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  APPROVED: 'bg-green-500/10 text-green-500',
  REJECTED: 'bg-red-500/10 text-red-500',
  FLAGGED: 'bg-orange-500/10 text-orange-500',
}

const ratingLabels: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredReviews = mockReviews.filter(review => {
    const matchesSearch = 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = mockReviews.filter(r => r.status === 'PENDING').length
  const flaggedCount = mockReviews.filter(r => r.status === 'FLAGGED').length

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Review Moderation</h1>
              <p className="text-muted-foreground">Review and moderate user reviews</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{mockReviews.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={pendingCount > 0 ? 'border-yellow-500/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="mt-2">Needs attention</Badge>
              )}
            </CardContent>
          </Card>
          <Card className={flaggedCount > 0 ? 'border-red-500/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Flag className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-bold">{flaggedCount}</p>
                </div>
              </div>
              {flaggedCount > 0 && (
                <Badge variant="destructive" className="mt-2">Needs attention</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{mockReviews.filter(r => r.status === 'APPROVED').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              Pending
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged
              {flaggedCount > 0 && (
                <Badge variant="destructive" className="ml-2">{flaggedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
                <CardDescription>Reviews awaiting moderation</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsTable reviews={filteredReviews.filter(r => r.status === 'PENDING')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Reviews</CardTitle>
                <CardDescription>Published reviews on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsTable reviews={filteredReviews.filter(r => r.status === 'APPROVED')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Reviews</CardTitle>
                <CardDescription>Reviews that have been reported or flagged</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsTable reviews={filteredReviews.filter(r => r.status === 'FLAGGED')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Reviews</CardTitle>
                    <CardDescription>Complete review list</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="FLAGGED">Flagged</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ReviewsTable reviews={filteredReviews} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ReviewsTable({ reviews }: { reviews: typeof mockReviews }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No reviews found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 rounded-lg border bg-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{ratingLabels[review.rating]}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[review.status]}>
                {review.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {review.status === 'PENDING' && (
                    <>
                      <DropdownMenuItem>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Flag Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <h3 className="font-semibold mb-2">{review.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{review.content}</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>{review.userName}</span>
              <span>•</span>
              <span>{review.businessName}</span>
            </div>
            <span className="text-muted-foreground">{review.createdAt}</span>
          </div>

          {review.status === 'PENDING' && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button size="sm" variant="ghost">
                <Flag className="h-4 w-4 mr-2" />
                Flag for Review
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}