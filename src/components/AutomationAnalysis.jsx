'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, ClipboardList, LineChart, Sparkles, BriefcaseBusiness, CheckCircle2, Cog, LifeBuoy, ArrowRightCircle, Wallet, Users as UsersIcon, BarChart3 as BarChartIcon, Shield } from 'lucide-react';

const automationLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description:
      'Ich verlasse mich rein auf mein Bauchgefühl. Es ist nicht systematisch dokumentiert, woher meine Kunden kommen.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description:
      'Ich habe vereinzelte Daten (z.B. Webseitenbesucher), kann die Verbindung zu Aufträgen aber nur grob erkennen.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description:
      "Ich kann systematisch differenzieren, welche Aufträge über welche Quelle zustandekamen (z.B. 'Dieser Kunde kam über das Kontaktformular von Kampagne A')."
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description:
      'Wir tracken den gesamten Weg eines Kunden automatisch und wissen genau, welcher Marketing-Euro welchen Umsatz gebracht hat (ROI-Tracking).'
  },
  {
    value: 'intelligent',
    label: 'Intelligent',
    description:
      'Unsere Systeme analysieren den ROI pro Kanal automatisch und schlagen proaktiv Budget-Umschichtungen vor, um den Ertrag zu maximieren.'
  }
];

const leadLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description:
      'Nichts. Ich hoffe, er meldet sich irgendwann von selbst. Oder ich rufe vielleicht manuell hinterher, wenn ich mal Zeit finde.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description:
      'Interessenten landen in einer zentralen Excel-Liste oder einem Adressbuch, das wir manuell pflegen und abarbeiten.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description:
      'Unser System (z.B. CRM) versendet automatisch eine Bestätigungs-E-Mail und erstellt eine Aufgabe für den Vertrieb.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description:
      'Interessenten erhalten vollautomatisch eine vordefinierte Serie von Follow-up-E-Mails (einen E-Mail-Funnel), um sie “warm” zu halten.'
  },
  {
    value: 'intelligent',
    label: 'Intelligent',
    description:
      'Unser System passt den E-Mail-Funnel automatisch an das Verhalten des Nutzers an (z.B. “Klickt auf Thema A, bekommt mehr Infos zu A”).'
  }
];

const contentLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description:
      'Wir erstellen alles bei Bedarf komplett “von Hand”, ohne Vorlagen oder feste Prozesse.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description:
      'Wir haben feste Vorlagen (Templates) und einen Redaktionsplan, den wir manuell abarbeiten.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description:
      'Wir nutzen KI-Tools (z.B. ChatGPT), um unsere manuell erstellten Entwürfe zu verbessern, zu übersetzen oder zu optimieren.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description:
      'Wir nutzen KI, um auf Basis von Stichworten komplette Rohentwürfe für Blogartikel oder Posts zu generieren, die wir dann nur noch verfeinern.'
  },
  {
    value: 'intelligent',
    label: 'Intelligent',
    description:
      'Unsere Systeme analysieren Trends und schlagen uns proaktiv neue, relevante Themen vor und personalisieren Inhalte auf der Webseite für jeden Besucher.'
  }
];

const pipelineLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich verwalte meine Deals im Kopf, in Notizbüchern oder in einzelnen E-Mail-Ordnern.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich nutze eine zentrale Excel-Liste oder ein einfaches Board (z.B. Trello), um manuell zu sehen, wer in meiner Pipeline ist.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Wir nutzen ein professionelles CRM-System (z.B. HubSpot, Pipedrive), in dem alle Vertriebler ihre Kontakte und Deals zentral pflegen.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Unser CRM erstellt Vertrieblern automatisch Aufgaben für Follow-ups, wenn ein Deal zu lange “kalt” ist oder sich eine Phase ändert.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Unser System bewertet (per KI-Lead-Scoring) automatisch, welche Deals die höchste Abschlusswahrscheinlichkeit haben, und priorisiert sie für das Team.'
  }
];

const offeringLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Sehr aufwendig. Ich schreibe jedes Angebot individuell in Word/Excel und suche mir Preise und Positionen jedes Mal neu zusammen.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Es geht. Ich nutze feste Textbausteine und Preislisten, die ich manuell in eine Vorlage kopiere.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Ziemlich schnell. Ich erstelle Angebote in einem Tool, das direkt auf einen zentralen Produkt- und Leistungskatalog zugreift.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Sehr schnell. Ich nutze ein Tool, bei dem ich ein Angebot aus Bausteinen zusammenklicke und das System den Preis und Text automatisch generiert (CPQ).'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Unser System erstellt automatisch einen ersten Angebotsentwurf, basierend auf den Daten aus dem CRM und der Analyse ähnlicher, erfolgreicher Angebote.'
  }
];

const controllingLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich habe kein echtes Reporting. Am Monatsende sehe ich auf dem Kontoauszug, was reingekommen ist.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich erstelle mir (oder lasse mir erstellen) manuell eine Auswertung, z.B. in Excel, um die Abschlussquoten zu sehen.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Ich habe ein Live-Dashboard (z.B. im CRM), das mir auf Knopfdruck die aktuellen Zahlen, Abschlussquoten und Pipeline-Werte anzeigt.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Ich erhalte automatisch wöchentliche Berichte per E-Mail, die mir die wichtigsten KPIs und Abweichungen vom Ziel zeigen.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Mein System analysiert die Pipeline und erstellt einen KI-basierten Forecast, der vorhersagt, wie hoch unser Umsatz am Monatsende wahrscheinlich sein wird.'
  }
];

const kickoffLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Per Zuruf. Ich informiere die zuständigen Mitarbeiter mündlich oder per E-Mail, was zu tun ist.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich erstelle manuell ein neues Projekt in unserem digitalen Tool (z.B. Asana, Jira, Excel) und trage die Hauptaufgaben von Hand ein.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Das Projekt wird automatisch in unserem Tool angelegt, sobald der Auftrag im CRM als “gewonnen” markiert wird (Datenübernahme).'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Sobald das Projekt angelegt wird, weist das System automatisch die ersten Standard-Aufgaben (z.B. “Kick-off-Call planen”) den richtigen Personen zu.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Das System plant das gesamte Projekt (basierend auf Vorlagen und Auslastung) automatisch, legt realistische Meilensteine fest und informiert alle Beteiligten proaktiv.'
  }
];

const monitoringLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich frage meine Mitarbeiter regelmäßig nach dem Stand der Dinge und hoffe, dass wir im Zeitplan liegen.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Wir nutzen eine separate Zeiterfassung, die ich am Monatsende manuell mit dem geplanten Budget abgleiche.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Unser Projektmanagement-Tool ist mit der Zeiterfassung verknüpft. Ich sehe “live”, wie viel Budget/Zeit bereits verbraucht wurde.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Das System schickt mir (oder dem Projektleiter) automatisch einen Alarm, wenn ein Projekt droht, das Budget oder die Deadline zu überschreiten.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Eine KI analysiert den Projektfortschritt und warnt mich proaktiv vor Engpässen (z.B. “Mitarbeiter X ist überbucht”), bevor sie zum Problem werden.'
  }
];

const customerUpdateLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Nur bei Bedarf. Der Kunde ruft an und fragt nach, oder ich melde mich, wenn ich eine Frage habe.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich schreibe manuell E-Mail-Updates, wenn wichtige Meilensteine erreicht sind oder der Kunde danach fragt.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Wir geben dem Kunden einen begrenzten Lese-Zugriff auf unser Projekt-Tool oder ein Kundenportal, wo er den Status selbst einsehen kann.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Das System versendet automatisch standardisierte Status-Updates an den Kunden, wenn vordefinierte Meilensteine im Projekt erreicht werden.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Ein KI-gesteuerter Assistent beantwortet Standard-Kundenfragen zum Projektstatus rund um die Uhr automatisch.'
  }
];

const supportIntakeLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Sie rufen mich auf dem Handy an oder ich bekomme Anfragen per Zuruf. Es gibt keinen zentralen Ort, an dem diese Anfragen gesammelt werden.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Kunden schreiben E-Mails an eine zentrale Support-Adresse (z.B. support@...). Wir verwalten die Anfragen manuell im Posteingang.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Wir nutzen ein professionelles Ticket-System (z.B. Zendesk, HelpScout), in dem alle Anfragen zentral erfasst, nummeriert und einem Bearbeiter zugewiesen werden.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Unser System erstellt automatisch Tickets aus E-Mails und weist sie (basierend auf Schlagwörtern) automatisch dem richtigen Fachexperten zu.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Unser System erkennt (per KI) automatisch die Dringlichkeit und Stimmung des Kunden in einer E-Mail und eskaliert potenziell kritische Anfragen sofort.'
  }
];

const supportEfficiencyLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Jeder Mitarbeiter muss das Rad neu erfinden und bei Kollegen nachfragen oder in alten E-Mails nach einer Lösung suchen.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Wir haben irgendwo (z.B. in einem Word-Dokument oder OneNote) eine Liste mit Standard-Antworten abgelegt, die man manuell durchsuchen kann.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Wir haben eine interne, durchsuchbare Wissensdatenbank (ein „Wiki“), in der alle Lösungen und Prozesse zentral gepflegt werden.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Unser Ticket-System schlägt dem Support-Mitarbeiter (basierend auf der Anfrage) automatisch passende Artikel aus der Wissensdatenbank als Antwort vor.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Ein KI-Chatbot auf unserer Webseite beantwortet die 50 häufigsten Kundenfragen rund um die Uhr selbstständig, ohne dass ein Mensch eingreifen muss.'
  }
];

const supportSatisfactionLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich habe ein gutes Bauchgefühl und frage im persönlichen Gespräch, ob alles in Ordnung war.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Wir versenden gelegentlich manuell eine E-Mail mit der Bitte um Feedback oder eine Google-Bewertung.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Wir nutzen ein Tool, um nach jedem Projekt oder Ticket eine standardisierte Umfrage (z.B. 1-5 Sterne oder NPS) zu versenden.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Der Versand der Feedback-Umfrage ist fester Bestandteil des Projekt-Workflows und geschieht vollautomatisch, sobald ein Ticket geschlossen wird.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Unser System analysiert das Feedback (auch Freitexte per KI) automatisch, erstellt Live-Dashboards zur Zufriedenheit und alarmiert das Management bei negativen Trends.'
  }
];

const invoicingLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich schreibe Rechnungen von Hand in Word oder Excel, speichere sie als PDF und versende sie manuell per E-Mail.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich nutze ein professionelles Online-Tool (z.B. Lexoffice, SevDesk), tippe die Positionen aber manuell aus meinen Notizen oder dem Projekt-Tool ab.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Mein Rechnungstool ist mit meiner Zeiterfassung oder dem Projektmanagement verbunden und zieht sich die abrechenbaren Positionen.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Sobald ein Projekt als „abgeschlossen“ markiert wird, erstellt das Rechnungstool automatisch einen fertigen Rechnungsentwurf zur Freigabe.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Das System erstellt und versendet wiederkehrende Rechnungen vollautomatisch und passt verbrauchsabhängige Beträge selbstständig an.'
  }
];

const paymentReconciliationLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich logge mich ins Online-Banking ein und gleiche Kontoauszüge von Hand mit offenen Rechnungen ab.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich nutze ein Rechnungstool, markiere Zahlungseingänge dort aber manuell als „bezahlt“.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Mein Rechnungstool ist mit dem Bankkonto verbunden und gleicht Zahlungseingänge automatisch mit offenen Rechnungen ab.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Bei Zahlungsverzug versendet das System automatisch und mehrstufig Zahlungserinnerungen und Mahnungen.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Ein KI-System analysiert das Zahlungsverhalten und schlägt proaktiv Maßnahmen wie Risikosperren oder individuelle Mahnstrategien vor.'
  }
];

const expenseProcessingLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich sammle alle Papier- und PDF-Belege in einem Ordner und gebe sie am Monatsende an den Steuerberater.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich nutze ein Tool (z.B. DATEV Unternehmen Online), um alle Belege manuell zu scannen oder hochzuladen.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Mein System holt Rechnungen automatisch aus E-Mail-Postfächern und Online-Portalen ab.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Das System liest Belege per OCR/KI aus, kategorisiert sie und bereitet Überweisungen automatisch vor.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Das System analysiert Ausgaben, erstellt eine Live-Liquiditätsplanung und warnt proaktiv bei Budgetüberschreitungen.'
  }
];

const recruitingLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Bewerbungen landen im Posteingang, und ich verwalte alles manuell.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Wir pflegen Bewerberstatus in einem zentralen Tool (z.B. Trello, Excel) manuell.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Wir nutzen ein Bewerbermanagement-System (ATS), das Bewerbungen automatisch erfasst und automatische Eingangsbestätigungen versendet.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Unser System versendet automatisierte Absagen oder Einladungen und plant Termine selbstständig.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Eine KI analysiert Bewerbungen, führt CV-Parsing durch und erstellt ein Ranking der vielversprechendsten Kandidaten.'
  }
];

const onboardingLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich kümmere mich persönlich darum, dass am ersten Tag alles bereitsteht, und erkläre alles mündlich.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Wir haben eine digitale Checkliste oder Vorlage, die wir manuell abhaken.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Wir nutzen ein HR-Tool mit hinterlegtem Onboarding-Prozess und digitalen Dokumenten für neue Mitarbeitende.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Das Anlegen im HR-System stößt automatisch Workflows an – IT-Tickets, Schulungsunterlagen, Zugänge usw.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Das System begleitet neue Mitarbeitende über Wochen, weist Aufgaben zeitversetzt zu und holt Feedback ein.'
  }
];

const timeTrackingLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Wir nutzen Stundenzettel auf Papier oder formlosen E-Mail-Verkehr für Urlaub/Krankmeldungen.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Zeiten werden in einer separaten Excel oder einem einfachen Tool erfasst.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Ein zentrales HR-Tool erfasst Zeiten digital, und Urlaubsanträge werden dort gestellt; alles ist live einsehbar.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Überstunden, Krankheitstage und Urlaub werden automatisch berechnet und an die Lohnbuchhaltung übergeben.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'KI analysiert Trends bei Überstunden oder Krankmeldungen und warnt proaktiv vor Überlastung.'
  }
];

const backupLevels = [
  {
    value: 'level0',
    label: 'Akutes Risiko',
    description: 'Wir machen gar keine Backups und hoffen, dass nichts passiert.'
  },
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Wir erstellen gelegentlich manuelle Backups auf externe Datenträger.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Wir arbeiten überwiegend in einem Cloud-Speicher, der als Live-Backup dient.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Ein dediziertes Backup-System erstellt täglich automatisierte Snapshots.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Backups werden automatisch auf Wiederherstellbarkeit geprüft und off-site gesichert.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'System-Abbilder werden in Echtzeit gesichert und können im Notfall in Minuten wiederhergestellt werden.'
  }
];

const passwordLevels = [
  {
    value: 'level0',
    label: 'Akutes Risiko',
    description: 'Passwörter sind einfach, werden wiederverwendet oder sogar geteilt.'
  },
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Mitarbeitende verwalten Passwörter individuell und ohne Richtlinien.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Einzelne nutzen Passwort-Manager privat, es gibt aber keine Teamstrategie.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Ein zentraler Passwort-Manager wird im gesamten Team eingesetzt.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Es gelten technische Passwort-Richtlinien und 2FA für alle kritischen Dienste.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Ein Single-Sign-On-System steuert Zugriffe zentral und sicher.'
  }
];

const cyberDefenseLevels = [
  {
    value: 'level0',
    label: 'Akutes Risiko',
    description: 'Nur Standard-Virenschutz und Hoffnung, dass Mitarbeitende Phishing erkennen.'
  },
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Wir haben einen Virenscanner und ermahnen Mitarbeitende, vorsichtig zu sein.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Professionelle Firewall und gemanagte Endpoint-Security sind im Einsatz.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Regelmäßige Security-Awareness-Schulungen und Phishing-Tests finden statt.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'E-Mail-Filter und Patch-Management blockieren Bedrohungen und schließen Lücken automatisch.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Adaptive Sicherheitssysteme überwachen den Verkehr in Echtzeit und blockieren verdächtige Aktivitäten automatisch.'
  }
];

const kpiLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Ich verlasse mich auf Bauchgefühl und Kontoauszüge; feste KPIs verfolge ich nicht.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Ich oder mein Team erstellen manuell Excel-Berichte, wenn Zahlen benötigt werden.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Ein zentrales Dashboard (z.B. im CRM) zeigt mir live Kennzahlen aus einem Bereich.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Ein Cockpit zieht sich Daten automatisch aus mehreren Systemen und zeigt einen Gesamtüberblick.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Das System überwacht KPIs selbstständig und schlägt KI-basierte Gegenmaßnahmen bei Abweichungen vor.'
  }
];

const dataIntegrationLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Daten sind isoliert; Verknüpfungen sind extrem aufwendig oder unmöglich.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Wir exportieren Daten aus verschiedenen Tools und führen sie manuell in Excel zusammen.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Eine zentrale Datenbank/Data Warehouse sammelt alle relevanten Unternehmensdaten.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Dashboards greifen automatisch auf die zentrale Datenbank zu und zeigen bereichsübergreifende Analysen.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'Eine KI analysiert Datenströme proaktiv und entdeckt verborgene Zusammenhänge oder Ineffizienzen.'
  }
];

const strategicPlanningLevels = [
  {
    value: 'manual',
    label: 'Manuell',
    description: 'Entscheidungen basieren auf Bauchgefühl; keine feste Strategie oder Datenbasis.'
  },
  {
    value: 'digitalized',
    label: 'Digitalisiert',
    description: 'Vergangenheitsdaten werden betrachtet, Entscheidungen basieren auf historischen Berichten.'
  },
  {
    value: 'connected',
    label: 'Vernetzt',
    description: 'Live-Daten aus Dashboards fließen in operative Entscheidungen ein.'
  },
  {
    value: 'automated',
    label: 'Automatisiert',
    description: 'Daten werden genutzt, um Was-wäre-wenn-Szenarien zu simulieren.'
  },
  {
    value: 'adaptive',
    label: 'Adaptiv',
    description: 'KI-basierte Prognosen unterstützen strategische Entscheidungen durch Trend- und Nachfragevorhersagen.'
  }
];

const sections = [
  { id: 'marketing', label: 'Sektion 1 · Marketing & Leads', icon: Sparkles },
  { id: 'sales', label: 'Sektion 2 · Vertrieb', icon: BriefcaseBusiness },
  { id: 'operations', label: 'Sektion 3 · Auftragsabwicklung', icon: Cog },
  { id: 'support', label: 'Sektion 4 · Kundenservice', icon: LifeBuoy },
  { id: 'finance', label: 'Sektion 5 · Finanzen & Buchhaltung', icon: Wallet },
  { id: 'hr', label: 'Sektion 6 · Personal', icon: UsersIcon },
  { id: 'management', label: 'Sektion 7 · Management & Datenanalyse', icon: BarChartIcon },
  { id: 'itSecurity', label: 'Sektion 8 · IT & Sicherheit', icon: Shield }
];

const numericFields = [
  {
    id: 'dataEntryHours',
    label:
      'Frage 1.1: “Du hast in der AGA angegeben, dass du Kontakte manuell (z.B. in Excel oder Notizbüchern) verwaltest. Wie viele Stunden pro Woche verbringt dein Team (oder du selbst) insgesamt nur mit der Dateneingabe von Leads? (Also Kontakte von Visitenkarten abtippen, E-Mails in Listen kopieren etc.)”',
    suffix: 'Stunden / Woche'
  },
  {
    id: 'dataEntryRate',
    label:
      'Frage 1.2: “Was ist der durchschnittliche Brutto-Stundensatz der Mitarbeiter, die diese Dateneingabe machen?” (Rechne: Jahresgehalt / 1.700 Stunden)',
    suffix: '€ / Stunde'
  },
  {
    id: 'lostLeads',
    label:
      'Frage 1.3: “Wie viele Leads gehen dir, deiner Schätzung nach, pro Monat durch dieses manuelle System verloren (weil sie vergessen, falsch eingetippt oder zu spät kontaktiert werden)?”',
    suffix: 'Leads / Monat'
  },
  {
    id: 'customerLifetimeValue',
    label:
      'Frage 1.4: “Was ist dir ein durchschnittlicher Neukunde (Customer Lifetime Value) wert?”',
    suffix: '€'
  }
];

const formatCurrency = (value) => {
  if (!Number.isFinite(value) || value === 0) {
    return '–';
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value) => {
  if (!Number.isFinite(value) || value === 0) {
    return '–';
  }

  return new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 1
  }).format(value);
};

const parseToNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalised = value.toString().replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
  const parsed = parseFloat(normalised);
  return Number.isFinite(parsed) ? parsed : 0;
};

const AutomationAnalysis = () => {
  const [formState, setFormState] = useState({
    marketingTracking: '',
    leadFollowUp: '',
    contentCreation: '',
    marketingWish: '',
    dataEntryHours: '',
    dataEntryRate: '',
    lostLeads: '',
    customerLifetimeValue: '',
    followUpHours: '',
    contentCreationHours: '',
    reportingHours: '',
    salesPipeline: '',
    offeringCreation: '',
    salesControlling: '',
    usesCentralSalesSystem: '',
    centralSalesSystemTool: '',
    billingIntegration: '',
    billingIntegrationTool: '',
    salesPainPoint: '',
    projectKickoff: '',
    projectMonitoring: '',
    customerUpdates: '',
    usesProjectTool: '',
    hasHandoverProcess: '',
    operationsPainPoint: '',
    supportTicketIntake: '',
    supportEfficiency: '',
    supportSatisfaction: '',
    hasCentralSupportAccess: '',
    hasKnowledgeBase: '',
    supportPainPoint: '',
    invoicingProcess: '',
    paymentTracking: '',
    expenseProcessing: '',
    usesFinanceTool: '',
    hasBankIntegration: '',
    financePainPoint: '',
    hrRecruiting: '',
    hrOnboarding: '',
    hrTimeTracking: '',
    hasLeaveManagementTool: '',
    hasStandardOnboarding: '',
    hrPainPoint: '',
    kpiTracking: '',
    dataIntegration: '',
    strategicPlanning: '',
    hasDashboard: '',
    hasDataLink: '',
    managementPainPoint: ''
  });

  const [activeSection, setActiveSection] = useState('marketing');

  const handleRadioChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const {
    potentialTimeSavings,
    potentialLossSavings,
    followUpSavings,
    contentSavings,
    reportingSavings,
    totalAnnualImpact,
    totalHoursWeekly
  } = useMemo(() => {
    const dataEntryHours = parseToNumber(formState.dataEntryHours);
    const dataEntryRate = parseToNumber(formState.dataEntryRate);
    const lostLeads = parseToNumber(formState.lostLeads);
    const customerLifetimeValue = parseToNumber(formState.customerLifetimeValue);
    const followUpHours = parseToNumber(formState.followUpHours);
    const contentCreationHours = parseToNumber(formState.contentCreationHours);
    const reportingHours = parseToNumber(formState.reportingHours);

    const potentialTime = dataEntryHours * dataEntryRate * 48;
    const potentialLoss = lostLeads * customerLifetimeValue * 12;
    const followUp = followUpHours * dataEntryRate * 48;
    const content = contentCreationHours * dataEntryRate * 48;
    const reporting = reportingHours * dataEntryRate * 12;

    return {
      potentialTimeSavings: Number.isFinite(potentialTime) ? Math.max(potentialTime, 0) : 0,
      potentialLossSavings: Number.isFinite(potentialLoss) ? Math.max(potentialLoss, 0) : 0,
      followUpSavings: Number.isFinite(followUp) ? Math.max(followUp, 0) : 0,
      contentSavings: Number.isFinite(content) ? Math.max(content, 0) : 0,
      reportingSavings: Number.isFinite(reporting) ? Math.max(reporting, 0) : 0,
      totalAnnualImpact: [potentialTime, potentialLoss, followUp, content, reporting]
        .filter((value) => Number.isFinite(value))
        .reduce((acc, curr) => acc + Math.max(curr, 0), 0),
      totalHoursWeekly: dataEntryHours + followUpHours + contentCreationHours
    };
  }, [formState]);

  const renderRadioQuestion = (title, description, field, options) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 shadow-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-sm text-gray-600 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">
        {options.map((option) => {
          const selected = formState[field] === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleRadioChange(field, option.value)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                selected
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{option.label}</span>
                <span
                  className={`ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                    selected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-300'
                  }`}
                  aria-hidden="true"
                >
                  {selected ? '•' : ''}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderNumericQuestion = (field) => (
    <div key={field.id} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 leading-relaxed">{field.label}</label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={formState[field.id]}
          onChange={(event) => handleInputChange(field.id, event.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          placeholder="0"
        />
        <span className="text-sm text-gray-500 whitespace-nowrap">{field.suffix}</span>
      </div>
    </div>
  );

  const renderYesNoQuestion = ({
    id,
    label,
    helper,
    followUpId,
    followUpLabel,
    layout = 'default'
  }) => {
    const value = formState[id];
    const isYes = value === 'yes';
    const isNo = value === 'no';

    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700 leading-relaxed">{label}</span>
          {helper && <p className="text-xs text-gray-500 leading-relaxed">{helper}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleRadioChange(id, 'yes')}
            className={`flex-1 min-w-[120px] rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isYes ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Ja
          </button>
          <button
            type="button"
            onClick={() => handleRadioChange(id, 'no')}
            className={`flex-1 min-w-[120px] rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isNo ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-700 hover:border-rose-200 hover:bg-rose-50'
            }`}
          >
            Nein
          </button>
        </div>

        {isYes && followUpId && (
          <div className={`rounded-2xl border border-gray-200 bg-white p-4 ${layout === 'inline' ? 'mt-2' : 'mt-4'}`}>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">
              {followUpLabel}
            </label>
            <input
              type="text"
              value={formState[followUpId]}
              onChange={(event) => handleInputChange(followUpId, event.target.value)}
              placeholder="Bitte angeben"
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pb-24 pt-12 lg:pt-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-white/70 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-purple-700">
            Automation Analysis
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {activeSection === 'marketing'
                ? 'Marketing & Lead-Generierung analysieren'
                : activeSection === 'sales'
                ? 'Vertrieb analysieren'
                : activeSection === 'operations'
                ? 'Auftragsabwicklung analysieren'
                : activeSection === 'support'
                ? 'Kundenservice analysieren'
                : activeSection === 'finance'
                ? 'Finanzen & Buchhaltung analysieren'
                : activeSection === 'hr'
                ? 'Personal analysieren'
                : activeSection === 'management'
                ? 'Management & Datenanalyse analysieren'
                : 'IT & Sicherheit analysieren'}
          </h1>
            <p className="text-base leading-relaxed text-gray-600">
              {activeSection === 'marketing'
                ? '“Super, lass uns starten. Im ersten Schritt schauen wir uns an, wie dein Unternehmen planbar neue Kunden gewinnt. Beantworte die folgenden Fragen einfach aus dem Bauch heraus – es geht darum, Potenziale zu entdecken.”'
                : activeSection === 'sales'
                ? '“Stark! Jetzt, wo wir wissen, wie du Leads generierst, schauen wir uns an, wie du diese Interessenten in zahlende Kunden verwandelst.”'
                : activeSection === 'operations'
                ? '“Top, der Kunde ist gewonnen. Jetzt geht es an die eigentliche Arbeit: die Umsetzung des Auftrags. Wie effizient ist dein Maschinenraum?”'
                : activeSection === 'support'
                ? '“Großartig. Das Projekt ist abgeschlossen. Aber was passiert danach? Schauen wir uns an, wie du deine Bestandskunden betreust und Anfragen bearbeitest.”'
                : activeSection === 'finance'
                ? '“Fast geschafft! Jetzt wird es existenziell: das Geld. Ein digitalisierter Finanzprozess spart Zeit und schafft Transparenz über deine Liquidität.”'
                : activeSection === 'hr'
                ? '“Gute Finanzen sind die eine Hälfte, gute Mitarbeitende die andere. Lass uns ansehen, wie du dein Team findest, verwaltest und entwickelst.”'
                : activeSection === 'management'
                ? '“Du bist der Kapitän. Aber steuerst du dein Schiff mit Bauchgefühl oder mit einem Live-Radar? Lass uns ansehen, wie du Entscheidungen triffst.”'
                : '“Letzter Schritt, aber der wichtigste: das Fundament. Eine unsichere IT ist wie ein Haus ohne Schloss. Lass uns prüfen, wie sicher deine digitalen Werte sind.”'}
          </p>
        </div>
        </header>

        <nav className="relative w-full overflow-x-auto">
          <div className="flex min-w-full gap-3 rounded-3xl bg-white/80 p-3 shadow-sm backdrop-blur">
            {sections.map((section) => {
              const isActive = activeSection === section.id;
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`group relative flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'border-transparent bg-gradient-to-r from-white to-white/60 text-gray-600 hover:border-purple-200 hover:bg-white'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                      isActive
                        ? 'border-white/30 bg-white/20 text-white'
                        : 'border-purple-100 bg-purple-50 text-purple-500 group-hover:border-purple-200 group-hover:bg-purple-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="whitespace-nowrap">{section.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-4 bottom-2 h-[3px] rounded-full bg-white/70" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {activeSection === 'marketing' && (
          <section className="space-y-8">
          {renderRadioQuestion(
            'Frage 1.1: Datenerfassung & Messbarkeit',
            'Wie gut weißt du, welche deiner Marketing-Aktivitäten (z.B. Messen, Google, Empfehlungen) dir am Ende wirklich einen zahlenden Kunden gebracht hat?',
            'marketingTracking',
            automationLevels
          )}

          {renderRadioQuestion(
            'Frage 1.2: Lead-Management & Follow-up',
            'Was passiert, wenn sich ein neuer Interessent (Lead) bei dir meldet, aber nicht sofort kauft?',
            'leadFollowUp',
            leadLevels
          )}

          {renderRadioQuestion(
            'Frage 1.3: Content & KI-Nutzung',
            'Wie läuft die Erstellung eurer Marketing-Inhalte ab (z.B. Webseiten-Texte, Social-Media-Posts, Newsletter)?',
            'contentCreation',
            contentLevels
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
            <label className="mb-3 block text-lg font-semibold text-gray-900">
              Frage 1.4: “Wenn du eine Zauberfee hättest: Was ist die eine Sache im Marketing oder der Neukundengewinnung, die du sofort reparieren oder automatisieren würdest?”
            </label>
            <textarea
              rows={4}
              value={formState.marketingWish}
              onChange={(event) => handleInputChange('marketingWish', event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              placeholder="Teile hier deinen größten Wunsch oder Engpass..."
            />
            </div>
          </section>
        )}

        {activeSection === 'marketing' && (
          <section className="space-y-6 rounded-3xl border border-purple-100 bg-white p-6 lg:p-10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Calculator className="h-6 w-6" />
                </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Wirtschaftlicher Impact (Sektion 1)</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Trage ein, wie viel Aufwand aktuell in manuelle Datenerfassung fließt. Das System berechnet automatisch dein Zeit- und Umsatzpotenzial.
              </p>
                </div>
              </div>

          <div className="grid gap-6">
            {numericFields.map((field) => renderNumericQuestion(field))}
            </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-purple-800">Potenzial 1 (Zeit)</h3>
              <p className="mt-1 text-sm text-purple-700">
                (Q1.1 × Q1.2 × 48 Wochen)
              </p>
              <p className="mt-4 text-3xl font-bold text-purple-900">{formatCurrency(potentialTimeSavings)} / Jahr</p>
          </div>
            <div className="rounded-2xl border border-gray-200 bg-purple-50 p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-purple-800">Potenzial 2 (Verlust)</h3>
              <p className="mt-1 text-sm text-purple-700">
                (Q1.3 × Q1.4 × 12 Monate)
              </p>
              <p className="mt-4 text-3xl font-bold text-purple-900">{formatCurrency(potentialLossSavings)} / Jahr</p>
                </div>
              </div>
          </section>
        )}

        {activeSection === 'marketing' && (
          <section className="space-y-6 rounded-3xl border border-blue-100 bg-white p-6 lg:p-10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Teil 2: Marketing Content & Follow-up</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Fasse zusammen, wie viel Zeit in wiederkehrende Follow-up- und Content-Aufgaben fließt.
              </p>
            </div>
            </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                Frage 2.1: “Du hast angegeben, dass Follow-ups (das 'Warmhalten' von Leads) manuell passieren.
                Wie viele Stunden pro Woche verbringt dein Vertriebsteam damit, Interessenten manuell E-Mails zu schreiben, an die sie sich 'mal wieder erinnern' wollen?”
                  </label>
              <div className="flex items-center gap-3">
                    <input
                  type="text"
                  inputMode="decimal"
                  value={formState.followUpHours}
                  onChange={(event) => handleInputChange('followUpHours', event.target.value)}
                  placeholder="0"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">Stunden / Woche</span>
              </div>
              <p className="text-xs text-blue-600">
                System rechnet: (Q2.1 × Q1.2 × 48 Wochen) = {formatCurrency(followUpSavings)} / Jahr
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                Frage 2.2: “Und wie viele Stunden pro Woche fließen in die Erstellung von wiederkehrenden Inhalten (z.B. Blogartikel, Social Media Posts, Newsletter), die man auch durch KI-Tools (Level 4/5) stark beschleunigen könnte?”
                  </label>
              <div className="flex items-center gap-3">
                    <input
                  type="text"
                  inputMode="decimal"
                  value={formState.contentCreationHours}
                  onChange={(event) => handleInputChange('contentCreationHours', event.target.value)}
                  placeholder="0"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">Stunden / Woche</span>
                    </div>
              <p className="text-xs text-blue-600">
                System rechnet: (Q2.2 × Q1.2 × 48 Wochen) = {formatCurrency(contentSavings)} / Jahr
              </p>
                  </div>
                </div>
          </section>
        )}

        {activeSection === 'marketing' && (
          <section className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 lg:p-10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <LineChart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Teil 3: Reporting & Analyse</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Erfasse den monatlichen Aufwand, um Marketingkanäle manuell auszuwerten.
              </p>
            </div>
            </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 leading-relaxed">
              Frage 3.1: “In der AGA war unklar, welche Marketing-Kanäle dir Kunden bringen.
              Wie viele Stunden pro Monat verbringt jemand damit, manuell Berichte zu erstellen (Daten aus verschiedenen Quellen in Excel zusammenzukopieren), um das herauszufinden?”
            </label>
            <div className="flex items-center gap-3">
                    <input
                type="text"
                inputMode="decimal"
                value={formState.reportingHours}
                onChange={(event) => handleInputChange('reportingHours', event.target.value)}
                placeholder="0"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">Stunden / Monat</span>
                    </div>
            <p className="text-xs text-emerald-600">
              System rechnet: (Q3.1 × Q1.2 × 12 Monate) = {formatCurrency(reportingSavings)} / Jahr
                  </p>
                </div>
          </section>
        )}

        {activeSection === 'sales' && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sektion 2: Vertrieb</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    “Awesome! Now that we know how you generate leads, let’s look at how you turn those prospects into paying customers.”
                  </p>
                </div>
              </div>
            </div>

            {renderRadioQuestion(
              'Frage 2.1: Pipeline-Management',
              'Wie verwaltest du den Überblick über deine aktuellen Verkaufschancen (deine “Pipeline”)?',
              'salesPipeline',
              pipelineLevels
            )}

            {renderRadioQuestion(
              'Frage 2.2: Angebotserstellung',
              'Wie aufwendig ist die Erstellung eines typischen Angebots für einen Kunden?',
              'offeringCreation',
              offeringLevels
            )}

            {renderRadioQuestion(
              'Frage 2.3: Vertriebs-Controlling',
              'Wie gut kannst du den Erfolg deiner Vertriebsaktivitäten messen und vorhersagen (Forecast)?',
              'salesControlling',
              controllingLevels
            )}

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Vertriebsprozesse & Systeme</h3>
              </div>

              {renderYesNoQuestion({
                id: 'usesCentralSalesSystem',
                label: 'Frage 2.4: Verwendest du ein zentrales, digitales System (mehr als nur dein E-Mail-Postfach oder Excel), um Kundenkontakte und Verkaufschancen zu verwalten?',
                helper: 'Wenn nein, wird diese Sektion maximal als “Level 1” gewertet.',
                followUpId: 'centralSalesSystemTool',
                followUpLabel: 'Welches Tool nutzt du?'
              })}

              {renderYesNoQuestion({
                id: 'billingIntegration',
                label: 'Frage 2.5: Sind die Daten aus deinem Vertriebsprozess (z.B. ein “gewonnener” Auftrag) direkt mit der Rechnungsstellung verbunden, sodass Daten automatisch übergeben werden?',
                helper: 'Wenn nein, ist maximal Level 3 möglich, da eine Voraussetzung für Level 4 “Automation” fehlt.',
                followUpId: 'billingIntegrationTool',
                followUpLabel: 'Verwendest du dafür ein bestimmtes Tool?'
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                  Frage 2.6: Was nervt dich (oder dein Vertriebsteam) im gesamten Prozess vom ersten Kontakt bis zum unterschriebenen Vertrag am allermeisten?
                </label>
                <textarea
                  rows={4}
                  value={formState.salesPainPoint}
                  onChange={(event) => handleInputChange('salesPainPoint', event.target.value)}
                  placeholder="Beschreibe hier den größten Schmerzpunkt deines Vertriebsteams..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </section>
        )}

        {activeSection === 'operations' && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
                  <Cog className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sektion 3: Auftragsabwicklung</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    “Top, der Kunde ist gewonnen. Jetzt geht es an die eigentliche Arbeit: die Umsetzung des Auftrags. Wie effizient ist dein Maschinenraum?”
              </p>
            </div>
          </div>
        </div>

            {renderRadioQuestion(
              'Frage 3.1: Projekt-Kickoff & Setup',
              'Wie wird ein neuer, gewonnener Auftrag (aus Sektion 2) in ein aktives Projekt für dein Team umgewandelt?',
              'projectKickoff',
              kickoffLevels
            )}

            {renderRadioQuestion(
              'Frage 3.2: Monitoring von Zeit & Budget',
              'Wie überwachst du den Fortschritt (Zeit, Budget, Aufgaben) deiner laufenden Aufträge?',
              'projectMonitoring',
              monitoringLevels
            )}

            {renderRadioQuestion(
              'Frage 3.3: Einbindung des Kunden & Status-Updates',
              'Wie hältst du deine Kunden während der Projektlaufzeit auf dem Laufenden?',
              'customerUpdates',
              customerUpdateLevels
            )}

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-indigo-100 p-2.5 text-indigo-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Projektprozesse & Tools</h3>
              </div>

              {renderYesNoQuestion({
                id: 'usesProjectTool',
                label: 'Frage 3.4: Nutzt du ein zentrales, digitales Tool (mehr als nur E-Mail/Kalender) für deine Projekt- und Aufgabenplanung (z.B. Asana, Trello, Jira, ClickUp)?',
                helper: 'Wenn nein, maximal Level 1 für diese Sektion.'
              })}

              {renderYesNoQuestion({
                id: 'hasHandoverProcess',
                label: 'Frage 3.5: Gibt es bei euch einen fest definierten, digitalen Prozess für die finale Übergabe und Abnahme eines Projekts durch den Kunden?',
                helper: 'Wenn nein, maximal Level 2 für diese Sektion.'
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                  Frage 3.6: „Wo entsteht das meiste Chaos oder der größte Frust, wenn ein Auftrag ‘in Arbeit’ ist? (z.B. bei Übergaben, unklaren Zuständigkeiten, Zeitfressern…)“
                </label>
                <textarea
                  rows={4}
                  value={formState.operationsPainPoint}
                  onChange={(event) => handleInputChange('operationsPainPoint', event.target.value)}
                  placeholder="Beschreibe hier die größten Engpässe oder Chaos-Punkte in der Auftragsabwicklung..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('support')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:translate-y-[-1px] hover:shadow-xl"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Sektion 3 speichern & weiter zu Kundenservice (Support)
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'support' && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-rose-100 p-3 text-rose-600">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sektion 4: Kundenservice (Support)</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    “Großartig. Das Projekt ist abgeschlossen. Aber was passiert danach? Schauen wir uns an, wie du deine Bestandskunden betreust und Anfragen bearbeitest.”
                  </p>
                </div>
              </div>
            </div>

            {renderRadioQuestion(
              'Frage 4.1: Erfassung von Support-Anfragen',
              'Wie erreichen dich deine Kunden, wenn sie nach dem Kauf ein Problem oder eine Frage haben?',
              'supportTicketIntake',
              supportIntakeLevels
            )}

            {renderRadioQuestion(
              'Frage 4.2: Effizienz der Problemlösung',
              'Wie schnell und effizient findet dein Team Lösungen für wiederkehrende Kundenfragen?',
              'supportEfficiency',
              supportEfficiencyLevels
            )}

            {renderRadioQuestion(
              'Frage 4.3: Messung der Kundenzufriedenheit',
              'Wie systematisch misst du die Zufriedenheit deiner Kunden nach einem abgeschlossenen Projekt oder einer Support-Anfrage?',
              'supportSatisfaction',
              supportSatisfactionLevels
            )}

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-rose-100 p-2.5 text-rose-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Support-Prozesse & Kundenzufriedenheit</h3>
              </div>

              {renderYesNoQuestion({
                id: 'hasCentralSupportAccess',
                label: 'Frage 4.4: Gibt es bei euch eine zentrale E-Mail-Adresse oder ein Tool für Support-Anfragen, auf das mehrere Mitarbeiter Zugriff haben?',
                helper: 'Wenn nein, maximal Level 1 für diese Sektion.'
              })}

              {renderYesNoQuestion({
                id: 'hasKnowledgeBase',
                label: 'Frage 4.5: Habt ihr eine digitale Wissensdatenbank (internes Wiki o.ä.), in der Lösungen für Standardprobleme gespeichert sind?',
                helper: 'Wenn nein, maximal Level 2 für diese Sektion.'
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                  Frage 4.6: „Welche Art von Kundenanfragen raubt dir oder deinem Team regelmäßig den letzten Nerv, weil sie immer wieder kommt und Zeit bindet?”
                </label>
                <textarea
                  rows={4}
                  value={formState.supportPainPoint}
                  onChange={(event) => handleInputChange('supportPainPoint', event.target.value)}
                  placeholder="Beschreibe hier die Support-Anfragen, die besonders oft auftreten oder viel Zeit kosten..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('finance')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:translate-y-[-1px] hover:shadow-xl"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Sektion 4 speichern & weiter zu Finanzen & Buchhaltung
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'finance' && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sektion 5: Finanzen & Buchhaltung</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    “Fast geschafft! Jetzt wird es existenziell: das Geld. Ein digitalisierter Finanzprozess spart nicht nur Zeit, sondern gibt dir Kontrolle über deine Liquidität.”
                  </p>
                </div>
              </div>
            </div>

            {renderRadioQuestion(
              'Frage 5.1: Rechnungsstellung (Ausgangsrechnungen)',
              'Wie erstellst und versendest du deine Rechnungen an Kunden?',
              'invoicingProcess',
              invoicingLevels
            )}

            {renderRadioQuestion(
              'Frage 5.2: Zahlungsabgleich & Mahnwesen',
              'Wie behältst du den Überblick über offene Rechnungen und Zahlungseingänge?',
              'paymentTracking',
              paymentReconciliationLevels
            )}

            {renderRadioQuestion(
              'Frage 5.3: Belegverarbeitung (Eingangsrechnungen)',
              'Wie verarbeitest du Rechnungen, die du selbst erhältst (z.B. von Lieferanten oder für Software-Lizenzen)?',
              'expenseProcessing',
              expenseProcessingLevels
            )}

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Finanz-Prozesse & Liquidität</h3>
              </div>

              {renderYesNoQuestion({
                id: 'usesFinanceTool',
                label: 'Frage 5.4: Nutzt du ein dediziertes digitales Tool (mehr als Excel/Word) für deine Rechnungsstellung UND deine Belegsammlung?',
                helper: 'Wenn nein, maximal Level 1 für diese Sektion.'
              })}

              {renderYesNoQuestion({
                id: 'hasBankIntegration',
                label: 'Frage 5.5: Ist dein Geschäftskonto digital mit deiner Buchhaltungssoftware verbunden, sodass ein automatischer Abgleich der Zahlungen möglich ist?',
                helper: 'Wenn nein, maximal Level 2 für diese Sektion.'
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                  Frage 5.6: „Was ist der größte Zeitfresser oder die größte Sorge in deiner Buchhaltung (z.B. Belege jagen, offene Posten, Liquiditätsplanung...)?“
                </label>
                <textarea
                  rows={4}
                  value={formState.financePainPoint}
                  onChange={(event) => handleInputChange('financePainPoint', event.target.value)}
                  placeholder="Beschreibe hier deine größten Herausforderungen in Finanzen & Buchhaltung..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('hr')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:translate-y-[-1px] hover:shadow-xl"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Sektion 5 speichern & weiter zu Personal (HR)
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'hr' && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                  <UsersIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sektion 6: Personal (HR)</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    “Gute Finanzen sind die eine Hälfte, gute Mitarbeitende die andere. Lass uns ansehen, wie du dein Team findest, verwaltest und entwickelst.”
                  </p>
                </div>
              </div>
            </div>

            {renderRadioQuestion(
              'Frage 6.1: Recruiting & Bewerbermanagement',
              'Wie verwaltest du den Prozess, wenn sich jemand bei dir bewirbt?',
              'hrRecruiting',
              recruitingLevels
            )}

            {renderRadioQuestion(
              'Frage 6.2: Mitarbeiter-Onboarding',
              'Was passiert, wenn ein neuer Mitarbeiter seinen ersten Arbeitstag hat?',
              'hrOnboarding',
              onboardingLevels
            )}

            {renderRadioQuestion(
              'Frage 6.3: Verwaltung (Zeiterfassung & Abwesenheit)',
              'Wie verwaltest du Arbeitszeiten, Urlaubstage oder Krankmeldungen deiner Mitarbeitenden?',
              'hrTimeTracking',
              timeTrackingLevels
            )}

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-100 p-2.5 text-orange-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">HR-Prozesse & Teamverwaltung</h3>
              </div>

              {renderYesNoQuestion({
                id: 'hasLeaveManagementTool',
                label: 'Frage 6.4: Nutzt du ein zentrales, digitales System (mehr als nur E-Mail/Kalender) für die Verwaltung von Urlaubsanträgen und Krankheitstagen?',
                helper: 'Wenn nein, maximal Level 1 für diese Sektion.'
              })}

              {renderYesNoQuestion({
                id: 'hasStandardOnboarding',
                label: 'Frage 6.5: Gibt es einen standardisierten, digitalen Onboarding-Prozess (mehr als eine Checkliste), den jeder neue Mitarbeiter durchläuft?',
                helper: 'Wenn nein, maximal Level 2 für diese Sektion.'
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                  Frage 6.6: „Was ist der größte administrative Zeitfresser im Umgang mit deinem Team (z.B. Bewerber-Management, Stundenzettel, Urlaubsplanung...)?“
                </label>
                <textarea
                  rows={4}
                  value={formState.hrPainPoint}
                  onChange={(event) => handleInputChange('hrPainPoint', event.target.value)}
                  placeholder="Beschreibe hier die größten HR-Zeitfresser oder Sorgen..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('management')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:translate-y-[-1px] hover:shadow-xl"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Sektion 6 speichern & weiter zu Management & Datenanalyse
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'management' && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                  <BarChartIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sektion 7: Management & Datenanalyse</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    “Du bist der Kapitän. Aber steuerst du dein Schiff mit Bauchgefühl oder mit einem Live-Radar? Lass uns ansehen, wie du Entscheidungen triffst.”
                  </p>
                </div>
              </div>
            </div>

            {renderRadioQuestion(
              'Frage 7.1: Performance-Messung (KPIs)',
              'Wie misst du den Erfolg und die „Gesundheit“ deines Unternehmens?',
              'kpiTracking',
              kpiLevels
            )}

            {renderRadioQuestion(
              'Frage 7.2: Datenintegration',
              'Wie einfach ist es für dich, Daten aus verschiedenen Abteilungen zu verknüpfen?',
              'dataIntegration',
              dataIntegrationLevels
            )}

            {renderRadioQuestion(
              'Frage 7.3: Strategische Planung',
              'Wie triffst du Entscheidungen über die Zukunft deines Unternehmens (z.B. neue Produkte, neue Märkte)?',
              'strategicPlanning',
              strategicPlanningLevels
            )}

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2.5 text-blue-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Management-Cockpit & Datenfluss</h3>
              </div>

              {renderYesNoQuestion({
                id: 'hasDashboard',
                label: 'Frage 7.4: Nutzt du irgendeine Form von digitalem Dashboard, um deine wichtigsten Unternehmenskennzahlen (KPIs) zu verfolgen?',
                helper: 'Wenn nein, maximal Level 1 für diese Sektion.'
              })}

              {renderYesNoQuestion({
                id: 'hasDataLink',
                label: 'Frage 7.5: Sind deine wichtigsten Daten (z.B. Vertriebspipeline und Finanzdaten) an einem zentralen Ort verknüpft?',
                helper: 'Wenn nein, maximal Level 2 für diese Sektion.'
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                  Frage 7.6: „Welche wichtige Geschäfts-Frage könntest du aktuell nicht beantworten, weil die Daten oder Auswertung fehlen?“
                </label>
                <textarea
                  rows={4}
                  value={formState.managementPainPoint}
                  onChange={(event) => handleInputChange('managementPainPoint', event.target.value)}
                  placeholder="Beschreibe hier die Frage, die du gerne beantworten würdest, aber aktuell nicht kannst..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('itSecurity')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:translate-y-[-1px] hover:shadow-xl"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Sektion 7 speichern & weiter zu IT & Sicherheit
                </button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'itSecurity' && (
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Sektion 8: IT & Sicherheit</h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    “Letzter Schritt, aber der wichtigste: das Fundament. Eine unsichere IT ist wie ein Haus ohne Schloss. Lass uns prüfen, wie sicher deine digitalen Werte sind.”
                  </p>
                </div>
              </div>
            </div>

            {renderRadioQuestion(
              'Frage 8.1: Datensicherung (Backup-Strategie)',
              'Wie sicher sind deine kritischen Firmendaten vor Totalverlust geschützt?',
              'itBackup',
              backupLevels
            )}

            {renderRadioQuestion(
              'Frage 8.2: Zugriff & Passwort-Management',
              'Wie verwaltet dein Team die Zugänge zu verschiedenen Online-Diensten und Tools?',
              'itAccess',
              passwordLevels
            )}

            {renderRadioQuestion(
              'Frage 8.3: Schutz vor Cyberangriffen',
              'Wie schützt du dein Unternehmen aktiv vor Viren, Phishing-E-Mails und Hackerangriffen?',
              'itSecurity',
              cyberDefenseLevels
            )}

            <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 lg:p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-100 p-2.5 text-purple-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sicherheitsrichtlinien & Notfallpläne</h3>
              </div>

              {renderYesNoQuestion({
                id: 'hasTwoFactor',
                label: 'Frage 8.4: Nutzt ihr für alle kritischen Online-Dienste (E-Mail, Finanzen, Cloud-Speicher) eine Zwei-Faktor-Authentifizierung (2FA)?',
                helper: 'Wenn nein, maximal Level 2 für diese Sektion.'
              })}

              {renderYesNoQuestion({
                id: 'hasIncidentPlan',
                label: 'Frage 8.5: Gibt es einen dokumentierten Notfallplan für den Fall eines Cyberangriffs (z.B. Ransomware)?',
                helper: 'Wenn nein, maximal Level 3 für diese Sektion.'
              })}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 leading-relaxed">
                  Frage 8.6: „Was ist deine größte Sorge im Bereich IT oder Datensicherheit?“
                </label>
                <textarea
                  rows={4}
                  value={formState.itPainPoint}
                  onChange={(event) => handleInputChange('itPainPoint', event.target.value)}
                  placeholder="Beschreibe hier deine größten Sorgen oder Risiken rund um IT und Datensicherheit..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:translate-y-[-1px] hover:shadow-xl"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Sektion 8 speichern & Analyse abschließen
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Gesamtauswertung</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Zusätzliche Hebel durch Automatisierung – basierend auf deinen Antworten.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 px-6 py-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-wide text-purple-100">Gesamtes Jahrespotenzial</p>
              <p className="text-3xl font-semibold">{formatCurrency(totalAnnualImpact)}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-inner">
              <p className="text-sm font-medium text-gray-600">Zeit pro Woche (manuell)</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{formatNumber(totalHoursWeekly)} Std.</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-inner">
              <p className="text-sm font-medium text-gray-600">Marketing-Datenpotenzial</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{formatCurrency(potentialTimeSavings + reportingSavings)}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-inner">
              <p className="text-sm font-medium text-gray-600">Umsatzpotenziale Leads & Content</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{formatCurrency(potentialLossSavings + followUpSavings + contentSavings)}</p>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
};

export default AutomationAnalysis;
