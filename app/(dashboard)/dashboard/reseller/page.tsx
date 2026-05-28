import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, isReseller } from '@/lib/auth'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, TrendingUp, Copy, Link2, BarChart3, Gift, Settings } from 'lucide-react'

export default async function ResellerDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!isReseller(session.user.role)) {
    redirect('/dashboard')
  }

  // Get reseller details
  const reseller = await prisma.reseller.findUnique({
    where: { userId: session.user.id },
    include: {
      commissions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!reseller) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container-app py-8">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Reseller Account</h2>
            <p className="text-muted-foreground mb-6">
              You don't have a reseller account yet. Contact support to become a reseller.
            </p>
            <Link href="/support">
              <Button>Contact Support</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  // Calculate stats
  const pendingCommission = reseller.commissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + Number(c.amount), 0)

  const referralLink = `https://myprotector.org/signup?ref=${reseller.referralCode}`

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <Gift className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Reseller Dashboard</h1>
              <p className="text-muted-foreground">Manage your clients and commissions</p>
            </div>
          </div>
          <Link href="/dashboard/reseller/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Commissions</p>
                  <p className="text-3xl font-bold">${Number(reseller.totalCommission).toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Out</p>
                  <p className="text-3xl font-bold">${Number(reseller.paidCommission).toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payout</p>
                  <p className="text-3xl font-bold">${pendingCommission.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                  <p className="text-3xl font-bold">{reseller.clientCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>Share this link to earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 rounded-lg bg-muted font-mono text-sm">
                {referralLink}
              </div>
              <Button 
                variant="outline"
                onClick={() => navigator.clipboard.writeText(referralLink)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-700">
                <strong>Commission Rate:</strong> {(Number(reseller.commissionRate) * 100).toFixed(0)}% on all sales
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Referral code: <span className="font-mono">{reseller.referralCode}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Commissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recent Commissions
              </CardTitle>
              <CardDescription>Your latest earnings</CardDescription>
            </CardHeader>
            <CardContent>
              {reseller.commissions.length > 0 ? (
                <div className="space-y-4">
                  {reseller.commissions.map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">${Number(commission.amount).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {commission.description || 'Commission'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          commission.status === 'PAID' ? 'default' :
                          commission.status === 'APPROVED' ? 'secondary' : 'outline'
                        }
                      >
                        {commission.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No commissions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start referring clients to earn commissions
                  </p>
                </div>
              )}
              <Link href="/dashboard/reseller/commissions" className="w-full mt-4">
                <Button variant="outline" className="w-full">View All Commissions</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your reseller account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/reseller/commissions" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-3" />
                    View Commissions
                  </Button>
                </Link>
                <Link href="/dashboard/reseller/clients" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-3" />
                    View Clients
                  </Button>
                </Link>
                <Link href="/dashboard/reseller/analytics" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                >
                  <Copy className="h-4 w-4 mr-3" />
                  Copy Referral Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}