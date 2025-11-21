
export const midTranslations = { 
  de: {
    // Header
    title: 'BENUTZER',
    required: '* Pflichtfeld',
    projectId: 'Projekt-Id: 11776',
    createOrganization: 'Deine Organisation',
    organizationCreated: 'Organisation angelegt!',
    creatingOrganization: 'Organisation wird erstellt...',
    
    // User section
    username: 'Benutzername',
    email: 'E-Mailadresse',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    passwordRequirement: 'Das Passwort muss Groß-, Kleinbuchstaben, Zahlen (0-9) und Sonderzeichen (ausschließlich [-.,;:%#@="+&()!*/]) beinhalten.',
    
    // Business contact section
    businessContactTitle: 'Kontaktdaten der Geschäftsführung',
    managingDirectorTitle: 'Geschäftsführer',
    managingDirectorDescription: 'Falls deine Organisation keinen Geschäftsführer hat, dann gib hier den Hauptverantwortlichen deiner Organisation an.',
    salutation: 'Anrede',
    salutationOptions: {
      pleaseSelect: 'Bitte wählen',
      mr: 'Herr',
      mrs: 'Frau',
      diverse: 'Divers'
    },
    firstName: 'Vorname',
    lastName: 'Nachname',
    maxCharacters: 'Max. 150 Zeichen',
    homepage: 'Website',
    legalName: 'Rechtsverbindlicher Name der Organisation',
    legalNameHelp: '(Sie finden den rechtsverbindlichen Namen Ihres Unternehmens bspw. im Handelsregisterauszug)',
    organizationDataTitle: 'Organisations Daten',
    organizationInfoDescription: 'Diese Daten repräsentieren deine Organisation. Alle Felder sind optional, aber die mit MID gekennzeichneten Felder werden zur Teilnahme am MID-Losverfahren benötigt.',
    organizationCreationDescription: 'Richte dein Organisationskonto ein. Mit * markierte Felder sind erforderlich, um zu beginnen. Du kannst später weitere Details für MID-Anwendungen hinzufügen.',
    quickSetupTitle: 'Schnelleinrichtung',
    quickSetupDescription: 'Du kannst optional hier die Impressums-URL deiner Organisation eingeben und auf den Button klicken, damit unser Formular versucht einige Felder selbst anhand der öffentlichen Angaben deines Impressums zu befüllen. Es dauert nur 1 Sekunde. Du kannst selbstverständlich jedes Feld danach bearbeiten.',
    impressumUrlPlaceholder: 'https://deinewebsite.de/impressum',
    collectDataButton: 'Daten ermitteln',
    midContactTitle: 'MID-Ansprechpartner in deiner Organisation',
    midContactDescription: 'Die Person in deiner Organisation, welche Ansprechpartner für MID-Projekte für RapidWorks und den Fördergeber ist. Wenn nicht jemand anderes angegeben wird, dann ist der angegebene Geschäftsführer auch der MID-Ansprechpartner.',
    managingDirectorIsMidContact: 'Geschäftsführer ist auch MID-Ansprechpartner',
    alternativeMidContact: 'Abweichender MID-Ansprechpartner',
    midContactOptions: {
      same: 'Geschäftsführer ist auch MID-Ansprechpartner',
      different: 'MID-Ansprechpartner weicht von Geschäftsführer ab'
    },
    organizationDescriptionLabel: 'Kurzbeschreibung deiner Organisation',
    
    // Address section
    country: 'Land',
    countryHelp: 'Bitte wählen Sie das Land aus.',
    countryOptions: {
      germany: 'Deutschland',
      austria: 'Österreich',
      switzerland: 'Schweiz'
    },
    street: 'Straße',
    streetNumber: 'Hausnummer',
    poBox: 'Postfach',
    poBoxPlaceholder: 'Optional - falls vorhanden',
    postalCode: 'PLZ',
    postalCodePlaceholder: '52070',
    city: 'Stadt',
    cityPlaceholder: 'Aachen',
    
    // Project contact section
    projectContactTitle: 'Projektleiter/in beim Antragsteller',
    projectContactHelp: 'Bitte tragen Sie hier den technischen Ansprechpartner ein.',
    useManagementContactData: 'Geschäftsführungsdaten verwenden',
    phone: 'Telefon',
    phoneAreaCode: 'Vorwahl',
    phoneNumber: 'Telefonnummer',
    phoneNumberHelp: 'Ohne führende Nullen (bspw. 157 123 456 78)',
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
    taxId: 'Steuernummer',
    taxIdHelp: 'Die Steuernummer deiner Organisation findest du bspw. auf einem Schreiben des Finanzamtes, in Elster, oder auf der Gewerbeanmeldung.',
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
    employeesTitle: 'Mitarbeiter',
    employeesHelp: "Einigen Förderprogramme verwenden die Gesamtzahl der Beschäftigten, andere die Vollzeitäquivalente. Falls du die exakten Zahlen nicht auswendig kennst, reichen grobe Werte. Allerdings liegen die Schwellenwerte für Förderungen bei 10, 50 und 250 Mitarbeitern. Es ist also nur wichtig, dass deine Zahl im richtigen Bereich (0-9, 10-49, 50-249, 250+) liegt. Innerhalb dieses Bereiches darf sie ruhig ungenau sein (bspw. 25 statt 29 ist ok, aber 10 statt 9 ist ein relevanter Unterschied).",
    totalEmployees: 'Anzahl Mitarbeiter',
    totalEmployeesHelp: 'Die Anzahl aller sozialversicherungspflichtig angestellter Mitarbeiter, unabhängig von ihrer Arbeitsstundenanzahl.',
    fullTimeEquivalents: 'Vollzeitäquivalente',
    fullTimeEquivalentsHelp: 'Stundenbasierte Zählung relativ zu Vollzeitmitarbeitern (bspw. 1 für 40h-Stelle, 0,5 für 20h-Stelle, etc.)',
    employees: 'Mitarbeiteranzahl einschließlich Partner- und verbundener Unternehmen (Entsprechend Vollzeit-äquivalente)',
    
    // MID Funding History
    midFundingHistory: 'Vorherige MID-Förderung',
    midFundingInfo: 'Wichtig: Unternehmen müssen 24 Monate zwischen MID-Förderungsgenehmigungen warten. Bitte geben Sie Details über alle vorherigen MID Digitalisierungs- oder Digital Security-Förderungen an.',
    hasReceivedDigitisation: 'Hat Ihr Unternehmen bereits MID Digitalisierungs-Förderung erhalten?',
    hasReceivedDigitalSecurity: 'Hat Ihr Unternehmen bereits MID Digital Security-Förderung erhalten?',
    selectYesNo: 'Bitte wählen Sie Ja oder Nein für in der Vergangenheit erhaltene MID-Förderung',
    yes: 'Ja',
    no: 'Nein',
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
    unsavedChanges: {
      title: 'Ungespeicherte Änderungen',
      message: 'Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren? Alle Änderungen gehen verloren.',
      cancel: 'Abbrechen',
      leave: 'Verlassen'
    },
    updating: 'Wird aktualisiert...',
    
    // Onboarding translations
    onboarding: {
      applyToMID: {
        title: 'MID Digitalisierungszuschuss beantragen',
        description: 'Beauftrage uns dein Los für das Förderprogramm MID Digitalisierung einzureichen, über welches du einen Zuschuss von bis zu 15.000€ für ein Digitalisierungsprojekt erhalten kannst.',
        buttonText: 'MID Digitalisierung Los einreichen',
        skipText: 'Überspringen',
        checkingRequirements: 'MID-Anforderungen werden überprüft...',
        midSkipped: 'MID-Antrag übersprungen - du kannst zum nächsten Schritt fortfahren.',
        midSubmitted: 'MID-Antrag eingereicht.',
        completeFields: 'Vervollständige die erforderlichen Felder, um einen MID-Antrag zu stellen.',
        requiredFieldsMessage: '{count} MID-Pflichtfelder müssen noch besetzt werden.',
        alreadyApplied: 'Bereits bei MID beworben',
        applyToMID: 'Bei MID bewerben',
        editOrganization: 'Organisation bearbeiten'
      },
      bookCoachingCall: {
        title: 'Kostenfreien Coaching Call vereinbaren',
        description: 'Vereinbare einen kostenfreien 30-minütigen Coaching Call mit einem unserer Digitalisierungs-Coaches.',
        buttonText: 'Kostenfreien Call vereinbaren'
      },
      createOrganization: {
        title: 'Lege deine Organisation an',
        description: 'Fülle dein Organisationsformular aus, um zu beginnen.',
        buttonText: 'Organisation anlegen',
        alreadyPartOf: 'Jemand aus deiner Organisation hat diese bereits bei uns registriert? Dann bitte den Organisations-Admin dich einzuladen.',
        modalTitle: 'Organisation anlegen',
        modalTitleCompleteFields: 'Erforderliche Felder vervollständigen'
      },
      inviteCoworkers: {
        title: 'Team-Mitglieder einladen',
        description: 'Lade deine Kollegen ein, deiner Organisation beizutreten.',
        teamInvited: 'Team-Mitglieder eingeladen.',
        inviteSkipped: 'Einladungsaufgabe übersprungen.',
        buttonText: 'Team-Mitglieder einladen',
        skipForNow: 'Überspringen'
      },
      profile: {
        title: 'Dein Profil',
        profileData: 'Profildaten',
        security: 'Sicherheit',
        addProfilePicture: 'Klicke auf das Kamera-Icon, um ein Profilbild hinzuzufügen.',
        maxFileSize: 'Maximale Dateigröße 5MB',
        changePassword: 'Passwort ändern',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        confirmPassword: 'Passwort bestätigen',
        deleteAccount: 'Account löschen',
        deleteAccountWarning: 'Achtung, wenn du deinen Account löschst, werden all deine Daten unwiderruflich gelöscht!',
        deleteAccountButton: 'Account löschen',
        firstName: 'Vorname',
        firstNamePlaceholder: 'Max',
        lastName: 'Nachname',
        lastNamePlaceholder: 'Mustermann',
        email: 'Email',
        contactSupport: 'Kontaktiere unseren Support, um deine E-Mail Adresse zu ändern.',
        cancel: 'Abbrechen',
        save: 'Speichern'
      },
      completeProfile: {
        title: 'Profil vervollständigen',
        completed: 'Profil vervollständigt.',
        needsCompletion: 'Profil muss vervollständigt werden - Vor- und Nachname erforderlich.',
        addNames: 'Füge deinen Vor- und Nachnamen hinzu, um dein Profil zu vervollständigen.',
        buttonText: 'Profil vervollständigen',
        namesRequired: 'Vor- und Nachname müssen ausgefüllt werden, um fortzufahren.'
      },
      dashboard: {
        welcome: 'Willkommen, {name}.',
        subtitle: 'Schließe in 6 einfachen Schritten deine Registrierung ab.',
        progress: 'Dein Fortschritt',
        progressText: '{completed} von {total} Schritten erledigt.',
        verifyEmail: 'Email verifizieren',
        completed: 'Erledigt',
        verifyEmailDescription: 'Verifiziere deine E-Mail Adresse.',
        completeProfileDescription: 'Füge deinen Vor- und Nachnamen zu deinem Profil hinzu.',
        completeProfileButton: 'Profil vervollständigen →',
        createOrganization: 'Deine Organisation',
        completeStepFirst: 'Schließe zuerst Schritt {step} ab.',
        allStepsCompleted: 'Alle Schritte abgeschlossen! Es gibt nichts mehr zu tun.'
      }
    }
  },
  
  en: {
    // Header
    title: 'USER',
    required: '* Required field',
    projectId: 'Project-Id: 11776',
    createOrganization: 'Your organization',
    organizationCreated: 'Organization Created!',
    creatingOrganization: 'Creating Organization...',
    
    // User section
    username: 'Username',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm password',
    passwordRequirement: 'The password must contain uppercase letters, lowercase letters, numbers (0-9) and special characters (exclusively [-.,;:%#@="+&()!*/]).',
    
    // Business contact section
    businessContactTitle: 'Management Contact Details',
    managingDirectorTitle: 'Managing Director',
    managingDirectorDescription: 'If your organization does not have a managing director, please enter the name of the person primarily responsible for your organization here.',
    salutation: 'Salutation',
    salutationOptions: {
      pleaseSelect: 'Please Select',
      mr: 'Mr.',
      mrs: 'Ms.',
      diverse: 'Diverse'
    },
    firstName: 'First name',
    lastName: 'Last name',
    maxCharacters: 'Max. 150 characters',
    homepage: 'Website',
    legalName: 'Legal name of the organization',
    legalNameHelp: '(You can find the legal name of your company in the commercial register extract)',
    organizationDataTitle: 'Organization Data',
    organizationInfoDescription: `This data represents your company. All fields are optional, but those marked with MID are required to participate in the MID lottery.`,
    organizationCreationDescription: 'Set up your organization account. Fields marked with * are required to get started. You can add more details later for MID applications.',
    quickSetupTitle: 'Quick Setup',
    quickSetupDescription: 'You can optionally enter your organization\'s Impressum URL here and click the button so our form tries to fill some fields automatically based on the public information in your Impressum. It only takes 1 second. You can of course edit any field afterwards.',
    impressumUrlPlaceholder: 'https://yourwebsite.com/imprint',
    collectDataButton: 'Collect data',
    midContactTitle: 'MID contact in your organization',
    midContactDescription: 'The person in your organisation who is the contact person for MID projects for RapidWorks and the funding agency. Unless someone else is specified, the managing director listed is also the MID contact person.',
    managingDirectorIsMidContact: 'Managing Director is also MID contact',
    alternativeMidContact: 'Alternative MID contact person',
    midContactOptions: {
      same: 'Managing Director is also MID contact',
      different: 'MID contact person differs from managing director'
    },
    organizationDescriptionLabel: 'Short description of your organization',
    
    // Address section
    country: 'Country',
    countryHelp: 'Please select the country.',
    countryOptions: {
      germany: 'Germany',
      austria: 'Austria',
      switzerland: 'Switzerland'
    },
    street: 'Street',
    streetNumber: 'Number',
    poBox: 'P.O. Box',
    poBoxPlaceholder: 'Optional - if applicable',
    postalCode: 'Postal code',
    postalCodePlaceholder: '52070',
    city: 'City',
    cityPlaceholder: 'Aachen',
    
    // Project contact section
    projectContactTitle: 'Project Manager at Applicant',
    projectContactHelp: 'Please enter the technical contact person here.',
    useManagementContactData: 'Use management contact data',
    phone: 'Phone',
    phoneAreaCode: 'Country Code',
    phoneNumber: 'Phone Number',
    phoneNumberHelp: 'Enter number without leading zeros (e.g., 157 123 456 78)',
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
    taxId: 'Tax Number',
    taxIdHelp: 'You can find your organization\'s tax number (In Germany "Steuernummer") on a letter from the tax office, in Elster, or on your business registration, for example.',
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

    employeesTitle: 'Employees',
    employeesHelp: "Some subsidy programs use the total number of employees, others use full-time equivalents. If you don't know the exact figures off the top of your head, rough estimates will suffice. However, the thresholds for subsidies are 10, 50, and 250 employees. So it is only important that your number is in the correct range (0-9, 10-49, 50-249, 250+). Within this range, it can be inaccurate (e.g., 25 instead of 29 is okay, but 10 instead of 9 is a relevant difference).",
    totalEmployees: 'Total Number of Employees',
    totalEmployeesHelp: 'Count every social secured employee as one complete employee, indifferent of worked hours',
    fullTimeEquivalents: 'Full Time Equivalents',
    fullTimeEquivalentsHelp: 'Counting based on weekly hours (e.g., 0.5 for half-time employee)',
    employees: 'Number of employees including partner and affiliated companies (Full-time equivalents)',
    
    // MID Funding History
    midFundingHistory: 'Previous MID Funding',
    midFundingInfo: 'Important: Companies must wait 24 months between MID funding approvals. Please provide details about any previous MID Digitisation or Digital Security funding received.',
    hasReceivedDigitisation: 'Has your company previously received MID Digitisation funding?',
    hasReceivedDigitalSecurity: 'Has your company previously received MID Digital Security funding?',
    selectYesNo: 'Please select Yes or No for MID funding received in the past',
    yes: 'Yes',
    no: 'No',
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
    unsavedChanges: {
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to leave? All changes will be lost.',
      cancel: 'Cancel',
      leave: 'Leave'
    },
    updating: 'Updating...',
    
    // Onboarding translations
    onboarding: {
      applyToMID: {
        title: 'Apply to MID Funding',
        description: 'Comission us to submit your application for the MID Digitalization funding program through which you can receive a grant of up to €15,000 for a digitization project.',
        buttonText: 'Submit MID digitization lottery entry',
        skipText: 'Skip this step',
        checkingRequirements: 'Checking MID requirements...',
        midSkipped: 'MID application skipped - you can proceed to the next step.',
        midSubmitted: 'MID application submitted.',
        completeFields: 'Complete required fields to apply for MID funding.',
        requiredFieldsMessage: '{count} required fields need to be filled.',
        alreadyApplied: 'Already Applied to MID',
        applyToMID: 'Apply to MID',
        editOrganization: 'Edit Organization'
      },
      bookCoachingCall: {
        title: 'Book a Free Coaching Call',
        description: 'Schedule a free 30-minute coaching call with one of our digitalization coaches.',
        buttonText: 'Schedule Free Call'
      },
      createOrganization: {
        title: 'Create your organization',
        description: 'Fill out your organization form to get started.',
        buttonText: 'Create Organization',
        alreadyPartOf: 'Already part of an organization? Reach out to your admin to add you.',
        modalTitle: 'Create organization',
        modalTitleCompleteFields: 'Complete Required Fields'
      },
      inviteCoworkers: {
        title: 'Invite Your Coworkers',
        description: 'Invite your colleagues to join your organization.',
        teamInvited: 'Team members invited.',
        inviteSkipped: 'Invite task skipped.',
        buttonText: 'Invite Team Members',
        skipForNow: 'Skip for now'
      },
      profile: {
        title: 'Your Profile',
        profileData: 'Profile data',
        security: 'Security',
        addProfilePicture: 'Click on the camera icon to add a profile picture.',
        maxFileSize: 'Maximum file size 5MB',
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        deleteAccount: 'Delete Account',
        deleteAccountWarning: 'Please note that if you delete your account, all your data will be irrevocably deleted!',
        deleteAccountButton: 'Delete Account',
        firstName: 'First Name',
        firstNamePlaceholder: 'Max',
        lastName: 'Last Name',
        lastNamePlaceholder: 'Mustermann',
        email: 'Email',
        contactSupport: 'Contact our support to change your email address.',
        cancel: 'Cancel',
        save: 'Save'
      },
      completeProfile: {
        title: 'Complete Profile',
        completed: 'Profile completed.',
        needsCompletion: 'Profile needs completion - first and last name required.',
        addNames: 'Add your first and last name to complete your profile.',
        buttonText: 'Complete Profile',
        namesRequired: 'First and last name must be filled to continue.'
      },
      dashboard: {
        welcome: 'Welcome back, {name} 👋',
        subtitle: 'Let\'s get your account set up in {total} simple steps.',
        progress: 'Your Progress',
        progressText: '{completed} of {total} steps completed.',
        verifyEmail: 'Verify your email',
        completed: 'Completed',
        verifyEmailDescription: 'Confirm your email address to secure your account.',
        completeProfileDescription: 'Add your first and last name to complete your profile.',
        completeProfileButton: 'Complete Profile →',
        createOrganization: 'Your organization',
        completeStepFirst: 'Complete step {step} first.',
        allStepsCompleted: 'All steps completed! There\'s nothing more to do.'
      }
    }
  }
};
