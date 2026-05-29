"use client"

import { useState, useEffect, useCallback } from 'react'
import { Star, Search, MoreHorizontal, CheckCircle, XCircle, Flag, Eye, Trash2, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Review {
  id: string
  title: string
  content: string
  rating: number
  status: string
  isFlagged: boolean
  flagReason?: string
  publishedAt?: string
  createdAt: Date | string
  updatedAt: Date | string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatarUrl?: string | null
  }
  business: {
    id: string
    name: string
    slug: string
    logoUrl?: string | null
  }
  images: { id: string; url: string }[]
  _count: { reports: number }
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  flagged: number
}

const defaultStats: Stats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  flagged: 0,
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  FLAGGED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
}

const ratingLabels: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<string>('')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [flagReason, setFlagReason] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.set('status', activeTab.toUpperCase())
      }
      
      const response = await fetch(`/api/admin/reviews?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.items || [])
        
        const allItems = data.items || []
        setStats({
          total: allItems.length,
          pending: allItems.filter((r: Review) => r.status === 'PENDING').length,
          approved: allItems.filter((r: Review) => r.status === 'APPROVED').length,
          rejected: allItems.filter((r: Review) => r.status === 'REJECTED').length,
          flagged: allItems.filter((r: Review) => r.status === 'FLAGGED').length,
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleAction = (action: string, review: Review) => {
    setSelectedReview(review)
    setActionType(action)
    
    if (action === 'flag') {
      setFlagReason('')
    } else if (action === 'reject') {
      setRejectReason('')
    }
    
    setIsDialogOpen(true)
  }

  const executeAction = async () => {
    if (!selectedReview) return
    setIsProcessing(true)

    try {
      let endpoint = '/api/admin/reviews'
      let method = 'PATCH'
      let body: any = { reviewId: selectedReview.id }

      switch (actionType) {
        case 'approve':
          body.status = 'APPROVED'
          break
        case 'reject':
          body.status = 'REJECTED'
          body.adminNotes = rejectReason
          break
        case 'flag':
          body.status = 'FLAGGED'
          body.adminNotes = flagReason
          break
        case 'unflag':
          body.status = 'PENDING'
          break
        case 'delete':
          method = 'DELETE'
          endpoint = `/api/admin/reviews?id=${selectedReview.id}`
          body = undefined
          break
      }

      const response = await fetch(endpoint, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (response.ok) {
        await fetchReviews()
        setIsDialogOpen(false)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to process action')
      }
    } catch (error) {
      console.error('Error executing action:', error)
      alert('An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.business?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getUserName = (review: Review) => {
    if (review.user?.firstName || review.user?.lastName) {
      return `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim()
    }
    return review.user?.email?.split('@')[0] || 'Anonymous'
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
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
          <Button variant="outline" onClick={fetchReviews} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.pending > 0 ? 'border-yellow-200 bg-yellow-50/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.flagged > 0 ? 'border-red-200 bg-red-50/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <Flag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flagged</p>
                  <p className="text-2xl font-bold text-red-500">{stats.flagged}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="relative">
              <AlertCircle className="h-4 w-4 mr-1" />
              Pending
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="flagged">
              <Flag className="h-4 w-4 mr-1" />
              Flagged
              {stats.flagged > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.flagged}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {activeTab === 'pending' && 'Pending Reviews'}
                      {activeTab === 'approved' && 'Approved Reviews'}
                      {activeTab === 'flagged' && 'Flagged Reviews'}
                      {activeTab === 'all' && 'All Reviews'}
                    </CardTitle>
                    <CardDescription>
                      {activeTab === 'pending' && 'Reviews awaiting moderation'}
                      {activeTab === 'approved' && 'Published reviews on the platform'}
                      {activeTab === 'flagged' && 'Reviews that have been reported'}
                      {activeTab === 'all' && 'Complete review list'}
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReviews.map((review) => (
                      <div key={review.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((starIndex) => (
                                <Star
                                  key={starIndex}
                                  className={`h-4 w-4 ${
                                    starIndex <= review.rating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{ratingLabels[review.rating]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[review.status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}>
                              {review.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAction('view', review)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {review.status === 'PENDING' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleAction('approve', review)} className="text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction('reject', review)} classNameName="text-red-600">
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAction('flag', review)} className="text-orange-600">
                                      <Flag className="h-4 w-4 mr-2" />
                                      Flag Review
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {review.status === 'FLAGGED' && (
                                  <DropdownMenuItem onClick={() => handleAction('unflag', review)} className="text-blue-600">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Unflag Review
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAction('delete', review)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Review
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <h3 className="font-semibold mb-2">{review.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{review.content}</p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span>{getUserName(review)}</span>
                            <span>•</span>
                            <span>{review.business?.name || 'Unknown Business'}</span>
                          </div>
                          <span className="text-muted-foreground">{formatDate(review.createdAt)}</span>
                        </div>

                        {review.status === 'PENDING' && (
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <Button size="sm" onClick={() => handleAction('approve', review)} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAction('reject', review)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleAction('flag', review)}>
                              <Flag className="h-4 w-4 mr-2" />
                              Flag
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Review'}
              {actionType === 'reject' && 'Reject Review'}
              {actionType === 'flag' && 'Flag Review'}
              {actionType === 'unflag' && 'Unflag Review'}
              {actionType === 'delete' && 'Delete Review'}
              {actionType === 'view' && 'Review Details'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && `Approve "${selectedReview?.title}". This will publish the review.`}
              {actionType === 'reject' && `Reject "${selectedReview?.title}". Provide a reason below.`}
              {actionType === 'flag' && `Flag "${selectedReview?.title}". Provide a reason for flagging.`}
              {actionType === 'unflag' && `Remove flag from "${selectedReview?.title}".`}
              {actionType === 'delete' && `Delete "${selectedReview?.title}". This action cannot be undone.`}
              {actionType === 'view' && `View details for "${selectedReview?.title}".`}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Rejection Reason</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this review is being rejected..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {actionType === 'flag' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flagReason">Flag Reason</Label>
                <Textarea
                  id="flagReason"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Explain why this review is being flagged..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          {actionType === 'view' && selectedReview && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={statusColors[selectedReview.status] || 'bg-gray-500/10'}>{selectedReview.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={`star-detail-${star}`}
                        className={`h-4 w-4 ${
                          star <= selectedReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reviewer:</span>
                  <span>{getUserName(selectedReview)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Business:</span>
                  <span>{selectedReview.business?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span>{formatDate(selectedReview.createdAt)}</span>
                </div>
              </div>
            </div>
          )}

          {actionType === 'delete' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              disabled={isProcessing}
              variant={actionType === 'delete' || actionType === 'reject' ? 'destructive' : 'default'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'approve' ? 'Approve' :
                 actionType === 'reject' ? 'Reject' :
                 actionType === 'flag' ? 'Flag Review' :
                 actionType === 'unflag' ? 'Unflag Review' :
                 actionType === 'delete' ? 'Delete' :
                 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}