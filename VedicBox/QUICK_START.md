# VedicBox Production Deployment - Quick Reference

## 🚀 5-Minute Quick Start

### 1. Clone & Setup
```bash
cd VedicBox
npm install
```

### 2. Create .env.local
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_ENV=production
```

### 3. Test Locally
```bash
npm run build:prod
npm run preview
```

### 4. Push to GitHub
```bash
git push origin main
```

### 5. Vercel Auto-Deploys ✓

---

## 🔑 Environment Variables Needed

### From Supabase Dashboard → Settings → API:
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[copy from "anon public" key]
```

### Add to Two Places:
1. **Local**: Create `.env.local` in VedicBox folder
2. **Production**: Add to Vercel → Settings → Environment Variables

---

## 📝 Supabase One-Liner Setup

1. Create Supabase project
2. Go to SQL Editor → New Query → Paste entire SUPABASE_SETUP.md SQL
3. Click Run
4. Done ✓

---

## ✅ Pre-Deploy Checklist

```
□ .env.local created with real Supabase keys
□ npm run build:prod works locally
□ npm run preview shows app without errors
□ Tested: signup, login, browse products, add to cart, checkout
□ Supabase project created and SQL run
□ GitHub connected to Vercel
□ Environment variables added to Vercel
□ Ready to git push!
```

---

## 🎯 Common Commands

```bash
# Development
npm run dev

# Check for errors
npm run type-check

# Build for production
npm run build:prod

# Test production build
npm run preview

# Deploy (push to main)
git push origin main
```

---

## 🔗 Important Links

- **Vercel Dashboard**: vercel.com/dashboard
- **Supabase Dashboard**: app.supabase.com
- **GitHub Repository**: github.com/your-username/vedicbox
- **Live App**: [your-vercel-url].vercel.app

---

## 📞 If Something Breaks

1. Check Vercel deployment logs
2. Check browser console errors
3. Check Supabase API logs
4. Revert to previous commit
5. Review TROUBLESHOOTING section in README_PRODUCTION.md

---

**Read Full Guides:**
- README_PRODUCTION.md - Complete guide
- DEPLOYMENT_CHECKLIST.md - Detailed checklist
- PRODUCTION_SETUP_SUMMARY.md - Everything explained
