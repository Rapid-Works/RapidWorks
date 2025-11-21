# Firebase Deployment Guide for Next.js App

This guide covers deploying both the Next.js frontend and Firebase Functions from this repository.

---

## 📁 Repository Structure

```
nextjs-app/
├── functions/              ← Firebase Cloud Functions (Backend)
│   ├── index.js           ← All cloud functions
│   ├── package.json       ← Functions dependencies
│   └── .env              ← Functions environment variables
├── firebase.json          ← Firebase configuration
├── .firebaserc           ← Firebase project configuration
├── firestore.rules       ← Firestore security rules
├── firestore.indexes.json ← Firestore indexes
├── src/                  ← Next.js app source
└── package.json          ← Next.js dependencies
```

---

## 🚀 Prerequisites

1. **Node.js 20+** (required for Firebase Functions)
2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```
3. **Firebase Login**
   ```bash
   firebase login
   ```

---

## 🔧 Environment Variables

### **Next.js Environment Variables**
Create `.env.local` in the root:

```bash
# Firebase Client Configuration (already in src/firebase/config.js)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDoIexsBB5I8ylX2t2N4fxVjVcsst71c5Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=landingpage-606e9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=landingpage-606e9
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=landingpage-606e9.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=449487247565
NEXT_PUBLIC_FIREBASE_APP_ID=1:449487247565:web:7bf02a5898cb57a13cb184
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7SZ0GLF9L1

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset

# Google Places API (for address autocomplete)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### **Firebase Functions Environment Variables**

Set these using Firebase CLI:

```bash
# Set Gemini API Key (for AI-powered data extraction)
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"

# View current configuration
firebase functions:config:get
```

Alternatively, create `functions/.env` (for local development only):
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

⚠️ **Note:** The `.env` file is git-ignored. Use Firebase config for production.

---

## 📦 Installation

### **1. Install Next.js Dependencies**
```bash
npm install
```

### **2. Install Functions Dependencies**
```bash
cd functions
npm install
cd ..
```

---

## 🧪 Local Development

### **Run Next.js Locally**
```bash
npm run dev
# Opens at http://localhost:3000
```

### **Run Firebase Emulators (Optional)**
Test functions locally:
```bash
firebase emulators:start
```

This starts:
- Functions: `http://localhost:5001`
- Firestore: `http://localhost:8080`
- Hosting: `http://localhost:5000`

---

## 🚀 Deployment

### **Option 1: Deploy Everything (Recommended)**
```bash
# Build Next.js
npm run build

# Deploy all Firebase services
firebase deploy
```

This deploys:
- ✅ Firebase Functions
- ✅ Firestore Rules
- ✅ Firestore Indexes
- ✅ Firebase Hosting (if configured)

---

### **Option 2: Deploy Functions Only**
```bash
firebase deploy --only functions
```

**Specific function:**
```bash
firebase deploy --only functions:extractImpressumData
firebase deploy --only functions:validateEmailDomain
```

---

### **Option 3: Deploy Firestore Rules Only**
```bash
firebase deploy --only firestore:rules
```

---

### **Option 4: Deploy to Vercel (Next.js Only)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

⚠️ **Important:** If deploying to Vercel, you still need to deploy Firebase Functions separately:
```bash
firebase deploy --only functions
```

---

## 🔑 Firebase Functions Available

All functions from marvie-arku's work are included:

### **1. AI-Powered Data Extraction**
```javascript
// Extract company data from website
exports.extractImpressumData
```

**Features:**
- Auto-finds Impressum pages
- Multi-AI support (Gemini + keyword fallback)
- Extracts 13+ fields
- SPA support with Puppeteer
- Enhanced industry detection

### **2. Email Validation**
```javascript
// Validate email domains
exports.validateEmailDomain
```

**Features:**
- Test email blocking (29 domains)
- Disposable email detection (50+ services)
- DNS MX validation
- Domain existence check

### **3. Other Functions**
- `submitServiceRequest`
- `submitWebinarRegistration`
- `chatWithAI`
- `sendOrganizationCreatedEmail`
- `checkCoachingCallReminders`
- And 20+ more...

---

## 📋 Firebase Functions Dependencies

Key packages installed:

```json
{
  "@google/generative-ai": "^0.24.1",    // AI extraction
  "puppeteer": "^24.25.0",                // SPA rendering
  "is-disposable-email-domain": "^1.0.0", // Email validation
  "axios": "^1.6.0",                      // HTTP requests
  "cheerio": "^1.1.2",                    // HTML parsing
  "firebase-functions": "^6.4.0",         // Cloud Functions SDK
  "firebase-admin": "^12.7.0"             // Admin SDK
}
```

---

## 🔍 Verify Deployment

### **Check Functions Status**
```bash
firebase functions:log
```

### **Test a Function**
```javascript
// In your Next.js app
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase/config';

const test = async () => {
  const validateEmail = httpsCallable(functions, 'validateEmailDomain');
  const result = await validateEmail({ email: 'test@example.com' });
  console.log(result.data); // Should reject test email
};
```

---

## 🐛 Troubleshooting

### **Functions Not Deploying**
```bash
# Check Node version (must be 20+)
node --version

# Clear cache and reinstall
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..
firebase deploy --only functions
```

### **"Unmet Dependencies" Error**
```bash
cd functions
npm install is-disposable-email-domain puppeteer openai
cd ..
```

### **Environment Variables Not Working**
```bash
# Check configuration
firebase functions:config:get

# Set missing variables
firebase functions:config:set gemini.api_key="YOUR_KEY"

# Redeploy
firebase deploy --only functions
```

### **Next.js Build Failing**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📝 Important Notes

1. **Node Version:** Firebase Functions require Node 20+
2. **Separate Deployment:** Next.js (Vercel) and Functions (Firebase) deploy separately
3. **Same Firebase Project:** Both repos use `landingpage-606e9`
4. **Environment Variables:** Next.js uses `NEXT_PUBLIC_*`, Functions use Firebase config
5. **Git Ignore:** `functions/.env` is git-ignored, use Firebase config for production

---

## 🎯 Quick Commands

```bash
# Full deployment
npm run build && firebase deploy

# Functions only
firebase deploy --only functions

# Firestore rules only
firebase deploy --only firestore:rules

# View logs
firebase functions:log

# Local emulators
firebase emulators:start
```

---

## 📞 Support

For issues with:
- **Next.js App:** Check Vercel logs
- **Firebase Functions:** `firebase functions:log`
- **Firestore:** Firebase Console → Firestore

---

**Last Updated:** 2025-11-07
**Firebase Project:** `landingpage-606e9`
**Region:** `us-central1`
