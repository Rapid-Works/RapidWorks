import { useTranslate } from '@tolgee/react';

export const useOrganizationTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    t: (key: string, params?: Record<string, any>) => translateFn(`dashboard.organization.${key}`, params),
    tRaw: translateFn,
  };
};
