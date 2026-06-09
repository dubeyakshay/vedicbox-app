# 🕉️ VedicBox - Supabase Backend Setup Guide

## Step 1: Create Supabase Account

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with **GitHub** (easiest)
4. Click **"New Project"**
   - Organization: your default org
   - Name: `vedicbox-prod` (for production)
   - Database Password: (save this somewhere!)
   - Region: **South Asia (Mumbai)** or closest to you
5. Click **"Create new project"**
6. Wait 1-2 minutes for setup

## Step 2: Create Database Tables

1. In Supabase Dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this project
4. **Copy the ENTIRE content** and paste into the SQL Editor
5. Click **"Run"** (or Ctrl+Enter)
6. Wait for "Success. No rows returned" message
7. ✅ All tables are created!

## Step 3: Verify Tables

Go to **"Table Editor"** in sidebar. You should see:
- ✅ profiles
- ✅ products
- ✅ orders
- ✅ reviews
- ✅ coupons
- ✅ consultations
- ✅ subscriptions
- ✅ daily_tips
- ✅ notifications (if applicable)

## Step 4: Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy **Project URL**: `https://xxxxx.supabase.co`
3. Copy **anon public** key: `eyJhbGci...`
4. Save these securely (use password manager)

## Step 5: Configure Your App

### Environment Variables (Required)
Create a `.env.local` file in VedicBox directory:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
VITE_ENV=production
```

## Step 6: Enable Authentication

### Email/Password Auth (Recommended for Production):
1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)

### Google OAuth (Recommended):
1. Go to **Authentication** → **Providers** → **Google**
2. Enable it
3. Add your Google OAuth 2.0 credentials from Google Cloud Console
4. Set redirect URLs:
   - For local: `http://localhost:5173/auth/callback`
   - For production: `https://your-domain.com/auth/callback`

### Phone OTP (Optional - for development):
1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Phone** provider
3. For testing, use Supabase's built-in OTP (no Twilio needed for dev)

## Step 7: Enable Row Level Security (RLS)

For production, enable RLS on all tables:

1. Go to **SQL Editor**
2. Run this to enable RLS and set policies:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Products: public read
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

-- Orders: users see their own
CREATE POLICY "Users see own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Similar policies for other tables...
```

## Step 8: Configure Backups

1. Go to **Settings** → **Backups**
2. Enable automatic backups (daily recommended)
3. Test backup restore procedure

## Step 9: Monitor Performance

1. Go to **Logs** to monitor API calls
2. Check **Database** → **Query Performance**
3. Optimize slow queries

## Step 10: Deploy to Vercel

### Add Environment Variables on Vercel:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
   - `VITE_ENV` = `production`
3. Click **"Save"** then **"Redeploy"**

### Test After Deployment:
- [ ] Products load from database
- [ ] Auth works (signup/login)
- [ ] Cart persists
- [ ] Orders are saved
- [ ] Wishlist works
- [ ] Check browser console for errors

## ✅ Production Checklist

- [ ] Supabase project created and configured
- [ ] All database tables created
- [ ] RLS policies enabled
- [ ] Authentication providers configured
- [ ] Backups enabled
- [ ] Environment variables added to Vercel
- [ ] Deployment successful
- [ ] All features tested on production

## Troubleshooting

### "Supabase not configured" message
- Check if environment variables are loaded
- Verify URL and key are correct
- Ensure .env file exists

### Auth not working
- Check redirect URLs are correct in Supabase
- Verify email provider is enabled
- Check browser console for specific error

### Database queries return empty
- Check RLS policies aren't blocking reads
- Verify user is authenticated for user-specific data
- Check table name spelling

### Slow performance
- Check query logs in Supabase dashboard
- Add missing indexes
- Optimize SELECT queries (limit columns)
- Consider caching frequently accessed data

---

Last Updated: 2026-06-08
Next Steps: See DEPLOYMENT_CHECKLIST.md for production deployment

