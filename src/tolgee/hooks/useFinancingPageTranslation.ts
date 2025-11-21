import { useTranslate } from '@tolgee/react';

/**
 * Hook for Financing page translations
 * Returns translations in a structured format matching the original pageContent object
 */
export const useFinancingPageTranslation = () => {
  const { t } = useTranslate();

  return {
    badge: {
      text: t('financing.badge.text'),
    },
    hero: {
      title: t('financing.hero.title'),
      subtitle: t('financing.hero.subtitle'),
      scrollIndicatorAria: t('financing.hero.scrollIndicatorAria'),
    },
    mainSection: {
      title: t('financing.mainSection.title'),
      description: t('financing.mainSection.description'),
      buttonText: t('financing.mainSection.buttonText'),
    },
    modal: {
      title: t('financing.modal.title'),
      loading: t('financing.modal.loading'),
    },
    testimonials: {
      badge: t('financing.testimonials.badge'),
      title: t('financing.testimonials.title'),
      subtitle: t('financing.testimonials.subtitle'),
    },
  };
};
