import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: {
    default: 'MyProtector - Trusted Reviews & Business Verification',
    template: '%s | MyProtector',
  },
  description: 'Build trust in the marketplace through transparent reviews, verified businesses, and community accountability. Find trusted companies with our traffic light verification system.',
  keywords: ['reviews', 'trust', 'business verification', 'ratings', 'customer reviews', 'company reviews', 'trust signals'],
  authors: [{ name: 'MyProtector' }],
  creator: 'MyProtector',
  publisher: 'MyProtector',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://myprotector.org'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'MyProtector',
    title: 'MyProtector - Trusted Reviews & Business Verification',
    description: 'Build trust in the marketplace through transparent reviews, verified businesses, and community accountability.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MyProtector',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyProtector - Trusted Reviews & Business Verification',
    description: 'Build trust in the marketplace through transparent reviews, verified businesses, and community accountability.',
    images: ['/images/og-image.jpg'],
    creator: '@myprotector',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
