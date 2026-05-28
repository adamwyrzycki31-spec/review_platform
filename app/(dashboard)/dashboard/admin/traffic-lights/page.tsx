"use client"

import { useState } from 'react'
import { Shield, Search, Filter, MoreHorizontal, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react'
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
import { TrafficLightIndicator } from '@/components/business/TrafficLight'

// Mock traffic light data for demonstration
const mockTrafficSignals = [
  { 
    id: '1',
    businessId: 'b1',
    businessName: 'TechCorp Inc',
    hasInsurance: true,
    hasRefundPromise: true,
    hasClaimPage: true,
    hasTermsClauses: true,
    hasActiveSubscription: true,
    verifiedAt: '2024-05-15',
    verifiedBy: 'Admin User',
    conditionsCount: 5,
    status: 'GREEN' as const,
  },
  { 
    id: '2',
    businessId: 'b2',
    businessName: 'StartupXYZ',
    hasInsurance: true,
    hasRefundPromise: false,
    hasClaimPage: true,
    hasTermsClauses: false,
    hasActiveSubscription: true,
    verifiedAt: '2024-05-20',
    verifiedBy: 'Admin User',
    conditionsCount: 3,
    status: 'AMBER' as const,
  },
  { 
    id: '3',
    businessId: 'b3',
    businessName: 'NewBusiness',
    hasInsurance: false,
    hasRefundPromise: false,
    hasClaimPage: false,
    hasTermsClauses: false,
    hasActiveSubscription: false,
    verifiedAt: null,
    verifiedBy: null,
    conditionsCount: 0,
    status: 'RED' as const,
  },
]

const conditionLabels = [
  { key: 'hasInsurance', label: 'Insurance Policy URL' },
  { key: 'hasRefundPromise', label: 'Refund/Promise Page URL' },
  { key: 'hasClaimPage', label: 'Insurance Claim Page URL' },
  { key: 'hasTermsClauses', label: 'Terms with Insurance Clauses' },
  { key: 'hasActiveSubscription', label: 'Active Subscription' },
]

export default function AdminTrafficLightsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredSignals = mockTrafficSignals.filter(signal => {
    const matchesSearch = signal.businessName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || signal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const greenCount = mockTrafficSignals.filter(s => s.status === 'GREEN').length
  const amberCount = mockTrafficSignals.filter(s => s.status === 'AMBER').length
  const redCount = mockTrafficSignals.filter(s => s.status === 'RED').length

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Traffic Light Management</h1>
              <p className="text-muted-foreground">Verify and manage business trust signals</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-green-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">GREEN Status</p>
                  <p className="text-3xl font-bold text-green-600">{greenCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">All conditions met</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AMBER Status</p>
                  <p className="text-3xl font-bold text-yellow-600">{amberCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Partial compliance</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">RED Status</p>
                  <p className="text-3xl font-bold text-red-600">{redCount}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Non-compliant</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Businesses</p>
                  <p className="text-3xl font-bold">{mockTrafficSignals.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="green">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Green ({greenCount})
              </span>
            </TabsTrigger>
            <TabsTrigger value="amber">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                Amber ({amberCount})
              </span>
            </TabsTrigger>
            <TabsTrigger value="red">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Red ({redCount})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Traffic Lights</CardTitle>
                    <CardDescription>Manage trust verification for all businesses</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search businesses..."
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
                      <option value="GREEN">Green</option>
                      <option value="AMBER">Amber</option>
                      <option value="RED">Red</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TrafficLightsTable signals={filteredSignals} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="green">
            <Card>
              <CardHeader>
                <CardTitle>Green Status Businesses</CardTitle>
                <CardDescription>Businesses with all trust conditions met</CardDescription>
              </CardHeader>
              <CardContent>
                <TrafficLightsTable signals={filteredSignals.filter(s => s.status === 'GREEN')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="amber">
            <Card>
              <CardHeader>
                <CardTitle>Amber Status Businesses</CardTitle>
                <CardDescription>Businesses with partial trust compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <TrafficLightsTable signals={filteredSignals.filter(s => s.status === 'AMBER')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="red">
            <Card>
              <CardHeader>
                <CardTitle>Red Status Businesses</CardTitle>
                <CardDescription>Businesses that need trust verification</CardDescription>
              </CardHeader>
              <CardContent>
                <TrafficLightsTable signals={filteredSignals.filter(s => s.status === 'RED')} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TrafficLightsTable({ signals }: { signals: typeof mockTrafficSignals }) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No traffic lights found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <div key={signal.id} className="p-4 rounded-lg border bg-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <TrafficLightIndicator status={signal.status} size="md" />
              <div>
                <h3 className="font-semibold text-lg">{signal.businessName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {signal.verifiedAt ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verified by {signal.verifiedBy} on {signal.verifiedAt}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Not yet verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {signal.conditionsCount}/5 conditions
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
                    View Business
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Now
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {conditionLabels.map((condition) => (
              <div
                key={condition.key}
                className={`p-3 rounded-lg text-center ${
                  signal[condition.key as keyof typeof signal]
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                {signal[condition.key as keyof typeof signal] ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                )}
                <p className="text-xs font-medium">{condition.label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}