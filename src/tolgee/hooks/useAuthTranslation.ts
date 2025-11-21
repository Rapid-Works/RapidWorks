import { useTranslate } from '@tolgee/react';

export const useAuthTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    t: (key: string, params?: Record<string, string | number | boolean>) => translateFn(`dashboard.auth.${key}`, params),
    tRaw: translateFn,
  };
};
