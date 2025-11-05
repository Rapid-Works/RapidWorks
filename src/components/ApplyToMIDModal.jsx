'use client';

import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle, FileText, Building, User, MapPin, CreditCard, Info, Edit2, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { saveMIDFormSubmission, createDigitalSignatureHash } from '../services/midFormService';
import { getOrganizationInfo } from '../utils/organizationService';
import { getCurrentUserContext } from '../utils/organizationService';
import { checkMIDFieldsCompletion } from '../utils/midFieldsChecker';
import { useLanguage } from '../contexts/LanguageContext';
import { isPostalCodeInNRW } from '../utils/nrwPostalCodes';

const ApplyToMIDModal = ({ isOpen, onClose, onSuccess, onNavigateToCompanyInfo, hasMIDSubmission }) => {
  const { currentUser } = useAuth();
  const context = useLanguage();
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [digitalSignatureAccepted, setDigitalSignatureAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState('');
  const [isLargeOrganization, setIsLargeOrganization] = useState(false);
  const [hasTooManyEmployees, setHasTooManyEmployees] = useState(false);
  const [isNotInNRW, setIsNotInNRW] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState(null);

  // Translation object
  const translations = {
    en: {
      modal: {
        title: "Apply to MID",
        introText: "Please review your information carefully before proceeding. Make sure all details are correct.",
        companyInfo: "Company Information",
        contactInfo: "Contact Information",
        address: "Address",
        bankingInfo: "Banking Information",
        privacyPolicy: {
          title: "Privacy Policy Acceptance",
          text: "I have read and accept the",
          linkText: "MID privacy policy",
          agreement: "and agree to the processing of my data for the MID application."
        },
        digitalSignature: {
          title: "Digital Signature",
          confirmation: "I hereby confirm that all information provided in this MID application is true and accurate to the best of my knowledge.",
          terms: "I have taken note of the",
          termsBold: "general terms and conditions",
          termsAgreement: "and mandate RapidWorks accordingly to use my data for the registration and application of the MID Digitalization Voucher NRW in my name."
        },
        buttons: {
          cancel: "Cancel",
          changeEntries: "Change entries",
          submit: "Submit Application",
          submitting: "Submitting...",
          submitted: "Submitted Successfully!",
          goToCompanyInfo: "Go to Company Information",
          editCompanyInfo: "Edit Company Information"
        },
        alerts: {
          existingApplication: "Existing Application Found",
          existingApplicationText: "You already have a MID application. Submitting again will update your existing application with any changes you've made.",
          missingInfo: "Missing Required Information",
          missingInfoText: "Please complete all MID-required fields in your Company Information before applying. The following fields are missing:",
          privacyRequired: "Please accept the privacy policy to continue.",
          signatureRequired: "Please accept the digital signature to continue.",
          termsRequired: "Please accept the terms and conditions to continue.",
          submitError: "Failed to submit MID application. Please try again.",
          notEligible: "Not Eligible for MID Applications",
          notInNRW: "The postal code is not in North Rhine-Westphalia. MID funding is only available for companies located in NRW."
        }
      }
    },
    de: {
      modal: {
        title: "MID-Antrag stellen",
        introText: "Hier aufgelistet siehst du deine Organisationsangaben, welche wir für deine offizielle MID-Registrierung verwenden werden. Bitte überprüfe sorgfältig, dass diese korrekt sind. Wir übernehmen keine Haftung für inkorrekte Angaben.",
        companyInfo: "Unternehmensinformationen",
        contactInfo: "Kontaktinformationen",
        address: "Adresse",
        bankingInfo: "Bankinformationen",
        privacyPolicy: {
          title: "Datenschutzerklärung akzeptieren",
          text: "Ich habe die",
          linkText: "MID-Datenschutzerklärung",
          agreement: "gelesen und akzeptiert und stimme der Verarbeitung meiner Daten für den MID-Antrag zu."
        },
        digitalSignature: {
          title: "Digitale Signatur",
          confirmation: "Ich bestätige, dass alle Angaben in diesem MID-Antrag nach meinem besten Wissen wahrheitsgemäß und korrekt sind.",
          terms: "Ich habe die",
          termsBold: "allgemeinen Geschäftsbestimmungen",
          termsAgreement: "zur Kenntnis genommen und mandatiere RapidWorks entsprechend dieser dazu, meine Daten zur Registrierung und Beantragung des MID Digitalisierungs Gutscheins NRW in meinem Namen zu verwenden."
        },
        buttons: {
          cancel: "Abbrechen",
          changeEntries: "Einträge ändern",
          submit: "Antrag einreichen",
          submitting: "Wird eingereicht...",
          submitted: "Erfolgreich eingereicht!",
          goToCompanyInfo: "Zu Unternehmensinformationen",
          editCompanyInfo: "Unternehmensinformationen bearbeiten"
        },
        alerts: {
          existingApplication: "Bestehender Antrag gefunden",
          existingApplicationText: "Sie haben bereits einen MID-Antrag. Eine erneute Einreichung aktualisiert Ihren bestehenden Antrag mit allen vorgenommenen Änderungen.",
          missingInfo: "Fehlende erforderliche Informationen",
          missingInfoText: "Bitte vervollständigen Sie alle MID-erforderlichen Felder in Ihren Unternehmensinformationen, bevor Sie sich bewerben. Die folgenden Felder fehlen:",
          privacyRequired: "Bitte akzeptieren Sie die Datenschutzerklärung, um fortzufahren.",
          signatureRequired: "Bitte akzeptieren Sie die digitale Signatur, um fortzufahren.",
          termsRequired: "Bitte akzeptieren Sie die Geschäftsbedingungen, um fortzufahren.",
          submitError: "MID-Antrag konnte nicht eingereicht werden. Bitte versuchen Sie es erneut.",
          notEligible: "Nicht berechtigt für MID-Anträge",
          notInNRW: "Die Postleitzahl befindet sich nicht in Nordrhein-Westfalen. MID-Förderungen sind nur für Unternehmen in NRW verfügbar."
        }
      }
    }
  };

  const { language } = context;
  const t = translations[language] || translations.en;

  useEffect(() => {
    if (isOpen && currentUser) {
      loadMIDData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser]);

  // Check if there are unsaved changes (checkboxes checked but not submitted)
  const hasChanges = useMemo(() => {
    return (privacyAccepted || digitalSignatureAccepted || termsAccepted) && !showSuccess;
  }, [privacyAccepted, digitalSignatureAccepted, termsAccepted, showSuccess]);

  // Handle browser beforeunload
  useEffect(() => {
    if (!hasChanges || !isOpen) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, isOpen]);

  // Reset state when modal closes to ensure fresh data on next open
  useEffect(() => {
    if (!isOpen) {
      setSubmissionData(null);
      setMissingFields([]);
      setLoading(true);
      setShowSuccess(false);
      setPrivacyAccepted(false);
      setDigitalSignatureAccepted(false);
      setTermsAccepted(false);
      setIsInCooldown(false);
      setCooldownMessage('');
      setIsNotInNRW(false);
      setShowLeaveConfirm(false);
      setPendingCloseAction(null);
    }
  }, [isOpen]);

  // Add cooldown check function
  const checkCooldownStatus = useCallback(() => {
    if (!submissionData) return;
    
    let inCooldown = false;
    let message = '';
    let reapplyDateStr = '';
    
    // Check MID Digitisation cooldown
    if (submissionData.hasReceivedMIDDigitisation === true && submissionData.lastMIDDigitisationApprovalDate) {
      const approvalDate = new Date(submissionData.lastMIDDigitisationApprovalDate);
      const currentDate = new Date();
      const monthsDiff = (currentDate.getFullYear() - approvalDate.getFullYear()) * 12 + 
                        (currentDate.getMonth() - approvalDate.getMonth());
      
      if (monthsDiff < 24) {
        inCooldown = true;
        const reapplyDate = new Date(approvalDate);
        reapplyDate.setMonth(reapplyDate.getMonth() + 24);
        reapplyDateStr = reapplyDate.toLocaleDateString('de-DE');
        message = `You cannot reapply for MID Digitisation funding yet. You must wait until ${reapplyDateStr} to reapply.`;
      }
    }
    
    // Check MID Digital Security cooldown
    if (submissionData.hasReceivedMIDDigitalSecurity === true && submissionData.lastMIDDigitalSecurityApprovalDate) {
      const approvalDate = new Date(submissionData.lastMIDDigitalSecurityApprovalDate);
      const currentDate = new Date();
      const monthsDiff = (currentDate.getFullYear() - approvalDate.getFullYear()) * 12 + 
                        (currentDate.getMonth() - approvalDate.getMonth());
      
      if (monthsDiff < 24) {
        inCooldown = true;
        const reapplyDate = new Date(approvalDate);
        reapplyDate.setMonth(reapplyDate.getMonth() + 24);
        reapplyDateStr = reapplyDate.toLocaleDateString('de-DE');
        message = `You cannot reapply for MID Digital Security funding yet. You must wait until ${reapplyDateStr} to reapply.`;
      }
    }
    
    setIsInCooldown(inCooldown);
    setCooldownMessage(message);
  }, [submissionData]);

  // Add useEffect to check cooldown when modal opens
  useEffect(() => {
    if (isOpen && submissionData) {
      checkCooldownStatus();
    }
  }, [isOpen, submissionData, checkCooldownStatus]);

  const loadMIDData = async () => {
    try {
      setLoading(true);
      
      // Get user's current organization context
      const userContext = await getCurrentUserContext(currentUser.uid);
      
      if (!userContext || userContext.type !== 'organization' || !userContext.organization?.id) {
        console.error('No organization context found for user');
        const { missingFields: missingFieldsList } = checkMIDFieldsCompletion(null, currentUser.email);
        setSubmissionData(null);
        setMissingFields(missingFieldsList);
        setLoading(false);
        return;
      }
      
      // Load organization information
      const orgData = await getOrganizationInfo(userContext.organization.id);
      
      // Use centralized MID field checker
      const { missingFields: missingFieldsList } = checkMIDFieldsCompletion(orgData, currentUser.email);
      
      if (orgData) {
        // Add user's email to the data
        const dataWithEmail = {
          ...orgData,
          email: currentUser.email
        };
        
        // Check for large organization exclusion
        const isLargeOrg = dataWithEmail.companyCategory === 'large';
        setIsLargeOrganization(isLargeOrg);
        
        // Check for employee count > 250
        const employeeCount = parseInt(dataWithEmail.totalEmployees || dataWithEmail.employees || '0');
        const hasTooMany = !isNaN(employeeCount) && employeeCount >= 250;
        setHasTooManyEmployees(hasTooMany);
        
        // Check if postal code is in NRW
        const postalCode = dataWithEmail.postalCode;
        const notInNRW = postalCode ? !isPostalCodeInNRW(postalCode) : false;
        setIsNotInNRW(notInNRW);
        
        setSubmissionData(dataWithEmail);
        setMissingFields(missingFieldsList);
      } else {
        setSubmissionData(null);
        setMissingFields(missingFieldsList);
        setIsLargeOrganization(false);
        setHasTooManyEmployees(false);
        setIsNotInNRW(false);
      }
    } catch (error) {
      console.error('Error loading organization data for MID:', error);
      const { missingFields: missingFieldsList } = checkMIDFieldsCompletion(null, currentUser.email);
      setSubmissionData(null);
      setMissingFields(missingFieldsList);
    } finally {
      setLoading(false);
    }
  };

  // Remove step navigation functions as we're combining into one step

  const handleSubmit = async () => {
    if (!privacyAccepted) {
      alert(t.modal.alerts.privacyRequired);
      return;
    }
    if (!digitalSignatureAccepted) {
      alert(t.modal.alerts.signatureRequired);
      return;
    }
    if (!termsAccepted) {
      alert(t.modal.alerts.termsRequired);
      return;
    }
    
    // Check for large organization exclusion
    if (isLargeOrganization) {
      alert('Large enterprises are not eligible for MID applications. Please contact us for alternative funding options.');
      return;
    }
    
    // Check for employee count > 250
    if (hasTooManyEmployees) {
      alert('Organizations with 250 or more employees are not eligible for MID applications. Please contact us for alternative funding options.');
      return;
    }
    
    // Check if postal code is in NRW
    if (isNotInNRW) {
      alert('MID funding is only available for companies located in North Rhine-Westphalia (NRW). Please update your postal code to a valid NRW postal code.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check 24-month cooldown for MID Digitisation funding
      if (submissionData.hasReceivedMIDDigitisation === true && submissionData.lastMIDDigitisationApprovalDate) {
        const approvalDate = new Date(submissionData.lastMIDDigitisationApprovalDate);
        const currentDate = new Date();
        const monthsDiff = (currentDate.getFullYear() - approvalDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - approvalDate.getMonth());
        
        if (monthsDiff < 24) {
          // Calculate when they can reapply
          const reapplyDate = new Date(approvalDate);
          reapplyDate.setMonth(reapplyDate.getMonth() + 24);
          const reapplyDateStr = reapplyDate.toLocaleDateString('de-DE');
          
          alert(`24-Month Cooldown Active\n\nYou cannot reapply for MID Digitisation funding yet. You must wait until ${reapplyDateStr} to reapply.\n\nYou don't need to do anything now - we will email you shortly before your cooldown period ends to remind you about reapplying.`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Check 24-month cooldown for MID Digital Security funding
      if (submissionData.hasReceivedMIDDigitalSecurity === true && submissionData.lastMIDDigitalSecurityApprovalDate) {
        const approvalDate = new Date(submissionData.lastMIDDigitalSecurityApprovalDate);
        const currentDate = new Date();
        const monthsDiff = (currentDate.getFullYear() - approvalDate.getFullYear()) * 12 + 
                          (currentDate.getMonth() - approvalDate.getMonth());
        
        if (monthsDiff < 24) {
          // Calculate when they can reapply
          const reapplyDate = new Date(approvalDate);
          reapplyDate.setMonth(reapplyDate.getMonth() + 24);
          const reapplyDateStr = reapplyDate.toLocaleDateString('de-DE');
          
          alert(`24-Month Cooldown Active\n\nYou cannot reapply for MID Digital Security funding yet. You must wait until ${reapplyDateStr} to reapply.\n\nYou don't need to do anything now - we will email you shortly before your cooldown period ends to remind you about reapplying.`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create digital signature hash
      const signatureHash = createDigitalSignatureHash(submissionData);
      
      // Prepare MID submission data from organization data
      const midSubmissionData = {
        ...submissionData,
        email: currentUser.email,
        submittedBy: currentUser.uid,
        userEmail: currentUser.email,
        status: 'submitted',
        signatureHash: signatureHash,
        digitalSignature: {
          accepted: true,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
        submittedViaFinancing: true,
        finalSubmissionDate: new Date().toISOString(),
      };
      
      // Create new MID submission from organization data
      await saveMIDFormSubmission(midSubmissionData, currentUser.uid);
      
      // Show success feedback
      setShowSuccess(true);
      
      // Wait 2 seconds, then close modal
      setTimeout(() => {
        // Reset state
        setPrivacyAccepted(false);
        setDigitalSignatureAccepted(false);
        setTermsAccepted(false);
        setShowSuccess(false);
        
        // Close modal and notify success
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Error submitting MID application:', error);
      alert(t.modal.alerts.submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user can leave
  const checkCanLeave = (action) => {
    if (!hasChanges) {
      if (action) action();
      return true;
    }

    setPendingCloseAction(() => action);
    setShowLeaveConfirm(true);
    return false;
  };

  // Handle confirmed leave
  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    setPrivacyAccepted(false);
    setDigitalSignatureAccepted(false);
    setTermsAccepted(false);
    setShowSuccess(false);
    if (pendingCloseAction) {
      pendingCloseAction();
      setPendingCloseAction(null);
    }
  };

  // Handle cancel leave
  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
    setPendingCloseAction(null);
  };

  const handleClose = () => {
    checkCanLeave(() => {
      setPrivacyAccepted(false);
      setDigitalSignatureAccepted(false);
      setTermsAccepted(false);
      setShowSuccess(false);
      onClose();
    });
  };

  if (!context) {
    return null;
  }

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 px-8 py-6 flex items-center justify-between border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t.modal.title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3BEC]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Info message if user already has a MID submission */}
              {hasMIDSubmission && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">{t.modal.alerts.existingApplication}</h3>
                          <p className="text-sm text-blue-700 mb-3">
                            {t.modal.alerts.existingApplicationText}
                          </p>
                      <button
                        onClick={() => {
                          handleClose();
                          if (onNavigateToCompanyInfo) {
                            onNavigateToCompanyInfo();
                          }
                        }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Edit2 className="h-4 w-4" />
                            {t.modal.buttons.editCompanyInfo}
                          </button>
                    </div>
                  </div>
                </div>
              )}

              {missingFields.length > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-900 mb-2">{t.modal.alerts.missingInfo}</h3>
                          <p className="text-sm text-red-700 mb-4">
                            {t.modal.alerts.missingInfoText}
                          </p>
                      <div className="bg-white rounded-lg p-4">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {missingFields.map((field, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-red-800">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              {field}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => {
                          handleClose();
                          if (onNavigateToCompanyInfo) {
                            onNavigateToCompanyInfo(missingFields);
                          }
                        }}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            {t.modal.buttons.goToCompanyInfo}
                          </button>
                    </div>
                  </div>
                </div>
              ) : submissionData ? (
                <>
                  {/* Cooldown Warning Banner */}
                  {isInCooldown && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            24-Month Cooldown Active
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{cooldownMessage}</p>
                            <p className="mt-1">You don't need to do anything now - we will email you shortly before your cooldown period ends to remind you about reapplying.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Large Organization Exclusion Banner */}
                  {isLargeOrganization && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {t.modal.alerts.notEligible}
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Large enterprises are not eligible for MID applications. Please contact us for alternative funding options.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Employee Count Exclusion Banner */}
                  {hasTooManyEmployees && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {t.modal.alerts.notEligible}
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Organizations with 250 or more employees are not eligible for MID applications. Please contact us for alternative funding options.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NRW Postal Code Exclusion Banner */}
                  {isNotInNRW && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {t.modal.alerts.notEligible}
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{t.modal.alerts.notInNRW}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Intro Text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      {t.modal.introText}
                    </p>
                  </div>

                  {/* Company Information */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <Building className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{t.modal.companyInfo}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Legal Name" value={submissionData.legalName} />
                      <InfoItem label="Company Type" value={submissionData.companyType} />
                      <InfoItem label="Industry" value={submissionData.industry} />
                      <InfoItem label="Company Category" value={submissionData.companyCategory} />
                      <InfoItem label="Employees" value={submissionData.employees} />
                      <InfoItem label="Founding Year" value={submissionData.foundingYear} />
                      <InfoItem label="Homepage" value={submissionData.homepage} />
                      <InfoItem label="Tax ID" value={submissionData.taxId} />
                    </div>
                    <div className="mt-4">
                      <InfoItem label="Company Description" value={submissionData.companyDescription} fullWidth />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{t.modal.contactInfo}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="First Name" value={submissionData.contactFirstName} />
                      <InfoItem label="Last Name" value={submissionData.contactLastName} />
                      <InfoItem label="Email" value={submissionData.email} />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{t.modal.address}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="Street" value={submissionData.street} />
                      <InfoItem label="City" value={submissionData.city} />
                      <InfoItem label="Postal Code" value={submissionData.postalCode} />
                      <InfoItem label="Country" value={submissionData.country} />
                    </div>
                  </div>

                  {/* Banking Information */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{t.modal.bankingInfo}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem label="IBAN" value={submissionData.iban} />
                      <InfoItem label="BIC" value={submissionData.bic} />
                      <InfoItem label="Bank Name" value={submissionData.bankName} />
                      <InfoItem label="Account Holder" value={submissionData.accountHolderName} />
                    </div>
                  </div>

                  {/* Privacy Policy */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.modal.privacyPolicy.title}</h3>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="privacy-modal"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300 rounded"
                      />
                      <label htmlFor="privacy-modal" className="text-sm text-gray-700">
                        {t.modal.privacyPolicy.text}{' '}
                        <a 
                          href="https://antrag.mittelstand-innovativ-digital.nrw/index.php?index=131" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#7C3BEC] hover:underline"
                        >
                          {t.modal.privacyPolicy.linkText}
                        </a>{' '}
                        {t.modal.privacyPolicy.agreement}
                      </label>
                    </div>
                  </div>

                  {/* Digital Signature */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.modal.digitalSignature.title}</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="digital-signature-modal"
                          checked={digitalSignatureAccepted}
                          onChange={(e) => setDigitalSignatureAccepted(e.target.checked)}
                          className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300 rounded"
                        />
                        <label htmlFor="digital-signature-modal" className="text-sm text-gray-700">
                          {t.modal.digitalSignature.confirmation}
                        </label>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms-conditions-modal"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300 rounded"
                        />
                        <label htmlFor="terms-conditions-modal" className="text-sm text-gray-700">
                          {t.modal.digitalSignature.terms} <strong>{t.modal.digitalSignature.termsBold}</strong> {t.modal.digitalSignature.termsAgreement}
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 font-medium"
            >
              {t.modal.buttons.cancel}
            </button>
            {missingFields.length === 0 && submissionData && (
              <button
                onClick={() => {
                  handleClose();
                  if (onNavigateToCompanyInfo) {
                    onNavigateToCompanyInfo();
                  }
                }}
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-white border border-gray-300 rounded-lg transition-all duration-200 font-medium"
              >
                {t.modal.buttons.changeEntries}
              </button>
            )}
            {missingFields.length === 0 && submissionData && (
              <button
                onClick={handleSubmit}
                disabled={!privacyAccepted || !digitalSignatureAccepted || !termsAccepted || isSubmitting || showSuccess || isInCooldown || isLargeOrganization || hasTooManyEmployees || isNotInNRW}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm ${
                  showSuccess
                    ? 'bg-gradient-to-r from-green-600 to-green-700'
                    : !privacyAccepted || !digitalSignatureAccepted || !termsAccepted || isSubmitting || isInCooldown || isLargeOrganization || hasTooManyEmployees || isNotInNRW
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 opacity-60 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-md'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t.modal.buttons.submitting}
                  </>
                ) : showSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t.modal.buttons.submitted}
                  </>
                ) : isInCooldown ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Cannot Submit (Cooldown Active)
                  </>
                ) : isLargeOrganization ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Not Eligible (Large Organization)
                  </>
                ) : hasTooManyEmployees ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Not Eligible (Too Many Employees)
                  </>
                ) : isNotInNRW ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Not Eligible (Not in NRW)
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    {t.modal.buttons.submit}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  const modalWithConfirmation = (
    <>
      {modalContent}
      
      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[999999] p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'de' ? 'Ungespeicherte Änderungen' : 'Unsaved Changes'}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                {language === 'de' 
                  ? 'Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren? Alle Änderungen gehen verloren.'
                  : 'You have unsaved changes. Are you sure you want to leave? All changes will be lost.'}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelLeave}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  {language === 'de' ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  onClick={handleConfirmLeave}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  {language === 'de' ? 'Verlassen' : 'Leave'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );

  return createPortal(modalWithConfirmation, document.body);
};

// Helper component for displaying information
const InfoItem = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'col-span-full' : ''}>
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-sm text-gray-900">{value || 'N/A'}</p>
  </div>
);

export default ApplyToMIDModal;

