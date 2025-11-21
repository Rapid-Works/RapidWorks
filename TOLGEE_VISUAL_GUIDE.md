# Tolgee Visual Guide - How to Edit Translations

## 🎨 What You'll See

### Step 1: Normal View (No Alt Key)
```
┌─────────────────────────────────────────┐
│  MID Form                                │
├─────────────────────────────────────────┤
│                                          │
│  Vorname: [____________]                 │
│                                          │
│  Nachname: [____________]                │
│                                          │
│  E-Mailadresse: [____________]           │
│                                          │
│  [Speichern]                             │
│                                          │
└─────────────────────────────────────────┘
```

### Step 2: Hold Alt/Option - Text Gets Highlighted
```
┌─────────────────────────────────────────┐
│  MID Form                                │
├─────────────────────────────────────────┤
│                                          │
│  ╔════════╗                              │
│  ║Vorname ║: [____________]              │
│  ╚════════╝                              │
│            ↑ Blue border appears!        │
│  ╔═════════╗                             │
│  ║Nachname ║: [____________]             │
│  ╚═════════╝                             │
│                                          │
│  ╔══════════════╗                        │
│  ║E-Mailadresse ║: [____________]        │
│  ╚══════════════╝                        │
│                                          │
│  ╔══════════╗                            │
│  ║Speichern ║                            │
│  ╚══════════╝                            │
└─────────────────────────────────────────┘
```

### Step 3: Click While Holding Alt - Edit Dialog Appears
```
┌─────────────────────────────────────────┐
│  MID Form                                │
├─────────────────────────────────────────┤
│                                          │
│  Vorname: [____________]                 │
│     ↓                                    │
│  ┌────────────────────────────────────┐ │
│  │ Edit Translation                   │ │
│  ├────────────────────────────────────┤ │
│  │ Key: mid.firstName                 │ │
│  │                                    │ │
│  │ 🇩🇪 German:                         │ │
│  │ [Vorname                        ]  │ │
│  │                                    │ │
│  │ 🇬🇧 English:                        │ │
│  │ [First name                     ]  │ │
│  │                                    │ │
│  │         [Cancel]  [Save]           │ │
│  └────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

### Step 4: Edit and Save - Changes Appear Immediately!
```
┌─────────────────────────────────────────┐
│  MID Form                                │
├─────────────────────────────────────────┤
│                                          │
│  Dein Vorname: [____________]            │
│  ↑ Changed instantly!                    │
│                                          │
│  Nachname: [____________]                │
│                                          │
│  E-Mailadresse: [____________]           │
│                                          │
│  [Speichern]                             │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🖱️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| **Show translatable text** | Hold `Alt` | Hold `Option` |
| **Edit translation** | `Alt` + Click | `Option` + Click |
| **Open Tolgee menu** | `Alt` + `T` | `Option` + `T` |
| **Close dialog** | `Esc` | `Esc` |

---

## 🎯 What You Can Click On

### ✅ Editable Elements
- ✅ Form labels ("Vorname", "Nachname", etc.)
- ✅ Button text ("Speichern", "Absenden")
- ✅ Help text and descriptions
- ✅ Error messages
- ✅ Success messages
- ✅ Dropdown options
- ✅ Section headings
- ✅ Placeholder text

### ❌ Non-Editable Elements
- ❌ Input fields (the boxes where users type)
- ❌ User-entered data
- ❌ Images
- ❌ Icons
- ❌ Untranslated static text

---

## 🔄 Language Switching

You can switch languages to see both translations:

```
┌──────────────────────────────────────────┐
│ [🇩🇪 DE] [🇬🇧 EN]  ← Language switcher   │
└──────────────────────────────────────────┘

German View:
┌──────────────────────────────────────────┐
│ Vorname: [____________]                   │
│ Nachname: [____________]                  │
│ [Speichern]                               │
└──────────────────────────────────────────┘

English View:
┌──────────────────────────────────────────┐
│ First name: [____________]                │
│ Last name: [____________]                 │
│ [Save]                                    │
└──────────────────────────────────────────┘
```

Hold Alt in each view to edit that language's translations!

---

## 📊 Tolgee Dashboard View

Alternative to in-context editing:

```
┌────────────────────────────────────────────────────────────┐
│ Tolgee - RapidWorks Landing Page                           │
├────────────────────────────────────────────────────────────┤
│ Search: [__________]  [+ Add key]  [Import]  [Export]     │
├──────────────────┬─────────────────┬────────────────────────┤
│ Key              │ German (de)     │ English (en)          │
├──────────────────┼─────────────────┼────────────────────────┤
│ mid.firstName    │ Vorname         │ First name            │
│ mid.lastName     │ Nachname        │ Last name             │
│ mid.email        │ E-Mailadresse   │ Email address         │
│ mid.password     │ Passwort        │ Password              │
│ mid.save         │ Speichern       │ Save                  │
│ mid.saving       │ Speichern...    │ Saving...             │
│ ...              │ ...             │ ...                   │
│ (163 keys total) │                 │                       │
└──────────────────┴─────────────────┴────────────────────────┘
     ↑ Click any cell to edit
```

---

## 💡 Pro Tips

### Tip 1: Use Search in Dashboard
Instead of scrolling through 163 keys, search for what you need:
```
Search: "email" → Shows all keys containing "email"
```

### Tip 2: Filter by Status
```
[All] [Translated] [Untranslated] [Needs Review]
```

### Tip 3: Batch Edit Similar Text
If you change "Organisation" to "Unternehmen", search for all instances:
```
Search: "organisation" → Edit all occurrences at once
```

### Tip 4: Use Machine Translation
For quick drafts:
```
1. Click the magic wand icon (🪄)
2. Choose: DeepL / Google / AWS
3. Review and adjust
4. Save
```

---

## 🎬 Quick Demo Flow

**Scenario**: Change "Speichern" to "Jetzt speichern"

1. **Open MID form** in browser
2. **Hold Alt** → See "Speichern" highlighted
3. **Click on "Speichern"** → Dialog opens
4. **Edit German**: "Jetzt speichern"
5. **Edit English**: "Save now"
6. **Click Save** → Button text updates immediately!
7. **Done!** No code changes, no deployment

---

## 🔔 What Your Manager Will See

### First Time Setup (5 minutes)
1. Create Tolgee account
2. Already created project ✅
3. Import translations (one-time)
4. Start editing!

### Daily Usage (30 seconds per edit)
1. Hold Alt + Click
2. Type new text
3. Save
4. Done!

**No technical knowledge needed!**

---

## 📸 Context Helps Translation

When editing in Tolgee dashboard, you might not remember what "mid.streetNumber" means.

**Solution**: Use in-context editing!
- You see exactly where the text appears
- You understand the context
- You make better translations

Example:
```
Dashboard view:
mid.streetNumber → "Hausnummer" (What is this for?)

In-context view:
Straße: [_____] Hausnummer: [___]
↑ Street          ↑ Ah! It's the house number!
```

---

## ✅ Success Checklist

After setup, you should be able to:

- [ ] See blue borders when holding Alt
- [ ] Click on any text to edit it
- [ ] See both German and English in edit dialog
- [ ] Make changes and save
- [ ] See changes appear immediately
- [ ] Switch languages and see different text
- [ ] Edit from Tolgee dashboard too
- [ ] Changes sync between dashboard and app

---

## 🎉 You're Ready!

Once you can do the "Quick Demo Flow" above, you're all set!

Your manager can now:
- ✅ Edit all 163 MID form translations
- ✅ No developer help needed
- ✅ See changes in real-time
- ✅ Work from anywhere (Tolgee dashboard)
- ✅ Collaborate with team members

---

**Visual Guide Version**: 1.0
**Last Updated**: November 10, 2025
**Project**: RapidWorks Landing Page (ID: 24641)
