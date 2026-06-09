# VedicBox Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Set these in Vercel dashboard:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ENV=production
```

### 2. Supabase Configuration
Ensure these tables exist with RLS policies:
- `products` (public read)
- `orders` (user-specific)
- `profiles` (user-specific)
- `wishlist` (user-specific)
- `consultations` (user-specific)
- `coupons` (public read)

### 3. Build & Optimization
```bash
npm run type-check      # Verify TypeScript
npm run build:prod      # Production build
npm run preview         # Test locally
```

### 4. Security Headers (Vercel)
Already configured in vercel.json:
- Cache-Control headers for CDN
- SPA rewrite rules

### 5. Database Security
- Enable RLS (Row Level Security) on all user-facing tables
- Use Supabase policies for row-level access
- Validate all inputs server-side

### 6. Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor API performance
- Track user engagement

### 7. Testing Before Deploy
```bash
# Test payment flow locally (both COD and online)
# Test auth flow
# Test cart operations
# Test filters and search
# Test mobile responsiveness
```

### 8. Deployment Steps
1. Push to main branch
2. Vercel auto-deploys
3. Monitor build logs
4. Test in production
5. Monitor error rates

### 9. Post-Deployment
- Check Core Web Vitals
- Monitor API response times
- Check error logs
- Verify analytics tracking

## Troubleshooting

### Build fails
- Run `npm install` and retry
- Check environment variables in Vercel
- Verify tsconfig.json is correct

### 500 errors
- Check Supabase connection
- Verify API keys
- Check browser console for errors

### Slow performance
- Review Network tab in DevTools
- Check image sizes
- Verify bundle size
- Enable caching

## Rollback
If issues occur:
1. Revert commit on GitHub
2. Vercel automatically deploys previous version
3. Check logs at vercel.com/dashboard
