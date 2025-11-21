import { useTranslate } from '@tolgee/react';

/**
 * Hook for Profile-specific translations
 * Use this for user profile and account settings
 *
 * @example
 * const { t } = useProfileTranslation();
 * t('editProfile'); // Returns "Edit Profile" (profile.editProfile)
 * t('changePassword'); // Returns "Change Password"
 */
export const useProfileTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    /**
     * Translate profile-specific keys
     * @param key - Profile feature key without prefix (e.g., 'editProfile', 'changePassword')
     */
    t: (key: string) => translateFn(`dashboard.profile.${key}`),

    /**
     * Direct access to translate function for full control
     */
    tRaw: translateFn,
  };
};
