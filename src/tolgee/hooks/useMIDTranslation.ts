import { useTranslate } from '@tolgee/react';

/**
 * Hook for MID-specific translations
 * Use this for MID form and MID-related features
 *
 * @example
 * const { t } = useMIDTranslation();
 * t('organizationCreated'); // Returns "Organization Created!" (mid.organizationCreated)
 * t('bankAccountTitle'); // Returns "Bank Account Information"
 */
export const useMIDTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    /**
     * Translate MID-specific keys
     * @param key - MID feature key without prefix (e.g., 'organizationCreated', 'quickSetupTitle')
     */
    t: (key: string) => translateFn(`dashboard.mid.${key}`),

    /**
     * Direct access to translate function for full control
     */
    tRaw: translateFn,
  };
};
