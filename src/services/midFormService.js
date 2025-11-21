import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Collection name for MID form submissions
const MID_FORMS_COLLECTION = 'midFormSubmissions';

// MID-tracked fields (fields shown in the details modal and marked with MID badge)
export const MID_TRACKED_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'legalName',
  'companyType',
  'country',
  'street',
  'postalCode',
  'city',
  'foundingYear',
  'taxId',
  'iban',
  'bic',
  'bankName',
  'accountHolderName',
  'industry',
  'employees',
  'companyCategory',
  'companyDescription'
];

// Field labels for display
export const FIELD_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  legalName: 'Legal Company Name',
  companyType: 'Company Type',
  country: 'Country',
  street: 'Street Address',
  postalCode: 'Postal Code',
  city: 'City',
  foundingYear: 'Founding Year',
  taxId: 'Tax ID',
  iban: 'IBAN',
  bic: 'BIC',
  bankName: 'Bank Name',
  accountHolderName: 'Account Holder Name',
  industry: 'Industry',
  employees: 'Number of Employees',
  companyCategory: 'Company Category',
  companyDescription: 'Company Description'
};

/**
 * Save MID form data to Firebase Firestore
 * @param {Object} formData - The form data to save
 * @param {string} userId - Optional user ID if authenticated
 * @returns {Promise<string>} - Document ID of the saved submission
 */
export const saveMIDFormSubmission = async (formData, userId = null) => {
  try {
    
    // Remove 'id' field from formData if it exists (to prevent conflicts with Firestore document ID)
    const { id, ...cleanFormData } = formData;
    if (id) {
      console.warn('⚠️ Removed id field from formData to prevent conflicts with Firestore document ID');
    }
    
    // Prepare the data for saving
    const submissionData = {
      // Form data (without id field)
      ...cleanFormData,
      
      // Metadata
      submittedAt: serverTimestamp(),
      userId: userId,
      status: 'pending', // Initial status is pending until formally submitted via Financing page
      version: '1.0',
      
      // Email forwarding setup
      emailForwarding: {
        instructionsProvided: true,
        targetEmail: 'subsidy@rapid-works.io',
        supportOffered: true,
      }
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, MID_FORMS_COLLECTION), submissionData);
    
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving MID form submission:', error);
    throw new Error(`Failed to save form submission: ${error.message}`);
  }
};

/**
 * Detect changes in MID-tracked fields
 * @param {Object} oldData - The existing submission data
 * @param {Object} newData - The new form data
 * @returns {Array} - Array of changes with field, oldValue, newValue
 */
export const detectMIDFieldChanges = (oldData, newData) => {
  const changes = [];
  
  MID_TRACKED_FIELDS.forEach(field => {
    const oldValue = oldData[field] || '';
    const newValue = newData[field] || '';
    
    // Compare values (handle different types)
    if (String(oldValue).trim() !== String(newValue).trim()) {
      changes.push({
        field,
        fieldLabel: FIELD_LABELS[field] || field,
        oldValue: oldValue,
        newValue: newValue
      });
    }
  });
  
  return changes;
};

/**
 * Update an existing MID form submission with change history tracking
 * @param {string} submissionId - The document ID to update
 * @param {Object} updateData - The data to update
 * @param {Object} oldData - The existing data (for change tracking)
 * @param {string} userId - The user making the changes
 * @returns {Promise<void>}
 */
export const updateMIDFormSubmission = async (submissionId, updateData, oldData = null, userId = null) => {
  try {
    
    const docRef = doc(db, MID_FORMS_COLLECTION, submissionId);
    
    // Remove 'id' field from updateData if it exists (to prevent conflicts with Firestore document ID)
    const { id, ...cleanUpdateData } = updateData;
    if (id) {
      console.warn('⚠️ Removed id field from updateData to prevent conflicts with Firestore document ID');
    }
    
    // Prepare update object
    const updateObject = {
      ...cleanUpdateData,
      lastUpdated: serverTimestamp(),
    };
    
    // If we have old data, track changes for MID fields
    if (oldData) {
      const changes = detectMIDFieldChanges(oldData, updateData);
      
      if (changes.length > 0) {
        // Get existing change history or initialize empty array
        const existingHistory = oldData.changeHistory || [];
        
        // Add new changes to history
        const newChanges = changes.map(change => ({
          ...change,
          timestamp: new Date().toISOString(), // Use ISO string since serverTimestamp doesn't work in arrays
          changedBy: userId
        }));
        
        // Keep only the last 2 versions per field
        const updatedHistory = [...existingHistory, ...newChanges];
        const historyByField = {};
        
        // Group by field and keep only last 2 entries per field
        updatedHistory.forEach(entry => {
          if (!historyByField[entry.field]) {
            historyByField[entry.field] = [];
          }
          historyByField[entry.field].push(entry);
        });
        
        // Flatten back and keep only last 2 per field
        const finalHistory = [];
        Object.values(historyByField).forEach(fieldHistory => {
          const sorted = fieldHistory.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          finalHistory.push(...sorted.slice(0, 2));
        });
        
        updateObject.changeHistory = finalHistory;
      }
    }
    
    await updateDoc(docRef, updateObject);
    
  } catch (error) {
    console.error('❌ Error updating MID form submission:', error);
    throw new Error(`Failed to update form submission: ${error.message}`);
  }
};

/**
 * Get a specific MID form submission by ID
 * @param {string} submissionId - The document ID to retrieve
 * @returns {Promise<Object|null>} - The submission data or null if not found
 */
export const getMIDFormSubmission = async (submissionId) => {
  try {
    
    const docRef = doc(db, MID_FORMS_COLLECTION, submissionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id };
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error retrieving MID form submission:', error);
    throw new Error(`Failed to retrieve form submission: ${error.message}`);
  }
};

/**
 * Get all MID form submissions for a specific user
 * @param {string} userId - The user ID to filter by
 * @returns {Promise<Array>} - Array of submission data
 */
export const getUserMIDFormSubmissions = async (userId) => {
  try {
    // Validate userId before making query
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn('⚠️ Invalid userId provided:', userId);
      return [];
    }
    
    
    const q = query(
      collection(db, MID_FORMS_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const submissions = [];
    
    querySnapshot.forEach((doc) => {
      submissions.push({ ...doc.data(), id: doc.id });
    });
    
    return submissions;
  } catch (error) {
    console.error('❌ Error retrieving user submissions:', error);
    throw new Error(`Failed to retrieve user submissions: ${error.message}`);
  }
};

/**
 * Get all MID form submissions (admin function)
 * @returns {Promise<Array>} - Array of all submission data
 */
export const getAllMIDFormSubmissions = async () => {
  try {
    
    const q = query(
      collection(db, MID_FORMS_COLLECTION),
      // Order by submittedAt descending to get newest first
      orderBy('submittedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const submissions = [];
    
    querySnapshot.forEach((doc) => {
      submissions.push({ ...doc.data(), id: doc.id });
    });
    
    return submissions;
  } catch (error) {
    console.error('❌ Error retrieving all submissions:', error);
    throw new Error(`Failed to retrieve all submissions: ${error.message}`);
  }
};

/**
 * Create a digital signature hash for the form data
 * @param {Object} formData - The form data to sign
 * @returns {string} - A simple hash of the form data
 */
export const createDigitalSignatureHash = (formData) => {
  try {
    // Create a simple hash of the form data for digital signature
    const dataString = JSON.stringify(formData, Object.keys(formData).sort());
    let hash = 0;
    
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  } catch (error) {
    console.error('❌ Error creating digital signature hash:', error);
    return null;
  }
};

/**
 * Individual field validation functions for real-time validation
 */

// Test email domains that should be denied
const TEST_EMAIL_DOMAINS = [
  'test.com',
  'test.de',
  'test.test',
  'example.com',
  'example.de',
  'example.org',
  'sample.com',
  'demo.com',
  'fake.com',
  'dummy.com',
  'testmail.com',
  'testmail.de',
  'tempmail.com',
  'tempmail.de',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  // Newly added common disposable/test domains
  'mail-tester.com',
  'yopmail.com',
  'trashmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'dispostable.com',
  'maildrop.cc',
  'moakt.com',
  'getnada.com'
];

// Test email patterns (local part patterns that are commonly used for testing)
const TEST_EMAIL_PATTERNS = [
  /^test[\d]*@/i,
  /^admin[\d]*@/i,
  /^user[\d]*@/i,
  /^demo[\d]*@/i,
  /^sample[\d]*@/i,
  /^fake[\d]*@/i,
  /^dummy[\d]*@/i,
  /^temp[\d]*@/i
];

/**
 * Check if an email is a test email address
 * @param {string} email - The email address to check
 * @returns {boolean} - True if it's a test email
 */
export const isTestEmail = (email) => {
  if (!email || email.trim() === '') return false;

  const emailLower = email.toLowerCase().trim();

  // Check if domain is in test domains list
  const domain = emailLower.split('@')[1];
  if (domain && TEST_EMAIL_DOMAINS.some(testDomain => domain === testDomain || domain.endsWith('.' + testDomain))) {
    return true;
  }

  // Check if local part matches test patterns
  if (TEST_EMAIL_PATTERNS.some(pattern => pattern.test(emailLower))) {
    return true;
  }

  return false;
};

// Email validation
export const validateEmail = (email) => {
  if (!email || email.trim() === '') return null;

  // Check if it's a test email first
  if (isTestEmail(email)) {
    return 'Test email addresses are not allowed. Please use a valid business email address.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : 'Invalid email format';
};

// URL validation
export const validateURL = (url) => {
  if (!url || url.trim() === '') return null;
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
};

// Postal code validation (5 digits format check only)
export const validatePostalCode = (postalCode, language = 'en') => {
  if (!postalCode || postalCode.trim() === '') return null;
  
  // Check format (5 digits)
  const postalCodeRegex = /^\d{5}$/;
  const cleaned = postalCode.replace(/\s/g, '');
  if (!postalCodeRegex.test(cleaned)) {
    return language === 'de' 
      ? 'Die Postleitzahl muss genau 5 Ziffern lang sein.'
      : 'Postal code must be exactly 5 digits.';
  }
  
  return null;
};

// Tax ID validation (XXX/XXXX/XXX format)
export const validateTaxId = (taxId) => {
  if (!taxId || taxId.trim() === '') return null;
  const taxIdRegex = /^\d{3}\/\d{4}\/\d{4}$/;
  return taxIdRegex.test(taxId) ? null : 'Tax ID must be in format XXX/XXXX/XXXX (11 digits)';
};

// IBAN validation (2 letters + 20 digits for German IBANs)
export const validateIBAN = (iban) => {
  if (!iban || iban.trim() === '') return null;
  const ibanRegex = /^[A-Z]{2}\d{20}$/;
  const cleanIban = iban.replace(/\s/g, '');
  return ibanRegex.test(cleanIban) ? null : 'IBAN must be 2 letters followed by 20 digits (e.g., DE11 2222 3333 4444 5555 55)';
};

// BIC validation (8-11 alphanumeric characters)
export const validateBIC = (bic) => {
  if (!bic || bic.trim() === '') return null;
  // BIC should be uppercase alphanumeric, 8-11 characters
  const cleaned = bic.trim().toUpperCase();
  const bicRegex = /^[A-Z0-9]{8,11}$/;
  return bicRegex.test(cleaned) ? null : 'BIC must be 8-11 alphanumeric characters (e.g., DEUTDEDB180 or QNTODEB2XXX)';
};

// Phone number validation (basic format check)
export const validatePhoneNumber = (phone) => {
  if (!phone || phone.trim() === '') return null;
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(phone) ? null : 'Invalid phone number format';
};

// Employee count validation
export const validateEmployeeCount = (count) => {
  if (!count || count === '') return null;
  const employeeCount = parseInt(count);
  if (isNaN(employeeCount) || employeeCount < 0) {
    return 'Must be a valid positive number';
  }
  if (employeeCount >= 250) {
    return 'Employee count must be less than 250 for MID applications';
  }
  return null;
};

// Full time equivalents validation
export const validateFTE = (fte) => {
  if (!fte || fte === '') return null;
  const fteCount = parseFloat(fte);
  if (isNaN(fteCount) || fteCount < 0) {
    return 'Must be a valid positive number';
  }
  return null;
};

// Founding date validation
export const validateFoundingDate = (date) => {
  if (!date || date.trim() === '') return null;
  const foundingDate = new Date(date);
  const currentYear = new Date().getFullYear();
  if (isNaN(foundingDate.getTime()) || foundingDate.getFullYear() > currentYear || foundingDate.getFullYear() < 1800) {
    return 'Invalid founding date';
  }
  return null;
};

/**
 * Validate form data before saving
 * @param {Object} formData - The form data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateMIDFormData = (formData, _isUpdate = false) => {
  const errors = [];
  
  // Debug: Log the form data to see what's being submitted
  
  // All fields are now optional, but we still validate format when provided
  
  // Email validation (only if email is provided)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && formData.email.trim() !== '') {
    if (isTestEmail(formData.email)) {
      errors.push('Test email addresses are not allowed. Please use a valid business email address for email field.');
    } else if (!emailRegex.test(formData.email)) {
      errors.push('Invalid email format');
    }
  }

  // Contact email validation (only if provided)
  if (formData.contactEmail && formData.contactEmail.trim() !== '') {
    if (isTestEmail(formData.contactEmail)) {
      errors.push('Test email addresses are not allowed. Please use a valid business email address for contact email field.');
    } else if (!emailRegex.test(formData.contactEmail)) {
      errors.push('Invalid contact email format');
    }
  }

  // Project contact email validation (only if provided)
  if (formData.projectContactEmail && formData.projectContactEmail.trim() !== '') {
    if (isTestEmail(formData.projectContactEmail)) {
      errors.push('Test email addresses are not allowed. Please use a valid business email address for project contact email field.');
    } else if (!emailRegex.test(formData.projectContactEmail)) {
      errors.push('Invalid project contact email format');
    }
  }
  
  // URL validation for homepage (only if provided)
  if (formData.homepage && formData.homepage.trim() !== '') {
    try {
      new URL(formData.homepage);
    } catch {
      errors.push('Invalid homepage URL format');
    }
  }
  
  // Number validation for total employees (only if provided)
  if (formData.totalEmployees && formData.totalEmployees !== '') {
    const employeeCount = parseInt(formData.totalEmployees);
    if (isNaN(employeeCount) || employeeCount < 0) {
      errors.push('Total employee count must be a valid positive number');
    }
  }
  
  // Number validation for full time equivalents (only if provided)
  if (formData.fullTimeEquivalents && formData.fullTimeEquivalents !== '') {
    const fteCount = parseFloat(formData.fullTimeEquivalents);
    if (isNaN(fteCount) || fteCount < 0) {
      errors.push('Full time equivalents must be a valid positive number');
    }
  }
  
  // Date validation for founding date (only if provided)
  if (formData.foundingDate && formData.foundingDate.trim() !== '') {
    const foundingDate = new Date(formData.foundingDate);
    const currentYear = new Date().getFullYear();
    if (isNaN(foundingDate.getTime()) || foundingDate.getFullYear() > currentYear || foundingDate.getFullYear() < 1800) {
      errors.push('Invalid founding date');
    }
  }
  
  // Tax ID validation (11 digits format: XXX/XXXX/XXXX)
  if (formData.taxId && formData.taxId.trim() !== '') {
    const taxIdRegex = /^\d{3}\/\d{4}\/\d{4}$/;
    if (!taxIdRegex.test(formData.taxId)) {
      errors.push('Tax ID must be in format XXX/XXXX/XXXX (11 digits)');
    }
  }
  
  // IBAN validation (2 letters + 20 digits for German IBANs)
  if (formData.iban && formData.iban.trim() !== '') {
    const ibanRegex = /^[A-Z]{2}\d{20}$/;
    const cleanIban = formData.iban.replace(/\s/g, '');
    if (!ibanRegex.test(cleanIban)) {
      errors.push('IBAN must be 2 letters followed by 20 digits (e.g., DE11 2222 3333 4444 5555 55)');
    }
  }
  
  // BIC validation (8-11 alphanumeric characters)
  if (formData.bic && formData.bic.trim() !== '') {
    const cleaned = formData.bic.trim().toUpperCase();
    const bicRegex = /^[A-Z0-9]{8,11}$/;
    if (!bicRegex.test(cleaned)) {
      errors.push('BIC must be 8-11 alphanumeric characters (e.g., DEUTDEDB180 or QNTODEB2XXX)');
    }
  }
  
  // Postal code validation (5 digits for Germany)
  if (formData.postalCode && formData.postalCode.trim() !== '') {
    const postalCodeRegex = /^\d{5}$/;
    if (!postalCodeRegex.test(formData.postalCode)) {
      errors.push('Postal code must be exactly 5 digits');
    }
  }
  
  // Note: Employee count validation for MID applications is handled in ApplyToMIDModal
  
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Delete a MID form submission from Firestore
 * @param {string} submissionId - The ID of the submission to delete
 * @returns {Promise<void>}
 */
export const deleteMIDFormSubmission = async (submissionId) => {
  try {
    
    const submissionRef = doc(db, MID_FORMS_COLLECTION, submissionId);
    await deleteDoc(submissionRef);
    
  } catch (error) {
    console.error('❌ Error deleting MID form submission:', error);
    throw new Error('Failed to delete MID form submission: ' + error.message);
  }
};
