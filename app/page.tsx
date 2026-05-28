import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Star, Users, Building2, CheckCircle, Search, TrendingUp, Award, Globe, Lock, ChevronRight, Scale, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrafficLightIndicator } from '@/components/business/TrafficLight'
import { BusinessCard } from '@/components/business/BusinessCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyProtector - Trusted Reviews & Business Verification Platform',
  description: 'Find trusted businesses with our unique traffic light verification system. Read real reviews, check trust signals, and make informed decisions.',
}

const features = [
  {
    icon: Shield,
    title: 'Traffic Light Trust System',
    description: 'Our unique verification system shows at a glance which businesses are fully trusted based on insurance, terms, and more.',
  },
  {
    icon: CheckCircle,
    title: 'Verified Reviews',
    description: 'Every review is checked for authenticity. We filter out fake reviews to give you real opinions from real customers.',
  },
  {
    icon: Lock,
    title: 'Business Verification',
    description: 'We verify business credentials including insurance policies, refund promises, and terms & conditions.',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Search and review businesses from around the world. Our platform supports multiple countries and languages.',
  },
]

const stats = [
  { value: '50K+', label: 'Verified Businesses' },
  { value: '2M+', label: 'Reviews' },
  { value: '98%', label: 'Trust Score' },
  { value: '150+', label: 'Countries' },
]

const categories = [
  { name: 'Retail & E-commerce', icon: '🛒', count: 12500 },
  { name: 'Financial Services', icon: '💰', count: 8300 },
  { name: 'Technology', icon: '💻', count: 15600 },
  { name: 'Healthcare', icon: '🏥', count: 9200 },
  { name: 'Real Estate', icon: '🏠', count: 7100 },
  { name: 'Travel & Hospitality', icon: '✈️', count: 10800 },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-primary/20 to-transparent rounded-full blur-3xl opacity-30" />
        
        <div className="container-app relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="h-4 w-4" />
                Trusted by millions worldwide
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Find businesses you can{' '}
                <span className="text-gradient">trust</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl">
                Our unique traffic light system helps you instantly identify verified, trusted businesses. 
                Read real reviews, check trust signals, and make informed decisions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search for a company or service..."
                    className="w-full h-14 pl-12 pr-32 rounded-xl border border-input bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <Button className="absolute right-2 top-1/2 -translate-y-1/2" size="lg">
                    Search
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Verified reviews only</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-3xl blur-2xl" />
              <div className="relative space-y-4">
                {/* Trust Score Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">TechCorp Solutions</h3>
                      <p className="text-sm text-muted-foreground">Technology Services</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">4.8</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    <TrafficLightIndicator status="GREEN" size="lg" />
                  </div>
                </div>
                
                {/* Reviews Preview */}
                <div className="bg-white rounded-2xl shadow-xl p-4 border border-border -ml-8">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Sarah M.</span>
                        <Badge variant="success" className="text-xs">Verified</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`h-3 w-3 ${i <= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        "Excellent service! The traffic light system gives me confidence..."
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-border">
                    <div className="text-2xl font-bold text-primary">50K+</div>
                    <div className="text-xs text-muted-foreground">Businesses</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-border">
                    <div className="text-2xl font-bold text-primary">2M+</div>
                    <div className="text-xs text-muted-foreground">Reviews</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 text-center border border-border">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-xs text-muted-foreground">Trust Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust System Explanation */}
      <section className="py-20">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How our traffic light system works
            </h2>
            <p className="text-lg text-muted-foreground">
              We verify businesses against 5 key criteria to give you instant trust signals.
              Look for the green light to know you're dealing with a verified partner.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 rounded-full bg-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Red Light</h3>
              <p className="text-muted-foreground">
                Few or no verification checks completed. Exercise caution and do your own research.
              </p>
            </Card>
            
            <Card className="text-center p-8 border-primary/50 shadow-lg shadow-primary/10">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Amber Light</h3>
              <p className="text-muted-foreground">
                Partial verification completed. Some trust signals verified, others pending.
              </p>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Green Light</h3>
              <p className="text-muted-foreground">
                Full verification complete. Insurance, terms, refund policy, and subscription all verified.
              </p>
            </Card>
          </div>
          
          <div className="bg-muted rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-semibold mb-8 text-center">The 5 Verification Checks</h3>
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { icon: Shield, label: 'Insurance Policy', desc: 'Verified coverage' },
                { icon: CheckCircle, label: 'Refund Promise', desc: 'Money-back guarantee' },
                { icon: File, label: 'Claim Process', desc: 'Clear procedure' },
                { icon: Scale, label: 'Terms & Conditions', desc: 'Clear clauses' },
                { icon: Award, label: 'Premium Partner', desc: 'Active subscription' },
              ].map((check, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <check.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="font-medium mb-1">{check.label}</h4>
                  <p className="text-sm text-muted-foreground">{check.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container-app">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why choose MyProtector?
            </h2>
            <p className="text-lg text-muted-foreground">
              We're building the most trusted review platform by focusing on verification, transparency, and community accountability.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container-app">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Browse by category</h2>
              <p className="text-muted-foreground">Find trusted businesses in your industry</p>
            </div>
            <Link href="/categories">
              <Button variant="outline">
                View all categories
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href={`/categories/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                <Card className="p-4 text-center hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count.toLocaleString()} businesses</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-emerald-600 text-white">
        <div className="container-app text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to build trust with your customers?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that use MyProtector to showcase their credibility and earn customer trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup/business">
              <Button size="lg" variant="secondary" className="text-primary">
                Claim Your Business
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
