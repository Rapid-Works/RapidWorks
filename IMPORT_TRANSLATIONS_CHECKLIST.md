# 📋 Import Translations to Tolgee - Step-by-Step Checklist

## ✅ Configuration Status
- ✅ Tolgee installed
- ✅ Project created (ID: 24641)
- ✅ Project ID added to `.env.local`
- ✅ API key configured
- ⚠️ **NEXT STEP**: Import translation files

---

## 🎯 What You Need to Do NOW

### Import the Translation Files to Tolgee Platform

Follow these steps **exactly**:

### Step 1: Locate the Translation Files

You need to upload these 2 files:

```
📁 nextjs-app/
  └─ 📁 src/
      └─ 📁 tolgee/
          └─ 📁 translations/
              ├─ 📄 de.json  ← German (163 keys)
              └─ 📄 en.json  ← English (163 keys)
```

**Full paths:**
- `/Users/mac/Downloads/Work/Beta/landingpage/nextjs-app/src/tolgee/translations/de.json`
- `/Users/mac/Downloads/Work/Beta/landingpage/nextjs-app/src/tolgee/translations/en.json`

---

### Step 2: Import to Tolgee

1. **Go to Tolgee**: https://app.tolgee.io
2. **Login** with your account
3. **Select your project**: "RapidWorks Landing Page"
4. **Click "Import"** in the left sidebar (looks like: 📥)
5. **Click "Upload files"** button
6. **Select both files**:
   - Click "Choose files"
   - Navigate to `nextjs-app/src/tolgee/translations/`
   - Select `de.json`
   - Select `en.json` (hold Ctrl/Cmd to select both)
   - Click "Open"
7. **Verify language mapping**:
   ```
   de.json → German (de) ✓
   en.json → English (en) ✓
   ```
8. **Click "Import"** button
9. **Wait for import** to complete (should take ~5 seconds)
10. **Verify success**: You should see a message like "163 keys imported"

---

### Step 3: Verify Import

1. **Click "Translations"** in left sidebar
2. **Check the count**: Should show ~163 keys
3. **Scroll through** and verify you see:
   - `mid.firstName` = "Vorname" / "First name"
   - `mid.email` = "E-Mailadresse" / "Email address"
   - `mid.save` = "Speichern" / "Save"
4. **Search test**: Search for "email" - should find multiple results

---

### Step 4: Restart Development Server

After import, restart your dev server to test:

```bash
# Stop current server (Ctrl+C if running)

# Restart
cd /Users/mac/Downloads/Work/Beta/landingpage/nextjs-app
npm run dev
```

---

### Step 5: Test In-Context Editing

1. **Open browser**: http://localhost:3000
2. **Navigate to MID form**: Log in → Organization → Create/Edit
3. **Hold Alt/Option key**
4. **Look for blue borders** around text
5. **Click on "Vorname"** (or any other label)
6. **Edit dialog should appear** with:
   - German: "Vorname"
   - English: "First name"
7. **Make a test change**: Change "Vorname" to "Dein Vorname"
8. **Click Save**
9. **Verify**: Text should update immediately!

---

## 🚨 Troubleshooting Import

### Problem: "Language not found"
**Solution**: Make sure German (de) and English (en) are added to your project languages
1. Go to Project Settings
2. Add languages if missing

### Problem: "Invalid JSON format"
**Solution**: The files are valid. Try importing one at a time:
1. Import `de.json` first
2. Then import `en.json`

### Problem: "Keys already exist"
**Solution**:
- If re-importing, choose "Update existing"
- Or clear existing keys first (be careful!)

### Problem: "Import stuck/spinning"
**Solution**:
- Refresh the page
- Try again with one file at a time
- Check file size (should be ~15-20KB each)

---

## 📊 Expected Results After Import

In Tolgee dashboard, you should see:

```
Total Keys: 163
Languages: 2 (German, English)
Translated: 163/163 (100%)
Missing: 0

Sample Keys:
├─ mid.title
├─ mid.firstName
├─ mid.lastName
├─ mid.email
├─ mid.password
├─ mid.save
├─ mid.organizationCreated
├─ mid.salutationOptions.mr
├─ mid.countryOptions.germany
└─ ... (154 more)
```

---

## ✅ Final Checklist

Before moving to testing, verify:

- [ ] Logged into Tolgee (https://app.tolgee.io)
- [ ] Project "RapidWorks Landing Page" is selected
- [ ] Imported `de.json` successfully
- [ ] Imported `en.json` successfully
- [ ] See 163 keys in Translations tab
- [ ] Can see German and English translations
- [ ] Dev server restarted (`npm run dev`)
- [ ] Ready to test in-context editing

---

## 🎉 Once Import is Complete

You're ready to use Tolgee! Next steps:

1. **Test in-context editing** (Step 5 above)
2. **Share with your manager**: Send them [TOLGEE_MANAGER_GUIDE.md](TOLGEE_MANAGER_GUIDE.md)
3. **Start editing** translations as needed!

---

## 📞 Need Help?

If you get stuck during import:
- Check Tolgee docs: https://tolgee.io/docs/platform/importing
- Check file format is correct (should be valid JSON)
- Try importing via Tolgee CLI (advanced)
- Contact Tolgee support: https://tolgee.io/community

---

**Current Status**: ⚠️ Waiting for translation import
**Next Action**: Import de.json and en.json to Tolgee platform
**Estimated Time**: 5 minutes
