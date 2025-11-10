import { useTranslate } from '@tolgee/react';

/**
 * Custom hook for MID form translations
 * Provides a simple API similar to the old useMIDTranslation hook
 */
export const useTolgeeMID = () => {
  const { t } = useTranslate();

  return {
    t: (key: string) => t(`mid.${key}`),
  };
};
