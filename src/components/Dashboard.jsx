'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Megaphone, Users, MessageSquare, FileCheck, Receipt, ChevronDown, ChevronRight, Building, BarChart3, Compass, Loader2, FileText, XCircle, Mail, Key, Eye, EyeOff, CheckCircle, Home } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import RapidWorksHeader from './new_landing_page_header';
import BrandingKits from './BrandingKits';
import ProfileEditModal from './ProfileEditModal';
import NotificationSettingsModal from './NotificationSettingsModal';
import TaskList from './TaskList';
import SignedAgreements from './SignedAgreements';
import Invoicing from './Invoicing';
import OrganizationSwitcher from './OrganizationSwitcher';
import CreateOrganizationModal from './CreateOrganizationModal';
import OrganizationUsers from './OrganizationUsers';
import OrganizationsList from './OrganizationsList';
import Analytics from './Analytics';
import AllUsers from './AllUsers';
import RapidCoachings from './RapidCoachings';
import RapidFinancing from './RapidFinancing';
import LeaveOrganizationModal from './LeaveOrganizationModal';
import NewTaskModal from './NewTaskModal';
import LoginModal from './LoginModal';
import FrameworkAgreementModal from './FrameworkAgreementModal';
import MIDForm from './MIDForm';
import MIDSubmissions from './MIDSubmissions';
import { HomePage } from './home';

import { isExpert, getExpertByEmail, isAdmin, getAllExperts } from '../utils/expertService';
import { getCurrentUserContext, hasUserOrganizationMembership } from '../utils/organizationService';
import { checkOrganizationFrameworkStatus } from '../utils/frameworkAgreementService';
// notification helpers handled inside NotificationSettingsModal



// const accent = "#7C3BEC";

const Dashboard = () => {
  const { currentUser } = useAuth();
  // const router = useRouter();
  const { kitId, taskId } = useParams();
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  // Open Notification Settings if history link set the flag
  const initialOpenNotif = typeof window !== 'undefined' && localStorage.getItem('openNotificationSettings') === '1';
  
  // Persist active tab across refreshes
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboardActiveTab');
      // Default to 'home' for new users with incomplete onboarding, unless URL specifies otherwise
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      return urlTab || savedTab || 'home';
    }
    return 'home';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [expertTasksExpanded, setExpertTasksExpanded] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  // moved to Notification Settings modal
  const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(initialOpenNotif);
  
  // Organization state
  const [currentContext, setCurrentContext] = useState(null);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [isLeaveOrgModalOpen, setIsLeaveOrgModalOpen] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Request Fixed Price Task Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFrameworkModalOpen, setIsFrameworkModalOpen] = useState(false);
  const [frameworkModalMessage, setFrameworkModalMessage] = useState('');
  const [selectedExpertType, setSelectedExpertType] = useState('');
  const [selectedExpertName, setSelectedExpertName] = useState('');
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [isExpertSelectionModalOpen, setIsExpertSelectionModalOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  
  // MID Submissions Modal state
  const [isMIDSubmissionModalOpen, setIsMIDSubmissionModalOpen] = useState(false);
  const [selectedMIDSubmission, setSelectedMIDSubmission] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [decryptedAdminPassword, setDecryptedAdminPassword] = useState(null);
  const [isDecryptingAdmin, setIsDecryptingAdmin] = useState(false);
  
  // Invite Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Missing MID fields state for highlighting
  const [missingMIDFields, setMissingMIDFields] = useState([]);
  
  // Toast notifications for MID operations
  const [showEmailSentSuccess, setShowEmailSentSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });

  if (initialOpenNotif) {
    try { localStorage.removeItem('openNotificationSettings'); } catch (e) {}
  }

  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardActiveTab', activeTab);
    }
  }, [activeTab]);

  // Close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load user context (personal vs organization)
  useEffect(() => {
    const loadContext = async () => {
      if (!currentUser) {
        setContextLoading(false);
        return;
      }
      
      setContextLoading(true);
      try {
        const context = await getCurrentUserContext(currentUser.uid);
        setCurrentContext(context);
        
        // For non-admin users (clients), handle organization logic
        if (!currentUser.email?.endsWith('@rapid-works.io')) {
          const { getUserOrganizations, switchToOrganization } = await import('../utils/organizationService');
          
          // Get user's organizations
          const userOrganizations = await getUserOrganizations(currentUser.uid);
          
          if (userOrganizations.length === 0) {
            // No organizations - just log it, Home tab will guide them
            console.log('📝 New user detected - Home tab will guide onboarding');
          } else if (context.type === 'personal' && userOrganizations.length > 0) {
            // User has organizations but is in personal mode - auto-switch to first organization
            await switchToOrganization(currentUser.uid, userOrganizations[0].id);
            // Reload context after switching
            const updatedContext = await getCurrentUserContext(currentUser.uid);
            setCurrentContext(updatedContext);
          }
        }
      } catch (error) {
        console.error('Error loading user context:', error);
      } finally {
        setContextLoading(false);
      }
    };

    loadContext();
  }, [currentUser]);

  // Handle deep linking to specific task via URL parameter
  useEffect(() => {
    if (taskId && !contextLoading) {
      console.log('🔗 Deep linking to task:', taskId);
      // Navigate to tasks tab and select the specific task
      setActiveTab('tasks');
      setSelectedTaskId(taskId);
      // URL will be cleared by handleTaskSelected callback
    }
  }, [taskId, contextLoading]);

  // Handle URL query parameters for tab and organization deep linking
  useEffect(() => {
    if (!contextLoading) {
      const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const tabParam = searchParams.get('tab');
      const orgIdParam = searchParams.get('orgId');
      const openInviteParam = searchParams.get('openInvite');

      if (tabParam) {
        console.log('🔗 Deep linking to tab:', tabParam);
        setActiveTab(tabParam);
      }

      if (orgIdParam) {
        console.log('🔗 Deep linking to organization:', orgIdParam);
        setSelectedOrganizationId(orgIdParam);
        // Ensure we're on the organizations tab
        if (tabParam === 'organizations' || !tabParam) {
          setActiveTab('organizations');
        }
      }

      if (openInviteParam === 'true') {
        console.log('🔗 Opening invite modal');
        setIsInviteModalOpen(true);
        // Clear the URL parameter
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('openInvite');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [pathname, contextLoading]);
  
  // Check if current user is an expert or admin
  const userIsExpert = currentUser ? isExpert(currentUser.email) : false;
  const userIsAdmin = currentUser ? isAdmin(currentUser.email) : false;
  const expertInfo = userIsExpert ? getExpertByEmail(currentUser.email) : null;
  
  // Check if user can access signed agreements (rapid-works.io emails or experts)
  const canAccessSignedAgreements = currentUser && (
    currentUser.email?.endsWith('@rapid-works.io') || 
    userIsExpert || 
    userIsAdmin
  );
  
  // Check if user can access invoicing (rapid-works.io emails only)
  const canAccessInvoicing = currentUser && currentUser.email?.endsWith('@rapid-works.io');
  
  // Check if user can access organizations admin panel (rapid-works.io emails only)
  const canAccessOrganizations = currentUser && currentUser.email?.endsWith('@rapid-works.io');
  
  // Check if user can access analytics (available to all authenticated users)
  const canAccessAnalytics = currentUser !== null;
  
  // Check if user can access all users list (rapid-works.io emails only)
  const canAccessAllUsers = currentUser && currentUser.email?.endsWith('@rapid-works.io');
  
  // Check if user can access Rapid Coachings and Rapid Financing (all authenticated users)
  const canAccessRapidServices = currentUser !== null;

  // Handle navigation from invoicing to task chat
  const handleNavigateToTask = (taskId) => {
    setSelectedTaskId(taskId);
    setActiveTab('tasks');
  };

  // Function to show expert selection modal
  const handleRequestTask = () => {
    setIsRequestLoading(true);
    setIsExpertSelectionModalOpen(true);
    setIsRequestLoading(false);
  };

  // Function to handle expert selection and proceed with task request
  const handleExpertSelected = async (expertRole, expertName) => {
    setSelectedExpertType(expertRole);
    setSelectedExpertName(expertName);
    setIsExpertSelectionModalOpen(false);
    setIsRequestLoading(true);
    
    // Check if user is logged in
    if (!currentUser) {
      setIsRequestLoading(false);
      setIsLoginModalOpen(true);
      return;
    }
    
    try {
      // Check if user has any organization membership
      const hasOrganization = await hasUserOrganizationMembership(currentUser.uid);
      
      if (!hasOrganization) {
        // User has no organization - show framework modal with organization creation message
        setIsRequestLoading(false);
        setFrameworkModalMessage('no-organization');
        setIsFrameworkModalOpen(true);
        return;
      }
      
      // User has organization - check organization-level framework status
      const userContext = await getCurrentUserContext(currentUser.uid);
      const organizationId = userContext?.organization?.id;
      
      if (!organizationId) {
        setIsRequestLoading(false);
        setFrameworkModalMessage('organization-not-found');
        setIsFrameworkModalOpen(true);
        return;
      }
      
      const organizationFrameworkStatus = await checkOrganizationFrameworkStatus(organizationId);
      console.log('Organization framework status:', organizationFrameworkStatus);
      
      if (!organizationFrameworkStatus.signed) {
        // Organization hasn't signed framework - check user role
        if (userContext.permissions?.role === 'admin') {
          // Admin can sign framework agreement
          setIsRequestLoading(false);
          setFrameworkModalMessage('');
          setIsFrameworkModalOpen(true);
          return;
        } else {
          // Member cannot sign - show contact admin message
          setIsRequestLoading(false);
          setFrameworkModalMessage('admin-required');
          setIsFrameworkModalOpen(true);
          return;
        }
      }
      
      // Organization has signed framework - allow any member to proceed
      setIsRequestLoading(false);
      setIsTaskModalOpen(true);
    } catch (error) {
      console.error('Error checking organization framework status:', error);
      setIsRequestLoading(false);
      setFrameworkModalMessage('error');
      setIsFrameworkModalOpen(true);
    }
  };

  // Function to close the task modal
  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedExpertType('');
    setSelectedExpertName('');
  };

  // Function to handle successful login
  const handleLoginSuccess = async (userCredential) => {
    setIsLoginModalOpen(false);
    
    // Extract user from userCredential (both login and Google login return userCredential)
    const user = userCredential?.user || userCredential;
    const userId = user?.uid || currentUser?.uid;
    
    if (!userId) {
      setFrameworkModalMessage('user-not-found');
      setIsFrameworkModalOpen(true);
      return;
    }
    
    try {
      // Check if user has any organization membership
      const hasOrganization = await hasUserOrganizationMembership(userId);
      
      if (!hasOrganization) {
        // User has no organization - show framework modal with organization creation message
        setFrameworkModalMessage('no-organization');
        setIsFrameworkModalOpen(true);
        return;
      }
      
      // User has organization - check organization-level framework status
      const userContext = await getCurrentUserContext(userId);
      const organizationId = userContext?.organization?.id;
      
      if (!organizationId) {
        setFrameworkModalMessage('organization-not-found');
        setIsFrameworkModalOpen(true);
        return;
      }
      
      const organizationFrameworkStatus = await checkOrganizationFrameworkStatus(organizationId);
      console.log('Organization framework status after login:', organizationFrameworkStatus);
      
      if (!organizationFrameworkStatus.signed) {
        // Organization hasn't signed framework - check user role
        if (userContext.permissions?.role === 'admin') {
          // Admin can sign framework agreement
          setFrameworkModalMessage('');
          setIsFrameworkModalOpen(true);
        } else {
          // Member cannot sign - show contact admin message
          setFrameworkModalMessage('admin-required');
          setIsFrameworkModalOpen(true);
        }
      } else {
        // Organization has signed framework - allow any member to proceed
        setIsTaskModalOpen(true);
      }
    } catch (error) {
      console.error('Error checking organization framework status after login:', error);
      setFrameworkModalMessage('error');
      setIsFrameworkModalOpen(true);
    }
  };

  // Function to handle framework agreement completion
  const handleFrameworkSigned = () => {
    setIsFrameworkModalOpen(false);
    setIsTaskModalOpen(true);
    // Keep expert data for the task modal
  };

  // Function to close login modal
  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    setSelectedExpertType('');
    setSelectedExpertName('');
  };

  // Function to close framework modal
  const handleCloseFrameworkModal = () => {
    setIsFrameworkModalOpen(false);
    setFrameworkModalMessage('');
    // Keep expert data - it will be cleared when task modal closes
  };

  // MID Submission Modal handlers
  const handleViewMIDSubmission = async (submission) => {
    console.log('🔍 Opening MID submission modal:', submission);
    console.log('📋 Submission ID:', submission.id);
    console.log('📋 Submission keys:', Object.keys(submission));
    
    // Fetch fresh data from Firestore to ensure it's not stale
    try {
      const { getMIDFormSubmission } = await import('../services/midFormService');
      console.log('🔍 Fetching fresh data for submission ID:', submission.id);
      const freshSubmission = await getMIDFormSubmission(submission.id);
      console.log('✅ Fresh submission data:', freshSubmission);
      
      if (freshSubmission) {
        setSelectedMIDSubmission(freshSubmission);
      } else {
        // Submission was deleted
        console.error('❌ Submission not found in Firestore');
        setErrorToast({ 
          show: true, 
          message: 'This MID submission no longer exists. It may have been deleted. Please refresh the page.' 
        });
        setTimeout(() => setErrorToast({ show: false, message: '' }), 5000);
        return;
      }
    } catch (error) {
      console.error('❌ Error fetching fresh submission:', error);
      // Fallback to cached data
      console.log('⚠️ Using cached submission data');
      setSelectedMIDSubmission(submission);
    }
    
    setIsMIDSubmissionModalOpen(true);
  };

  const handleCloseMIDSubmissionModal = () => {
    setIsMIDSubmissionModalOpen(false);
    setSelectedMIDSubmission(null);
    setShowAdminPassword(false);
    setDecryptedAdminPassword(null);
  };

  const handleRevealAdminPassword = async () => {
    if (!selectedMIDSubmission?.id) return;
    
    if (showAdminPassword) {
      // Hide password
      setShowAdminPassword(false);
      setDecryptedAdminPassword(null);
      return;
    }

    // Decrypt and show password
    setIsDecryptingAdmin(true);
    try {
      const decryptPassword = httpsCallable(functions, 'decryptMIDPassword');
      const result = await decryptPassword({ submissionId: selectedMIDSubmission.id });
      
      setDecryptedAdminPassword(result.data.password);
      setShowAdminPassword(true);
    } catch (error) {
      console.error('❌ Error decrypting password:', error);
      
      // Check if the error is about missing credentials
      if (error.message && error.message.includes('No encrypted password found')) {
        setErrorToast({ 
          show: true, 
          message: 'This MID submission does not have auto-generated credentials yet. Please create a new submission to test this feature.' 
        });
      } else {
        setErrorToast({ 
          show: true, 
          message: `Failed to decrypt password: ${error.message}` 
        });
      }
      setTimeout(() => setErrorToast({ show: false, message: '' }), 5000);
    } finally {
      setIsDecryptingAdmin(false);
    }
  };

  const handleSendMIDCredentialsEmail = async () => {
    if (!selectedMIDSubmission) return;
    
    setIsSendingEmail(true);
    try {
      const sendCredentialsEmail = httpsCallable(functions, 'sendMIDCredentialsEmail');
      const result = await sendCredentialsEmail({ submissionId: selectedMIDSubmission.id });
      
      console.log('✅ MID credentials email sent:', result.data);
      
      // Update local state to reflect new status
      const updatedSubmission = {
        ...selectedMIDSubmission,
        status: 'submitted',
        midCredentials: {
          ...selectedMIDSubmission.midCredentials,
          sentAt: new Date()
        }
      };
      setSelectedMIDSubmission(updatedSubmission);
      
      // Show success toast
      setShowEmailSentSuccess(true);
      setTimeout(() => setShowEmailSentSuccess(false), 3000);
    } catch (error) {
      console.error('❌ Error sending MID credentials email:', error);
      setErrorToast({ show: true, message: `Failed to send email: ${error.message}` });
      setTimeout(() => setErrorToast({ show: false, message: '' }), 5000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function for status labels
  const getStatusLabel = (status) => {
    if (status === 'pending') return 'Under Review';
    if (status === 'submitted') return 'Submitted';
    return status || 'pending';
  };

  // Helper function to render field value with change history
  const renderFieldWithHistory = (fieldName, currentValue, changeHistory) => {
    if (!changeHistory || changeHistory.length === 0) {
      return currentValue || 'N/A';
    }

    // Find the most recent change for this field
    const fieldChanges = changeHistory
      .filter(change => change.field === fieldName)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (fieldChanges.length === 0) {
      return currentValue || 'N/A';
    }

    const latestChange = fieldChanges[0];
    const timestamp = new Date(latestChange.timestamp).toLocaleString();

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="line-through text-gray-400">{latestChange.oldValue || 'Empty'}</span>
          <span className="text-xs text-gray-500">→</span>
          <span className="font-medium text-gray-900">{currentValue}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
            Updated
          </span>
        </div>
        <div className="text-xs text-gray-500">Changed on {timestamp}</div>
      </div>
    );
  };

  // Handle task successfully selected (callback from TaskList)
  const handleTaskSelected = () => {
    // Clear the taskId from URL when task is successfully selected
    if (taskId) {
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(`/task/${taskId}`, '');
      window.history.replaceState(null, '', newPath);
    }
    // Don't clear selectedTaskId here as we want to keep the task selected
  };

  // moved enable/test notifications into Notification Settings modal

  const handleOrganizationCreated = async (organization) => {
    setIsCreateOrgModalOpen(false);
    
    if (currentUser.email?.endsWith('@rapid-works.io')) {
      // For admin users, set context directly (original behavior)
      setCurrentContext({
        type: 'organization',
        organization,
        permissions: {
          role: 'admin',
          permissions: {
            canRequestExperts: true,
            canSeeAllRequests: true,
            canManageMembers: true
          }
        }
      });
    } else {
      // For clients, automatically switch to the newly created organization
      try {
        const { switchToOrganization } = await import('../utils/organizationService');
        
        // Switch to the newly created organization
        await switchToOrganization(currentUser.uid, organization.id);
        // Reload context after switching
        const updatedContext = await getCurrentUserContext(currentUser.uid);
        setCurrentContext(updatedContext);
        
        // Note: Tab will be determined by localStorage or URL params
      } catch (error) {
        console.error('Error switching to new organization:', error);
        // Fallback to direct context setting
        setCurrentContext({
          type: 'organization',
          organization,
          permissions: {
            role: 'admin',
            permissions: {
              canRequestExperts: true,
              canSeeAllRequests: true,
              canManageMembers: true
            }
          }
        });
        
        // Note: Tab will be determined by localStorage or URL params
      }
    }
  };

  const handleContextChange = (newContext) => {
    setCurrentContext(newContext);
  };

  const handleLeaveOrganization = async () => {
    // Refresh the page after leaving organization since personal accounts are no longer used
    window.location.reload();
  };

  // Check if user can see Members tab (only in organization context and has appropriate permissions)
  const canAccessMembers = currentContext?.type === 'organization' && 
    (currentContext.permissions?.role === 'admin' || currentContext.permissions?.permissions?.canManageMembers);


  if (contextLoading) {
    return (
      <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
        <RapidWorksHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3BEC] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
      <RapidWorksHeader />

      {/* Sidebar Dashboard Layout - Responsive like Slack/Gmail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white overflow-hidden h-[calc(100vh-3rem)] mt-12"
      >
          <div className="flex h-full relative">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 z-40 lg:hidden"
                style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Left Sidebar */}
            <div className={`${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:relative top-0 left-0 z-50 lg:z-auto w-72 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0 h-full transition-transform duration-300 ease-in-out lg:transition-none`}>
              {/* Sidebar Header - Only for rapid-works.io admin users */}
              {currentUser?.email?.endsWith('@rapid-works.io') && (
                <div className="p-6 border-b border-gray-200">
                  <OrganizationSwitcher 
                    onCreateOrganization={() => setIsCreateOrgModalOpen(true)}
                    currentContext={currentContext}
                    onContextChange={handleContextChange}
                  />
                </div>
              )}

              {/* Navigation Items */}
              <nav className="flex-1 flex flex-col min-h-0">
                {/* Scrollable Navigation Items */}
                <div className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
                  {/* Home - Always visible */}
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedTaskId(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === 'home'
                      ? 'bg-[#7C3BEC] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <Home className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">Home</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('branding');
                    // Don't clear selectedTaskId - let TaskList preserve its state
                    setIsMobileMenuOpen(false); // Close mobile menu
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === 'branding'
                      ? 'bg-[#7C3BEC] text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <Megaphone className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">Rapid Branding</div>
                  </div>
                </button>
                
                {/* Tasks - Expandable for rapid-works.io users */}
                 {userIsExpert && currentUser?.email?.endsWith('@rapid-works.io') ? (
                  <>
                    <button
                      onClick={() => {
                        setExpertTasksExpanded(!expertTasksExpanded);
                        if (!expertTasksExpanded) {
                          setActiveTab('tasks');
                          setSelectedExpert(null);
                          // Don't clear selectedTaskId when expanding - preserve user selection
                        }
                        setIsMobileMenuOpen(false); // Close mobile menu
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === 'tasks' && !selectedExpert
                          ? 'bg-[#7C3BEC] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      {expertTasksExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Users className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">Expert Tasks</div>
                      </div>
                      {unreadTotal > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center text-[10px] font-semibold bg-red-500 text-white rounded-full h-5 px-2">
                          {unreadTotal}
                        </span>
                      )}
                    </button>
                    
                    {/* Expert Sub-items */}
                    {expertTasksExpanded && (
                      <div className="ml-4 mt-2 space-y-1">
                        {/* All Tasks Option */}
                        <button
                          onClick={() => {
                            setActiveTab('tasks');
                            setSelectedExpert(null);
                            // Don't clear selectedTaskId - preserve user selection
                            setIsMobileMenuOpen(false); // Close mobile menu
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 text-sm ${
                            activeTab === 'tasks' && !selectedExpert
                              ? 'bg-[#7C3BEC] text-white shadow-lg'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-3 w-3 text-white" />
                          </div>
                          <span>All Tasks</span>
                        </button>
                        
                        {/* Individual Experts */}
                        {getAllExperts().map((expert) => (
                          <button
                            key={expert.email}
                            onClick={() => {
                              setActiveTab('tasks');
                              setSelectedExpert(expert);
                              // Clear selectedTaskId when switching experts since tasks will be different
                              setSelectedTaskId(null);
                              setIsMobileMenuOpen(false); // Close mobile menu
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all duration-200 text-sm ${
                              activeTab === 'tasks' && selectedExpert?.email === expert.email
                                ? 'bg-[#7C3BEC] text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div className="w-6 h-6 bg-gradient-to-br from-[#7C3BEC] to-[#9F7AEA] rounded-full flex items-center justify-center overflow-hidden">
                              {expert.avatar ? (
                                <img
                                  src={expert.avatar}
                                  alt={expert.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-xs">
                                  {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span>{expert.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Only show Tasks tab for experts or organization members (not personal accounts)
                  (userIsExpert || currentContext?.type === 'organization') && (
                    <button
                      onClick={() => {
                        setActiveTab('tasks');
                        // Don't clear selectedTaskId - preserve user selection
                        setIsMobileMenuOpen(false); // Close mobile menu
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === 'tasks'
                          ? 'bg-[#7C3BEC] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <Users className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">
                          {userIsExpert ? 'Expert Tasks' : (currentUser?.email?.endsWith('@rapid-works.io') ? 'My Requests' : 'Rapid Expert Tasks')}
                        </div>
                      </div>
                      {userIsExpert && unreadTotal > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center text-[10px] font-semibold bg-red-500 text-white rounded-full h-5 px-2">
                          {unreadTotal}
                        </span>
                      )}
                    </button>
                  )
                )}

                {canAccessSignedAgreements && (
                  <button
                    onClick={() => {
                      setActiveTab('agreements');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'agreements'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <FileCheck className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Agreements</div>
                    </div>
                    {currentUser?.email?.endsWith('@rapid-works.io') && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        activeTab === 'agreements' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-[#7C3BEC]/10 text-[#7C3BEC]'
                      }`}>
                        RW
                      </span>
                    )}
                  </button>
                )}

                {canAccessInvoicing && (
                  <button
                    onClick={() => {
                      setActiveTab('invoicing');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'invoicing'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <Receipt className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Invoicing</div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      activeTab === 'invoicing' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#7C3BEC]/10 text-[#7C3BEC]'
                    }`}>
                      RW
                    </span>
                  </button>
                )}

                {canAccessOrganizations && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('organizations');
                        setSelectedTaskId(null); // Clear when leaving tasks area
                        setIsMobileMenuOpen(false); // Close mobile menu
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === 'organizations'
                          ? 'bg-[#7C3BEC] text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <Building className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">Organizations</div>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        activeTab === 'organizations' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-[#7C3BEC]/10 text-[#7C3BEC]'
                      }`}>
                        RW
                      </span>
                    </button>
                  </>
                )}

                {canAccessAllUsers && (
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'users'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Users</div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      activeTab === 'users' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#7C3BEC]/10 text-[#7C3BEC]'
                    }`}>
                      RW
                    </span>
                  </button>
                )}

                {canAccessAnalytics && (
                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'analytics'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Rapid Analytics</div>
                    </div>
                  </button>
                )}

                {/* Rapid Coachings - For non-admin users only */}
                {canAccessRapidServices && (
                  <button
                    onClick={() => {
                      setActiveTab('coachings');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'coachings'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <Compass className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Rapid Coachings</div>
                    </div>
                  </button>
                )}

                {/* Rapid Financing - For non-admin users only */}
                {canAccessRapidServices && (
                  <button
                    onClick={() => {
                      setActiveTab('financing');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`ml-0.5 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'financing'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <span className="pl-0.5 text-lg font-bold">€</span>
                    <div className="flex-1">
                      <div className="pl-1.5 font-medium">Rapid Financing</div>
                    </div>
                  </button>
                )}

                {/* MID Form - For all authenticated users */}
                {currentUser && (
                  <button
                    onClick={() => {
                      setActiveTab('mid');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'mid'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">Organization Information</div>
                    </div>
                  </button>
                )}

                {/* MID Submissions - For rapid-works.io admin users only */}
                {currentUser?.email?.endsWith('@rapid-works.io') && (
                  <button
                    onClick={() => {
                      setActiveTab('mid-submissions');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'mid-submissions'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">MID Submissions</div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      activeTab === 'mid-submissions' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#7C3BEC]/10 text-[#7C3BEC]'
                    }`}>
                      RW
                    </span>
                  </button>
                )}

                {/* Twilio WhatsApp Test - Temporarily hidden (integrated into organization creation) */}

                {canAccessMembers && (
                  <button
                    onClick={() => {
                      setActiveTab('members');
                      setSelectedTaskId(null); // Clear when leaving tasks area
                      setIsMobileMenuOpen(false); // Close mobile menu
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'members'
                        ? 'bg-[#7C3BEC] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {currentUser?.email?.endsWith('@rapid-works.io') ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <Building className="h-5 w-5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">
                        {currentUser?.email?.endsWith('@rapid-works.io') ? 'Members' : 'Organization'}
                      </div>
                    </div>
                  </button>
                )}
                </div>

                {/* Sticky Help Section */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Need help?</h3>
                        <p className="text-xs text-gray-600">
                          Reach out at{' '}
                          <a 
                            href="mailto:support@rapid-works.io" 
                            className="font-semibold text-[#7C3BEC] hover:text-[#6B32D6] transition-colors"
                          >
                            support@rapid-works.io
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Mobile Header */}
              <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {activeTab === 'home' && 'Home'}
                  {activeTab === 'branding' && 'Rapid Branding'}
                  {activeTab === 'tasks' && (userIsExpert ? 'Expert Tasks' : (currentUser?.email?.endsWith('@rapid-works.io') ? 'My Requests' : 'Rapid Expert Tasks'))}
                  {activeTab === 'agreements' && 'Agreements'}
                  {activeTab === 'invoicing' && 'Invoicing'}
                  {activeTab === 'organizations' && 'Organizations'}
                  {activeTab === 'users' && 'Users'}
                  {activeTab === 'analytics' && 'Rapid Analytics'}
                  {activeTab === 'coachings' && 'Rapid Coachings'}
                  {activeTab === 'financing' && 'Rapid Financing'}
                  {activeTab === 'mid' && (
                    !currentContext?.organization?.id && !currentUser?.email?.endsWith('@rapid-works.io')
                      ? 'Create Organization' 
                      : (currentUser?.email?.endsWith('@rapid-works.io') ? 'Organization Information' : 'Organization')
                  )}
                  {activeTab === 'mid-submissions' && currentUser?.email?.endsWith('@rapid-works.io') && 'MID Submissions'}
                  {/* {activeTab === 'twilio-test' && 'Twilio Test'} */}
                  {activeTab === 'members' && (currentUser?.email?.endsWith('@rapid-works.io') ? 'Members' : 'Organization')}
                </h1>
              </div>


              {/* Content Area */}
              <div className="flex-1 p-3 lg:p-3 bg-gray-50 overflow-y-auto h-full">
                <div className="flex items-center justify-end gap-2 mb-3 hidden lg:flex"></div>
                
                {/* Home Tab */}
                {activeTab === 'home' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 lg:p-6"
                  >
                    <HomePage 
                      onNavigateToTab={(tab) => setActiveTab(tab)}
                      onNavigateToMIDWithFields={(missingFields) => {
                        setMissingMIDFields(missingFields);
                        setActiveTab('mid');
                        // Add returnTo parameter to URL so MID form knows to redirect back
                        window.history.replaceState(null, '', '/dashboard?tab=mid&returnTo=home');
                      }}
                      onOpenInviteModal={() => {
                        setActiveTab('members');
                        setIsInviteModalOpen(true);
                      }}
                      currentContext={currentContext}
                    />
                  </motion.div>
                )}
                
                {activeTab === 'branding' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BrandingKits initialKitId={kitId} />
                  </motion.div>
                )}

                {activeTab === 'tasks' && (
                  <motion.div
                    key="tasks-tab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 h-full flex flex-col"
                  >
                    <div className="flex-1 flex flex-col">
                      <TaskList 
                        key={`task-list-${currentUser?.uid}-${selectedExpert?.email || 'all'}`}
                        userRole={userIsExpert ? 'expert' : 'customer'}
                        expertInfo={expertInfo}
                        initialSelectedTaskId={selectedTaskId}
                        onTaskSelected={handleTaskSelected}
                        selectedExpert={selectedExpert}
                        onUnreadTotalChange={setUnreadTotal}
                        requestButton={!userIsExpert ? (
                          <button
                            onClick={handleRequestTask}
                            disabled={isRequestLoading}
                            className="bg-[#7C3BEC] hover:bg-[#6B32D6] disabled:bg-[#7C3BEC]/70 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                          >
                            {isRequestLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MessageSquare className="h-4 w-4" />
                            )}
                            {isRequestLoading ? 'Processing...' : 'Request Fixed Price Task'}
                          </button>
                        ) : null}
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'agreements' && canAccessSignedAgreements && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <SignedAgreements />
                  </motion.div>
                )}

                {activeTab === 'invoicing' && canAccessInvoicing && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <Invoicing onNavigateToTask={handleNavigateToTask} />
                  </motion.div>
                )}

                {activeTab === 'organizations' && canAccessOrganizations && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <OrganizationsList 
                      onNavigateToTask={handleNavigateToTask}
                      initialSelectedOrgId={selectedOrganizationId}
                    />
                  </motion.div>
                )}

                {activeTab === 'users' && canAccessAllUsers && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <AllUsers />
                  </motion.div>
                )}

                {activeTab === 'analytics' && canAccessAnalytics && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <Analytics />
                  </motion.div>
                )}

                {/* Twilio test content temporarily hidden */}

                {activeTab === 'coachings' && canAccessRapidServices && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <RapidCoachings />
                  </motion.div>
                )}

                {activeTab === 'financing' && canAccessRapidServices && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <RapidFinancing 
                      onNavigateToCompanyInfo={(missingFields) => {
                        setMissingMIDFields(missingFields || []);
                        setActiveTab('mid');
                      }}
                      onNavigateToTab={setActiveTab}
                    />
                  </motion.div>
                )}

                {activeTab === 'mid' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MIDForm 
                      currentContext={currentContext} 
                      missingMIDFields={missingMIDFields}
                      onFieldsUpdated={() => setMissingMIDFields([])}
                      onOrganizationCreated={handleOrganizationCreated}
                      onNavigateToTab={setActiveTab}
                    />
                  </motion.div>
                )}

                {activeTab === 'mid-submissions' && currentUser?.email?.endsWith('@rapid-works.io') && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <MIDSubmissions onViewSubmission={handleViewMIDSubmission} />
                  </motion.div>
                )}

                {activeTab === 'members' && canAccessMembers && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6"
                  >
                    <OrganizationUsers 
                      organization={currentContext.organization || {}}
                      currentUserPermissions={currentContext.permissions}
                      openInvite={isInviteModalOpen}
                      onInviteModalClose={() => setIsInviteModalOpen(false)}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Edit Modal */}
        <ProfileEditModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />

        {/* Notification Settings Modal */}
        <NotificationSettingsModal
          isOpen={isNotifSettingsOpen}
          onClose={() => setIsNotifSettingsOpen(false)}
        />

        {/* Create Organization Modal */}
        <CreateOrganizationModal
          isOpen={isCreateOrgModalOpen}
          onClose={() => setIsCreateOrgModalOpen(false)}
          onOrganizationCreated={handleOrganizationCreated}
        />

        {/* Leave Organization Modal */}
        <LeaveOrganizationModal
          isOpen={isLeaveOrgModalOpen}
          onClose={() => setIsLeaveOrgModalOpen(false)}
          organization={currentContext?.organization}
          onLeaveSuccess={handleLeaveOrganization}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={handleCloseLoginModal}
          onLoginSuccess={handleLoginSuccess}
          context="task"
        />

        {/* Framework Agreement Modal */}
        <FrameworkAgreementModal
          isOpen={isFrameworkModalOpen}
          onClose={handleCloseFrameworkModal}
          onAgreementSigned={handleFrameworkSigned}
          userName={currentUser?.displayName || currentUser?.email}
          message={frameworkModalMessage}
        />

        {/* Task Request Modal */}
        <NewTaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          selectedExpertType={selectedExpertType}
          expertName={selectedExpertName}
        />

        {/* Expert Selection Modal */}
        {isExpertSelectionModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Expert</h3>
              <p className="text-gray-600 mb-6">Choose an expert for your fixed price task request:</p>
              
              <div className="space-y-3">
                {/* Samuel Donkor - Available */}
                <button
                  onClick={() => handleExpertSelected('Software Expert', 'Samuel Donkor')}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#7C3BEC] hover:bg-purple-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7C3BEC] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">SD</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Samuel Donkor</div>
                    <div className="text-sm text-gray-500">Software Expert</div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">Available</div>
                </button>

                {/* Prince Ardiabah - Available */}
                <button
                  onClick={() => handleExpertSelected('Marketing Expert', 'Prince Ardiabah')}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-[#7C3BEC] hover:bg-purple-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7C3BEC] to-[#9F7AEA] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">PA</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Prince Ardiabah</div>
                    <div className="text-sm text-gray-500">Marketing Expert</div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">Available</div>
                </button>

                {/* Other experts - Coming Soon */}
                {['Design Expert', 'Finance Expert', 'Data Analysis Expert', 'DevOps Expert'].map((role) => (
                  <div
                    key={role}
                    className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-sm">CS</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-500">Coming Soon</div>
                      <div className="text-sm text-gray-400">{role}</div>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">Coming Soon</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsExpertSelectionModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MID Submission Detail Modal */}
        {console.log('🔍 Modal state:', { isMIDSubmissionModalOpen, selectedMIDSubmission: !!selectedMIDSubmission })}
        {isMIDSubmissionModalOpen && selectedMIDSubmission && (
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              zIndex: 9999
            }}
          >
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">MID Submission Details</h3>
                  <button
                    onClick={handleCloseMIDSubmissionModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">First Name:</span>{' '}
                        {renderFieldWithHistory('firstName', selectedMIDSubmission.firstName, selectedMIDSubmission.changeHistory)}
                      </div>
                      <div>
                        <span className="font-medium">Last Name:</span>{' '}
                        {renderFieldWithHistory('lastName', selectedMIDSubmission.lastName, selectedMIDSubmission.changeHistory)}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>{' '}
                        {renderFieldWithHistory('email', selectedMIDSubmission.email, selectedMIDSubmission.changeHistory)}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Company Information</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Legal Name:</span>{' '}
                        {renderFieldWithHistory('legalName', selectedMIDSubmission.legalName, selectedMIDSubmission.changeHistory)}
                      </div>
                      <div>
                        <span className="font-medium">Company Type:</span>{' '}
                        {renderFieldWithHistory('companyType', selectedMIDSubmission.companyType, selectedMIDSubmission.changeHistory)}
                      </div>
                      <div>
                        <span className="font-medium">Industry:</span>{' '}
                        {renderFieldWithHistory('industry', selectedMIDSubmission.industry, selectedMIDSubmission.changeHistory)}
                      </div>
                      <div>
                        <span className="font-medium">Employees:</span>{' '}
                        {renderFieldWithHistory('employees', selectedMIDSubmission.employees, selectedMIDSubmission.changeHistory)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="font-medium">Street:</span>{' '}
                      {renderFieldWithHistory('street', selectedMIDSubmission.street, selectedMIDSubmission.changeHistory)}
                    </div>
                    <div><span className="font-medium">P.O. Box:</span> {selectedMIDSubmission.poBox || 'N/A'}</div>
                    <div>
                      <span className="font-medium">Postal Code:</span>{' '}
                      {renderFieldWithHistory('postalCode', selectedMIDSubmission.postalCode, selectedMIDSubmission.changeHistory)}
                    </div>
                    <div>
                      <span className="font-medium">City:</span>{' '}
                      {renderFieldWithHistory('city', selectedMIDSubmission.city, selectedMIDSubmission.changeHistory)}
                    </div>
                    <div>
                      <span className="font-medium">Country:</span>{' '}
                      {renderFieldWithHistory('country', selectedMIDSubmission.country, selectedMIDSubmission.changeHistory)}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Contact Name:</span> {selectedMIDSubmission.contactFirstName} {selectedMIDSubmission.contactLastName}</div>
                    <div><span className="font-medium">Contact Email:</span> {selectedMIDSubmission.contactEmail}</div>
                    <div><span className="font-medium">Contact Phone:</span> {selectedMIDSubmission.contactPhone || 'N/A'}</div>
                    <div><span className="font-medium">Contact Role:</span> {selectedMIDSubmission.contactRole || 'N/A'}</div>
                  </div>
                </div>

                {/* Project Contact */}
                {selectedMIDSubmission.projectContactFirstName && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Project Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedMIDSubmission.projectContactFirstName} {selectedMIDSubmission.projectContactLastName}</div>
                      <div><span className="font-medium">Email:</span> {selectedMIDSubmission.projectContactEmail}</div>
                      <div><span className="font-medium">Phone:</span> {selectedMIDSubmission.projectContactPhone || 'N/A'}</div>
                      <div><span className="font-medium">Role:</span> {selectedMIDSubmission.projectContactRole || 'N/A'}</div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Information</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Company Description:</span>{' '}
                      {renderFieldWithHistory('companyDescription', selectedMIDSubmission.companyDescription, selectedMIDSubmission.changeHistory)}
                    </div>
                    <div>
                      <span className="font-medium">Founding Year:</span>{' '}
                      {renderFieldWithHistory('foundingYear', selectedMIDSubmission.foundingYear, selectedMIDSubmission.changeHistory)}
                    </div>
                    <div><span className="font-medium">Homepage:</span> {selectedMIDSubmission.homepage || 'N/A'}</div>
                    <div>
                      <span className="font-medium">Company Category:</span>{' '}
                      {renderFieldWithHistory('companyCategory', selectedMIDSubmission.companyCategory, selectedMIDSubmission.changeHistory)}
                    </div>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Submission Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Submitted At:</span> {selectedMIDSubmission.submittedAt?.toDate?.().toLocaleString() || 'N/A'}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMIDSubmission.status || 'pending')}`}>
                        {getStatusLabel(selectedMIDSubmission.status)}
                      </span>
                    </div>
                    <div><span className="font-medium">User ID:</span> {selectedMIDSubmission.userId}</div>
                    <div><span className="font-medium">User Email:</span> {selectedMIDSubmission.userEmail}</div>
                  </div>

                  {/* MID Portal Credentials Preview - Show if credentials exist */}
                  {selectedMIDSubmission.midCredentials && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-2.5 bg-purple-100 rounded-lg border border-purple-200">
                            <Key className="h-5 w-5 text-purple-700" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">Auto-Generated MID Portal Credentials</h4>
                            <p className="text-sm text-gray-600">
                              {selectedMIDSubmission.status === 'pending' 
                                ? 'Preview credentials before sending to user' 
                                : 'MID portal login credentials for this organization'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Email */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Portal Email
                            </label>
                            <input
                              type="text"
                              value={selectedMIDSubmission.midCredentials.email || ''}
                              disabled
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-not-allowed"
                            />
                          </div>

                          {/* Username */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Username
                            </label>
                            <input
                              type="text"
                              value={selectedMIDSubmission.midCredentials.username || ''}
                              disabled
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-not-allowed"
                            />
                          </div>

                          {/* Password with Reveal Button */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Password (Encrypted)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type={showAdminPassword ? "text" : "password"}
                                value={showAdminPassword ? decryptedAdminPassword || '' : '••••••••••••'}
                                disabled
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-not-allowed"
                              />
                              <button
                                type="button"
                                onClick={handleRevealAdminPassword}
                                disabled={isDecryptingAdmin}
                                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                              >
                                {isDecryptingAdmin ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : showAdminPassword ? (
                                  <>
                                    <EyeOff className="h-4 w-4" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4" />
                                    Reveal
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Click "Reveal" to decrypt and view the password
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Send Email Button - Only show for pending submissions */}
                      {selectedMIDSubmission.status === 'pending' && (
                        <>
                          <button
                            onClick={handleSendMIDCredentialsEmail}
                            disabled={isSendingEmail}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-sm"
                          >
                            {isSendingEmail ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Sending Email...
                              </>
                            ) : (
                              <>
                                <Mail className="h-5 w-5" />
                                Send Email with Credentials
                              </>
                            )}
                          </button>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            This will send the above credentials to the user via email and mark the submission as "Submitted"
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Show credentials sent info if status is submitted */}
                  {selectedMIDSubmission.status === 'submitted' && selectedMIDSubmission.midCredentials?.sentAt && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ Credentials email sent on {selectedMIDSubmission.midCredentials.sentAt?.toDate?.().toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast for Email Sent */}
        {showEmailSentSuccess && (
          <div className="fixed bottom-6 right-6 z-[99999] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 border border-green-500">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Email Sent Successfully!</p>
                <p className="text-sm text-green-100">MID credentials have been sent to the user.</p>
              </div>
            </div>
          </div>
        )}


        {/* Error Toast */}
        {errorToast.show && (
          <div className="fixed bottom-6 right-6 z-[99999] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 border border-red-500 max-w-md">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full flex-shrink-0">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm text-red-100">{errorToast.message}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  export default Dashboard; 