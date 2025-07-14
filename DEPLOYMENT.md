# 🚀 Production Deployment Guide

## Prerequisites

Before deploying to production, ensure you have:

- ✅ **Supabase Project** set up and configured
- ✅ **Vercel Account** for hosting
- ✅ **Node.js** (v14 or higher) installed locally
- ✅ **Git** repository connected to Vercel

## 📋 Step-by-Step Deployment

### 1. Setup Supabase Database

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down your **Project URL** and **Anon Key**

#### Run Database Migration
```sql
-- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
-- into the Supabase SQL Editor and run it
```

#### Configure Row Level Security (RLS)
The migration script automatically sets up RLS policies. Review and adjust as needed for your security requirements.

### 2. Configure Environment Variables

#### For Vercel (Production)
In your Vercel project dashboard, add these environment variables:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Shishuraksha Payroll System
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production
```

#### For Local Development
Create `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Shishuraksha Payroll System
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=development
```

### 3. Deploy to Vercel

#### Option A: Automatic Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Push your code to the main branch
3. Vercel will automatically build and deploy

#### Option B: Manual Deployment
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
npx vercel --prod
```

### 4. Post-Deployment Setup

#### Verify Database Connection
1. Open your deployed application
2. Check browser console for any connection errors
3. Test basic operations (add employee, attendance, etc.)

#### Initial Data Setup
1. Create departments in Supabase dashboard or through the app
2. Add initial employees
3. Generate sample attendance data for testing

## 🔧 Configuration Files

### Key Files for Production:

- **`vercel.json`** - Vercel deployment configuration
- **`package.json`** - Build scripts and dependencies  
- **`scripts/build-production.js`** - Production build optimization
- **`public/js/config/supabase.js`** - Database configuration
- **`supabase/migrations/001_initial_schema.sql`** - Database schema

## 🔒 Security Considerations

### Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use Vercel environment variables for production
- ✅ Rotate Supabase keys periodically

### Database Security
- ✅ RLS (Row Level Security) is enabled on all tables
- ✅ Anon key has limited permissions
- ✅ Consider implementing user authentication for production

### Content Security Policy
The `vercel.json` includes CSP headers for security:
- Blocks inline scripts except necessary ones
- Restricts external resources to trusted domains
- Prevents XSS attacks

## 📊 Monitoring and Maintenance

### Performance Monitoring
- Monitor Vercel analytics dashboard
- Check Supabase database performance metrics
- Set up error tracking (Sentry, LogRocket, etc.)

### Database Maintenance
- Regular backups via Supabase dashboard
- Monitor database size and performance
- Review and optimize queries

### Updates and Patches
```bash
# Update dependencies
npm update

# Test locally
npm run dev

# Deploy updated version
npm run deploy
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
1. Check environment variables in Vercel
2. Verify Supabase project URL and keys
3. Check Supabase project status

#### Build Errors
1. Review build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Check for syntax errors in JavaScript

#### Performance Issues
1. Enable Vercel Edge Caching
2. Optimize database queries
3. Review Supabase performance insights

### Debug Mode
Add this to your environment variables for debugging:
```bash
VITE_DEBUG=true
```

## 📞 Support

For deployment issues:
1. Check Vercel documentation
2. Review Supabase guides
3. Check browser console for errors
4. Review application logs

## 🔄 Backup and Recovery

### Database Backup
```sql
-- Regular backup via Supabase dashboard
-- Export data as needed
-- Set up automated backups
```

### Application Backup
- Code is backed up in Git repository
- Static assets in Vercel deployment
- Environment variables documented

## 🎯 Production Checklist

Before going live:

- [ ] Database schema deployed
- [ ] Environment variables configured
- [ ] Security policies reviewed
- [ ] Performance tested
- [ ] Error handling verified
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] User documentation prepared

## 🚦 Deployment Status

Current deployment configuration:
- **Frontend**: Vercel (Static Site)
- **Backend**: Supabase (PostgreSQL + APIs)
- **CDN**: Vercel Edge Network
- **Security**: RLS + CSP Headers
- **Monitoring**: Vercel Analytics + Supabase Metrics