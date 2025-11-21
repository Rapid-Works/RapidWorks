import { useTranslate } from '@tolgee/react';

/**
 * Hook for Dashboard-specific translations
 * Use this for main dashboard, navigation, and dashboard features
 *
 * @example
 * const { t } = useDashboardTranslation();
 * t('welcome'); // Returns "Welcome, {name}" (dashboard.welcome)
 * t('home'); // Returns "Home"
 */
export const useDashboardTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    /**
     * Translate dashboard-specific keys
     * @param key - Dashboard feature key without prefix (e.g., 'welcome', 'setup', 'home')
     * @param params - Optional parameters for interpolation (e.g., {name: 'John'})
     */
    t: (key: string, params?: Record<string, any>) => translateFn(`dashboard.dashboard.${key}`, params),

    /**
     * Direct access to translate function for full control
     */
    tRaw: translateFn,
  };
};
