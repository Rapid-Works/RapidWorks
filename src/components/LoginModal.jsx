'use client';

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { isTestEmail } from '../services/midFormService';
import { useAuthTranslation } from '../tolgee/hooks/useAuthTranslation';

const LoginModal = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  context: modalContext = 'general', // 'task', 'branding', 'general'
  redirectTo = '/dashboard' 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(modalContext === 'task' || modalContext === 'branding');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmailNotVerified, setShowEmailNotVerified] = useState(false);
  const { login, signup, loginWithGoogle, sendVerificationEmail, updateUserProfile } = useAuth();
  const router = useRouter();
  const context = useLanguage();
  const language = context?.language || 'en';
  const { t } = useAuthTranslation();

  // Get title and subtitle based on context
  const getTitle = () => {
    if (isSignup) {
      return t('createAccount');
    }
    return modalContext === 'task' || modalContext === 'branding' ? t('accountNeeded') : t('signIntoAccount');
  };

  const getSubtitle = () => {
    if (isSignup) {
      if (modalContext === 'task') return t('createAccountTask');
      if (modalContext === 'branding') return t('createAccountBranding');
      return t('joinRapidWorks');
    }
    if (modalContext === 'task') return t('accountNeededTaskSubtitle');
    if (modalContext === 'branding') return t('accountNeededBrandingSubtitle');
    return t('accessDashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup && (!email || !password || !firstName || !lastName)) {
      setError(t('fillAllFields'));
      return;
    }

    if (!isSignup && (!email || !password)) {
      setError(t('fillAllFields'));
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    // Client-side password validation for signup
    if (isSignup && password.length < 6) {
      setError(t('passwordRequirement'));
      return;
    }

    // Email format validation - check for test emails first
    if (isTestEmail(email)) {
      setError('Test email addresses are not allowed. Please use a valid business email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setError('');
      setLoading(true);

      let result;

      if (isSignup) {
        // Server-side validation for disposable/MX
        try {
          const { httpsCallable } = await import('firebase/functions');
          const { functions } = await import('../firebase/config');
          const validateEmailDomain = httpsCallable(functions, 'validateEmailDomain');
          const resp = await validateEmailDomain({ email });
          if (!resp?.data?.valid) {
            throw new Error(resp?.data?.reason || 'Email not allowed');
          }
        } catch (serverCheckErr) {
          setLoading(false);
          setError(serverCheckErr.message || 'Email validation failed');
          return;
        }

        // Pass displayName to signup so it's set before email verification is sent
        const displayName = firstName && lastName ? `${firstName} ${lastName}` : null;
        result = await signup(email, password, displayName);
        
        // Show success message instead of redirecting
        setShowSuccess(true);
        setLoading(false);
        return;
      } else {
        result = await login(email, password);
        
        // Check if email is verified - block login if not verified
        if (result.user && !result.user.emailVerified) {
          setError(currentLabels.emailNotVerifiedLogin);
          setLoading(false);
          return;
        }
        
        // Call success callback or navigate to dashboard
        if (onLoginSuccess) {
          onLoginSuccess(result);
        } else {
          router.push(redirectTo);
        }
      }
      
      // Close modal after navigation
      onClose();
    } catch (error) {
      // Handle Firebase authentication errors with descriptive messages
      let errorMessage;
      
      if (isSignup) {
        switch (error.code) {
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters long';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again';
            break;
          default:
            errorMessage = 'Failed to create account. Please try again';
        }
      } else {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again';
            break;
          case 'auth/email-not-verified':
            setShowEmailNotVerified(true);
            setError('');
            setLoading(false);
            return;
          default:
            errorMessage = 'Failed to log in. Please check your credentials';
        }
      }
      
      setError(errorMessage);
      console.error(isSignup ? 'Signup error:' : 'Login error:', error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const user = await loginWithGoogle();
      
      // Call success callback or navigate
      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        router.push(redirectTo);
      }
      
      onClose();
    } catch (error) {
      // Handle Google login errors with descriptive messages
      let errorMessage;
      
      switch (error.code) {
        case 'auth/cancelled-popup-request':
          errorMessage = 'Login cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups and try again';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Login cancelled by user';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method';
          break;
        default:
          errorMessage = 'Failed to log in with Google. Please try again';
      }
      
      setError(errorMessage);
      console.error('Google login error:', error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    setShowSuccess(false);
    setShowEmailNotVerified(false);
    // Reset to appropriate mode based on context
    setIsSignup(modalContext === 'task' || modalContext === 'branding');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setConfirmPassword('');
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Create a temporary user object with the email
      const tempUser = { email };
      await sendVerificationEmail(tempUser);
      
      setShowEmailNotVerified(false);
      setShowSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('Failed to send verification email. Please try again.');
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.6)'}}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 mx-4 relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {!showSuccess && (
          <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {getSubtitle()}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {showSuccess ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-lg mb-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {t('signupSuccess')}
              </h3>
              <p className="text-green-700">
                {t('checkEmailMessage')}
              </p>
            </div>
          </div>
        ) : showEmailNotVerified ? (
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-8 rounded-lg mb-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                {language === 'de' ? 'E-Mail nicht verifiziert' : 'Email Not Verified'}
              </h3>
              <p className="text-yellow-700 mb-4">
                {t('emailNotVerified')}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (language === 'de' ? 'Wird gesendet...' : 'Sending...') : (language === 'de' ? 'Bestätigungs-E-Mail erneut senden' : 'Resend Verification Email')}
                </button>
                <button
                  onClick={() => {
                    setShowEmailNotVerified(false);
                    setError('');
                  }}
                  className="w-full text-yellow-600 hover:text-yellow-700 underline text-sm"
                >
                  {t('backToSignIn')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
          {isSignup && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('firstName')}
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black"
                  placeholder={t('firstName')}
                  required={isSignup}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lastName')}
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black"
                  placeholder={t('lastName')}
                  required={isSignup}
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('emailAddress')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black"
                placeholder={t('emailPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black"
                placeholder={t('passwordPlaceholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {isSignup && (
              <p className="text-xs text-gray-500 mt-1">
                {t('passwordRequirement')}
              </p>
            )}
          </div>

          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent text-black"
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {!isSignup && (
            <div className="flex items-center justify-between">
              <Link href="/forgot-password" 
                className="text-sm text-[#7C3BEC] hover:text-[#6B32D6] underline"
                onClick={handleClose}
              >
                {t('forgotPassword')}
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C3BEC] text-white py-3 px-4 rounded-lg hover:bg-[#6B32D6] focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading
              ? (isSignup ? t('creatingAccount') : t('signingIn'))
              : (isSignup ? t('createAccount') : t('signIn'))
            }
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7C3BEC] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('continueWithGoogle')}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          {isSignup ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
          <button
            onClick={switchMode}
            className="text-[#7C3BEC] hover:text-[#6B32D6] underline font-medium"
          >
            {isSignup ? t('signIn') : t('signUp')}
          </button>
        </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LoginModal; 