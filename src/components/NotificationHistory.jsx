'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, X, CheckCheck, Settings, Mail, Users, BookOpen, ShoppingBag, UserCheck, Handshake, MessageCircle, Gift, CheckCircle2, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Embedded version of NotificationSettingsModal for use within the tab
const EmbeddedNotificationSettings = () => {
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

  const loadUserPreferences = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'userNotificationPreferences', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const firestorePrefs = data.preferences;
        // Merge with default settings to ensure all notification types exist
        setSettings(prevSettings => ({ ...prevSettings, ...firestorePrefs }));
        
        localStorage.setItem(`notificationPreferences_${currentUser.uid}`, JSON.stringify(firestorePrefs));
      } else {
        const localPrefs = localStorage.getItem(`notificationPreferences_${currentUser.uid}`);
        if (localPrefs) {
          const parsedPrefs = JSON.parse(localPrefs);
          // Merge with default settings to ensure all notification types exist
          setSettings(prevSettings => ({ ...prevSettings, ...parsedPrefs }));
        }
      }
    } catch (error) {
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
  }, [currentUser.uid]);

  const savePreferences = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const docRef = doc(db, 'userNotificationPreferences', currentUser.uid);
      await setDoc(docRef, {
        userId: currentUser.uid,
        email: currentUser.email,
        preferences: settings,
        updatedAt: serverTimestamp()
      });
      
      localStorage.setItem(`notificationPreferences_${currentUser.uid}`, JSON.stringify(settings));
      
      setSuccess('✅ Notification preferences saved!');
    } catch (error) {
      localStorage.setItem(`notificationPreferences_${currentUser.uid}`, JSON.stringify(settings));
      setSuccess('✅ Notification preferences saved locally!');
    }
    
    setTimeout(() => {
      setSuccess('');
    }, 3000);
    
    setSaving(false);
  };

  const enableNotifications = async () => {
    try {
      setSubscribing(true);
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
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../firebase/config');
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
      const { runNotificationDiagnostic, showDiagnosticModal } = await import('../utils/notificationDiagnostic');
      const results = await runNotificationDiagnostic();
      
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

  // Load preferences on mount
  useEffect(() => {
    if (currentUser) {
      loadUserPreferences();
    }
  }, [currentUser, loadUserPreferences]);

  return (
    <div className="p-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3BEC]"></div>
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
                {subscribing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-700 border-t-transparent" /> : <Bell className="h-4 w-4" />}
                <span>{subscribing ? 'Enabling…' : 'Enable Notifications'}</span>
              </button>
              <button
                onClick={sendTestNotifications}
                disabled={testing}
                className="flex-1 px-5 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" /> : <Settings className="h-4 w-4" />}
                <span>{testing ? 'Sending…' : 'Send Test Notifications'}</span>
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={runDiagnostic}
                disabled={diagnosing}
                className="flex-1 px-5 py-2.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {diagnosing ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-700 border-t-transparent" /> : <Settings className="h-4 w-4" />}
                <span>{diagnosing ? 'Checking...' : 'Run Diagnostic'}</span>
              </button>
              <button
                onClick={savePreferences}
                disabled={saving}
                className="flex-1 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const NotificationHistory = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'settings'

  // Real-time listener for notifications
  useEffect(() => {
    if (!currentUser || !isOpen) return;

    setLoading(true);
    
    try {
      console.log('📨 Loading notification history for modal...');
      const notificationsRef = collection(db, 'notificationHistory');
      const q = query(
        notificationsRef,
        where('userId', '==', currentUser.uid)
        // Removed orderBy to avoid index requirement - will sort in client
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const notificationsList = [];
          snapshot.forEach((doc) => {
            notificationsList.push({
              id: doc.id,
              ...doc.data()
            });
          });
          // Sort by createdAt descending on client side
          notificationsList.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
            return bTime - aTime;
          });
          
          console.log(`📨 Loaded ${notificationsList.length} notifications in modal`);
          setNotifications(notificationsList);
          setLoading(false);
        },
        (err) => {
          console.log('⚠️ Could not load notification history for modal:', err);
          setNotifications([]); // Set empty array instead of error
          setLoading(false);
        }
      );
      
             return () => unsubscribe();
     } catch (error) {
       console.log('⚠️ Error setting up notification history modal listener:', error);
       setNotifications([]);
       setLoading(false);
     }
  }, [currentUser, isOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notificationHistory', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark notification as unread
  const markAsUnread = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notificationHistory', notificationId);
      await updateDoc(notificationRef, {
        read: false,
        readAt: null
      });
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      unreadNotifications.forEach((notification) => {
        const notificationRef = doc(db, 'notificationHistory', notification.id);
        batch.update(notificationRef, {
          read: true,
          readAt: new Date()
        });
      });
      
      await batch.commit();
      console.log(`✅ Marked ${unreadNotifications.length} notifications as read`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Navigate to task
  const handleNavigateToTask = (taskId) => {
    onClose();
    router.push(`/dashboard/task/${taskId}`);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

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
            className="relative bg-white rounded-2xl w-full max-w-3xl mx-auto shadow-2xl max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#7C3BEC]/10 rounded-lg transition-all duration-200">
                  <AnimatePresence mode="wait">
                    {activeTab === 'history' ? (
                      <motion.div
                        key="bell-icon"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Bell className="h-6 w-6 text-[#7C3BEC]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="settings-icon"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Settings className="h-6 w-6 text-[#7C3BEC]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeTab === 'history' ? 'Notification History' : 'Notification Settings'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {activeTab === 'history' 
                          ? (unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!')
                          : 'Manage how you receive notifications'
                        }
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Tab Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'history'
                        ? 'bg-white text-[#7C3BEC] shadow-sm transform scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'settings'
                        ? 'bg-white text-[#7C3BEC] shadow-sm transform scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    Settings
                  </button>
                </div>
                
                {activeTab === 'history' && unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-[#7C3BEC] text-white rounded-lg hover:bg-[#6B32D6] transition-colors"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'history' ? (
                  <motion.div
                    key="history-tab"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="p-6"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3BEC]"></div>
                        <span className="ml-3 text-gray-600">Loading notifications...</span>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Bell className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                        <p className="text-gray-500">When you receive notifications, they'll appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification, index) => {
                          const isUnread = !notification.read;
                          
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                isUnread 
                                  ? 'bg-[#7C3BEC]/5 border-[#7C3BEC]/20 shadow-sm' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              {/* Unread indicator */}
                              {isUnread && (
                                <div className="absolute top-3 right-3 w-3 h-3 bg-[#7C3BEC] rounded-full"></div>
                              )}
                              
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`p-2 rounded-lg flex-shrink-0 ${
                                  isUnread ? 'bg-[#7C3BEC]/10' : 'bg-gray-100'
                                }`}>
                                  <Bell className={`h-4 w-4 ${
                                    isUnread ? 'text-[#7C3BEC]' : 'text-gray-500'
                                  }`} />
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  {/* Title */}
                                  <h4 className={`font-medium mb-1 ${
                                    isUnread ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title || 'Notification'}
                                  </h4>
                                  
                                  {/* Message */}
                                  <p className={`text-sm mb-2 ${
                                    isUnread ? 'text-gray-700' : 'text-gray-600'
                                  }`}>
                                    {notification.body || notification.message || 'No message content'}
                                  </p>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-3 mt-3">
                                    {isUnread ? (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="flex items-center gap-1 text-xs text-[#7C3BEC] hover:text-[#6B32D6] transition-colors"
                                      >
                                        <Check className="h-3 w-3" />
                                        Mark as read
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => markAsUnread(notification.id)}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                      >
                                        <Bell className="h-3 w-3" />
                                        Mark as unread
                                      </button>
                                    )}
                                    
                                    {/* Navigate to task if taskId exists */}
                                    {notification.taskId && (
                                      <button
                                        onClick={() => handleNavigateToTask(notification.taskId)}
                                        className="text-xs text-[#7C3BEC] hover:text-[#6B32D6] transition-colors"
                                      >
                                        View Task →
                                      </button>
                                    )}
                                  </div>
                                  
                                  {/* Timestamp */}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-400">
                                      {formatTimestamp(notification.createdAt)}
                                    </span>
                                    {notification.read && (
                                      <span className="text-xs text-gray-400">• Read</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="settings-tab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="h-full"
                  >
                    <EmbeddedNotificationSettings />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};


export default NotificationHistory;