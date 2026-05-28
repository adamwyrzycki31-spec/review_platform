import Link from 'next/link'
import { AlertTriangle, Shield, Search, CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Mock blacklist data for demonstration
const mockBlacklistEntries = [
  {
    id: '1',
    businessName: 'ScamCo Solutions',
    website: 'https://scamco-example.com',
    reportedBy: 'Multiple Users',
    reason: 'Fraudulent activities, non-delivery of services',
    status: 'APPROVED',
    reportDate: '2024-05-15',
  },
  {
    id: '2',
    businessName: 'FakeProducts Inc',
    website: 'https://fakeproducts-example.com',
    reportedBy: 'Community Report',
    reason: 'Selling counterfeit products',
    status: 'APPROVED',
    reportDate: '2024-04-28',
  },
]

export default function BlacklistPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-app py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Public Blacklist</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Businesses that have been verified as untrustworthy or involved in fraudulent activities.
            This list is maintained by our community and verified by our team.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="font-semibold mb-2">Reported Businesses</h3>
              <p className="text-sm text-muted-foreground">
                Businesses reported for fraud, scams, or deceptive practices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-yellow-500" />
              </div>
              <h3 className="font-semibold mb-2">Verified Reports</h3>
              <p className="text-sm text-muted-foreground">
                All reports are reviewed and verified by our moderation team
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Community Safety</h3>
              <p className="text-sm text-muted-foreground">
                Help protect other consumers by reporting bad actors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Blacklist Entries */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Listed Businesses</CardTitle>
            <CardDescription>
              Businesses that have been verified and added to the blacklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockBlacklistEntries.length > 0 ? (
              <div className="space-y-4">
                {mockBlacklistEntries.map((entry) => (
                  <div key={entry.id} className="p-6 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{entry.businessName}</h3>
                          <a
                            href={entry.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                          >
                            {entry.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <Badge variant="destructive">Blacklisted</Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reason for Blacklist</p>
                        <p className="text-sm">{entry.reason}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>Reported by: {entry.reportedBy}</span>
                          <span>•</span>
                          <span>Date: {entry.reportDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                      <p className="text-sm font-medium text-red-700">
                        ⚠️ Warning: This business has been verified as untrustworthy. 
                        Do not engage with this business or provide any personal information.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No blacklisted businesses</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Report */}
        <Card>
          <CardHeader>
            <CardTitle>Report a Business</CardTitle>
            <CardDescription>
              Help protect the community by reporting fraudulent businesses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you have been scammed or encountered a fraudulent business, please report them.
                Our team will investigate and take appropriate action.
              </p>
              <div className="flex gap-4">
                <Link href="/contact">
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Report
                  </Button>
                </Link>
                <Link href="/support">
                  <Button variant="outline">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-8 p-6 bg-muted rounded-lg text-sm text-muted-foreground text-center">
          <p>
            This blacklist is provided for informational purposes. While we verify reports carefully, 
            MyProtector is not responsible for any interactions with listed businesses. 
            Always conduct your own due diligence before engaging with any company.
          </p>
        </div>
      </div>
    </div>
  )
}