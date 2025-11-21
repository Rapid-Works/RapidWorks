import { useTranslate } from '@tolgee/react';

export const useBrandingTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    t: (key: string, params?: Record<string, any>) => translateFn(`dashboard.branding.${key}`, params),
    tRaw: translateFn,
  };
};
