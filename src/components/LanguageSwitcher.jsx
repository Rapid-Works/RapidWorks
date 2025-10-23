'use client';

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-white rounded-full shadow-sm p-1">
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            language === 'de'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setLanguage('de')}
        >
          DE
        </button>
        <button
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            language === 'en'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher; 