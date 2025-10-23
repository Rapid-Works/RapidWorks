# 🔒 Security Checklist - BEFORE PRODUCTION

## ⚠️ CRITICAL: Do These BEFORE Deploying

### 1. Enable Firestore Security Rules

**Current Status:** ❌ WIDE OPEN (allow read, write: if true)

**What to do:**
```bash
cd /Users/mac/Downloads/Work/Beta/landingpage  # Go to original project
```

Edit `firestore.rules`:
- **Comment out** line 7-9 (development rules)
- **Uncomment** lines 13-71 (production rules)

Then deploy:
```bash
firebase deploy --only firestore:rules
```

**Verify:**
```bash
firebase firestore:rules:get
```

---

### 2. Rotate ALL Exposed Credentials

**Why?** Your old `.env` file was tracked in Git and API keys were exposed in the client bundle.

#### Airtable
1. Go to [https://airtable.com/account](https://airtable.com/account)
2. Create a NEW API key
3. Delete the old one
4. Update `.env.local`:
   ```bash
   AIRTABLE_API_KEY=new_key_here
   ```

#### Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Create a NEW app password
3. Delete the old one
4. Update `.env.local`:
   ```bash
   GMAIL_APP_PASSWORD=new_password_here
   ```

#### Firebase (Optional but Recommended)
If you suspect the keys were accessed:
1. Go to Firebase Console → Project Settings
2. Under "Your apps", delete the old web app
3. Create a new web app
4. Update `.env.local` with new config

---

### 3. Verify API Keys Are NOT in Client Bundle

**Test:**
```bash
npm run build
grep -r "AIRTABLE" .next/  # Should return NO results
```

**What should be exposed:**
- ✅ `NEXT_PUBLIC_FIREBASE_*` (public, safe)
- ✅ `NEXT_PUBLIC_CLOUDINARY_*` (public, safe)

**What should NOT be exposed:**
- ❌ `AIRTABLE_API_KEY` (private)
- ❌ `AIRTABLE_BASE_ID` (private)
- ❌ `GMAIL_APP_PASSWORD` (private)

---

### 4. Set Production Environment Variables

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... add all variables from .env.example

# Make sure to add WITHOUT NEXT_PUBLIC_ prefix for server-only vars
vercel env add AIRTABLE_API_KEY
vercel env add AIRTABLE_BASE_ID
vercel env add GMAIL_APP_PASSWORD
```

#### Netlify
1. Go to Site Settings → Environment Variables
2. Add all variables from `.env.example`
3. Remember: prefix with `NEXT_PUBLIC_` for client-side vars

---

### 5. Update Git Repository

**Check what's exposed:**
```bash
cd /Users/mac/Downloads/Work/Beta/landingpage  # Original project
git log --all --full-history -- .env
```

If `.env` was ever committed:

**Option A: Remove from history (if repo is private)**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
```

**Option B: Just ensure it's in .gitignore (recommended)**
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push
```

Then rotate ALL credentials (see step 2).

---

## 🔐 Security Best Practices

### Never Commit Secrets
- ✅ Use `.gitignore` for `.env` and `.env.local`
- ✅ Use `.env.example` as template (no real values)
- ❌ Never commit API keys, passwords, or tokens

### Separate Credentials by Environment
- Development: Use test/sandbox accounts
- Production: Use production accounts with restrictive permissions

### Use Environment Variables Correctly
| Type | Prefix | Exposed to Browser? | Use For |
|------|--------|---------------------|---------|
| Client | `NEXT_PUBLIC_` | ✅ Yes | Public configs (Firebase client) |
| Server | None | ❌ No | API keys, secrets |

### Regular Security Audits
- [ ] Review Firestore rules monthly
- [ ] Check Firebase Console → Usage for suspicious activity
- [ ] Monitor Airtable API usage
- [ ] Review user access logs

---

## ✅ Final Verification Checklist

Before going live:

### Firestore
- [ ] Production rules enabled
- [ ] Development rule (`allow read, write: if true`) removed
- [ ] Tested authenticated user can access their data
- [ ] Tested unauthenticated user CANNOT access protected data

### API Keys
- [ ] Airtable API key rotated
- [ ] Gmail app password rotated
- [ ] Old credentials deleted/revoked
- [ ] New credentials stored in `.env.local` (NOT committed)

### Environment Variables
- [ ] Production variables set in hosting platform
- [ ] Different credentials for dev vs production
- [ ] Verified API keys not in client bundle

### Git Repository
- [ ] `.env` and `.env.local` in `.gitignore`
- [ ] No secrets in commit history (or rotated if exposed)
- [ ] `.env.example` is up to date

### Application
- [ ] Tested authentication works
- [ ] Tested form submissions work
- [ ] Tested API routes are secure
- [ ] Tested on mobile and desktop
- [ ] Production build successful (`npm run build`)

---

## 🚨 Emergency: If Credentials Are Compromised

1. **Immediately rotate** all affected credentials
2. **Check logs** for unauthorized access
3. **Review** Firestore/Airtable for unauthorized changes
4. **Update** all environments with new credentials
5. **Monitor** for suspicious activity

---

## 📞 Security Contacts

- **Firebase Support:** [https://firebase.google.com/support](https://firebase.google.com/support)
- **Airtable Support:** [https://support.airtable.com](https://support.airtable.com)
- **Google Security:** [https://support.google.com/accounts](https://support.google.com/accounts)

---

**Last Updated:** October 2025

**Status:** ⚠️ PRODUCTION RULES NOT YET ENABLED - DO NOT DEPLOY
