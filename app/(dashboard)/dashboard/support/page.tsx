import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth, isSupport } from '@/lib/auth'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Users, Clock, CheckCircle, AlertCircle, Plus, Settings, Inbox } from 'lucide-react'

export default async function SupportDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!isSupport(session.user.role) && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Get ticket counts
  const [
    openTickets,
    inProgressTickets,
    resolvedToday,
    avgResponseTime
  ] = await Promise.all([
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.supportTicket.count({ 
      where: { 
        status: 'RESOLVED',
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }),
    // Calculate average response time (mock for now)
    Promise.resolve('2.4 hours'),
  ])

  // Get recent tickets
  const recentTickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      },
    },
  })

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Support Dashboard</h1>
              <p className="text-muted-foreground">Manage customer support tickets</p>
            </div>
          </div>
          <Link href="/dashboard/support/tickets/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <p className="text-3xl font-bold">{openTickets}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              {openTickets > 0 && (
                <Badge variant="destructive" className="mt-2">Needs attention</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold">{inProgressTickets}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-3xl font-bold">{resolvedToday}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-3xl font-bold">{avgResponseTime}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Tickets</CardTitle>
                  <CardDescription>Latest support requests</CardDescription>
                </div>
                <Link href="/dashboard/support/tickets">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentTickets.length > 0 ? (
                  <div className="space-y-4">
                    {recentTickets.map((ticket) => (
                      <Link 
                        key={ticket.id} 
                        href={`/dashboard/support/tickets/${ticket.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{ticket.subject}</h4>
                              <Badge
                                variant={
                                  ticket.priority === 'URGENT' ? 'destructive' :
                                  ticket.priority === 'HIGH' ? 'default' :
                                  ticket.priority === 'MEDIUM' ? 'secondary' : 'outline'
                                }
                              >
                                {ticket.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{ticket.user.firstName} {ticket.user.lastName}</span>
                              <span>•</span>
                              <span>{ticket.user.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                ticket.status === 'OPEN' ? 'destructive' :
                                ticket.status === 'IN_PROGRESS' ? 'default' :
                                ticket.status === 'RESOLVED' ? 'secondary' : 'outline'
                              }
                            >
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tickets yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/dashboard/support/tickets?status=open" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <Inbox className="h-4 w-4 mr-3" />
                      Open Tickets
                      {openTickets > 0 && (
                        <Badge variant="destructive" className="ml-auto">{openTickets}</Badge>
                      )}
                    </Button>
                  </Link>
                  <Link href="/dashboard/support/tickets?priority=urgent" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-3" />
                      Urgent Issues
                    </Button>
                  </Link>
                  <Link href="/dashboard/support/tickets/new" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-3" />
                      Create Ticket
                    </Button>
                  </Link>
                  <Link href="/dashboard/support/settings" className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Urgent', count: await prisma.supportTicket.count({ where: { priority: 'URGENT', status: { not: 'CLOSED' } } }), color: 'bg-red-500' },
                    { label: 'High', count: await prisma.supportTicket.count({ where: { priority: 'HIGH', status: { not: 'CLOSED' } } }), color: 'bg-orange-500' },
                    { label: 'Medium', count: await prisma.supportTicket.count({ where: { priority: 'MEDIUM', status: { not: 'CLOSED' } } }), color: 'bg-yellow-500' },
                    { label: 'Low', count: await prisma.supportTicket.count({ where: { priority: 'LOW', status: { not: 'CLOSED' } } }), color: 'bg-green-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}