# MyProtector.org - Deployment Guide

## Overview

This document provides step-by-step instructions for deploying MyProtector on cPanel hosting environment.

## Prerequisites

- cPanel access with Node.js support (or PHP hosting with Node.js adapter)
- SSH access (optional but recommended)
- Git installed locally
- Node.js 18+ on local machine for build

## Deployment Options

### Option 1: Node.js App (Recommended)

For full Next.js functionality with API routes:

1. **Create Node.js Application in cPanel**
   - Log in to cPanel
   - Navigate to Setup Node.js App
   - Create new application:
     - Node version: 18.x or higher
     - Application root: `/home/username/myprotector`
     - Application startup file: `server.js`
     - Environment variables: (see below)

2. **Upload Files**
   ```bash
   # Using Git
   git clone https://github.com/your-repo/myprotector.git
   cd myprotector
   
   # Or upload via File Manager/SFTP
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Environment Variables**
   In cPanel Node.js settings, add:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/myprotector
   NEXTAUTH_SECRET=your-secret-here-generate-with-openssl
   NEXTAUTH_URL=https://myprotector.org
   NEXT_PUBLIC_APP_URL=https://myprotector.org
   RESEND_API_KEY=your-resend-key
   STRIPE_SECRET_KEY=your-stripe-key
   STRIPE_WEBHOOK_SECRET=your-webhook-secret
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Start Application**
   The app should auto-start from `server.js`

### Option 2: PHP-compatible Static Export

For traditional PHP hosting without Node.js:

1. **Build for Export**
   ```bash
   npm run build:static
   # or
   npm run export
   ```

2. **Upload Contents**
   - Upload the `out/` folder contents to your public HTML directory
   - Note: API routes won't work in static mode

3. **Configure .htaccess** (if needed)
   ```apache
   DirectoryIndex index.html
   FallbackResource /index.html
   ```

## Database Setup

### PostgreSQL Setup

1. **Create Database in cPanel**
   - MySQL Databases
   - Create new database: `myprotector_db`
   - Create user with full permissions

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Data (Optional)**
   ```bash
   npm run db:seed
   ```

### If using external PostgreSQL

Update `DATABASE_URL` to point to your external database:
```
postgresql://user:pass@remote-host:5432/myprotector
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Random string for session encryption | Yes |
| `NEXTAUTH_URL` | Your domain URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | Yes |
| `RESEND_API_KEY` | Email sending API key | No |
| `STRIPE_SECRET_KEY` | Payment processing | No |
| `STRIPE_WEBHOOK_SECRET` | Webhook for Stripe | No |

## Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Troubleshooting

### Build Failures
- Clear `.next` cache: `rm -rf .next`
- Reinstall node_modules: `rm -rf node_modules && npm install`

### Database Connection Issues
- Verify DATABASE_URL format
- Check if PostgreSQL allows remote connections
- Verify firewall rules

### API Routes Not Working
- Ensure Node.js app is running
- Check for proper port configuration
- Review server logs

## Post-Deployment Checklist

- [ ] SSL certificate configured
- [ ] DNS pointing to server
- [ ] Database migrations complete
- [ ] Environment variables set
- [ ] Email service configured
- [ ] Admin account created
- [ ] Test login/registration
- [ ] Verify business profile creation
- [ ] Test review submission
- [ ] Check widget embed codes

## Security Notes

1. **Never commit `.env` files**
2. **Use strong NEXTAUTH_SECRET**
3. **Enable HTTPS everywhere**
4. **Regular backups of database**

## Performance Optimization

1. **Enable caching headers**
2. **Use CDN for static assets**
3. **Optimize images before upload**
4. **Enable gzip compression**

## Support

For issues, contact support@myprotector.org