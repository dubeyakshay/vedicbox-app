# VedicBox Production Deployment Guide

## 📋 Quick Start (5 Steps)

### 1. Local Setup
```bash
cd VedicBox
npm install
npm run dev  # Test locally
```

### 2. Supabase Setup
- Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Get your Project URL and Anon Key
- Create `.env.local` with credentials

### 3. Build for Production
```bash
npm run type-check     # Check TypeScript
npm run build:prod     # Build for production
npm run preview        # Test build locally
```

### 4. Deploy to Vercel
- Push to GitHub main branch
- Create Vercel project (auto-deploy)
- Add environment variables to Vercel dashboard
- Verify deployment

### 5. Testing
- Test all features on production
- Monitor error logs
- Check performance metrics

---

## 📁 What's New for Production

### New Files Created:
- `.env.example` - Environment variables template
- `.env.local` - Local environment variables (add your keys here)
- `.gitignore` - Git ignore configuration
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `src/utils/errorHandler.ts` - Centralized error handling
- `src/utils/validation.ts` - Input validation utilities
- `src/components/ErrorBoundary.tsx` - React error boundary
- `src/components/LoadingSpinner.tsx` - Loading indicator
- `src/lib/cache.ts` - Data caching layer
- `PRODUCTION_GUIDE.md` - Production deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `SUPABASE_SETUP.md` (Updated) - Supabase configuration

### Updated Files:
- `src/App.tsx` - Added error handling & logging
- `src/lib/api.ts` - Added validation & error handling
- `package.json` - Added production build scripts
- `vercel.json` - Added caching & security headers

---

## 🚀 Production Features

✅ **Error Handling**
- Error boundary for React errors
- Try-catch blocks in API calls
- User-friendly error messages
- Error logging to console

✅ **Input Validation**
- Email validation
- Phone number validation
- Coupon code validation
- Amount validation
- Input sanitization

✅ **Performance**
- Data caching (5-minute TTL)
- Optimized Supabase queries
- Bundle size optimization
- Lazy loading support

✅ **Security**
- RLS policies in database
- Input sanitization
- Secure environment variables
- HTTPS enforcement
- CORS configuration

✅ **Monitoring**
- Structured error logging
- TypeScript type checking
- Production build verification
- Performance tracking

✅ **CI/CD Pipeline**
- Automated tests on push
- Automatic deployment to Vercel
- Build verification
- Type checking

---

## 🔧 Configuration Steps

### 1. Environment Variables

Create `.env.local` in VedicBox folder:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ENV=production
```

### 2. Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ENV=production
```

### 3. GitHub Secrets (for CI/CD)

Go to GitHub → Your Repo → Settings → Secrets and Variables → Actions:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

---

## 📊 Build & Deploy Commands

```bash
# Local development
npm run dev

# Type checking
npm run type-check

# Production build
npm run build:prod

# Preview production build locally
npm run preview

# Deploy (automatic via GitHub push to main)
git push origin main
```

---

## ✅ Pre-Deployment Checklist

- [ ] `.env.local` created with real Supabase keys
- [ ] `npm run type-check` passes with no errors
- [ ] `npm run build:prod` completes successfully
- [ ] `npm run preview` runs locally without errors
- [ ] Tested auth flow (signup, login, logout)
- [ ] Tested cart operations
- [ ] Tested checkout (COD)
- [ ] Tested product filtering
- [ ] Tested on mobile browser
- [ ] No console errors in browser
- [ ] Supabase tables created with RLS enabled
- [ ] Environment variables added to Vercel
- [ ] GitHub repository connected to Vercel
- [ ] CI/CD workflow file exists at `.github/workflows/deploy.yml`

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

### Environment Variables Not Loading
- Verify `.env.local` exists and is readable
- Check Vercel dashboard for env vars
- Verify variable names match (VITE_ prefix required)

### Supabase Connection Issues
- Test URL in browser (should return JSON)
- Verify anon key is from Supabase dashboard
- Check RLS policies aren't blocking requests
- Look at Supabase logs for API errors

### 500 Errors After Deploy
- Check Vercel build logs
- Verify environment variables in Vercel
- Check Supabase API status
- Monitor error logs in browser console

---

## 📞 Support

For issues:
1. Check browser console for error messages
2. Review Vercel deployment logs
3. Check Supabase dashboard logs
4. Refer to DEPLOYMENT_CHECKLIST.md
5. See PRODUCTION_GUIDE.md for detailed info

---

Last Updated: 2026-06-08
Version: 1.0.0
