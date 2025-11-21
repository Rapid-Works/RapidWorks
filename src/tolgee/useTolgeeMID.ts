import { useTranslate } from '@tolgee/react';
import { useCommonTranslation } from './hooks/useCommonTranslation';
import { useMIDTranslation } from './hooks/useMIDTranslation';

/**
 * Comprehensive hook for MID form translations
 * Combines common fields/actions with MID-specific translations
 *
 * This hook provides backward compatibility while adding support for shared translations
 *
 * @example
 * const { t, tField, tAction } = useTolgeeMID();
 * tField('firstName'); // Common field: "First name"
 * tAction('save'); // Common action: "Save"
 * t('organizationCreated'); // MID-specific: "Organization Created!"
 */
export const useTolgeeMID = () => {
  const { t: translateRaw } = useTranslate();
  const {
    tField,
    tAddress,
    tAction,
    tMessage,
    tLabel,
    tOption,
    tSalutation,
    tCountry,
    tValidation
  } = useCommonTranslation();
  const { t: tMID } = useMIDTranslation();

  return {
    /**
     * Translate MID-specific keys
     * @param key - MID feature key (e.g., 'organizationCreated', 'quickSetupTitle')
     */
    t: tMID,

    /**
     * Translate common form fields
     * @param key - Field name (e.g., 'firstName', 'email', 'phone')
     */
    tField,

    /**
     * Translate common address fields
     * @param key - Address field (e.g., 'street', 'city', 'postalCode')
     */
    tAddress,

    /**
     * Translate common actions/buttons
     * @param key - Action name (e.g., 'save', 'cancel', 'submit')
     */
    tAction,

    /**
     * Translate common messages
     * @param key - Message type (e.g., 'success', 'error', 'loading')
     */
    tMessage,

    /**
     * Translate common labels
     * @param key - Label name (e.g., 'status', 'date', 'name')
     */
    tLabel,

    /**
     * Translate common options
     * @param key - Option key (e.g., 'yes', 'no', 'pleaseSelect')
     */
    tOption,

    /**
     * Translate salutation options
     * @param key - Salutation (e.g., 'mr', 'mrs', 'diverse')
     */
    tSalutation,

    /**
     * Translate country options
     * @param key - Country (e.g., 'germany', 'austria', 'switzerland')
     */
    tCountry,

    /**
     * Translate validation messages
     * @param key - Validation type (e.g., 'required', 'email')
     * @param params - Optional parameters for interpolation
     */
    tValidation,

    /**
     * Direct access to raw translate function for full control
     */
    tRaw: translateRaw,
  };
};
