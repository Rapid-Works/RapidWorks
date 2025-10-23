"use client"

import React, { useCallback, useState, useEffect, useRef } from "react"
import { Analytics } from "@vercel/analytics/react"
import { track } from "@vercel/analytics"
import { submitVBFormToAirtable } from "../utils/airtableService"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import realtimeColorsPreview from "../images/realtimecolors.png"
// Import an image for Calendly preview (replace with actual path if needed)
// import calendlyPreview from "../assets/calendly_preview.png";

// English translations
const en = {
  header: "VB - Company Information Form",
  disclaimer:
    "Important: Please fill out this form thinking about the future state of your company (approx. 6-12 months ahead), not just the current status.",
  // Company Information
  companyInfo: "Company Information",
  name: "What is your company name?",
  nameDescription: "Your company's legal name",
  industry: "Which industry would you classify your business in?",
  industryDescription: "The sector your business operates in",
  businessType: "What type(s) of customers do you want to serve?",
  businessTypeDescription: "Select all customer types you target",
  slogan: "Do you already have a slogan? (Optional)",
  sloganDescription: "A short, memorable phrase that represents your brand",
  customerGroups: "How many different customer groups do you have?",
  customerGroupsDescription: "Number of distinct customer segments you target",
  customerDescription: "Who is your customer?",
  customerDescriptionDescription:
    "Detailed description of your ideal customer profile, including demographics, needs, and behaviors",
  customerAcquisition: "How should customers reach your website?",
  customerAcquisitionDescription: "Select all methods through which customers typically find you",
  linkSource: "How does the customer receive the link?",
  linkSourceDescription: "Specific websites, platforms, or referral sources that bring you customers",
  productCount: "How many different products or services do you offer?",
  productCountDescription: "Total number of products or services you offer",
  websiteProductCount: "How many products/services should be displayed on the website?",
  websiteProductCountDescription: "Number of products/services to feature on your website",
  customerProblem: "What problem does this customer have that your product or service solves?",
  customerProblemDescription: "The main pain points or challenges your customers face that your product/service solves",
  solution: "How does your product or service solve this problem?",
  solutionDescription: "How your product or service solves the customer's problem",
  competitors: "If you have already identified competitors, enter them here",
  competitorsDescription: "List of your main competitors and brief description of how you differ",
  address: "If your company already has an address, enter it here",
  addressDescription: "Your company's physical address",

  // Founder sections
  founder1: "Founder 1",
  founder2: "Founder 2",
  founder3: "Founder 3",
  founder4: "Founder 4",
  title: "Title",
  titleDescription: "Professional title (e.g., Dr., Prof.)",
  position: "Position",
  positionDescription: "Role in the company (e.g., CEO, CTO)",
  firstName: "First Name",
  firstNameDescription: "Founder's first name",
  lastName: "Last Name",
  lastNameDescription: "Founder's last name",
  image: "Image",
  imageDescription: "Professional photo of the founder (recommended size: 400x400px)",
  gender: "Gender",
  genderDescription: "Founder's gender for proper communication",
  mobile: "Mobile",
  mobileDescription: "Founder's mobile phone number",
  landline: "Landline",
  landlineDescription: "Office or landline phone number",
  email: "Email",
  emailDescription: "Founder's business email address",
  calendar: "Calendar",
  calendarDescription: "Link to the founder's booking/calendar system (e.g., Calendly).",
  calendarHelp:
    'Tip: Use a free tool like <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:underline">Calendly</a> to easily create a professional booking link. Paste the final booking link here.',

  // Website Setup
  websiteSetup: "Website Setup",
  currentWebsite: "If you already have a website, please enter the link here",
  currentWebsiteDescription: "URL of your existing website, if any",
  domainRegistrant: "Domain Registrant",
  domainRegistrantDescription: "e.g., All-Inkl, United Domains, Wix, Strato, etc.",
  adminRightsHolder: "Admin Rights Holder",
  adminRightsHolderDescription: "Who has administrative access to the domain/website?",
  technicalContact: "Technical Contact",
  technicalContactDescription: "One person we can contact for technical clarifications.",
  addressForm: 'Do you want to address your customers formally ("Sie") or informally ("Du")?',
  addressFormDescription: "How you want to address visitors on your website (formal or informal)",
  perspective: "Will you speak as 'I' or 'We' on the website?",
  perspectiveDescription: "e.g., 'Our mission is ...' or 'My mission is ...'",
  calendarLink: "Which calendar link should be used on the website?",
  calendarLinkDescription: "URL to your booking system or calendar for appointments",
  partners: "If you already have partners that should be mentioned on the website, enter them here",
  partnersDescription: "List of business partners or affiliations to display on your website",
  hasTestimonials: "Do you already have testimonials?",
  hasTestimonialsDescription: "Check if you have customer testimonials to display",
  newsletterPopupTimer: "Should your website display a newsletter popup after a fixed number of seconds?",
  newsletterPopupTimerDescription: "Time in seconds before the newsletter signup popup appears (0 to disable)",

  // Testimonials
  testimonials: "Testimonials",
  testimonialName: "Name",
  testimonialNameDescription: "Full name",
  testimonialPosition: "Position",
  testimonialPositionDescription: "Job title",
  company: "Company",
  companyDescription: "Company name",
  text: "Text",
  textDescription: "Content",

  // FAQs
  faqs: "FAQs",
  hasFAQs: "Has FAQs",
  hasFAQsDescription: "Check if you want to include a FAQ section on your website",
  question1: "Question 1",
  question1Description: "First frequently asked question",
  answer1: "Answer 1",
  answer1Description: "Answer to the first question",
  question2: "Question 2",
  question2Description: "Second frequently asked question",
  answer2: "Answer 2",
  answer2Description: "Answer to the second question",
  question3: "Question 3",
  question3Description: "Third frequently asked question",
  answer3: "Answer 3",
  answer3Description: "Answer to the third question",

  // Visibility Bundle
  visibilityBundle: "Visibility Bundle Elements Ranking",
  visibilityBundleDescription:
    "Drag and drop to rank these items from most important (top) to least important (bottom)",
  logoRank: "Logo",
  logoRankDescription: "Your company's primary visual identifier",
  websiteRank: "Website",
  websiteRankDescription: "Your online presence and digital storefront",
  callBackgroundRank: "Call Background",
  callBackgroundRankDescription: "Professional background for video calls",
  qrCodeRank: "QR Code",
  qrCodeRankDescription: "Scannable code linking to your website or specific content",
  socialMediaBannerRank: "Social Media Banner",
  socialMediaBannerRankDescription: "Header images for your social media profiles",
  newsletterTemplateRank: "Newsletter Template",
  newsletterTemplateRankDescription: "Design template for email newsletters",
  emailSignaturesRank: "Email Signatures",
  emailSignaturesRankDescription: "Professional email footer with your branding",
  letterTemplateRank: "Letter Template",
  letterTemplateDescription: "Branded template for business letters",
  smartphoneScreenBackgroundRank: "Smartphone Screen Background",
  smartphoneScreenBackgroundRankDescription: "Branded wallpaper for mobile devices",
  desktopScreenBackgroundRank: "Desktop Screen Background",
  desktopScreenBackgroundRankDescription: "Branded wallpaper for computers",
  rollUpRank: "Roll-Up",
  rollUpRankDescription: "Portable banner display for events",
  flyerRank: "Flyer",
  flyerRankDescription: "Print marketing material for distribution",
  businessCardsRank: "Business Cards",
  businessCardsRankDescription: "Physical cards with your contact information",
  shirtsHoodiesRank: "Shirts & Hoodies",
  shirtsHoodiesRankDescription: "Branded apparel for team members",
  pitchDeckRank: "Pitch Deck",
  pitchDeckRankDescription: "Presentation template for investor pitches",
  bookingToolIntegrationRank: "Booking Tool Integration",
  bookingToolIntegrationRankDescription: "Online scheduling system for appointments",

  // Additional Info
  additionalInfo: "Additional Info",
  companyStage: "What stage is your company in?",
  companyStageDescription: "Current development phase of your business",
  knowsGoToMarketVoucher: "Are you already familiar with the GoToMarket voucher?",
  knowsGoToMarketVoucherDescription: "Check if you're familiar with the GoToMarket voucher program",
  appliedForGoToMarketVoucher: "Have you already applied for the GoToMarket voucher?",
  appliedForGoToMarketVoucherDescription: "Check if you've already applied for the GoToMarket voucher",
  additionalDocuments: "Feel free to upload any documents we can use for reference",
  additionalDocumentsDescription: "Any other relevant files or documents to support your submission",
  addInfo: "Feel free to write any additional relevant information here",
  addInfoDescription: "Any other information that might be relevant for your project",

  // Metadata
  metadata: "Metadata",
  submissionID: "Submission ID",
  submissionDate: "Submission Date",
  language: "Language",
  formVersion: "Form Version",

  // Form actions
  submit: "Submit Form",
  submitting: "Submitting...",
  success: "Form submitted successfully!",
  next: "Next",
  previous: "Previous",

  // Dropdown options
  selectOption: "Select an option",
  businessCustomers: "Business Customers",
  privateCustomers: "Private Customers",
  governmentalOrders: "Governmental Orders",
  further: "Other",
  searchEngineSearch: "They search for me on search engines (e.g., Google, Bing etc.)",
  adClicks: "They click on my advertisements (e.g., on social media platforms)",
  linkQrCode: "They receive the link/QR code from me (e.g., via business card, flyer, direct message etc.)",
  friendReferral: "They receive the link from a friend.",
  other: "Other",
  searchEngines: "Search Engines",
  link: "Link",
  male: "Male",
  female: "Female",
  diverse: "Diverse",
  du: "Du",
  sie: "Sie",
  ich: "I",
  wir: "We",
  idea: "Idea",
  founded: "Founded",
  hasCustomers: "Has Customers",
  german: "German",
  english: "English",

  // Language toggle
  switchLanguage: "Sprache wechseln zu Deutsch",

  // New translations
  selectedFile: "Selected file",
  chooseFile: "Choose a file...",
  uploadingFiles: "Uploading files...",
  fileUploadError: "Error uploading file",
  uploadComplete: "Upload complete",

  // Progress
  progressOf: "of",
  completeYourProfile: "Complete your profile",
  step: "Step",

  // New
  founders: "Founders",
  founder: "Founder",
  review: "Review & Submit",

  // Drag and drop
  dragToReorder: "Drag to reorder",

  // Thank you page
  thankYou: "Thank You!",
  formSubmitted: "Your form has been submitted successfully.",
  whatHappensNext: "What happens next?",
  teamWillReview: "Our team will review your information and get back to you within 2-3 business days.",
  downloadPdf: "Download PDF",
  backToHome: "Back to Home",
  reviewSubmit: "Review Submission",
  reviewMessage: "Please review your information before submitting.",

  // New fields
  smartphones: "Which smartphones do you founders have?",
  smartphonesDescription: "Which smartphones do your founders use",
  communicationEmail: "Which email address should we use to contact you?",
  communicationEmailDescription: "Email address we should use to contact you",
  designPreferences: "Design Preferences",
  colorPreferences: "Do you have specific color preferences for your website?",
  colorPreferencesDescription:
    "Specific color preferences for your website. Click the 'Pick Colors' button to open <a href='https://www.realtimecolors.com' target='_blank' rel='noopener noreferrer' class='text-purple-600 hover:underline'>realtimecolors.com</a> where you can experiment with different color schemes. When you're satisfied with your colors, copy the URL from that website and paste it here. This helps us understand your exact color preferences.",
  pickColorsButton: "Pick Colors", // New key for button text
  colorPreferencesPlaceholder: "Paste the realtimecolors.com URL here", // New key for placeholder
  fontPreferences: "If you have already decided on a font, please specify it here",
  fontPreferencesDescription: "If you have a specific font style in mind",
  stylePreferences: "Style Preferences",
  stylePreferencesDescription: "Your preferred design style",
  brandingEmotions: "What emotions should your branding convey?",
  brandingEmotionsDescription: "What emotions should your branding convey",

  // Style preferences options
  minimalistisch: "Minimalist",
  verspielt: "Playful",
  elegant: "Elegant",
  tech: "Tech",
  luxuriös: "Luxurious",
  clean: "Clean",
  kreativ: "Creative",

  // Branding emotions options
  vertrauen: "Trust",
  innovation: "Innovation",
  nachhaltigkeit: "Sustainability",

  // Boolean translations for review
  yes: "Yes",
  no: "No",
  addFounder: "Add Another Founder",
  openGraphImage: "Open Graph Image (for link previews)",
  openGraphImageDescription: "This image will be used as a preview when your website link is shared on third-party platforms (e.g., WhatsApp, LinkedIn, iMessage, etc.), as shown in the example below. It will NOT be shown on your website itself.",
  favicon: "Favicon (browser tab icon)",
  faviconDescription: "This small icon will appear in the browser tab bar, as shown in the example below. It will NOT be shown on your website itself.",
}

// German translations
const de = {
  header: "Unternehmensinformationsformular",
  disclaimer:
    "Wichtig: Bitte füllt dieses Formular mit Blick auf den zukünftigen Zustand eures Unternehmens aus (ca. 6-12 Monate im Voraus), nicht nur den aktuellen Status.",
  // Company Information
  companyInfo: "Unternehmensdaten",
  name: "Wie nennt ihr euer Unternehmen?",
  nameDescription: "Der rechtliche Name eures Unternehmens",
  industry: "Welcher Industrie würdet ihr euch zuordnen?",
  industryDescription: "Der Sektor, in dem euer Unternehmen tätig ist",
  businessType: "Welche Art(en) von Kunden wollt ihr betreuen?",
  businessTypeDescription: "Wählt alle zutreffenden Kundentypen aus",
  slogan: "Habt ihr bereits einen Slogan? (Optional)",
  sloganDescription: "Ein kurzer, einprägsamer Satz, der eure Marke repräsentiert",
  customerGroups: "Wie viele unterschiedliche Kundengruppen habt ihr?",
  customerGroupsDescription: "Anzahl der verschiedenen Kundensegmente, die ihr ansprecht",
  customerDescription: "Wer ist euer Kunde?",
  customerDescriptionDescription: "Detaillierte Beschreibung eures idealen Kundenprofils",
  customerAcquisition: "Wie sollen die Kunden auf eure Webseite gelangen?",
  customerAcquisitionDescription: "Wählt alle Wege aus, wie Kunden typischerweise zu euch finden",
  linkSource: "Wie erhält der Kunde den Link?",
  linkSourceDescription: "Spezifische Websites, Plattformen oder Empfehlungsquellen, die euch Kunden bringen",
  productCount: "Wie viele unterschiedliche Produkte oder Services bietet ihr an?",
  productCountDescription: "Gesamtzahl der Produkte oder Dienstleistungen, die ihr anbietet",
  websiteProductCount: "Wie viele Produkte/Services sollen auf der Website dargestellt werden?",
  websiteProductCountDescription: "Anzahl der Produkte/Services, die auf der Website präsentiert werden sollen",
  customerProblem: "Welches Problem hat dieser Kunde, das euer Produkt oder Service löst?",
  customerProblemDescription: "Die wichtigsten Schmerzpunkte oder Herausforderungen eurer Kunden",
  solution: "Wie löst euer Produkt oder Service dieses Problem?",
  solutionDescription: "Wie euer Produkt oder eure Dienstleistung das Problem des Kunden löst",
  competitors: "Falls ihr bereits Konkurrenten ausfindig gemacht habt, gebt diese hier ein",
  competitorsDescription: "Liste eurer Hauptkonkurrenten und kurze Beschreibung, wie ihr euch unterscheidet",
  address: "Falls euer Unternehmen bereits eine Adresse hat, gebt sie hier ein",
  addressDescription: "Die physische Adresse eures Unternehmens",

  // Founder sections
  founder1: "Gründer 1",
  founder2: "Gründer 2",
  founder3: "Gründer 3",
  founder4: "Gründer 4",
  title: "Titel",
  titleDescription: "Beruflicher Titel (z.B. Dr., Prof.)",
  position: "Position",
  positionDescription: "Rolle im Unternehmen (z.B. CEO, CTO)",
  firstName: "Vorname",
  firstNameDescription: "Vorname des Gründers",
  lastName: "Nachname",
  lastNameDescription: "Nachname des Gründers",
  image: "Profilbild",
  imageDescription: "Professionelles Foto des Gründers (empfohlene Größe: 400x400px)",
  gender: "Geschlecht",
  genderDescription: "Geschlecht des Gründers für die richtige Kommunikation",
  mobile: "Mobilnummer",
  mobileDescription: "Mobiltelefonnummer des Gründers",
  landline: "Festnetznummer",
  landlineDescription: "Büro- oder Festnetznummer",
  email: "Email",
  emailDescription: "Geschäftliche E-Mail-Adresse des Gründers",
  calendar: "Kalender-Link",
  calendarDescription: "Link zum Buchungs-/Kalendersystem des Gründers (z.B. Calendly).",
  calendarHelp:
    'Tipp: Nutzt ein kostenloses Tool wie <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:underline">Calendly</a>, um einfach einen professionellen Buchungslink zu erstellen. Fügt den fertigen Buchungslink hier ein.',

  // Website Setup
  websiteSetup: "Aufbau der Website",
  currentWebsite: "Falls ihr bereits eine Webseite habt, gebt hier gerne den Link ein",
  currentWebsiteDescription: "URL eurer bestehenden Website, falls vorhanden",
  domainRegistrant: "Domain-Registrar",
  domainRegistrantDescription: "z.B. All-Inkl, United Domains, Wix, Strato, etc.",
  adminRightsHolder: "Admin-Rechte-Inhaber",
  adminRightsHolderDescription: "Wer hat administrativen Zugriff auf die Domain/Webseite?",
  technicalContact: "Technischer Ansprechpartner",
  technicalContactDescription: "Eine Person, die wir für technische Klärungen kontaktieren können.",
  addressForm: "Wollt ihr eure Kunden duzen oder siezen?",
  addressFormDescription: "Wie ihr Besucher auf eurer Website ansprechen möchtet",
  perspective: "Willst du/wollt ihr auf der Website von euch selbst im \"ich\" oder im \"wir\" sprechen?",
  perspectiveDescription: "Bspw. \"Unsere Mission ist es ...\" oder \"Meine Mission ist es ...\"?",
  calendarLink: "Welcher Kalender-Link soll auf der Webseite verwendet werden?",
  calendarLinkDescription: "URL zu eurem Buchungssystem oder Kalender für Termine",
  partners: "Falls du bereits Partner hast, die auf der Webseite genannt werden sollen, gib sie hier ein",
  partnersDescription: "Liste der Geschäftspartner oder Verbindungen, die auf eurer Website angezeigt werden sollen",
  hasTestimonials: "Hast du bereits Testimonials?",
  hasTestimonialsDescription: "Aktiviere diese Option, wenn du Kundenbewertungen anzeigen möchtest",
  newsletterPopupTimer: "Soll eure Webseite nach einer fixen Anzahl von Sekunden einen Newsletter-Popup einblenden?",
  newsletterPopupTimerDescription: "Falls ja, gib die Anzahl an Sekunden an",

  // Testimonials
  testimonials: "Testimonials",
  testimonialName: "Name",
  testimonialNameDescription: "Vollständiger Name",
  testimonialPosition: "Position/Titel",
  testimonialPositionDescription: "Berufsbezeichnung",
  company: "Unternehmen / Institution",
  companyDescription: "Firmenname",
  text: "Text",
  textDescription: "Der Inhalt des Testimonials",

  // FAQs
  faqs: "FAQs",
  hasFAQs: "Falls du schon FAQs weißt, welche die Webseite beantworten sollte, trage sie hier ein",
  hasFAQsDescription: "Aktiviere diese Option, wenn du einen FAQ-Bereich auf deiner Website einbinden möchtest",
  question1: "Frage 1",
  question1Description: "Erste häufig gestellte Frage",
  answer1: "Antwort 1",
  answer1Description: "Antwort auf die erste Frage",
  question2: "Frage 2",
  question2Description: "Zweite häufig gestellte Frage",
  answer2: "Antwort 2",
  answer2Description: "Antwort auf die zweite Frage",
  question3: "Frage 3",
  question3Description: "Dritte häufig gestellte Frage",
  answer3: "Antwort 3",
  answer3Description: "Antwort auf die dritte Frage",

  // Visibility Bundle
  visibilityBundle: "Prioritäten",
  visibilityBundleDescription: "Ordnet die Elemente des Visibility Bundles nach der Relevanz, die sie für euer Unternehmen haben (wichtigstes Element oben).",
  logoRank: "Logo",
  logoRankDescription: "Der primäre visuelle Identifikator eures Unternehmens.",
  websiteRank: "Webseite",
  websiteRankDescription: "Eure Online-Präsenz und digitales Schaufenster.",
  callBackgroundRank: "Videokonferenz-Hintergrund",
  callBackgroundRankDescription: "Professioneller Hintergrund für Videoanrufe.",
  qrCodeRank: "QR-Code zur Webseite",
  qrCodeRankDescription: "Scanbarer Code, der zu eurer Website oder bestimmten Inhalten führt.",
  socialMediaBannerRank: "Social Media Banner",
  socialMediaBannerRankDescription: "Header-Bilder für eure Social-Media-Profile.",
  newsletterTemplateRank: "Newsletter-Vorlage",
  newsletterTemplateRankDescription: "Design-Vorlage für E-Mail-Newsletter.",
  emailSignaturesRank: "E-Mail-Signaturen",
  emailSignaturesRankDescription: "Professionelle E-Mail-Fußzeile mit eurem Branding.",
  letterTemplateRank: "Briefvorlage",
  letterTemplateRankDescription: "Gebrandete Vorlage für Geschäftsbriefe.",
  smartphoneScreenBackgroundRank: "Smartphone-Hintergrundbild",
  smartphoneScreenBackgroundRankDescription: "Gebrandeter Hintergrund für mobile Geräte.",
  desktopScreenBackgroundRank: "Desktop-Hintergrundbild",
  desktopScreenBackgroundRankDescription: "Gebrandeter Hintergrund für Computer.",
  rollUpRank: "Roll-Up",
  rollUpRankDescription: "Tragbares Banner-Display für Veranstaltungen.",
  flyerRank: "Flyer",
  flyerRankDescription: "Gedrucktes Marketingmaterial zur Verteilung.",
  businessCardsRank: "Visitenkarten",
  businessCardsRankDescription: "Physische Karten mit euren Kontaktinformationen.",
  shirtsHoodiesRank: "Shirts & Hoodies",
  shirtsHoodiesRankDescription: "Gebrandete Kleidung für Teammitglieder.",
  pitchDeckRank: "Pitch-Deck",
  pitchDeckRankDescription: "Präsentationsvorlage für Investorenpräsentationen.",
  bookingToolIntegrationRank: "Buchungstool-Einbindung",
  bookingToolIntegrationRankDescription: "Online-Terminplanungssystem für Termine.",
  visibilityBundleAdditionalInfoLabel: "Möchtet ihr uns noch etwas zu den benötigten Elementen mitteilen?", // New key for label
  visibilityBundleAdditionalInfoDescription: "Bitte teilt uns mit, falls ihr nur bestimmte Elemente benötigt oder spezielle Anforderungen für bevorstehende Veranstaltungen habt.", // New key for description

  // Additional Info
  additionalInfo: "Ausblick",
  companyStage: "In welchem Stadium befindet sich euer Unternehmen?",
  companyStageDescription: "Aktuelle Entwicklungsphase eures Unternehmens",
  knowsGoToMarketVoucher: "Kennt ihr bereits den GoToMarket Gutschein?",
  knowsGoToMarketVoucherDescription:
    "Aktiviere diese Option, wenn ihr mit dem GoToMarket-Gutscheinprogramm vertraut seid",
  appliedForGoToMarketVoucher: "Habt ihr den GoToMarket Gutschein bereits beantragt?",
  appliedForGoToMarketVoucherDescription:
    "Aktiviere diese Option, wenn ihr bereits den GoToMarket-Gutschein beantragt habt",
  additionalDocuments: "Ladet uns gerne beliebige Dokumente hoch, an denen wir uns orientieren können",
  additionalDocumentsDescription: "Andere relevante Dateien oder Dokumente zur Unterstützung eurer Einreichung",
  addInfo: "Schreibt uns hier gerne noch zusätzliche relevante Infos auf",
  addInfoDescription: "Weitere Informationen, die für euer Projekt relevant sein könnten",

  // Metadata
  metadata: "Metadaten",
  submissionID: "Einreichungs-ID",
  submissionDate: "Einreichungsdatum",
  language: "Sprache",
  formVersion: "Formularversion",

  // Form actions
  submit: "Formular absenden",
  submitting: "Wird gesendet...",
  success: "Formular erfolgreich übermittelt!",
  next: "Weiter",
  previous: "Zurück",

  // Dropdown options
  selectOption: "Option auswählen",
  businessCustomers: "Unternehmenskunden",
  privateCustomers: "Privatkunden",
  governmentalOrders: "Staatliche Aufträge",
  further: "Weitere",
  searchEngineSearch: "Sie suchen in Suchmaschinen nach mir. (Über Google, Bing etc.)",
  adClicks: "Sie klicken auf Werbeanzeigen von mir. (bspw. Auf Social Media Plattformen)",
  linkQrCode: "Sie erhalten den Link/QR-Code von mir. (Über Visitenkarte, Flyer, Direktnachricht etc.)",
  friendReferral: "Sie erhalten den Link von einem Freund.",
  other: "Andere",
  searchEngines: "Per Search Engines",
  link: "Per Link",
  male: "Männlich",
  female: "Weiblich",
  diverse: "Divers",
  du: "Du",
  sie: "Sie",
  ich: "Ich",
  wir: "Wir",
  idea: "Idee",
  founded: "Gegründet",
  hasCustomers: "Haben Kunden", // Updated translation
  german: "Deutsch",
  english: "Englisch",

  // Language toggle
  switchLanguage: "Switch language to English",

  // New translations
  selectedFile: "Ausgewählte Datei",
  chooseFile: "Datei auswählen...",
  uploadingFiles: "Dateien werden hochgeladen...",
  fileUploadError: "Fehler beim Hochladen der Datei",
  uploadComplete: "Upload abgeschlossen",

  // Progress
  progressOf: "von",
  completeYourProfile: "Vervollständigen Sie Ihr Profil",
  step: "Schritt",

  // New
  founders: "Gründer",
  founder: "Gründer",
  review: "Überprüfen & Absenden",

  // Drag and drop
  dragToReorder: "Zum Neuordnen ziehen",

  // Thank you page
  thankYou: "Vielen Dank!",
  formSubmitted: "Dein Formular wurde erfolgreich übermittelt.",
  whatHappensNext: "Was passiert als Nächstes?",
  teamWillReview: "Unser Team wird deine Informationen prüfen. Innerhalb der nächsten 2 Werktage wirst du eine Email von uns erhalten.",
  downloadPdf: "PDF herunterladen",
  backToHome: "Zurück zur Startseite",
  reviewSubmit: "Eingaben prüfen",
  reviewMessage: "Bitte überprüfe deine Informationen vor dem Absenden.",

  // New fields
  smartphones: "Welche Smartphones habt ihr Gründer?",
  smartphonesDescription: "Bitte gebt die Modelle eurer Smartphones an",
  communicationEmail: "Über welche Email-Adresse sollen wir euch kontaktieren?",
  communicationEmailDescription: "Die E-Mail-Adresse, über die wir euch am besten erreichen können",
  designPreferences: "Design",
  colorPreferences: "Hast du spezifische Farbwünsche für deine Website?",
  colorPreferencesDescription:
    "Um uns eure Farbwünsche mitzuteilen, klickt auf den 'Farben wählen' Button, um <a href='https://www.realtimecolors.com' target='_blank' rel='noopener noreferrer' class='text-purple-600 hover:underline'>realtimecolors.com</a> zu öffnen. Dort könnt ihr verschiedene Farbschemata ausprobieren. Wenn ihr mit euren Farben zufrieden seid, kopiert die URL von dieser Website und fügt sie hier ein. So können wir eure genauen Farbwünsche verstehen.",
  pickColorsButton: "Farben wählen", // New key for button text
  colorPreferencesPlaceholder: "Hier die realtimecolors.com URL einfügen", // New key for placeholder
  fontPreferences: "Falls ihr euch bereits auf eine Schriftart festgelegt habt, gebt sie hier an",
  fontPreferencesDescription: "Eure bevorzugte Schriftart für die Website",
  stylePreferences: "Falls ihr eine Stil-Präferenz habt, gebt sie hier gerne an",
  stylePreferencesDescription: "Euer bevorzugter Designstil für das Branding",
  brandingEmotions: "Welche Emotionen soll das Branding vermitteln?",
  brandingEmotionsDescription: "Die Gefühle und Assoziationen, die euer Branding hervorrufen soll",

  // Style preferences options
  minimalistisch: "Minimalistisch",
  verspielt: "Verspielt",
  elegant: "Elegant",
  tech: "Tech",
  luxuriös: "Luxuriös",
  clean: "Clean",
  kreativ: "Kreativ",

  // Branding emotions options
  vertrauen: "Vertrauen",
  innovation: "Innovation",
  nachhaltigkeit: "Nachhaltigkeit",

  // Boolean translations for review
  yes: "Ja",
  no: "Nein",
  addFounder: "Gründer hinzufügen",
  openGraphImage: "Open Graph Bild (für Link-Vorschau)",
  openGraphImageDescription: "Dieses Bild wird als Vorschau angezeigt, wenn der Link zu eurer Website auf Drittplattformen (z.B. WhatsApp, LinkedIn, iMessage, etc.) geteilt wird, wie im Beispiel unten. Es wird NICHT auf eurer Website angezeigt.",
  favicon: "Favicon (Browser-Tab-Icon)",
  faviconDescription: "Dieses kleine Icon erscheint in der Tab-Leiste des Browsers, wie im Beispiel unten. Es wird NICHT auf eurer Website angezeigt.",
}

// Sortable item component for the visibility bundle ranking
function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center p-3 mb-2 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab"
    >
      <div className="mr-2">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      {children}
    </div>
  )
}

// Thank You Page Component
const ThankYouPage = ({ language, companyName }) => {
  const t = language === "en" ? en : de

  return (
    <div className="bg-white rounded-xl shadow-xl p-8 text-center">
      <div className="animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-4 text-gray-900">{t.thankYou}</h2>
        <p className="text-xl mb-8 text-gray-700">
          {companyName ? `${companyName}, ${t.formSubmitted.toLowerCase()}` : t.formSubmitted}
        </p>

        <div className="mb-8 p-6 bg-gray-50 rounded-lg text-left">
          <h3 className="text-xl font-medium mb-4 text-gray-900">{t.whatHappensNext}</h3>
          <p className="text-gray-700 mb-4">{t.teamWillReview}</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center mt-6">
            <a
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
            >
              {t.backToHome}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

const VisibilityFormulaForm = () => {
  // Get the language from URL parameter if available
  const getInitialLanguage = () => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const langParam = urlParams.get("lang")
      if (langParam === "de" || langParam === "en") {
        return langParam
      }
    }
    return "en" // Default language
  }

  // Add language state with the initial value from URL
  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage())
  const t = currentLanguage === "en" ? en : de

  // Listen for URL changes (for SPA navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const langParam = urlParams.get("lang")
      if (langParam === "de" || langParam === "en") {
        setCurrentLanguage(langParam)
      }
    }

    // Listen for popstate events (browser navigation)
    window.addEventListener("popstate", handleUrlChange)

    // Clean up the event listener
    return () => {
      window.removeEventListener("popstate", handleUrlChange)
    }
  }, [])

  // Update the toggleLanguage function to also update the URL
  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "de" : "en"
    setCurrentLanguage(newLang)

    // Update URL without refreshing the page
    if (typeof window !== "undefined") {
      const url = new URL(window.location)
      url.searchParams.set("lang", newLang)
      window.history.pushState({}, "", url)
    }

    // Update the language field in the form
    setFormData((prevData) => ({
      ...prevData,
      language: newLang === "en" ? "English" : "German",
    }))
  }

  // Form sections
  const sections = [
    { id: "companyInfo", title: t.companyInfo },
    { id: "founders", title: t.founders },
    { id: "websiteSetup", title: t.websiteSetup },
    { id: "designPreferences", title: t.designPreferences },
    { id: "testimonials", title: t.testimonials },
    { id: "faqs", title: t.faqs },
    { id: "visibilityBundle", title: t.visibilityBundle },
    { id: "additionalInfo", title: t.additionalInfo },
    { id: "review", title: t.reviewSubmit }, // Use the updated key here
  ]

  const [currentSection, setCurrentSection] = useState(0)

  // Initialize visibility bundle items for drag and drop
  const visibilityItems = [
    { id: "logo", name: "logoRank", label: t.logoRank, description: t.logoRankDescription },
    { id: "website", name: "websiteRank", label: t.websiteRank, description: t.websiteRankDescription },
    {
      id: "callBackground",
      name: "callBackgroundRank",
      label: t.callBackgroundRank,
      description: t.callBackgroundRankDescription,
    },
    { id: "qrCode", name: "qrCodeRank", label: t.qrCodeRank, description: t.qrCodeRankDescription },
    {
      id: "socialMediaBanner",
      name: "socialMediaBannerRank",
      label: t.socialMediaBannerRank,
      description: t.socialMediaBannerRankDescription,
    },
    {
      id: "newsletterTemplate",
      name: "newsletterTemplateRank",
      label: t.newsletterTemplateRank,
      description: t.newsletterTemplateRankDescription,
    },
    {
      id: "emailSignatures",
      name: "emailSignaturesRank",
      label: t.emailSignaturesRank,
      description: t.emailSignaturesRankDescription,
    },
    {
      id: "letterTemplate",
      name: "letterTemplateRank",
      label: t.letterTemplateRank,
      description: t.letterTemplateDescription, // Note: Key mismatch, should be t.letterTemplateRankDescription
    },
    {
      id: "smartphoneScreenBackground",
      name: "smartphoneScreenBackgroundRank",
      label: t.smartphoneScreenBackgroundRank,
      description: t.smartphoneScreenBackgroundRankDescription,
    },
    {
      id: "desktopScreenBackground",
      name: "desktopScreenBackgroundRank",
      label: t.desktopScreenBackgroundRank,
      description: t.desktopScreenBackgroundRankDescription,
    },
    { id: "rollUp", name: "rollUpRank", label: t.rollUpRank, description: t.rollUpRankDescription },
    { id: "flyer", name: "flyerRank", label: t.flyerRank, description: t.flyerRankDescription },
    {
      id: "businessCards",
      name: "businessCardsRank",
      label: t.businessCardsRank,
      description: t.businessCardsRankDescription,
    },
    {
      id: "shirtsHoodies",
      name: "shirtsHoodiesRank",
      label: t.shirtsHoodiesRank,
      description: t.shirtsHoodiesRankDescription,
    },
    { id: "pitchDeck", name: "pitchDeckRank", label: t.pitchDeckRank, description: t.pitchDeckRankDescription },
    {
      id: "bookingToolIntegration",
      name: "bookingToolIntegrationRank",
      label: t.bookingToolIntegrationRank,
      description: t.bookingToolIntegrationRankDescription,
    },
  ]

  // State for the sorted visibility items
  const [sortedVisibilityItems, setSortedVisibilityItems] = useState(visibilityItems)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle DnD end
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSortedVisibilityItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update form data with new rankings
        const updatedFormData = { ...formData }

        // Assign ranks based on new order (1 is highest priority)
        newItems.forEach((item, index) => {
          updatedFormData[item.name] = index + 1
        })

        setFormData(updatedFormData)
        return newItems
      })
    }
  }

  const [formData, setFormData] = useState({
    // Company Information
    name: "",
    industry: "",
    businessType: {
      businessCustomers: false,
      privateCustomers: false,
      governmentalOrders: false,
      further: false,
    },
    businessTypeOther: "",
    slogan: "",
    customerGroups: "",
    customerDescription: "",
    customerAcquisition: {
      searchEngineSearch: false,
      adClicks: false,
      linkQrCode: false,
      friendReferral: false,
      other: false,
    },
    productCount: "",
    websiteProductCount: "",
    customerProblem: "",
    solution: "",
    competitors: "",
    address: "",

    // Add to company information section
    smartphones: "",
    communicationEmail: "",

    // Founders (as an array for dynamic addition)
    founders: [
      {
        title: "",
        position: "",
        firstName: "",
        lastName: "",
        image: null,
        gender: "",
        mobile: "",
        landline: "",
        email: "",
        calendar: "",
      },
    ],

    // Website Setup
    currentWebsite: "",
    domainRegistrant: "", // New field
    adminRightsHolder: "", // New field
    technicalContact: "", // New field
    addressForm: "",
    perspective: "",
    calendarLink: "",
    partners: "",
    hasTestimonials: false,
    newsletterPopupTimer: "",

    // Add to design preferences section
    colorPreferences: "",
    fontPreferences: "",
    stylePreferences: "",
    brandingEmotions: "",

    // Testimonials
    testimonial1Name: "",
    testimonial1Position: "",
    testimonial1Company: "",
    testimonial1Text: "",
    testimonial1Image: null,
    testimonial2Name: "",
    testimonial2Position: "",
    testimonial2Company: "",
    testimonial2Text: "",
    testimonial2Image: null,
    testimonial3Name: "",
    testimonial3Position: "",
    testimonial3Company: "",
    testimonial3Text: "",
    testimonial3Image: null,

    // FAQs
    hasFAQs: false,
    faq1Question: "",
    faq1Answer: "",
    faq2Question: "",
    faq2Answer: "",
    faq3Question: "",
    faq3Answer: "",

    // Visibility Bundle Elements Ranking
    logoRank: 1,
    websiteRank: 2,
    callBackgroundRank: 3,
    qrCodeRank: 4,
    socialMediaBannerRank: 5,
    newsletterTemplateRank: 6,
    emailSignaturesRank: 7,
    letterTemplateRank: 8,
    smartphoneScreenBackgroundRank: 9,
    desktopScreenBackgroundRank: 10,
    rollUpRank: 11,
    flyerRank: 12,
    businessCardsRank: 13,
    shirtsHoodiesRank: 14,
    pitchDeckRank: 15,
    bookingToolIntegrationRank: 16,

    // Additional Info
    companyStage: "",
    knowsGoToMarketVoucher: false,
    appliedForGoToMarketVoucher: false,
    additionalDocuments: null,
    additionalInfo: "",

    // Metadata
    submissionID: "",
    submissionDate: "",
    language: currentLanguage === "en" ? "English" : "German",
    formVersion: "2.2",

    visibilityBundleAdditionalInfo: "",
    openGraphImage: null,
    favicon: null,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [isPopup, setIsPopup] = useState(false)
  const [showThankYouPage, setShowThankYouPage] = useState(false)

  // We're using direct link to realtimecolors.com instead of a modal

  // Detect if form is in a popup
  useEffect(() => {
    // Check if the form is embedded in an iframe
    const isInIframe = window !== window.parent
    // Or check for a URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const popupParam = urlParams.get("popup")

    setIsPopup(isInIframe || popupParam === "true")
  }, [])

  // Refs for animation
  const formRef = useRef(null)
  const sectionRefs = useRef([])
  const errorRef = useRef(null)

  // Form configuration - now using Firebase Functions

  // Cloudinary configuration
  const cloudinaryConfig = {
    cloudName: "disaly54t",
    uploadPreset: "unsigned_uploads",
  }

  // Field name mapping (JavaScript variable name to Airtable field name)
  const fieldMapping = {
    // Company Information
    name: "Name",
    industry: "Industry",
    businessType: "Business Type",
    businessTypeOther: "businessTypeOther",
    slogan: "Slogan",
    customerGroups: "Customer Groups",
    customerDescription: "Customer Description",
    customerAcquisition: "Customer Acquisition",
    productCount: "Product Count",
    websiteProductCount: "Website Product",
    customerProblem: "Customer Problem",
    solution: "Solution",
    competitors: "Competitors",
    address: "Address",
    smartphones: "Smartphones",
    communicationEmail: "Communication Email",

    // Website Setup
    currentWebsite: "Current Website",
    domainRegistrant: "Domain Registrant", // New mapping
    adminRightsHolder: "Admin Rights Holder", // New mapping
    technicalContact: "Technical Contact", // New mapping
    addressForm: "Address Form",
    perspective: "Perspective",
    calendarLink: "Calendar Link",
    partners: "Partners",
    hasTestimonials: "Has Testimonials",
    newsletterPopupTimer: "Newsletter Popup Timer",

    // Design Preferences
    colorPreferences: "Color Preferences",
    fontPreferences: "Font Preferences",
    stylePreferences: "Style Preferences",
    brandingEmotions: "Branding Emotions",

    // Testimonials
    testimonial1Name: "Testimonial 1 Name",
    testimonial1Position: "Testimonial 1 Position",
    testimonial1Company: "Testimonial 1 Company",
    testimonial1Text: "Testimonial 1 Text",
    testimonial1Image: "Testimonial 1 Image",
    testimonial2Name: "Testimonial 2 Name",
    testimonial2Position: "Testimonial 2 Position",
    testimonial2Company: "Testimonial 2 Company",
    testimonial2Text: "Testimonial 2 Text",
    testimonial2Image: "Testimonial 2 Image",
    testimonial3Name: "Testimonial 3 Name",
    testimonial3Position: "Testimonial 3 Position",
    testimonial3Company: "Testimonial 3 Company",
    testimonial3Text: "Testimonial 3 Text",
    testimonial3Image: "Testimonial 3 Image",

    // FAQs
    hasFAQs: "Has FAQs",
    faq1Question: "FAQ 1 Question",
    faq1Answer: "FAQ 1 Answer",
    faq2Question: "FAQ 2 Question",
    faq2Answer: "FAQ 2 Answer",
    faq3Question: "FAQ 3 Question",
    faq3Answer: "FAQ 3 Answer",

    // Visibility Bundle Elements Ranking
    logoRank: "Logo Rank",
    websiteRank: "Website Rank",
    callBackgroundRank: "Call Background Rank",
    qrCodeRank: "QR Code Rank",
    socialMediaBannerRank: "Social Media Banner Rank",
    newsletterTemplateRank: "Newsletter Template Rank",
    emailSignaturesRank: "Email Signatures Rank",
    letterTemplateRank: "Letter Template Rank",
    smartphoneScreenBackgroundRank: "Smartphone Screen Background Rank",
    desktopScreenBackgroundRank: "Desktop Screen Background Rank",
    rollUpRank: "Roll-Up Rank",
    flyerRank: "Flyer Rank",
    businessCardsRank: "Business Cards Rank",
    shirtsHoodiesRank: "Shirts & Hoodies Rank",
    pitchDeckRank: "Pitch Deck Rank",
    bookingToolIntegrationRank: "Booking Tool Integration Rank",

    // Additional Info
    companyStage: "Company Stage",
    knowsGoToMarketVoucher: "Knows GoToMarket Voucher",
    appliedForGoToMarketVoucher: "Applied for GoToMarket Voucher",
    additionalDocuments: "Additional Documents",
    additionalInfo: "Additional Info",

    // Metadata
    submissionID: "Submission ID",
    submissionDate: "Submission Date",
    language: "Language",
    formVersion: "Form Version",

    // Fix for the field name error
    visibilityBundleAdditionalInfo: "Visibility Bundle Info",
    openGraphImage: "Open Graph Image",
    favicon: "Favicon",
  }

  // Improved Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    if (!file) return null

    console.log(`Starting upload for file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", cloudinaryConfig.uploadPreset)

    try {
      const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`
      console.log(`Uploading to: ${url}`)

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      })

      const responseText = await response.text()
      console.log("Raw response:", responseText)

      if (!response.ok) {
        throw new Error(`Upload failed: ${responseText}`)
      }

      const data = JSON.parse(responseText)
      console.log("Upload successful, received URL:", data.secure_url)

      return {
        url: data.secure_url,
        filename: file.name,
      }
    } catch (error) {
      console.error("Error during upload:", error)
      throw error
    }
  }

  // Modified handle change for file inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // Add debugging to see what's happening
    console.log(`Changing ${name} with type ${type} to value: ${type === "checkbox" ? checked : value}`)

    if (type === "checkbox") {
      // Handle general checkboxes (excluding the new groups)
      if (!name.startsWith("businessType_") && !name.startsWith("customerAcquisition_")) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: checked,
        }))
      }
      // Specific handlers will manage the new checkbox groups
    } else if (name === "customerGroups" && value === "more") {
      // Special handling for "more" option in customer groups
      setFormData((prevData) => ({
        ...prevData,
        [name]: "4",
      }))
    } else if (name === "productCount" && value === "4+") {
      // Fix for the 4+ value in product count
      setFormData((prevData) => ({
        ...prevData,
        [name]: "4",
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  // Specific handler for Business Type checkboxes
  const handleBusinessTypeChange = (e) => {
    const { name, checked } = e.target
    const key = name.replace("businessType_", "") // Extract key (e.g., 'businessCustomers')

    setFormData((prevData) => ({
      ...prevData,
      businessType: {
        ...prevData.businessType,
        [key]: checked,
      },
    }))
  }

  // Specific handler for Customer Acquisition checkboxes
  const handleCustomerAcquisitionChange = (e) => {
    const { name, checked } = e.target
    const key = name.replace("customerAcquisition_", "") // Extract key (e.g., 'searchEngineSearch')

    setFormData((prevData) => ({
      ...prevData,
      customerAcquisition: {
        ...prevData.customerAcquisition,
        [key]: checked,
      },
    }))
  }

  // Function to add a new founder
  const addFounder = () => {
    if (formData.founders.length >= 4) return // Limit to 4 founders

    setFormData((prevState) => ({
      ...prevState,
      founders: [
        ...prevState.founders,
        {
          title: "",
          position: "",
          firstName: "",
          lastName: "",
          image: null,
          gender: "",
          mobile: "",
          landline: "",
          email: "",
          calendar: "",
        },
      ],
    }))
  }

  // Function to remove a founder
  const removeFounder = (index) => {
    if (formData.founders.length <= 1) return // Keep at least one founder

    setFormData((prevState) => ({
      ...prevState,
      founders: prevState.founders.filter((_, i) => i !== index),
    }))
  }

  // Modified handleChange for array fields
  const handleFounderChange = (index, field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      founders: prevState.founders.map((founder, i) => (i === index ? { ...founder, [field]: value } : founder)),
    }))
  }

  // Navigation functions
  const goToNextSection = () => {
    if (currentSection < sections.length - 1) {
      track("section_navigation", {
        direction: "next",
        fromSection: sections[currentSection].id,
        toSection: sections[currentSection + 1].id,
      })
      setCurrentSection(currentSection + 1)
    }
  }

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentSection])

  // Add this near the other useEffect hooks
  useEffect(() => {
    // This effect is intentionally empty to memoize the sections
    // and prevent unnecessary re-renders
  }, [formData, currentLanguage])

  // Add state for dynamic customer descriptions
  const [customerDescriptions, setCustomerDescriptions] = useState([""])

  // Add state for dynamic product descriptions
  const [productDescriptions, setProductDescriptions] = useState([""])

  // Add state for dynamic FAQs
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }])

  // Function to add a new customer description
  const addCustomerDescription = () => {
    setCustomerDescriptions([...customerDescriptions, ""])
  }

  // Function to add a new product description
  const addProductDescription = () => {
    setProductDescriptions([...productDescriptions, ""])
  }

  // Function to add a new FAQ
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }])
  }

  // Add this near the other state declarations at the top of the component
  const [testimonials, setTestimonials] = useState([{ name: "", position: "", company: "", text: "", image: null }])

  // Add this function near the other add/remove functions
  const addTestimonial = () => {
    if (testimonials.length >= 3) return // Limit to 3 testimonials
    setTestimonials([...testimonials, { name: "", position: "", company: "", text: "", image: null }])
  }

  // Add this function to handle testimonial changes
  const handleTestimonialChange = (index, field, value) => {
    const newTestimonials = [...testimonials]
    newTestimonials[index][field] = value
    setTestimonials(newTestimonials)
  }

  // Scroll to error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [error])

  // Modified submit function to handle file uploads
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Track form submission attempt
    track("form_submission_attempt")

    setLoading(true)
    setError(null)
    setSuccess(false)
    setUploadingFiles(true)

    try {
      // Inside the handleSubmit function, find the fileFields array and modify it to include testimonial images directly:

      // Inside the handleSubmit function, right after the fileFields array is defined:

      // First upload all files to Cloudinary
      const fileFields = ["additionalDocuments"]

      // Add founder images to fileFields
      formData.founders.forEach((founder, index) => {
        if (founder.image instanceof File) {
          fileFields.push(`founder${index + 1}Image`)
          // Store the file in a format the upload function expects
          formData[`founder${index + 1}Image`] = founder.image
        }
      })

      // Add testimonial images to fileFields and update formData
      testimonials.forEach((testimonial, index) => {
        if (testimonial.image instanceof File) {
          const fieldName = `testimonial${index + 1}Image`
          fileFields.push(fieldName)

          // Update formData with testimonial data
          formData[`testimonial${index + 1}Name`] = testimonial.name
          formData[`testimonial${index + 1}Position`] = testimonial.position
          formData[`testimonial${index + 1}Company`] = testimonial.company
          formData[`testimonial${index + 1}Text`] = testimonial.text
          formData[fieldName] = testimonial.image

          console.log(`Added testimonial ${index + 1} image to fileFields:`, testimonial.image.name)
        }
      })

      // Add Open Graph Image and Favicon to fileFields if present
      if (formData.openGraphImage instanceof File) {
        fileFields.push("openGraphImage")
        // Ensure the file is present in formData for upload
        formData["openGraphImage"] = formData.openGraphImage
      }
      if (formData.favicon instanceof File) {
        fileFields.push("favicon")
        // Ensure the file is present in formData for upload
        formData["favicon"] = formData.favicon
      }

      const fileUploads = {}

      // Track upload progress
      let filesUploaded = 0
      const totalFiles = fileFields.filter((field) => formData[field]).length

      // Upload each file
      for (const field of fileFields) {
        if (formData[field]) {
          try {
            const fileData = await uploadToCloudinary(formData[field])
            fileUploads[field] = fileData
            filesUploaded++
          } catch (error) {
            console.error(`Error uploading ${field}:`, error)
            setError(`Failed to upload ${field}. Please try again.`)
            setLoading(false)
            setUploadingFiles(false)
            return
          }
        }
      }

      setUploadingFiles(false)

      // Concatenate customer descriptions
      const concatenatedCustomerDescriptions = customerDescriptions.join(" ")

      // Concatenate product descriptions
      const concatenatedProductDescriptions = productDescriptions.join(" ")

      // Concatenate FAQs
      const concatenatedFaqs = faqs.map((faq) => `${faq.question}: ${faq.answer}`).join(" ")

      // Prepare data for Airtable, including the concatenated strings
      const dataWithFileUrls = {
        ...formData,
        customerDescription: concatenatedCustomerDescriptions,
        productDescription: concatenatedProductDescriptions,
        faqs: concatenatedFaqs,
        ...fileUploads,
      }

      // Inside the handleSubmit function, right before the line that says "const fieldsToSubmit = prepareDataForAirtable(dataWithFileUrls);"
      // add this code:

      // Make sure testimonials are properly included in the data
      for (let i = 0; i < testimonials.length; i++) {
        const index = i + 1
        // Transfer testimonial text data
        dataWithFileUrls[`testimonial${index}Name`] = testimonials[i].name
        dataWithFileUrls[`testimonial${index}Position`] = testimonials[i].position
        dataWithFileUrls[`testimonial${index}Company`] = testimonials[i].company
        dataWithFileUrls[`testimonial${index}Text`] = testimonials[i].text

        // Handle image data
        if (testimonials[i].image instanceof File) {
          // If the image was uploaded to Cloudinary, it should be in fileUploads
          if (fileUploads[`testimonial${index}Image`]) {
            dataWithFileUrls[`testimonial${index}Image`] = fileUploads[`testimonial${index}Image`]
            console.log(`Testimonial ${index} image URL:`, fileUploads[`testimonial${index}Image`].url)
          }
        }
      }

      // Now prepare the data for Airtable submission
      const fieldsToSubmit = prepareDataForAirtable(dataWithFileUrls)

      console.log("fieldsToSubmit", fieldsToSubmit)

      // Submit to Airtable via Firebase Function
      const response = await submitVBFormToAirtable(fieldsToSubmit)

      console.log("Airtable response:", response)
      // Track successful submission
      track("form_submission_success")
      setSuccess(true)

      // Handle different behaviors based on whether it's in a popup or not
      if (isPopup) {
        // If in a popup, send a message to the parent window
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "formSubmitted", success: true }, "*")
        }
        // Show thank you page
        setShowThankYouPage(true)
      } else {
        // If not in a popup, show thank you page
        setShowThankYouPage(true)
      }
    } catch (err) {
      // Track submission error
      track("form_submission_error", { errorMessage: err.message })
      console.error("Error submitting to Airtable:", err)
      setError(err.message || "Failed to submit form. Please try again.")

      // Scroll to the error message
      window.scrollTo(0, 0)
    } finally {
      setLoading(false)
    }
  }

  // Find the prepareDataForAirtable function (around line 1800) and replace it with this implementation:
  const prepareDataForAirtable = (dataWithFileUrls) => {
    const formattedData = {}

    Object.entries(dataWithFileUrls).forEach(([key, value]) => {
      // Skip processing complex objects here, handle them separately below
      if (key === "businessType" || key === "customerAcquisition" || key === "founders" || key === "testimonials") {
        return
      }

      if (value !== null && value !== "" && fieldMapping[key]) {
        // For image uploads with URL (either as string or as object with url property)
        if (
          (typeof value === "string" || (typeof value === "object" && value && value.url)) &&
          (key.toLowerCase().includes("image") || key.toLowerCase().includes("graphic") || key.toLowerCase().includes("documents") || key.toLowerCase().includes("favicon"))
        ) {
          // Get the URL whether it's a string or an object with url property
          const url = typeof value === "string" ? value : value.url

          // Format as array with object containing url
          formattedData[fieldMapping[key]] = [
            {
              url: url,
            },
          ]
        }
        // For fields that should be numbers
        else if (
          (key === "customerGroups" ||
            key === "productCount" ||
            key === "websiteProductCount" ||
            key === "newsletterPopupTimer" ||
            key.includes("Rank")) &&
          !isNaN(value) && // Ensure it's a number-like value
          value !== ""     // Ensure it's not an empty string
        ) {
          formattedData[fieldMapping[key]] = Number(value)
        }
        // For boolean values
        else if (typeof value === "boolean") {
          formattedData[fieldMapping[key]] = value
        }
        // For other normal fields
        else if (!(value instanceof File) && typeof value !== 'object') { // Exclude File objects and other objects handled elsewhere
          formattedData[fieldMapping[key]] = value
        }
      }
    })

    // --- Handle Business Type ---
    const selectedBusinessTypes = Object.entries(dataWithFileUrls.businessType || {})
      .filter(([_, isSelected]) => isSelected)
      .map(([typeKey]) => t[typeKey] || typeKey) // Use translated label

    if (selectedBusinessTypes.length > 0) {
      formattedData[fieldMapping.businessType] = selectedBusinessTypes.join(", ")
    }
    // Include the 'Other' text if 'further' is checked and text exists
    if (dataWithFileUrls.businessType?.further && dataWithFileUrls.businessTypeOther) {
      formattedData[fieldMapping.businessTypeOther] = dataWithFileUrls.businessTypeOther
    } else {
      // Ensure the 'Other' text field is cleared in Airtable if 'further' is unchecked or text is empty
      if (fieldMapping.businessTypeOther) {
        formattedData[fieldMapping.businessTypeOther] = null;
      }
    }


    // --- Handle Customer Acquisition ---
    const selectedAcquisitionMethods = Object.entries(dataWithFileUrls.customerAcquisition || {})
      .filter(([_, isSelected]) => isSelected)
      .map(([methodKey]) => t[methodKey] || methodKey) // Use translated label

    if (selectedAcquisitionMethods.length > 0) {
      formattedData[fieldMapping.customerAcquisition] = selectedAcquisitionMethods.join(", ");
    } else {
      // If no methods are selected, explicitly set to null or handle as needed
      formattedData[fieldMapping.customerAcquisition] = null;
    }

    // Handle founders array
    dataWithFileUrls.founders.forEach((founder, index) => {
      const prefix = `Founder ${index + 1}`

      if (founder.title) formattedData[`${prefix} Title`] = founder.title
      if (founder.position) formattedData[`${prefix} Position`] = founder.position
      if (founder.firstName) formattedData[`${prefix} First Name`] = founder.firstName
      if (founder.lastName) formattedData[`${prefix} Last Name`] = founder.lastName
      if (founder.gender) formattedData[`${prefix} Gender`] = founder.gender
      if (founder.mobile) formattedData[`${prefix} Mobile`] = founder.mobile
      if (founder.landline) formattedData[`${prefix} Landline`] = founder.landline
      if (founder.email) formattedData[`${prefix} Email`] = founder.email
      if (founder.calendar) formattedData[`${prefix} Calendar`] = founder.calendar

      // Handle image
      if (founder.image && typeof founder.image === "object") {
        if (founder.image.url) {
          formattedData[`${prefix} Image`] = [{ url: founder.image.url }]
        } else if (dataWithFileUrls[`founder${index + 1}Image`] && dataWithFileUrls[`founder${index + 1}Image`].url) {
          formattedData[`${prefix} Image`] = [{ url: dataWithFileUrls[`founder${index + 1}Image`].url }]
        }
      }
    })

    // Handle testimonials
    if (testimonials && testimonials.length > 0) {
      testimonials.forEach((testimonial, index) => {
        const fieldIndex = index + 1

        // Handle text fields
        if (dataWithFileUrls[`testimonial${fieldIndex}Name`]) {
          formattedData[`Testimonial ${fieldIndex} Name`] = dataWithFileUrls[`testimonial${fieldIndex}Name`]
        }
        if (dataWithFileUrls[`testimonial${fieldIndex}Position`]) {
          formattedData[`Testimonial ${fieldIndex} Position`] = dataWithFileUrls[`testimonial${fieldIndex}Position`]
        }
        if (dataWithFileUrls[`testimonial${fieldIndex}Company`]) {
          formattedData[`Testimonial ${fieldIndex} Company`] = dataWithFileUrls[`testimonial${fieldIndex}Company`]
        }
        if (dataWithFileUrls[`testimonial${fieldIndex}Text`]) {
          formattedData[`Testimonial ${fieldIndex} Text`] = dataWithFileUrls[`testimonial${fieldIndex}Text`]
        }

        // Handle image field
        const imageKey = `testimonial${fieldIndex}Image`
        if (dataWithFileUrls[imageKey] && dataWithFileUrls[imageKey].url) {
          formattedData[`Testimonial ${fieldIndex} Image`] = [{ url: dataWithFileUrls[imageKey].url }]
          console.log(`Added testimonial ${fieldIndex} image to Airtable data:`, dataWithFileUrls[imageKey].url)
        }
      })
    }

    // Debug testimonial image fields
    for (let i = 1; i <= 3; i++) {
      if (formattedData[`Testimonial ${i} Image`]) {
        console.log(`Final Airtable data for Testimonial ${i} Image:`, formattedData[`Testimonial ${i} Image`])
      }
    }

    // Handle FAQs
    if (faqs && faqs.length > 0) {
      faqs.forEach((faq, index) => {
        if (faq.question) formattedData[`FAQ ${index + 1} Question`] = faq.question
        if (faq.answer) formattedData[`FAQ ${index + 1} Answer`] = faq.answer
      })
    }

    // Make sure visibilityBundleAdditionalInfo is included
    if (dataWithFileUrls.visibilityBundleAdditionalInfo) {
      formattedData[fieldMapping.visibilityBundleAdditionalInfo] = dataWithFileUrls.visibilityBundleAdditionalInfo
    }

    console.log("Formatted data for Airtable:", JSON.stringify(formattedData, null, 2))
    return formattedData
  }

  // Direct Airtable submission removed - now using Firebase Functions

  const resetForm = () => {
    // Reset the form data to initial state
    setFormData({
      // Company Information
      name: "",
      industry: "",
      businessType: {
        businessCustomers: false,
        privateCustomers: false,
        governmentalOrders: false,
        further: false,
      },
      businessTypeOther: "",
      slogan: "",
      customerGroups: "",
      customerDescription: "",
      customerAcquisition: {
        searchEngineSearch: false,
        adClicks: false,
        linkQrCode: false,
        friendReferral: false,
        other: false,
      },
      productCount: "",
      websiteProductCount: "",
      customerProblem: "",
      solution: "",
      competitors: "",
      address: "",
      smartphones: "",
      communicationEmail: "",

      // Founders
      founders: [
        {
          title: "",
          position: "",
          firstName: "",
          lastName: "",
          image: null,
          gender: "",
          mobile: "",
          landline: "",
          email: "",
          calendar: "",
        },
      ],

      // Website Setup
      currentWebsite: "",
      domainRegistrant: "", // Reset new field
      adminRightsHolder: "", // Reset new field
      technicalContact: "", // Reset new field
      addressForm: "",
      perspective: "",
      hasTestimonials: false,
      newsletterPopupTimer: "",

      // Design Preferences
      colorPreferences: "",
      fontPreferences: "",
      stylePreferences: "",
      brandingEmotions: "",

      // Testimonials
      testimonial1Name: "",
      testimonial1Position: "",
      testimonial1Company: "",
      testimonial1Text: "",
      testimonial1Image: null,
      testimonial2Name: "",
      testimonial2Position: "",
      testimonial2Company: "",
      testimonial2Text: "",
      testimonial2Image: null,
      testimonial3Name: "",
      testimonial3Position: "",
      testimonial3Company: "",
      testimonial3Text: "",
      testimonial3Image: null,

      // FAQs
      hasFAQs: false,
      faq1Question: "",
      faq1Answer: "",
      faq2Question: "",
      faq2Answer: "",
      faq3Question: "",
      faq3Answer: "",

      // Visibility Bundle Elements Ranking
      logoRank: 1,
      websiteRank: 2,
      callBackgroundRank: 3,
      qrCodeRank: 4,
      socialMediaBannerRank: 5,
      newsletterTemplateRank: 6,
      emailSignaturesRank: 7,
      letterTemplateRank: 8,
      smartphoneScreenBackgroundRank: 9,
      desktopScreenBackgroundRank: 10,
      rollUpRank: 11,
      flyerRank: 12,
      businessCardsRank: 13,
      shirtsHoodiesRank: 14,
      pitchDeckRank: 15,
      bookingToolIntegrationRank: 16,

      // Additional Info
      companyStage: "",
      knowsGoToMarketVoucher: false,
      appliedForGoToMarketVoucher: false,
      additionalDocuments: null,
      additionalInfo: "",

      // Metadata
      submissionID: "",
      submissionDate: "",
      language: currentLanguage === "en" ? "English" : "German",
      formVersion: "2.2",
      visibilityBundleAdditionalInfo: "",
      openGraphImage: null,
      favicon: null,
    })

    // Reset the sorted visibility items
    setSortedVisibilityItems(visibilityItems)

    // Reset the thank you page
    setShowThankYouPage(false)
  }

  // Helper component for input fields
  const InputField = React.memo(
    ({ label, name, type = "text", options = [], value, onChange, formData, description }) => {
      // Create a ref for the input element
      const inputRef = useRef(null)

      // Use useEffect to maintain focus after render
      useEffect(() => {
        // If this input is focused, keep it focused after render
        if (document.activeElement && document.activeElement.id === name && inputRef.current) {
          inputRef.current.focus()

          // For text inputs, preserve cursor position
          if (inputRef.current.setSelectionRange && (type === "text" || type === "textarea")) {
            const cursorPosition = inputRef.current.selectionStart
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
          }
        }
      })

      // For file inputs, get the file data directly from formData
      const fileData = type === "file" ? formData?.[name] : null
      const filePreviewUrl =
        fileData && fileData.type && fileData.type.startsWith("image/") ? URL.createObjectURL(fileData) : null

      if (type === "select") {
        return (
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={name}>
              {label}
            </label>
            {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
            <select
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
              ref={inputRef}
            >
              <option value="">{t.selectOption}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {t[option.toLowerCase().replace(/\s+/g, "")] || option}
                </option>
              ))}
            </select>
          </div>
        )
      } else if (type === "textarea") {
        return (
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={name}>
              {label}
            </label>
            {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
            <textarea
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              rows={4}
              className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent resize-none"
              ref={inputRef}
            />
          </div>
        )
      } else if (type === "checkbox") {
        return (
          <div className="mb-6 flex items-center">
            <input
              id={name}
              name={name}
              type="checkbox"
              checked={value}
              onChange={onChange}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              ref={inputRef}
            />
            <div className="ml-3">
              <label className="block text-lg text-gray-800" htmlFor={name}>
                {label}
              </label>
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
          </div>
        )
      } else if (type === "file") {
        return (
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={name}>
              {label}
            </label>
            {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
            <div className="relative">
              <input id={name} name={name} type="file" onChange={onChange} className="hidden" ref={inputRef} />
              <label
                htmlFor={name}
                className="flex items-center justify-center w-full px-4 py-3 text-lg border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
              >
                {fileData ? fileData.name : t.chooseFile}
              </label>
            </div>
            {filePreviewUrl && (
              <div className="mt-2">
                <img
                  src={filePreviewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="mt-2 h-24 object-contain rounded"
                />
              </div>
            )}
          </div>
        )
      } else if (type === "number") {
        return (
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={name}>
              {label}
            </label>
            {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
            <input
              id={name}
              name={name}
              type="number"
              min="0"
              value={value}
              onChange={onChange}
              className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:outline-none transition-colors bg-transparent custom-focus"
              ref={inputRef}
            />
          </div>
        )
      } else {
        return (
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={name}>
              {label}
            </label>
            {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
            <input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={onChange}
              className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:outline-none transition-colors bg-transparent custom-focus"
              ref={inputRef}
            />
          </div>
        )
      }
    },
    (prevProps, nextProps) => {
      // Custom comparison function for React.memo
      // Only re-render if these specific props change
      return (
        prevProps.value === nextProps.value &&
        prevProps.label === nextProps.label &&
        prevProps.type === nextProps.type &&
        prevProps.description === nextProps.description &&
        // For file inputs, we need to check if the file has changed
        (prevProps.type !== "file" ||
          prevProps.formData?.[prevProps.name]?.name === nextProps.formData?.[nextProps.name]?.name)
      )
    },
  )

  // Change the MemoizedInputField useCallback to include t in the dependencies
  const MemoizedInputField = useCallback(InputField, [t])

  // Render the current section
  const renderSection = () => {
    const section = sections[currentSection]

    switch (section.id) {
      case "companyInfo":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.companyInfo}</h2>
            <MemoizedInputField
              label={t.name}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              description={t.nameDescription}
            />
            <MemoizedInputField
              label={t.industry}
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              description={t.industryDescription}
            />
            {/* --- Business Type Checkboxes --- */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2">{t.businessType}</label>
              <p className="text-sm text-gray-600 mb-2">{t.businessTypeDescription}</p>
              <div className="space-y-2">
                {["businessCustomers", "privateCustomers", "governmentalOrders", "further"].map((key) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`businessType_${key}`}
                      name={`businessType_${key}`}
                      checked={formData.businessType[key]}
                      onChange={handleBusinessTypeChange}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`businessType_${key}`} className="ml-3 text-lg text-gray-800">
                      {t[key]}
                    </label>
                  </div>
                ))}
              </div>
              {formData.businessType.further && (
                <div className="mt-4">
                  <MemoizedInputField
                    label={`${t.further} (${t.other})`}
                    name="businessTypeOther"
                    value={formData.businessTypeOther || ""}
                    onChange={handleChange}
                    description={`Bitte gebt den anderen Kundentyp an.`}
                  />
                </div>
              )}
            </div>
            {/* --- End Business Type --- */}

            <MemoizedInputField
              label={t.slogan}
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
              description={t.sloganDescription}
            />
            <MemoizedInputField
              label={t.customerGroups}
              name="customerGroups"
              type="select"
              options={["1", "2", "3", "4+"]}
              value={formData.customerGroups === "4" ? "4+" : formData.customerGroups}
              onChange={(e) => {
                // Map "4+" to "4" in the actual form data
                const value = e.target.value === "4+" ? "4" : e.target.value
                setFormData((prev) => ({ ...prev, customerGroups: value }))
              }}
              description={t.customerGroupsDescription}
            />
            <MemoizedInputField
              label={t.customerDescription}
              name="customerDescription"
              type="textarea"
              value={formData.customerDescription}
              onChange={handleChange}
              description={t.customerDescriptionDescription}
            />
            {/* --- Customer Acquisition Checkboxes --- */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2">{t.customerAcquisition}</label>
              <p className="text-sm text-gray-600 mb-2">{t.customerAcquisitionDescription}</p>
              <div className="space-y-2">
                {["searchEngineSearch", "adClicks", "linkQrCode", "friendReferral", "other"].map((key) => (
                  <div key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`customerAcquisition_${key}`}
                      name={`customerAcquisition_${key}`}
                      checked={formData.customerAcquisition[key]}
                      onChange={handleCustomerAcquisitionChange}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`customerAcquisition_${key}`} className="ml-3 text-lg text-gray-800">
                      {t[key]}
                    </label>
                  </div>
                ))}
              </div>
              {/* Conditional Text Field for 'Other' */}
              {formData.customerAcquisition.other && (
                <div className="mt-4">
                  <MemoizedInputField
                    label={`${t.other}`}
                    name="customerAcquisitionOther"
                    value={formData.customerAcquisitionOther || t.other}
                    onChange={handleChange}
                    description={`Bitte gebt den anderen Weg an.`}
                  />
                </div>
              )}
            </div>
            {/* --- End Customer Acquisition --- */}

            {/* <MemoizedInputField // Removed linkSource
              label={t.linkSource}
              name="linkSource"
              value={formData.linkSource}
              onChange={handleChange}
              description={t.linkSourceDescription}
            /> */}
            <MemoizedInputField
              label={t.productCount}
              name="productCount"
              type="select"
              options={["1", "2", "3", "4+"]}
              value={formData.productCount === "4" ? "4+" : formData.productCount}
              onChange={(e) => {
                // Map "4+" to "4" in the actual form data
                const value = e.target.value === "4+" ? "4" : e.target.value
                setFormData((prev) => ({ ...prev, productCount: value }))
              }}
              description={t.productCountDescription}
            />
            <MemoizedInputField
              label={t.websiteProductCount}
              name="websiteProductCount"
              type="number"
              value={formData.websiteProductCount}
              onChange={handleChange}
              description={t.websiteProductCountDescription}
            />
            <MemoizedInputField
              label={t.customerProblem}
              name="customerProblem"
              type="textarea"
              value={formData.customerProblem}
              onChange={handleChange}
              description={t.customerProblemDescription}
            />
            <MemoizedInputField
              label={t.solution}
              name="solution"
              type="textarea"
              value={formData.solution}
              onChange={handleChange}
              description={t.solutionDescription}
            />
            <MemoizedInputField
              label={t.competitors}
              name="competitors"
              type="textarea"
              value={formData.competitors}
              onChange={handleChange}
              description={t.competitorsDescription}
            />
            <MemoizedInputField
              label={t.address}
              name="address"
              type="textarea"
              value={formData.address}
              onChange={handleChange}
              description={t.addressDescription}
            />
            <MemoizedInputField
              label={t.smartphones}
              name="smartphones"
              value={formData.smartphones}
              onChange={handleChange}
              description={t.smartphonesDescription}
            />

            <MemoizedInputField
              label={t.communicationEmail}
              name="communicationEmail"
              type="email"
              value={formData.communicationEmail}
              onChange={handleChange}
              description={t.communicationEmailDescription}
            />
          </div>
        )
      case "founders":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.founders}</h2>

            {formData.founders.map((founder, index) => (
              <div key={index} className="mb-8 p-6 bg-gray-50 rounded-lg relative">
                <h3 className="text-xl font-medium mb-4">
                  {t.founder} {index + 1}
                </h3>

                {/* Remove button */}
                {formData.founders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFounder(index)}
                    className="absolute top-4 right-4 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    aria-label="Remove founder"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={`founder-${index}-title`}>
                      {t.title}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.titleDescription}</p>
                    <input
                      id={`founder-${index}-title`}
                      type="text"
                      value={founder.title}
                      onChange={(e) => handleFounderChange(index, "title", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium text-gray-800 mb-2"
                      htmlFor={`founder-${index}-position`}
                    >
                      {t.position}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.positionDescription}</p>
                    <input
                      id={`founder-${index}-position`}
                      type="text"
                      value={founder.position}
                      onChange={(e) => handleFounderChange(index, "position", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium text-gray-800 mb-2"
                      htmlFor={`founder-${index}-firstName`}
                    >
                      {t.firstName}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.firstNameDescription}</p>
                    <input
                      id={`founder-${index}-firstName`}
                      type="text"
                      value={founder.firstName}
                      onChange={(e) => handleFounderChange(index, "firstName", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium text-gray-800 mb-2"
                      htmlFor={`founder-${index}-lastName`}
                    >
                      {t.lastName}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.lastNameDescription}</p>
                    <input
                      id={`founder-${index}-lastName`}
                      type="text"
                      value={founder.lastName}
                      onChange={(e) => handleFounderChange(index, "lastName", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={`founder-${index}-image`}>
                      {t.image}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.imageDescription}</p>
                    <div className="relative">
                      <input
                        id={`founder-${index}-image`}
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFounderChange(index, "image", e.target.files[0])
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor={`founder-${index}-image`}
                        className="flex items-center justify-center w-full px-4 py-3 text-lg border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                      >
                        {founder.image ? founder.image.name : "Choose a file..."}
                      </label>
                    </div>
                    {founder.image && founder.image.type && founder.image.type.startsWith("image/") && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(founder.image) || "/placeholder.svg"}
                          alt="Preview"
                          className="mt-2 h-24 object-contain rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={`founder-${index}-gender`}>
                      {t.gender}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.genderDescription}</p>
                    <select
                      id={`founder-${index}-gender`}
                      value={founder.gender}
                      onChange={(e) => handleFounderChange(index, "gender", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    >
                      <option value="">{t.selectOption}</option>
                      <option value="Male">{t.male}</option>
                      <option value="Female">{t.female}</option>
                      <option value="Diverse">{t.diverse}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={`founder-${index}-mobile`}>
                      {t.mobile}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.mobileDescription}</p>
                    <input
                      id={`founder-${index}-mobile`}
                      type="tel"
                      value={founder.mobile}
                      onChange={(e) => handleFounderChange(index, "mobile", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-lg font-medium text-gray-800 mb-2"
                      htmlFor={`founder-${index}-landline`}
                    >
                      {t.landline}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.landlineDescription}</p>
                    <input
                      id={`founder-${index}-landline`}
                      type="tel"
                      value={founder.landline}
                      onChange={(e) => handleFounderChange(index, "landline", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor={`founder-${index}-email`}>
                      {t.email}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.emailDescription}</p>
                    <input
                      id={`founder-${index}-email`}
                      type="email"
                      value={founder.email}
                      onChange={(e) => handleFounderChange(index, "email", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>

                  {/* In founders section, comment out the founder calendar input and related label/description/help text:
                  <div>
                    <label
                      className="block text-lg font-medium text-gray-800 mb-2"
                      htmlFor={`founder-${index}-calendar`}
                    >
                      {t.calendar}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">{t.calendarDescription}</p>
                    <p className="text-sm text-blue-600 mb-2">{t.calendarHelp}</p>
                    <input
                      id={`founder-${index}-calendar`}
                      type="url"
                      value={founder.calendar}
                      onChange={(e) => handleFounderChange(index, "calendar", e.target.value)}
                      className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                    />
                  </div> */}
                </div>
              </div>
            ))}

            {/* Add founder button */}
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={addFounder}
                disabled={formData.founders.length >= 4}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${formData.founders.length >= 4 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-violet-100"
                  }`}
                style={{
                  color: formData.founders.length >= 4 ? undefined : "#8b5cf6",
                  backgroundColor: formData.founders.length >= 4 ? undefined : "rgba(139, 92, 246, 0.1)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                {t.addFounder} {formData.founders.length >= 4 ? "(Max 4)" : ""}
              </button>
            </div>
          </div>
        )
      case "websiteSetup":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.websiteSetup}</h2>
            <MemoizedInputField
              label={t.currentWebsite}
              name="currentWebsite"
              type="url"
              value={formData.currentWebsite}
              onChange={handleChange}
              description={t.currentWebsiteDescription}
            />
            {formData.currentWebsite && (
              <>
                <MemoizedInputField
                  label={t.domainRegistrant}
                  name="domainRegistrant"
                  value={formData.domainRegistrant}
                  onChange={handleChange}
                  description={t.domainRegistrantDescription}
                />
                <MemoizedInputField
                  label={t.adminRightsHolder}
                  name="adminRightsHolder"
                  value={formData.adminRightsHolder}
                  onChange={handleChange}
                  description={t.adminRightsHolderDescription}
                />
                <MemoizedInputField
                  label={t.technicalContact}
                  name="technicalContact"
                  value={formData.technicalContact}
                  onChange={handleChange}
                  description={t.technicalContactDescription}
                />
              </>
            )}
            <MemoizedInputField
              label={t.addressForm}
              name="addressForm"
              type="select"
              options={["Du", "Sie"]}
              value={formData.addressForm}
              onChange={handleChange}
              description={t.addressFormDescription}
            />
            <MemoizedInputField
              label={t.perspective}
              name="perspective"
              type="select"
              options={["Ich", "Wir"]}
              value={formData.perspective}
              onChange={handleChange}
              description={t.perspectiveDescription}
            />
            <MemoizedInputField
              label={t.calendarLink}
              name="calendarLink"
              type="url"
              value={formData.calendarLink}
              onChange={handleChange}
              description={t.calendarLinkDescription}
            />
            {/* Add the hint below the input */}
            <p
              className="text-sm text-blue-600 mb-2"
              dangerouslySetInnerHTML={{ __html: t.calendarHelp }}
            />
            <MemoizedInputField
              label={t.partners}
              name="partners"
              type="textarea"
              value={formData.partners}
              onChange={handleChange}
              description={t.partnersDescription}
            />
            <MemoizedInputField
              label={t.newsletterPopupTimer}
              name="newsletterPopupTimer"
              type="number"
              value={formData.newsletterPopupTimer}
              onChange={handleChange}
              description={t.newsletterPopupTimerDescription}
            />
          </div>
        )
      case "designPreferences":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.designPreferences}</h2>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor="colorPreferences">
                {t.colorPreferences}
              </label>
              <img src={realtimeColorsPreview || "/placeholder.svg"} alt="Realtime Colors Preview" className="mb-2" />
              {/* Use dangerouslySetInnerHTML for the description containing the link */}
              <p
                className="text-sm text-gray-600 mb-2"
                dangerouslySetInnerHTML={{ __html: t.colorPreferencesDescription }}
              />
              <div className="flex items-center">
                <input
                  id="colorPreferences"
                  name="colorPreferences"
                  type="text"
                  value={formData.colorPreferences}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:outline-none transition-colors bg-transparent custom-focus"
                  placeholder={t.colorPreferencesPlaceholder} // Use translated placeholder
                />
                <a
                  href="https://www.realtimecolors.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors no-underline whitespace-nowrap" // Added whitespace-nowrap
                >
                  {t.pickColorsButton} {/* Use translated button text */}
                </a>
              </div>
            </div>

            <MemoizedInputField
              label={t.stylePreferences}
              name="stylePreferences"
              type="select"
              options={["Minimalistisch", "Verspielt", "Elegant", "Tech", "Luxuriös", "Clean", "Kreativ", "Other"]}
              value={formData.stylePreferences}
              onChange={handleChange}
              description={t.stylePreferencesDescription}
            />

            <MemoizedInputField
              label={t.brandingEmotions}
              name="brandingEmotions"
              type="select"
              options={["Vertrauen", "Innovation", "Nachhaltigkeit", "Other"]}
              value={formData.brandingEmotions}
              onChange={handleChange}
              description={t.brandingEmotionsDescription}
            />
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor="openGraphImage">
                {t.openGraphImage}
              </label>
              <img src={require("../images/opengraph.png")} alt="Open Graph Example" className="mb-2 rounded border shadow" style={{maxWidth: 400, background: "#fff", padding: 16, border: "2px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"}} />
              <p className="text-sm text-gray-600 mb-2">{t.openGraphImageDescription}</p>
              <input
                id="openGraphImage"
                name="openGraphImage"
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) setFormData(prev => ({ ...prev, openGraphImage: e.target.files[0] }))
                }}
                className="hidden"
              />
              <label htmlFor="openGraphImage" className="flex items-center justify-center w-full px-4 py-3 text-lg border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                {formData.openGraphImage ? formData.openGraphImage.name : t.chooseFile}
              </label>
              {formData.openGraphImage && formData.openGraphImage.type && formData.openGraphImage.type.startsWith("image/") && (
                <img src={URL.createObjectURL(formData.openGraphImage)} alt="Preview" className="mt-2 h-24 object-contain rounded" />
              )}
            </div>
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2" htmlFor="favicon">
                {t.favicon}
              </label>
              <img src={require("../images/favicon.png")} alt="Favicon Example" className="mb-2 rounded border shadow" style={{maxWidth: 220, maxHeight: 220, background: "#fff", padding: 16, border: "2px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"}} />
              <p className="text-sm text-gray-600 mb-2">{t.faviconDescription}</p>
              <input
                id="favicon"
                name="favicon"
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) setFormData(prev => ({ ...prev, favicon: e.target.files[0] }))
                }}
                className="hidden"
              />
              <label htmlFor="favicon" className="flex items-center justify-center w-full px-4 py-3 text-lg border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                {formData.favicon ? formData.favicon.name : t.chooseFile}
              </label>
              {formData.favicon && formData.favicon.type && formData.favicon.type.startsWith("image/") && (
                <img src={URL.createObjectURL(formData.favicon)} alt="Preview" className="mt-2 h-12 object-contain rounded" />
              )}
            </div>
          </div>
        )
      case "testimonials":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.testimonials}</h2>

            {/* Custom checkbox with separate handler */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2">{t.hasTestimonials}</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hasTestimonials}
                  onChange={handleTestimonialsCheckbox}
                  className="form-checkbox h-5 w-5 text-purple-600"
                />
                <span className="ml-2 text-gray-700">Include testimonials section</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{t.hasTestimonialsDescription}</p>
            </div>

            {formData.hasTestimonials && (
              <>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="p-4 mb-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium mb-4">
                      {t.testimonials} {index + 1}
                    </h3>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-800 mb-2">{t.testimonialName}</label>
                      <p className="text-sm text-gray-600 mb-2">{t.testimonialNameDescription}</p>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
                        className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-800 mb-2">{t.testimonialPosition}</label>
                      <p className="text-sm text-gray-600 mb-2">{t.testimonialPositionDescription}</p>
                      <input
                        type="text"
                        value={testimonial.position}
                        onChange={(e) => handleTestimonialChange(index, "position", e.target.value)}
                        className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-800 mb-2">{t.company}</label>
                      <p className="text-sm text-gray-600 mb-2">{t.companyDescription}</p>
                      <input
                        type="text"
                        value={testimonial.company}
                        onChange={(e) => handleTestimonialChange(index, "company", e.target.value)}
                        className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-800 mb-2">{t.text}</label>
                      <p className="text-sm text-gray-600 mb-2">{t.textDescription}</p>
                      <textarea
                        value={testimonial.text}
                        onChange={(e) => handleTestimonialChange(index, "text", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-800 mb-2">{t.image}</label>
                      <p className="text-sm text-gray-600 mb-2">{t.imageDescription}</p>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleTestimonialChange(index, "image", e.target.files[0])
                          }
                        }}
                        className="hidden"
                        id={`testimonial-${index}-image`}
                      />
                      <label
                        htmlFor={`testimonial-${index}-image`}
                        className="flex items-center justify-center w-full px-4 py-3 text-lg border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
                      >
                        {testimonial.image ? testimonial.image.name : "Choose a file..."}
                      </label>
                      {testimonial.image && testimonial.image.type && testimonial.image.type.startsWith("image/") && (
                        <img
                          src={URL.createObjectURL(testimonial.image) || "/placeholder.svg"}
                          alt="Preview"
                          className="mt-2 h-24 object-contain rounded"
                        />
                      )}
                    </div>
                  </div>
                ))}

                {testimonials.length < 3 && (
                  <button
                    type="button"
                    onClick={addTestimonial}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-violet-50 hover:border-violet-300 transition-all duration-200"
                  >
                    Add Testimonial {testimonials.length >= 3 ? "(Max 3)" : ""}
                  </button>
                )}
              </>
            )}
          </div>
        )
      case "faqs":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.faqs}</h2>

            {/* Custom checkbox with separate handler */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-800 mb-2">{t.hasFAQs}</label>
              <div className="flex items-center">
                <input
                  id="hasFAQs"
                  name="hasFAQs"
                  type="checkbox"
                  checked={formData.hasFAQs}
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    setFormData((prevData) => ({
                      ...prevData,
                      hasFAQs: isChecked,
                    }))
                  }}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Include FAQ section</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{t.hasFAQsDescription}</p>
            </div>

            {formData.hasFAQs && (
              <>
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 mb-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium mb-4">FAQ {index + 1}</h3>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-800 mb-2">
                        {t[`question${index + 1}`] || `Question ${index + 1}`}
                      </label>
                      <p className="text-sm text-gray-600 mb-2">
                        {t[`question${index + 1}Description`] || "Frequently asked question"}
                      </p>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...faqs]
                          newFaqs[index].question = e.target.value
                          setFaqs(newFaqs)
                        }}
                        className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-lg font-medium text-gray-800 mb-2">
                        {t[`answer${index + 1}`] || `Answer ${index + 1}`}
                      </label>
                      <p className="text-sm text-gray-600 mb-2">
                        {t[`answer${index + 1}Description`] || "Answer to the question"}
                      </p>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...faqs]
                          newFaqs[index].answer = e.target.value
                          setFaqs(newFaqs)
                        }}
                        rows={4}
                        className="w-full px-4 py-3 text-lg border-b-2 border-gray-300 focus:border-purple-500 focus:outline-none transition-colors bg-transparent resize-none"
                      />
                    </div>
                  </div>
                ))}

                {faqs.length < 3 && (
                  <button
                    type="button"
                    onClick={addFaq}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-violet-50 hover:border-violet-300 transition-all duration-200"
                  >
                    Add FAQ {faqs.length >= 3 ? "(Max 3)" : ""}
                  </button>
                )}
              </>
            )}
          </div>
        )
      case "visibilityBundle":
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.visibilityBundle}</h2>
            <p className="mb-6 text-gray-600">{t.visibilityBundleDescription}</p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={sortedVisibilityItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sortedVisibilityItems.map((item, index) => (
                    <SortableItem key={item.id} id={item.id}>
                      <div className="flex-1">
                        <div className="font-medium">
                          {index + 1}. {item.label}
                        </div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-8">
              <MemoizedInputField
                label={t.visibilityBundleAdditionalInfoLabel}
                name="visibilityBundleAdditionalInfo"
                type="textarea"
                value={formData.visibilityBundleAdditionalInfo || ""}
                onChange={handleChange}
                description={t.visibilityBundleAdditionalInfoDescription}
              />
            </div>
          </div>
        )
      case "additionalInfo":
        // Add console log here for debugging
        console.log("Rendering additionalInfo, knowsGoToMarketVoucher:", formData.knowsGoToMarketVoucher);
        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.additionalInfo}</h2>
            <MemoizedInputField
              label={t.companyStage}
              name="companyStage"
              type="select"
              options={["Idea", "Founded", "Has Customers"]} // These are translation keys
              value={formData.companyStage}
              onChange={handleChange}
              description={t.companyStageDescription}
            />
            {/* Knows GoToMarket Checkbox */}
            <div className="mb-6 flex items-center">
              <input
                id="knowsGoToMarketVoucher"
                name="knowsGoToMarketVoucher"
                type="checkbox"
                checked={formData.knowsGoToMarketVoucher}
                onChange={handleKnowsGoToMarketVoucherCheckbox}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <label className="block text-lg text-gray-800" htmlFor="knowsGoToMarketVoucher">
                  {t.knowsGoToMarketVoucher}
                </label>
                <p className="text-sm text-gray-600">{t.knowsGoToMarketVoucherDescription}</p>
              </div>
            </div>

            {/* Conditionally render the second question */}
            {formData.knowsGoToMarketVoucher && (
              <div className="mb-6 flex items-center transition-opacity duration-300 ease-in-out">
                <input
                  id="appliedForGoToMarketVoucher"
                  name="appliedForGoToMarketVoucher"
                  type="checkbox"
                  checked={formData.appliedForGoToMarketVoucher}
                  onChange={handleAppliedForGoToMarketVoucherCheckbox}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <label className="block text-lg text-gray-800" htmlFor="appliedForGoToMarketVoucher">
                    {t.appliedForGoToMarketVoucher}
                  </label>
                  <p className="text-sm text-gray-600">{t.appliedForGoToMarketVoucherDescription}</p>
                </div>
              </div>
            )}

            {/* Removed Mood Graphic Input */}
            {/* <div className="mt-4"> ... mood graphic code ... </div> */}

            {/* Additional Documents Input */}
            <div className="mt-4">
              <label className="block text-lg font-medium text-gray-800 mb-2">{t.additionalDocuments}</label>
              <p className="text-sm text-gray-600 mb-2">{t.additionalDocumentsDescription}</p>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({
                      ...formData,
                      additionalDocuments: e.target.files[0],
                    })
                  }
                }}
                className="hidden"
                id="additionalDocuments"
              />
              <label
                htmlFor="additionalDocuments"
                className="flex items-center justify-center w-full px-4 py-3 text-lg border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
              >
                {/* Use translated placeholder */}
                {formData.additionalDocuments ? formData.additionalDocuments.name : t.chooseFile}
              </label>
              {formData.additionalDocuments && (
                <div className="mt-2 p-2 border border-gray-200 rounded">
                  <p className="text-sm">{formData.additionalDocuments.name}</p>
                </div>
              )}
            </div>

            <MemoizedInputField
              label={t.addInfo}
              name="additionalInfo"
              type="textarea"
              value={formData.additionalInfo}
              onChange={handleChange}
              description={t.addInfoDescription}
            />
          </div>
        )
      case "review":
        // Helper function to get selected items from an object map with translations
        const getSelectedTranslatedItems = (itemObject, translations) => {
          return Object.entries(itemObject || {})
            .filter(([_, isSelected]) => isSelected)
            .map(([key]) => translations[key] || key) // Use translated label
            .join(", ");
        }

        // Helper function to get translated value for review
        const getTranslatedValue = (key, translations) => {
          if (!key) return "";
          // Try to match translation key (case-insensitive, remove spaces)
          const translationKey = String(key).toLowerCase().replace(/[^a-z0-9]/gi, '');
          // Try direct match, fallback to original
          return translations[translationKey] || translations[key] || key;
        };

        return (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6">{t.reviewSubmit}</h2>
            <p className="mb-6">{t.reviewMessage}</p>

            {/* Company Information */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-4">{t.companyInfo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.name && (
                  <div>
                    <p className="font-medium text-gray-700">{t.name}:</p>
                    <p>{formData.name}</p>
                  </div>
                )}
                {formData.industry && (
                  <div>
                    <p className="font-medium text-gray-700">{t.industry}:</p>
                    <p>{formData.industry}</p>
                  </div>
                )}
                {/* Display Business Type */}
                {(Object.values(formData.businessType).some(v => v)) && (
                  <div>
                    <p className="font-medium text-gray-700">{t.businessType}:</p>
                    <p>
                      {getSelectedTranslatedItems(formData.businessType, t)}
                      {formData.businessType.further && formData.businessTypeOther && ` (${formData.businessTypeOther})`}
                    </p>
                  </div>
                )}
                {formData.slogan && (
                  <div>
                    <p className="font-medium text-gray-700">{t.slogan}:</p>
                    <p>{formData.slogan}</p>
                  </div>
                )}
                {formData.customerGroups && (
                  <div>
                    <p className="font-medium text-gray-700">{t.customerGroups}:</p>
                    <p>{formData.customerGroups === "4" ? "4+" : formData.customerGroups}</p>
                  </div>
                )}
                {formData.customerDescription && (
                  <div>
                    <p className="font-medium text-gray-700">{t.customerDescription}:</p>
                    <p>{formData.customerDescription}</p>
                  </div>
                )}
                {/* Display Customer Acquisition */}
                {(Object.values(formData.customerAcquisition).some(v => v)) && (
                  <div>
                    <p className="font-medium text-gray-700">{t.customerAcquisition}:</p>
                    <p>{getSelectedTranslatedItems(formData.customerAcquisition, t)}</p>
                  </div>
                )}
                {formData.productCount && (
                  <div>
                    <p className="font-medium text-gray-700">{t.productCount}:</p>
                    <p>{formData.productCount === "4" ? "4+" : formData.productCount}</p>
                  </div>
                )}
                {formData.websiteProductCount && (
                  <div>
                    {/* Use updated label key here */}
                    <p className="font-medium text-gray-700">{t.websiteProductCount}:</p>
                    <p>{formData.websiteProductCount}</p>
                  </div>
                )}
                {formData.smartphones && (
                  <div>
                    <p className="font-medium text-gray-700">{t.smartphones}:</p>
                    <p>{formData.smartphones}</p>
                  </div>
                )}
                {formData.communicationEmail && (
                  <div>
                    <p className="font-medium text-gray-700">{t.communicationEmail}:</p>
                    <p>{formData.communicationEmail}</p>
                  </div>
                )}
              </div>
              {formData.customerProblem && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.customerProblem}:</p>
                  <p className="whitespace-pre-wrap">{formData.customerProblem}</p>
                </div>
              )}
              {formData.solution && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.solution}:</p>
                  <p className="whitespace-pre-wrap">{formData.solution}</p>
                </div>
              )}
              {formData.competitors && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.competitors}:</p>
                  <p className="whitespace-pre-wrap">{formData.competitors}</p>
                </div>
              )}
              {formData.address && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.address}:</p>
                  <p className="whitespace-pre-wrap">{formData.address}</p>
                </div>
              )}
              {customerDescriptions.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.customerDescription}:</p>
                  <p className="whitespace-pre-wrap">{customerDescriptions.join(" ")}</p>
                </div>
              )}
              {productDescriptions.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">Product Description:</p>
                  <p className="whitespace-pre-wrap">{productDescriptions.join(" ")}</p>
                </div>
              )}
            </div>

            {/* Founders */}
            {formData.founders.length > 0 && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium mb-4">{t.founders}</h3>
                {formData.founders.map((founder, index) => (
                  <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                    <h4 className="text-lg font-medium mb-2">
                      {t.founder} {index + 1}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {founder.firstName && founder.lastName && (
                        <div>
                          <p className="font-medium text-gray-700">{t.name}:</p>
                          <p>
                            {founder.firstName} {founder.lastName}
                          </p>
                        </div>
                      )}
                      {founder.title && (
                        <div>
                          <p className="font-medium text-gray-700">{t.title}:</p>
                          <p>{founder.title}</p>
                        </div>
                      )}
                      {founder.position && (
                        <div>
                          <p className="font-medium text-gray-700">{t.position}:</p>
                          <p>{founder.position}</p>
                        </div>
                      )}
                      {founder.gender && (
                        <div>
                          <p className="font-medium text-gray-700">{t.gender}:</p>
                          {/* Translate Gender */}
                          <p>{getTranslatedValue(founder.gender, t)}</p>
                        </div>
                      )}
                      {founder.mobile && (
                        <div>
                          <p className="font-medium text-gray-700">{t.mobile}:</p>
                          <p>{founder.mobile}</p>
                        </div>
                      )}
                      {founder.landline && (
                        <div>
                          <p className="font-medium text-gray-700">{t.landline}:</p>
                          <p>{founder.landline}</p>
                        </div>
                      )}
                      {founder.email && (
                        <div>
                          <p className="font-medium text-gray-700">{t.email}:</p>
                          <p>{founder.email}</p>
                        </div>
                      )}
                      {founder.calendar && (
                        <div>
                          <p className="font-medium text-gray-700">{t.calendar}:</p>
                          <p>{founder.calendar}</p>
                        </div>
                      )}
                    </div>
                    {founder.image && founder.image.name && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700">{t.image}:</p>
                        <p>{founder.image.name}</p>
                        {founder.image.type && founder.image.type.startsWith("image/") && (
                          <img
                            src={URL.createObjectURL(founder.image) || "/placeholder.svg"}
                            alt={`${founder.firstName} ${founder.lastName}`}
                            className="mt-2 h-24 object-contain rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Website Setup */}
            <div className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">{t.websiteSetup}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.currentWebsite && (
                  <div>
                    <p className="font-medium text-gray-700">{t.currentWebsite}:</p>
                    <p>{formData.currentWebsite}</p>
                  </div>
                )}
                {formData.currentWebsite && formData.domainRegistrant && (
                  <div>
                    <p className="font-medium text-gray-700">{t.domainRegistrant}:</p>
                    <p>{formData.domainRegistrant}</p>
                  </div>
                )}
                {formData.currentWebsite && formData.adminRightsHolder && (
                  <div>
                    <p className="font-medium text-gray-700">{t.adminRightsHolder}:</p>
                    <p>{formData.adminRightsHolder}</p>
                  </div>
                )}
                {formData.currentWebsite && formData.technicalContact && (
                  <div>
                    <p className="font-medium text-gray-700">{t.technicalContact}:</p>
                    <p>{formData.technicalContact}</p>
                  </div>
                )}
                {formData.addressForm && (
                  <div>
                    <p className="font-medium text-gray-700">{t.addressForm}:</p>
                    {/* Translate Address Form */}
                    <p>{getTranslatedValue(formData.addressForm, t)}</p>
                  </div>
                )}
                {formData.perspective && (
                  <div>
                    <p className="font-medium text-gray-700">{t.perspective}:</p>
                    {/* Translate Perspective */}
                    <p>{getTranslatedValue(formData.perspective, t)}</p>
                  </div>
                )}
                {formData.calendarLink && (
                  <div>
                    <p className="font-medium text-gray-700">{t.calendarLink}:</p>
                    <p>{formData.calendarLink}</p>
                  </div>
                )}
                <div className="mb-4">
                  <p className="font-medium">{t.hasTestimonials}:</p>
                  <p>{formData.hasTestimonials ? "Yes" : "No"}</p>
                </div>
                {formData.newsletterPopupTimer && (
                  <div>
                    <p className="font-medium text-gray-700">{t.newsletterPopupTimer}:</p>
                    <p>{formData.newsletterPopupTimer}</p>
                  </div>
                )}
              </div>
              {formData.partners && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.partners}:</p>
                  <p className="whitespace-pre-wrap">{formData.partners}</p>
                </div>
              )}
            </div>

            {/* Testimonials */}
            {formData.hasTestimonials && testimonials.length > 0 && (
              <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">{t.testimonials}</h3>

                {testimonials.map(
                  (testimonial, index) =>
                    testimonial.name && (
                      <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                        <h4 className="text-lg font-medium mb-2">
                          {t.testimonialName} {index + 1}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-700">{t.testimonialName}:</p>
                            <p>{testimonial.name}</p>
                          </div>
                          {testimonial.position && (
                            <div>
                              <p className="font-medium text-gray-700">{t.testimonialPosition}:</p>
                              <p>{testimonial.position}</p>
                            </div>
                          )}
                          {testimonial.company && (
                            <div>
                              <p className="font-medium text-gray-700">{t.company}:</p>
                              <p>{testimonial.company}</p>
                            </div>
                          )}
                        </div>
                        {testimonial.text && (
                          <div className="mt-4">
                            <p className="font-medium text-gray-700">{t.text}:</p>
                            <p className="whitespace-pre-wrap">{testimonial.text}</p>
                          </div>
                        )}
                        {testimonial.image && testimonial.image instanceof File && (
                          <div className="mt-4">
                            <p className="font-medium text-gray-700">{t.image}:</p>
                            <p>{testimonial.image.name}</p>
                            {testimonial.image.type && testimonial.image.type.startsWith("image/") && (
                              <img
                                src={URL.createObjectURL(testimonial.image) || "/placeholder.svg"}
                                alt={`Testimonial ${index + 1}`}
                                className="mt-2 h-24 object-contain rounded"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ),
                )}
              </div>
            )}

            {/* FAQs */}
            {formData.hasFAQs && faqs.length > 0 && (
              <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">{t.faqs}</h3>

                {faqs.map(
                  (faq, index) =>
                    faq.question && (
                      <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                        <h4 className="text-lg font-medium mb-2">FAQ {index + 1}</h4>
                        <div>
                          <p className="font-medium text-gray-700">{t[`question${index + 1}`] || "Question"}:</p>
                          <p>{faq.question}</p>
                        </div>
                        {faq.answer && (
                          <div className="mt-2">
                            <p className="font-medium text-gray-700">{t[`answer${index + 1}`] || "Answer"}:</p>
                            <p className="whitespace-pre-wrap">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ),
                )}
              </div>
            )}

            {/* Design Preferences */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-4">{t.designPreferences}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.colorPreferences && (
                  <div>
                    <p className="font-medium text-gray-700">{t.colorPreferences}:</p>
                    <p>{formData.colorPreferences}</p>
                  </div>
                )}
                {formData.fontPreferences && (
                  <div>
                    <p className="font-medium text-gray-700">{t.fontPreferences}:</p>
                    <p>{formData.fontPreferences}</p>
                  </div>
                )}
                {formData.stylePreferences && (
                  <div>
                    <p className="font-medium text-gray-700">{t.stylePreferences}:</p>
                    <p>{formData.stylePreferences}</p>
                  </div>
                )}
                {formData.brandingEmotions && (
                  <div>
                    <p className="font-medium text-gray-700">{t.brandingEmotions}:</p>
                    <p>{formData.brandingEmotions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Visibility Bundle */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-4">{t.visibilityBundle}</h3>
              <div className="space-y-2">
                {sortedVisibilityItems.map((item, index) => (
                  <div key={item.id} className="flex items-center p-2 border-b border-gray-200 last:border-0">
                    <div className="font-medium mr-2">{index + 1}.</div>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.visibilityBundleAdditionalInfo && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.visibilityBundleAdditionalInfoLabel}:</p> {/* Use translated label */}
                  <p className="whitespace-pre-wrap">{formData.visibilityBundleAdditionalInfo}</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-4">{t.additionalInfo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.companyStage && (
                  <div>
                    <p className="font-medium text-gray-700">{t.companyStage}:</p>
                    {/* Translate Company Stage */}
                    <p>{getTranslatedValue(formData.companyStage, t)}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-700">{t.knowsGoToMarketVoucher}:</p>
                  <p>{getTranslatedValue(formData.knowsGoToMarketVoucher, t)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">{t.appliedForGoToMarketVoucher}:</p>
                  <p>{getTranslatedValue(formData.appliedForGoToMarketVoucher, t)}</p>
                </div>
              </div>

              {formData.additionalDocuments && formData.additionalDocuments.name && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.additionalDocuments}:</p>
                  <p>{formData.additionalDocuments.name}</p>
                </div>
              )}

              {formData.additionalInfo && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700">{t.addInfo}:</p>
                  <p className="whitespace-pre-wrap">{formData.additionalInfo}</p>
                </div>
              )}
            </div>

            {/* Final submit button */}
            <div className="mt-8">
              <button
                type="submit"
                className={`w-full py-4 px-6 text-lg font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading ? "bg-gray-400 cursor-not-allowed" : "text-white hover:bg-opacity-90"
                  }`}
                style={{ backgroundColor: loading ? undefined : "#8b5cf6", borderColor: "#8b5cf6" }}
                disabled={loading}
              >
                {loading
                  ? uploadingFiles
                    ? currentLanguage === "en"
                      ? "Uploading files..."
                      : "Dateien werden hochgeladen..."
                    : t.submitting
                  : t.submit}
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // We're using direct link to realtimecolors.com instead of a modal

  // Add these specific handler functions for the GoToMarket checkboxes right after the handleFaqsCheckbox function
  const handleKnowsGoToMarketVoucherCheckbox = (e) => {
    // Dedicated handler for the knowsGoToMarketVoucher checkbox
    const isChecked = e.target.checked
    console.log("knowsGoToMarketVoucher checkbox changed to:", isChecked)

    // Update only the knowsGoToMarketVoucher property
    setFormData((prevData) => ({
      ...prevData,
      knowsGoToMarketVoucher: isChecked,
    }))
  }

  const handleAppliedForGoToMarketVoucherCheckbox = (e) => {
    // Dedicated handler for the appliedForGoToMarketVoucher checkbox
    const isChecked = e.target.checked
    console.log("appliedForGoToMarketVoucher checkbox changed to:", isChecked)

    // Update only the appliedForGoToMarketVoucher property
    setFormData((prevData) => ({
      ...prevData,
      appliedForGoToMarketVoucher: isChecked,
    }))
  }

  // Add these specific handler functions for the testimonials and FAQs checkboxes
  const handleTestimonialsCheckbox = (e) => {
    // Completely separate handler for testimonials checkbox
    const isChecked = e.target.checked
    console.log("Testimonials checkbox changed to:", isChecked)

    // Update only the hasTestimonials property
    setFormData((prevData) => ({
      ...prevData,
      hasTestimonials: isChecked,
    }))
  }

  const handleFaqsCheckbox = (e) => {
    // Completely separate handler for FAQs checkbox
    const isChecked = e.target.checked
    console.log("FAQs checkbox changed to:", isChecked)

    // Update only the hasFaqs property
    setFormData((prevData) => ({
      ...prevData,
      hasFaqs: isChecked,
    }))
  }

  // Add this new useEffect to preserve form state when navigating
  useEffect(() => {
    // Store the current form data in sessionStorage whenever it changes
    if (typeof window !== "undefined") {
      sessionStorage.setItem("formData", JSON.stringify(formData))
    }
  }, [formData])

  // Add this useEffect to load saved form data on initial load
  useEffect(() => {
    // Load saved form data from sessionStorage on initial load
    if (typeof window !== "undefined") {
      const savedFormData = sessionStorage.getItem("formData")
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData)
          setFormData((prevData) => ({
            ...prevData,
            ...parsedData,
          }))
        } catch (error) {
          console.error("Error parsing saved form data:", error)
        }
      }
    }
  }, [])

  // Update sortedVisibilityItems when language changes
  useEffect(() => {
    // Rebuild the items with the new translation
    const newItems = [
      { id: "logo", name: "logoRank", label: t.logoRank, description: t.logoRankDescription },
      { id: "website", name: "websiteRank", label: t.websiteRank, description: t.websiteRankDescription },
      { id: "callBackground", name: "callBackgroundRank", label: t.callBackgroundRank, description: t.callBackgroundRankDescription },
      { id: "qrCode", name: "qrCodeRank", label: t.qrCodeRank, description: t.qrCodeRankDescription },
      { id: "socialMediaBanner", name: "socialMediaBannerRank", label: t.socialMediaBannerRank, description: t.socialMediaBannerRankDescription },
      { id: "newsletterTemplate", name: "newsletterTemplateRank", label: t.newsletterTemplateRank, description: t.newsletterTemplateRankDescription },
      { id: "emailSignatures", name: "emailSignaturesRank", label: t.emailSignaturesRank, description: t.emailSignaturesRankDescription },
      { id: "letterTemplate", name: "letterTemplateRank", label: t.letterTemplateRank, description: t.letterTemplateRankDescription },
      { id: "smartphoneScreenBackground", name: "smartphoneScreenBackgroundRank", label: t.smartphoneScreenBackgroundRank, description: t.smartphoneScreenBackgroundRankDescription },
      { id: "desktopScreenBackground", name: "desktopScreenBackgroundRank", label: t.desktopScreenBackgroundRank, description: t.desktopScreenBackgroundRankDescription },
      { id: "rollUp", name: "rollUpRank", label: t.rollUpRank, description: t.rollUpRankDescription },
      { id: "flyer", name: "flyerRank", label: t.flyerRank, description: t.flyerRankDescription },
      { id: "businessCards", name: "businessCardsRank", label: t.businessCardsRank, description: t.businessCardsRankDescription },
      { id: "shirtsHoodies", name: "shirtsHoodiesRank", label: t.shirtsHoodiesRank, description: t.shirtsHoodiesRankDescription },
      { id: "pitchDeck", name: "pitchDeckRank", label: t.pitchDeckRank, description: t.pitchDeckRankDescription },
      { id: "bookingToolIntegration", name: "bookingToolIntegrationRank", label: t.bookingToolIntegrationRank, description: t.bookingToolIntegrationRankDescription },
    ];

    // Sort according to the current order in sortedVisibilityItems (by id)
    setSortedVisibilityItems((prev) => {
      // If prev is empty, just use newItems
      if (!prev || prev.length === 0) return newItems;
      // Otherwise, keep the current order but update the labels/descriptions
      return prev.map((oldItem) => newItems.find((ni) => ni.id === oldItem.id) || oldItem);
    });
  }, [currentLanguage]); // or [t] if t is memoized

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with language toggle */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: "#8b5cf6" }}>
            {t.header}
          </h1>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-violet-50 hover:border-violet-300 transition-all duration-200 flex items-center ml-auto"
            style={{ color: "#8b5cf6" }}
          >
            {currentLanguage === "en" ? "🇩🇪" : "🇬🇧"}
            <span className="ml-2">{t.switchLanguage}</span>
          </button>
        </div>
      </header>

      {/* Progress bar - updated to remove gap */}
      <div className="fixed top-[60px] left-0 right-0 h-1 bg-gray-200 z-10">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${((currentSection + 1) / sections.length) * 100}%`, backgroundColor: "#8b5cf6" }}
        ></div>
      </div>

      {/* Progress indicator - updated to remove gap */}
      <div className="fixed top-[61px] left-0 right-0 bg-white border-b border-gray-200 py-2 z-10">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {t.step} {currentSection + 1} {t.progressOf} {sections.length}
          </div>
          <div className="text-sm font-medium" style={{ color: "#8b5cf6" }}>
            {sections[currentSection].title}
          </div>
        </div>
      </div>

      {/* Main content - adjust top padding to account for the new header height */}
      <main className="pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4">
          {/* Disclaimer */}
          {!showThankYouPage && currentSection === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
              {t.disclaimer}
            </div>
          )}

          {/* Notifications */}
          {error && (
            <div ref={errorRef} className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && !showThankYouPage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{t.success}</div>
          )}

          {uploadingFiles && (
            <div className="mb-6 p-4 bg-purple-100 border border-purple-400 text-purple-700 rounded-lg">
              {t.uploadingFiles}
            </div>
          )}

          {/* Thank You Page or Form */}
          {showThankYouPage ? (
            <ThankYouPage language={currentLanguage} companyName={formData.name} />
          ) : (
            <form onSubmit={handleSubmit} ref={formRef} className="bg-white rounded-xl shadow-xl p-8">
              {renderSection()}
            </form>
          )}
        </div>
      </main>

      {/* Navigation buttons - hide when showing thank you page */}
      {!showThankYouPage && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4 z-10">
          <div className="max-w-3xl mx-auto flex justify-between">
            <button
              type="button"
              onClick={goToPreviousSection}
              disabled={currentSection === 0}
              className={`px-6 py-3 rounded-lg font-medium ${currentSection === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
            >
              {t.previous}
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={goToNextSection}
                className="px-6 py-3 text-white rounded-lg font-medium hover:bg-opacity-90"
                style={{ backgroundColor: "#8b5cf6" }}
              >
                {t.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium ${loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
              >
                {loading ? t.submitting : t.submit}
              </button>
            )}
          </div>
        </footer>
      )}

      {/* Direct link to realtimecolors.com is used instead of a modal */}

      {/* Add Vercel Analytics at the end of your component */}
      <Analytics />

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <style jsx global>{`
        input:focus-visible, 
        textarea:focus-visible, 
        select:focus-visible {
          border-color: #8b5cf6 !important;
          outline: none;
        }
        
        input[type="checkbox"]:checked {
          background-color: #8b5cf6;
          border-color: #8b5cf6;
        }
        
        .hover-purple:hover {
          border-color: #8b5cf6;
        }
        
        /* Ensure number inputs can't have negative values */
        input[type="number"] {
          -moz-appearance: textfield;
        }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  )
}

export default VisibilityFormulaForm


