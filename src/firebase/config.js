'use client';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add Firebase Storage
import { getFunctions } from "firebase/functions"; // Add this line
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
// Using hardcoded values for now to test
const firebaseConfig = {
  apiKey: "AIzaSyDoIexsBB5I8ylX2t2N4fxVjVcsst71c5Y",
  authDomain: "landingpage-606e9.firebaseapp.com",
  projectId: "landingpage-606e9",
  storageBucket: "landingpage-606e9.firebasestorage.app",
  messagingSenderId: "449487247565",
  appId: "1:449487247565:web:7bf02a5898cb57a13cb184",
  measurementId: "G-7SZ0GLF9L1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize Analytics with error handling (can fail on mobile with ad blockers)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('⚠️ Firebase Analytics failed to initialize (non-critical):', error.message);
  analytics = null;
}
export { analytics };

// Initialize Messaging with proper browser support detection
let messaging = null;

// Enhanced mobile browser detection and FCM bypassing
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isMobileSafari = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
const isInAppBrowser = () => /FBAN|FBAV|Instagram|Twitter|LinkedIn|WhatsApp/i.test(navigator.userAgent);

// Check if we're in a browser environment and if messaging is supported
const initializeMessaging = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Skip FCM initialization on mobile browsers to prevent white screens
  if (isMobile()) {
    if (isInAppBrowser()) {
      return;
    }
    
    if (isMobileSafari() && !isStandalone()) {
      return;
    }
    
    if (!isStandalone()) {
      return;
    }
  }

  try {
    // Check if the browser supports Firebase Messaging
    const { isSupported } = await import('firebase/messaging');
    const messagingSupported = await isSupported();
    
    if (!messagingSupported) {
      return;
    }

    // Check if required APIs are available
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    messaging = getMessaging(app);
  } catch (error) {
    console.warn('⚠️ Firebase Messaging initialization failed (non-critical):', error.message);
    messaging = null;
  }
};

// Initialize messaging asynchronously to avoid blocking app startup
if (typeof window !== 'undefined') {
  initializeMessaging().catch(error => {
    console.warn('⚠️ Async messaging initialization failed:', error.message);
  });
}

export { messaging };

export default app;
