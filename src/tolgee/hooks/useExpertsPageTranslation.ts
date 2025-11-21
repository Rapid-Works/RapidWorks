import { useTranslate } from '@tolgee/react';

/**
 * Hook for Experts (team_page) landing page translations
 * Returns translations in a structured format matching the original pageContent object
 */
export const useExpertsPageTranslation = () => {
  const { t } = useTranslate();

  return {
    pageTitle: t('experts.pageTitle'),
    hero: {
      title1: t('experts.hero.title1'),
      titleHighlight: t('experts.hero.titleHighlight'),
      title2: t('experts.hero.title2'),
      subtitle: t('experts.hero.subtitle'),
      scrollIndicatorAria: t('experts.hero.scrollIndicatorAria'),
    },
    benefits: {
      title: t('experts.benefits.title'),
      subtitle: t('experts.benefits.subtitle'),
      items: Array.from({ length: 6 }, (_, i) => ({
        text: t(`experts.benefits.items.${i}.text`),
        description: t(`experts.benefits.items.${i}.description`),
        // Only item 1 has a linkText
        ...(i === 1 ? { linkText: t('experts.benefits.items.1.linkText') } : {}),
      })),
      discoverMore: t('experts.benefits.discoverMore'),
    },
    cta: {
      title: t('experts.cta.title'),
      description: t('experts.cta.description'),
      buttonText: t('experts.cta.buttonText'),
    },
    team: {
      expertiseTitle: t('experts.team.expertiseTitle'),
      moreSkills: t('experts.team.moreSkills'),
      growingTitle: t('experts.team.growingTitle'),
      growingDescription: t('experts.team.growingDescription'),
      getNotified: t('experts.team.getNotified'),
      comingSoon: t('experts.team.comingSoon'),
      requestExpertButton: t('experts.team.requestExpertButton'),
      bookNowButton: t('experts.team.bookNowButton'),
    },
    modalContent: {
      title: t('experts.modalContent.title'),
      subtitle1: t('experts.modalContent.subtitle1'),
      subtitle2: t('experts.modalContent.subtitle2'),
      emailLabel: t('experts.modalContent.emailLabel'),
      emailPlaceholder: t('experts.modalContent.emailPlaceholder'),
      expertNeededLabel: t('experts.modalContent.expertNeededLabel'),
      successTitle: t('experts.modalContent.successTitle'),
      successMessage: t('experts.modalContent.successMessage'),
      submitButton: t('experts.modalContent.submitButton'),
      submittingButton: t('experts.modalContent.submittingButton'),
      defaultError: t('experts.modalContent.defaultError'),
      closeAriaLabel: t('experts.modalContent.closeAriaLabel'),
      getNotified: t('experts.modalContent.getNotified'),
      comingSoon: t('experts.modalContent.comingSoon'),
      requestExpertButton: t('experts.modalContent.requestExpertButton'),
      bookNowButton: t('experts.modalContent.bookNowButton'),
    },
    memberRoles: {
      'Marketing Expert': t('experts.memberRoles.Marketing Expert'),
      'Software Expert': t('experts.memberRoles.Software Expert'),
      'Design Expert': t('experts.memberRoles.Design Expert'),
      'Finance Expert': t('experts.memberRoles.Finance Expert'),
      'Data Analysis Expert': t('experts.memberRoles.Data Analysis Expert'),
      'AI Expert': t('experts.memberRoles.AI Expert'),
      'DevOps Expert': t('experts.memberRoles.DevOps Expert'),
      'Software Test Expert': t('experts.memberRoles.Software Test Expert'),
      'Database Expert': t('experts.memberRoles.Database Expert'),
      'Social Media Expert': t('experts.memberRoles.Social Media Expert'),
    },
    memberQuotes: {
      prince: t('experts.memberQuotes.prince'),
      samuel: t('experts.memberQuotes.samuel'),
      design: t('experts.memberQuotes.design'),
      finance: t('experts.memberQuotes.finance'),
      data: t('experts.memberQuotes.data'),
      ai: t('experts.memberQuotes.ai'),
      devops: t('experts.memberQuotes.devops'),
      test: t('experts.memberQuotes.test'),
      database: t('experts.memberQuotes.database'),
      social: t('experts.memberQuotes.social'),
    },
    memberExperienceSuffix: t('experts.memberExperienceSuffix'),
    testimonials: {
      badge: t('experts.testimonials.badge'),
      title: t('experts.testimonials.title'),
      subtitle: t('experts.testimonials.subtitle'),
    },
  };
};
