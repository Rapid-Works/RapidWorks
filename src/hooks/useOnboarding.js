import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getCurrentUserContext } from '../utils/organizationService';
import { getOrganizationInfo } from '../utils/organizationService';
import { checkMIDFieldsCompletion } from '../utils/midFieldsChecker';
import { getUserMIDFormSubmissions } from '../services/midFormService';

/**
 * Hook to manage user onboarding progress
 * Tracks 5 tasks (step 6 walkthrough is temporarily hidden):
 * 1. Email Verification
 * 2. Organization Information
 * 3. Apply to MID
 * 4. Book a Free Coaching Call
 * 5. Invite Coworkers
 * 6. Platform Walkthrough (commented out)
 */
export const useOnboarding = () => {
  const { currentUser, sendVerificationEmail: sendVerificationEmailFromAuth } = useAuth();
  const [onboardingData, setOnboardingData] = useState({
    emailVerified: false,
    organizationCreated: false,
    midApplied: false,
    midSkipped: false,
    bookingCallCompleted: false,
    coworkersInvited: false, // Can be true, 'skipped', or false
    walkthroughCompleted: false,
    completedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [midFieldsStatus, setMidFieldsStatus] = useState({
    allFieldsFilled: false,
    missingFields: [],
    hasMIDSubmission: false,
    isLoading: true  // Add loading state for MID check
  });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Listen to onboarding document in real-time
    const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
    
    const unsubscribe = onSnapshot(onboardingRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setOnboardingData(data);
        
        // Calculate progress (now 5 steps instead of 6)
        const tasks = [
          data.emailVerified,
          data.organizationCreated,
          data.midApplied || data.midSkipped, // Either applied or skipped counts as completion
          data.bookingCallCompleted,
          data.coworkersInvited === true || data.coworkersInvited === 'skipped', // Either invited or skipped counts
          // data.walkthroughCompleted, // Commented out step 6
        ];
        const completedCount = tasks.filter(Boolean).length;
        setProgress(Math.round((completedCount / 5) * 100));
      } else {
        // Initialize onboarding document
        const initialData = {
          emailVerified: currentUser.emailVerified || false,
          organizationCreated: false,
          midApplied: false,
          midSkipped: false,
          bookingCallCompleted: false,
          coworkersInvited: false,
          walkthroughCompleted: false,
          completedAt: null,
          createdAt: new Date(),
        };
        setDoc(onboardingRef, initialData);
        setOnboardingData(initialData);
        setProgress(currentUser.emailVerified ? 25 : 0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Update email verification status from Firebase Auth
  useEffect(() => {
    if (!currentUser || loading) return;

    const updateEmailVerification = async () => {
      if (currentUser.emailVerified && !onboardingData.emailVerified) {
        const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
        await setDoc(onboardingRef, { emailVerified: true }, { merge: true });
      }
    };

    updateEmailVerification();
  }, [currentUser, currentUser?.emailVerified, onboardingData.emailVerified, loading]);

  // Check MID fields completion and submission status
  useEffect(() => {
    if (!currentUser || loading) {
      setMidFieldsStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const checkMIDStatus = async () => {
      setMidFieldsStatus(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Get user's organization context
        const userContext = await getCurrentUserContext(currentUser.uid);
        
        if (!userContext || userContext.type !== 'organization' || !userContext.organization?.id) {
          setMidFieldsStatus({
            allFieldsFilled: false,
            missingFields: Object.values(checkMIDFieldsCompletion(null, currentUser.email).missingFields),
            hasMIDSubmission: false,
            isLoading: false
          });
          return;
        }

        // Load organization data
        const orgData = await getOrganizationInfo(userContext.organization.id);
        
        // Auto-sync organizationCreated status for old users
        if (userContext.organization?.id && !onboardingData.organizationCreated) {
          console.log('🔄 Auto-syncing organizationCreated status for old user');
          const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
          await setDoc(onboardingRef, { organizationCreated: true }, { merge: true });
        }
        
        // Check MID fields completion
        const { allFieldsFilled, missingFields } = checkMIDFieldsCompletion(orgData, currentUser.email);
        
        // Check if user has MID submission (any status - submitted, pending, approved, etc.)
        const midSubmissions = await getUserMIDFormSubmissions(currentUser.uid);
        const hasMIDSubmission = midSubmissions.length > 0;
        
        setMidFieldsStatus({
          allFieldsFilled,
          missingFields,
          hasMIDSubmission,
          isLoading: false
        });

        // Update midApplied status if they have submitted
        if (hasMIDSubmission && !onboardingData.midApplied) {
          const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
          await setDoc(onboardingRef, { 
            midApplied: true,
            midAppliedAt: new Date().toISOString()
          }, { merge: true });
        } else if (!hasMIDSubmission && onboardingData.midApplied) {
          // Reset midApplied if they deleted all submissions
          const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
          await setDoc(onboardingRef, { 
            midApplied: false,
            midAppliedAt: null,
            callReminderSent: false
          }, { merge: true });
        }
      } catch (error) {
        console.error('Error checking MID status:', error);
        setMidFieldsStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkMIDStatus();
  }, [currentUser, loading, onboardingData.organizationCreated, onboardingData.midApplied]);

  const checkExistingInvites = useCallback(async () => {
    if (!currentUser) return false;

    try {
      // Get user's organization context
      const userContext = await getCurrentUserContext(currentUser.uid);
      
      if (!userContext || userContext.type !== 'organization' || !userContext.organization?.id) {
        return false;
      }

      // Check if organization has any pending invites
      const { getOrganizationInvites } = await import('../utils/organizationService');
      const invites = await getOrganizationInvites(userContext.organization.id);
      
      return invites && invites.length > 0;
    } catch (error) {
      console.error('Error checking existing invites:', error);
      return false;
    }
  }, [currentUser]);

  // Check for existing invites when organization is created
  useEffect(() => {
    if (!currentUser || loading || !onboardingData.organizationCreated) return;

    const checkInvites = async () => {
      const hasInvites = await checkExistingInvites();
      if (hasInvites && onboardingData.coworkersInvited !== true) {
        const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
        await setDoc(onboardingRef, { 
          coworkersInvited: true,
          coworkersInvitedAt: new Date().toISOString()
        }, { merge: true });
      }
    };

    checkInvites();
  }, [currentUser, loading, onboardingData.organizationCreated, onboardingData.coworkersInvited, checkExistingInvites]);

  const completedTasks = [
    onboardingData.emailVerified,
    onboardingData.organizationCreated,
    onboardingData.midApplied || onboardingData.midSkipped, // Either applied or skipped counts
    onboardingData.bookingCallCompleted,
    onboardingData.coworkersInvited === true || onboardingData.coworkersInvited === 'skipped', // Either invited or skipped counts
    // onboardingData.walkthroughCompleted, // Commented out step 6
  ].filter(Boolean).length;

  const isComplete = completedTasks === 5;

  const sendVerificationEmail = async () => {
    if (!currentUser || currentUser.emailVerified) {
      return { success: false, message: 'Already verified or no user' };
    }

    try {
      // Use SMTP-based verification email from AuthContext
      await sendVerificationEmailFromAuth(currentUser);
      return { success: true, message: 'Verification email sent!' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, message: error.message };
    }
  };

  const markTaskComplete = async (taskName) => {
    if (!currentUser) return;

    const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
    const updateData = { [taskName]: true };

    // If this is the last task, mark completion time
    const newCompletedCount = completedTasks + 1;
    if (newCompletedCount === 6) {
      updateData.completedAt = new Date();
    }

    await setDoc(onboardingRef, updateData, { merge: true });
  };

  const markTaskSkipped = async (taskName) => {
    if (!currentUser) return;

    const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
    const updateData = { [taskName]: 'skipped' };

    // If this is the last task, mark completion time
    const newCompletedCount = completedTasks + 1;
    if (newCompletedCount === 6) {
      updateData.completedAt = new Date();
    }

    await setDoc(onboardingRef, updateData, { merge: true });
  };

  const updateInviteStatus = async () => {
    if (!currentUser) return;

    try {
      const hasInvites = await checkExistingInvites();
      
      if (hasInvites && onboardingData.coworkersInvited !== true) {
        // Update from skipped/false to completed
        const onboardingRef = doc(db, 'userOnboarding', currentUser.uid);
        await setDoc(onboardingRef, { 
          coworkersInvited: true,
          coworkersInvitedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating invite status:', error);
    }
  };

  return {
    loading,
    progress,
    completedTasks,
    totalTasks: 5,
    isComplete,
    tasks: {
      emailVerified: onboardingData.emailVerified,
      organizationCreated: onboardingData.organizationCreated,
      midApplied: onboardingData.midApplied,
      midSkipped: onboardingData.midSkipped,
      bookingCallCompleted: onboardingData.bookingCallCompleted,
      coworkersInvited: onboardingData.coworkersInvited,
      walkthroughCompleted: onboardingData.walkthroughCompleted,
    },
    midFieldsStatus,
    sendVerificationEmail,
    markTaskComplete,
    markTaskSkipped,
    checkExistingInvites,
    updateInviteStatus,
  };
};
