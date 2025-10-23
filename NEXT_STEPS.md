# Next Steps After Migration

## ✅ What's Been Done

Your codebase has been successfully migrated to Next.js 15 with the App Router. Here's what's been set up:

### 1. Project Structure ✅
- Created Next.js 15 app with App Router
- Installed all necessary dependencies
- Set up Tailwind CSS v4 with custom configurations
- Copied all components, services, utils, contexts, and hooks

### 2. Security Improvements ✅
- Created secure API route for Airtable operations
- Updated environment variables to use Next.js conventions
- Set up `.env.local` with proper variable prefixes
- API keys are now protected server-side

### 3. Configuration ✅
- Firebase config updated to use `NEXT_PUBLIC_*` variables
- Tailwind CSS configured with all plugins and custom styles
- Root layout with providers (Auth, Notifications)
- Global styles migrated from CRA

### 4. Documentation ✅
- Comprehensive migration guide created
- README with quick start instructions
- This Next Steps document

---

## ⚠️ What You Need To Do

### Step 1: Review and Test Components (MANUAL WORK REQUIRED)

**The components have been copied but may need updates for Next.js:**

1. **Add 'use client' directive** to components that use:
   - React hooks (`useState`, `useEffect`, etc.)
   - Browser APIs (`window`, `document`, `localStorage`)
   - Event handlers (`onClick`, `onChange`)
   - Context consumers

   Example:
   ```tsx
   'use client'; // Add this at the top of the file

   import { useState } from 'react';

   export default function MyComponent() {
     const [state, setState] = useState(0);
     // ...
   }
   ```

2. **Update navigation** from React Router to Next.js:
   ```tsx
   // OLD (React Router)
   import { Link, useNavigate } from 'react-router-dom';
   <Link to="/dashboard">Dashboard</Link>

   // NEW (Next.js)
   import Link from 'next/link';
   <Link href="/dashboard">Dashboard</Link>
   ```

3. **Create page files** for each route:
   - Copy route components from `src/components/`
   - Create corresponding `page.tsx` files in `src/app/`
   - Example: `src/components/Dashboard.jsx` → `src/app/dashboard/page.tsx`

### Step 2: Create All Route Pages

Based on your original App.js, you need to create these pages:

```
src/app/
├── page.tsx                                    (Home - RapidWorksPage)
├── dashboard/
│   ├── page.tsx                                (Dashboard)
│   ├── [kitId]/page.tsx                        (Dashboard with kit ID)
│   └── task/[taskId]/page.tsx                  (Task view)
├── experts/page.tsx                            (TeamPage)
├── blueprint/page.tsx                          (BlueprintPage)
├── workshop/page.tsx                           (WorkshopsPage)
├── branding/page.tsx                           (VisibiltyBundle)
├── coaching/page.tsx                           (CoachingPage)
├── financing/page.tsx                          (FinancingPage)
├── mvp/page.tsx                                (MVPpage)
├── bundle/page.tsx                             (BundlePage)
├── partners/page.tsx                           (PartnersPage)
├── kits/page.tsx                               (PublicBrandingKits)
├── rapid-answers/page.tsx                      (RapidAnswersWebinarPage)
├── blogs/
│   ├── page.tsx                                (BlogListPage)
│   └── [slug]/page.tsx                         (BlogPostPage)
├── form/page.tsx                               (VisibilityFormulaFormPage)
├── agb/page.tsx                                (AGBPage)
├── datenschutz/page.tsx                        (PrivacyPage)
├── impressum/page.tsx                          (ImpressumPage)
├── forgot-password/page.tsx                    (ForgotPassword)
├── organization/invite/[token]/page.tsx        (OrganizationInvite)
└── t/[trackingCode]/page.tsx                   (TrackingRedirect)
```

**Example page.tsx structure:**
```tsx
import DashboardComponent from '@/components/Dashboard';

export default function DashboardPage() {
  return <DashboardComponent />;
}
```

### Step 3: Fix Import Paths

Update all imports to use the `@/` alias:
```tsx
// OLD
import { auth } from '../firebase/config';
import Button from '../../components/ui/button';

// NEW
import { auth } from '@/firebase/config';
import Button from '@/components/ui/button';
```

### Step 4: Test Environment Variables

1. Fill in `.env.local` with your actual credentials
2. Start the dev server: `npm run dev`
3. Check that Firebase connects properly
4. Test Airtable submissions work through API route

### Step 5: Critical Security Tasks (BEFORE PRODUCTION)

**🚨 IMPORTANT:** Do these before deploying:

1. **Enable Firestore Production Rules**
   ```bash
   cd ..  # Go to original project
   # Edit firestore.rules - uncomment production rules
   firebase deploy --only firestore:rules
   ```

2. **Rotate Exposed Credentials**
   - Generate NEW Airtable API key
   - Generate NEW Gmail app password
   - Update `.env.local` with new values

3. **Set Production Environment Variables**
   - Add all variables to your hosting platform (Vercel/Netlify)
   - Use different credentials for production vs development

### Step 6: Test the Application

```bash
# Development
npm run dev

# Test all features:
# - Authentication (sign up, login, logout)
# - Protected routes (dashboard)
# - Form submissions
# - Firebase operations
# - API routes

# Production build test
npm run build
npm start
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create file: `src/app/my-page/page.tsx`
2. Export component:
   ```tsx
   export default function MyPage() {
     return <div>My Page</div>;
   }
   ```
3. Add metadata:
   ```tsx
   export const metadata = {
     title: 'My Page',
     description: 'Description',
   };
   ```

### Adding a New API Route

1. Create file: `src/app/api/my-route/route.ts`
2. Export handler:
   ```tsx
   import { NextRequest, NextResponse } from 'next/server';

   export async function POST(request: NextRequest) {
     const data = await request.json();
     // Process data
     return NextResponse.json({ success: true });
   }
   ```

### Making a Component Client-Side

Add `'use client'` at the top:
```tsx
'use client';

import { useState } from 'react';
// ... rest of component
```

---

## 📋 Checklist

Use this checklist to track your progress:

### Configuration
- [ ] Fill in all values in `.env.local`
- [ ] Test Firebase connection
- [ ] Test Airtable API route
- [ ] Verify all environment variables work

### Pages
- [ ] Create home page (`app/page.tsx`)
- [ ] Create dashboard pages
- [ ] Create all public pages (branding, coaching, etc.)
- [ ] Create blog pages
- [ ] Create auth pages (login, forgot password)
- [ ] Create utility pages (AGB, privacy, impressum)

### Components
- [ ] Add `'use client'` to interactive components
- [ ] Update all navigation links to use Next.js `<Link>`
- [ ] Update all `useNavigate()` to use Next.js `useRouter()`
- [ ] Fix all import paths to use `@/` alias

### Testing
- [ ] Test authentication flow
- [ ] Test protected routes
- [ ] Test form submissions
- [ ] Test all API routes
- [ ] Test image loading
- [ ] Test on mobile devices

### Security
- [ ] Enable Firestore production rules
- [ ] Rotate all exposed API keys
- [ ] Verify API keys not in client bundle
- [ ] Configure production environment variables

### Deployment
- [ ] Run production build successfully
- [ ] Configure hosting platform (Vercel/Netlify)
- [ ] Set up environment variables in production
- [ ] Test production deployment
- [ ] Set up custom domain (if needed)

---

## 🆘 Getting Help

### Resources
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Detailed migration guide
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Firebase with Next.js](https://firebase.google.com/docs/web/setup)

### Common Issues
Check `MIGRATION_GUIDE.md` section "Common Issues & Solutions"

---

## 🎯 Recommended Order

1. **Set up environment** (`.env.local`)
2. **Create home page** (`app/page.tsx`)
3. **Test basic functionality**
4. **Create remaining pages** one by one
5. **Fix component issues** as you encounter them
6. **Test thoroughly**
7. **Security hardening**
8. **Deploy to production**

---

## 💡 Tips

- Start with one page at a time
- Test frequently (`npm run dev`)
- Use `console.log` to debug issues
- Check browser console for errors
- Use Next.js DevTools (available in dev mode)

---

Good luck with the migration! 🚀
