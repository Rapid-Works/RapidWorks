# Migration Guide: Create React App → Next.js 15

This guide explains the migration from Create React App to Next.js 15 with the App Router, focusing on **improved security** for API keys and sensitive credentials.

## 🔒 Security Improvements

### Before (CRA):
- ❌ All `REACT_APP_*` environment variables were **bundled into client JavaScript**
- ❌ Airtable API key was **exposed in the browser**
- ❌ Anyone could inspect DevTools and see all credentials
- ❌ Firestore rules were wide open (`allow read, write: if true`)

### After (Next.js):
- ✅ Server-only variables (without `NEXT_PUBLIC_`) are **never exposed to the client**
- ✅ Airtable API calls go through **secure API routes**
- ✅ Sensitive operations happen server-side only
- ✅ Firebase client SDK still uses public keys (secure with proper Firestore rules)

---

## 📁 Project Structure

```
nextjs-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── providers.tsx       # Client-side providers (Auth, Notifications)
│   │   ├── globals.css         # Global styles + Tailwind
│   │   │
│   │   ├── api/                # Server-side API routes (SECURE)
│   │   │   └── airtable/
│   │   │       └── route.ts    # Airtable submissions API
│   │   │
│   │   ├── dashboard/          # Protected route example
│   │   │   └── page.tsx
│   │   ├── blogs/
│   │   │   ├── page.tsx        # Blog list
│   │   │   └── [slug]/         # Dynamic blog post
│   │   │       └── page.tsx
│   │   └── ...                 # Other routes
│   │
│   ├── components/             # React components (copied from CRA)
│   ├── contexts/               # Context providers
│   ├── firebase/               # Firebase configuration
│   ├── hooks/                  # Custom hooks
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── images/                 # Static images
│   └── translations/           # i18n files
│
├── public/                     # Static assets (favicon, manifest, etc.)
├── .env.local                  # Environment variables (Git ignored)
├── .env.example                # Template for environment variables
└── package.json
```

---

## 🔑 Environment Variables

### Configuration Files

**`.env.local`** (NOT committed to Git):
```bash
# Client-side (exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
# ... other NEXT_PUBLIC_ vars

# Server-side ONLY (never exposed to browser)
AIRTABLE_API_KEY=your_secret_key_here
AIRTABLE_BASE_ID=your_base_id_here
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
```

**`.env.example`** (committed to Git as template):
- Copy this to `.env.local` and fill in your actual values

### Variable Naming Convention

| Prefix | Exposed to Browser? | Use For |
|--------|---------------------|---------|
| `NEXT_PUBLIC_` | ✅ YES | Firebase client config, Cloudinary public settings |
| No prefix | ❌ NO | API keys, secrets, database credentials |

---

## 🚀 Routing Migration

### CRA (React Router) → Next.js (File-based Routing)

| CRA Route | Next.js File | Type |
|-----------|--------------|------|
| `/` | `app/page.tsx` | Page |
| `/dashboard` | `app/dashboard/page.tsx` | Page |
| `/dashboard/:kitId` | `app/dashboard/[kitId]/page.tsx` | Dynamic |
| `/blogs` | `app/blogs/page.tsx` | Page |
| `/blogs/:slug` | `app/blogs/[slug]/page.tsx` | Dynamic |
| `/api/*` | `app/api/*/route.ts` | API Route |

### Navigation Changes

**Before (CRA):**
```jsx
import { Link, useNavigate } from 'react-router-dom';

<Link to="/dashboard">Dashboard</Link>

const navigate = useNavigate();
navigate('/dashboard');
```

**After (Next.js):**
```jsx
import Link from 'next/link';
import { useRouter } from 'next/navigation';

<Link href="/dashboard">Dashboard</Link>

const router = useRouter();
router.push('/dashboard');
```

---

## 🔐 Secure API Routes (NEW!)

### Airtable Example

**Before (CRA):** API key exposed in client
```javascript
// src/services/airtableService.js
const apiKey = process.env.REACT_APP_AIRTABLE_API_KEY; // ❌ Exposed!
fetch(`https://api.airtable.com/v0/${baseId}/${table}`, {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

**After (Next.js):** Server-side API route
```typescript
// src/app/api/airtable/route.ts
const apiKey = process.env.AIRTABLE_API_KEY; // ✅ Server-only!
export async function POST(request: NextRequest) {
  const data = await request.json();
  return NextResponse.json(await submitToAirtable(data));
}
```

```javascript
// src/services/airtableService.js (client)
export const submitToAirtable = async (formData) => {
  const response = await fetch('/api/airtable', { // ✅ Calls our API route
    method: 'POST',
    body: JSON.stringify(formData)
  });
  return response.json();
};
```

---

## 🎨 Component Migration

### Client Components (use 'use client')

Components that use hooks, state, or browser APIs must be client components:

```tsx
'use client'; // Add this directive at the top

import { useState } from 'react';

export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Server Components (default)

Components without state, hooks, or browser APIs can be server components (faster, smaller bundle):

```tsx
// No 'use client' directive needed
export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug); // Can async fetch on server!
  return <article>{post.content}</article>;
}
```

---

## 🔥 Firebase Configuration

No changes needed for client-side Firebase! Just update environment variable names:

**`src/firebase/config.js`:**
```javascript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Changed from REACT_APP_
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... other configs
};
```

---

## 📦 Context Providers

Contexts must be client-side. Create a providers wrapper:

**`src/app/providers.tsx`:**
```tsx
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </AuthProvider>
  );
}
```

**`src/app/layout.tsx`:**
```tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## ⚡ Running the App

### Development
```bash
npm run dev
# or
npm run dev -- --turbopack  # Faster with Turbopack
```

### Production Build
```bash
npm run build
npm start
```

### Testing
```bash
npm run lint
```

---

## 🚨 Critical Security Steps BEFORE Going Live

1. **Enable Firestore Security Rules**
   - Open `firestore.rules` in the original project
   - Uncomment the production rules (lines 13-71)
   - Comment out the development rule (line 8)
   - Deploy: `firebase deploy --only firestore:rules`

2. **Rotate All Exposed Credentials**
   - Generate new Airtable API key
   - Generate new Gmail app password
   - Update `.env.local` with new values
   - Update Firebase Functions environment variables

3. **Update `.gitignore`**
   - Ensure `.env.local` is in `.gitignore` (already done)
   - Never commit `.env.local` to Git

4. **Environment Variables in Production** (Vercel/Netlify)
   - Add all `NEXT_PUBLIC_*` variables
   - Add all server-only variables (without prefix)
   - Do NOT use the same API keys as development

---

## 📝 Additional Notes

### Image Optimization
Next.js provides built-in image optimization:
```tsx
import Image from 'next/image';

<Image src="/logo.png" alt="Logo" width={200} height={100} />
```

### Metadata (SEO)
Each page can export metadata:
```tsx
export const metadata = {
  title: 'My Page',
  description: 'Page description',
};
```

### Loading States
Use `loading.tsx` for automatic loading UI:
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

---

## 🆘 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Check import paths use `@/` alias (configured in `tsconfig.json`)

### Issue: "Hydration error"
**Solution:** Ensure client/server rendering matches. Add `'use client'` if using hooks/state.

### Issue: Environment variables not working
**Solution:**
- Restart dev server after changing `.env.local`
- Check variable name has `NEXT_PUBLIC_` prefix if used in client code

### Issue: Firebase messaging not working
**Solution:** Copy `public/firebase-messaging-sw.js` from old project

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Firebase with Next.js](https://firebase.google.com/docs/web/setup)

---

## ✅ Migration Checklist

- [ ] Copy all environment variables to `.env.local`
- [ ] Update all component imports to use Next.js patterns
- [ ] Add `'use client'` to components using hooks/state
- [ ] Convert React Router links to Next.js `<Link>`
- [ ] Move sensitive API calls to API routes
- [ ] Test all routes and functionality
- [ ] Enable Firestore production rules
- [ ] Rotate all exposed credentials
- [ ] Configure production environment variables
- [ ] Test production build
- [ ] Deploy to production

---

## 🎉 Benefits of This Migration

1. **Better Security**: API keys protected server-side
2. **Improved Performance**: Server components, automatic code splitting
3. **Better SEO**: Server-side rendering, metadata API
4. **Modern Tooling**: Turbopack, built-in optimizations
5. **Simpler Routing**: File-based routing vs React Router config
6. **Image Optimization**: Automatic image optimization
7. **API Routes**: Built-in backend capabilities

---

**Need help?** Check the Next.js docs or create an issue in the repository.
