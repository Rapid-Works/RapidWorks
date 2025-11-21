import { useTranslate } from '@tolgee/react';

/**
 * Hook for common/shared translations used across the entire app
 * Provides convenient methods for different categories of common terms
 *
 * @example
 * const { tField, tAction, tMessage } = useCommonTranslation();
 * tField('firstName'); // Returns "First name" (fields.firstName)
 * tAction('save'); // Returns "Save" (actions.save)
 * tMessage('success'); // Returns "Success!" (messages.success)
 */
export const useCommonTranslation = () => {
  const { t } = useTranslate();

  return {
    /**
     * Translate common form fields
     * @param key - Field name without prefix (e.g., 'firstName', 'email')
     */
    tField: (key: string) => t(`fields.${key}`),

    /**
     * Translate common address fields
     * @param key - Address field name (e.g., 'street', 'city', 'postalCode')
     */
    tAddress: (key: string) => t(`fields.address.${key}`),

    /**
     * Translate common actions/buttons
     * @param key - Action name (e.g., 'save', 'cancel', 'delete')
     */
    tAction: (key: string) => t(`actions.${key}`),

    /**
     * Translate common messages
     * @param key - Message type (e.g., 'success', 'error', 'loading')
     */
    tMessage: (key: string) => t(`messages.${key}`),

    /**
     * Translate common labels
     * @param key - Label name (e.g., 'status', 'date', 'name')
     */
    tLabel: (key: string) => t(`labels.${key}`),

    /**
     * Translate common options
     * @param key - Option key (e.g., 'yes', 'no', 'pleaseSelect')
     */
    tOption: (key: string) => t(`options.${key}`),

    /**
     * Translate salutation options
     * @param key - Salutation key (e.g., 'mr', 'mrs', 'diverse')
     */
    tSalutation: (key: string) => t(`options.salutation.${key}`),

    /**
     * Translate country options
     * @param key - Country key (e.g., 'germany', 'austria', 'switzerland')
     */
    tCountry: (key: string) => t(`options.country.${key}`),

    /**
     * Translate validation messages
     * @param key - Validation type (e.g., 'required', 'email', 'minLength')
     * @param params - Optional parameters for interpolation (e.g., {count: 5})
     */
    tValidation: (key: string, params?: Record<string, any>) => t(`validation.${key}`, params),

    /**
     * Direct access to translate function for custom keys
     */
    t,
  };
};
