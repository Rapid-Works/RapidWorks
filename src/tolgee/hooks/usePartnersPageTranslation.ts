import { useTranslate } from '@tolgee/react';

/**
 * Hook for Partners page translations
 * Returns translations in a structured format matching the original pageContent object
 */
export const usePartnersPageTranslation = () => {
  const { t } = useTranslate();

  return {
    badge: {
      text: t('partners.badge.text'),
    },
    hero: {
      title: t('partners.hero.title'),
      subtitle: t('partners.hero.subtitle'),
    },
    partners: {
      title: t('partners.partners.title'),
      subtitle: t('partners.partners.subtitle'),
      selectionTitle: t('partners.partners.selectionTitle'),
      items: Array.from({ length: 6 }, (_, i) => ({
        id: t(`partners.partners.items.${i}.id`),
        title: t(`partners.partners.items.${i}.title`),
        description: t(`partners.partners.items.${i}.description`),
      })),
      demandInfo: {
        title: t('partners.partners.demandInfo.title'),
        subtitle: t('partners.partners.demandInfo.subtitle'),
        cta: t('partners.partners.demandInfo.cta'),
      },
    },
    form: {
      title: t('partners.form.title'),
      emailLabel: t('partners.form.emailLabel'),
      emailPlaceholder: t('partners.form.emailPlaceholder'),
      selectedNeedsTitle: t('partners.form.selectedNeedsTitle'),
      consent: {
        checkbox: t('partners.form.consent.checkbox'),
        subtitle: t('partners.form.consent.subtitle'),
      },
      button: t('partners.form.button'),
      success: {
        title: t('partners.form.success.title'),
        message: t('partners.form.success.message'),
        anotherEmail: t('partners.form.success.anotherEmail'),
      },
    },
    errorPrompt: {
      noSelection: t('partners.errorPrompt.noSelection'),
      invalidEmail: t('partners.errorPrompt.invalidEmail'),
      noEmail: t('partners.errorPrompt.noEmail'),
      submitFailed: t('partners.errorPrompt.submitFailed'),
    },
    selectionPrompt: {
      title: t('partners.selectionPrompt.title'),
      message: t('partners.selectionPrompt.message'),
      mobileText: t('partners.selectionPrompt.mobileText'),
      desktopText: t('partners.selectionPrompt.desktopText'),
    },
  };
};
