import { useTranslate } from '@tolgee/react';

/**
 * Generic translation hook - direct access to Tolgee's translate function
 * Use this when you need full control over translation keys
 *
 * @example
 * const { t } = useTranslation();
 * t('common.fields.firstName'); // Returns "First name"
 * t('features.mid.organizationCreated'); // Returns "Organization Created!"
 */
export const useTranslation = () => {
  const { t } = useTranslate();

  return { t };
};
