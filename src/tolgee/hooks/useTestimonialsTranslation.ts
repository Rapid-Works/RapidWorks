import { useTranslate } from '@tolgee/react';

/**
 * Hook for testimonials translations
 * Returns translated testimonials data
 */
export const useTestimonialsTranslation = () => {
  const { t } = useTranslate();

  return [
    {
      id: 1,
      quote: t('testimonials.1.quote'),
      authorName: t('testimonials.1.authorName'),
      authorTitle: t('testimonials.1.authorTitle'),
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      companyLogoUrl: null,
      services: ["financing", "branding", "coaching", "experts"],
      isFeatured: true,
    },
    {
      id: 2,
      quote: t('testimonials.2.quote'),
      authorName: t('testimonials.2.authorName'),
      authorTitle: t('testimonials.2.authorTitle'),
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      companyLogoUrl: null,
      services: ["branding"],
      isFeatured: true,
    },
    {
      id: 3,
      quote: t('testimonials.3.quote'),
      authorName: t('testimonials.3.authorName'),
      authorTitle: t('testimonials.3.authorTitle'),
      imageUrl: null,
      companyLogoUrl: null,
      services: ["coaching"],
      isFeatured: true,
    },
    {
      id: 4,
      quote: t('testimonials.4.quote'),
      authorName: t('testimonials.4.authorName'),
      authorTitle: t('testimonials.4.authorTitle'),
      imageUrl: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      companyLogoUrl: null,
      services: ["financing"],
      isFeatured: false,
    },
    {
      id: 5,
      quote: t('testimonials.5.quote'),
      authorName: t('testimonials.5.authorName'),
      authorTitle: t('testimonials.5.authorTitle'),
      imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      companyLogoUrl: null,
      services: ["experts"],
      isFeatured: false,
    },
    {
      id: 6,
      quote: t('testimonials.6.quote'),
      authorName: t('testimonials.6.authorName'),
      authorTitle: t('testimonials.6.authorTitle'),
      imageUrl: null,
      companyLogoUrl: null,
      services: ["branding"],
      isFeatured: false,
      projectShowcaseImage: "/images/vitera_vb.png"
    },
    {
      id: 7,
      quote: t('testimonials.7.quote'),
      authorName: t('testimonials.7.authorName'),
      authorTitle: t('testimonials.7.authorTitle'),
      imageUrl: null,
      companyLogoUrl: null,
      services: ["branding"],
      isFeatured: false,
      projectShowcaseImage: "/images/leila_vb.png"
    },
  ];
};
