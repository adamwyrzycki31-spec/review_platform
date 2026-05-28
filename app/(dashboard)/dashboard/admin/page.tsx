import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, isAdmin } from '@/lib/auth'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, Star, MessageSquare, AlertTriangle, Settings, Shield, FileText, Link2 } from 'lucide-react'

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  // Get counts for dashboard
  const [
    userCount,
    businessCount,
    pendingReviewCount,
    openTicketCount,
    pendingBlacklistCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.blacklist.count({ where: { status: 'PENDING' } }),
  ])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage the entire platform</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{userCount}</p>
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
                  <p className="text-sm text-muted-foreground">Businesses</p>
                  <p className="text-3xl font-bold">{businessCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10">
                  <Building2 className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-3xl font-bold">{pendingReviewCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              {pendingReviewCount > 0 && (
                <Badge variant="destructive" className="mt-2">{pendingReviewCount} needs attention</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <p className="text-3xl font-bold">{openTicketCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <MessageSquare className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              {openTicketCount > 0 && (
                <Badge variant="destructive" className="mt-2">{openTicketCount} needs attention</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blacklist Reports</p>
                  <p className="text-3xl font-bold">{pendingBlacklistCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              {pendingBlacklistCount > 0 && (
                <Badge variant="destructive" className="mt-2">{pendingBlacklistCount} needs attention</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/admin/users" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    View All Users
                    <Badge className="ml-auto">{userCount}</Badge>
                  </Button>
                </Link>
                <Link href="/dashboard/admin/users?action=create" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Create User
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Management
              </CardTitle>
              <CardDescription>Manage business profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/admin/businesses" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    View All Businesses
                    <Badge className="ml-auto">{businessCount}</Badge>
                  </Button>
                </Link>
                <Link href="/dashboard/admin/businesses?action=create" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Create Business
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Review Moderation
              </CardTitle>
              <CardDescription>Review and moderate user reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/admin/reviews" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Manage Reviews
                    {pendingReviewCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">{pendingReviewCount}</Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/dashboard/admin/reviews?status=pending" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Pending Approval
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Traffic Lights
              </CardTitle>
              <CardDescription>Verify business trust signals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/admin/traffic-lights" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Manage Traffic Lights
                  </Button>
                </Link>
                <Link href="/dashboard/admin/traffic-lights?status=pending" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Pending Verification
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                SEO & Content
              </CardTitle>
              <CardDescription>Manage SEO and page content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/admin/seo" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    SEO Settings
                  </Button>
                </Link>
                <Link href="/dashboard/admin/categories" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Categories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
              <CardDescription>Configure platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/admin/settings" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    General Settings
                  </Button>
                </Link>
                <Link href="/dashboard/admin/emails" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Email Templates
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New user registered', details: 'john@example.com', time: '2 hours ago', icon: Users },
                { action: 'Business claim approved', details: 'TechCorp Inc', time: '4 hours ago', icon: Building2 },
                { action: 'Review approved', details: '5-star review for TechCorp', time: '6 hours ago', icon: Star },
                { action: 'Ticket resolved', details: 'Payment inquiry #1234', time: '1 day ago', icon: MessageSquare },
              ].map((activity, i) => {
                const Icon = activity.icon
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-lg bg-background">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.details}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}