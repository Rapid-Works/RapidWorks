'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building, User, FileText, Briefcase, Check, AlertTriangle, Globe, Loader2, PersonStanding, Users, Wand, Wand2Icon, LucideWand2, WandSparklesIcon, WandSparkles, Info } from 'lucide-react';
import { useMIDTranslation } from '../hooks/useMIDTranslation';
import { 
  validateMIDFormData, 
  getUserMIDFormSubmissions,
  validateEmail,
  validateURL,
  validatePostalCode,
  validateTaxId,
  validateIBAN,
  validateBIC,
  validatePhoneNumber,
  validateFTE,
  validateFoundingDate
} from '../services/midFormService';
import { updateOrganizationInfo, getOrganizationInfo, createOrganization } from '../utils/organizationService';
import { useAuth } from '../contexts/AuthContext';
import { usePathname, useSearchParams } from 'next/navigation';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { sendOrganizationCreatedNotification } from '../utils/teamsWebhookService';

const MIDForm = ({ currentContext, missingMIDFields = [], onFieldsUpdated, onOrganizationCreated, onNavigateToTab, onTryLeave }) => {
  const { t, language } = useMIDTranslation();
  const { currentUser: user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Check if we're in creation mode - automatically detect based on user's organization
  // Creation mode is triggered when user has no organization (for non-admin users)
  const isCreationMode = useMemo(() => {
    const userHasNoOrganization = !currentContext?.organization?.id && !user?.email?.endsWith('@rapid-works.io');
    console.log('🔄 isCreationMode:', userHasNoOrganization, 'Has org:', !!currentContext?.organization?.id);
    return userHasNoOrganization;
  }, [currentContext?.organization?.id, user?.email]);
  
  // Initialize form data
  const initialFormData = {
    // User section
    salutation: 'pleaseSelect',
    firstName: '',
    lastName: '',
    
    // Business contact section
    contactSalutation: 'pleaseSelect',
    contactEmail: '',
    contactFirstName: '',
    contactLastName: '',
    contactPhoneAreaCode: '+49', // New field for contact phone area code
    contactPhone: '',
    contactRole: '',
    
    // Company details
    companyType: 'pleaseSelect',
    legalName: '',
    homepage: '',
    
    // Address
    country: 'germany',
    street: '',
    poBox: '',
    postalCode: '',
    city: '',
    
    // Project contact
    projectContactSalutation: 'pleaseSelect',
    projectContactEmail: '',
    projectContactFirstName: '',
    projectContactLastName: '',
    projectContactPhone: '',
    projectContactPhoneAreaCode: '+49', // New field for project contact phone area code
    projectContactRole: '',
    
    // Company description
    companyDescription: '',
    
    // Additional fields
    foundingDate: '', // Renamed from foundingYear
    taxId: '',
    iban: '',
    bic: '',
    bankName: '',
    accountHolderName: '',
    companyCategory: null, // Changed from '' to null for unselected default
    industry: 'pleaseSelect',
    totalEmployees: null, // Split from employees
    fullTimeEquivalents: null, // New field
    streetNumber: '', // Split from street
    phoneAreaCode: '+49', // New field for area code
    phoneNumber: '', // Split from contactPhone
    
    // MID Contact option: null (none selected), 'same' (same as managing director), 'different' (different person)
    midContactOption: null,
    
    // MID funding history - separate for Digitisation and Digital Security
    hasReceivedMIDDigitisation: null,
    lastMIDDigitisationApprovalDate: '',
    hasReceivedMIDDigitalSecurity: null,
    lastMIDDigitalSecurityApprovalDate: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(!isCreationMode); // Skip loading in creation mode
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState(null);
  
  // Real-time validation state
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  
  // Impressum extraction state
  const [impressumUrl, setImpressumUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState('');

  // Map field labels to form field names for highlighting
  const fieldLabelToName = {
    'First Name': 'contactFirstName',
    'Last Name': 'contactLastName',
    'Email': 'email',
    'Legal Name': 'legalName',
    'Company Type': 'companyType',
    'Country': 'country',
    'Street': 'street',
    'Number': 'streetNumber',
    'Postal Code': 'postalCode',
    'City': 'city',
    'Company Description': 'companyDescription',
    'Founding Date': 'foundingDate',
    'Tax ID': 'taxId',
    'IBAN': 'iban',
    'BIC': 'bic',
    'Bank Name': 'bankName',
    'Account Holder Name': 'accountHolderName',
    'Industry': 'industry',
    'Total Number of Employees': 'totalEmployees',
    'Full Time Equivalents': 'fullTimeEquivalents',
    'Company Category': 'companyCategory'
  };

  // Get field names that need highlighting
  const fieldsToHighlight = missingMIDFields.map(label => fieldLabelToName[label]).filter(Boolean);

  // Helper function to get input styling for highlighted fields and validation errors
  const getInputStyling = (fieldName) => {
    const isHighlighted = fieldsToHighlight.includes(fieldName);
    const hasError = fieldErrors[fieldName];
    
    if (hasError) {
      return 'border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-400 text-black placeholder-gray-200';
    }
    
    if (isHighlighted) {
      return 'border-amber-300 bg-amber-50/30 focus:border-amber-400 focus:ring-amber-400 text-black placeholder-gray-200';
    }
    
    return 'border border-gray-200 focus:ring-purple-500 focus:border-transparent text-black placeholder-gray-200';
  };

  // Helper function to render validation error message
  const renderFieldError = (fieldName) => {
    const error = fieldErrors[fieldName];
    if (!error) return null;
    
    return (
      <div className="mt-1 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
        <span className="text-xs text-red-600">{error}</span>
      </div>
    );
  };

  // Helper function to render text with MID pill styling
  // Only the first standalone "MID" becomes a pill, "MID lottery"/"MID-Losverfahren" stays plain text
  const renderTextWithMIDPill = (text) => {
    if (!text) return null;
    
    // Protect "MID lottery" and "MID-Losverfahren" with placeholders
    const placeholders = [];
    let placeholderIndex = 0;
    
    let protectedText = text
      .replace(/MID\s+lottery/gi, () => {
        placeholders.push('MID lottery');
        return `__PLACEHOLDER_${placeholderIndex++}__`;
      })
      .replace(/MID-Losverfahren/gi, () => {
        placeholders.push('MID-Losverfahren');
        return `__PLACEHOLDER_${placeholderIndex++}__`;
      });
    
    // Split by standalone MID (not followed by lottery/Losverfahren)
    const parts = protectedText.split(/(MID)/gi);
    let firstMidFound = false;
    
    return (
      <>
        {parts.map((part, index) => {
          // Restore placeholders first
          let restoredPart = part;
          placeholders.forEach((placeholder, idx) => {
            restoredPart = restoredPart.replace(`__PLACEHOLDER_${idx}__`, placeholder);
          });
          
          // Convert only the first standalone MID to a pill
          if (restoredPart.toUpperCase() === 'MID' && !firstMidFound) {
            firstMidFound = true;
            return (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
            );
          }
          
          return <span key={index}>{restoredPart}</span>;
        })}
      </>
    );
  };

  // Format Tax ID with slashes (allow free typing and deletion)
  // Format: XXX/XXXX/XXXX - slashes appear immediately after each completed segment
  const formatTaxId = (value) => {
    // Remove all slashes first, then extract only digits
    // This handles backspace properly - slashes won't interfere with deletion
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    
    // First segment: 3 digits, show slash immediately after 3rd digit
    if (cleaned.length <= 3) {
      return cleaned.length === 3 ? `${cleaned}/` : cleaned;
    }
    
    // Second segment: 4 more digits (positions 4-7), show slash after 7th digit
    if (cleaned.length <= 7) {
      const firstPart = `${cleaned.slice(0, 3)}/`;
      const secondPart = cleaned.slice(3);
      // Show second slash immediately after completing 7 digits
      return cleaned.length === 7 ? `${firstPart}${secondPart}/` : `${firstPart}${secondPart}`;
    }
    
    // Third segment: remaining digits (allow free typing, validation will catch excess)
    return `${cleaned.slice(0, 3)}/${cleaned.slice(3, 7)}/${cleaned.slice(7)}`;
  };

  // Format IBAN with spaces
  const formatIBAN = (value) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format postal code (strip non-digits, but allow free typing)
  const formatPostalCode = (value) => {
    return value.replace(/\D/g, '');
  };


  // Load existing organization data
  useEffect(() => {
    const loadExistingData = async () => {
      // Skip loading in creation mode
      if (isCreationMode) {
        console.log('📝 Creation mode - skipping data load');
        setIsLoading(false);
        // Set originalFormData to initial empty state for change tracking
        setOriginalFormData({ ...initialFormData });
        setHasChanges(false); // Start with no changes, will be set when user types
        return;
      }
      
      // Wait for user authentication and context to be determined
      if (user === null || !currentContext) {
        return;
      }
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Only load for organization context
      if (currentContext?.type !== 'organization' || !currentContext?.organization?.id) {
        console.warn('⚠️ No organization context available');
        setIsLoading(false);
        return;
      }

      try {
        console.log('📖 Loading organization information:', currentContext.organization.id);
        
        // Load organization data
        const orgData = await getOrganizationInfo(currentContext.organization.id);
        
        if (orgData) {
          console.log('✅ Found organization data:', orgData);
          
          // Populate form with organization data
          const populatedFormData = {
            salutation: orgData.salutation || 'pleaseSelect',
            firstName: orgData.firstName || '',
            lastName: orgData.lastName || '',
            contactSalutation: orgData.contactSalutation || 'pleaseSelect',
            contactEmail: orgData.contactEmail || '',
            contactFirstName: orgData.contactFirstName || '',
            contactLastName: orgData.contactLastName || '',
            contactPhoneAreaCode: orgData.contactPhoneAreaCode || '+49',
            contactPhone: orgData.contactPhone || '',
            contactRole: orgData.contactRole || '',
            companyType: orgData.companyType || 'pleaseSelect',
            legalName: orgData.legalName || orgData.name || '',
            homepage: orgData.homepage || '',
            country: orgData.country || 'germany',
            street: orgData.street || '',
            streetNumber: orgData.streetNumber || '',
            phoneAreaCode: orgData.phoneAreaCode || '+49',
            phoneNumber: orgData.phoneNumber || '',
            poBox: orgData.poBox || '',
            postalCode: orgData.postalCode || '',
            city: orgData.city || '',
            projectContactSalutation: orgData.projectContactSalutation || 'pleaseSelect',
            projectContactEmail: orgData.projectContactEmail || '',
            projectContactFirstName: orgData.projectContactFirstName || '',
            projectContactLastName: orgData.projectContactLastName || '',
            projectContactPhone: orgData.projectContactPhone || '',
            projectContactRole: orgData.projectContactRole || '',
            companyDescription: orgData.companyDescription || '',
            foundingDate: orgData.foundingDate || orgData.foundingYear || '', // Support both old and new field names
            taxId: orgData.taxId || '',
            iban: orgData.iban || '',
            bic: orgData.bic || '',
            bankName: orgData.bankName || '',
            accountHolderName: orgData.accountHolderName || '',
            companyCategory: orgData.companyCategory || null, // Keep null for unselected state
            industry: orgData.industry || 'pleaseSelect',
            employees: orgData.employees || '',
            // Handle backward compatibility: convert old boolean useManagementContactData to new midContactOption
            midContactOption: orgData.midContactOption || (orgData.useManagementContactData === true ? 'same' : (orgData.useManagementContactData === false ? 'different' : null)),
            hasReceivedMIDDigitisation: orgData.hasReceivedMIDDigitisation === true ? 'yes' : 
                                       (orgData.hasReceivedMIDDigitisation === false ? 'no' : null),
            lastMIDDigitisationApprovalDate: orgData.lastMIDDigitisationApprovalDate || '',
            hasReceivedMIDDigitalSecurity: orgData.hasReceivedMIDDigitalSecurity === true ? 'yes' : 
                                          (orgData.hasReceivedMIDDigitalSecurity === false ? 'no' : null),
            lastMIDDigitalSecurityApprovalDate: orgData.lastMIDDigitalSecurityApprovalDate || ''
          };
          
          setFormData(populatedFormData);
          setOriginalFormData(populatedFormData);
          setExistingSubmission(orgData); // Store org data as "existing submission" for form logic
        } else {
          console.log('📋 No organization data found, using defaults');
          // Original form data will be set on first change
        }
        
        // Check if there's a MID submission to show credentials
        const midSubmissions = await getUserMIDFormSubmissions(user.uid);
        if (midSubmissions.length > 0) {
          const latestSubmission = midSubmissions.sort((a, b) => 
            new Date(b.submittedAt?.toDate?.() || b.submittedAt) - 
            new Date(a.submittedAt?.toDate?.() || a.submittedAt)
          )[0];
          
          // Only set MID submission data for credentials display
          if (latestSubmission.midCredentials?.sentAt) {
            setExistingSubmission(prev => ({
              ...prev,
              id: latestSubmission.id,
              midCredentials: latestSubmission.midCredentials
            }));
          }
        }
      } catch (error) {
        console.error('❌ Error loading organization data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [user, currentContext, isCreationMode]);

  // Real-time validation function
  const validateField = (field, value, forceValidation = false) => {
    let error = null;
    
    // For postal code, IBAN, BIC, and Tax ID - validate on blur OR when exceeding expected length
    // Also validate if field has been touched and has content (to clear errors when user fixes them)
    // This provides seamless UX but catches errors when users exceed limits and clears them when fixed
    if (field === 'postalCode') {
      if (forceValidation || value.length > 5 || (fieldTouched[field] && value.length > 0)) {
        error = validatePostalCode(value, language);
      }
    } else if (field === 'iban') {
      // IBAN: 2 letters + 20 digits = 22 chars (without spaces)
      const cleanedIban = value.replace(/\s/g, '');
      if (forceValidation || cleanedIban.length > 22 || (fieldTouched[field] && cleanedIban.length > 0)) {
        error = validateIBAN(value);
      }
    } else if (field === 'bic') {
      // BIC: 8-11 alphanumeric characters
      if (forceValidation || value.length > 11 || (fieldTouched[field] && value.length > 0)) {
        error = validateBIC(value);
      }
    } else if (field === 'taxId') {
      // Tax ID: XXX/XXXX/XXXX format (11 digits = 13 chars with slashes)
      if (forceValidation || value.length > 13 || (fieldTouched[field] && value.length > 0)) {
        error = validateTaxId(value);
      }
    } else {
      // For other fields, validate normally
      switch (field) {
        case 'contactEmail':
        case 'projectContactEmail':
          error = validateEmail(value);
          break;
        case 'homepage':
          error = validateURL(value);
          break;
        case 'contactPhone':
        case 'projectContactPhone':
        case 'phoneNumber':
          error = validatePhoneNumber(value);
          break;
        case 'totalEmployees':
          // No validation in form - only validate when applying to MID
          error = null;
          break;
        case 'fullTimeEquivalents':
          // Convert comma to period for validation (parseFloat needs periods)
          const fteValue = typeof value === 'string' ? value.replace(',', '.') : value;
          error = validateFTE(fteValue);
          break;
        case 'foundingDate':
          error = validateFoundingDate(value);
          break;
        default:
          error = null;
      }
    }
    
    return error;
  };

  const handleInputChange = (field, value) => {
    // Update form data and check for changes in one go
    setFormData(prev => {
      const updatedFormData = { ...prev, [field]: value };
      
      // Check for changes if we have originalFormData to compare against
      if (originalFormData) {
        const hasChanges = JSON.stringify(updatedFormData) !== JSON.stringify(originalFormData);
        setHasChanges(hasChanges);
      }
      
      return updatedFormData;
    });
    
    // For IBAN, BIC, Tax ID, and postal code - validate only when exceeding expected length
    // Otherwise validate on blur (handled in handleFieldBlur) for seamless UX
    if (field === 'postalCode' || field === 'iban' || field === 'bic' || field === 'taxId') {
      // Validate immediately if user exceeds expected length, otherwise wait for blur
      const fieldError = validateField(field, value);
      setFieldErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
      
      // Clear form-level error if this field was causing the error and is now fixed
      if (!fieldError && error) {
        // Re-validate entire form to see if all errors are cleared
        const validateForm = async () => {
          try {
            const { validateMIDFormData } = await import('../services/midFormService');
            // Use functional update to get latest formData
            setFormData(currentFormData => {
              const validation = validateMIDFormData(currentFormData, !!existingSubmission);
              if (validation.isValid) {
                setError('');
              } else {
                // If there are still other errors, update the error message
                // But only if this specific field's error was in the message
                const errorIncludesThisField = error.includes('BIC') && field === 'bic' ||
                                              error.includes('IBAN') && field === 'iban' ||
                                              error.includes('Tax ID') && field === 'taxId' ||
                                              error.includes('Postal code') && field === 'postalCode';
                if (errorIncludesThisField) {
                  // If this was the only error, clear it; otherwise keep other errors
                  if (validation.errors.length === 0 || !validation.errors.some(err => 
                    (field === 'bic' && err.includes('BIC')) ||
                    (field === 'iban' && err.includes('IBAN')) ||
                    (field === 'taxId' && err.includes('Tax ID')) ||
                    (field === 'postalCode' && err.includes('Postal code'))
                  )) {
                    setError('');
                  }
                }
              }
              return currentFormData; // Don't modify formData here
            });
          } catch (err) {
            console.error('Error validating form:', err);
          }
        };
        validateForm();
      }
    } else {
      // For other fields, validate normally
      const fieldError = validateField(field, value);
      setFieldErrors(prev => ({
        ...prev,
        [field]: fieldError
      }));
    }
  };

  // Handle field blur (when user stops typing)
  const handleFieldBlur = (field) => {
    setFieldTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // For fullTimeEquivalents, convert comma to period on blur for storage
    let value = formData[field];
    if (field === 'fullTimeEquivalents' && typeof value === 'string' && language === 'de') {
      value = value.replace(',', '.');
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Re-validate the field after it's been touched (force validation)
    const fieldError = validateField(field, value, true);
    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  // Handle Impressum data extraction
  const handleExtractCompanyData = async () => {
    if (!impressumUrl.trim()) {
        setExtractionError('Please enter a valid Impressum URL.');
      return;
    }

    // Basic URL validation
    try {
      new URL(impressumUrl);
    } catch {
      setExtractionError('Please enter a valid URL (e.g., https://example.com/impressum).');
      return;
    }

    setIsExtracting(true);
    setExtractionError('');

    try {
      // Production: call Firebase function to extract company data
      console.log('🔎 Calling extractImpressumData with URL:', impressumUrl);
      const extractImpressumData = httpsCallable(functions, 'extractImpressumData');
      const result = await extractImpressumData({ url: impressumUrl });
      console.log('✅ extractImpressumData response:', result?.data);

      const extractedData = result.data || {};

      if (extractedData.success) {
        const updates = {};

        if (extractedData.companyName) {
          updates.legalName = extractedData.companyName;
        }
        if (extractedData.address) {
          if (extractedData.address.street) updates.street = extractedData.address.street;
          if (extractedData.address.city) updates.city = extractedData.address.city;
          if (extractedData.address.postalCode) updates.postalCode = extractedData.address.postalCode;
          if (extractedData.address.country) {
            const countryMap = {
              'germany': 'germany',
              'deutschland': 'germany',
              'german': 'germany',
              'austria': 'austria',
              'österreich': 'austria',
              'switzerland': 'switzerland',
              'schweiz': 'switzerland'
            };
            const countryKey = countryMap[String(extractedData.address.country).toLowerCase()];
            if (countryKey) updates.country = countryKey;
          }
        }
        if (extractedData.homepage) {
          updates.homepage = extractedData.homepage;
        }

        setFormData(prev => ({ ...prev, ...updates }));
        setHasChanges(true);
        setExtractionError('');
        console.log('✅ Company data extracted and autofilled:', extractedData);
      } else {
        console.warn('⚠️ Extraction reported failure:', extractedData);
        setExtractionError(extractedData.error || 'Failed to extract company data from the provided URL.');
      }
    } catch (error) {
      console.error('❌ Error extracting company data:', error);
      setExtractionError(error?.message || 'Failed to extract company data. Please check the URL and try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Creation mode validation
    if (isCreationMode) {
      // Validate required fields for creation
      if (!formData.legalName.trim()) {
        setError('Organization name is required.');
        return;
      }
      
      if (!formData.street.trim() || !formData.streetNumber.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
        setError('Complete address (Street, Number, City, Postal Code) is required.');
        return;
      }
      
      
      try {
        await performCreation();
      } catch (error) {
        console.error('❌ Error creating organization:', error);
        setError(error.message || 'Failed to create organization. Please try again.');
      }
      return;
    }
    
    // Edit mode - Check if we have organization context
    if (!currentContext?.organization?.id) {
      setError('Error: No organization selected. Please create or select an organization first.');
      return;
    }
    
    
    try {
      console.log('📝 Form submission started...');
      
      // Validate form data
      const validation = validateMIDFormData(formData, !!existingSubmission);
      if (!validation.isValid) {
        console.error('❌ Form validation failed:', validation.errors);
        setError(`Please fix the following errors:\n${validation.errors.join('\n')}.`);
        return;
      }
      
      // Prepare form data for saving to organization
      const formDataToSave = {
        ...formData,
        // Convert radio button values back to boolean for storage, but preserve null values
        hasReceivedMIDDigitisation: formData.hasReceivedMIDDigitisation === 'yes' ? true : 
                                   formData.hasReceivedMIDDigitisation === 'no' ? false : null,
        hasReceivedMIDDigitalSecurity: formData.hasReceivedMIDDigitalSecurity === 'yes' ? true : 
                                      formData.hasReceivedMIDDigitalSecurity === 'no' ? false : null,
        // Maintain backward compatibility: also save as boolean
        useManagementContactData: formData.midContactOption === 'same'
      };
      
      // Save directly - no confirmation modal for organization info changes
      await performSubmit(formDataToSave);
      
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setError(`${t('errorMessage')}\n\nError: ${error.message}`);
    }
  };

  const performCreation = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('🏢 Creating new organization...');
      
      // Create organization with basic data
      const orgData = {
        name: formData.legalName,
        street: formData.street,
        streetNumber: formData.streetNumber,
        city: formData.city,
        postalCode: formData.postalCode
      };
      
      const organization = await createOrganization(user.uid, orgData);
      console.log('✅ Organization created:', organization.id);
      
      // Now save all the detailed form data to the organization
      const formDataToSave = {
        ...formData,
        // Convert radio button values back to boolean for storage, but preserve null values
        hasReceivedMIDDigitisation: formData.hasReceivedMIDDigitisation === 'yes' ? true : 
                                   formData.hasReceivedMIDDigitisation === 'no' ? false : null,
        hasReceivedMIDDigitalSecurity: formData.hasReceivedMIDDigitalSecurity === 'yes' ? true : 
                                      formData.hasReceivedMIDDigitalSecurity === 'no' ? false : null,
        // Maintain backward compatibility: also save as boolean
        useManagementContactData: formData.midContactOption === 'same'
      };
      await updateOrganizationInfo(organization.id, formDataToSave);
      console.log('✅ Organization details saved');
      
      // Send Teams notification (background, non-blocking)
      try {
        const organizationNotificationData = {
          organizationName: formData.legalName,
          organizationId: organization.id,
          creatorName: user?.displayName || user?.email,
          creatorEmail: user?.email,
          address: {
            street: formData.street,
            streetNumber: formData.streetNumber,
            city: formData.city,
            postalCode: formData.postalCode
          },
          phoneNumber: formData.phoneNumber ? `${formData.phoneAreaCode}${formData.phoneNumber}` : null
        };
        
        console.log('📤 Sending organization creation Teams notification');
        sendOrganizationCreatedNotification(organizationNotificationData)
          .catch(error => console.error('⚠️ Teams notification error (non-critical):', error));
      } catch (error) {
        console.error('⚠️ Teams notification setup failed (non-critical):', error);
      }
      
      // Send welcome WhatsApp message if phone number provided
      if (formData.phoneNumber) {
        try {
          const username = user?.displayName || user?.email?.split('@')[0] || 'User';
          const sendTwilioWhatsApp = httpsCallable(functions, 'sendTwilioWhatsApp');
          
          // Combine area code and phone number
          const fullPhoneNumber = `${formData.phoneAreaCode}${formData.phoneNumber}`;
          
          await sendTwilioWhatsApp({
            phoneNumber: fullPhoneNumber,
            userName: username,
            orgName: formData.legalName
          });
          
          console.log('✅ Welcome WhatsApp message sent successfully');
        } catch (twilioError) {
          console.error('⚠️ WhatsApp message failed (organization still created):', twilioError);
        }
      }
      
      // Send organization creation confirmation email
      try {
        console.log('📧 Sending organization creation confirmation email...');
        const sendOrgCreatedEmail = httpsCallable(functions, 'sendOrganizationCreatedEmail');
        
        await sendOrgCreatedEmail({
          email: user.email,
          displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
          organizationName: formData.legalName
        });
        
        console.log('✅ Organization creation email sent successfully');
      } catch (emailError) {
        console.error('⚠️ Organization creation email failed (non-critical):', emailError);
      }
      
      // Mark onboarding task as complete
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        const onboardingRef = doc(db, 'userOnboarding', user.uid);
        await setDoc(onboardingRef, { organizationCreated: true }, { merge: true });
        console.log('✅ Onboarding task marked complete: organizationCreated');
      } catch (onboardingError) {
        console.error('⚠️ Failed to mark onboarding task (non-critical):', onboardingError);
      }
      
      // Reset change detection state
      setHasChanges(false);
      setOriginalFormData(formDataToSave);
      
      // Show success state
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        
        // Notify parent component
        if (onOrganizationCreated) {
          onOrganizationCreated(organization);
        }
        
        // Navigate back to home tab after organization creation
        const returnTo = searchParams.get('returnTo');
        
        if (returnTo === 'home' && onNavigateToTab) {
          // Clear returnTo parameter from URL and navigate to home
          window.history.replaceState(null, '', '/dashboard?tab=home');
          onNavigateToTab('home');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating organization:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const performSubmit = async (formDataToSave) => {
    setIsSubmitting(true);
    
    try {
      console.log('💾 Saving organization information to Firestore...');
      
      // Save to organization collection
      const organizationId = currentContext.organization.id;
      await updateOrganizationInfo(organizationId, formDataToSave);
      
      console.log('✅ Organization information updated successfully');
      setShowSuccess(true);
      
      // Update state after successful save
      setHasChanges(false);
      setOriginalFormData(formDataToSave);
      
      // Notify parent that fields have been updated (clears missing fields warning)
      if (onFieldsUpdated) {
        onFieldsUpdated();
      }
      
      // Check if we need to navigate back to a specific tab
      const returnTo = searchParams.get('returnTo');
      
      if (returnTo === 'home' && onNavigateToTab) {
        // Navigate back to home after a short delay to show success message
        setTimeout(() => {
          setShowSuccess(false);
          // Clear returnTo parameter from URL
          window.history.replaceState(null, '', '/dashboard?tab=home');
          onNavigateToTab('home');
        }, 1500);
      } else {
        // Normal flow - just hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      }
      
    } catch (error) {
      console.error('❌ Error saving organization information:', error);
      setError(`${t('errorMessage')}\n\nError: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle browser beforeunload event
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
      return ''; // For other browsers
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Function to check if user can leave
  const checkCanLeave = (action) => {
    if (!hasChanges) {
      // No changes, allow leaving
      if (action) action();
      return true;
    }

    // Has changes, show confirmation (even in creation mode)
    setPendingLeaveAction(() => action);
    setShowLeaveConfirm(true);
    return false;
  };

  // Handle confirmed leave
  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    setHasChanges(false); // Clear changes flag
    if (pendingLeaveAction) {
      pendingLeaveAction();
      setPendingLeaveAction(null);
    }
  };

  // Handle cancel leave
  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
    setPendingLeaveAction(null);
  };

  // Expose checkCanLeave to parent via onTryLeave callback
  useEffect(() => {
    if (onTryLeave) {
      onTryLeave(checkCanLeave);
    }
  }, [hasChanges, onTryLeave]);

  // Show loading state while fetching existing data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C3BEC]"></div>
        <span className="ml-4 text-gray-600">Loading your form data.</span>
      </div>
    );
  }

  return (
    <div>
      <style jsx>{`
        input::placeholder,
        textarea::placeholder {
          color: #e5e7eb !important;
        }
        
        /* Fix dropdown options styling for Windows browsers */
        /* Force explicit colors to override Windows browser defaults */
        select {
          color: #111827 !important;
          background-color: #ffffff !important;
        }
        
        select option {
          color: #111827 !important;
          background-color: #ffffff !important;
        }
        
        select option:checked,
        select option:focus {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        
        select option:hover {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        
        select option:disabled {
          color: #d1d5db !important;
          background-color: #ffffff !important;
        }
      `}</style>
      <div>
        {/* Description */}
        <div className="pt-4 pb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {renderTextWithMIDPill(t('organizationInfoDescription'))}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="pb-8 space-y-6">
          {/* Missing Fields Guidance */}
          {!isCreationMode && missingMIDFields.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800">
                    Complete the highlighted fields below to apply for MID funding.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Impressum Data Extraction Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('quickSetupTitle')}</h2>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-800 leading-relaxed">
                {t('quickSetupDescription')}
              </p>
            </div>

            <div className="space-y-4">
              {/* Homepage field - moved above Impressum URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('homepage')}
                </label>
                <input
                  type="url"
                  value={formData.homepage}
                  onChange={(e) => handleInputChange('homepage', e.target.value)}
                  maxLength={150}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('homepage')}`}
                />
                {renderFieldError('homepage')}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impressum URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={impressumUrl}
                    onChange={(e) => setImpressumUrl(e.target.value)}
                    placeholder={t('impressumUrlPlaceholder')}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white placeholder-gray-200"
                    disabled={isExtracting}
                  />
                  <button
                    type="button"
                    onClick={handleExtractCompanyData}
                    disabled={isExtracting || !impressumUrl.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <WandSparkles className="h-4 w-4" />
                        {t('collectDataButton')}
                      </>
                    )}
                  </button>
                </div>
                {extractionError && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800">{extractionError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Organization Data Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('organizationDataTitle')}</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('legalName')} <span className="text-red-500 text-base font-bold">*</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">MID</span>
                </span>
                <span className="text-xs text-gray-500 block">
                  {t('legalNameHelp')}
                </span>
              </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => handleInputChange('legalName', e.target.value)}
                  maxLength={150}
                  required={isCreationMode}
                  placeholder={isCreationMode ? "Enter your organization's legal name" : "Mustermann Company"}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('legalName')}`}
                />
            </div>
            
            {/* Company Type - moved directly under Legal Name */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('companyType')}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                </span>
              </label>
              <select
                value={formData.companyType}
                onChange={(e) => handleInputChange('companyType', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white text-black ${getInputStyling('companyType')} ${formData.companyType === 'pleaseSelect' ? 'text-gray-100' : ''}`}
              >
                <option  value="pleaseSelect">{t('companyTypeOptions.pleaseSelect')}</option>
                <option value="company">{t('companyTypeOptions.company')}</option>
                <option value="freelancer">{t('companyTypeOptions.freelancer')}</option>
                <option value="association">{t('companyTypeOptions.association')}</option>
                <option value="other">{t('companyTypeOptions.other')}</option>
              </select>
            </div>

            {/* Founding Date */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('foundingDate')}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                </span>
              </label>
              <input
                type="date"
                value={formData.foundingDate}
                onChange={(e) => handleInputChange('foundingDate', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white text-black ${getInputStyling('foundingDate')}`}
              />
              {renderFieldError('foundingDate')}
            </div>

            {/* Tax ID */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('taxId')}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                </span>
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  const cursorPosition = e.target.selectionStart;
                  const oldValue = formData.taxId;
                  
                  // Detect if this is a deletion (backspace/delete)
                  const isDeletion = inputValue.length < oldValue.length;
                  
                  // Special handling: if backspace was pressed and cursor was right after a slash
                  // We need to also remove the last digit to prevent the slash from reappearing
                  let valueToFormat = inputValue;
                  
                  if (isDeletion && oldValue && cursorPosition >= 0) {
                    // Check if cursor was right after a slash in the old value
                    // oldValue[cursorPosition] would be the character at cursor, which is the slash
                    if (cursorPosition < oldValue.length && oldValue[cursorPosition] === '/') {
                      // Cursor was right after the slash, user wants to delete it
                      // Also remove the last digit to prevent slash from reappearing
                      const digitsInOld = oldValue.replace(/\D/g, '');
                      const digitsInNew = inputValue.replace(/\D/g, '');
                      
                      // If we only deleted the slash (digit count unchanged), also remove last digit
                      if (digitsInOld.length === digitsInNew.length && digitsInOld.length > 0) {
                        // Remove last digit from the cleaned value
                        const cleaned = inputValue.replace(/\D/g, '');
                        valueToFormat = cleaned.slice(0, -1);
                      }
                    }
                  }
                  
                  // Format the value (this removes all slashes and reformats)
                  const formatted = formatTaxId(valueToFormat);
                  
                  // Calculate new cursor position
                  // Count digits before cursor in the value we're formatting
                  const digitsBeforeCursor = valueToFormat.slice(0, Math.min(cursorPosition, valueToFormat.length)).replace(/\D/g, '').length;
                  
                  // Find position in formatted string where we have same number of digits
                  let newCursorPosition = formatted.length;
                  let digitCount = 0;
                  for (let i = 0; i < formatted.length; i++) {
                    if (/\d/.test(formatted[i])) {
                      digitCount++;
                      if (digitCount >= digitsBeforeCursor) {
                        // Check if a slash was just inserted after this digit
                        // This happens when we complete a segment (3 digits or 7 digits)
                        // But only if we're not deleting
                        if (!isDeletion && i + 1 < formatted.length && formatted[i + 1] === '/') {
                          newCursorPosition = i + 2; // Position after the slash
                        } else {
                          newCursorPosition = i + 1; // Position after the digit
                        }
                        break;
                      }
                    } else {
                      // If we hit a slash and haven't reached the digit count yet, position after it
                      if (digitCount < digitsBeforeCursor) {
                        newCursorPosition = i + 1;
                      }
                    }
                  }
                  
                  // If we're at the end or past the end, place cursor at end of formatted string
                  if (digitCount < digitsBeforeCursor || newCursorPosition > formatted.length) {
                    newCursorPosition = formatted.length;
                  }
                  
                  handleInputChange('taxId', formatted);
                  
                  // Set cursor position after React updates
                  setTimeout(() => {
                    const input = e.target;
                    if (input) {
                      input.setSelectionRange(newCursorPosition, newCursorPosition);
                    }
                  }, 0);
                }}
                onBlur={() => handleFieldBlur('taxId')}
                placeholder="111/2222/3333"
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('taxId')}`}
              />
              {renderFieldError('taxId')}
              <p className="text-xs text-gray-500 mt-1">
                {t('taxIdHelp')}
              </p>
            </div>

            {/* Industry */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('industry')}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                </span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white text-black ${getInputStyling('industry')} ${formData.industry === 'pleaseSelect' ? 'text-gray-100' : ''}`}
              >
                <option value="pleaseSelect">{t('industryOptions.pleaseSelect')}</option>
                <option value="health">{t('industryOptions.health')}</option>
                <option value="media">{t('industryOptions.media')}</option>
                <option value="tourism">{t('industryOptions.tourism')}</option>
                <option value="machinery">{t('industryOptions.machinery')}</option>
                <option value="manufacturing">{t('industryOptions.manufacturing')}</option>
                <option value="ict">{t('industryOptions.ict')}</option>
                <option value="energy">{t('industryOptions.energy')}</option>
                <option value="wholesale">{t('industryOptions.wholesale')}</option>
                <option value="retail">{t('industryOptions.retail')}</option>
                <option value="biotechnology">{t('industryOptions.biotechnology')}</option>
                <option value="mobility">{t('industryOptions.mobility')}</option>
                <option value="craft">{t('industryOptions.craft')}</option>
                <option value="sports">{t('industryOptions.sports')}</option>
                <option value="utilities">{t('industryOptions.utilities')}</option>
                <option value="agriculture">{t('industryOptions.agriculture')}</option>
                <option value="realEstate">{t('industryOptions.realEstate')}</option>
                <option value="professional">{t('industryOptions.professional')}</option>
                <option value="other">{t('industryOptions.other')}</option>
              </select>
            </div>

            {/* Company Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('organizationDescriptionLabel')}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">MID</span>
                </span>
              </label>
              <textarea
                value={formData.companyDescription}
                onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                maxLength={600}
                rows={1}
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 resize-none transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('companyDescription')}`}
                placeholder={t('descriptionPlaceholder')}
              />
            </div>

            <div className="mt-10 flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('employeesTitle')}</h2>
            </div>

            <div className="mt-6 text-gray-500">
              {t('employeesHelp')}
            </div>

            {/* Total Number of Employees */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('totalEmployees')}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.totalEmployees === null ? '' : formData.totalEmployees}
                onChange={(e) => handleInputChange('totalEmployees', e.target.value)}
                placeholder="15"
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('totalEmployees')}`}
                onWheel={e => e.target.blur()}
              />
              {renderFieldError('totalEmployees')}
              <p className="text-xs text-gray-500 mt-1">
                {t('totalEmployeesHelp')}
              </p>
            </div>

            {/* Full Time Equivalents */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('fullTimeEquivalents')}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                </span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={formData.fullTimeEquivalents === null ? '' : formData.fullTimeEquivalents}
                onChange={(e) => handleInputChange('fullTimeEquivalents', e.target.value)}
                onBlur={() => handleFieldBlur('fullTimeEquivalents')}
                placeholder={language === 'de' ? '12,5' : '12.5'}
                className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('fullTimeEquivalents')}`}
                onWheel={e => e.target.blur()}
              />
              {renderFieldError('fullTimeEquivalents')}
              <p className="text-xs text-gray-500 mt-1">
                {t('fullTimeEquivalentsHelp')}
              </p>
            </div>


            {/* Company Category */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  {t('companyCategory')}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                </span>
              </label>
              <div className={`space-y-3 p-3 rounded-lg transition-all duration-200 ${fieldsToHighlight.includes('companyCategory') ? 'border border-amber-300 bg-amber-50/30' : ''}`}>
                <label className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="companyCategory"
                    value="micro"
                    checked={formData.companyCategory === 'micro'}
                    onChange={(e) => handleInputChange('companyCategory', e.target.value)}
                    className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t('companyCategoryOptions.micro')}</span>
                  </div>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="companyCategory"
                    value="small"
                    checked={formData.companyCategory === 'small'}
                    onChange={(e) => handleInputChange('companyCategory', e.target.value)}
                    className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t('companyCategoryOptions.small')}</span>
                  </div>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="companyCategory"
                    value="medium"
                    checked={formData.companyCategory === 'medium'}
                    onChange={(e) => handleInputChange('companyCategory', e.target.value)}
                    className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t('companyCategoryOptions.medium')}</span>
                  </div>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="companyCategory"
                    value="large"
                    checked={formData.companyCategory === 'large'}
                    onChange={(e) => handleInputChange('companyCategory', e.target.value)}
                    className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t('companyCategoryOptions.large')}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('country')}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white text-black ${getInputStyling('country')}`}
                >
                  <option value="germany">{t('countryOptions.germany')}</option>
                  <option value="austria">{t('countryOptions.austria')}</option>
                  <option value="switzerland">{t('countryOptions.switzerland')}</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">{t('countryHelp')}</p>
              </div>
            </div>

            {/* Street and Number - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('street')} <span className="text-red-500 text-base font-bold">*</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  maxLength={150}
                  required={isCreationMode}
                  placeholder={isCreationMode ? "Mustermannstraße" : "Musterstraße"}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('street')}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('streetNumber')} <span className="text-red-500 text-base font-bold">*</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.streetNumber}
                  onChange={(e) => handleInputChange('streetNumber', e.target.value)}
                  maxLength={150}
                  required={isCreationMode}
                  placeholder={isCreationMode ? "42" : "24a"}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('streetNumber')}`}
                />
              </div>
            </div>

            {/* P.O. Box - Full Width (Optional) */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('poBox')}
                </label>
                <input
                  type="text"
                value={formData.poBox}
                onChange={(e) => handleInputChange('poBox', e.target.value)}
                  maxLength={150}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white placeholder-gray-200"
                placeholder={t('poBoxPlaceholder')}
                />
            </div>

            {/* Postal Code and City - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('postalCode')} <span className="text-red-500 text-base font-bold">*</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', formatPostalCode(e.target.value))}
                  onBlur={() => handleFieldBlur('postalCode')}
                  required={isCreationMode}
                  placeholder={t('postalCodePlaceholder')}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('postalCode')}`}
                />
                {renderFieldError('postalCode')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('city')} <span className="text-red-500 text-base font-bold">*</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  maxLength={150}
                  required={isCreationMode}
                  placeholder={t('cityPlaceholder')}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('city')}`}
                />
              </div>
            </div>
            
            {/* Phone Number - Only in creation mode */}
            {isCreationMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phoneAreaCode')}
                  </label>
                  <select
                    value={formData.phoneAreaCode}
                    onChange={(e) => handleInputChange('phoneAreaCode', e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white text-black placeholder-gray-200"
                  >
                    <option value="+49">🇩🇪 +49 (Deutschland)</option>
                    <option value="+43">🇦🇹 +43 (Austria)</option>
                    <option value="+41">🇨🇭 +41 (Switzerland)</option>
                    <option value="+1">🇺🇸 +1 (USA)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+33">🇫🇷 +33 (France)</option>
                    <option value="+39">🇮🇹 +39 (Italy)</option>
                    <option value="+34">🇪🇸 +34 (Spain)</option>
                    <option value="+31">🇳🇱 +31 (Netherlands)</option>
                    <option value="+32">🇧🇪 +32 (Belgium)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="157 123 456 78"
                    className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('phoneNumber')}`}
                  />
                  {renderFieldError('phoneNumber')}
                  <p className="text-xs text-gray-500 mt-1">
                    {t('phoneNumberHelp')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Business Contact Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('managingDirectorTitle')}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {t('managingDirectorDescription')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('salutation')}
                </label>
                <select
                  value={formData.contactSalutation}
                  onChange={(e) => handleInputChange('contactSalutation', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white text-black placeholder-gray-200"
                >
                  <option className='text-gray-10' value="pleaseSelect">{t('salutationOptions.pleaseSelect')}</option>
                  <option value="mr">{t('salutationOptions.mr')}</option>
                  <option value="mrs">{t('salutationOptions.mrs')}</option>
                  <option value="diverse">{t('salutationOptions.diverse')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="max@mustermann.com"
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('contactEmail')}`}
                />
                {renderFieldError('contactEmail')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('firstName')}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.contactFirstName}
                  onChange={(e) => handleInputChange('contactFirstName', e.target.value)}
                  maxLength={150}
                  placeholder="Max"
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('contactFirstName')}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('lastName')}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.contactLastName}
                  onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                  maxLength={150}
                  placeholder="Mustermann"
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('contactLastName')}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phone')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.contactPhoneAreaCode}
                    onChange={(e) => handleInputChange('contactPhoneAreaCode', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white text-black text-sm"
                  >
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+43">🇦🇹 +43</option>
                    <option value="+41">🇨🇭 +41</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+31">🇳🇱 +31</option>
                    <option value="+32">🇧🇪 +32</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="157 123 456 78"
                    className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white text-sm ${getInputStyling('contactPhone')}`}
                  />
                </div>
                {renderFieldError('contactPhone')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('role')}
                </label>
                <input
                  type="text"
                  value={formData.contactRole}
                  onChange={(e) => handleInputChange('contactRole', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white placeholder-gray-200"
                />
              </div>
            </div>

          </div>

          {/* Project Contact Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('midContactTitle')}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {t('midContactDescription')}
            </p>

            {/* MID Contact selection - radio buttons */}
            <div className="mb-6 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="midContactOption"
                  value="same"
                  checked={formData.midContactOption === 'same'}
                  onChange={(e) => handleInputChange('midContactOption', e.target.value)}
                  className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('midContactOptions.same')}
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="midContactOption"
                  value="different"
                  checked={formData.midContactOption === 'different'}
                  onChange={(e) => handleInputChange('midContactOption', e.target.value)}
                  className="mt-1 h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  {t('midContactOptions.different')}
                </span>
              </label>
            </div>

            {formData.midContactOption === 'different' && (
              <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('salutation')}
                </label>
                <select
                  value={formData.projectContactSalutation}
                  onChange={(e) => handleInputChange('projectContactSalutation', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white text-black placeholder-gray-200"
                >
                  <option value="pleaseSelect">{t('salutationOptions.pleaseSelect')}</option>
                  <option value="mr">{t('salutationOptions.mr')}</option>
                  <option value="mrs">{t('salutationOptions.mrs')}</option>
                  <option value="diverse">{t('salutationOptions.diverse')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.projectContactEmail}
                  onChange={(e) => handleInputChange('projectContactEmail', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('projectContactEmail')}`}
                />
                {renderFieldError('projectContactEmail')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('firstName')}
                </label>
                <input
                  type="text"
                  value={formData.projectContactFirstName}
                  onChange={(e) => handleInputChange('projectContactFirstName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white placeholder-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lastName')}
                </label>
                <input
                  type="text"
                  value={formData.projectContactLastName}
                  onChange={(e) => handleInputChange('projectContactLastName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white placeholder-gray-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phone')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.projectContactPhoneAreaCode || '+49'}
                    onChange={(e) => handleInputChange('projectContactPhoneAreaCode', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white text-black text-sm"
                  >
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+43">🇦🇹 +43</option>
                    <option value="+41">🇨🇭 +41</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+31">🇳🇱 +31</option>
                    <option value="+32">🇧🇪 +32</option>
                  </select>
                  <input
                    type="tel"
                    value={formData.projectContactPhone}
                    onChange={(e) => handleInputChange('projectContactPhone', e.target.value)}
                    placeholder="157 123 456 78"
                    className={`w-full px-3 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white text-sm ${getInputStyling('projectContactPhone')}`}
                  />
                </div>
                {renderFieldError('projectContactPhone')}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('role')}
                </label>
                <input
                  type="text"
                  value={formData.projectContactRole}
                  onChange={(e) => handleInputChange('projectContactRole', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white placeholder-gray-200"
                />
              </div>
            </div>
              </>
            )}

          </div>




          {/* Bank Account Information Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('bankAccountTitle')}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {t('bankAccountDescription')}
            </p>
            
            <div className="space-y-6">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('iban')}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => handleInputChange('iban', formatIBAN(e.target.value))}
                  onBlur={() => handleFieldBlur('iban')}
                  placeholder="DE11 2222 3333 4444 5555 55"
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('iban')}`}
                />
                {renderFieldError('iban')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('bic')}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.bic}
                  onChange={(e) => handleInputChange('bic', e.target.value.toUpperCase())}
                  onBlur={() => handleFieldBlur('bic')}
                  placeholder="QNTODEB2XXX"
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('bic')}`}
                />
                {renderFieldError('bic')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('bankName')}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  maxLength={150}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('bankName')}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    {t('accountHolderName')}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  maxLength={150}
                  className={`w-full px-4 py-2.5 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 bg-white ${getInputStyling('accountHolderName')}`}
                />
              </div>

            </div>
          </div>

          {/* MID Funding History Section */}
          <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('midFundingHistory')}</h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Important:</strong> {t('midFundingInfo')}
              </p>
            </div>

            <div className="space-y-6">
              {/* MID Digitisation */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="mb-4">
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {t('hasReceivedDigitisation')}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('selectYesNo')}
                    </p>
                  </div>
                  
                  <div className="space-y-3 pl-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasReceivedMIDDigitisation"
                        value="no"
                        checked={formData.hasReceivedMIDDigitisation === 'no'}
                        onChange={(e) => handleInputChange('hasReceivedMIDDigitisation', e.target.value)}
                        className="h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('no')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasReceivedMIDDigitisation"
                        value="yes"
                        checked={formData.hasReceivedMIDDigitisation === 'yes'}
                        onChange={(e) => handleInputChange('hasReceivedMIDDigitisation', e.target.value)}
                        className="h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('yes')}</span>
                    </label>
                  </div>
                </div>

                {/* Digitisation Approval Date - Only shown if Yes is selected */}
                {formData.hasReceivedMIDDigitisation === 'yes' && (
                  <div className="mt-4 pl-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('lastDigitisationApproval')}
                    </label>
                    <input
                      type="date"
                      value={formData.lastMIDDigitisationApprovalDate}
                      onChange={(e) => handleInputChange('lastMIDDigitisationApprovalDate', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white text-black placeholder-gray-200"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {t('cooldownExplanation')}
                    </p>
                  </div>
                )}
              </div>

              {/* MID Digital Security */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="mb-4">
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {t('hasReceivedDigitalSecurity')}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">MID</span>
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {t('selectYesNo')}
                    </p>
                  </div>
                  
                  <div className="space-y-3 pl-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasReceivedMIDDigitalSecurity"
                        value="no"
                        checked={formData.hasReceivedMIDDigitalSecurity === 'no'}
                        onChange={(e) => handleInputChange('hasReceivedMIDDigitalSecurity', e.target.value)}
                        className="h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('no')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="hasReceivedMIDDigitalSecurity"
                        value="yes"
                        checked={formData.hasReceivedMIDDigitalSecurity === 'yes'}
                        onChange={(e) => handleInputChange('hasReceivedMIDDigitalSecurity', e.target.value)}
                        className="h-4 w-4 text-[#7C3BEC] focus:ring-[#7C3BEC] border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">{t('yes')}</span>
                    </label>
                  </div>
                </div>

                {/* Digital Security Approval Date - Only shown if Yes is selected */}
                {formData.hasReceivedMIDDigitalSecurity === 'yes' && (
                  <div className="mt-4 pl-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('lastDigitalSecurityApproval')}
                    </label>
                    <input
                      type="date"
                      value={formData.lastMIDDigitalSecurityApprovalDate}
                      onChange={(e) => handleInputChange('lastMIDDigitalSecurityApprovalDate', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-white text-black placeholder-gray-200"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {t('cooldownExplanation')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-gray-100 pt-8 bg-gray-50 -mx-8 -mb-8 px-8 pb-8 mt-10">
            {/* Error Message - Moved here for better visibility */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show changes indicator */}
            {!isCreationMode && hasChanges && (
              <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-amber-900">
                    {existingSubmission ? 'You have unsaved changes.' : 'Form ready to submit.'}
                  </span>
                </div>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting || (!isCreationMode && !hasChanges && existingSubmission)}
              whileHover={{ scale: isSubmitting || (!isCreationMode && !hasChanges && existingSubmission) ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting || (!isCreationMode && !hasChanges && existingSubmission) ? 1 : 0.99 }}
              className={`w-full font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm ${
                showSuccess 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' 
                  : isSubmitting || (!isCreationMode && !hasChanges && existingSubmission)
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white opacity-60 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:shadow-md'
              }`}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : showSuccess ? (
                <Check className="h-5 w-5" />
              ) : (
                <Building className="h-5 w-5" />
              )}
              {showSuccess 
                ? (isCreationMode ? t('organizationCreated') : (existingSubmission ? 'Updated successfully.' : 'Saved successfully.'))
                : isSubmitting 
                  ? (isCreationMode ? t('creatingOrganization') : (existingSubmission ? t('updating') : t('saving')))
                  : (isCreationMode 
                    ? t('onboarding.createOrganization.buttonText')
                    : (existingSubmission 
                      ? (hasChanges ? t('saveChanges') : t('noChanges'))
                      : t('submit')
                    )
                  )
              }
            </motion.button>
          </div>
        </form>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
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
                  {t('unsavedChanges.title')}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                {t('unsavedChanges.message')}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelLeave}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  {t('unsavedChanges.cancel')}
                </button>
                <button
                  onClick={handleConfirmLeave}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t('unsavedChanges.leave')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MIDForm;