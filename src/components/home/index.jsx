'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Mail, 
  Building2, 
  Send,
  Loader2,
  ArrowRight,
  FileCheck,
  Euro,
  Calendar,
  Users,
  CheckCircle,
  Play,
  User
} from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useAuth } from '../../contexts/AuthContext';
import CalendlyModal from '../CalendlyModal';
import ProfileEditModal from '../ProfileEditModal';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';

export const HomePage = ({ onNavigateToTab, onNavigateToMIDWithFields, onOpenInviteModal, currentContext }) => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const { 
    loading, 
    progress, 
    completedTasks, 
    totalTasks, 
    tasks,
    midFieldsStatus,
    sendVerificationEmail,
    markTaskComplete,
    markTaskSkipped,
    refreshOnboarding,
    checkProfileCompletion,
    markProfileCompleted
  } = useOnboarding();
  
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isCalendlyModalOpen, setIsCalendlyModalOpen] = useState(false);
  const [showOptOutModal, setShowOptOutModal] = useState(false);
  const [optOutReason, setOptOutReason] = useState('');
  const [isSubmittingOptOut, setIsSubmittingOptOut] = useState(false);
  const [optOutSuccess, setOptOutSuccess] = useState(false);
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Refresh onboarding data when component mounts (useful when redirected to dashboard)
  useEffect(() => {
    if (currentUser && refreshOnboarding) {
      console.log('🔄 Refreshing onboarding data on HomePage mount');
      refreshOnboarding();
    }
  }, [currentUser, refreshOnboarding]);

  const handleSendVerificationEmail = async () => {
    setSendingEmail(true);
    const result = await sendVerificationEmail();
    setSendingEmail(false);
    
    if (result.success) {
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 5000);
    }
  };

  const handleRefreshEmailStatus = () => {
    if (currentUser && refreshOnboarding) {
      console.log('🔄 Refreshing email verification status');
      refreshOnboarding();
    }
  };

  const handleProfileCompleted = async () => {
    try {
      await markProfileCompleted();
      console.log('✅ Profile completion marked in onboarding');
    } catch (error) {
      console.error('Error marking profile as completed:', error);
    }
  };

  const handleOptOutSubmit = async () => {
    if (!optOutReason.trim()) {
      alert('Please provide a reason for not applying to MID.');
      return;
    }

    setIsSubmittingOptOut(true);
    try {
      // Mark MID step as skipped
      await markTaskComplete('midSkipped');
      
      // Send notification to Yannick using Firebase function
      const sendOptOutNotification = httpsCallable(functions, 'sendOptOutNotification');
      await sendOptOutNotification({
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        reason: optOutReason,
        timestamp: new Date().toISOString()
      });
      
      // Show success state in modal
      setOptOutSuccess(true);
      
      // Auto-close modal after 3 seconds
      setTimeout(() => {
        handleCloseOptOutModal();
      }, 3000);
    } catch (error) {
      console.error('Error submitting opt-out:', error);
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsSubmittingOptOut(false);
    }
  };

  const handleCloseOptOutModal = () => {
    setShowOptOutModal(false);
    setOptOutReason('');
    setOptOutSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3BEC]" />
      </div>
    );
  }

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'there';
  
  // Check if user is a non-admin member (invited user)
  // This includes users who:
  // 1. Are in an organization context
  // 2. Are NOT the admin (role !== 'admin')
  // 3. Are NOT rapid-works.io staff
  // 4. Have a role of 'member' or no specific role
  const isNonAdminMember = currentContext?.type === 'organization' && 
    currentContext?.permissions?.role !== 'admin' && 
    !currentUser?.email?.endsWith('@rapid-works.io') &&
    (currentContext?.permissions?.role === 'member' || !currentContext?.permissions?.role);


  // Show different content for invited users (non-admin members)
  if (isNonAdminMember) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userName}! 👋
            </h1>
          <p className="text-gray-500 text-lg">
            Everything has been set up for you by your admin
          </p>
        </div>

        {/* Success Message - Minimalistic */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            You're all set! 🎉
          </h2>
          <p className="text-gray-600 text-lg">
            Your organization has been fully configured and you're ready to start using the platform.
          </p>
        </div>
      </div>
    );
  }

  const onboardingTasks = [
    {
      id: 'emailVerified',
      stepNumber: 1,
      title: 'Verify your email',
      description: 'Confirm your email address to secure your account',
      completed: tasks.emailVerified,
      icon: Mail,
      color: 'blue',
      action: tasks.emailVerified ? null : (
        <div className="flex flex-col gap-2 mt-3">
          {!emailSent ? (
            <button
              onClick={handleSendVerificationEmail}
              disabled={sendingEmail}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Resend Email
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Email sent! Check your inbox
            </div>
          )}
          <button
            onClick={handleRefreshEmailStatus}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Already verified? Refresh
          </button>
        </div>
      ),
    },
    {
      id: 'profileCompleted',
      stepNumber: 2,
      title: 'Complete Profile',
      description: tasks.profileCompleted 
        ? 'Profile completed!' 
        : checkProfileCompletion() 
          ? 'Profile needs completion - first and last name required'
          : 'Add your first and last name to complete your profile',
      completed: tasks.profileCompleted,
      icon: User,
      color: checkProfileCompletion() ? 'orange' : 'purple',
      requiresPrevious: true,
      action: tasks.profileCompleted ? null : (
        <div className="mt-3 space-y-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
              checkProfileCompletion() 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-[#7C3BEC] hover:bg-[#6B32D6]'
            }`}
          >
            <User className="h-4 w-4" />
            Complete Profile
            <ArrowRight className="h-4 w-4" />
          </button>
          {checkProfileCompletion() && (
            <p className="text-xs text-orange-700">
              First and last name must be filled to continue
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'organizationCreated',
      stepNumber: 3,
      title: 'Create your organization',
      description: 'Fill out your organization form to get started',
      completed: tasks.organizationCreated,
      icon: Building2,
      color: 'purple',
      requiresPrevious: true,
      action: tasks.organizationCreated ? null : (
        <div className="mt-3 space-y-3">
          <button
            onClick={() => {
              // Navigate to organization form with returnTo parameter
              router.push('/dashboard?tab=mid&returnTo=home');
              onNavigateToTab('mid');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3BEC] hover:bg-[#6B32D6] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Create Organization
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Already part of an organization? Reach out to your admin to add you.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'midApplied',
      stepNumber: 4,
      title: 'Apply to MID Funding',
      description: midFieldsStatus.isLoading
        ? 'Checking MID requirements...'
        : tasks.midSkipped
          ? 'MID application skipped - you can proceed to the next step'
          : midFieldsStatus.hasMIDSubmission 
            ? 'MID application submitted!' 
            : midFieldsStatus.allFieldsFilled 
              ? 'Apply for up to €15,000 in MID funding' 
              : 'Complete required fields to apply for MID funding',
      completed: tasks.midApplied || tasks.midSkipped,
      icon: midFieldsStatus.isLoading ? Loader2 : (midFieldsStatus.allFieldsFilled ? Euro : FileCheck),
      color: midFieldsStatus.isLoading ? 'gray' : (midFieldsStatus.allFieldsFilled ? 'green' : 'orange'),
      requiresPrevious: true,
      action: (tasks.midApplied || tasks.midSkipped) ? null : (
        <div className="mt-3">
          {midFieldsStatus.isLoading ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking requirements...
            </div>
          ) : midFieldsStatus.allFieldsFilled ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  // Navigate to Rapid Financing and auto-open MID modal
                  router.push('/dashboard?tab=financing&openMID=true');
                  onNavigateToTab('financing');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-medium rounded-lg transition-all shadow-sm"
              >
                <Euro className="h-4 w-4" />
                Apply for €15,000 MID Funding
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => {
                  // Open opt-out modal
                  setShowOptOutModal(true);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip this step
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => {
                  // Pass missing fields data to Dashboard and navigate to MID form
                  if (onNavigateToMIDWithFields) {
                    onNavigateToMIDWithFields(midFieldsStatus.missingFields);
                  } else {
                    // Fallback to regular navigation
                    router.push('/dashboard?tab=mid&returnTo=home');
                    onNavigateToTab('mid');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FileCheck className="h-4 w-4" />
                Complete Required Fields
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-orange-700">
                {midFieldsStatus.missingFields.length} required fields need to be filled
              </p>
              
              <div className="text-center">
                <button
                  onClick={() => {
                    // Open opt-out modal
                    setShowOptOutModal(true);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip this step
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'bookingCallCompleted',
      stepNumber: 5,
      title: 'Book a Free Coaching Call',
      description: tasks.bookingCallCompleted 
        ? 'Coaching call booked!' 
        : 'Schedule a free 30-minute coaching session with our team',
      completed: tasks.bookingCallCompleted,
      icon: Calendar,
      color: 'blue',
      requiresPrevious: true,
      action: tasks.bookingCallCompleted ? null : (
        <div className="mt-3 space-y-3">
          <button
            onClick={() => setIsCalendlyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Book Your Call on Calendly
          </button>
        </div>
      ),
    },
    {
      id: 'coworkersInvited',
      stepNumber: 6,
      title: 'Invite Your Coworkers',
      description: tasks.coworkersInvited === true 
        ? 'Team members invited!' 
        : tasks.coworkersInvited === 'skipped'
        ? 'Invite task skipped'
        : 'Invite your colleagues to join your organization',
      completed: tasks.coworkersInvited === true || tasks.coworkersInvited === 'skipped',
      icon: Users,
      color: 'purple',
      requiresPrevious: true,
      action: tasks.coworkersInvited === true ? null : (
        <div className="mt-3 space-y-3">
          <button
            onClick={async () => {
              // Open invite modal directly
              if (onOpenInviteModal) {
                onOpenInviteModal();
              } else {
                // Fallback: navigate to members tab and open invite modal
                router.push('/dashboard?tab=members&openInvite=true');
                onNavigateToTab('members');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Users className="h-4 w-4" />
            Invite Team Members
          </button>
          {tasks.coworkersInvited !== 'skipped' && (
            <div className="text-center">
              <button
                onClick={async () => {
                  try {
                    await markTaskSkipped('coworkersInvited');
                    console.log('✅ Coworkers invite task marked as skipped');
                  } catch (error) {
                    console.error('Error marking task skipped:', error);
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      ),
    },
    // {
    //   id: 'walkthroughCompleted',
    //   stepNumber: 6,
    //   title: 'Platform Walkthrough',
    //   description: tasks.walkthroughCompleted 
    //     ? 'Walkthrough completed!' 
    //     : 'Watch a quick video to learn how to use the platform',
    //   completed: tasks.walkthroughCompleted,
    //   icon: Play,
    //   color: 'indigo',
    //   requiresPrevious: true,
    //   action: tasks.walkthroughCompleted ? null : (
    //     <div className="mt-3 space-y-3">
    //       <button
    //         onClick={() => {
    //           setShowWalkthroughModal(true);
    //         }}
    //         className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
    //       >
    //         <Play className="h-4 w-4" />
    //         Watch Walkthrough
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userName} 👋
        </h1>
        <p className="text-gray-500 text-lg">
          Let's get your account set up in {totalTasks} simple steps
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-[#7C3BEC] to-[#9F7AEA] rounded-2xl p-8 mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-white/90 text-sm font-medium mb-1">Your Progress</div>
            <div className="text-white text-2xl font-bold">
              {completedTasks} of {totalTasks} steps completed
            </div>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="text-white text-xl font-bold">{progress}%</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {onboardingTasks.map((task, index) => {
          const Icon = task.icon;
          const isCompleted = task.completed;
          
          // Check if this task is locked (requires previous task to be completed)
          const previousTask = index > 0 ? onboardingTasks[index - 1] : null;
          const isLocked = task.requiresPrevious && previousTask && !previousTask.completed;
          
          const taskColor = task.color || 'purple';
          
          // Define color classes
          const colorClasses = {
            purple: { bg: 'bg-purple-100', text: 'text-[#7C3BEC]' },
            blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
            green: { bg: 'bg-green-100', text: 'text-green-600' },
            orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
            gray: { bg: 'bg-gray-100', text: 'text-gray-400' }
          };
          
          const currentColor = colorClasses[taskColor] || colorClasses.purple;
          
          return (
            <div
              key={task.id}
              className={`group relative bg-white rounded-2xl transition-all duration-300 ${
                isCompleted 
                  ? 'border-2 border-green-100' 
                  : isLocked
                  ? 'border border-gray-100 opacity-50'
                  : 'border border-gray-200 hover:border-[#7C3BEC]/30 hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                      : isLocked
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gradient-to-br from-[#7C3BEC] to-[#9F7AEA] text-white shadow-lg shadow-purple-500/30'
                  }`}>
                    {isCompleted ? '✓' : task.stepNumber}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        isCompleted 
                          ? 'text-gray-400' 
                          : isLocked
                          ? 'text-gray-400'
                          : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      {isCompleted && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          (task.id === 'midApplied' && tasks.midSkipped) || (task.id === 'coworkersInvited' && tasks.coworkersInvited === 'skipped')
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {(task.id === 'midApplied' && tasks.midSkipped) || (task.id === 'coworkersInvited' && tasks.coworkersInvited === 'skipped') ? 'Skipped' : '✓ Completed'}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed mb-1 ${
                      isLocked ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {isLocked ? `Complete step ${task.stepNumber - 1} first` : task.description}
                    </p>
                    
                    {/* Action Button */}
                    {task.action && !isLocked && task.action}
                  </div>

                  {/* Icon - positioned absolutely on the right */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-50' 
                      : isLocked
                      ? 'bg-gray-50'
                      : currentColor.bg
                  }`}>
                    <Icon className={`h-6 w-6 ${isLocked ? 'text-gray-400' : isCompleted ? 'text-green-600' : currentColor.text} ${Icon === Loader2 ? 'animate-spin' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/* Calendly Modal */}
      <CalendlyModal
        isOpen={isCalendlyModalOpen}
        onClose={() => setIsCalendlyModalOpen(false)}
        userName={currentUser?.displayName || currentUser?.email?.split('@')[0] || ''}
        userEmail={currentUser?.email || ''}
        onBookingComplete={() => {
          // Automatically mark the booking call task as complete
          markTaskComplete('bookingCallCompleted');
          console.log('✅ Booking call task marked as complete');
        }}
      />

      {/* MID Opt-Out Modal */}
      {showOptOutModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {!optOutSuccess ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Skip MID Application
                </h3>
                <p className="text-gray-600 mb-4">
                  We understand you don't want to apply for MID funding right now. 
                  Could you please tell us why? This helps us improve our service.
                </p>
                
                <div className="mb-6">
                  <label htmlFor="optOutReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for not applying to MID
                  </label>
                  <textarea
                    id="optOutReason"
                    value={optOutReason}
                    onChange={(e) => setOptOutReason(e.target.value)}
                    placeholder="Please share your reason (e.g., not eligible, not interested, timing, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3BEC] focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCloseOptOutModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={isSubmittingOptOut}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOptOutSubmit}
                    disabled={isSubmittingOptOut || !optOutReason.trim()}
                    className="px-4 py-2 bg-[#7C3BEC] hover:bg-[#6B32D6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isSubmittingOptOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Skip Step'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for your feedback. You can now proceed to the next step.
                  </p>
                  <button
                    onClick={handleCloseOptOutModal}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Walkthrough Modal */}
      {showWalkthroughModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Platform Walkthrough</h3>
                <button
                  onClick={() => setShowWalkthroughModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* YouTube Video */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/_-AS5DtDeqs"
                    title="RapidWorks Platform Walkthrough"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowWalkthroughModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={async () => {
                    // Mark walkthrough as completed
                    try {
                      await markTaskComplete('walkthroughCompleted');
                      console.log('✅ Walkthrough completed');
                    } catch (error) {
                      console.error('Error marking walkthrough complete:', error);
                    }
                    setShowWalkthroughModal(false);
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Complete Walkthrough
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileCompleted={handleProfileCompleted}
      />
    </div>
  );
};
