'use client';

import { Analytics } from '@vercel/analytics/react';
import { X } from "lucide-react"
import VisibilityFormulaForm from './VisibilityFormulaForm'
import { LanguageProvider } from '../contexts/LanguageContext'

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg w-full max-w-4xl mx-auto shadow-xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Form */}
          <div className="h-[80vh] overflow-y-auto">
            <LanguageProvider>
              <VisibilityFormulaForm />
            </LanguageProvider>
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default Modal; 