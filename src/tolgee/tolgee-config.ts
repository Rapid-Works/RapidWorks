import { Tolgee, DevTools } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';

export const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .init({
    language: 'de-DE', // Default language (matches Tolgee project)

    // Tolgee platform connection
    apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL,
    apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
    projectId: Number(process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID),

    // Available languages (must match Tolgee project language tags)
    availableLanguages: ['de-DE', 'en'],

    // Fallback language
    fallbackLanguage: 'de-DE',

    // Static data fallback (only used when API is unavailable)
    staticData: {
      'de-DE': () => import('./translations/de.json'),
      en: () => import('./translations/en.json'),
    },
  });
