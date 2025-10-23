import React from 'react';
import VisibilityFormulaForm from './VisibilityFormulaForm';
import { LanguageProvider } from '../contexts/LanguageContext';
import { Analytics } from "@vercel/analytics/react"

function VisibilityFormulaFormPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50">
        <Analytics />
        <VisibilityFormulaForm />
      </div>
    </LanguageProvider>
  );
}

export default VisibilityFormulaFormPage;
