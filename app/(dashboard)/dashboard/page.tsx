import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Users, Building2, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const { role, name, email } = session.user

  // Role-specific dashboard content
  const getDashboardContent = () => {
    switch (role) {
      case 'BUSINESS':
        return {
          title: 'Business Dashboard',
          stats: [
            { title: 'Total Reviews', value: '127', icon: Star, trend: { value: 12, label: 'vs last month' } },
            { title: 'Average Rating', value: '4.8', icon: TrendingUp, trend: { value: 5, label: 'vs last month' } },
            { title: 'Profile Views', value: '2.3K', icon: Users, trend: { value: 23, label: 'vs last month' } },
            { title: 'Response Rate', value: '98%', icon: FileText },
          ],
          actions: [
            { label: 'Manage Business', href: '/dashboard/business', icon: Building2 },
            { label: 'View Reviews', href: '/dashboard/business/reviews', icon: Star },
            { label: 'Get Widgets', href: '/dashboard/business/widgets', icon: FileText },
          ],
        }
      case 'RESELLER':
        return {
          title: 'Reseller Dashboard',
          stats: [
            { title: 'Total Commissions', value: '$4,250', icon: TrendingUp, trend: { value: 15, label: 'vs last month' } },
            { title: 'Active Clients', value: '23', icon: Users, trend: { value: 8, label: 'vs last month' } },
            { title: 'Pending Payout', value: '$650', icon: FileText },
            { title: 'Conversion Rate', value: '12%', icon: TrendingUp },
          ],
          actions: [
            { label: 'View Commissions', href: '/dashboard/reseller/commissions', icon: TrendingUp },
            { label: 'Your Clients', href: '/dashboard/reseller/clients', icon: Users },
          ],
        }
      case 'ADMIN':
      case 'SUPPORT':
        return {
          title: 'Admin Dashboard',
          stats: [
            { title: 'Total Users', value: '15,234', icon: Users, trend: { value: 5, label: 'vs last month' } },
            { title: 'Total Businesses', value: '3,456', icon: Building2, trend: { value: 8, label: 'vs last month' } },
            { title: 'Pending Reviews', value: '42', icon: Star, trend: { value: -20, label: 'vs last week' } },
            { title: 'Open Tickets', value: '15', icon: FileText },
          ],
          actions: [
            { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
            { label: 'Manage Businesses', href: '/dashboard/admin/businesses', icon: Building2 },
            { label: 'Moderate Reviews', href: '/dashboard/admin/reviews', icon: Star },
          ],
        }
      default:
        return {
          title: 'Dashboard',
          stats: [
            { title: 'Reviews Written', value: '8', icon: Star },
            { title: 'Helpful Votes', value: '45', icon: TrendingUp },
            { title: 'Account Age', value: '3 months', icon: Users },
          ],
          actions: [
            { label: 'Write a Review', href: '/search', icon: Star },
            { label: 'Edit Profile', href: '/dashboard/profile', icon: Users },
          ],
        }
    }
  }

  const content = getDashboardContent()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{content.title}</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {name || email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline">View Site</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {content.stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {content.actions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.label} href={action.href}>
                      <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group">
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                          <Icon className="h-5 w-5 text-primary group-hover:text-white" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                        <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'New review approved', time: '2 hours ago', icon: Star },
                  { title: 'Profile updated', time: '1 day ago', icon: Building2 },
                  { title: 'Welcome to MyProtector!', time: '3 months ago', icon: Users },
                ].map((activity, i) => {
                  const Icon = activity.icon
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
