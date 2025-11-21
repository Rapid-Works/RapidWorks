# Translation Migration Example

## How to Migrate Components to Use Common + Feature Translations

### Before vs After Examples

#### Example 1: MIDForm - Form Fields

**Before (old approach):**
```jsx
const { t } = useTolgeeMID();

<label>{t('firstName')}</label>  // mid.firstName
<input placeholder={t('firstName')} />

<label>{t('lastName')}</label>   // mid.lastName
<input placeholder={t('lastName')} />

<button>{t('save')}</button>      // mid.save
<button>{t('cancel')}</button>    // mid.cancel
```

**After (new approach - using common):**
```jsx
const { t, tField, tAction } = useTolgeeMID();

<label>{tField('firstName')}</label>  // common.fields.firstName
<input placeholder={tField('firstName')} />

<label>{tField('lastName')}</label>   // common.fields.lastName
<input placeholder={tField('lastName')} />

<button>{tAction('save')}</button>      // common.actions.save
<button>{tAction('cancel')}</button>    // common.actions.cancel
```

**Key Changes:**
- `t('firstName')` → `tField('firstName')` (uses common.fields)
- `t('save')` → `tAction('save')` (uses common.actions)
- MID-specific terms still use `t()`

#### Example 2: MIDForm - Address Fields

**Before:**
```jsx
const { t } = useTolgeeMID();

<label>{t('street')}</label>          // mid.street
<label>{t('streetNumber')}</label>    // mid.streetNumber
<label>{t('city')}</label>            // mid.city
<label>{t('postalCode')}</label>      // mid.postalCode
<label>{t('country')}</label>          // mid.country
```

**After:**
```jsx
const { t, tAddress, tField } = useTolgeeMID();

<label>{tAddress('street')}</label>          // common.fields.address.street
<label>{tAddress('streetNumber')}</label>    // common.fields.address.streetNumber
<label>{tAddress('city')}</label>            // common.fields.address.city
<label>{tAddress('postalCode')}</label>      // common.fields.address.postalCode
<label>{tField('country')}</label>           // common.fields.country
```

#### Example 3: MIDForm - Options/Dropdowns

**Before:**
```jsx
const { t } = useTolgeeMID();

<option value="">{t('salutationOptions.pleaseSelect')}</option>  // mid.salutationOptions.pleaseSelect
<option value="mr">{t('salutationOptions.mr')}</option>          // mid.salutationOptions.mr
<option value="mrs">{t('salutationOptions.mrs')}</option>        // mid.salutationOptions.mrs

<option value="yes">{t('yes')}</option>  // mid.yes
<option value="no">{t('no')}</option>    // mid.no
```

**After:**
```jsx
const { t, tOption, tSalutation } = useTolgeeMID();

<option value="">{tOption('pleaseSelect')}</option>     // common.options.pleaseSelect
<option value="mr">{tSalutation('mr')}</option>         // common.options.salutation.mr
<option value="mrs">{tSalutation('mrs')}</option>       // common.options.salutation.mrs

<option value="yes">{tOption('yes')}</option>   // common.options.yes
<option value="no">{tOption('no')}</option>     // common.options.no
```

#### Example 4: MIDForm - Keep MID-Specific Terms

**Before & After (stays the same - still uses `t()`):**
```jsx
const { t } = useTolgeeMID();

<h2>{t('organizationCreated')}</h2>           // features.mid.organizationCreated
<p>{t('quickSetupDescription')}</p>           // features.mid.quickSetupDescription
<button>{t('collectDataButton')}</button>     // features.mid.collectDataButton
<label>{t('legalName')}</label>               // features.mid.legalName
<p>{t('taxIdHelp')}</p>                       // features.mid.taxIdHelp
```

These remain MID-specific because they're unique to MID functionality!

---

## Example 5: Profile Tab Component

### Before (using old hook):
```jsx
import { useMIDTranslation } from '../hooks/useMIDTranslation';

const ProfileTab = () => {
  const { t } = useMIDTranslation();

  return (
    <div>
      <h2>{t('onboarding.profile.title')}</h2>
      <label>{t('onboarding.profile.firstName')}</label>
      <input placeholder={t('onboarding.profile.firstNamePlaceholder')} />

      <label>{t('onboarding.profile.lastName')}</label>
      <input placeholder={t('onboarding.profile.lastNamePlaceholder')} />

      <button>{t('onboarding.profile.save')}</button>
      <button>{t('onboarding.profile.cancel')}</button>
    </div>
  );
};
```

### After (using common + profile):
```jsx
import { useCommonTranslation } from '../tolgee/hooks/useCommonTranslation';
import { useProfileTranslation } from '../tolgee/hooks/useProfileTranslation';

const ProfileTab = () => {
  const { tField, tAction } = useCommonTranslation();
  const { t } = useProfileTranslation();

  return (
    <div>
      <h2>{t('title')}</h2>  {/* features.profile.title */}
      <label>{tField('firstName')}</label>  {/* common.fields.firstName */}
      <input placeholder={t('firstNamePlaceholder')} />  {/* features.profile.firstNamePlaceholder */}

      <label>{tField('lastName')}</label>  {/* common.fields.lastName */}
      <input placeholder={t('lastNamePlaceholder')} />  {/* features.profile.lastNamePlaceholder */}

      <button>{tAction('save')}</button>  {/* common.actions.save */}
      <button>{tAction('cancel')}</button>  {/* common.actions.cancel */}
    </div>
  );
};
```

---

## Decision Tree: Which Hook/Method to Use?

### Is it a standard form field? (firstName, email, phone, password)
→ Use `tField('fieldName')`
→ Translates to `common.fields.fieldName`

### Is it an address field? (street, city, postalCode)
→ Use `tAddress('fieldName')`
→ Translates to `common.fields.address.fieldName`

### Is it a button/action? (save, cancel, delete, submit)
→ Use `tAction('actionName')`
→ Translates to `common.actions.actionName`

### Is it a common option? (yes, no, pleaseSelect)
→ Use `tOption('optionName')`
→ Translates to `common.options.optionName`

### Is it a salutation? (mr, mrs, diverse)
→ Use `tSalutation('salutationKey')`
→ Translates to `common.options.salutation.key`

### Is it feature-specific? (MID-specific terms, dashboard-specific, etc.)
→ Use `t('featureKey')`
→ Translates to `features.featureName.featureKey`

---

## Benefits of This Approach

### 1. Single Source of Truth
Change "Save" button text once → updates across MID form, profile, dashboard, settings, etc.

```jsx
// Manager edits in Tolgee: common.actions.save = "Speichern" → "Jetzt speichern"
// This change affects:
<button>{tAction('save')}</button>  // MID form
<button>{tAction('save')}</button>  // Profile tab
<button>{tAction('save')}</button>  // Settings
<button>{tAction('save')}</button>  // Every component using tAction('save')
```

### 2. Clear Intent
Code is self-documenting:
- `tField('email')` - clearly a common form field
- `t('organizationCreated')` - clearly MID-specific
- `tAction('save')` - clearly a common action

### 3. Easy to Scale
Adding a new component? Just import the hooks and start using common terms!

```jsx
import { useCommonTranslation } from '../tolgee/hooks/useCommonTranslation';

const NewComponent = () => {
  const { tField, tAction } = useCommonTranslation();

  // Instantly has access to all common translations!
  return (
    <form>
      <label>{tField('firstName')}</label>
      <label>{tField('email')}</label>
      <button>{tAction('save')}</button>
    </form>
  );
};
```

### 4. Consistent Terminology
No more "First Name" in one place and "Vorname" in another - guaranteed consistency!

---

## Migration Checklist

When migrating a component:

- [ ] Import new hooks (`useCommonTranslation`, feature-specific hooks)
- [ ] Identify common fields → Replace `t('fieldName')` with `tField('fieldName')`
- [ ] Identify common actions → Replace `t('action')` with `tAction('action')`
- [ ] Identify address fields → Replace with `tAddress('field')`
- [ ] Keep feature-specific terms using `t('featureKey')`
- [ ] Test in-context editing still works
- [ ] Verify translations display correctly

---

## Next Steps

1. ✅ Import expanded translations to Tolgee platform
2. ✅ Restart dev server
3. ✅ Test MID form with new structure
4. ✅ Gradually migrate other components
5. ✅ Test that changing a common translation updates everywhere
6. ✅ Document for your team

---

**Questions?** Check the hook files for full JSDoc documentation!
