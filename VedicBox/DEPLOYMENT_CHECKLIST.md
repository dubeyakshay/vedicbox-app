# VedicBox Production Deployment Checklist

## Pre-Deployment (Local)
- [ ] Run `npm run type-check` - verify TypeScript compilation
- [ ] Run `npm run build:prod` - test production build
- [ ] Run `npm run preview` - test built app locally
- [ ] Test on mobile device (responsive design)
- [ ] Test all key user flows:
  - [ ] Browse products
  - [ ] Add to cart
  - [ ] Apply coupon
  - [ ] Checkout (COD flow)
  - [ ] User registration
  - [ ] Login
  - [ ] View orders
  - [ ] Book consultation
  - [ ] Add to wishlist

## Supabase Configuration
- [ ] Set up all database tables (see SUPABASE_SETUP.md)
- [ ] Enable RLS on all tables
- [ ] Create RLS policies
- [ ] Test RLS policies
- [ ] Set up authentication providers (Email, Google)
- [ ] Configure redirect URLs
- [ ] Test auth flows (signup, login, logout)
- [ ] Load initial product data
- [ ] Set up backup schedule

## Deployment Setup
- [ ] Push code to GitHub
- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Add environment variables to Vercel:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_ENV=production
- [ ] Configure custom domain (if needed)
- [ ] Set up SSL certificate
- [ ] Verify build command: `npm run build:prod`
- [ ] Verify output directory: `dist`

## CI/CD Pipeline
- [ ] GitHub Actions workflow running successfully
- [ ] Build passes on all commits
- [ ] Auto-deploy on main branch push
- [ ] Manual approval for production (optional)

## Post-Deployment Testing
- [ ] Test live site on desktop
- [ ] Test live site on mobile
- [ ] Verify API calls working
- [ ] Check error logging
- [ ] Monitor performance metrics
- [ ] Test payment flow (COD)
- [ ] Check all pages load correctly
- [ ] Verify images load
- [ ] Test filters and search
- [ ] Check console for errors
- [ ] Test auth flow
- [ ] Verify data persistence

## Security & Performance
- [ ] Enable rate limiting on API endpoints
- [ ] Set up CORS properly
- [ ] Verify no sensitive data in logs
- [ ] Check for security vulnerabilities
- [ ] Enable compression
- [ ] Optimize bundle size
- [ ] Monitor Web Vitals (Lighthouse)
- [ ] Set up error tracking (Sentry recommended)
- [ ] Implement analytics

## Monitoring & Maintenance
- [ ] Set up uptime monitoring
- [ ] Monitor error logs daily
- [ ] Check API performance regularly
- [ ] Monitor database performance
- [ ] Plan regular backups
- [ ] Document deployment procedure
- [ ] Create runbook for common issues

## Domain & DNS (if using custom domain)
- [ ] Update domain DNS records
- [ ] Verify domain ownership
- [ ] Set up SSL/TLS
- [ ] Test domain accessibility

## Communication
- [ ] Notify team of deployment
- [ ] Update documentation
- [ ] Monitor user feedback
- [ ] Track bugs and issues

---

## Deployment Command
```bash
cd VedicBox
npm install
npm run type-check
npm run build:prod
# Then push to main branch - Vercel will auto-deploy
```

## Rollback Procedure
1. Go to Vercel dashboard
2. Go to Deployments tab
3. Find previous successful deployment
4. Click "Redeploy"
5. Monitor new deployment
6. If still issues, deploy previous working commit

## Common Issues & Solutions

### Build fails
- Check TypeScript errors: `npm run type-check`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check environment variables in Vercel

### API 401/403 errors
- Verify Supabase keys are correct
- Check RLS policies are properly configured
- Ensure user is authenticated

### Slow performance
- Check bundle size: `npm run build:prod` and check dist/
- Enable caching on Vercel
- Optimize images
- Check database query performance

### Database connection errors
- Verify VITE_SUPABASE_URL is accessible
- Check firewall/network settings
- Verify RLS policies aren't blocking queries

---

Last Updated: 2026-06-08
