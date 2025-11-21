# Tolgee Implementation Guide: From Zero to Production

This guide covers everything you need to know to implement Tolgee i18n (internationalization) in a Next.js project, from initial setup to production deployment.

---

## Table of Contents

1. [Understanding Tolgee](#1-understanding-tolgee)
2. [Project Setup](#2-project-setup)
3. [Translation Structure](#3-translation-structure)
4. [Creating Translation Hooks](#4-creating-translation-hooks)
5. [Using Translations in Components](#5-using-translations-in-components)
6. [Adding New Pages with Translations](#6-adding-new-pages-with-translations)
7. [Self-Hosting Tolgee on Google Cloud Run](#7-self-hosting-tolgee-on-google-cloud-run)
8. [Importing Translations to Tolgee Platform](#8-importing-translations-to-tolgee-platform)
9. [Production Deployment](#9-production-deployment)
10. [Best Practices](#10-best-practices)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Understanding Tolgee

### What is Tolgee?
Tolgee is an open-source localization platform that provides:
- **Translation Management**: Web UI to manage all your translations
- **In-Context Editing**: Edit translations directly on your website (dev mode)
- **ICU Message Format**: Support for variables, plurals, and complex formatting
- **Multiple Language Support**: Easily add new languages

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Key** | A unique identifier for a translation (e.g., `home.hero.title`) |
| **Translation** | The actual text in a specific language |
| **Namespace** | A way to organize keys (we use flat structure with prefixes) |
| **ICU Format** | Standard format for dynamic content like `Hello, {name}!` |

---

## 2. Project Setup

### Step 1: Install Dependencies

```bash
npm install @tolgee/react @tolgee/format-icu
```

### Step 2: Create Tolgee Configuration

Create `src/tolgee/tolgee-config.ts`:

```typescript
import { Tolgee, DevTools } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';

export const tolgee = Tolgee()
  .use(DevTools())      // Enables in-context editing in development
  .use(FormatIcu())     // Enables ICU message format for variables/plurals
  .init({
    language: 'de',     // Default language

    // Tolgee platform connection (from environment variables)
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    projectId: Number(process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID),

    // Available languages
    availableLanguages: ['de', 'en'],

    // Fallback when translation is missing
    fallbackLanguage: 'de',

    // Static data fallback (used when API is unavailable)
    staticData: {
      de: () => import('./translations/de.json'),
      en: () => import('./translations/en.json'),
    },
  });
```

### Step 3: Create Tolgee Provider

Create `src/tolgee/TolgeeProvider.tsx`:

```tsx
'use client';

import { TolgeeProvider as TolgeeProviderBase } from '@tolgee/react';
import { tolgee } from './tolgee-config';
import { useEffect, useState } from 'react';

interface TolgeeProviderProps {
  children: React.ReactNode;
  language?: string;
}

export function TolgeeProvider({ children, language }: TolgeeProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await tolgee.run();
      if (language) {
        await tolgee.changeLanguage(language);
      }
      setIsReady(true);
    };
    init();
  }, [language]);

  if (!isReady) {
    return null; // Or a loading spinner
  }

  return (
    <TolgeeProviderBase tolgee={tolgee}>
      {children}
    </TolgeeProviderBase>
  );
}
```

### Step 4: Wrap Your App

In `src/app/providers.tsx` or `src/app/layout.tsx`:

```tsx
import { TolgeeProvider } from '@/tolgee/TolgeeProvider';

export function Providers({ children }) {
  return (
    <TolgeeProvider>
      {children}
    </TolgeeProvider>
  );
}
```

### Step 5: Environment Variables

Create `.env.local`:

```env
# Tolgee Configuration
NEXT_PUBLIC_TOLGEE_API_URL=https://your-tolgee-instance.run.app
NEXT_PUBLIC_TOLGEE_API_KEY=your-api-key
NEXT_PUBLIC_TOLGEE_PROJECT_ID=2
```

---

## 3. Translation Structure

### File Organization

```
src/tolgee/
├── tolgee-config.ts          # Main Tolgee configuration
├── TolgeeProvider.tsx        # React provider component
├── translations/
│   ├── en.json               # English translations
│   └── de.json               # German translations
└── hooks/
    ├── useHomePageTranslation.ts
    ├── useDashboardTranslation.ts
    ├── useAuthTranslation.ts
    └── ... (one hook per page/feature)
```

### Translation File Format (Flat JSON with Prefixes)

We use a **flat JSON structure** with dot-notation prefixes. This is easier to manage than nested objects.

`translations/en.json`:
```json
{
  "home.hero.title": "Welcome to RapidWorks",
  "home.hero.subtitle": "Build your startup faster",
  "home.hero.cta": "Get Started",
  "home.features.title": "Our Features",
  "home.features.item.0": "Fast Development",
  "home.features.item.1": "Expert Support",
  "home.features.item.2": "Affordable Pricing",

  "auth.login.title": "Sign In",
  "auth.login.email": "Email Address",
  "auth.login.password": "Password",
  "auth.login.submit": "Sign In",

  "dashboard.welcome": "Welcome back, {name}!",
  "dashboard.tasks.count": "{count, plural, =0 {No tasks} one {# task} other {# tasks}}"
}
```

### Key Naming Convention

```
[page/feature].[section].[element]

Examples:
- home.hero.title         → Home page, hero section, title element
- auth.login.submit       → Auth feature, login section, submit button
- dashboard.tasks.count   → Dashboard, tasks section, count display
- common.buttons.save     → Common/shared, buttons, save button
```

---

## 4. Creating Translation Hooks

Hooks encapsulate all translations for a specific page or feature, making components cleaner.

### Basic Hook Structure

Create `src/tolgee/hooks/useHomePageTranslation.ts`:

```typescript
import { useTranslate } from '@tolgee/react';

export const useHomePageTranslation = () => {
  const { t } = useTranslate();

  return {
    hero: {
      title: t('home.hero.title'),
      subtitle: t('home.hero.subtitle'),
      cta: t('home.hero.cta'),
    },
    features: {
      title: t('home.features.title'),
      items: [
        t('home.features.item.0'),
        t('home.features.item.1'),
        t('home.features.item.2'),
      ],
    },
  };
};
```

### Hook with Dynamic Content (ICU Format)

```typescript
import { useTranslate } from '@tolgee/react';

export const useDashboardTranslation = () => {
  const { t } = useTranslate();

  return {
    // Function for dynamic content
    getWelcome: (name: string) => t('dashboard.welcome', { name }),

    // Function for pluralization
    getTaskCount: (count: number) => t('dashboard.tasks.count', { count }),

    // Static content
    sidebar: {
      home: t('dashboard.sidebar.home'),
      settings: t('dashboard.sidebar.settings'),
    },
  };
};
```

### Hook with Arrays (for lists, testimonials, etc.)

```typescript
import { useTranslate } from '@tolgee/react';

export const useTestimonialsTranslation = () => {
  const { t } = useTranslate();

  // Generate array of testimonials from numbered keys
  const testimonials = Array.from({ length: 6 }, (_, i) => ({
    quote: t(`testimonials.items.${i}.quote`),
    author: t(`testimonials.items.${i}.author`),
    role: t(`testimonials.items.${i}.role`),
    company: t(`testimonials.items.${i}.company`),
  }));

  return {
    title: t('testimonials.title'),
    subtitle: t('testimonials.subtitle'),
    testimonials,
  };
};
```

---

## 5. Using Translations in Components

### Basic Usage

```tsx
'use client';

import { useHomePageTranslation } from '@/tolgee/hooks/useHomePageTranslation';

export function HeroSection() {
  const { hero } = useHomePageTranslation();

  return (
    <section>
      <h1>{hero.title}</h1>
      <p>{hero.subtitle}</p>
      <button>{hero.cta}</button>
    </section>
  );
}
```

### With Dynamic Content

```tsx
'use client';

import { useDashboardTranslation } from '@/tolgee/hooks/useDashboardTranslation';

export function DashboardHeader({ user, taskCount }) {
  const { getWelcome, getTaskCount } = useDashboardTranslation();

  return (
    <header>
      <h1>{getWelcome(user.name)}</h1>
      <p>{getTaskCount(taskCount)}</p>
    </header>
  );
}
```

### Direct Usage with useTranslate (for simple cases)

```tsx
'use client';

import { useTranslate } from '@tolgee/react';

export function SimpleButton() {
  const { t } = useTranslate();

  return (
    <button>{t('common.buttons.save')}</button>
  );
}
```

### Using T Component (Alternative)

```tsx
'use client';

import { T } from '@tolgee/react';

export function SimpleComponent() {
  return (
    <div>
      <T keyName="home.hero.title" />
      <T keyName="dashboard.welcome" params={{ name: 'John' }} />
    </div>
  );
}
```

---

## 6. Adding New Pages with Translations

### Step-by-Step Process

#### Step 1: Plan Your Translation Keys

Before coding, plan your keys:

```
newpage.hero.title
newpage.hero.subtitle
newpage.hero.cta
newpage.features.title
newpage.features.item.0
newpage.features.item.1
newpage.features.item.2
newpage.cta.title
newpage.cta.button
```

#### Step 2: Add Keys to Translation Files

Add to `translations/en.json`:
```json
{
  "newpage.hero.title": "Amazing New Feature",
  "newpage.hero.subtitle": "Discover what's possible",
  "newpage.hero.cta": "Learn More",
  "newpage.features.title": "Key Benefits",
  "newpage.features.item.0": "Benefit One",
  "newpage.features.item.1": "Benefit Two",
  "newpage.features.item.2": "Benefit Three",
  "newpage.cta.title": "Ready to Start?",
  "newpage.cta.button": "Get Started Now"
}
```

Add to `translations/de.json`:
```json
{
  "newpage.hero.title": "Erstaunliche neue Funktion",
  "newpage.hero.subtitle": "Entdecken Sie, was möglich ist",
  "newpage.hero.cta": "Mehr erfahren",
  "newpage.features.title": "Hauptvorteile",
  "newpage.features.item.0": "Vorteil Eins",
  "newpage.features.item.1": "Vorteil Zwei",
  "newpage.features.item.2": "Vorteil Drei",
  "newpage.cta.title": "Bereit zu starten?",
  "newpage.cta.button": "Jetzt loslegen"
}
```

#### Step 3: Create the Translation Hook

Create `src/tolgee/hooks/useNewPageTranslation.ts`:

```typescript
import { useTranslate } from '@tolgee/react';

export const useNewPageTranslation = () => {
  const { t } = useTranslate();

  return {
    hero: {
      title: t('newpage.hero.title'),
      subtitle: t('newpage.hero.subtitle'),
      cta: t('newpage.hero.cta'),
    },
    features: {
      title: t('newpage.features.title'),
      items: Array.from({ length: 3 }, (_, i) =>
        t(`newpage.features.item.${i}`)
      ),
    },
    cta: {
      title: t('newpage.cta.title'),
      button: t('newpage.cta.button'),
    },
  };
};
```

#### Step 4: Create the Page Component

Create `src/app/newpage/page.tsx`:

```tsx
'use client';

import { useNewPageTranslation } from '@/tolgee/hooks/useNewPageTranslation';

export default function NewPage() {
  const content = useNewPageTranslation();

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <h1>{content.hero.title}</h1>
        <p>{content.hero.subtitle}</p>
        <button>{content.hero.cta}</button>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>{content.features.title}</h2>
        <ul>
          {content.features.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>{content.cta.title}</h2>
        <button>{content.cta.button}</button>
      </section>
    </main>
  );
}
```

#### Step 5: Import to Tolgee Platform

After testing locally, import the updated JSON files to Tolgee:
1. Go to your Tolgee project
2. Click **Import**
3. Upload both `en.json` and `de.json`
4. Map to correct languages
5. Choose "Create and update" to merge with existing keys

---

## 7. Self-Hosting Tolgee on Google Cloud Run

### Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and authenticated
- A GCP project

### Step 1: Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable compute.googleapis.com
```

### Step 2: Create Cloud SQL PostgreSQL Instance

```bash
# Create the instance (this takes 5-10 minutes)
gcloud sql instances create tolgee-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --project=YOUR_PROJECT_ID

# Set the postgres password
gcloud sql users set-password postgres \
  --instance=tolgee-db \
  --password="YOUR_SECURE_PASSWORD" \
  --project=YOUR_PROJECT_ID

# Create the database
gcloud sql databases create tolgee \
  --instance=tolgee-db \
  --project=YOUR_PROJECT_ID
```

### Step 3: Create Cloud Run Service Configuration

Create `tolgee-service.yaml`:

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: tolgee-platform
spec:
  template:
    metadata:
      annotations:
        # Connect to Cloud SQL
        run.googleapis.com/cloudsql-instances: YOUR_PROJECT_ID:us-central1:tolgee-db
        # Faster startup
        run.googleapis.com/startup-cpu-boost: 'true'
    spec:
      containerConcurrency: 80
      timeoutSeconds: 900
      containers:
      - image: tolgee/tolgee:latest
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: '4'
            memory: 4Gi
        # Startup probe - Tolgee needs ~7-10 minutes on first start
        startupProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 90
        env:
        # Database connection via Unix socket
        - name: SPRING_DATASOURCE_URL
          value: jdbc:postgresql://localhost/tolgee?host=/cloudsql/YOUR_PROJECT_ID:us-central1:tolgee-db
        - name: SPRING_DATASOURCE_USERNAME
          value: postgres
        - name: SPRING_DATASOURCE_PASSWORD
          value: YOUR_SECURE_PASSWORD
        # Authentication
        - name: TOLGEE_AUTHENTICATION_ENABLED
          value: 'true'
        - name: TOLGEE_AUTHENTICATION_CREATE_INITIAL_USER
          value: 'true'
        - name: TOLGEE_AUTHENTICATION_INITIAL_USERNAME
          value: admin
        - name: TOLGEE_AUTHENTICATION_INITIAL_PASSWORD
          value: YourAdminPassword123!
        - name: TOLGEE_AUTHENTICATION_NEEDS_EMAIL_VERIFICATION
          value: 'false'
        # JWT Secret (generate a random string)
        - name: TOLGEE_AUTHENTICATION_JWT_SECRET
          value: your-random-jwt-secret-at-least-32-characters
        # Frontend URL (update after first deployment)
        - name: TOLGEE_FRONT_END_URL
          value: https://tolgee-platform-XXXXXX.us-central1.run.app
```

### Step 4: Deploy to Cloud Run

```bash
# Deploy the service
gcloud run services replace tolgee-service.yaml \
  --region=us-central1 \
  --project=YOUR_PROJECT_ID

# Allow unauthenticated access (for web UI)
gcloud run services add-iam-policy-binding tolgee-platform \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --project=YOUR_PROJECT_ID
```

### Step 5: Get Your Service URL

```bash
gcloud run services describe tolgee-platform \
  --region=us-central1 \
  --format="value(status.url)" \
  --project=YOUR_PROJECT_ID
```

### Step 6: Update Frontend URL

Update the `TOLGEE_FRONT_END_URL` in your YAML with the actual URL and redeploy:

```bash
gcloud run services replace tolgee-service.yaml \
  --region=us-central1 \
  --project=YOUR_PROJECT_ID
```

### Important Notes

- **First startup takes 7-10 minutes** - Tolgee initializes the database on first run
- **Use startup probe** - Without it, Cloud Run will kill the container before it's ready
- **4GB RAM recommended** - Tolgee is a Spring Boot app that needs memory for startup
- **Startup CPU boost** - Helps reduce startup time

---

## 8. Importing Translations to Tolgee Platform

### Initial Import

1. **Login** to your Tolgee instance
2. **Create a project** (e.g., `rapidworks-website`)
3. **Add languages**:
   - English (en) - set as base language
   - German (de-DE)
4. **Go to Import** section
5. **Upload files**:
   - Select `en.json` → map to English
   - Select `de.json` → map to German
6. **Choose format**: JSON
7. **Import settings**:
   - Select "Create and update existing"
   - This will add new keys and update existing ones

### Exporting Translations

When you've made changes in Tolgee and need to update your local files:

1. Go to **Export** section
2. Select languages to export
3. Choose **JSON** format
4. Download and replace your local translation files

### Creating an API Key

1. Go to **Project Settings** → **API Keys**
2. Click **Add API Key**
3. Set permissions:
   - For development: All permissions
   - For production: Read-only (translations.view)
4. Copy the key and add to your environment variables

---

## 9. Production Deployment

### Environment Variables for Vercel/Production

Add these to your hosting platform:

```env
NEXT_PUBLIC_TOLGEE_API_URL=https://your-tolgee-instance.run.app
NEXT_PUBLIC_TOLGEE_API_KEY=tgpak_your_api_key
NEXT_PUBLIC_TOLGEE_PROJECT_ID=2
```

### Production Considerations

1. **API Key Permissions**: Use read-only key in production
2. **Static Fallback**: Keep local JSON files as fallback
3. **Caching**: Tolgee caches translations, but consider CDN caching
4. **Rate Limits**: Self-hosted has no limits; Tolgee Cloud has tier limits

### Recommended Production Config

```typescript
export const tolgee = Tolgee()
  .use(FormatIcu())
  // Only use DevTools in development
  .use(process.env.NODE_ENV === 'development' ? DevTools() : undefined)
  .init({
    language: 'de',
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    projectId: Number(process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID),
    availableLanguages: ['de', 'en'],
    fallbackLanguage: 'de',
    // Always have static fallback for reliability
    staticData: {
      de: () => import('./translations/de.json'),
      en: () => import('./translations/en.json'),
    },
  });
```

---

## 10. Best Practices

### Key Naming

```
DO:
✓ home.hero.title
✓ auth.login.submitButton
✓ dashboard.tasks.emptyState

DON'T:
✗ title (too generic)
✗ homePageHeroSectionTitle (too long)
✗ btn1 (not descriptive)
```

### Organizing Translations

```
By Page/Feature:
├── home.* (homepage)
├── auth.* (login, signup, etc.)
├── dashboard.* (dashboard pages)
├── common.* (shared elements)
└── errors.* (error messages)
```

### ICU Format Examples

```json
{
  // Simple variable
  "greeting": "Hello, {name}!",

  // Pluralization
  "items": "{count, plural, =0 {No items} one {# item} other {# items}}",

  // Select (gender, etc.)
  "pronoun": "{gender, select, male {He} female {She} other {They}}",

  // Number formatting
  "price": "Price: {amount, number, ::currency/EUR}",

  // Date formatting
  "date": "Created on {date, date, medium}"
}
```

### Hook Organization

- **One hook per page** for page-specific content
- **Shared hooks** for common elements (footer, navbar, buttons)
- **Keep hooks focused** - don't mix unrelated content

### Version Control

- Commit translation files to git
- Use Tolgee as source of truth for translations
- Export and commit after major translation updates

---

## 11. Troubleshooting

### Common Issues

#### "Translation key not found"

```
Cause: Key exists in one language but not the other
Fix: Ensure key exists in ALL language files
```

#### "ICU format error"

```
Cause: Missing variable in translation call
Fix: Provide all required variables

// Wrong
t('greeting') // expects {name}

// Correct
t('greeting', { name: 'John' })
```

#### "Tolgee not loading translations"

```
Cause: API connection issues
Fix:
1. Check NEXT_PUBLIC_TOLGEE_API_URL is correct
2. Check API key has correct permissions
3. Check project ID matches
4. Verify staticData fallback is configured
```

#### "Cloud Run 503 error"

```
Cause: Container starting up (Tolgee takes 7-10 min on first start)
Fix:
1. Wait for startup to complete
2. Add startup probe with high failureThreshold
3. Increase CPU/memory resources
```

#### "Cloud SQL connection refused"

```
Cause: JDBC URL format incorrect
Fix: Use Unix socket format for Cloud Run:
jdbc:postgresql://localhost/tolgee?host=/cloudsql/PROJECT:REGION:INSTANCE
```

### Debug Tips

1. **Check browser console** for Tolgee errors
2. **Check Network tab** for API calls to Tolgee
3. **Use Tolgee DevTools** (Alt+Click on text in dev mode)
4. **Check Cloud Run logs**: `gcloud run services logs read SERVICE_NAME`

---

## Quick Reference

### File Locations

| File | Purpose |
|------|---------|
| `src/tolgee/tolgee-config.ts` | Main configuration |
| `src/tolgee/TolgeeProvider.tsx` | React provider |
| `src/tolgee/translations/*.json` | Translation files |
| `src/tolgee/hooks/*.ts` | Translation hooks |
| `.env.local` | Environment variables |

### Commands

```bash
# Start development
npm run dev

# Deploy Tolgee to Cloud Run
gcloud run services replace tolgee-service.yaml --region=us-central1

# Check Cloud Run logs
gcloud run services logs read tolgee-platform --region=us-central1

# Get Cloud Run URL
gcloud run services describe tolgee-platform --region=us-central1 --format="value(status.url)"
```

### Your Current Setup

| Item | Value |
|------|-------|
| Tolgee URL | `https://tolgee-platform-449487247565.us-central1.run.app` |
| Project | `rapidworks-website` (ID: 2) |
| Admin | `admin` / `RapidWorks2024!` |
| Languages | English (base), German |
| Keys | 1,105 |

---

## Next Steps

1. **Explore Tolgee UI** - Browse translations, use filters
2. **Try in-context editing** - In dev mode, Alt+Click on any text
3. **Add a new page** - Follow Section 6 step-by-step
4. **Invite team members** - Add translators to your Tolgee project
5. **Set up CI/CD** - Auto-export translations on deploy

---

*Guide created for RapidWorks - November 2025*
