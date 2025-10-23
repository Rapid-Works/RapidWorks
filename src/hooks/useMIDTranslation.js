import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { midTranslations } from '../translations/midTranslations';

export const useMIDTranslation = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    console.error('useMIDTranslation must be used within a LanguageContext provider');
    // Fallback to English if context is not available
    return {
      language: 'en',
      t: (key) => getNestedTranslation(midTranslations.en, key) || key
    };
  }

  const { language } = context;
  
  const t = (key) => {
    const translation = getNestedTranslation(midTranslations[language] || midTranslations.en, key);
    return translation || key;
  };

  return { language, t };
};

// Helper function to get nested translation values
const getNestedTranslation = (obj, key) => {
  return key.split('.').reduce((o, k) => (o || {})[k], obj);
};
