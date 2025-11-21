'use client';

import React from 'react'
import Link from 'next/link'
import NewsletterForm from './NewsletterForm'
import { useFooterTranslation } from '../tolgee/hooks/useFooterTranslation'

const Footer = ({ showFAQ = false, onFAQClick }) => {
  // Use Tolgee translations
  const content = useFooterTranslation()

  return (
    <>
      <footer className="bg-[#1D0D37] text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12">
            {/* Newsletter Section */}
            <div className="max-w-md">
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400">
                {content.copyright}
              </div>
              <div className="flex gap-6">
                <Link href="/agb"
                  className="text-gray-400 hover:text-[#7C3BEC] transition-colors"
                >
                  {content.termsOfService}
                </Link>
                <Link href="/datenschutz"
                  className="text-gray-400 hover:text-[#7C3BEC] transition-colors"
                >
                  {content.privacyPolicy}
                </Link>
                <Link href="/impressum"
                  className="text-gray-400 hover:text-[#7C3BEC] transition-colors"
                >
                  {content.legalNotice}
                </Link>
                {showFAQ && (
                  <button
                    onClick={onFAQClick}
                    className="text-gray-400 hover:text-[#7C3BEC] transition-colors"
                  >
                    FAQ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer 