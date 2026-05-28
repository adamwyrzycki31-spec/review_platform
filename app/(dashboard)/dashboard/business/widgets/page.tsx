"use client"

import { useState } from 'react'
import { Copy, CheckCircle, Code, Widget, Grid, Layout, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BadgeWidget } from '@/components/widgets/BadgeWidget'
import { ScoreWidget } from '@/components/widgets/ScoreWidget'
import { CompactWidget } from '@/components/widgets/CompactWidget'

// Mock data - in production, this would come from the API
const mockBusiness = {
  name: 'TechCorp Inc',
  slug: 'techcorp-inc',
  trustScore: 4.5,
  reviewCount: 127,
  trafficLightStatus: 'GREEN' as const,
}

const widgetTypes = [
  {
    id: 'badge',
    name: 'Badge Widget',
    description: 'Display a trust badge with traffic light and score',
    icon: Star,
  },
  {
    id: 'carousel',
    name: 'Carousel Widget',
    description: 'Showcase customer reviews in a sliding carousel',
    icon: Grid,
  },
  {
    id: 'score',
    name: 'Score Widget',
    description: 'Compact score display for sidebars and footers',
    icon: Layout,
  },
  {
    id: 'compact',
    name: 'Compact Badge',
    description: 'Minimalist inline badge for tight spaces',
    icon: Code,
  },
]

export default function BusinessWidgetsPage() {
  const [selectedWidget, setSelectedWidget] = useState('badge')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, widgetId: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(widgetId)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getEmbedCode = (widgetId: string) => {
    switch (widgetId) {
      case 'badge':
        return `<!-- MyProtector Trust Badge -->
<a href="https://myprotector.org/business/${mockBusiness.slug}" target="_blank" rel="noopener">
  <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
    <span style="width:20px;height:20px;background:#22c55e;border-radius:50%;"></span>
    <span style="font-weight:600;color:#111;">${mockBusiness.name}</span>
    <span style="display:flex;align-items:center;gap:4px;padding:4px 8px;background:#f3f4f6;border-radius:4px;">
      <span style="color:#eab308;">★</span>
      <span style="font-weight:700;color:#111;">${mockBusiness.trustScore}</span>
      <span style="font-size:12px;color:#6b7280;">(${mockBusiness.reviewCount})</span>
    </span>
  </div>
</a>`
      case 'carousel':
        return `<!-- MyProtector Review Carousel -->
<script src="https://cdn.myprotector.org/widgets/carousel.js" async></script>
<div class="mp-carousel" data-business="${mockBusiness.slug}" data-count="5" style="max-width:600px;"></div>`
      case 'score':
        return `<!-- MyProtector Score Badge -->
<script src="https://cdn.myprotector.org/widgets/score.js" async></script>
<span class="mp-score" data-business="${mockBusiness.slug}">⭐ ${mockBusiness.trustScore} (${mockBusiness.reviewCount} reviews)</span>`
      case 'compact':
        return `<!-- MyProtector Compact Badge -->
<script src="https://cdn.myprotector.org/widgets/compact.js" async></script>
<span class="mp-compact" data-business="${mockBusiness.slug}">🛡️ ${mockBusiness.trustScore}</span>`
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Widget className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Embed Widgets</h1>
              <p className="text-muted-foreground">Add trust badges and reviews to your website</p>
            </div>
          </div>
        </div>

        {/* Widget Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Widget Preview</CardTitle>
            <CardDescription>See how your widgets will look on your website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="p-8 bg-gray-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Badge Widget</p>
                <BadgeWidget
                  businessName={mockBusiness.name}
                  trustScore={mockBusiness.trustScore}
                  reviewCount={mockBusiness.reviewCount}
                  trafficLightStatus={mockBusiness.trafficLightStatus}
                />
              </div>
              <div className="p-8 bg-gray-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Score Widget</p>
                <ScoreWidget
                  trustScore={mockBusiness.trustScore}
                  reviewCount={mockBusiness.reviewCount}
                  size="lg"
                />
              </div>
              <div className="p-8 bg-gray-100 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Compact Widget</p>
                <CompactWidget
                  trustScore={mockBusiness.trustScore}
                  trafficLightStatus={mockBusiness.trafficLightStatus}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Types */}
        <Tabs defaultValue="badge" className="w-full">
          <TabsList className="mb-6 grid grid-cols-4 w-full">
            {widgetTypes.map((widget) => {
              const Icon = widget.icon
              return (
                <TabsTrigger 
                  key={widget.id} 
                  value={widget.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {widget.name}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {widgetTypes.map((widget) => {
            const Icon = widget.icon
            const embedCode = getEmbedCode(widget.id)
            
            return (
              <TabsContent key={widget.id} value={widget.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{widget.name}</CardTitle>
                        <CardDescription>{widget.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Live Preview */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Live Preview</h4>
                      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                        {widget.id === 'badge' && (
                          <BadgeWidget
                            businessName={mockBusiness.name}
                            trustScore={mockBusiness.trustScore}
                            reviewCount={mockBusiness.reviewCount}
                            trafficLightStatus={mockBusiness.trafficLightStatus}
                          />
                        )}
                        {widget.id === 'carousel' && (
                          <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Carousel preview on website</p>
                          </div>
                        )}
                        {widget.id === 'score' && (
                          <ScoreWidget
                            trustScore={mockBusiness.trustScore}
                            reviewCount={mockBusiness.reviewCount}
                            size="lg"
                          />
                        )}
                        {widget.id === 'compact' && (
                          <CompactWidget
                            trustScore={mockBusiness.trustScore}
                            trafficLightStatus={mockBusiness.trafficLightStatus}
                          />
                        )}
                      </div>
                    </div>

                    {/* Embed Code */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Embed Code</h4>
                      <div className="relative">
                        <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto">
                          <code>{embedCode}</code>
                        </pre>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(embedCode, widget.id)}
                        >
                          {copiedCode === widget.id ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Code
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Installation Instructions */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3">Installation Instructions</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Copy the embed code above</li>
                        <li>Paste the code into your website's HTML where you want the widget to appear</li>
                        <li>For best results, place the badge near customer testimonials or your footer</li>
                        <li>Test the widget on your live site to ensure it displays correctly</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 h-fit">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Place Strategically</h4>
                  <p className="text-sm text-muted-foreground">
                    Position widgets near conversion points like signup forms or pricing pages.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 h-fit">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Keep Visible</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure widgets are above the fold and not hidden behind other elements.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 h-fit">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Use Consistent Colors</h4>
                  <p className="text-sm text-muted-foreground">
                    Match widget styling with your brand for a seamless look.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}