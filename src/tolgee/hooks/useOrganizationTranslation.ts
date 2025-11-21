import { useTranslate } from '@tolgee/react';

export const useOrganizationTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    t: (key: string, params?: Record<string, string | number | boolean>) => translateFn(`dashboard.organization.${key}`, params),
    tRaw: translateFn,
  };
};
