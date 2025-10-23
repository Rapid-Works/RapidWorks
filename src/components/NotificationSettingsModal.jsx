'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Bell, Mail, Smartphone, Save, Loader2, Check, Send, Bug, Users, BookOpen, ShoppingBag, UserCheck, Handshake, MessageCircle, Gift, CheckCircle2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { runNotificationDiagnostic, showDiagnosticModal } from '../utils/notificationDiagnostic';

const NotificationSettingsModal = ({ isOpen, onClose, onPreferencesSaved }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);

  // Default settings - both mobile and email enabled for all notification types
  const [settings, setSettings] = useState({
    blogNotifications: {
      mobile: true,
      email: true
    },
    brandingKitReady: {
      mobile: true,
      email: true
    },
    taskMessages: {
      mobile: true,
      email: true
    },
    // Customer notifications
    newOffer: {
      mobile: true,
      email: true
    },
    taskFinished: {
      mobile: true,
      email: true
    },
    // Admin-only notifications
    newWebinarRegistration: {
      mobile: true,
      email: true
    },
    newNewsletterRegistration: {
      mobile: true,
      email: true
    },
    newBrandingOrder: {
      mobile: true,
      email: true
    },
    newExpertsOrder: {
      mobile: true,
      email: true
    },
    newPartnersOrder: {
      mobile: true,
      email: true
    },
    newAIChatbotConversation: {
      mobile: true,
      email: true
    }
  });

  // Check if user is a Rapid Works admin
  const isRapidWorksAdmin = currentUser?.email?.endsWith('@rapid-works.io') || false;

  // Notification types configuration
  const customerNotificationTypes = [
    {
      id: 'blogNotifications',
      label: 'New Blog Posts',
      description: 'Get notified when we publish new blog articles',
      icon: <Bell className="h-5 w-5 text-blue-500" />
    },
    {
      id: 'brandingKitReady',
      label: 'Branding Kit Ready',
      description: 'Get notified when your branding kits are completed',
      icon: <Check className="h-5 w-5 text-green-500" />
    },
    {
      id: 'taskMessages',
      label: 'Task Messages',
      description: 'Get notified when experts send messages or estimates for your tasks',
      icon: <Mail className="h-5 w-5 text-purple-500" />
    },
    {
      id: 'newOffer',
      label: 'New Offer',
      description: 'Get notified when we announce a new offer',
      icon: <Gift className="h-5 w-5 text-orange-500" />
    },
    {
      id: 'taskFinished',
      label: 'Task Finished',
      description: 'Get notified when we finished one of your tasks',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
  ];

  const adminNotificationTypes = [
    {
      id: 'newWebinarRegistration',
      label: 'New Webinar Registration',
      description: 'Get notified when someone registers for a webinar',
      icon: <Users className="h-5 w-5 text-indigo-500" />
    },
    {
      id: 'newNewsletterRegistration',
      label: 'New Newsletter Registration',
      description: 'Get notified when someone subscribes to the newsletter',
      icon: <BookOpen className="h-5 w-5 text-cyan-500" />
    },
    {
      id: 'newBrandingOrder',
      label: 'New Branding Order',
      description: 'Get notified when someone places a branding order',
      icon: <ShoppingBag className="h-5 w-5 text-pink-500" />
    },
    {
      id: 'newExpertsOrder',
      label: 'New Experts Order',
      description: 'Get notified when someone places an experts order',
      icon: <UserCheck className="h-5 w-5 text-emerald-500" />
    },
    {
      id: 'newPartnersOrder',
      label: 'New Partners Order',
      description: 'Get notified when someone places a partners order',
      icon: <Handshake className="h-5 w-5 text-amber-500" />
    },
    {
      id: 'newAIChatbotConversation',
      label: 'New AI-Chatbot Conversation',
      description: 'Get notified when someone starts a new AI chatbot conversation',
      icon: <MessageCircle className="h-5 w-5 text-violet-500" />
    }
  ];

  // Note: notificationTypes logic is handled directly in the render section

  const loadUserPreferences = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try Firestore first (authoritative source)
      const docRef = doc(db, 'userNotificationPreferences', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firestorePrefs = data.preferences;
        // Merge with default settings to ensure all notification types exist
        setSettings(prevSettings => ({ ...prevSettings, ...firestorePrefs }));
        
        // Sync to localStorage for client-side status
        localStorage.setItem(`notificationPreferences_${currentUser.uid}`, JSON.stringify(firestorePrefs));
      } else {
        // Fallback to localStorage if no Firestore document
        const localPrefs = localStorage.getItem(`notificationPreferences_${currentUser.uid}`);
        if (localPrefs) {
          const parsedPrefs = JSON.parse(localPrefs);
          // Merge with default settings to ensure all notification types exist
          setSettings(prevSettings => ({ ...prevSettings, ...parsedPrefs }));
        }
      }
    } catch (error) {
      // Fallback to localStorage
      const localPrefs = localStorage.getItem(`notificationPreferences_${currentUser.uid}`);
      if (localPrefs) {
        try {
          const parsedPrefs = JSON.parse(localPrefs);
          // Merge with default settings to ensure all notification types exist
          setSettings(prevSettings => ({ ...prevSettings, ...parsedPrefs }));
        } catch (parseError) {
        }
      }
    }
    
    setLoading(false);
  }, [currentUser?.uid]);

  // Load user's notification preferences
  useEffect(() => {
    if (isOpen && currentUser) {
      loadUserPreferences();
    }
  }, [isOpen, currentUser, loadUserPreferences]);

  const savePreferences = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Save to both Firestore AND localStorage
      
      // Save to Firestore (for server-side functions)
      const docRef = doc(db, 'userNotificationPreferences', currentUser.uid);
      await setDoc(docRef, {
        userId: currentUser.uid,
        email: currentUser.email,
        preferences: settings,
        updatedAt: serverTimestamp()
      });
      
      // Also save to localStorage (for client-side status)
      localStorage.setItem(`notificationPreferences_${currentUser.uid}`, JSON.stringify(settings));
      
      setSuccess('✅ Notification preferences saved!');
    } catch (error) {
      // Fallback to localStorage only
      localStorage.setItem(`notificationPreferences_${currentUser.uid}`, JSON.stringify(settings));
      setSuccess('✅ Notification preferences saved locally!');
    }
    
    // Notify parent component to refresh notification status
    if (onPreferencesSaved) {
      onPreferencesSaved();
    }
    
    // Auto-close success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
    
    setSaving(false);
  };

  const enableNotifications = async () => {
    try {
      setSubscribing(true);
      // reuse request from messaging module via browser permission
      const { requestNotificationPermission } = await import('../firebase/messaging');
      await requestNotificationPermission();
      setSuccess('✅ Notifications enabled on this device');
    } catch (e) {
      setError('Failed to enable notifications.');
    } finally {
      setSubscribing(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const sendTestNotifications = async () => {
    try {
      setTesting(true);
      const triggerBlog = httpsCallable(functions, 'testBlogNotification');
      const triggerKit = httpsCallable(functions, 'testBrandingKitReady');
      const kitId = `test-kit-${Date.now()}`;
      await Promise.all([
        triggerBlog({}),
        triggerKit({ kitId, email: currentUser?.email })
      ]);
      setSuccess('✅ Test notifications sent');
    } catch (e) {
      setError('Failed to send test notifications.');
    } finally {
      setTesting(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const runDiagnostic = async () => {
    try {
      setDiagnosing(true);
      setError('');
      setSuccess('');
      
      console.log('🔍 Running notification diagnostic...');
      const results = await runNotificationDiagnostic();
      
      // Show results in modal
      showDiagnosticModal(results);
      
      if (results.issues.length === 0) {
        setSuccess('✅ Diagnostic passed - notifications should work!');
      } else {
        setError(`⚠️ Found ${results.issues.length} issue(s) - check diagnostic popup`);
      }
      
    } catch (e) {
      setError('Failed to run diagnostic.');
      console.error('Diagnostic error:', e);
    } finally {
      setDiagnosing(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  const handleToggle = (notificationType, method) => {
    setSettings(prev => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [method]: !prev[notificationType][method]
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl w-full max-w-2xl mx-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#7C3BEC]/10 rounded-lg">
                  <Settings className="h-6 w-6 text-[#7C3BEC]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                  <p className="text-sm text-gray-500">Manage how you receive notifications</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#7C3BEC]" />
                  <span className="ml-3 text-gray-600">Loading your preferences...</span>
                </div>
              ) : (
                <>
                  {/* Settings Table */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200 mb-4">
                        <div className="font-semibold text-gray-700">Notification Type</div>
                        <div className="flex items-center justify-center gap-2 font-semibold text-gray-700">
                          <Smartphone className="h-4 w-4" />
                          Mobile Push
                        </div>
                        <div className="flex items-center justify-center gap-2 font-semibold text-gray-700">
                          <Mail className="h-4 w-4" />
                          Email
                        </div>
                      </div>

                      {/* Table Rows */}
                      {/* Customer Notifications */}
                      {customerNotificationTypes.map((type) => (
                        <div key={type.id} className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 last:border-b-0">
                          {/* Notification Type */}
                          <div className="flex items-start gap-3">
                            {type.icon}
                            <div>
                              <h3 className="font-medium text-gray-900">{type.label}</h3>
                              <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                            </div>
                          </div>

                          {/* Mobile Checkbox */}
                          <div className="flex items-center justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[type.id]?.mobile ?? true}
                                onChange={() => handleToggle(type.id, 'mobile')}
                                className="sr-only peer"
                              />
                              <div className="w-6 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7C3BEC]/20 rounded border-2 border-gray-300 peer-checked:bg-[#7C3BEC] peer-checked:border-[#7C3BEC] transition-all duration-200">
                                <Check className={`h-4 w-4 text-white absolute top-0.5 left-0.5 transition-opacity duration-200 ${settings[type.id]?.mobile ?? true ? 'opacity-100' : 'opacity-0'}`} />
                              </div>
                            </label>
                          </div>

                          {/* Email Checkbox */}
                          <div className="flex items-center justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings[type.id]?.email ?? true}
                                onChange={() => handleToggle(type.id, 'email')}
                                className="sr-only peer"
                              />
                              <div className="w-6 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7C3BEC]/20 rounded border-2 border-gray-300 peer-checked:bg-[#7C3BEC] peer-checked:border-[#7C3BEC] transition-all duration-200">
                                <Check className={`h-4 w-4 text-white absolute top-0.5 left-0.5 transition-opacity duration-200 ${settings[type.id]?.email ?? true ? 'opacity-100' : 'opacity-0'}`} />
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}

                      {/* Admin Notifications Section */}
                      {isRapidWorksAdmin && adminNotificationTypes.length > 0 && (
                        <>
                          {/* Admin Section Header */}
                          <div className="grid grid-cols-3 gap-4 py-3 mt-4 border-t-2 border-[#7C3BEC]/20">
                            <div className="col-span-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Settings className="h-4 w-4 text-[#7C3BEC]" />
                                <h4 className="font-semibold text-[#7C3BEC] text-sm uppercase tracking-wide">Admin Notifications</h4>
                              </div>
                              <p className="text-xs text-gray-500">These notifications are only visible to Rapid Works administrators</p>
                            </div>
                          </div>
                          
                          {/* Admin Notification Rows */}
                          {adminNotificationTypes.map((type) => (
                            <div key={type.id} className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 last:border-b-0 bg-[#7C3BEC]/5 rounded-lg px-2">
                              {/* Notification Type */}
                              <div className="flex items-start gap-3">
                                {type.icon}
                                <div>
                                  <h3 className="font-medium text-gray-900">{type.label}</h3>
                                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                                </div>
                              </div>

                              {/* Mobile Checkbox */}
                              <div className="flex items-center justify-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={settings[type.id]?.mobile ?? true}
                                    onChange={() => handleToggle(type.id, 'mobile')}
                                    className="sr-only peer"
                                  />
                                  <div className="w-6 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7C3BEC]/20 rounded border-2 border-gray-300 peer-checked:bg-[#7C3BEC] peer-checked:border-[#7C3BEC] transition-all duration-200">
                                    <Check className={`h-4 w-4 text-white absolute top-0.5 left-0.5 transition-opacity duration-200 ${settings[type.id]?.mobile ?? true ? 'opacity-100' : 'opacity-0'}`} />
                                  </div>
                                </label>
                              </div>

                              {/* Email Checkbox */}
                              <div className="flex items-center justify-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={settings[type.id]?.email ?? true}
                                    onChange={() => handleToggle(type.id, 'email')}
                                    className="sr-only peer"
                                  />
                                  <div className="w-6 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#7C3BEC]/20 rounded border-2 border-gray-300 peer-checked:bg-[#7C3BEC] peer-checked:border-[#7C3BEC] transition-all duration-200">
                                    <Check className={`h-4 w-4 text-white absolute top-0.5 left-0.5 transition-opacity duration-200 ${settings[type.id]?.email ?? true ? 'opacity-100' : 'opacity-0'}`} />
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Messages */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4"
                    >
                      {success}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    <div className="flex gap-3">
                      <button
                        onClick={enableNotifications}
                        disabled={subscribing}
                        className="flex-1 px-5 py-2.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {subscribing ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : <Bell className="h-4 w-4" />}
                        <span>{subscribing ? 'Enabling…' : 'Enable Notifications'}</span>
                      </button>
                      <button
                        onClick={sendTestNotifications}
                        disabled={testing}
                        className="flex-1 px-5 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {testing ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : <Send className="h-4 w-4" />}
                        <span>{testing ? 'Sending…' : 'Send Test Notifications'}</span>
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={runDiagnostic}
                        disabled={diagnosing}
                        className="flex-1 px-5 py-2.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {diagnosing ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : <Bug className="h-4 w-4" />}
                        <span>{diagnosing ? 'Checking...' : 'Run Diagnostic'}</span>
                      </button>
                    </div>
                    <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePreferences}
                      disabled={saving}
                      className="flex-1 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Preferences
                        </>
                      )}
                    </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationSettingsModal; 