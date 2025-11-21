import { useTranslate } from '@tolgee/react';

/**
 * Hook for ExploreMore section translations
 */
export const useExploreMoreTranslation = () => {
  const { t } = useTranslate();

  return {
    badge: t('exploreMore.badge'),
    getTitle: (service: string) => t('exploreMore.titleTemplate', { service }),
    description: t('exploreMore.description'),
    cta: t('exploreMore.cta'),
    services: {
      Branding: t('exploreMore.services.Branding'),
      Experts: t('exploreMore.services.Experts'),
      Partners: t('exploreMore.services.Partners'),
      Coaching: t('exploreMore.services.Coaching'),
      Financing: t('exploreMore.services.Financing'),
    },
  };
};
