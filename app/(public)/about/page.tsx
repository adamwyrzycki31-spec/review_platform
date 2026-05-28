import { Shield, Users, Heart, Award, Target, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about MyProtector\'s mission to build trust in the marketplace through transparent reviews and verified businesses.',
}

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-founder',
    bio: 'Former trust & safety lead at a major tech company.',
  },
  {
    name: 'Michael Chen',
    role: 'CTO & Co-founder',
    bio: 'Engineering leader with 15+ years in consumer tech.',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Product',
    bio: 'Product strategist focused on user trust and transparency.',
  },
]

const values = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We believe honest, verified information empowers better decisions.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Our users drive everything we do. Their trust is our priority.',
  },
  {
    icon: Heart,
    title: 'Fairness',
    description: 'We treat all businesses equally and base trust on facts, not opinions.',
  },
  {
    icon: Award,
    title: 'Quality',
    description: 'We maintain high standards for reviews and verification processes.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-muted/30">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-emerald-500/5">
        <div className="container-app max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Building trust in the marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            MyProtector was founded with a simple mission: to help consumers make informed decisions 
            and to help honest businesses build credibility.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Every day, consumers make important decisions about which businesses to trust with their money, 
                  health, and wellbeing. Unfortunately, the online review landscape is filled with fake reviews, 
                  manipulated ratings, and businesses that hide their true nature.
                </p>
                <p>
                  MyProtector was created to solve this problem. We developed the Traffic Light Trust System—a 
                  unique verification process that goes beyond simple star ratings to give consumers a clear, 
                  at-a-glance indicator of whether a business has been verified for key trust factors.
                </p>
                <p>
                  Our platform combines human verification with technology to ensure reviews are authentic and 
                  businesses are held accountable. We work with businesses of all sizes to help them demonstrate 
                  their commitment to customer satisfaction.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '50K+', label: 'Verified Businesses' },
                { value: '2M+', label: 'Reviews' },
                { value: '150+', label: 'Countries' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <Card key={stat.label} className="text-center p-6">
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card">
        <div className="container-app">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center p-6">
                <CardContent>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container-app">
          <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-emerald-400 mx-auto mb-4" />
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold mb-4">Join us in building a more trustworthy marketplace</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're a consumer looking for trusted businesses or a business wanting to build credibility, 
            MyProtector is here to help.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/signup" className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors">
              Get Started
            </a>
            <a href="/contact" className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
