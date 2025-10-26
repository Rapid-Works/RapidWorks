'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
// import AIAssistantChatbot from '@/components/AIAssistantChatbot';
import AutoNotificationRegistration from '@/components/AutoNotificationRegistration';

/**
 * Client-side Providers Component
 * Wraps the app with necessary context providers and global components
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith('/dashboard') || false;

  return (
    <AuthProvider>
      <NotificationProvider>
        <AutoNotificationRegistration />
        <LanguageProvider>
          <ScrollToTop />
          {children}
          {/* {!isDashboardPage && <AIAssistantChatbot />} */}
          {!isDashboardPage && <Footer onFAQClick={() => {}} />}
          <CookieConsent />
        </LanguageProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
