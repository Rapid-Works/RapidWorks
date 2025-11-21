# Translation Structure Guide

## Overview

This document explains the translation key structure for the RapidWorks dashboard. We use a **shared dictionary approach** where common terms are reused across the entire application, while feature-specific terms remain namespaced.

---

## Key Structure Philosophy

### The `common.*` Namespace - Shared Translations
Terms used across **3 or more components** or that represent **standard UI elements**.

**Examples:**
- `common.fields.firstName` - Used in MID form, Profile, Settings, etc.
- `common.actions.save` - Used in every form across the app
- `common.messages.success` - Used for all success notifications

**Benefits:**
- ✅ Edit once, changes everywhere
- ✅ Guaranteed consistency
- ✅ Easier management (~36% fewer keys)

### The `features.*` Namespace - Feature-Specific Translations
Terms unique to a specific feature or context.

**Examples:**
- `features.mid.organizationCreated` - Only used in MID context
- `features.mid.quickSetupDescription` - MID-specific functionality
- `features.profile.deleteAccountWarning` - Profile-specific warning

**Benefits:**
- ✅ Clear ownership
- ✅ Context-dependent translations possible
- ✅ Easy to find feature-related translations

---

## Complete Key Structure

```
common/                          ← Shared across entire app
├── fields/                      ← Form fields (firstName, email, etc.)
│   ├── firstName
│   ├── lastName
│   ├── email
│   ├── username
│   ├── password
│   ├── confirmPassword
│   ├── phone
│   ├── phoneAreaCode
│   ├── phoneNumber
│   ├── salutation
│   ├── title
│   ├── role
│   ├── homepage
│   ├── description
│   └── address/                 ← Address-specific subgroup
│       ├── street
│       ├── streetNumber
│       ├── city
│       ├── postalCode
│       ├── country
│       └── poBox
│
├── actions/                     ← Buttons and actions
│   ├── save
│   ├── saving
│   ├── cancel
│   ├── delete
│   ├── deleting
│   ├── edit
│   ├── editing
│   ├── create
│   ├── creating
│   ├── submit
│   ├── submitting
│   ├── update
│   ├── updating
│   ├── close
│   ├── back
│   ├── next
│   ├── confirm
│   ├── confirming
│   ├── skip
│   └── continue
│
├── messages/                    ← System messages
│   ├── success
│   ├── error
│   ├── loading
│   ├── saving
│   ├── saved
│   ├── noChanges
│   ├── saveChanges
│   ├── unsavedChanges
│   ├── confirmLeave
│   └── required
│
├── labels/                      ← Common labels
│   ├── status
│   ├── date
│   ├── time
│   ├── name
│   ├── type
│   ├── category
│   ├── description
│   ├── details
│   ├── information
│   └── settings
│
├── options/                     ← Dropdown options
│   ├── yes
│   ├── no
│   ├── pleaseSelect
│   ├── salutation/             ← Salutation options
│   │   ├── mr
│   │   ├── mrs
│   │   └── diverse
│   └── country/                ← Country options
│       ├── germany
│       ├── austria
│       └── switzerland
│
└── validation/                  ← Validation messages
    ├── required
    ├── email
    ├── phone
    ├── minLength
    ├── maxLength
    └── passwordMatch

features/                        ← Feature-specific translations
├── mid/                         ← MID funding program
│   ├── title
│   ├── projectId
│   ├── createOrganization
│   ├── organizationCreated
│   ├── businessContactTitle
│   ├── quickSetupTitle
│   ├── quickSetupDescription
│   ├── midContactTitle
│   ├── bankAccountTitle
│   ├── companyType
│   ├── industryOptions.*
│   ├── employeesTitle
│   ├── midFundingHistory
│   └── ... (all MID-specific terms)
│
├── profile/                     ← User profile
│   ├── title
│   ├── profileData
│   ├── security
│   ├── editProfile
│   ├── changePassword
│   ├── deleteAccount
│   ├── deleteAccountWarning
│   └── ... (all profile-specific terms)
│
└── dashboard/                   ← Main dashboard
    ├── welcome
    ├── setup
    ├── home
    ├── tasks
    ├── organization
    ├── profile
    └── settings
```

---

## Translation Hooks

### 1. `useCommonTranslation()`
For shared translations used across the app.

```typescript
import { useCommonTranslation } from '@/tolgee/hooks/useCommonTranslation';

const { tField, tAddress, tAction, tMessage, tLabel, tOption, tSalutation, tCountry, tValidation } = useCommonTranslation();

// Usage:
tField('firstName')              // → "First name"
tAddress('street')               // → "Street"
tAction('save')                  // → "Save"
tMessage('success')              // → "Success!"
tLabel('status')                 // → "Status"
tOption('yes')                   // → "Yes"
tSalutation('mr')                // → "Mr."
tCountry('germany')              // → "Germany"
tValidation('required')          // → "This field is required"
tValidation('minLength', {count: 5})  // → "Minimum 5 characters required"
```

### 2. `useMIDTranslation()`
For MID-specific translations.

```typescript
import { useMIDTranslation } from '@/tolgee/hooks/useMIDTranslation';

const { t } = useMIDTranslation();

// Usage:
t('organizationCreated')         // → features.mid.organizationCreated
t('quickSetupTitle')             // → features.mid.quickSetupTitle
t('bankAccountDescription')      // → features.mid.bankAccountDescription
```

### 3. `useProfileTranslation()`
For Profile-specific translations.

```typescript
import { useProfileTranslation } from '@/tolgee/hooks/useProfileTranslation();

const { t } = useProfileTranslation();

// Usage:
t('editProfile')                 // → features.profile.editProfile
t('changePassword')              // → features.profile.changePassword
t('deleteAccountWarning')        // → features.profile.deleteAccountWarning
```

### 4. `useDashboardTranslation()`
For Dashboard-specific translations.

```typescript
import { useDashboardTranslation } from '@/tolgee/hooks/useDashboardTranslation';

const { t } = useDashboardTranslation();

// Usage:
t('welcome', {name: 'John'})     // → features.dashboard.welcome
t('home')                        // → features.dashboard.home
t('setup')                       // → features.dashboard.setup
```

### 5. `useTolgeeMID()` - Comprehensive Hook
Combines common + MID translations for backward compatibility.

```typescript
import { useTolgeeMID } from '@/tolgee/useTolgeeMID';

const { t, tField, tAction, tAddress, tMessage, tOption } = useTolgeeMID();

// MID-specific:
t('organizationCreated')         // → features.mid.organizationCreated

// Common fields:
tField('firstName')              // → common.fields.firstName
tAction('save')                  // → common.actions.save
tAddress('city')                 // → common.fields.address.city
```

---

## When to Use Common vs Feature-Specific

### Use `common.*` when:
✅ The term appears in **3 or more places**
✅ It's a **standard form field** (firstName, email, phone)
✅ It's a **standard action** (save, cancel, delete, edit)
✅ It's **generic UI text** (status, date, loading, success)
✅ You want **guaranteed consistency** across the app

### Use `features.*` when:
✅ The term is **unique to a feature** (MID-specific, profile-specific)
✅ **Context matters** (same word, different meaning in different features)
✅ It's **domain-specific terminology** (midFundingHistory, bankAccountDescription)
✅ **Only used in one feature**

---

## Examples

### Example 1: Form with Common Fields

```jsx
import { useCommonTranslation } from '@/tolgee/hooks/useCommonTranslation';

const MyForm = () => {
  const { tField, tAddress, tAction } = useCommonTranslation();

  return (
    <form>
      {/* Common fields - reused everywhere */}
      <label>{tField('firstName')}</label>
      <input name="firstName" />

      <label>{tField('email')}</label>
      <input name="email" type="email" />

      {/* Address fields */}
      <label>{tAddress('street')}</label>
      <input name="street" />

      <label>{tAddress('city')}</label>
      <input name="city" />

      {/* Common actions */}
      <button type="submit">{tAction('save')}</button>
      <button type="button">{tAction('cancel')}</button>
    </form>
  );
};
```

### Example 2: MID Form (Mixed Common + Feature)

```jsx
import { useTolgeeMID } from '@/tolgee/useTolgeeMID';

const MIDForm = () => {
  const { t, tField, tAction, tOption } = useTolgeeMID();

  return (
    <form>
      {/* MID-specific heading */}
      <h2>{t('organizationDataTitle')}</h2>
      <p>{t('organizationInfoDescription')}</p>

      {/* Common fields */}
      <label>{tField('firstName')}</label>
      <input name="firstName" />

      {/* MID-specific field */}
      <label>{t('legalName')}</label>
      <input name="legalName" />
      <p className="help">{t('legalNameHelp')}</p>

      {/* Common option */}
      <select>
        <option value="">{tOption('pleaseSelect')}</option>
        <option value="yes">{tOption('yes')}</option>
        <option value="no">{tOption('no')}</option>
      </select>

      {/* Common action */}
      <button>{tAction('save')}</button>
    </form>
  );
};
```

---

## Benefits Summary

### For Developers:
- ✅ **Less code duplication** - Use `tField('firstName')` everywhere
- ✅ **Easier refactoring** - Change common term once
- ✅ **Clear intent** - Code is self-documenting
- ✅ **Type safety** - TypeScript hooks with JSDoc

### For Managers (Non-Technical):
- ✅ **Edit once, apply everywhere** - Change "Save" button globally
- ✅ **See usage count** - Tolgee shows where each key is used
- ✅ **Less work** - Fewer translations to manage
- ✅ **Consistency guaranteed** - Can't accidentally use different translations

### For the App:
- ✅ **Smaller bundle** - ~36% fewer translation keys
- ✅ **Consistent UX** - Same terminology throughout
- ✅ **Easier to scale** - New features reuse common terms
- ✅ **Better maintainability** - Clear structure

---

## Statistics

**Before (Page-Specific Approach):**
- MID: 146 keys
- Dashboard: ~100 keys (50% duplicates)
- Profile: ~80 keys (60% duplicates)
- **Total: ~326 keys with redundancy**

**After (Shared Dictionary Approach):**
- Common: ~80 keys (reused everywhere)
- MID: ~95 unique keys
- Dashboard: ~10 unique keys
- Profile: ~15 unique keys
- **Total: ~200 keys (38% reduction!)**

---

## Migration Path

1. ✅ New translations use new structure from day 1
2. ✅ Existing components gradually migrate (no rush)
3. ✅ Both approaches work simultaneously
4. ✅ Backward compatibility maintained

---

## Questions?

**"What if I'm not sure if something should be common or feature-specific?"**
→ Start with feature-specific. If you use it in 3+ places, move it to common.

**"Can I still use the old translation keys?"**
→ No, the old keys (mid.firstName) have been restructured to (features.mid.* and common.fields.firstName). But the migration is straightforward!

**"What if I need a custom translation key?"**
→ Use `tRaw()` from any hook for full control: `tRaw('my.custom.key')`

---

**Last Updated:** November 10, 2025
**Translation Files:**
- `src/tolgee/translations/de.json`
- `src/tolgee/translations/en.json`
