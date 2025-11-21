import { useTranslate } from '@tolgee/react';

export const useTaskTranslation = () => {
  const { t: translateFn } = useTranslate();

  return {
    t: (key: string, params?: Record<string, any>) => translateFn(`dashboard.task.${key}`, params),
    tRaw: translateFn,
  };
};
