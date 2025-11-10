'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTolgee } from '@tolgee/react';

const LanguageContext = createContext();

export { LanguageContext };

export const languages = {
  de: {
    welcome: {
      title: 'Willkommen zum Visibility Formula Fragebogen',
      description: 'Lass uns gemeinsam dein perfektes Branding erstellen.',
      start: 'Beginnen'
    },
    navigation: {
      back: 'Zurück',
      next: 'Weiter',
      submit: 'Formular absenden',
      submitting: 'Wird gesendet...'
    },
    nav: {
      services: "Leistungen",
      approach: "Unser Ansatz", 
      contact: "Kontakt",
      getStarted: "Jetzt starten",
      impressum: "Impressum",
      visibility: "Sichtbarkeits-Bundle",
      bookCall: 'Termin buchen'
    },
    hero: {
      title: "Deine Idee, live in 2 Wochen",
      subtitle: "Wir entwickeln deinen MVP in nur 14 Tagen – kostenfrei, bis du von den Ergebnissen begeistert bist.",
      cta: "Kostenloses Beratungsgespräch"
    },
    services: {
      title: "Unsere Rapid MVP Services",
      subtitle: "Maßgeschneiderte Lösungen, um deine Idee schneller als je zuvor zu verwirklichen",
      funding: {
        title: "Fördermittelberatung",
        description: "Wir unterstützen Startups bei der Beschaffung von staatlichen Fördermitteln zur Förderung ihres Wachstums und ihrer Entwicklung.",
        features: [
          "35.000€ staatliche Förderung",
          "Betreuung während des Antragsverfahrens", 
          "Unterstützung für Startups in Nordrhein-Westfalen"
        ]
      }
    },
    file: {
      dropzone: 'Klicken oder Datei hierher ziehen',
      browse: 'Durchsuchen',
      dragDrop: 'oder per Drag & Drop',
      maxSize: 'PNG, JPG, GIF bis zu 10MB'
    },
    success: {
      title: 'Vielen Dank!',
      message: 'Deine Antworten wurden erfolgreich übermittelt.'
    },
    agb: {
      title: "Allgemeine Geschäftsbedingungen (AGB)",
      sections: {
        section1: {
          title: "§1 Geltungsbereich und Anbieter",
          content: "Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen dem Kunden und RapidWorks – [vollständiger Unternehmensname], [Adresse], E-Mail: yannick.heeren@rapid-works.io, nachfolgend \"Anbieter\" genannt. Abweichende Bedingungen des Kunden gelten nur, wenn der Anbieter ausdrücklich schriftlich zustimmt."
        },
        section2: {
          title: "§2 Vertragsgegenstand",
          content: "Der Anbieter bietet digitale Dienstleistungen im Bereich Branding, Webdesign, Content Creation, UI/UX und digitale Marketinglösungen an. Der konkrete Leistungsumfang ergibt sich aus dem vom Kunden gewählten Angebot oder Paket. Die Umsetzung erfolgt digital. Physische Leistungen (z. B. Druck von Visitenkarten) sind nicht Bestandteil des Angebots, außer anders vereinbart."
        },
        section3: {
          title: "§3 Vertragsschluss",
          content: "Die Präsentation der Leistungen auf der Website stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Abgabe einer Anfrage. Der Vertrag kommt zustande, wenn der Anbieter dem Kunden eine schriftliche Auftragsbestätigung sendet oder mit der Leistungserbringung beginnt."
        },
        section4: {
          title: "§4 Preise und Zahlungsbedingungen",
          content: "Das Rapid Branding Paket kostet 999 €. Die Zahlung erfolgt im Voraus. Die Lieferung erfolgt innerhalb von 7 Werktagen nach Zahlungseingang. Nachträgliche Änderungen oder Erweiterungen an gelieferten Projektinhalte werden mit 40 €/Stunde berechnet und nur nach ausdrücklicher Zustimmung des Kunden durchgeführt."
        },
        section5: {
          title: "§5 Nutzungsrechte",
          content: "Mit vollständiger Zahlung erhält der Kunde ein einfaches, nicht übertragbares Nutzungsrecht an den im Rahmen des Projekts erstellten Inhalten. Alle gelieferten Dateien (z. B. Logos, Vorlagen, Layouts) werden in bearbeitbarem Format (z. B. SVG, Figma) übergeben. Die Weitergabe an Dritte oder kommerzielle Weiterverwendung über den vereinbarten Zweck hinaus bedarf der schriftlichen Zustimmung des Anbieters."
        },
        section6: {
          title: "§6 Haftung",
          content: "Der Anbieter haftet für Vorsatz und grobe Fahrlässigkeit. Für leichte Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten. Die Haftung ist der Höhe nach auf den vertragstypischen vorhersehbaren Schäden begrenzt. Eine Haftung für mittelbare Schäden, insbesondere entgangenen Gewinn oder Datenverlust, ist ausgeschlossen."
        },
        section7: {
          title: "§7 Datenschutz und Rechte der Betroffenen (DSGVO)",
          content: "Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG). Der Kunde hat das Recht auf: Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung. Bei Nutzung des Newsletter-Formulars wird die angegebene E-Mail-Adresse ausschließlich für den Versand von Informationen über Produkte und Dienstleistungen von RapidWorks verwendet und nicht an Dritte weitergegeben."
        },
        section8: {
          title: "§8 Einsatz von KI-Tools und Datenverarbeitung außerhalb der EU",
          content: "Zur Unterstützung kreativer Prozesse, Designautomatisierung und Texterstellung setzen wir teilweise automatisierte Systeme (sog. \"KI-Tools\") ein. Diese Tools werden datenschutzkonform eingesetzt. Bei der Dienstleistungserbringung durch Mitarbeiter außerhalb des Europäischen Wirtschaftsraums (EWR), insbesondere in Ghana, erbracht werden. Dabei werden geeignete Schutzmaßnahmen gemäß Art. 44 ff. DSGVO umgesetzt (z. B. Standardvertragsklauseln)."
        },
        section9: {
          title: "§9 Änderungen der AGB",
          content: "Der Anbieter ist berechtigt, diese AGB mit Wirkung für die Zukunft zu ändern. Kunden werden mindestens 14 Tage im Voraus über Änderungen informiert. Widerspricht der Kunde nicht innerhalb dieser Frist, gelten die Änderungen als akzeptiert."
        },
        section10: {
          title: "§10 Schlussbestimmungen",
          content: "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist der Sitz des Anbieters, sofern der Kunde Kaufmann oder juristische Person ist. Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt."
        }
      }
    },
    privacy: {
      title: "Datenschutzerklärung",
      sections: {
        section1: {
          title: "1. Allgemeine Hinweise",
          content: "Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und den Zweck der Verarbeitung personenbezogener Daten auf unserer Website www.rapid-works.io gemäß der Datenschutz-Grundverordnung (DSGVO)."
        },
        section2: {
          title: "2. Verantwortlicher",
          content: "Verantwortlich für die Datenverarbeitung ist:\nRapidWorks\nYannick Heeren\n(c/o RapidWorks – in Gründung)\nTulpenweg 24a\n52222 Stolberg\nDeutschland\nE-Mail: yannick.heeren@rapid-works.io"
        },
        section3: {
          title: "3. Erhebung und Verarbeitung personenbezogener Daten",
          content: "Wir verarbeiten personenbezogene Daten nur, wenn Sie uns diese im Rahmen Ihrer Anfrage, Buchung oder Nutzung unserer Dienste mitteilen. Dazu zählen z. B.:\n- Name und Nachname\n- E-Mail-Adresse (z. B. bei Newsletter-Anmeldung)\n- IP-Adresse\n- Nutzungsverhalten auf unserer Website"
        },
        section4: {
          title: "4. Zwecke der Datenverarbeitung",
          content: "Die Verarbeitung erfolgt zu folgenden Zwecken:\n- Zurverführungsstellung des Onlineangebotes\n- Kommunikation mit Nutzern\n- Versand von E-Mail-Newslettern (nur bei Einwilligung)\n- Analyse und Verbesserung unserer Website\n- Sicherheitsmaßnahmen"
        },
        section5: {
          title: "5. Rechtsgrundlagen",
          content: "Die Datenverarbeitung erfolgt auf Basis von Art. 6 Abs. 1 lit. a (Einwilligung), lit. b (Vertragserfüllung) und lit. f (berechtigtes Interesse) DSGVO."
        },
        section6: {
          title: "6. Verwendung von Cookies",
          content: "Unsere Website verwendet Cookies. Einige Cookies sind notwendig, andere helfen uns, unser Onlineangebot zu verbessern. Sie können Ihre Cookie-Einstellungen jederzeit anpassen. Mehr Informationen finden Sie im Cookie-Banner."
        },
        section7: {
          title: "7. Einsatz von Drittanbietern",
          content: "Wir nutzen folgende Drittanbieter:\n- Google Analytics (Analyse-Tool)\n- Google Fonts (lokal eingebunden)\n- OpenAI / KI-Tools für Automatisierung\n- ggf. Meta Pixel (Marketing)\n\nDiese Dienste können personenbezogene Daten verarbeiten. Die Nutzung erfolgt nur nach Ihrer Einwilligung."
        },
        section8: {
          title: "8. Newsletter & E-Mail-Kommunikation",
          content: "Wenn Sie sich für unseren Newsletter anmelden, verwenden wir Ihre E-Mail-Adresse ausschließlich, um Ihnen Informationen über unsere Produkte und Dienstleistungen zukommen zu lassen. Eine Abmeldung ist jederzeit über den entsprechenden Link in jeder E-Mail möglich."
        },
        section9: {
          title: "9. Datenübermittlung in Drittländer",
          content: "Ein Teil der Datenverarbeitung erfolgt durch Mitarbeiter in Ghana. Wir stellen sicher, dass geeignete Datenschutzmaßnahmen gemäß Art. 44 ff. DSGVO getroffen werden (z. B. Standardvertragsklauseln)."
        },
        section10: {
          title: "10. Ihre Rechte",
          content: "Sie haben das Recht auf:\n- Auskunft (Art. 15 DSGVO)\n- Berichtigung (Art. 16 DSGVO)\n- Löschung (Art. 17 DSGVO)\n- Einschränkung der Verarbeitung (Art. 18 DSGVO)\n- Datenübertragbarkeit (Art. 20 DSGVO)\n- Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)"
        },
        section11: {
          title: "11. Kontakt für Datenschutzanfragen",
          content: "Bei Fragen oder Anliegen zum Datenschutz wenden Sie sich bitte an:\nyannick.heeren@rapid-works.io"
        },
        section12: {
          title: "12. Aktualisierung dieser Datenschutzerklärung",
          content: "Diese Datenschutzerklärung kann bei Bedarf angepasst werden. Die jeweils aktuelle Version ist auf unserer Website einsehbar."
        }
      }
    },
    impressum: {
      title: "Impressum",
      accordingTo: "Angaben gemäß § 5 TMG:",
      companyInfo: {
        title: "Unternehmensangaben",
        name: "HappyStay UG",
        street: "Tulpenweg 24a",
        city: "52222 Stolberg",
        country: "Deutschland",
        email: "Email: contact@rapid-works.io",
        phone: "Tel: +49 (0) 157 823 244 53",
        managing: "Geschäftsführer: Yannick Heeren"
      },
      registration: {
        title: "Registereintrag",
        court: "Amtsgericht Aachen",
        number: "HRB 22303",
        vatId: "USt-IdNr.: DE321168712"
      },
      responsibility: {
        title: "Verantwortlich für den Inhalt",
        name: "Yannick Heeren",
        street: "Tulpenweg 24a",
        city: "52222 Stolberg"
      }
    },
    // Add more translations here
  },
  en: {
    welcome: {
      title: 'Welcome to the Visibility Formula Questionnaire',
      description: 'Let\'s create your perfect branding together.',
      start: 'Start'
    },
    navigation: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit Form',
      submitting: 'Submitting...'
    },
    nav: {
      services: "Services",
      approach: "Our Approach",
      contact: "Contact", 
      getStarted: "Get Started",
      impressum: "Legal Notice",
      visibility: "Visibility Bundle",
      bookCall: 'Book a Call'
    },
    hero: {
      title: "Your Idea, Live in 2 Weeks",
      subtitle: "Get your MVP free of charge, only pay when you are amazed by the result.",
      cta: "Book Your Free Consultation"
    },
    services: {
      title: "Our Services",
      subtitle: "Tailored solutions to launch your idea faster than ever",
      funding: {
        title: "Funding Guidance", 
        description: "We assist startups in securing government funding to support their growth and development.",
        features: [
          "35,000€ in government funding",
          "Guidance through the application process",
          "Support for startups in North Rhine-Westphalia"
        ]
      }
    },
    file: {
      dropzone: 'Click or drag file here',
      browse: 'Browse',
      dragDrop: 'or drag and drop',
      maxSize: 'PNG, JPG, GIF up to 10MB'
    },
    success: {
      title: 'Thank you!',
      message: 'Your answers have been successfully submitted.'
    },
    agb: {
      title: "Terms and Conditions (AGB)",
      sections: {
        section1: {
          title: "§1 Scope and Provider",
          content: "These General Terms and Conditions (AGB) apply to all contracts between the customer and RapidWorks – [full company name], [address], E-Mail: yannick.heeren@rapid-works.io, hereinafter referred to as \"Provider\". Deviating conditions of the customer only apply if the provider expressly agrees in writing."
        },
        section2: {
          title: "§2 Subject Matter of Contract",
          content: "The provider offers digital services in the areas of branding, web design, content creation, UI/UX and digital marketing solutions. The specific scope of services results from the offer or package selected by the customer. The implementation is digital. Physical services (e.g. printing of business cards) are not part of the offer, unless otherwise agreed."
        },
        section3: {
          title: "§3 Contract Formation",
          content: "The presentation of services on the website does not constitute a legally binding offer, but a non-binding invitation to submit an inquiry. The contract is concluded when the provider sends the customer a written order confirmation or begins with the service provision."
        },
        section4: {
          title: "§4 Prices and Payment Terms",
          content: "The Rapid Branding Package costs 999 €. Payment is made in advance. Delivery takes place within 7 working days after receipt of payment. Subsequent changes or extensions to delivered project content will be charged at 40 €/hour and only carried out after express consent of the customer."
        },
        section5: {
          title: "§5 Usage Rights",
          content: "Upon full payment, the customer receives a simple, non-transferable right of use to the content created within the project. All delivered files (e.g. logos, templates, layouts) are handed over in editable format (e.g. SVG, Figma). Transfer to third parties or commercial further use beyond the agreed purpose requires written consent of the provider."
        },
        section6: {
          title: "§6 Liability",
          content: "The provider is liable for intent and gross negligence. For slight negligence only in case of violation of essential contractual obligations. Liability is limited in amount to the contractually typical foreseeable damages. Liability for indirect damages, especially lost profits or data loss, is excluded."
        },
        section7: {
          title: "§7 Data Protection and Rights of Data Subjects (GDPR)",
          content: "The processing of personal data is carried out in accordance with the General Data Protection Regulation (GDPR) and the Federal Data Protection Act (BDSG). The customer has the right to: information, correction, deletion, restriction of processing, data portability and objection to processing. When using the newsletter form, the specified email address is used exclusively for sending information about products and services from RapidWorks and is not passed on to third parties."
        },
        section8: {
          title: "§8 Use of AI Tools and Data Processing Outside the EU",
          content: "To support creative processes, design automation and text creation, we partially use automated systems (so-called \"AI tools\"). These tools are used in compliance with data protection regulations. Some services are provided by employees outside the European Economic Area (EEA), particularly in Ghana. Appropriate protective measures are implemented in accordance with Art. 44 ff. GDPR (e.g. standard contractual clauses)."
        },
        section9: {
          title: "§9 Changes to the AGB",
          content: "The provider is entitled to change these AGB with effect for the future. Customers will be informed of changes at least 14 days in advance. If the customer does not object within this period, the changes are deemed accepted."
        },
        section10: {
          title: "§10 Final Provisions",
          content: "The law of the Federal Republic of Germany applies, excluding the UN Convention on Contracts for the International Sale of Goods. The place of jurisdiction is the registered office of the provider, provided the customer is a merchant or legal entity. Should a provision of these AGB be invalid, the validity of the remaining provisions remains unaffected."
        }
      }
    },
    privacy: {
      title: "Privacy Policy",
      sections: {
        section1: {
          title: "1. General Information",
          content: "The protection of your personal data is of particular concern to us. This privacy policy informs you about the type, scope and purpose of processing personal data on our website www.rapid-works.io in accordance with the General Data Protection Regulation (GDPR)."
        },
        section2: {
          title: "2. Responsible Party",
          content: "Responsible for data processing is:\nRapidWorks\nYannick Heeren\n(c/o RapidWorks – in foundation)\nTulpenweg 24a\n52222 Stolberg\nGermany\nE-Mail: yannick.heeren@rapid-works.io"
        },
        section3: {
          title: "3. Collection and Processing of Personal Data",
          content: "We only process personal data if you provide it to us in the context of your inquiry, booking or use of our services. This includes, for example:\n- First and last name\n- Email address (e.g. for newsletter registration)\n- IP address\n- Usage behavior on our website"
        },
        section4: {
          title: "4. Purposes of Data Processing",
          content: "Processing is carried out for the following purposes:\n- Provision of the online offering\n- Communication with users\n- Sending email newsletters (only with consent)\n- Analysis and improvement of our website\n- Security measures"
        },
        section5: {
          title: "5. Legal Basis",
          content: "Data processing is based on Art. 6 Para. 1 lit. a (consent), lit. b (contract fulfillment) and lit. f (legitimate interest) GDPR."
        },
        section6: {
          title: "6. Use of Cookies",
          content: "Our website uses cookies. Some cookies are necessary, others help us improve our online offering. You can adjust your cookie settings at any time. More information can be found in the cookie banner."
        },
        section7: {
          title: "7. Use of Third-Party Services",
          content: "We use the following third-party services:\n- Google Analytics (analysis tool)\n- Google Fonts (locally integrated)\n- OpenAI / AI tools for automation\n- possibly Meta Pixel (marketing)\n\nThese services may process personal data. Use only occurs with your consent."
        },
        section8: {
          title: "8. Newsletter & Email Communication",
          content: "If you sign up for our newsletter, we use your email address exclusively to send you information about our products and services. You can unsubscribe at any time via the corresponding link in each email."
        },
        section9: {
          title: "9. Data Transfer to Third Countries",
          content: "Part of the data processing is carried out by employees in Ghana. We ensure that appropriate data protection measures are taken in accordance with Art. 44 ff. GDPR (e.g. standard contractual clauses)."
        },
        section10: {
          title: "10. Your Rights",
          content: "You have the right to:\n- Information (Art. 15 GDPR)\n- Correction (Art. 16 GDPR)\n- Deletion (Art. 17 GDPR)\n- Restriction of processing (Art. 18 GDPR)\n- Data portability (Art. 20 GDPR)\n- Objection to processing (Art. 21 GDPR)"
        },
        section11: {
          title: "11. Contact for Data Protection Inquiries",
          content: "For questions or concerns about data protection, please contact:\nyannick.heeren@rapid-works.io"
        },
        section12: {
          title: "12. Update of this Privacy Policy",
          content: "This privacy policy may be updated as needed. The current version can be viewed on our website."
        }
      }
    },
    impressum: {
      title: "Legal Notice",
      accordingTo: "Information pursuant to § 5 TMG:",
      companyInfo: {
        title: "Company Information",
        name: "HappyStay UG",
        street: "Tulpenweg 24a",
        city: "52222 Stolberg",
        country: "Germany",
        email: "Email: contact@rapid-works.io",
        phone: "Phone: +49 (0) 157 823 244 53",
        managing: "Managing Director: Yannick Heeren"
      },
      registration: {
        title: "Registry Entry",
        court: "Amtsgericht Aachen",
        number: "HRB 22303",
        vatId: "VAT ID: DE321168712"
      },
      responsibility: {
        title: "Responsible for Content",
        name: "Yannick Heeren",
        street: "Tulpenweg 24a",
        city: "52222 Stolberg"
      }
    },
    // Add more translations here
  }
};

export const LanguageProvider = ({ children }) => {
  const tolgee = useTolgee(['language']);

  // Initialize from localStorage or default to 'de'
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return saved || 'de';
    }
    return 'de';
  });

  // Sync Tolgee language with local state
  useEffect(() => {
    if (tolgee && tolgee.getLanguage() !== language) {
      tolgee.changeLanguage(language);
    }
  }, [language, tolgee]);

  // Persist language changes to localStorage and update Tolgee
  const handleSetLanguage = (newLanguage) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
    if (tolgee) {
      tolgee.changeLanguage(newLanguage);
    }
  };

  // Listen for storage changes (when language is changed in another tab/window)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e) => {
      if (e.key === 'language' && e.newValue && e.newValue !== language) {
        setLanguageState(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [language]);

  const value = {
    language: language,
    setLanguage: handleSetLanguage,
    t: (key) => {
      const keys = key.split('.');
      return keys.reduce((obj, k) => obj?.[k], languages[language]) || key;
    },
    translate: (key) => {
      const keys = key.split('.');
      return keys.reduce((obj, k) => obj?.[k], languages[language]) || key;
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 