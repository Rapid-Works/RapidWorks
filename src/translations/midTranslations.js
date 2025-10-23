export const midTranslations = {
  de: {
    // Header
    title: 'BENUTZER',
    required: '* Pflichtfeld',
    projectId: 'Projekt-Id: 11776',
    
    // User section
    username: 'Benutzername',
    email: 'E-Mailadresse',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    passwordRequirement: 'Das Passwort muss Groß-, Kleinbuchstaben, Zahlen (0-9) und Sonderzeichen (ausschließlich [-.,;:%#@="+&()!*/]) beinhalten.',
    
    // Business contact section
    businessContactTitle: 'Kontaktdaten der Geschäftsführung',
    salutation: 'Anrede',
    salutationOptions: {
      mr: 'Herr',
      mrs: 'Frau',
      diverse: 'Divers'
    },
    firstName: 'Vorname',
    lastName: 'Nachname',
    maxCharacters: 'Max. 150 Zeichen',
    homepage: 'Homepage',
    legalName: 'Rechtsverbindlicher Name der Organisation',
    legalNameHelp: '(Sie finden den rechtsverbindlichen Namen Ihres Unternehmens bspw. im Handelsregisterauszug)',
    organizationInfoDescription: 'Diese Daten repräsentieren deine Organisation. Alle Felder sind optional, aber die mit MID gekennzeichneten Felder werden zur Teilnahme am MID-Losverfahren benötigt.',
    quickSetupTitle: 'Schnelleinrichtung',
    quickSetupDescription: 'Du kannst optional hier die Impressums-URL deiner Organisation eingeben und auf den Button klicken, damit unser Formular versucht einige Felder selbst anhand der öffentlichen Angaben deines Impressums zu befüllen. Es dauert nur 1 Sekunde. Du kannst selbstverständlich jedes Feld danach bearbeiten.',
    impressumUrlPlaceholder: 'https://deinewebsite.de/impressum',
    collectDataButton: 'Daten ermitteln',
    midContactTitle: 'MID-Ansprechpartner in deiner Organisation',
    midContactDescription: 'Die Person in deiner Organisation, welche Ansprechpartner für MID-Projekte für RapidWorks und den Fördergeber ist.',
    managingDirectorIsMidContact: 'Geschäftsführer ist auch MID-Ansprechpartner',
    organizationDescriptionLabel: 'Kurzbeschreibung deiner Organisation',
    
    // Address section
    country: 'Land',
    countryHelp: 'Bitte wählen Sie das Land aus.',
    countryOptions: {
      germany: 'Deutschland',
      austria: 'Österreich',
      switzerland: 'Schweiz'
    },
    street: 'Straße, Nr.',
    poBox: 'Postfach',
    poBoxPlaceholder: 'Optional - falls vorhanden',
    postalCode: 'PLZ',
    city: 'Stadt',
    
    // Project contact section
    projectContactTitle: 'Projektleiter/in beim Antragsteller',
    projectContactHelp: 'Bitte tragen Sie hier den technischen Ansprechpartner ein.',
    useManagementContactData: 'Geschäftsführungsdaten verwenden',
    phone: 'Telefon',
    role: 'Funktion',
    
    // Company description section
    descriptionTitle: 'Kurzbeschreibung',
    shortDescriptionTitle: 'Kurzbeschreibung',
    companyDescription: 'Kurzbeschreibung des antragstellenden Unternehmens.',
    descriptionPlaceholder: 'Erstellung von Markenauftritten für Unternehmen und weitere Services.',
    maxCharactersDescription: 'Maximal 600 Zeichen eintragen.',
    
    // Privacy section
    privacyTitle: 'Erklärung',
    privacyLabel: 'Datenschutzerklärung',
    privacyText: 'Ich habe die',
    privacyLink: 'Datenschutzerklärung',
    privacyAccept: 'gelesen und stimme dieser zu.',
    
    // Additional fields section
    additionalFieldsTitle: 'Zusätzliche Felder',
    bankAccountTitle: 'Bankverbindung',
    bankAccountDescription: 'Wird von MID bereits für die Loseinreichung benötigt.',
    foundingYear: 'Gründungsjahr',
    foundingDate: 'Gründungsdatum',
    taxId: 'Steuer-Id',
    iban: 'IBAN des Geschäftskontos',
    ibanExample: 'DE50512305000018102010',
    ibanFormat: 'Format Beispiel: DE50512305000018102010',
    bic: 'BIC des Geschäftskontos',
    bankName: 'Name der Bank des Geschäftskontos',
    accountHolderName: 'Name des Kontoinhabers',
    companyType: 'Unternehmensform',
    companyTypeOptions: {
      pleaseSelect: 'Bitte auswählen',
      company: 'Unternehmen',
      freelancer: 'Freiberufler',
      association: 'Vereinigung von natürlichen und/oder juristischen Personen',
      other: 'sonstiges'
    },
    companyCategory: 'Unternehmenskategorie gemäß KMU-Definition',
    companyCategoryOptions: {
      micro: 'Kleinstunternehmen: Jährlicher Umsatz & Bilanzsumme < 2 Mio. €.',
      small: 'Kleines Unternehmen: Jährlicher Umsatz & Bilanzsumme < 10 Mio. €.',
      medium: 'Mittleres Unternehmen: Jährlicher Umsatz < 50 Mio. € & Bilanzsumme < 43 Mio. €.',
      large: 'Großunternehmen: Jährlicher Umsatz >= 50 Mio. € oder Bilanzsumme > 43 Mio. €.'
    },
    industry: 'Branche',
    industryOptions: {
      pleaseSelect: 'Bitte auswählen',
      health: 'Gesundheit/Soziales/Pflege',
      media: 'Medien- und Kreativwirtschaft (Architektur, Design, Literatur, Presse, Software/Games, Bildende Kunst, Film, Musik, Rundfunk, Theater, Tanz, Kultur)',
      tourism: 'Tourismus/Hotel- und Gastgewerbe (inkl. Reisebüros)',
      machinery: 'Anlagen- und Maschinenbau/Produktion',
      manufacturing: 'Sonstiges verarbeitendes Gewerbe (Herstellung Nahrungs- und Futtermittel; Getränke; Textilien; Holz; Papier; chemische und pharmazeutische Erzeugnisse; Möbel etc.)',
      ict: 'Informations- und Kommunikationstechnik',
      energy: 'Energie- und Umweltwirtschaft (inkl. Wasserversorgung)',
      wholesale: 'Großhandel',
      retail: 'Einzelhandel',
      biotechnology: 'Biotechnologie',
      mobility: 'Mobilität/Transport/Logistik/Verkehr',
      craft: 'Handwerk',
      sports: 'Sport und Freizeit (z.B. Musikunterricht)',
      utilities: 'Energie- und Wasserversorgung',
      agriculture: 'Landwirtschaft/Forstwirtschaft/Fischerei',
      realEstate: 'Grundstücks- und Wohnungswesen',
      professional: 'Erbringung von freiberuflichen wissenschaftlichen technischen Dienstleistungen (z.B. Rechts-und Steuerberatung, Unternehmensberatung, Architekturbüros, Fotografie etc.)',
      other: 'Sonstiges'
    },
    employees: 'Mitarbeiteranzahl einschließlich Partner- und verbundener Unternehmen (Entsprechend Vollzeit-äquivalente)',
    
    // MID Funding History
    midFundingHistory: 'Vorherige MID-Förderung',
    midFundingInfo: 'Wichtig: Unternehmen müssen 24 Monate zwischen MID-Förderungsgenehmigungen warten. Bitte geben Sie Details über alle vorherigen MID Digitalisierungs- oder Digital Security-Förderungen an.',
    hasReceivedDigitisation: 'Hat Ihr Unternehmen bereits MID Digitalisierungs-Förderung erhalten?',
    hasReceivedDigitalSecurity: 'Hat Ihr Unternehmen bereits MID Digital Security-Förderung erhalten?',
    selectYesNo: 'Bitte wählen Sie Ja oder Nein für in der Vergangenheit erhaltene MID-Förderung',
    lastDigitisationApproval: 'Datum der letzten MID Digitalisierungs-Genehmigung',
    lastDigitalSecurityApproval: 'Datum der letzten MID Digital Security-Genehmigung',
    cooldownExplanation: 'Die 24-Monats-Karenzzeit beginnt ab diesem Genehmigungsdatum',
    
    // Buttons
    save: 'Speichern',
    saving: 'Speichern...',
    
    // Email setup
    emailForwardingTitle: 'Forward MID emails',
    emailForwardingDescription: 'Please set up email forwarding from MID systems to subsidy@rapid-works.io.',
    supportOffer: 'We offer free technical support for the setup.',
    
    // Digital signature
    digitalSignatureTitle: 'Digitale Unterschrift',
    digitalSignatureText: 'Ich bestätige mit meiner digitalen Unterschrift, dass alle Angaben korrekt und vollständig sind.',
    signAndSubmit: 'Digital unterschreiben und absenden',
    signingAndSaving: 'Wird unterschrieben und gespeichert...',
    
    // Profile reconfirmation
    reconfirmationTitle: 'Profil-Bestätigung erforderlich',
    reconfirmationDescription: 'Bitte bestätigen Sie, dass Ihre Informationen noch korrekt sind, bevor Sie fortfahren.',
    currentProfile: 'Aktuelles Profil',
    profileLastUpdated: 'Zuletzt aktualisiert',
    personalInformation: 'Persönliche Informationen',
    companyInformation: 'Unternehmensinformationen',
    addressInformation: 'Adressinformationen',
    reconfirmationSignatureText: 'Ich bestätige, dass alle oben angezeigten Informationen korrekt und aktuell sind.',
    signatureTimestamp: 'Unterschriftszeitstempel',
    editProfile: 'Profil bearbeiten',
    confirmAndSign: 'Bestätigen und unterschreiben',
    confirming: 'Wird bestätigt...',
    cancel: 'Abbrechen',
    
    // Messages
    successMessage: 'Formular erfolgreich übermittelt!',
    updateSuccessMessage: 'Formular erfolgreich aktualisiert!',
    errorMessage: 'Fehler beim Übermitteln des Formulars. Bitte versuchen Sie es erneut.',
    saveChanges: 'Änderungen speichern',
    noChanges: 'Keine Änderungen',
    updating: 'Wird aktualisiert...'
  },
  
  en: {
    // Header
    title: 'USER',
    required: '* Required field',
    projectId: 'Project-Id: 11776',
    
    // User section
    username: 'Username',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    passwordRequirement: 'The password must contain uppercase letters, lowercase letters, numbers (0-9) and special characters (exclusively [-.,;:%#@="+&()!*/]).',
    
    // Business contact section
    businessContactTitle: 'Management Contact Details',
    salutation: 'Salutation',
    salutationOptions: {
      mr: 'Mr.',
      mrs: 'Ms.',
      diverse: 'Diverse'
    },
    firstName: 'First name',
    lastName: 'Last name',
    maxCharacters: 'Max. 150 characters',
    homepage: 'Homepage',
    legalName: 'Legal name of the organization',
    legalNameHelp: '(You can find the legal name of your company in the commercial register extract)',
    organizationInfoDescription: 'This data represents your company. All fields are optional, but those marked with MID are required to participate in the MID lottery.',
    quickSetupTitle: 'Quick Setup',
    quickSetupDescription: 'You can optionally enter your organization\'s Impressum URL here and click the button so our form tries to fill some fields automatically based on the public information in your Impressum. It only takes 1 second. You can of course edit any field afterwards.',
    impressumUrlPlaceholder: 'https://yourwebsite.com/imprint',
    collectDataButton: 'Collect data',
    midContactTitle: 'MID contact in your organization',
    midContactDescription: 'The person in your organisation who is the contact person for MID projects for RapidWorks and the funding agency.',
    managingDirectorIsMidContact: 'Managing Director is also MID contact',
    organizationDescriptionLabel: 'Short description of your organization',
    
    // Address section
    country: 'Country',
    countryHelp: 'Please select the country.',
    countryOptions: {
      germany: 'Germany',
      austria: 'Austria',
      switzerland: 'Switzerland'
    },
    street: 'Street, No.',
    poBox: 'P.O. Box',
    poBoxPlaceholder: 'Optional - if applicable',
    postalCode: 'Postal code',
    city: 'City',
    
    // Project contact section
    projectContactTitle: 'Project Manager at Applicant',
    projectContactHelp: 'Please enter the technical contact person here.',
    useManagementContactData: 'Use management contact data',
    phone: 'Phone',
    role: 'Function',
    
    // Company description section
    descriptionTitle: 'Brief Description',
    shortDescriptionTitle: 'Short Description',
    companyDescription: 'Brief description of the applying company.',
    descriptionPlaceholder: 'Creation of brand appearances for companies and other services.',
    maxCharactersDescription: 'Enter a maximum of 600 characters.',
    
    // Privacy section
    privacyTitle: 'Declaration',
    privacyLabel: 'Privacy policy',
    privacyText: 'I have read the',
    privacyLink: 'privacy policy',
    privacyAccept: 'and agree to it.',
    
    // Additional fields section
    additionalFieldsTitle: 'Additional Fields',
    bankAccountTitle: 'Bank Account Information',
    bankAccountDescription: 'Is required by MID for the lottery ticket submission.',
    foundingYear: 'Founding year',
    foundingDate: 'Founding date',
    taxId: 'Tax ID',
    iban: 'IBAN of the Business Account',
    ibanExample: 'DE50512305000018102010',
    ibanFormat: 'Format Example: DE50512305000018102010',
    bic: 'BIC of the Business Account',
    bankName: 'Name of the Bank of the Business Account',
    accountHolderName: 'Name of the Account Holder',
    companyType: 'Company Type',
    companyTypeOptions: {
      pleaseSelect: 'Please select',
      company: 'Company',
      freelancer: 'Freelancer',
      association: 'Association of natural and/or legal persons',
      other: 'Other'
    },
    companyCategory: 'Company category according to SME definition',
    companyCategoryOptions: {
      micro: 'Micro enterprise: Annual turnover & balance sheet total < 2 Mio. €.',
      small: 'Small enterprise: Annual turnover & balance sheet total < 10 Mio. €.',
      medium: 'Medium enterprise: Annual turnover < 50 Mio. € & balance sheet total < 43 Mio. €.',
      large: 'Large enterprise: Annual turnover >= 50 Mio. € or balance sheet total > 43 Mio. €.'
    },
    industry: 'Industry',
    industryOptions: {
      pleaseSelect: 'Please select',
      health: 'Health/Social/Care',
      media: 'Media and Creative Industries (Architecture, Design, Literature, Press, Software/Games, Fine Arts, Film, Music, Broadcasting, Theater, Dance, Culture)',
      tourism: 'Tourism/Hotel and Catering (including travel agencies)',
      machinery: 'Plant and Mechanical Engineering/Production',
      manufacturing: 'Other Manufacturing (Food and Feed Production; Beverages; Textiles; Wood; Paper; Chemical and Pharmaceutical Products; Furniture etc.)',
      ict: 'Information and Communication Technology',
      energy: 'Energy and Environmental Economy (including water supply)',
      wholesale: 'Wholesale Trade',
      retail: 'Retail Trade',
      biotechnology: 'Biotechnology',
      mobility: 'Mobility/Transport/Logistics/Traffic',
      craft: 'Craft',
      sports: 'Sports and Leisure (e.g. Music Lessons)',
      utilities: 'Energy and Water Supply',
      agriculture: 'Agriculture/Forestry/Fishing',
      realEstate: 'Real Estate and Housing',
      professional: 'Provision of Professional Scientific Technical Services (e.g. Legal and Tax Consulting, Business Consulting, Architecture Offices, Photography etc.)',
      other: 'Other'
    },
    employees: 'Number of employees including partner and affiliated companies (Full-time equivalents)',
    
    // MID Funding History
    midFundingHistory: 'Previous MID Funding',
    midFundingInfo: 'Important: Companies must wait 24 months between MID funding approvals. Please provide details about any previous MID Digitisation or Digital Security funding received.',
    hasReceivedDigitisation: 'Has your company previously received MID Digitisation funding?',
    hasReceivedDigitalSecurity: 'Has your company previously received MID Digital Security funding?',
    selectYesNo: 'Please select Yes or No for MID funding received in the past',
    lastDigitisationApproval: 'Date of Last MID Digitisation Approval',
    lastDigitalSecurityApproval: 'Date of Last MID Digital Security Approval',
    cooldownExplanation: 'The 24-month cooldown period begins from this approval date',
    
    // Buttons
    save: 'Save',
    saving: 'Saving...',
    
    // Email setup
    emailForwardingTitle: 'Forward MID emails',
    emailForwardingDescription: 'Please set up email forwarding from MID systems to subsidy@rapid-works.io.',
    supportOffer: 'We offer free technical support for the setup.',
    
    // Digital signature
    digitalSignatureTitle: 'Digital Signature',
    digitalSignatureText: 'I confirm with my digital signature that all information is correct and complete.',
    signAndSubmit: 'Sign digitally and submit',
    signingAndSaving: 'Signing and saving...',
    
    // Profile reconfirmation
    reconfirmationTitle: 'Profile Confirmation Required',
    reconfirmationDescription: 'Please confirm that your information is still correct before proceeding.',
    currentProfile: 'Current Profile',
    profileLastUpdated: 'Last updated',
    personalInformation: 'Personal Information',
    companyInformation: 'Company Information',
    addressInformation: 'Address Information',
    reconfirmationSignatureText: 'I confirm that all information displayed above is correct and current.',
    signatureTimestamp: 'Signature timestamp',
    editProfile: 'Edit Profile',
    confirmAndSign: 'Confirm and Sign',
    confirming: 'Confirming...',
    cancel: 'Cancel',
    
    // Messages
    successMessage: 'Form submitted successfully!',
    updateSuccessMessage: 'Form updated successfully!',
    errorMessage: 'Error submitting form. Please try again.',
    saveChanges: 'Save Changes',
    noChanges: 'No Changes',
    updating: 'Updating...'
  }
};
