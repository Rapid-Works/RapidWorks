# 🚨 CRITICAL FIX - Environment Variables Not Loading

## The Problem
Your dev server is likely running from the **wrong directory**. The environment variables are in `/nextjs-app/.env.local` but your server might be running from the parent directory.

## The Solution

### Step 1: Stop the Current Server
Press `Ctrl+C` in your terminal to stop the running server.

### Step 2: Navigate to the Correct Directory
```bash
cd /Users/mac/Downloads/Work/Beta/landingpage/nextjs-app
```

**Verify you're in the right place:**
```bash
pwd
# Should output: /Users/mac/Downloads/Work/Beta/landingpage/nextjs-app

ls .env.local
# Should show: .env.local
```

### Step 3: Clear Cache
```bash
rm -rf .next
```

### Step 4: Start the Server from the CORRECT Directory
```bash
npm run dev
```

**IMPORTANT:** Make sure you see this in the output:
```
- Environments: .env.local
```

This confirms the environment file is loaded.

### Step 5: Open Browser
Go to: http://localhost:3000

---

## Alternative: Use This One-Liner

Copy and paste this into your terminal:
```bash
rm -rf .next && npm run dev
```

---

## How to Verify It's Working

Once the server starts, check the terminal output:
- ✅ Should see: `- Environments: .env.local`
- ✅ Should NOT see Firebase environment variable errors in browser console
- ✅ App should load at http://localhost:3000

---

## If You Still See Errors

1. **Verify `.env.local` contents:**
   ```bash
   cd /Users/mac/Downloads/Work/Beta/landingpage/nextjs-app
   cat .env.local | grep NEXT_PUBLIC_FIREBASE
   ```
   
   Should show all 7 Firebase variables with values.

2. **Check you're in nextjs-app directory:**
   ```bash
   pwd
   # Must show: .../nextjs-app at the end
   ```

3. **Hard refresh browser:**
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

---

## Why This Happened

Next.js only loads `.env.local` from the directory where you run `npm run dev`. If you ran it from the parent directory (`landingpage/`), it won't find the `nextjs-app/.env.local` file.

**Always run the dev server from the `nextjs-app/` directory!**

---

**Status:** This should fix the environment variable issue permanently. ✅
