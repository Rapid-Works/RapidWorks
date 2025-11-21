import { useTranslate } from '@tolgee/react';

/**
 * Hook for Coaching landing page (coaching.jsx) translations
 * Returns translations in a structured format matching the original pageContent object
 */
export const useCoachingLandingPageTranslation = () => {
  const { t } = useTranslate();

  return {
    pageBadge: t('coachingPage.pageBadge'),
    heroTitle: t('coachingPage.heroTitle'),
    heroHighlight: t('coachingPage.heroHighlight'),
    heroSubtitle: t('coachingPage.heroSubtitle'),
    scrollIndicatorAria: t('coachingPage.scrollIndicatorAria'),
    whySection: {
      title: t('coachingPage.whySection.title'),
      description: t('coachingPage.whySection.description'),
      ctaButton: t('coachingPage.whySection.ctaButton'),
    },
    coachSection: {
      title: t('coachingPage.coachSection.title'),
      subtitle: t('coachingPage.coachSection.subtitle'),
      coachRole: t('coachingPage.coachSection.coachRole'),
      coachBio: t('coachingPage.coachSection.coachBio'),
      achievementsTitle: t('coachingPage.coachSection.achievementsTitle'),
      expertiseTitle: t('coachingPage.coachSection.expertiseTitle'),
      education: t('coachingPage.coachSection.education'),
      experience: t('coachingPage.coachSection.experience'),
      ctaButton: t('coachingPage.coachSection.ctaButton'),
      badgeText: t('coachingPage.coachSection.badgeText'),
      subtext: t('coachingPage.coachSection.subtext'),
    },
    howItWorks: {
      title: t('coachingPage.howItWorks.title'),
      subtitle: t('coachingPage.howItWorks.subtitle'),
      steps: [
        {
          title: t('coachingPage.howItWorks.steps.0.title'),
          description: t('coachingPage.howItWorks.steps.0.description'),
        },
        {
          title: t('coachingPage.howItWorks.steps.1.title'),
          description: t('coachingPage.howItWorks.steps.1.description'),
        },
        {
          title: t('coachingPage.howItWorks.steps.2.title'),
          description: t('coachingPage.howItWorks.steps.2.description'),
        },
        {
          title: t('coachingPage.howItWorks.steps.3.title'),
          description: t('coachingPage.howItWorks.steps.3.description'),
        },
      ],
      ctaButton: t('coachingPage.howItWorks.ctaButton'),
      badgeText: t('coachingPage.howItWorks.badgeText'),
      subtext: t('coachingPage.howItWorks.subtext'),
    },
    expertise: {
      productStrategy: t('coachingPage.expertise.productStrategy'),
      processOptimization: t('coachingPage.expertise.processOptimization'),
      marketValidation: t('coachingPage.expertise.marketValidation'),
      growthHacking: t('coachingPage.expertise.growthHacking'),
      teamBuilding: t('coachingPage.expertise.teamBuilding'),
      fundraising: t('coachingPage.expertise.fundraising'),
    },
    achievements: {
      recruited: t('coachingPage.achievements.recruited'),
      servedCustomers: t('coachingPage.achievements.servedCustomers'),
      scaledStartups: t('coachingPage.achievements.scaledStartups'),
      coachedStartups: t('coachingPage.achievements.coachedStartups'),
    },
    testimonials: {
      badge: t('coachingPage.testimonials.badge'),
      title: t('coachingPage.testimonials.title'),
      subtitle: t('coachingPage.testimonials.subtitle'),
    },
  };
};
