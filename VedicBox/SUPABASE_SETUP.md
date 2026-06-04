# 🕉️ VedicBox - Supabase Backend Setup Guide

## Step 1: Create Supabase Account

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with **GitHub** (easiest)
4. Click **"New Project"**
   - Organization: your default org
   - Name: `vedicbox`
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
7. ✅ All 10 tables + seed data are created!

## Step 3: Verify Tables

Go to **"Table Editor"** in sidebar. You should see:
- ✅ profiles
- ✅ products (16 items)
- ✅ orders
- ✅ reviews (8 reviews)
- ✅ coupons (5 codes)
- ✅ consultations
- ✅ subscriptions
- ✅ cart_items
- ✅ daily_tips (6 tips)
- ✅ notifications

## Step 4: Get API Keys

1. Go to **Settings** → **API** (left sidebar)
2. Copy **Project URL**: `https://xxxxx.supabase.co`
3. Copy **anon public** key: `eyJhbGci...`

## Step 5: Configure Your App

### Option A: Environment Variables (Recommended)
Create a `.env` file in project root:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
```

### Option B: Direct Edit
Edit `src/lib/supabase.ts` and replace the placeholder values.

## Step 6: Enable Auth (Optional)

### Phone OTP Login:
1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Phone** provider
3. For testing, use Supabase's built-in OTP (no Twilio needed)

### Google Login:
1. Go to **Authentication** → **Providers** → **Google**
2. Enable it
3. Add your Google OAuth credentials
4. Set redirect URL to your Vercel domain

## Step 7: Deploy to Vercel

### Add Environment Variables on Vercel:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Click **"Redeploy"**

## ✅ Done!

Your VedicBox app now has a full backend with:
- 📦 16 products in database
- 🏷️ 5 coupon codes
- ⭐ 8 seed reviews
- 📿 6 daily tips
- 🔒 Row-level security
- 🔐 Auth ready (Phone OTP + Google)
- 📊 Real-time data sync
