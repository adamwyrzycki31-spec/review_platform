"use client"

import { useState } from 'react'
import { BarChart3, TrendingUp, Eye, MessageSquare, Star, Users, Calendar, Download, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Mock data for analytics
const overviewStats = {
  totalReviews: 127,
  avgRating: 4.5,
  totalViews: 2340,
  responseRate: 98,
  monthlyGrowth: 12,
}

const reviewsByMonth = [
  { month: 'Jan', reviews: 8 },
  { month: 'Feb', reviews: 12 },
  { month: 'Mar', reviews: 15 },
  { month: 'Apr', reviews: 10 },
  { month: 'May', reviews: 18 },
  { month: 'Jun', reviews: 22 },
]

const ratingDistribution = [
  { name: '5 Stars', value: 65, color: '#22c55e' },
  { name: '4 Stars', value: 30, color: '#84cc16' },
  { name: '3 Stars', value: 20, color: '#eab308' },
  { name: '2 Stars', value: 8, color: '#f97316' },
  { name: '1 Star', value: 4, color: '#ef4444' },
]

const trafficLightStats = [
  { status: 'GREEN', count: 45, color: '#22c55e' },
  { status: 'AMBER', count: 30, color: '#eab308' },
  { status: 'RED', count: 25, color: '#ef4444' },
]

const topReferrers = [
  { source: 'Google Search', visits: 450, percentage: 35 },
  { source: 'Direct', visits: 320, percentage: 25 },
  { source: 'Social Media', visits: 180, percentage: 14 },
  { source: 'Referral', visits: 150, percentage: 12 },
  { source: 'Other', visits: 140, percentage: 11 },
]

const recentReviews = [
  { id: '1', author: 'John D.', rating: 5, title: 'Excellent service!', date: '2 hours ago', status: 'APPROVED' },
  { id: '2', author: 'Sarah M.', rating: 4, title: 'Very good experience', date: '1 day ago', status: 'APPROVED' },
  { id: '3', author: 'Mike R.', rating: 3, title: 'Average service', date: '3 days ago', status: 'PENDING' },
]

export default function BusinessAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  const exportData = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Reviews', 'Rating', 'Views'],
      ...reviewsByMonth.map(row => [row.month, row.reviews, overviewStats.avgRating, overviewStats.totalViews])
    ].map(row => row.join(',')).join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `myprotector-analytics-${dateRange}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Track your business performance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{overviewStats.totalReviews}</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                <TrendingUp className="h-3 w-3" />
                <span>+{overviewStats.monthlyGrowth}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{overviewStats.avgRating}</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= Math.round(overviewStats.avgRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">{overviewStats.totalViews.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Eye className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                <TrendingUp className="h-3 w-3" />
                <span>+18%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">{overviewStats.responseRate}%</p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trust Score</p>
                  <p className="text-2xl font-bold">4.5</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <Badge variant="default" className="mt-2 bg-green-500">GREEN</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Reviews Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews Over Time</CardTitle>
                  <CardDescription>Number of reviews received per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reviewsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="reviews" fill="#22c55e" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>Breakdown of review ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ratingDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {ratingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest customer reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex items-center gap-2">
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
                      <div className="flex-1">
                        <h4 className="font-medium">{review.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          by {review.author} • {review.date}
                        </p>
                      </div>
                      <Badge
                        variant={review.status === 'APPROVED' ? 'default' : 'secondary'}
                        className={review.status === 'APPROVED' ? 'bg-green-500' : ''}
                      >
                        {review.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topReferrers.map((referrer) => (
                    <div key={referrer.source} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{referrer.source}</span>
                          <span className="text-sm text-muted-foreground">
                            {referrer.visits.toLocaleString()} ({referrer.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${referrer.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Light Status</CardTitle>
                  <CardDescription>Business verification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trafficLightStats.map((stat) => (
                      <div key={stat.status} className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}20` }}
                        >
                          <span className="text-xl font-bold" style={{ color: stat.color }}>
                            {stat.count}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{stat.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.status === 'GREEN' && 'Fully verified'}
                            {stat.status === 'AMBER' && 'Partially verified'}
                            {stat.status === 'RED' && 'Not verified'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Growth</CardTitle>
                  <CardDescription>Monthly progress metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reviewsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="reviews"
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={{ fill: '#22c55e' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}