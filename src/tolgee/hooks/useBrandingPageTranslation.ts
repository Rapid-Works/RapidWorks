import { useTranslate } from '@tolgee/react';

/**
 * Hook for Branding landing page translations
 * Returns translations in a structured format matching the original pageContent object
 */
export const useBrandingPageTranslation = () => {
  const { t } = useTranslate();

  return {
    hero: {
      badgeText: t('branding.hero.badgeText'),
      title: t('branding.hero.title'),
      subtitle: t('branding.hero.subtitle'),
      scrollIndicatorAria: t('branding.hero.scrollIndicatorAria'),
      backgroundAlt: t('branding.hero.backgroundAlt'),
    },
    mainText: t('branding.mainText'),
    keyPoints: [
      t('branding.keyPoints.0'),
      t('branding.keyPoints.1'),
      t('branding.keyPoints.2'),
      t('branding.keyPoints.3'),
      t('branding.keyPoints.4'),
    ],
    subtext: t('branding.subtext'),
    cta: t('branding.cta'),
    seeMore: t('branding.seeMore'),
    bundleLabel: t('branding.bundleLabel'),
    nav: {
      mvpDev: t('branding.nav.mvpDev'),
      visibilityBundle: t('branding.nav.visibilityBundle'),
      bookCall: t('branding.nav.bookCall'),
    },
    bundleItems: {
      website: {
        title: t('branding.bundleItems.website.title'),
        description: t('branding.bundleItems.website.description'),
      },
      qrCode: {
        title: t('branding.bundleItems.qrCode.title'),
        description: t('branding.bundleItems.qrCode.description'),
      },
      socialMedia: {
        title: t('branding.bundleItems.socialMedia.title'),
        description: t('branding.bundleItems.socialMedia.description'),
      },
      stationery: {
        title: t('branding.bundleItems.stationery.title'),
        description: t('branding.bundleItems.stationery.description'),
      },
      wallpapers: {
        title: t('branding.bundleItems.wallpapers.title'),
        description: t('branding.bundleItems.wallpapers.description'),
      },
      rollup: {
        title: t('branding.bundleItems.rollup.title'),
        description: t('branding.bundleItems.rollup.description'),
      },
      apparel: {
        title: t('branding.bundleItems.apparel.title'),
        description: t('branding.bundleItems.apparel.description'),
      },
    },
    faq: {
      title: t('branding.faq.title'),
      showAll: t('branding.faq.showAll'),
      items: Array.from({ length: 13 }, (_, i) => ({
        question: t(`branding.faq.items.${i}.question`),
        answer: t(`branding.faq.items.${i}.answer`),
      })),
    },
    mvp: {
      title: t('branding.mvp.title'),
      description: t('branding.mvp.description'),
      cta: t('branding.mvp.cta'),
      weeks: t('branding.mvp.weeks'),
    },
    finalCta: {
      title: t('branding.finalCta.title'),
      subtitle: t('branding.finalCta.subtitle'),
      cta: t('branding.finalCta.cta'),
    },
    howItWorks: {
      title: t('branding.howItWorks.title'),
      steps: Array.from({ length: 3 }, (_, i) => ({
        title: t(`branding.howItWorks.steps.${i}.title`),
        description: t(`branding.howItWorks.steps.${i}.description`),
      })),
    },
    features: {
      title: t('branding.features.title'),
      subtitle: t('branding.features.subtitle'),
    },
    inhalt: {
      badge: t('branding.inhalt.badge'),
      title: t('branding.inhalt.title'),
      description: t('branding.inhalt.description'),
    },
    cookies: {
      banner: {
        title: t('branding.cookies.banner.title'),
        description: t('branding.cookies.banner.description'),
        privacy: t('branding.cookies.banner.privacy'),
        privacyLink: t('branding.cookies.banner.privacyLink'),
        acceptAll: t('branding.cookies.banner.acceptAll'),
        adjustSettings: t('branding.cookies.banner.adjustSettings'),
        decline: t('branding.cookies.banner.decline'),
      },
      modal: {
        title: t('branding.cookies.modal.title'),
        necessary: {
          title: t('branding.cookies.modal.necessary.title'),
          status: t('branding.cookies.modal.necessary.status'),
          description: t('branding.cookies.modal.necessary.description'),
        },
        analytics: {
          title: t('branding.cookies.modal.analytics.title'),
          description: t('branding.cookies.modal.analytics.description'),
        },
        marketing: {
          title: t('branding.cookies.modal.marketing.title'),
          description: t('branding.cookies.modal.marketing.description'),
        },
        savePreferences: t('branding.cookies.modal.savePreferences'),
        decline: t('branding.cookies.modal.decline'),
      },
    },
    process: {
      title: t('branding.process.title'),
      steps: Array.from({ length: 4 }, (_, i) => ({
        title: t(`branding.process.steps.${i}.title`),
        description: t(`branding.process.steps.${i}.description`),
      })),
    },
    pricing: {
      title: t('branding.pricing.title'),
      subtitle: t('branding.pricing.subtitle'),
      price: t('branding.pricing.price'),
      whatYouGet: t('branding.pricing.whatYouGet'),
      items: Array.from({ length: 6 }, (_, i) => t(`branding.pricing.items.${i}`)),
      cta: t('branding.pricing.cta'),
      editableFiles: {
        title: t('branding.pricing.editableFiles.title'),
        description: t('branding.pricing.editableFiles.description'),
      },
      flexibleAdjustments: {
        description: t('branding.pricing.flexibleAdjustments.description'),
      },
      allInclusiveAlt: t('branding.pricing.allInclusiveAlt'),
      professionalAlt: t('branding.pricing.professionalAlt'),
      backgroundAlt: t('branding.pricing.backgroundAlt'),
    },
    benefits: {
      badge: t('branding.benefits.badge'),
      title: t('branding.benefits.title'),
      items: Array.from({ length: 4 }, (_, i) => ({
        title: t(`branding.benefits.items.${i}.title`),
        description: t(`branding.benefits.items.${i}.description`),
      })),
    },
    faqSection: {
      title: t('branding.faqSection.title'),
      showAll: t('branding.faqSection.showAll'),
    },
    exploreMore: {
      badge: t('branding.exploreMore.badge'),
      title: t('branding.exploreMore.title'),
      description: t('branding.exploreMore.description'),
      cta: t('branding.exploreMore.cta'),
    },
    testimonials: {
      badge: t('branding.testimonials.badge'),
      title: t('branding.testimonials.title'),
      subtitle: t('branding.testimonials.subtitle'),
    },
    newsletter: {
      title: t('branding.newsletter.title'),
      placeholder: t('branding.newsletter.placeholder'),
      button: t('branding.newsletter.button'),
    },
    learnMore: t('branding.learnMore'),
    team: {
      expertise: t('branding.team.expertise'),
    },
  };
};
