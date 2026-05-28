import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Users, MessageSquare, TrendingUp, ExternalLink, Settings, Eye, TrafficLight, BarChart3 } from 'lucide-react'

export default async function BusinessDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'BUSINESS' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Get business details
  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
    include: {
      reviews: {
        where: { status: 'APPROVED' },
        select: { rating: true },
      },
      trafficSignal: true,
    },
  })

  if (!business) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container-app py-8">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Business Profile</h2>
            <p className="text-muted-foreground mb-6">
              You don't have a business profile yet. Create one to start managing your online reputation.
            </p>
            <Link href="/dashboard/business/create">
              <Button>Create Business Profile</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalReviews = business.reviews.length
  const avgRating = totalReviews > 0 
    ? (business.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{business.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="capitalize">
                  {business.subscriptionTier} Plan
                </Badge>
                <div className="flex items-center gap-2">
                  <TrafficLight className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{business.trafficLightStatus}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/business/${business.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
            </Link>
            <Link href="/dashboard/business/edit">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-3xl font-bold">{totalReviews}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{avgRating}</p>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trust Score</p>
                  <p className="text-3xl font-bold">{Number(business.trustScore).toFixed(1)}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <BarChart3 className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your business profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Link href="/dashboard/business/reviews" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-3" />
                    Manage Reviews
                    <Badge className="ml-auto">{totalReviews}</Badge>
                  </Button>
                </Link>
                <Link href="/dashboard/business/widgets" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-3" />
                    Get Embed Codes
                  </Button>
                </Link>
                <Link href="/dashboard/business/analytics" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/business/traffic-signal" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <TrafficLight className="h-4 w-4 mr-3" />
                    Trust Signal Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Trust Signal Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trust Signal Status</CardTitle>
              <CardDescription>Complete these steps to achieve GREEN status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Insurance Policy URL', key: 'insuranceUrl', url: business.insuranceUrl },
                  { label: 'Terms & Conditions URL', key: 'termsUrl', url: business.termsUrl },
                  { label: 'Promise Page URL', key: 'promisePageUrl', url: business.promisePageUrl },
                  { label: 'Claim Page URL', key: 'claimPageUrl', url: business.claimPageUrl },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">{item.label}</span>
                    {item.url ? (
                      <Badge variant="default" className="bg-green-500">Configured</Badge>
                    ) : (
                      <Badge variant="secondary">Missing</Badge>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Active Subscription</span>
                  {business.subscriptionStatus === 'ACTIVE' ? (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <Link href="/dashboard/business/traffic-signal" className="w-full mt-4">
                <Button className="w-full">Update Trust Settings</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest reviews from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              {business.reviews.length > 0 ? (
                <div className="space-y-4">
                  {business.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
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
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{review.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              )}
              <Link href="/dashboard/business/reviews" className="w-full mt-4">
                <Button variant="outline" className="w-full">View All Reviews</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}