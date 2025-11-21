'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, functions } from '../firebase/config';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import notificationInitService from '../utils/notificationInitService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  // Create or update user document in Firestore
  const ensureUserDocument = useCallback(async (user, isNewUser = false) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);

      // Check if user document exists to determine if we should set createdAt
      const userDoc = await getDoc(userRef);
      const isFirstTimeUser = !userDoc.exists();

      const userData = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      // Only set createdAt for new users (first time document creation)
      if (isFirstTimeUser || isNewUser) {
        userData.createdAt = serverTimestamp();
      }

      await setDoc(userRef, userData, { merge: true }); // merge: true preserves existing fields like currentOrganizationId


    } catch (error) {

    }
  }, [db]);

  // Sign up with email and password
  async function signup(email, password, displayName = null) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(userCredential.user, true); // true = new user
    
    // Update displayName if provided (for firstName/lastName from registration)
    if (displayName) {
      await updateUserProfile(userCredential.user, { displayName });
      // Reload user to get updated displayName
      await userCredential.user.reload();
    }
    
    // Send verification email automatically on signup (now with displayName if provided)
    try {
      
      await sendVerificationEmail(userCredential.user);
      
    } catch (emailError) {

      // Don't fail signup if email sending fails
    }
    
    return userCredential;
  }

  // Sign in with email and password
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(userCredential.user);
    return userCredential;
  }

  // Sign in with Google
  async function loginWithGoogle() {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(userCredential.user);
    return userCredential;
  }

  // Logout
  function logout() {
    // Clear dashboard tab preference on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboardActiveTab');
    }
    return signOut(auth);
  }

  // Rate limiting for email verification
  const emailVerificationCooldown = new Map();
  const VERIFICATION_COOLDOWN_MS = 60000; // 1 minute

  // Send email verification using custom function with rate limiting
  async function sendVerificationEmail(user) {
    
    
    // Development bypass for rate limiting
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' ||
                         window.location.hostname.includes('127.0.0.1');
    
    // Check rate limiting (skip in development)
    if (!isDevelopment) {
      const now = Date.now();
      const lastSent = emailVerificationCooldown.get(user.email);
      
      if (lastSent && (now - lastSent) < VERIFICATION_COOLDOWN_MS) {
        const remainingTime = Math.ceil((VERIFICATION_COOLDOWN_MS - (now - lastSent)) / 1000);
        const error = new Error(`Please wait ${remainingTime} seconds before requesting another verification email`);
        error.code = 'auth/too-many-requests';
        error.isRateLimit = true;
        throw error;
      }
    } else {
      
    }
    
    try {
      // Check if functions are available
      if (!functions) {
        
        throw new Error('Functions not available');
      }
      
      
      
      // Set rate limit before attempting (if not in development)
      if (!isDevelopment) {
        const now = Date.now();
        emailVerificationCooldown.set(user.email, now);
      }
      
      // Use our custom Cloud Function for SMTP-based verification emails
      const sendCustomEmailVerification = httpsCallable(functions, 'sendCustomEmailVerification');
      const result = await sendCustomEmailVerification({ 
        email: user.email,
        displayName: user.displayName 
      });
      
      return result.data;
    } catch (error) {
      
      
      
      // Provide user-friendly error messages
      if (error.code === 'auth/too-many-requests' || error.isRateLimit) {
        const enhancedError = new Error('Too many verification emails sent. Please wait a few minutes before trying again.');
        enhancedError.code = 'auth/too-many-requests';
        enhancedError.isRateLimit = true;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  // Reset password using custom function
  async function resetPassword(email) {
    
    
    try {
      // Check if functions are available
      if (!functions) {
        
        throw new Error('Functions not available');
      }
      
      
      // Use our custom Cloud Function for branded password reset emails
      const sendCustomPasswordReset = httpsCallable(functions, 'sendCustomPasswordReset');
      const result = await sendCustomPasswordReset({ email });
      
      return result.data;
    } catch (error) {
      
      
      
      // Fallback to Firebase default if our custom function fails
      
      try {
        const fallbackResult = await sendPasswordResetEmail(auth, email);
        
        return fallbackResult;
      } catch (fallbackError) {
        
        throw fallbackError;
      }
    }
  }

  // Update user profile
  function updateUserProfile(user, profile) {
    return updateProfile(user, profile);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Set loading to false immediately to prevent blank screens
      setLoading(false);
      
      // Run background tasks after UI is rendered
      if (user) {
        // Run these in the background without blocking UI
        setTimeout(async () => {
          try {
            await ensureUserDocument(user);
            await notificationInitService.initializeForUser(user, true);
          } catch (error) {
            
          }
        }, 0);
      } else {
        // Reset notification service when user logs out
        notificationInitService.reset();
      }
    });

    return unsubscribe;
  }, [ensureUserDocument]);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    sendVerificationEmail,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 