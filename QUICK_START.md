# Tolgee Quick Start Guide

## ✅ Configuration Complete!

Your Tolgee is configured with:
- **Project ID**: 24641
- **Project Name**: RapidWorks Landing Page
- **API Key**: ✅ Configured
- **Languages**: German (de) + English (en)

---

## 🚀 Next Steps

### Step 1: Import Translations to Tolgee (If Not Done Already)

1. Go to your Tolgee project: https://app.tolgee.io
2. Navigate to **Import** in the left sidebar
3. Click **Upload files**
4. Upload both translation files:
   - **File 1**: `nextjs-app/src/tolgee/translations/de.json`
   - **File 2**: `nextjs-app/src/tolgee/translations/en.json`
5. Map the files:
   - `de.json` → German (de)
   - `en.json` → English (en)
6. Click **Import**
7. You should see 163 translation keys imported!

---

### Step 2: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd nextjs-app
npm run dev
```

**Important**: The dev server must be restarted for the new Project ID to take effect!

---

### Step 3: Test In-Context Editing

1. **Open your app** in browser: http://localhost:3000
2. **Navigate to the MID Form**:
   - Log in if needed
   - Go to the organization creation form
3. **Enable Translation Mode**:
   - Hold **Alt** key (or **Option** on Mac)
   - Move your mouse over the form
   - You should see text highlighted with blue borders
4. **Edit a Translation**:
   - While holding Alt, **click on any text** (e.g., "Vorname")
   - A dialog will appear
   - Edit the German or English translation
   - Click **Save**
5. **See the Change**:
   - The text updates immediately!
   - No page refresh needed!

---

## 🎯 Quick Test Checklist

- [ ] Project ID added to `.env.local` ✅ (Done - 24641)
- [ ] Translations imported to Tolgee platform
- [ ] Dev server restarted
- [ ] Can see highlighted text when holding Alt
- [ ] Can click and edit translations
- [ ] Changes appear immediately

---

## 🔍 Troubleshooting

### "I don't see highlighted text when holding Alt"

**Solution 1**: Check Project ID
```bash
# Verify the Project ID is correct
cat .env.local | grep TOLGEE_PROJECT_ID
# Should show: NEXT_PUBLIC_TOLGEE_PROJECT_ID=24641
```

**Solution 2**: Restart dev server
```bash
# Kill the server and restart
npm run dev
```

**Solution 3**: Check browser console
- Open Developer Tools (F12)
- Check Console for errors
- Look for Tolgee-related messages

### "Translations not imported yet"

1. Go to https://app.tolgee.io
2. Select "RapidWorks Landing Page" project
3. Click **Translations** in sidebar
4. If empty, follow Step 1 above to import

### "Changes don't save"

1. Check API key has write permissions
2. Verify you're logged into Tolgee
3. Check network tab for failed requests
4. Try editing in Tolgee dashboard directly

---

## 📱 For Your Manager

Share this with your manager for easy editing:

**Method 1: In-Context Editing (Recommended)**
1. Visit http://localhost:3000 (dev server must be running)
2. Navigate to MID form
3. Hold Alt/Option + Click on text
4. Edit and save

**Method 2: Dashboard Editing**
1. Go to https://app.tolgee.io
2. Login and select "RapidWorks Landing Page"
3. Click **Translations**
4. Edit in table view

---

## 📋 What Can Be Edited

Your manager can now edit these MID form fields:

### User Information
- `mid.firstName` - Vorname / First name
- `mid.lastName` - Nachname / Last name
- `mid.email` - E-Mailadresse / Email address
- `mid.password` - Passwort / Password

### Organization Data
- `mid.legalName` - Legal name
- `mid.homepage` - Homepage
- `mid.street` - Straße / Street
- `mid.city` - Stadt / City
- `mid.country` - Land / Country

### Button Labels
- `mid.save` - Speichern / Save
- `mid.saving` - Speichern... / Saving...
- `mid.signAndSubmit` - Sign and submit

### Messages
- `mid.successMessage` - Success message
- `mid.errorMessage` - Error message
- `mid.organizationCreated` - Organization created message

**Total: 163 editable fields!**

---

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Holding Alt shows blue borders around text
2. ✅ Clicking opens an edit dialog
3. ✅ Edits save without errors
4. ✅ Changes appear immediately
5. ✅ Language switching works (DE ⇄ EN)

---

## 🔗 Useful Links

- **Tolgee Dashboard**: https://app.tolgee.io
- **Your Project**: https://app.tolgee.io/projects/24641
- **Tolgee Docs**: https://tolgee.io/docs
- **Video Tutorial**: https://www.youtube.com/watch?v=YourVideoID

---

## 📞 Need Help?

- **Manager Guide**: See [TOLGEE_MANAGER_GUIDE.md](TOLGEE_MANAGER_GUIDE.md)
- **Technical Docs**: See [TOLGEE_IMPLEMENTATION.md](TOLGEE_IMPLEMENTATION.md)
- **Tolgee Support**: https://tolgee.io/community

---

**Last Updated**: November 10, 2025
**Project ID**: 24641
**Status**: ✅ Ready to use!
