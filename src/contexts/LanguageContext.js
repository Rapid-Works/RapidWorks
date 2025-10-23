'use client';

import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export { LanguageContext };

export const languages = {
  de: {
    welcome: {
      title: 'Willkommen zum Visibility Formula Fragebogen',
      description: 'Lass uns gemeinsam dein perfektes Branding erstellen.',
      start: 'Beginnen'
    },
    navigation: {
      back: 'Zurück',
      next: 'Weiter',
      submit: 'Formular absenden',
      submitting: 'Wird gesendet...'
    },
    nav: {
      bookCall: 'Termin buchen'
    },
    file: {
      dropzone: 'Klicken oder Datei hierher ziehen',
      browse: 'Durchsuchen',
      dragDrop: 'oder per Drag & Drop',
      maxSize: 'PNG, JPG, GIF bis zu 10MB'
    },
    success: {
      title: 'Vielen Dank!',
      message: 'Deine Antworten wurden erfolgreich übermittelt.'
    },
    // Add more translations here
  },
  en: {
    welcome: {
      title: 'Welcome to the Visibility Formula Questionnaire',
      description: 'Let\'s create your perfect branding together.',
      start: 'Start'
    },
    navigation: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit Form',
      submitting: 'Submitting...'
    },
    nav: {
      bookCall: 'Book a Call'
    },
    file: {
      dropzone: 'Click or drag file here',
      browse: 'Browse',
      dragDrop: 'or drag and drop',
      maxSize: 'PNG, JPG, GIF up to 10MB'
    },
    success: {
      title: 'Thank you!',
      message: 'Your answers have been successfully submitted.'
    },
    // Add more translations here
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('de');

  const value = {
    language,
    setLanguage,
    t: (key) => {
      const keys = key.split('.');
      return keys.reduce((obj, k) => obj?.[k], languages[language]) || key;
    },
    translate: (key) => {
      const keys = key.split('.');
      return keys.reduce((obj, k) => obj?.[k], languages[language]) || key;
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 