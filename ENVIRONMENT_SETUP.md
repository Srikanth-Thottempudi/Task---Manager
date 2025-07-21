# 🔐 Environment Variables Setup Guide

## 📋 **Current Configuration**

Your app is configured with the following environment variables:

### Required for Production:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://aewpwexqhuenlkuldfjn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld3B3ZXhxaHVlbmxrdWxkZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzExMjcsImV4cCI6MjA2ODQwNzEyN30.Pd9wC-WaKlXmtFOwIKlucDwrco4NIWCDW_hsrAEl3Yg
```

## 🚀 **Step-by-Step Vercel Setup**

### 1. Via Vercel Dashboard (Recommended)

1. **Login to Vercel**: Go to [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Select Your Project**: After importing from GitHub, click on your project

3. **Go to Settings**: Click **Settings** tab → **Environment Variables**

4. **Add Variables**:
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://aewpwexqhuenlkuldfjn.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
   
   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld3B3ZXhxaHVlbmxrdWxkZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzExMjcsImV4cCI6MjA2ODQwNzEyN30.Pd9wC-WaKlXmtFOwIKlucDwrco4NIWCDW_hsrAEl3Yg
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

5. **Save**: Click **Save** for each variable

6. **Redeploy**: Go to **Deployments** tab → Click **⋯** → **Redeploy**

### 2. Via Vercel CLI

```bash
# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://aewpwexqhuenlkuldfjn.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFld3B3ZXhxaHVlbmxrdWxkZmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzExMjcsImV4cCI6MjA2ODQwNzEyN30.Pd9wC-WaKlXmtFOwIKlucDwrco4NIWCDW_hsrAEl3Yg

# Deploy with new environment variables
vercel --prod
```

## 🔍 **Verification Steps**

### 1. Check Build Logs
```bash
# In Vercel deployment logs, you should see:
✓ Creating an optimized production build
✓ Collecting page data  
✓ Generating static pages
```

### 2. Test Environment Variables
```javascript
// Add this temporary code to test (remove after verification)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### 3. Database Connection Test
- Visit your deployed app
- Try creating a new task
- Check Supabase dashboard for the new record

## ⚠️ **Important Security Notes**

### ✅ **Safe to Expose (NEXT_PUBLIC_)**
- `NEXT_PUBLIC_SUPABASE_URL` - Public endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous access key with RLS

### ❌ **Never Expose Publicly**
- `SUPABASE_SERVICE_ROLE_KEY` - Full database access
- API keys from other services
- Database passwords

### 🔒 **Row Level Security**
Your Supabase setup includes RLS policies that restrict access even with the anon key.

## 🐛 **Troubleshooting**

### Issue 1: "Cannot read properties of null"
**Symptoms**: App shows error, tasks don't load
**Cause**: Environment variables not set
**Solution**: 
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure both variables are added to Production environment
3. Redeploy the application

### Issue 2: "Failed to fetch"
**Symptoms**: Network errors in console  
**Cause**: Wrong Supabase URL or CORS issues
**Solution**:
1. Verify URL in Supabase dashboard → Settings → API
2. Add Vercel domain to Supabase → Settings → Authentication → Site URL

### Issue 3: "Row Level Security policy violation"
**Symptoms**: Database operations fail
**Cause**: RLS policies too restrictive
**Solution**: 
1. Run the `supabase-setup.sql` script
2. Check policies in Supabase dashboard → Authentication → Policies

### Issue 4: Environment variables not updating
**Symptoms**: Old values still being used
**Cause**: Vercel cache
**Solution**:
1. Go to Vercel → Deployments
2. Click **⋯** → **Redeploy** 
3. ✅ Check "Use existing Build Cache"

## 📊 **Environment Variable Status**

| Variable | Required | Set | Environment | Status |
|----------|----------|-----|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | All | ✅ Ready |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | All | ✅ Ready |

## 🎯 **Final Checklist**

- ✅ Variables added to Vercel dashboard
- ✅ All environments selected (Production/Preview/Development)  
- ✅ Application redeployed after adding variables
- ✅ Database connection tested
- ✅ No console errors in browser

Your environment is **production-ready**! 🚀