'use client';

import React, { useState } from 'react'
import NewsletterPopup from './NewsletterPopup'
import { useFooterTranslation } from '../tolgee/hooks/useFooterTranslation'

const NewsletterForm = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Use Tolgee translations
  const footerContent = useFooterTranslation()
  const content = footerContent.newsletter

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-light">{content.title}</h3>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder={content.placeholder}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#7C3BEC]"
            onFocus={() => setIsPopupOpen(true)}
            readOnly
          />
          <button
            onClick={() => setIsPopupOpen(true)}
            className="px-4 py-2 bg-[#7C3BEC] text-white rounded-md text-sm hover:bg-[#6929d4] transition-colors"
          >
            {content.button}
          </button>
        </div>
      </div>

      {isPopupOpen && (
        <NewsletterPopup 
          isOpen={isPopupOpen} 
          onClose={() => setIsPopupOpen(false)} 
        />
      )}
    </>
  )
}

export default NewsletterForm 