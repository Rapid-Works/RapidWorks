'use client';

import React, { useMemo, useState } from 'react';
import { Calculator, ClipboardList, LineChart, Sparkles, BriefcaseBusiness, CheckCircle2, Cog, LifeBuoy } from 'lucide-react';

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

const sections = [
  {
    id: 'marketing',
    name: 'Sektion 1 · Marketing & Leads'
  },
  {
    id: 'sales',
    name: 'Sektion 2 · Vertrieb'
  },
  {
    id: 'operations',
    name: 'Sektion 3 · Auftragsabwicklung'
  }
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
    operationsPainPoint: ''
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
                : 'Auftragsabwicklung analysieren'}
            </h1>
            <p className="text-base leading-relaxed text-gray-600">
              {activeSection === 'marketing'
                ? '“Super, lass uns starten. Im ersten Schritt schauen wir uns an, wie dein Unternehmen planbar neue Kunden gewinnt. Beantworte die folgenden Fragen einfach aus dem Bauch heraus – es geht darum, Potenziale zu entdecken.”'
                : activeSection === 'sales'
                ? '“Stark! Jetzt, wo wir wissen, wie du Leads generierst, schauen wir uns an, wie du diese Interessenten in zahlende Kunden verwandelst.”'
                : '“Top, der Kunde ist gewonnen. Jetzt geht es an die eigentliche Arbeit: die Umsetzung des Auftrags. Wie effizient ist dein Maschinenraum?”'}
            </p>
          </div>
        </header>

        <nav className="flex flex-wrap gap-3 rounded-3xl bg-white/80 p-2 shadow-sm backdrop-blur">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 min-w-[200px] rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-purple-50'
                }`}
              >
                {section.name}
              </button>
            );
          })}
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:translate-y-[-1px] hover:shadow-xl"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Sektion 3 speichern & weiter zu Kundenservice (Support)
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
