import { useTranslate } from '@tolgee/react';

/**
 * Hook for Coaching/MVP page translations
 * Returns translations in a structured format matching the original translations object
 */
export const useCoachingPageTranslation = () => {
  const { t } = useTranslate();

  return {
    nav: {
      services: t('coaching.nav.services'),
      approach: t('coaching.nav.approach'),
      contact: t('coaching.nav.contact'),
      getStarted: t('coaching.nav.getStarted'),
      impressum: t('coaching.nav.impressum'),
    },
    hero: {
      title: t('coaching.hero.title'),
      subtitle: t('coaching.hero.subtitle'),
      cta: t('coaching.hero.cta'),
    },
    services: {
      title: t('coaching.services.title'),
      subtitle: t('coaching.services.subtitle'),
      strategic: {
        title: t('coaching.services.strategic.title'),
        description: t('coaching.services.strategic.description'),
        features: [
          t('coaching.services.strategic.features.0'),
          t('coaching.services.strategic.features.1'),
          t('coaching.services.strategic.features.2'),
        ],
      },
      development: {
        title: t('coaching.services.development.title'),
        description: t('coaching.services.development.description'),
        features: [
          t('coaching.services.development.features.0'),
          t('coaching.services.development.features.1'),
          t('coaching.services.development.features.2'),
        ],
      },
      funding: {
        title: t('coaching.services.funding.title'),
        description: t('coaching.services.funding.description'),
        features: [
          t('coaching.services.funding.features.0'),
          t('coaching.services.funding.features.1'),
          t('coaching.services.funding.features.2'),
        ],
        specialNote: t('coaching.services.funding.specialNote'),
      },
    },
    approach: {
      title: t('coaching.approach.title'),
      subtitle: t('coaching.approach.subtitle'),
      steps: {
        discovery: {
          title: t('coaching.approach.steps.discovery.title'),
          description: t('coaching.approach.steps.discovery.description'),
        },
        development: {
          title: t('coaching.approach.steps.development.title'),
          description: t('coaching.approach.steps.development.description'),
        },
        delivery: {
          title: t('coaching.approach.steps.delivery.title'),
          description: t('coaching.approach.steps.delivery.description'),
        },
      },
    },
    why: {
      title: t('coaching.why.title'),
      subtitle: t('coaching.why.subtitle'),
      features: {
        founders: {
          title: t('coaching.why.features.founders.title'),
          description: t('coaching.why.features.founders.description'),
        },
        speed: {
          title: t('coaching.why.features.speed.title'),
          description: t('coaching.why.features.speed.description'),
        },
        risk: {
          title: t('coaching.why.features.risk.title'),
          description: t('coaching.why.features.risk.description'),
        },
        funding: {
          title: t('coaching.why.features.funding.title'),
          description: t('coaching.why.features.funding.description'),
        },
      },
    },
    postMVP: {
      title: t('coaching.postMVP.title'),
      subtitle: t('coaching.postMVP.subtitle'),
      features: {
        hours: {
          title: t('coaching.postMVP.features.hours.title'),
          description: t('coaching.postMVP.features.hours.description'),
        },
        developer: {
          title: t('coaching.postMVP.features.developer.title'),
          description: t('coaching.postMVP.features.developer.description'),
        },
        payment: {
          title: t('coaching.postMVP.features.payment.title'),
          description: t('coaching.postMVP.features.payment.description'),
        },
      },
    },
    contact: {
      title: t('coaching.contact.title'),
      subtitle: t('coaching.contact.subtitle'),
      form: {
        name: t('coaching.contact.form.name'),
        email: t('coaching.contact.form.email'),
        idea: t('coaching.contact.form.idea'),
        submit: t('coaching.contact.form.submit'),
        terms: t('coaching.contact.form.terms'),
        termsLink: t('coaching.contact.form.termsLink'),
        and: t('coaching.contact.form.and'),
        privacyLink: t('coaching.contact.form.privacyLink'),
      },
    },
    footer: {
      copyright: t('coaching.footer.copyright'),
      terms: t('coaching.footer.terms'),
      privacy: t('coaching.footer.privacy'),
    },
    impressum: {
      title: t('coaching.impressum.title'),
      companyInfo: {
        title: t('coaching.impressum.companyInfo.title'),
        name: t('coaching.impressum.companyInfo.name'),
        street: t('coaching.impressum.companyInfo.street'),
        city: t('coaching.impressum.companyInfo.city'),
        country: t('coaching.impressum.companyInfo.country'),
        email: t('coaching.impressum.companyInfo.email'),
        phone: t('coaching.impressum.companyInfo.phone'),
        managing: t('coaching.impressum.companyInfo.managing'),
        managingName: t('coaching.impressum.companyInfo.managingName'),
      },
      registration: {
        title: t('coaching.impressum.registration.title'),
        court: t('coaching.impressum.registration.court'),
        number: t('coaching.impressum.registration.number'),
        vatId: t('coaching.impressum.registration.vatId'),
      },
      responsibility: {
        title: t('coaching.impressum.responsibility.title'),
        name: t('coaching.impressum.responsibility.name'),
        address: t('coaching.impressum.responsibility.address'),
      },
    },
  };
};
