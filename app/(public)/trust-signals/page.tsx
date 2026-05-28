import Link from 'next/link'
import { Shield, CheckCircle, XCircle, AlertCircle, FileText, Link as LinkIcon, DollarSign, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TrustSignalsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10">
              <Shield className="h-12 w-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Traffic Light Trust System</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our unique trust verification system helps you identify trustworthy businesses
            at a glance with our traffic light indicator.
          </p>
        </div>

        {/* Traffic Light Status Explained */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-600">GREEN</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Fully verified and compliant. This business has:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Insurance policy URL verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Refund/promise page URL verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Insurance claim page URL verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Terms with insurance clauses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Active paid subscription
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-yellow-600">AMBER</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Partially verified. Some trust elements are in place:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-yellow-500" />
                  2-4 trust conditions met
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  May need additional verification
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Active subscription may vary
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Review the checklist to see which conditions are met.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-red-600">RED</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Not yet verified. This business has:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Limited or no trust verification
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Missing insurance documentation
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  May not have active subscription
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Proceed with caution and verify independently.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What Each Requirement Means */}
        <h2 className="text-2xl font-bold mb-6 text-center">What Each Requirement Means</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold">Insurance Policy URL</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                A link to the business's insurance policy or coverage documentation.
                This ensures they are properly insured for their operations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <LinkIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-semibold">Promise Page URL</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                A dedicated page explaining the business's refund, guarantee, or 
                promise policies. Shows transparency in their customer commitments.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <AlertCircle className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-semibold">Claim Page URL</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Information on how customers can file insurance claims or complaints.
                Provides a clear process for dispute resolution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <FileText className="h-5 w-5 text-yellow-500" />
                </div>
                <h3 className="font-semibold">Terms & Clauses</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                The business's terms of service must include insurance and refund clauses.
                This ensures legal backing for their promises.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="font-semibold">Active Subscription</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                A paid subscription to our platform indicates commitment to trust
                and accountability. Shows they invest in maintaining verification.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Users className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-semibold">Community Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                User reports and reviews contribute to the overall trust score.
                Transparent review history builds credibility.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How to Get Verified */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>For Businesses: How to Achieve GREEN Status</CardTitle>
            <CardDescription>
              Follow these steps to get your business verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Sign up for a paid subscription</h4>
                  <p className="text-sm text-muted-foreground">Choose a plan that fits your business needs</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold">Add your insurance documentation URLs</h4>
                  <p className="text-sm text-muted-foreground">Provide links to your insurance policy, claim page, and terms</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Create a promise/refund page</h4>
                  <p className="text-sm text-muted-foreground">Document your commitment to customers with clear policies</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold">Submit for verification</h4>
                  <p className="text-sm text-muted-foreground">Our team will review your documentation and approve</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/signup/business">
                <Button size="lg">
                  Get Verified
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Want to learn more about how trust signals work?
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/about">
              <Button variant="outline">Learn About Us</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}