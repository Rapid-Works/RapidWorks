'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import customerNotificationService from '@/utils/customerNotificationService';

/**
 * Component that automatically registers user for notifications
 * when they log in and have already granted browser permission
 */
export default function AutoNotificationRegistration() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.email) return;

    const registerNotificationsAutomatically = async () => {
      try {
        // Check if user already has FCM tokens
        const tokenCheck = await customerNotificationService.checkUserHasNotificationTokens(currentUser.email);
        
        if (tokenCheck.hasTokens) {
          return;
        }

        // Check browser permission status
        if (!('Notification' in window)) {
          return;
        }

        const permission = Notification.permission;
        
        if (permission === 'granted') {
          // User has already granted permission, register silently
          const result = await customerNotificationService.ensureNotificationsEnabled();
          
          if (result.enabled) {
            console.log('Auto-registered for notifications');
          }
        }
      } catch (error) {
        console.error('Error auto-registering notifications:', error);
      }
    };

    // Run the check after a short delay to ensure app is fully loaded
    const timeoutId = setTimeout(registerNotificationsAutomatically, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [currentUser]);

  // This component doesn't render anything
  return null;
}
