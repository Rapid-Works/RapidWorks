# 🚀 How to Start Your Next.js App

## Quick Start

### 1. Stop the Current Dev Server
In your terminal where Next.js is running, press `Ctrl+C` to stop it.

### 2. Clear Cache & Restart
```bash
cd /Users/mac/Downloads/Work/Beta/landingpage/nextjs-app

# Clear Next.js cache
rm -rf .next

# Restart the dev server
npm run dev
```

### 3. Open in Browser
Navigate to: **http://localhost:3000**

---

## ✅ What Was Just Fixed

### Issue 1: React Router → Next.js Navigation
**Fixed 25 components** that were using React Router:
- `ScrollToTop.jsx` ✅
- `Navbar.jsx` ✅
- `Footer.jsx` ✅
- `Dashboard.jsx` ✅
- `LoginModal.jsx` ✅
- `SignupPage.jsx` ✅
- ...and 19 more

**Changes Made:**
```jsx
// BEFORE (React Router)
import { Link, useNavigate, useLocation } from 'react-router-dom';
const navigate = useNavigate();
navigate('/dashboard');
<Link to="/dashboard">Dashboard</Link>

// AFTER (Next.js)
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
<Link href="/dashboard">Dashboard</Link>
```

### Issue 2: Firebase Environment Variables
The `.env.local` file is correct, but needs a server restart to load.

### Issue 3: Firebase Messaging Server-Side Error
**Already fixed** in previous update:
- Added browser environment checks
- Added `'use client'` directive
- Removed favicon conflict

---

## Current Status

Your Next.js app should now:
- ✅ Load without React Router errors
- ✅ Load without Firebase environment errors (after restart)
- ✅ Have all 30+ routes working
- ✅ Have all navigation working (Next.js Links)
- ✅ Have Firebase initialized properly

---

## If You Still See Errors

### Environment Variable Error
If you still see missing Firebase environment variables:

1. **Verify `.env.local` exists:**
   ```bash
   cat .env.local
   ```
   Should show `NEXT_PUBLIC_FIREBASE_*` variables.

2. **Restart dev server completely:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

3. **Hard refresh browser:**
   - Chrome/Edge: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Safari: `Cmd+Option+R`

### Other Errors
Check the browser console for specific errors and let me know!

---

## Alternative: Use Restart Script

I've created a helper script:
```bash
cd /Users/mac/Downloads/Work/Beta/landingpage/nextjs-app
./restart-dev.sh
```

This will:
1. Stop the dev server
2. Clear the cache
3. Restart the server

---

## What to Test

Once the app loads successfully:

### Public Pages
- ✅ Home page: http://localhost:3000
- ✅ Experts: http://localhost:3000/experts
- ✅ Blueprint: http://localhost:3000/blueprint
- ✅ Coaching: http://localhost:3000/coaching
- ✅ MVP: http://localhost:3000/mvp
- ✅ Blogs: http://localhost:3000/blogs

### Authentication
- ✅ Sign up: http://localhost:3000/signup
- ✅ Login: http://localhost:3000/login
- ✅ Dashboard (after login): http://localhost:3000/dashboard

### Features to Test
- Navigation between pages
- User signup/login
- Dashboard access (protected route)
- Form submissions
- Firebase operations
- Mobile menu
- Language switcher

---

## Files Modified in This Fix

1. **Navigation Components (25 files):**
   - All React Router imports → Next.js navigation
   - `useNavigate` → `useRouter`
   - `useLocation` → `usePathname`
   - `Link to` → `Link href`

2. **Firebase Files:**
   - `src/firebase/messaging.js` - Added browser checks
   - `src/firebase/config.js` - Added 'use client'

3. **Removed:**
   - `public/favicon.ico` - Conflict resolved

---

## Need Help?

**Read the docs:**
- Main migration guide: `NEXTJS_MIGRATION_COMPLETE.md`
- Recent fixes: `FIXES_APPLIED.md`

**Check console:**
- Browser console (F12) for client errors
- Terminal for server errors

---

**Last Updated:** October 22, 2025  
**Status:** Ready to run! 🎉
