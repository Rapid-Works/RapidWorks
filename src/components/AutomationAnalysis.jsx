'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  BriefcaseBusiness,
  Cog,
  LifeBuoy,
  Wallet,
  Users as UsersIcon,
  BarChart3 as BarChartIcon,
  Shield,
  ArrowRightCircle,
  ArrowLeftCircle
} from 'lucide-react';
import RadarChart from './RadarChart';

const automationLevels = [
  { value: 'manual', label: 'Manuell', description: 'Ich verlasse mich rein auf mein Bauchgefühl.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Ich habe vereinzelte Daten, aber nur grobe Zuordnungen.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ich weiß systematisch, welcher Auftrag aus welcher Quelle stammt.' },
  { value: 'automated', label: 'Automatisiert', description: 'Wir tracken den gesamten Kundenweg automatisch inklusive ROI.' },
  { value: 'intelligent', label: 'Intelligent', description: 'KI optimiert Budgets automatisch anhand des Kanal-ROI.' }
];

const leadLevels = [
  { value: 'manual', label: 'Manuell', description: 'Leads werden nicht aktiv nachverfolgt.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Leads landen in einer manuell geführten Liste.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ein CRM versendet Bestätigungen und erstellt Follow-ups.' },
  { value: 'automated', label: 'Automatisiert', description: 'Automatisierte E-Mail-Funnel halten Leads warm.' },
  { value: 'intelligent', label: 'Intelligent', description: 'KI passt Funnel-Inhalte dynamisch an das Nutzerverhalten an.' }
];

const contentLevels = [
  { value: 'manual', label: 'Manuell', description: 'Content entsteht komplett händisch ohne Prozesse.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Wir nutzen Vorlagen und einen Redaktionsplan.' },
  { value: 'connected', label: 'Vernetzt', description: 'KI-Tools unterstützen bei Optimierung und Übersetzung.' },
  { value: 'automated', label: 'Automatisiert', description: 'KI generiert Rohentwürfe, wir verfeinern nur noch.' },
  { value: 'intelligent', label: 'Intelligent', description: 'KI schlägt proaktiv Trends und personalisierte Inhalte vor.' }
];

const pipelineLevels = [
  { value: 'manual', label: 'Manuell', description: 'Deals werden im Kopf oder per Zuruf verwaltet.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Eine Liste oder ein Kanban-Board wird manuell gepflegt.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ein CRM sammelt alle Deals zentral.' },
  { value: 'automated', label: 'Automatisiert', description: 'CRM erstellt automatisch Follow-up-Aufgaben.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI priorisiert Deals anhand von Lead-Scoring.' }
];

const offeringLevels = [
  { value: 'manual', label: 'Manuell', description: 'Angebote werden vollständig in Word/Excel gebaut.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Wir kopieren Textbausteine und Preise in Vorlagen.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ein Angebots-Tool greift auf einen zentralen Katalog zu.' },
  { value: 'automated', label: 'Automatisiert', description: 'CPQ-Systeme generieren Angebote automatisch aus Bausteinen.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI erstellt Angebotsentwürfe basierend auf CRM-Daten.' }
];

const controllingLevels = [
  { value: 'manual', label: 'Manuell', description: 'Kein Reporting – Kontoauszug und Bauchgefühl.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Excel-Auswertungen werden manuell erstellt.' },
  { value: 'connected', label: 'Vernetzt', description: 'Live-Dashboards im CRM zeigen aktuelle Kennzahlen.' },
  { value: 'automated', label: 'Automatisiert', description: 'Automatische Reports informieren über KPIs & Abweichungen.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI erstellt Forecasts und schlägt Maßnahmen vor.' }
];

const kickoffLevels = [
  { value: 'manual', label: 'Manuell', description: 'Aufträge werden per Zuruf oder E-Mail übergeben.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Projekte werden manuell in einem Tool angelegt.' },
  { value: 'connected', label: 'Vernetzt', description: 'Projektanlage erfolgt automatisch bei gewonnenem Deal.' },
  { value: 'automated', label: 'Automatisiert', description: 'Standard-Aufgaben werden automatisch zugewiesen.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'Projektplan wird automatisch erstellt und Teams proaktiv informiert.' }
];

const monitoringLevels = [
  { value: 'manual', label: 'Manuell', description: 'Status wird manuell abgefragt; keine Live-Übersicht.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Zeiterfassung erfolgt separat und wird manuell abgeglichen.' },
  { value: 'connected', label: 'Vernetzt', description: 'Zeit- und Budgetverbrauch sind im Tool live sichtbar.' },
  { value: 'automated', label: 'Automatisiert', description: 'Alarme warnen automatisch bei Budget- oder Terminrisiken.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI erkennt Engpässe frühzeitig und schlägt Gegenmaßnahmen vor.' }
];

const customerUpdateLevels = [
  { value: 'manual', label: 'Manuell', description: 'Kunden melden sich bei Bedarf – es gibt keine regelmäßigen Updates.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Updates werden auf Nachfrage per E-Mail verschickt.' },
  { value: 'connected', label: 'Vernetzt', description: 'Kunden haben Lesezugriff auf unser Projekt-Tool.' },
  { value: 'automated', label: 'Automatisiert', description: 'Status-Updates werden automatisch bei Meilensteinen versendet.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'Ein KI-Assistent beantwortet Standardanfragen rund um die Uhr.' }
];

const supportIntakeLevels = [
  { value: 'manual', label: 'Manuell', description: 'Anfragen kommen per Zuruf/Telefon und werden nicht zentral erfasst.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'E-Mails gehen an eine Support-Adresse und werden manuell organisiert.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ein Ticket-System erfasst und verteilt Anfragen.' },
  { value: 'automated', label: 'Automatisiert', description: 'Tickets werden automatisch erstellt und zugeordnet.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI bewertet Anfragen nach Dringlichkeit und eskaliert automatisch.' }
];

const supportEfficiencyLevels = [
  { value: 'manual', label: 'Manuell', description: 'Lösungen werden jedes Mal neu gesucht oder erfragt.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Eine manuelle FAQ-Liste (z.B. Word/OneNote) wird durchsucht.' },
  { value: 'connected', label: 'Vernetzt', description: 'Eine durchsuchbare Wissensdatenbank bündelt Lösungen.' },
  { value: 'automated', label: 'Automatisiert', description: 'Das Ticket-System schlägt passende Wissensartikel automatisch vor.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'Ein KI-Chatbot beantwortet die häufigsten Fragen selbstständig.' }
];

const supportSatisfactionLevels = [
  { value: 'manual', label: 'Manuell', description: 'Zufriedenheit wird nur informell abgefragt.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Feedback wird gelegentlich manuell per E-Mail erbeten.' },
  { value: 'connected', label: 'Vernetzt', description: 'Automatische Umfragen nach Tickets/Projekten.' },
  { value: 'automated', label: 'Automatisiert', description: 'Feedback ist fester Workflow-Bestandteil.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI analysiert Feedback und warnt bei negativen Trends.' }
];

const invoicingLevels = [
  { value: 'manual', label: 'Manuell', description: 'Rechnungen werden in Word/Excel erstellt und manuell versendet.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Online-Tool wird genutzt, Positionen werden aber manuell erfasst.' },
  { value: 'connected', label: 'Vernetzt', description: 'Rechnungstool ist mit Zeiterfassung/PM verbunden.' },
  { value: 'automated', label: 'Automatisiert', description: 'Rechnungsentwürfe entstehen automatisch nach Projektabschluss.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'Wiederkehrende Rechnungen und variable Beträge werden automatisch angepasst.' }
];

const paymentReconciliationLevels = [
  { value: 'manual', label: 'Manuell', description: 'Kontoauszüge werden manuell mit offenen Rechnungen abgeglichen.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Rechnungstool vorhanden, Zahlungseingänge werden manuell verbucht.' },
  { value: 'connected', label: 'Vernetzt', description: 'Rechnungstool und Bank sind verbunden – Abgleich automatisch.' },
  { value: 'automated', label: 'Automatisiert', description: 'Automatische Mahnläufe erinnern Kunden an Zahlungen.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI analysiert Zahlungsverhalten und schlägt Mahnstrategien vor.' }
];

const expenseProcessingLevels = [
  { value: 'manual', label: 'Manuell', description: 'Belege werden gesammelt und monatlich an den Steuerberater übergeben.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Belege werden digital erfasst und hochgeladen.' },
  { value: 'connected', label: 'Vernetzt', description: 'Rechnungen werden automatisch aus E-Mails/Portalen importiert.' },
  { value: 'automated', label: 'Automatisiert', description: 'Belege werden via OCR/KI ausgelesen und kategorisiert.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI erstellt Liquiditätsplanung und warnt bei Budgetüberschreitungen.' }
];

const recruitingLevels = [
  { value: 'manual', label: 'Manuell', description: 'Bewerbungen landen im Postfach und werden manuell bearbeitet.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Bewerberstatus wird in einer Liste oder einem Board gepflegt.' },
  { value: 'connected', label: 'Vernetzt', description: 'ATS-System erfasst Bewerbungen automatisch und sendet Bestätigungen.' },
  { value: 'automated', label: 'Automatisiert', description: 'Absagen/Einladungen und Terminplanung laufen automatisch.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI analysiert Bewerbungen und erstellt ein Ranking der Top-Kandidaten.' }
];

const onboardingLevels = [
  { value: 'manual', label: 'Manuell', description: 'Onboarding erfolgt individuell und manuell am ersten Tag.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Eine digitale Checkliste wird für jeden neuen Mitarbeiter abgearbeitet.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ein HR-Tool führt Mitarbeitende digital durch das Onboarding.' },
  { value: 'automated', label: 'Automatisiert', description: 'HR-System stößt automatisch Workflows für IT & Schulungen an.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'Onboarding-Programm passt sich automatisch an und holt Feedback ein.' }
];

const timeTrackingLevels = [
  { value: 'manual', label: 'Manuell', description: 'Zeiten/Abwesenheiten werden formlos oder gar nicht erfasst.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Zeiten werden in Excel oder einfachen Tools festgehalten.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ein HR-Tool erfasst Zeiten und Urlaubsanträge zentral.' },
  { value: 'automated', label: 'Automatisiert', description: 'Überstunden/Abwesenheiten werden automatisch berechnet und übergeben.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI erkennt Überlastungstrends und warnt proaktiv.' }
];

const kpiLevels = [
  { value: 'manual', label: 'Manuell', description: 'Entscheidungen basieren auf Bauchgefühl und Kontoauszügen.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'KPIs werden bei Bedarf manuell in Excel aufbereitet.' },
  { value: 'connected', label: 'Vernetzt', description: 'Dashboards zeigen live die wichtigsten Kennzahlen.' },
  { value: 'automated', label: 'Automatisiert', description: 'Ein Cockpit sammelt automatisch Daten aus mehreren Systemen.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI überwacht KPIs und schlägt Gegenmaßnahmen vor.' }
];

const dataIntegrationLevels = [
  { value: 'manual', label: 'Manuell', description: 'Daten sind isoliert und kaum verknüpfbar.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Daten werden manuell exportiert und zusammengeführt.' },
  { value: 'connected', label: 'Vernetzt', description: 'Zentrale Datenbank/Data Warehouse bündelt Informationen.' },
  { value: 'automated', label: 'Automatisiert', description: 'Dashboards greifen automatisch auf die zentralen Daten zu.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI erkennt Zusammenhänge und Ineffizienzen zwischen Datenströmen.' }
];

const strategicPlanningLevels = [
  { value: 'manual', label: 'Manuell', description: 'Strategieentscheidungen entstehen spontan und reaktiv.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Vergangenheitsdaten dienen als alleinige Entscheidungsgrundlage.' },
  { value: 'connected', label: 'Vernetzt', description: 'Live-Daten fließen in operative Entscheidungen ein.' },
  { value: 'automated', label: 'Automatisiert', description: 'Was-wäre-wenn-Simulationen unterstützen strategische Planung.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'KI prognostiziert Trends und Nachfrage für strategische Entscheidungen.' }
];

const backupLevels = [
  { value: 'level0', label: 'Akutes Risiko', description: 'Es gibt keine Backups – Totalausfall wäre existenzbedrohend.' },
  { value: 'manual', label: 'Manuell', description: 'Backups werden gelegentlich manuell auf externe Datenträger kopiert.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Wir arbeiten hauptsächlich in Cloud-Speichern (Live-Backup).' },
  { value: 'connected', label: 'Vernetzt', description: 'Automatisierte Backups (z.B. Cloud/NAS) erstellen tägliche Snapshots.' },
  { value: 'automated', label: 'Automatisiert', description: 'Backups werden automatisch geprüft und off-site abgelegt.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'Echtzeit-Sicherungen ganzer Systeme ermöglichen Wiederherstellung in Minuten.' }
];

const passwordLevels = [
  { value: 'level0', label: 'Akutes Risiko', description: 'Gleiche/simple Passwörter, teilweise geteilt – hohe Gefahr.' },
  { value: 'manual', label: 'Manuell', description: 'Jede Person verwaltet Passwörter selbst (z.B. Textdatei/Browserspeicher).' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Individuelle Passwort-Manager, aber keine Teamrichtlinie.' },
  { value: 'connected', label: 'Vernetzt', description: 'Ein zentraler Passwort-Manager wird im Team genutzt.' },
  { value: 'automated', label: 'Automatisiert', description: 'Passwortrichtlinien und 2FA sind technisch erzwungen.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'Single Sign-On (SSO) steuert Zugänge zentral und sicher.' }
];

const cyberDefenseLevels = [
  { value: 'level0', label: 'Akutes Risiko', description: 'Standard-Virenschutz reicht – Mitarbeitende sollen aufpassen.' },
  { value: 'manual', label: 'Manuell', description: 'Gekaufter Virenscanner + mündliche Ermahnungen.' },
  { value: 'digitalized', label: 'Digitalisiert', description: 'Professionelle Firewall und gemanagte Endpoint-Security.' },
  { value: 'connected', label: 'Vernetzt', description: 'Regelmäßige Security-Awareness-Schulungen und Phishing-Tests.' },
  { value: 'automated', label: 'Automatisiert', description: 'E-Mail-Filter und Patch-Management sichern Systeme automatisch.' },
  { value: 'adaptive', label: 'Adaptiv', description: 'SIEM/SOAR überwacht Netzwerkverkehr per KI und blockiert Angriffe sofort.' }
];

const MATURITY_SCORES = {
  level0: 0,
  manual: 1,
  digitalized: 2,
  connected: 3,
  automated: 4,
  adaptive: 5,
  intelligent: 5
};

const SECTION_CONFIGS = [
  {
    id: 'marketing',
    label: 'Sektion 1 · Marketing & Leads',
    icon: Sparkles,
    title: 'Sektion 1: Marketing & Lead-Generierung',
    intro:
      '“Super, lass uns starten. Im ersten Schritt schauen wir uns an, wie dein Unternehmen planbar neue Kunden gewinnt. Beantworte die folgenden Fragen einfach aus dem Bauch heraus – es geht darum, Potenziale zu entdecken.”',
    questions: [
      {
        field: 'marketingTracking',
        title: 'Frage 1.1: Datenerfassung & Messbarkeit',
        description: 'Wie gut weißt du, welche deiner Marketing-Aktivitäten dir zahlende Kunden bringen?',
        options: automationLevels
      },
      {
        field: 'leadFollowUp',
        title: 'Frage 1.2: Lead-Management & Follow-up',
        description: 'Was passiert, wenn sich Interessenten melden, aber nicht sofort kaufen?',
        options: leadLevels
      },
      {
        field: 'contentCreation',
        title: 'Frage 1.3: Content & KI-Nutzung',
        description: 'Wie entsteht euer Marketing-Content aktuell?',
        options: contentLevels
      }
    ]
  },
  {
    id: 'sales',
    label: 'Sektion 2 · Vertrieb',
    icon: BriefcaseBusiness,
    title: 'Sektion 2: Vertrieb',
    intro:
      '“Stark! Jetzt, wo wir wissen, wie du Leads generierst, schauen wir uns an, wie du diese Interessenten in zahlende Kunden verwandelst.”',
    questions: [
      {
        field: 'salesPipeline',
        title: 'Frage 2.1: Pipeline-Management',
        description: 'Wie behältst du den Überblick über deine Verkaufschancen?',
        options: pipelineLevels
      },
      {
        field: 'offeringCreation',
        title: 'Frage 2.2: Angebotserstellung',
        description: 'Wie aufwendig ist es, ein Angebot zu erstellen?',
        options: offeringLevels
      },
      {
        field: 'salesControlling',
        title: 'Frage 2.3: Vertriebs-Controlling',
        description: 'Wie misst und prognostizierst du Vertriebserfolg?',
        options: controllingLevels
      }
    ]
  },
  {
    id: 'operations',
    label: 'Sektion 3 · Auftragsabwicklung',
    icon: Cog,
    title: 'Sektion 3: Auftragsabwicklung',
    intro:
      '“Top, der Kunde ist gewonnen. Jetzt geht es an die eigentliche Arbeit: die Umsetzung des Auftrags. Wie effizient ist dein Maschinenraum?”',
    questions: [
      {
        field: 'projectKickoff',
        title: 'Frage 3.1: Projekt-Kickoff & Setup',
        description: 'Wie wird ein gewonnener Auftrag zu einem aktiven Projekt?',
        options: kickoffLevels
      },
      {
        field: 'projectMonitoring',
        title: 'Frage 3.2: Monitoring von Zeit & Budget',
        description: 'Wie überwachst du Fortschritt und Budget deiner Projekte?',
        options: monitoringLevels
      },
      {
        field: 'customerUpdates',
        title: 'Frage 3.3: Einbindung des Kunden & Status-Updates',
        description: 'Wie bleiben Kunden während des Projekts auf dem Laufenden?',
        options: customerUpdateLevels
      }
    ]
  },
  {
    id: 'support',
    label: 'Sektion 4 · Kundenservice',
    icon: LifeBuoy,
    title: 'Sektion 4: Kundenservice (Support)',
    intro:
      '“Großartig. Das Projekt ist abgeschlossen. Aber was passiert danach? Schauen wir uns an, wie du deine Bestandskunden betreust und Anfragen bearbeitest.”',
    questions: [
      {
        field: 'supportIntake',
        title: 'Frage 4.1: Erfassung von Support-Anfragen',
        description: 'Wie erreichen dich Kunden bei Fragen oder Problemen?',
        options: supportIntakeLevels
      },
      {
        field: 'supportEfficiency',
        title: 'Frage 4.2: Effizienz der Problemlösung',
        description: 'Wie schnell findet dein Team Lösungen für wiederkehrende Fragen?',
        options: supportEfficiencyLevels
      },
      {
        field: 'supportSatisfaction',
        title: 'Frage 4.3: Messung der Kundenzufriedenheit',
        description: 'Wie systematisch misst du Kundenzufriedenheit nach Support-Fällen?',
        options: supportSatisfactionLevels
      }
    ]
  },
  {
    id: 'finance',
    label: 'Sektion 5 · Finanzen & Buchhaltung',
    icon: Wallet,
    title: 'Sektion 5: Finanzen & Buchhaltung',
    intro:
      '“Fast geschafft! Jetzt wird es existenziell: das Geld. Ein digitalisierter Finanzprozess spart Zeit und schafft Transparenz über deine Liquidität.”',
    questions: [
      {
        field: 'invoicingProcess',
        title: 'Frage 5.1: Rechnungsstellung',
        description: 'Wie erstellst und versendest du Rechnungen?',
        options: invoicingLevels
      },
      {
        field: 'paymentTracking',
        title: 'Frage 5.2: Zahlungsabgleich & Mahnwesen',
        description: 'Wie behältst du den Überblick über offene Rechnungen?',
        options: paymentReconciliationLevels
      },
      {
        field: 'expenseProcessing',
        title: 'Frage 5.3: Belegverarbeitung (Eingangsrechnungen)',
        description: 'Wie verarbeitet ihr eure Eingangsrechnungen?',
        options: expenseProcessingLevels
      }
    ]
  },
  {
    id: 'hr',
    label: 'Sektion 6 · Personal',
    icon: UsersIcon,
    title: 'Sektion 6: Personal (HR)',
    intro:
      '“Gute Finanzen sind die eine Hälfte, gute Mitarbeitende die andere. Lass uns ansehen, wie du dein Team findest, verwaltest und entwickelst.”',
    questions: [
      {
        field: 'hrRecruiting',
        title: 'Frage 6.1: Recruiting & Bewerbermanagement',
        description: 'Wie läuft euer Bewerbermanagement?',
        options: recruitingLevels
      },
      {
        field: 'hrOnboarding',
        title: 'Frage 6.2: Mitarbeiter-Onboarding',
        description: 'Was passiert am ersten Arbeitstag einer neuen Kollegin/eines neuen Kollegen?',
        options: onboardingLevels
      },
      {
        field: 'hrTimeTracking',
        title: 'Frage 6.3: Verwaltung (Zeiterfassung & Abwesenheit)',
        description: 'Wie verwaltest du Arbeitszeiten, Urlaubstage und Krankmeldungen?',
        options: timeTrackingLevels
      }
    ]
  },
  {
    id: 'management',
    label: 'Sektion 7 · Management & Datenanalyse',
    icon: BarChartIcon,
    title: 'Sektion 7: Management & Datenanalyse',
    intro:
      '“Du bist der Kapitän. Aber steuerst du dein Schiff mit Bauchgefühl oder mit einem Live-Radar? Lass uns ansehen, wie du Entscheidungen triffst.”',
    questions: [
      {
        field: 'kpiTracking',
        title: 'Frage 7.1: Performance-Messung (KPIs)',
        description: 'Wie misst du den Erfolg und die Gesundheit deines Unternehmens?',
        options: kpiLevels
      },
      {
        field: 'dataIntegration',
        title: 'Frage 7.2: Datenintegration',
        description: 'Wie leicht lassen sich Daten aus unterschiedlichen Abteilungen kombinieren?',
        options: dataIntegrationLevels
      },
      {
        field: 'strategicPlanning',
        title: 'Frage 7.3: Strategische Planung',
        description: 'Wie triffst du datenbasierte Entscheidungen für die Zukunft?',
        options: strategicPlanningLevels
      }
    ]
  },
  {
    id: 'itSecurity',
    label: 'Sektion 8 · IT & Sicherheit',
    icon: Shield,
    title: 'Sektion 8: IT & Sicherheit',
    intro:
      '“Letzter Schritt, aber der wichtigste: das Fundament. Eine unsichere IT ist wie ein Haus ohne Schloss. Lass uns prüfen, wie sicher deine digitalen Werte sind.”',
    questions: [
      {
        field: 'itBackup',
        title: 'Frage 8.1: Datensicherung (Backup-Strategie)',
        description: 'Wie sicher sind deine kritischen Firmendaten vor Totalverlust geschützt?',
        options: backupLevels
      },
      {
        field: 'itAccess',
        title: 'Frage 8.2: Zugriff & Passwort-Management',
        description: 'Wie verwaltet ihr Team-Zugänge zu euren Tools?',
        options: passwordLevels
      },
      {
        field: 'itDefense',
        title: 'Frage 8.3: Schutz vor Cyberangriffen',
        description: 'Wie schützt du dein Unternehmen aktiv vor Angriffen?',
        options: cyberDefenseLevels
      }
    ]
  }
];

const INITIAL_FORM_STATE = SECTION_CONFIGS.reduce((acc, section) => {
  section.questions.forEach((question) => {
    acc[question.field] = '';
  });
  return acc;
}, {});

const MAX_SCORE = 5;

const AutomationAnalysis = () => {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [activeSection, setActiveSection] = useState(SECTION_CONFIGS[0].id);
  const [isLoaded, setIsLoaded] = useState(false);
  const headerRef = useRef(null);

  // Load persisted data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      try {
        const savedFormState = localStorage.getItem('automation_analysis_formState');
        const savedActiveSection = localStorage.getItem('automation_analysis_activeSection');
        
        if (savedFormState) {
          const parsedFormState = JSON.parse(savedFormState);
          setFormState(parsedFormState);
        }
        
        if (savedActiveSection) {
          setActiveSection(savedActiveSection);
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading persisted data:', error);
        setIsLoaded(true);
      }
    }
  }, [isLoaded]);

  // Save form state to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try {
        localStorage.setItem('automation_analysis_formState', JSON.stringify(formState));
      } catch (error) {
        console.error('Error saving form state:', error);
      }
    }
  }, [formState, isLoaded]);

  // Save active section to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try {
        localStorage.setItem('automation_analysis_activeSection', activeSection);
      } catch (error) {
        console.error('Error saving active section:', error);
      }
    }
  }, [activeSection, isLoaded]);

  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (headerRef.current) {
          const elementTop = headerRef.current.getBoundingClientRect().top + window.pageYOffset;
          const offset = 100;
          window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
        } else if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    });
  };

  const handleRadioChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const getQuestionScore = (value) => {
    if (!value) return null;
    return MATURITY_SCORES[value] ?? null;
  };

  const getSectionScore = (sectionId) => {
    const section = SECTION_CONFIGS.find((cfg) => cfg.id === sectionId);
    if (!section) return null;
    const scores = section.questions
      .map((question) => getQuestionScore(formState[question.field]))
      .filter((score) => score !== null);

    if (!scores.length) return null;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const radarData = SECTION_CONFIGS.map((section) => {
    const score = getSectionScore(section.id);
    return {
      label: section.label.split('·')[1]?.trim() || section.label,
      value: score !== null ? parseFloat(score.toFixed(2)) : 0,
      max: MAX_SCORE,
      muted: score === null
    };
  });

  const radarPreviewData = radarData.map((item, index) => {
    if (index <= 3) {
      return item;
    }
    return { ...item, value: 0, muted: true };
  });

  // Create tabs array including chart tabs
  const allTabs = [
    ...SECTION_CONFIGS,
    {
      id: 'preview-chart',
      label: 'Zwischenstand · Sektion 4',
      icon: BarChartIcon,
      title: 'Zwischenstand nach Sektion 4',
      isChart: true
    },
    {
      id: 'results-chart',
      label: 'Ergebnisse · Analyse',
      icon: BarChartIcon,
      title: 'Analyse abgeschlossen',
      isChart: true
    }
  ];

  const currentTab = allTabs.find((tab) => tab.id === activeSection);
  const currentSection = SECTION_CONFIGS.find((section) => section.id === activeSection);
  const currentIndex = SECTION_CONFIGS.findIndex((section) => section.id === activeSection);
  const nextSection =
    currentIndex >= 0 && currentIndex < SECTION_CONFIGS.length - 1
      ? SECTION_CONFIGS[currentIndex + 1]
      : null;
  
  const getPreviousSection = () => {
    if (activeSection === 'preview-chart') {
      return 'support'; // Go back to section 4
    }
    if (activeSection === 'results-chart') {
      return SECTION_CONFIGS[SECTION_CONFIGS.length - 1]?.id || null; // Go back to last section
    }
    if (currentIndex > 0) {
      return SECTION_CONFIGS[currentIndex - 1]?.id || null;
    }
    return null;
  };

  const previousSection = getPreviousSection();
  
  const handlePreviousSection = () => {
    if (previousSection) {
      setActiveSection(previousSection);
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (headerRef.current) {
            const elementTop = headerRef.current.getBoundingClientRect().top + window.pageYOffset;
            const offset = 100;
            window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
          }
        }, 150);
      });
    }
  };

  const handleNextSection = () => {
    if (nextSection) {
      // If we just finished section 4 (support), go to preview chart tab
      if (currentSection?.id === 'support') {
        setActiveSection('preview-chart');
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (headerRef.current) {
              const elementTop = headerRef.current.getBoundingClientRect().top + window.pageYOffset;
              const offset = 100;
              window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
            }
          }, 150);
        });
        return;
      }
      
      setActiveSection(nextSection.id);
      // Scroll to header after section change
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (headerRef.current) {
            const elementTop = headerRef.current.getBoundingClientRect().top + window.pageYOffset;
            const offset = 100; // Offset for any fixed headers
            window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
          }
        }, 150);
      });
    } else {
      // Go to final results chart tab
      setActiveSection('results-chart');
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (headerRef.current) {
            const elementTop = headerRef.current.getBoundingClientRect().top + window.pageYOffset;
            const offset = 100;
            window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
          }
        }, 150);
      });
    }
  };

  const renderRadioQuestion = (question, IconComponent) => (
    <div key={question.field} className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-full bg-purple-100 p-3 text-purple-600">
          <IconComponent className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{question.description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {question.options.map((option) => {
          const selected = formState[question.field] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleRadioChange(question.field, option.value)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                selected
                  ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50'
              }`}
            >
              <span className="flex flex-1 flex-wrap items-baseline gap-2 pr-6">
                <span className="font-semibold text-gray-900">{option.label}</span>
                <span className="text-gray-600">{option.description}</span>
              </span>
              <span
                className={`inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-xs ${
                  selected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-300 text-transparent'
                }`}
              >
                •
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const nextButtonLabel = nextSection
    ? `Weiter zu ${nextSection.label.split('·')[0]?.trim() || nextSection.label}`
    : 'Ergebnisse anzeigen';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pb-24 pt-12 lg:pt-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header ref={headerRef} className="rounded-3xl bg-white/70 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
            Automation Analysis
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {currentTab?.title ?? currentSection?.title ?? 'Automation Analysis'}
          </h1>
            <p className="text-sm leading-relaxed text-gray-600">
              {currentSection?.intro ??
                (activeSection === 'preview-chart' || activeSection === 'results-chart'
                  ? ''
                  : 'Beantworte die folgenden Fragen, um deine Automatisierungs-Potenziale sichtbar zu machen.')}
          </p>
        </div>
        </header>

        <nav className="relative w-full overflow-x-auto pb-2">
          <div className="flex min-w-full gap-3 rounded-3xl bg-white/80 p-3 shadow-sm backdrop-blur">
            {allTabs.map((tab) => {
              const isActive = tab.id === activeSection;
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectSection(tab.id)}
                  className={`group relative flex min-w-[190px] items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'z-10 border-purple-500 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'z-0 border-transparent bg-white text-gray-600 hover:z-20 hover:border-purple-200 hover:bg-purple-50 hover:shadow-md'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                      isActive
                        ? 'border-white/30 bg-white/20 text-white'
                        : 'border-purple-100 bg-purple-50 text-purple-500 group-hover:border-purple-200 group-hover:bg-purple-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {isActive && <span className="absolute inset-x-4 bottom-2 h-[3px] rounded-full bg-white/80" />}
                </button>
              );
            })}
            </div>
        </nav>

        {activeSection === 'preview-chart' && (
          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">Zwischenstand nach Sektion 4</h2>
              <p className="mt-2 text-sm text-gray-600">
                Die ersten vier Bereiche sind nun bewertet. Die übrigen Segmente bleiben ausgegraut, bis du sie ebenfalls ausfüllst.
              </p>
              <div className="mt-8 flex justify-center">
                <RadarChart data={radarPreviewData} />
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePreviousSection}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
                >
                  <ArrowLeftCircle className="h-4 w-4" />
                  Zurück zu Sektion 4
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('finance');
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        if (headerRef.current) {
                          const elementTop = headerRef.current.getBoundingClientRect().top + window.pageYOffset;
                          const offset = 100;
                          window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
                        }
                      }, 150);
                    });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Weiter zu Sektion 5
                  <ArrowRightCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'results-chart' && (
          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 lg:p-10 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900">Analyse abgeschlossen</h2>
              <p className="mt-2 text-sm text-gray-600">
                Hier siehst du deinen aktuellen Automatisierungs-Status über alle Bereiche hinweg.
              </p>
              <div className="mt-8 flex justify-center">
                <RadarChart data={radarData} />
              </div>
              <div className="mt-8 flex justify-start">
                <button
                  type="button"
                  onClick={handlePreviousSection}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
                >
                  <ArrowLeftCircle className="h-4 w-4" />
                  Zurück zu Sektion 8
                </button>
              </div>
            </div>
          </section>
        )}

        {currentSection && (
          <section className="space-y-6">
            {currentSection.questions.map((question) => renderRadioQuestion(question, currentSection.icon))}

            <div className="flex items-center justify-between">
              {previousSection ? (
                <button
                  type="button"
                  onClick={handlePreviousSection}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md"
                >
                  <ArrowLeftCircle className="h-4 w-4" />
                  Zurück
                </button>
              ) : (
                <div></div>
              )}
              <button
                type="button"
                onClick={handleNextSection}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                {nextButtonLabel}
                <ArrowRightCircle className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AutomationAnalysis;

