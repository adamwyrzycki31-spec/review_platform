# myprotector.org - Trust & Review Platform Architecture

## Project Overview

A production-ready review/trust platform inspired by Trustpilot, featuring traffic light trust signals, insurance verification, business dashboards, and premium UX/UI.

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4 + ShadCN UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: Zustand + React Query

### Backend (API Routes)
- **Runtime**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js with JWT
- **Validation**: Zod schemas

### External Services
- **Email**: Resend
- **Storage**: Cloudinary
- **Payments**: Stripe
- **CMS**: WordPress REST API ready

## Database Schema

### Users
```
users
├── id (UUID, PK)
├── email (unique)
├── password_hash
├── role (enum: INDIVIDUAL, BUSINESS, RESELLER, SUPPORT, ADMIN)
├── first_name
├── last_name
├── avatar_url
├── email_verified_at
├── created_at
├── updated_at
└── deleted_at
```

### Businesses
```
businesses
├── id (UUID, PK)
├── user_id (FK -> users)
├── name
├── slug (unique)
├── description
├── website
├── logo_url
├── cover_image_url
├── address
├── city
├── country
├── phone
├── email
├── category_id (FK -> categories)
├── trust_score (decimal)
├── review_count (int)
├── subscription_tier (enum: FREE, STARTER, PROFESSIONAL, ENTERPRISE)
├── subscription_status (enum: ACTIVE, CANCELLED, PAST_DUE)
├── subscription_expires_at
├── traffic_light_status (enum: RED, AMBER, GREEN)
├── insurance_url
├── terms_url
├── promise_page_url
├── claim_page_url
├── created_at
├── updated_at
└── verified_at
```

### Reviews
```
reviews
├── id (UUID, PK)
├── user_id (FK -> users)
├── business_id (FK -> businesses)
├── rating (int 1-5)
├── title
├── content
├── pros
├── cons
├── recommendation (enum: POSITIVE, NEUTRAL, NEGATIVE)
├── status (enum: PENDING, APPROVED, REJECTED, FLAGGED)
├── verified_purchase (boolean)
├── helpful_count (int)
├── report_count (int)
├── created_at
├── updated_at
└── published_at
```

### Review Images
```
review_images
├── id (UUID, PK)
├── review_id (FK -> reviews)
├── url
├── cloudinary_id
├── caption
├── order (int)
├── created_at
```

### Categories
```
categories
├── id (UUID, PK)
├── name
├── slug (unique)
├── description
├── icon
├── parent_id (FK -> categories, nullable)
├── review_count (int)
├── created_at
└── updated_at
```

### Traffic Signals (Trust Verification)
```
traffic_signals
├── id (UUID, PK)
├── business_id (FK -> businesses, unique)
├── has_insurance (boolean)
├── has_refund_promise (boolean)
├── has_claim_page (boolean)
├── has_terms_clauses (boolean)
├── has_active_subscription (boolean)
├── verified_at
├── expires_at
├── verified_by (FK -> users)
└── notes
```

### Blacklists
```
blacklists
├── id (UUID, PK)
├── business_id (FK -> businesses)
├── reporter_id (FK -> users)
├── reason
├── evidence_urls (JSON array)
├── status (enum: PENDING, APPROVED, REJECTED)
├── created_at
└── resolved_at
```

### Evidence Uploads
```
evidence_uploads
├── id (UUID, PK)
├── user_id (FK -> users)
├── business_id (FK -> businesses)
├── file_url
├── cloudinary_id
├── file_type (enum: PDF, IMAGE)
├── description
├── created_at
```

### Resellers
```
resellers
├── id (UUID, PK)
├── user_id (FK -> users)
├── referral_code (unique)
├── commission_rate (decimal)
├── total_commission (decimal)
├── paid_commission (decimal)
├── client_count (int)
├── created_at
└── updated_at
```

### Commissions
```
commissions
├── id (UUID, PK)
├── reseller_id (FK -> resellers)
├── business_id (FK -> businesses)
├── amount (decimal)
├── status (enum: PENDING, APPROVED, PAID)
├── created_at
└── paid_at
```

### Widgets
```
widgets
├── id (UUID, PK)
├── business_id (FK -> businesses)
├── type (enum: BADGE, CAROUSEL, SCORE, COMPACT)
├── config (JSON)
├── embed_code
├── created_at
└── updated_at
```

### Email Templates
```
email_templates
├── id (UUID, PK)
├── name
├── slug (unique)
├── subject
├── body (HTML)
├── variables (JSON)
├── created_at
└── updated_at
```

### Support Tickets
```
support_tickets
├── id (UUID, PK)
├── user_id (FK -> users)
├── business_id (FK -> businesses, nullable)
├── subject
├── content
├── status (enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED)
├── priority (enum: LOW, MEDIUM, HIGH, URGENT)
├── assigned_to (FK -> users)
├── created_at
└── updated_at
```

### Reports
```
reports
├── id (UUID, PK)
├── review_id (FK -> reviews)
├── reporter_id (FK -> users)
├── reason
├── description
├── status (enum: PENDING, REVIEWED, ACTIONED, DISMISSED)
├── admin_notes
├── created_at
└── resolved_at
```

### Page SEO
```
page_seo
├── id (UUID, PK)
├── page_path (unique)
├── meta_title
├── meta_description
├── og_title
├── og_description
├── og_image
├── canonical_url
├── robots (JSON)
├── schema_markup (JSON)
├── created_at
└── updated_at
```

## Folder Structure

```
/app
  /(public)
    /page.tsx                 # Homepage
    /about/page.tsx
    /pricing/page.tsx
    /categories/page.tsx
    /categories/[slug]/page.tsx
    /search/page.tsx
    /business/[slug]/page.tsx
    /business/[slug]/reviews/page.tsx
    /leave-review/[businessSlug]/page.tsx
    /blacklist/page.tsx
    /trust-signals/page.tsx
    /blog/page.tsx
    /contact/page.tsx
    /support/page.tsx
  /(auth)
    /login/page.tsx
    /signup/page.tsx
    /signup/business/page.tsx
    /signup/reseller/page.tsx
    /forgot-password/page.tsx
    /reset-password/page.tsx
    /verify-email/page.tsx
  /(dashboard)
    /dashboard/page.tsx
    /dashboard/profile/page.tsx
    /dashboard/business/page.tsx
    /dashboard/business/analytics/page.tsx
    /dashboard/business/subscription/page.tsx
    /dashboard/business/reviews/page.tsx
    /dashboard/business/widgets/page.tsx
    /dashboard/reseller/page.tsx
    /dashboard/reseller/commissions/page.tsx
    /dashboard/reseller/clients/page.tsx
    /dashboard/support/page.tsx
    /dashboard/support/tickets/page.tsx
    /dashboard/admin/page.tsx
    /dashboard/admin/users/page.tsx
    /dashboard/admin/businesses/page.tsx
    /dashboard/admin/reviews/page.tsx
    /dashboard/admin/categories/page.tsx
    /dashboard/admin/blacklist/page.tsx
    /dashboard/admin/traffic-lights/page.tsx
    /dashboard/admin/seo/page.tsx
    /dashboard/admin/emails/page.tsx
    /dashboard/admin/settings/page.tsx
  /api
    /auth/[...nextauth]/route.ts
    /businesses/route.ts
    /businesses/[id]/route.ts
    /reviews/route.ts
    /reviews/[id]/route.ts
    /reviews/[id]/report/route.ts
    /categories/route.ts
    /search/route.ts
    /upload/route.ts
    /email/route.ts
    /admin/...
  /sitemap.ts
  /robots.ts

/components
  /ui                      # ShadCN components
  /layout
    /Header.tsx
    /Footer.tsx
    /Sidebar.tsx
    /MobileNav.tsx
  /reviews
    /ReviewCard.tsx
    /ReviewList.tsx
    /ReviewForm.tsx
    /ReviewImages.tsx
    /StarRating.tsx
  /business
    /BusinessCard.tsx
    /BusinessHeader.tsx
    /TrustBadge.tsx
    /TrafficLightIndicator.tsx
  /dashboard
    /StatCard.tsx
    /DataTable.tsx
    /Chart.tsx
  /widgets
    /BadgeWidget.tsx
    /CarouselWidget.tsx
    /ScoreWidget.tsx
    /CompactWidget.tsx

/lib
  /db.ts                   # Prisma client
  /auth.ts                 # NextAuth config
  /email.ts                # Resend client
  /cloudinary.ts           # Cloudinary config
  /stripe.ts               # Stripe config
  /validations             # Zod schemas
  /utils.ts                # Utility functions
  /constants.ts            # App constants

/prisma
  /schema.prisma
  /seed.ts

/types
  /index.ts                # TypeScript interfaces

/public
  /images
  /fonts

/styles
  /globals.css
```

## Authentication Flow

1. **Registration Flow**
   - User selects role (Individual/Business/Reseller)
   - Email + Password signup with email verification
   - For businesses: Additional company details
   - JWT tokens stored in HTTP-only cookies

2. **Login Flow**
   - Email + Password authentication
   - Role-based redirect to appropriate dashboard
   - Session management with refresh tokens

3. **Role-Based Access**
   - Individual: Profile, Reviews, History
   - Business: Profile, Analytics, Reviews, Widgets, Subscription
   - Reseller: Clients, Commissions, Referral Tracking
   - Support: Tickets, User Management
   - Admin: Full platform access

## Traffic Light System

A business achieves GREEN status when ALL conditions are met:
1. ✅ Insurance policy exists (insurance_url populated)
2. ✅ Refund history promise submitted (promise_page_url populated)
3. ✅ Insurance claim page exists (claim_page_url populated)
4. ✅ Terms include refund/insurance clauses (terms_url populated)
5. ✅ Paid monthly subscription active (subscription_status = ACTIVE)

**Status Transitions:**
- RED: None or few conditions met
- AMBER: 2-4 conditions met
- GREEN: All 5 conditions met

## API Structure

### Public Endpoints
```
GET  /api/businesses              # List businesses
GET  /api/businesses/:slug        # Get business profile
GET  /api/businesses/:slug/reviews  # Get business reviews
GET  /api/categories              # List categories
GET  /api/search                  # Search businesses
POST /api/reviews                 # Create review
```

### Protected Endpoints
```
GET  /api/dashboard              # Dashboard data
PUT  /api/profile                # Update profile
POST /api/business/respond       # Respond to review
GET  /api/analytics              # Business analytics
POST /api/widget                 # Create widget
```

### Admin Endpoints
```
CRUD /api/admin/users
CRUD /api/admin/businesses
CRUD /api/admin/reviews
CRUD /api/admin/categories
PUT  /api/admin/traffic-lights/:id
CRUD /api/admin/blacklist
```

## SEO Implementation

1. **Dynamic Sitemap**
   - Auto-generated sitemap.xml
   - Priority and changefreq per page type
   - Lastmod based on content updates

2. **Meta Tags**
   - Editable via admin panel
   - Default templates per page type
   - Open Graph + Twitter Cards

3. **Schema.org Markup**
   - Organization schema on homepage
   - Review schema on business pages
   - BreadcrumbList schema

4. **Performance**
   - Server-side rendering
   - Image optimization
   - Static generation where possible

## Widget System

### Badge Widget
- Trustpilot-style trust badge
- Shows traffic light + score
- Customizable colors

### Carousel Widget
- Sliding review carousel
- Auto-play with controls
- Responsive sizing

### Score Widget
- Compact score display
- Star rating visualization
- Review count

### Compact Widget
- Minimalist inline badge
- Fits in footers/sidebars
- Multiple sizes

## Environment Variables

```env
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

## Deployment Architecture

```
┌─────────────────┐
│   Vercel CDN    │  (Static/SSR)
└────────┬────────┘
         │
    ┌────▼────┐
    │ Next.js │  (Serverless Functions)
    │ Frontend│
    └────┬────┘
         │
    ┌────▼────┐
    │ Railway │  (API + Database)
    │ Postgres │
    └──────────┘
```

## Next Steps

1. Initialize Next.js 15 project
2. Set up Prisma with PostgreSQL
3. Configure NextAuth.js
4. Build UI component library
5. Implement pages and API routes
6. Add seed data for demo
7. Deploy to Vercel + Railway
