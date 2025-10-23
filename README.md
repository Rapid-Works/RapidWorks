# RapidWorks Landing Page - Next.js

This is the **secure, migrated version** of the RapidWorks landing page using **Next.js 15** with the App Router.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill in your actual values.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Features

### Protected API Keys
- Airtable API key is **never exposed** to the browser
- Sensitive operations use **Next.js API routes**
- Only `NEXT_PUBLIC_*` variables are accessible client-side

---

## 📚 Documentation

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for complete migration details.

---

Built with Next.js 15
