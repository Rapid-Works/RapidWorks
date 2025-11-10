# Tolgee Manager Guide - Edit Translations Easily

This guide shows you how to edit translations for the MID form without any coding knowledge!

## Setup Steps (One-Time Only)

### Step 1: Create Your Tolgee Account

1. Go to [https://app.tolgee.io/sign_up](https://app.tolgee.io/sign_up)
2. Sign up with your email
3. Verify your email address

### Step 2: Create a New Project

1. Click **"Create Project"**
2. Fill in:
   - **Project name**: RapidWorks Landing Page
   - **Base language**: German (de)
   - **Additional languages**: English (en)
3. Click **Create**

### Step 3: Get Your Project ID

1. In your new project, click **Settings** in the left sidebar
2. Find and copy the **Project ID** (looks like a number)
3. Send this to your developer to add to the `.env.local` file
   - They need to replace `your_project_id_here` with your actual project ID

### Step 4: Import Existing Translations

1. In your Tolgee project, click **Import** in the left sidebar
2. Click **Upload files**
3. Upload these two files from your project:
   - `nextjs-app/src/tolgee/translations/de.json`
   - `nextjs-app/src/tolgee/translations/en.json`
4. Make sure the language mapping is correct:
   - `de.json` → German (de)
   - `en.json` → English (en)
5. Click **Import**

You should now see all 163 translation keys in your dashboard!

---

## How to Edit Translations

### Method 1: In-Context Editing (Recommended - Super Easy!)

This lets you edit text directly on the website by clicking on it.

**Steps:**

1. **Start your development server** (ask developer to run `npm run dev`)
2. **Open the website** in your browser (usually `http://localhost:3000`)
3. **Navigate to the MID form**
4. **Hold Alt key** (Option on Mac)
5. **Move your mouse** - you'll see all translatable text highlighted with a blue border
6. **Click on any text** while holding Alt
7. A dialog appears where you can:
   - Edit the **German** translation
   - Edit the **English** translation
   - See the translation key
8. **Click Save**
9. The change appears **immediately** on the page!

**Tips:**
- You can switch between German and English using the language switcher in the app
- Changes are saved to the Tolgee platform automatically
- All team members will see the updates

### Method 2: Edit in Tolgee Dashboard

If you prefer to edit in a table view:

1. Go to [https://app.tolgee.io](https://app.tolgee.io)
2. Log in and select your project
3. Click **Translations** in the left sidebar
4. You'll see a table with:
   - **Key**: The identifier (e.g., `mid.firstName`)
   - **German (de)**: The German text
   - **English (en)**: The English text
5. **Click on any cell** to edit
6. Type your changes
7. Press **Enter** or click outside to save

**Search and Filter:**
- Use the search box to find specific text (e.g., search "email")
- Filter by language
- Filter by translation status (translated, missing, etc.)

---

## Common Translation Keys for MID Form

Here are the most commonly edited fields:

| Key | German Example | English Example |
|-----|---------------|-----------------|
| `mid.title` | BENUTZER | USER |
| `mid.organizationCreated` | Organisation angelegt! | Organization Created! |
| `mid.firstName` | Vorname | First name |
| `mid.lastName` | Nachname | Last name |
| `mid.email` | E-Mailadresse | Email address |
| `mid.save` | Speichern | Save |
| `mid.successMessage` | Formular erfolgreich übermittelt! | Form submitted successfully! |

**Pro Tip:** All MID form translations start with `mid.` - you can filter by this in the search box!

---

## Using Machine Translation

Tolgee can help you translate faster using AI:

1. In the Tolgee dashboard, click **Translations**
2. Find a translation that needs work
3. Click the **magic wand icon** next to the text
4. Select your preferred service:
   - **Google Translate** (free tier available)
   - **DeepL** (more accurate, requires API key)
   - **AWS Translate**
5. Review the suggestion
6. Accept or edit as needed

---

## Best Practices

### 1. Always Review Context
- When editing, make sure you understand where the text appears
- The in-context editor shows you exactly where it's used
- Screenshots help (ask developer to enable screenshot feature)

### 2. Keep Consistency
- Use the same terminology throughout
- Example: If you use "Geschäftsführer" for "Managing Director", don't switch to "Geschäftsleiter"

### 3. Test After Changes
- After making changes, test the form to see how it looks
- Make sure text fits in buttons and labels
- Check both German and English versions

### 4. Use Comments
- In Tolgee dashboard, you can add comments to translations
- Useful for explaining context or noting why certain terms are used

---

## Troubleshooting

### "I don't see the highlighted text when holding Alt"
- Make sure you're on the development server (not production)
- Check that the API key is correctly set in `.env.local`
- Restart the development server

### "Changes don't appear immediately"
- Refresh the page
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check if you saved the translation in Tolgee

### "Translation appears as the key (e.g., 'mid.firstName')"
- The translation might be missing in Tolgee
- Add the translation in the dashboard
- Make sure the import was successful

---

## Need Help?

- **Tolgee Documentation**: [https://tolgee.io/docs](https://tolgee.io/docs)
- **Video Tutorials**: [https://tolgee.io/tutorials](https://tolgee.io/tutorials)
- **Community Support**: [https://tolgee.io/community](https://tolgee.io/community)

---

## Quick Reference: What You Can Edit

✅ **You CAN edit:**
- All form labels (First Name, Last Name, etc.)
- Button text (Save, Submit, etc.)
- Success/error messages
- Help text and descriptions
- Dropdown options
- Section titles

❌ **You should NOT edit:**
- HTML code
- Variable names in curly braces like `{name}`
- URLs
- API endpoints

---

**Last Updated:** November 2025
**Your Tolgee API Key:** Already configured
**Project ID:** (To be added after project creation)
