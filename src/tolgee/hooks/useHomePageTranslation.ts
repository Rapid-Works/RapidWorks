import { useTranslate } from '@tolgee/react';

/**
 * Hook for Home Page translations (new_landing_page.jsx)
 * Returns structured translation object matching pageContent structure
 */
export const useHomePageTranslation = () => {
  const { t } = useTranslate();

  return {
    hero: {
      platform: t('homePage.hero.platform'),
      title1: t('homePage.hero.title1'),
      title2: t('homePage.hero.title2'),
      subtitle: t('homePage.hero.subtitle'),
      getStarted: t('homePage.hero.getStarted'),
      learnMore: t('homePage.hero.learnMore'),
      scrollIndicatorAria: t('homePage.hero.scrollIndicatorAria'),
    },
    whoWeAre: {
      title: t('homePage.whoWeAre.title'),
      description: t('homePage.whoWeAre.description'),
    },
    commonGround: {
      title: t('homePage.commonGround.title'),
      points: [
        {
          title: t('homePage.commonGround.points.0.title'),
          description: t('homePage.commonGround.points.0.description'),
          icon: '/images/landing_page_goal.png',
        },
        {
          title: t('homePage.commonGround.points.1.title'),
          description: t('homePage.commonGround.points.1.description'),
          icon: '/images/landing_page_bolt.png',
        },
        {
          title: t('homePage.commonGround.points.2.title'),
          description: t('homePage.commonGround.points.2.description'),
          icon: '/images/landing_page_gift.png',
        },
        {
          title: t('homePage.commonGround.points.3.title'),
          description: t('homePage.commonGround.points.3.description'),
          icon: '/images/landing_page_stack.png',
        },
        {
          title: t('homePage.commonGround.points.4.title'),
          description: t('homePage.commonGround.points.4.description'),
          icon: '/images/landing_page_security.png',
        },
        {
          title: t('homePage.commonGround.points.5.title'),
          description: t('homePage.commonGround.points.5.description'),
          icon: '/images/landing_page_brain.png',
        },
      ],
    },
    services: {
      title: t('homePage.services.title'),
      subtitle: t('homePage.services.subtitle'),
      rapidAnswers: {
        category: t('homePage.services.rapidAnswers.category'),
        title: t('homePage.services.rapidAnswers.title'),
        description: t('homePage.services.rapidAnswers.description'),
        learnMore: t('homePage.services.rapidAnswers.learnMore'),
        joinWebinar: t('homePage.services.rapidAnswers.joinWebinar'),
        nextWebinarPrefix: t('homePage.services.rapidAnswers.nextWebinarPrefix'),
      },
      branding: {
        category: t('homePage.services.branding.category'),
        title: t('homePage.services.branding.title'),
        description: t('homePage.services.branding.description'),
        learnMore: t('homePage.services.branding.learnMore'),
      },
      experts: {
        category: t('homePage.services.experts.category'),
        title: t('homePage.services.experts.title'),
        description: t('homePage.services.experts.description'),
        learnMore: t('homePage.services.experts.learnMore'),
      },
      partners: {
        category: t('homePage.services.partners.category'),
        title: t('homePage.services.partners.title'),
        description: t('homePage.services.partners.description'),
        learnMore: t('homePage.services.partners.learnMore'),
      },
      coaching: {
        category: t('homePage.services.coaching.category'),
        title: t('homePage.services.coaching.title'),
        description: t('homePage.services.coaching.description'),
        learnMore: t('homePage.services.coaching.learnMore'),
      },
      workshops: {
        category: t('homePage.services.workshops.category'),
        title: t('homePage.services.workshops.title'),
        description: t('homePage.services.workshops.description'),
        learnMore: t('homePage.services.workshops.learnMore'),
      },
      financing: {
        title: t('homePage.services.financing.title'),
        description: t('homePage.services.financing.description'),
        learnMore: t('homePage.services.financing.learnMore'),
        freeConsultation: t('homePage.services.financing.freeConsultation'),
      },
    },
    financingSection: {
      title: t('homePage.financingSection.title'),
      subtitle: t('homePage.financingSection.subtitle'),
    },
    bundle: {
      title: t('homePage.bundle.title'),
      description: t('homePage.bundle.description'),
      financingNote: t('homePage.bundle.financingNote'),
      getBundle: t('homePage.bundle.getBundle'),
    },
    cta: {
      title: t('homePage.cta.title'),
      description: t('homePage.cta.description'),
      bookCall: t('homePage.cta.bookCall'),
    },
    modal: {
      title: t('homePage.modal.title'),
      loadingText: t('homePage.modal.loadingText'),
    },
    testimonialSection: {
      badge: t('homePage.testimonialSection.badge'),
      title: t('homePage.testimonialSection.title'),
      subtitle: t('homePage.testimonialSection.subtitle'),
    },
  };
};
