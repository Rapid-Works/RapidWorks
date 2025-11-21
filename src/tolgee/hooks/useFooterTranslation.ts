import { useTranslate } from '@tolgee/react';

/**
 * Hook for Footer translations
 */
export const useFooterTranslation = () => {
  const { t } = useTranslate();

  return {
    newsletter: {
      title: t('footer.newsletter.title'),
      placeholder: t('footer.newsletter.placeholder'),
      button: t('footer.newsletter.button'),
    },
    copyright: t('footer.copyright'),
    termsOfService: t('footer.termsOfService'),
    privacyPolicy: t('footer.privacyPolicy'),
    legalNotice: t('footer.legalNotice'),
  };
};
