# MyProtector - Trust & Review Platform

A production-ready review and trust platform inspired by Trustpilot, featuring a unique Traffic Light Trust System, business verification, and premium UX/UI.

## 🌟 Features

### Core Platform
- **Traffic Light Trust System**: Unique 5-point verification system (Insurance, Refund Promise, Claim Page, Terms, Subscription)
- **Business Verification**: Verify insurance, terms, refund policies
- **Review Management**: Create, moderate, and manage reviews with images
- **Role-Based Dashboards**: Individual, Business, Reseller, Support, and Admin dashboards

### User Types
- **Individuals**: Write reviews, track history
- **Businesses**: Claim profiles, manage reviews, get widgets
- **Resellers**: Track commissions, manage clients
- **Support**: Handle tickets, moderate content
- **Admins**: Full platform management

### Public Features
- Homepage with hero search
- Company profile pages
- Review pages
- Search with filters
- Categories browsing
- Traffic light indicators
- Social sharing

### SEO Features
- Dynamic sitemap.xml
- Robots.txt
- OpenGraph tags
- Schema.org markup
- Meta tags per page

### Technical Stack
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, ShadCN UI, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js with JWT
- **Email**: Resend
- **Storage**: Cloudinary
- **Payments**: Stripe

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/myprotector.git
cd myprotector
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myprotector"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend Email (optional)
RESEND_API_KEY="re_..."

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data (optional)
npm run db:seed
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Demo Credentials

After seeding the database:
- **Admin**: admin@myprotector.org / Admin@123
- **User**: demo@myprotector.org / User@123

## 📁 Project Structure

```
myprotector/
├── app/                    # Next.js app router
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   ├── (public)/         # Public pages
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── sitemap.ts        # Dynamic sitemap
├── components/
│   ├── ui/              # ShadCN UI components
│   ├── layout/          # Header, Footer
│   ├── reviews/         # Review components
│   ├── business/        # Business components
│   └── dashboard/       # Dashboard components
├── lib/                  # Utility functions
│   ├── auth.ts          # NextAuth config
│   ├── db.ts            # Prisma client
│   ├── email.ts         # Email templates
│   └── utils.ts         # Helper functions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Demo data
├── types/                # TypeScript types
└── styles/
    └── globals.css       # Global styles
```

## 🎨 Traffic Light Trust System

A business achieves GREEN status when ALL conditions are met:

| Check | Description |
|-------|-------------|
| Insurance | Verified insurance policy URL |
| Refund Promise | Refund/money-back guarantee page |
| Claim Page | Insurance claim process page |
| Terms | Terms with refund/insurance clauses |
| Subscription | Active paid subscription |

**Status Thresholds:**
- 🟢 **GREEN**: 5/5 checks passed (100%)
- 🟡 **AMBER**: 2-4 checks passed (40-80%)
- 🔴 **RED**: 0-1 checks passed (0-20%)

## 🌐 API Routes

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses` | List businesses |
| GET | `/api/businesses/[slug]` | Get business |
| GET | `/api/reviews` | List reviews |
| POST | `/api/reviews` | Create review |

### Protected Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard data |
| PUT | `/api/profile` | Update profile |
| POST | `/api/business/respond` | Respond to review |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/traffic-lights` | Update trust status |
| POST | `/api/admin/reviews/moderate` | Moderate reviews |

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Railway

1. Create new Railway project
2. Add PostgreSQL database
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Manual VPS

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/your-org/myprotector.git
cd myprotector
npm install
npm run build

# Run with PM2
pm2 start npm --name "myprotector" -- start
```

## 📧 Email Configuration

The platform supports email notifications via Resend:

- Verification emails
- Password reset
- Review notifications
- Welcome emails

Set `RESEND_API_KEY` in environment variables to enable.

## 🔐 Security Features

- Password hashing with bcrypt
- JWT session management
- Rate limiting ready
- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection
- CSRF protection

## 🧪 Testing

```bash
# Run tests
npm run test

# Run linting
npm run lint
```

## 📊 Database Schema

Key models:
- **User**: Authentication and profiles
- **Business**: Company information
- **Review**: Customer reviews
- **TrafficSignal**: Trust verification
- **Category**: Business categories
- **Widget**: Embeddable widgets
- **SupportTicket**: Help tickets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Prisma](https://www.prisma.io/)

---

Built with ❤️ by the MyProtector Team

[Website](https://myprotector.org) | [Twitter](https://twitter.com/myprotector) | [LinkedIn](https://linkedin.com/company/myprotector)