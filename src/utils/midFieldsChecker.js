/**
 * Centralized utility for checking MID field completion
 * Used across Dashboard, RapidFinancing, and Onboarding
 */

// MID required fields definition
export const MID_REQUIRED_FIELDS = {
  contactFirstName: 'First Name',
  contactLastName: 'Last Name',
  email: 'Email',
  legalName: 'Legal Name',
  companyType: 'Company Type',
  country: 'Country',
  street: 'Street',
  streetNumber: 'Number',
  postalCode: 'Postal Code',
  city: 'City',
  companyDescription: 'Company Description',
  foundingDate: 'Founding Date',
  taxId: 'Tax ID',
  iban: 'IBAN',
  bic: 'BIC',
  bankName: 'Bank Name',
  accountHolderName: 'Account Holder Name',
  industry: 'Industry',
  totalEmployees: 'Total Number of Employees',
  fullTimeEquivalents: 'Full Time Equivalents',
  companyCategory: 'Company Category'
};

/**
 * Check if all MID required fields are filled in organization data
 * @param {Object} orgData - Organization data object
 * @param {string} userEmail - User's email (required field)
 * @returns {Object} { allFieldsFilled: boolean, missingFields: string[] }
 */
export const checkMIDFieldsCompletion = (orgData, userEmail) => {
  if (!orgData) {
    return {
      allFieldsFilled: false,
      missingFields: Object.values(MID_REQUIRED_FIELDS)
    };
  }

  const dataWithEmail = {
    ...orgData,
    email: userEmail
  };
  
  const missingFields = [];
  
  Object.entries(MID_REQUIRED_FIELDS).forEach(([field, label]) => {
    const value = dataWithEmail[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(label);
    }
  });

  return {
    allFieldsFilled: missingFields.length === 0,
    missingFields
  };
};

/**
 * Get field names that need highlighting from missing field labels
 * @param {string[]} missingFieldLabels - Array of missing field labels
 * @returns {string[]} Array of field names to highlight
 */
export const getFieldNamesToHighlight = (missingFieldLabels) => {
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

  return missingFieldLabels
    .map(label => fieldLabelToName[label])
    .filter(Boolean);
};
