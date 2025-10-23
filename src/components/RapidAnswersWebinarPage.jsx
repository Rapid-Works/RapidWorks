'use client';

import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight,
  Gift,
  Lightbulb,
  Target,
  Loader2,
  X,
  User,
  Star,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { LanguageContext as AppLanguageContext } from '../contexts/LanguageContext';
import RapidWorksHeader from './new_landing_page_header';
import ExploreMoreSection from './ExploreMoreSection';
import WebinarModal from './WebinarModal';
import { getNextWebinarDates } from '../utils/dateUtils';
// Import the same image used for Rapid Answers on the landing page
import LandingRapidAnswers from "../images/landing_rapid_ansewes.png";
import YannickProfile from "../images/yannick_plain_bg.png";

const RapidAnswersWebinarPage = () => {
  const context = useContext(AppLanguageContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebinarModalOpen, setIsWebinarModalOpen] = useState(false);
  const contentSectionRef = useRef(null);
  const whySectionRef = useRef(null);

  // Get webinar dates
  const webinarDates = getNextWebinarDates(3);

  useEffect(() => {
    if (context) {
      setIsLoading(false);
    }
  }, [context]);

  // Function to scroll
  const scrollToContent = () => {
    contentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWhySection = () => {
    whySectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Page content with translations
  const content = {
    en: {
      hero: {
        badgeText: "Rapid Answers Webinar",
        title: "Get Expert Startup Answers",
        subtitle: "Join Yannick personally answering your startup questions. Submit your questions and get actionable insights to accelerate your startup journey.",
        scrollIndicatorAria: "Scroll to details"
      },
      whySection: {
        title: "Why Attend Rapid Answers?",
        description: "Get direct access to experienced founder insights and practical solutions for your startup challenges. Every question is answered personally by Yannick, who has built multiple successful startups.",
        ctaButton: "Register for Free"
      },
      schedule: {
        title: "Next Webinar Sessions",
        duration: "60 minutes",
        format: "Free online webinar",
        registerText: "Register for the next session"
      },
      host: {
        title: "Meet Your Host",
        subtitle: "Learn from an experienced founder who has been in your shoes.",
        name: "Yannick Heeren",
        role: "CEO RapidWorks",
        bio: "Founder and CEO of RapidWorks, with experience building and scaling multiple startups. Yannick has recruited hundreds of employees, served thousands of customers, and personally coached over 50 startups.",
        badgeText: "Your Host",
        subtext: "Founded 3 Startups and coached 50+ Startups"
      },
      howItWorks: {
        title: "How It Works",
        subtitle: "A simple process to get your startup questions answered by an experienced founder.",
        steps: [
          {
            title: "Submit Questions",
            description: "Use our registration form to submit your startup questions in advance."
          },
          {
            title: "Join the Webinar", 
            description: "Attend the live session - completely free and online."
          },
          {
            title: "Get Expert Answers",
            description: "Yannick will personally address each submitted question during the session."
          }
        ]
      },
      benefits: {
        badge: "WHY RAPID ANSWERS",
        title: "Why Choose Our Webinar",
        items: [
          {
            title: "Free of Charge",
            description: "No cost to attend - we're here to help the startup community succeed."
          },
          {
            title: "Personal Answers",
            description: "Yannick personally addresses each question with tailored advice."
          },
          {
            title: "Real Experience", 
            description: "Learn from someone who has built multiple successful startups."
          },
          {
            title: "Community Learning",
            description: "Benefit from other founders' questions and shared experiences."
          }
        ]
      },
      whoSection: {
        title: "Who Should Attend?",
        description: "Perfect for founders who want to hear answers to their own questions and learn from others' experiences.",
        targetAudience: [
          "Early-stage startup founders",
          "Entrepreneurs with specific challenges", 
          "Anyone looking to validate their startup ideas",
          "Founders seeking experienced guidance"
        ]
      },
      cta: {
        title: "Ready to Get Your Questions Answered?",
        subtitle: "Join our next webinar session and get the startup guidance you need.",
        buttonText: "Register for Free"
      }
    },
    de: {
      hero: {
        badgeText: "Rapid Answers Webinar",
        title: "Erhalte Experten Startup-Antworten", 
        subtitle: "Yannick beantwortet persönlich deine Startup-Fragen. Reiche deine Fragen ein und erhalte umsetzbare Insights für deinen Startup-Erfolg.",
        scrollIndicatorAria: "Zu den Details scrollen"
      },
      whySection: {
        title: "Warum an Rapid Answers teilnehmen?",
        description: "Erhalte direkten Zugang zu erfahrenen Gründer-Insights und praktischen Lösungen für deine Startup-Herausforderungen. Jede Frage wird persönlich von Yannick beantwortet, der mehrere erfolgreiche Startups aufgebaut hat.",
        ctaButton: "Kostenlos registrieren"
      },
      schedule: {
        title: "Nächste Webinar-Sessions",
        duration: "60 Minuten",
        format: "Kostenloses Online-Webinar",
        registerText: "Für die nächste Session registrieren"
      },
      host: {
        title: "Triff deinen Host",
        subtitle: "Lerne von einem erfahrenen Gründer, der in deinen Schuhen gesteckt hat.",
        name: "Yannick Heeren", 
        role: "CEO RapidWorks",
        bio: "Gründer und CEO von RapidWorks, mit Erfahrung im Aufbau und der Skalierung mehrerer Startups. Yannick hat Hunderte von Mitarbeitern rekrutiert, Tausende von Kunden bedient und persönlich über 50 Startups gecoacht.",
        badgeText: "Dein Host",
        subtext: "3 Startups gegründet und 50+ Startups gecoacht"
      },
      howItWorks: {
        title: "So funktioniert's",
        subtitle: "Ein einfacher Prozess, um deine Startup-Fragen von einem erfahrenen Gründer beantwortet zu bekommen.",
        steps: [
          {
            title: "Fragen einreichen",
            description: "Nutze unser Anmeldeformular, um deine Startup-Fragen im Voraus einzureichen."
          },
          {
            title: "Am Webinar teilnehmen",
            description: "Nimm an der Live-Session teil - komplett kostenlos und online."
          },
          {
            title: "Experten-Antworten erhalten", 
            description: "Yannick wird persönlich jede eingereichte Frage während der Session beantworten."
          }
        ]
      },
      benefits: {
        badge: "WARUM RAPID ANSWERS",
        title: "Warum unser Webinar wählen",
        items: [
          {
            title: "Kostenlos",
            description: "Keine Kosten für die Teilnahme - wir sind da, um der Startup-Community zu helfen."
          },
          {
            title: "Persönliche Antworten",
            description: "Yannick geht persönlich auf jede Frage mit maßgeschneiderten Ratschlägen ein."
          },
          {
            title: "Echte Erfahrung",
            description: "Lerne von jemandem, der mehrere erfolgreiche Startups aufgebaut hat."
          },
          {
            title: "Community-Lernen", 
            description: "Profitiere von den Fragen anderer Gründer und geteilten Erfahrungen."
          }
        ]
      },
      whoSection: {
        title: "Wer sollte teilnehmen?",
        description: "Perfekt für Gründer, die Antworten auf ihre eigenen Fragen hören und von den Erfahrungen anderer lernen möchten.",
        targetAudience: [
          "Early-Stage Startup-Gründer",
          "Unternehmer mit spezifischen Herausforderungen",
          "Alle, die ihre Startup-Ideen validieren möchten", 
          "Gründer, die erfahrene Beratung suchen"
        ]
      },
      cta: {
        title: "Bereit, deine Fragen beantwortet zu bekommen?",
        subtitle: "Nimm an unserer nächsten Webinar-Session teil und erhalte die Startup-Beratung, die du brauchst.",
        buttonText: "Kostenlos registrieren"
      }
    }
  };

  if (isLoading || !context) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-green-600" /></div>;
  }

  const { language } = context;
  const pageContent = content[language];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-200 selection:text-green-900">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-30 pointer-events-none z-0"></div>

      <RapidWorksHeader />

      {/* === Hero Section === */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden text-white">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={LandingRapidAnswers}
            alt="Rapid Answers Webinar Hero Background"
            className="w-full h-full object-cover object-center"
          />
        </div>
        {/* Color overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/70 to-emerald-600/70 z-10"></div>

        {/* Apply consistent padding and z-index */}
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32 flex flex-col justify-center relative z-20 h-full">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 mb-6">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-sm font-medium uppercase tracking-wider">
                {pageContent.hero.badgeText}
              </span>
            </div>
            
            {/* Ensure standardized font size */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 sm:mb-8 leading-tight tracking-tight text-white">
              {pageContent.hero.title}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed font-medium px-2 mb-6">
              {pageContent.hero.subtitle}
            </p>
            
            {/* Next webinar date pill */}
            {webinarDates.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-full mb-4 shadow-lg border border-white/30">
                <Calendar className="h-4 w-4 opacity-80" />
                <span className="text-sm">
                  Next: {webinarDates[0].toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { 
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric'
                  })} at 17:00
                </span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={scrollToWhySection}
          className="absolute bottom-6 sm:bottom-12 left-0 right-0 flex justify-center animate-bounce cursor-pointer bg-transparent border-none focus:outline-none z-30"
          aria-label={pageContent.hero.scrollIndicatorAria}
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/70 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      {/* Main Content */}
      <main className="py-20">
        <div className="container mx-auto px-6">
          {/* Add ref to the "Why" Section */}
          <div ref={whySectionRef} className="bg-white rounded-3xl overflow-hidden mb-20 relative p-16 md:p-20 text-center shadow-xl max-w-6xl mx-auto">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzAwMCIvPgo8L3N2Zz4K')] z-0"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 leading-tight max-w-4xl mx-auto">{pageContent.whySection.title}</h2>
              <p className="text-gray-700 text-xl md:text-2xl mb-14 mx-auto max-w-5xl leading-relaxed font-light">
                {pageContent.whySection.description}
              </p>

              <div className="flex justify-center">
                <button
                  className="bg-[#10B981] hover:bg-[#059669] text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 sm:gap-3 group text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 whitespace-nowrap"
                  onClick={() => setIsWebinarModalOpen(true)}
                >
                  {pageContent.whySection.ctaButton}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Webinar Schedule Section */}
      <section className="py-20 bg-gradient-to-br from-green-400 to-emerald-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">{pageContent.schedule.title}</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {pageContent.schedule.format} • {pageContent.schedule.duration}
            </p>
          </div>

          {/* Webinar Dates Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {webinarDates.map((date, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-white mx-auto mb-3" />
                  <div className="text-lg font-bold text-white mb-1">
                    {date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-white/80 text-sm">
                    {date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', { year: 'numeric' })}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 text-white/90">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">17:00 (5:00 PM)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-3 group mx-auto text-lg shadow-lg hover:shadow-xl hover:scale-105"
              onClick={() => setIsWebinarModalOpen(true)}
            >
              {pageContent.schedule.registerText}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Host Profile Section */}
      <section className="py-20 bg-gradient-to-br from-green-400 to-green-600 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">{pageContent.host.title}</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {pageContent.host.subtitle}
            </p>
          </div>

          {/* Main Host Card */}
          <div className="bg-transparent rounded-3xl overflow-hidden mb-8 max-w-6xl mx-auto border-2 border-white relative pt-12">
            <div className="absolute top-8 left-8 z-10">
              <div className="bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{pageContent.host.badgeText}</span>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/5 relative">
                <div className="aspect-[4/5] lg:aspect-auto lg:h-full relative">
                  <img
                    src={YannickProfile}
                    alt={pageContent.host.name}
                    className="w-full h-full object-cover object-center filter drop-shadow-[0_15px_45px_rgba(16,185,129,0.6)]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 pt-12" style={{ background: 'linear-gradient(to top, rgba(16, 185, 129, 0.5) 10%, transparent 100%)' }}>
                    <h3 className="text-3xl font-bold text-white mb-1">{pageContent.host.name}</h3>
                    <p className="text-white/90 text-lg">{pageContent.host.role}</p>
                    <p className="text-white/80 text-sm mt-1">{pageContent.host.subtext}</p>
                  </div>
                </div>
              </div>

              <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
                <p className="text-white/95 text-lg lg:text-xl leading-relaxed mb-8">
                  {pageContent.host.bio}
                </p>
                
                <button
                  className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-3 group text-lg shadow-lg hover:shadow-xl hover:scale-105 w-fit"
                  onClick={() => setIsWebinarModalOpen(true)}
                >
                  {pageContent.whySection.ctaButton}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6">
        {/* How It Works Section */}
        <div className="mb-20 pt-20">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{pageContent.howItWorks.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {pageContent.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-x-8 gap-y-16">
            {pageContent.howItWorks.steps.map((step, index) => {
              const icons = [<MessageSquare className="h-7 w-7 text-green-500" />, <Calendar className="h-7 w-7 text-green-500" />, <Target className="h-7 w-7 text-green-500" />];
              return (
                <div key={index} className="relative">
                  <div className="absolute -top-8 left-4 w-16 h-16 bg-green-300 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-8 h-full border border-gray-100 pt-12">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0">
                        {icons[index % icons.length]}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <section className="py-20 md:py-32" style={{ backgroundColor: '#F0FDF4' }}>
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 md:px-12">
            <div className="text-center mb-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-green-300 text-green-600 mb-8 bg-white/50">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium uppercase tracking-wider">
                  {pageContent.benefits.badge}
                </span>
              </div>
              
              {/* Title */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-16">
                {pageContent.benefits.title}
              </h2>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pageContent.benefits.items.map((benefit, index) => {
                const icons = [
                  <Gift className="h-8 w-8 text-white" />,
                  <User className="h-8 w-8 text-white" />,
                  <Star className="h-8 w-8 text-white" />,
                  <Users className="h-8 w-8 text-white" />
                ];
                
                return (
                  <div key={index} className="rounded-[32px] p-8 text-center text-white min-h-[400px] flex flex-col relative overflow-hidden" 
                       style={{ 
                         backgroundColor: '#10B981',
                         boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
                       }}>
                    {/* Bottom gradient border */}
                    <div className="absolute bottom-0 left-0 right-0 h-1" 
                         style={{ background: 'linear-gradient(270deg, #059669 23.12%, rgba(255, 107, 107, 0.3) 49.61%, #059669 81.85%)' }}></div>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8" style={{ background: 'linear-gradient(to bottom right, #059669, #047857)' }}>
                      {icons[index]}
                    </div>
                    <h3 className="text-xl font-black mb-6 text-white">{benefit.title}</h3>
                    <p className="text-white/90 leading-relaxed flex-grow">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Who Should Attend Section */}
        <div className="mb-20 pt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{pageContent.whoSection.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {pageContent.whoSection.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pageContent.whoSection.targetAudience.map((audience, index) => (
              <div key={index} className="flex items-center gap-4 p-6 bg-green-50 rounded-2xl border border-green-200">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 text-lg">{audience}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <section className="py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-8">
              {pageContent.cta.title}
            </h2>
            <p className="text-xl mb-8 text-gray-600">
              {pageContent.cta.subtitle}
            </p>
            <button
              onClick={() => setIsWebinarModalOpen(true)}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-8 py-4 rounded-full font-semibold transition-all inline-flex items-center text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              {pageContent.cta.buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>
      </div>

      {/* Webinar Modal */}
      <WebinarModal
        isOpen={isWebinarModalOpen}
        onClose={() => setIsWebinarModalOpen(false)}
        webinarDates={webinarDates}
      />

      {/* Add the new component */}
      <ExploreMoreSection excludeService="Webinar" />
    </div>
  );
};

export default RapidAnswersWebinarPage;