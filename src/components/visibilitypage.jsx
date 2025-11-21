'use client';

import React, { useState, useEffect, useContext, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Plus, Minus, ChevronLeft, ChevronRight, CheckCircle, ChevronDown, Menu, X, CalendarCheck, Palette, Package, Megaphone, FileText, Users, BookOpen, Euro, Compass, Presentation, Loader2, MessageSquareText, ExternalLink, Quote } from "lucide-react"
// Images moved to public/images - using direct paths
// import HeroImage2 from "../images/heroimage3.jpg"
// import RapidWorksWebsite from "../images/laptop.png"
// import RapidWorksLogo from "../images/logo512.png"
// import QRCodeLogo from "../images/qrcode.png"
// import PlaceholderImage from "../images/more.png"
// import RapidWorksHoodie from "../images/hoodie.png"
// import RapidWorksBanner from "../images/banner2.png"
// import RapidWorksEmailSignature from "../images/rapidworksemailsignature.png"
// import BusinessCard from "../images/card.png"
// import PhoneMockLogo from "../images/phonelap.png"
// import RollupBanner from "../images/rollup.png"
// import PitchDeck from "../images/pitchdeck.jpg"
// import GuidelineBrand from "../images/guidelinebrand.jpg"
// import Calendar from "../images/calendar.png"
// import RLogo from "../images/rlogo.jpg"
// import VisibilityHero from "../images/background.png"
import Link from "next/link"
import { useRouter } from "next/navigation"
import BundleForm from "./BundleForm"
import { useLanguage } from "../contexts/LanguageContext"
import Modal from './Modal'
import NewsletterPopup from "./NewsletterPopup"
import FAQModal, { FAQItem } from './FAQModal'
import Footer from './Footer'
import AirtableForm from "./AirtableForm"
import RapidWorksHeader from "./new_landing_page_header"
import ExploreMoreSection from "./ExploreMoreSection"
import { useTestimonialsTranslation } from '../tolgee/hooks/useTestimonialsTranslation'
import TestimonialCard from "./TestimonialCard"
// import BrandingBg from '../images/branding bg.png'
// import HoodieBg from '../images/hoodiebg.png'
// import PricingBg from '../images/pricing_bg.png'
// import VisibilityAllInclusive from '../images/visibility_all_inclusive.png'
// import VisibilityProfessional from '../images/visibility_professional.png'
import { useAuth } from '../contexts/AuthContext'
import { useBrandingPageTranslation } from '../tolgee/hooks/useBrandingPageTranslation'

const BundleItem = ({ title, description, index, imageSrc }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="mb-12"
  >
    <div className="relative w-full h-64 mb-4 overflow-hidden">
      <img
        src={imageSrc || "/images/more.png"}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
    <h3 className="text-2xl font-light mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
)

const BundleSlider = ({ items, currentIndex, setCurrentIndex }) => {
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 1000)
    return () => clearInterval(timer)
  }, [items.length, setCurrentIndex])

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
          className="p-2 bg-black text-white hover:bg-gray-900 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
          className="p-2 bg-black text-white hover:bg-gray-900 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slider Content */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {items.map((item, index) => (
            <div key={index} className="min-w-full">
              <div className="grid grid-cols-2 gap-12">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.imageSrc || PlaceholderImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-3xl font-light mb-4">{item.title}</h3>
                  <p className="text-gray-600 text-lg mb-8">{item.description}</p>
                  <button className="inline-flex items-center text-black hover:text-gray-600 transition-colors group">
                    {item.learnMore || "Learn More"}
                    <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 flex items-center gap-4">
        <div className="text-sm text-gray-500">
          {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </div>
        <div className="flex-1 bg-gray-100 h-[2px]">
          <motion.div
            className="bg-black h-full origin-left"
            animate={{ scaleX: (currentIndex + 1) / items.length }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}

const BundleGrid = ({ items, currentIndex, setCurrentIndex }) => (
  <div className="flex justify-center mt-8">
    <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-full">
      {items.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentIndex(index)}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index
            ? "bg-violet-500 w-8"
            : "bg-white/20 hover:bg-white/40"
            }`}
        />
      ))}
    </div>
  </div>
)

// Update the BundleGridItem component to remove the Learn More button
const BundleGridItem = ({ title, description, imageSrc }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="aspect-[4/3] overflow-hidden mb-4">
      <img
        src={imageSrc || "/images/more.png"}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
    <h3 className="text-2xl font-light mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
)

const NewsletterForm = ({ content }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-light">{content?.newsletter?.title || "Subscribe to Our Newsletter"}</h3>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder={content?.newsletter?.placeholder || "Enter your email"}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            onFocus={() => setIsPopupOpen(true)} // Open popup on focus
            readOnly // Make it read-only since we're using the popup
          />
          <button
            onClick={() => setIsPopupOpen(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-md text-sm hover:bg-violet-700 transition-colors"
          >
            {content?.newsletter?.button || "Subscribe"}
          </button>
        </div>
      </div>

      {/* Controlled Newsletter Popup */}
      {isPopupOpen && (
        <NewsletterPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </>
  )
}

const BrandingTestimonialsSection = ({ content, testimonials }) => {
  const brandingTestimonials = testimonials.filter(
    t => t.services.includes("branding") && !t.isFeatured
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (brandingTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === brandingTestimonials.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [brandingTestimonials.length]);

  if (brandingTestimonials.length === 0) {
    return null;
  }

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + brandingTestimonials.length) % brandingTestimonials.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % brandingTestimonials.length);

  const currentTestimonial = brandingTestimonials[currentIndex];

  return (
    <section className="py-24 bg-[#F8F7FF]">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-4xl mx-auto">
           <div className="inline-flex items-center gap-3 text-[#7C3AED] text-sm font-semibold mb-6 px-5 py-2.5 rounded-full border-2 border-[#E9D5FF] bg-white shadow-sm">
              <FileText className="w-4 h-4 text-[#7C3AED]" />
              <span>{content.testimonials?.badge || "CLIENT FEEDBACK"}</span>
           </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.testimonials?.title || "Success with Rapid Branding"}
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {content.testimonials?.subtitle || "Hear from founders who quickly established their market presence with our package."}
          </p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border-t-4 border-[#A78BFA] relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side: Text content */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 text-purple-100 z-0">
                <Quote className="w-24 h-24" strokeWidth={1} />
          </div>
              <div className="relative z-10 flex flex-col h-full">
                <p className="text-gray-600 text-lg italic leading-relaxed flex-grow">
                  "{currentTestimonial.quote}"
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-2xl border-2 border-purple-200">
                      {currentTestimonial.authorName[0]}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-900">{currentTestimonial.authorName}</p>
                      <p className="text-gray-500 text-sm">{currentTestimonial.authorTitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Image slider */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <AnimatePresence initial={false}>
                <motion.img
                  key={currentIndex}
                  src={currentTestimonial.projectShowcaseImage}
                  alt={`${currentTestimonial.authorName}'s project showcase`}
                  className="absolute inset-0 w-full h-full object-contain"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </AnimatePresence>
              {brandingTestimonials.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 transition-colors z-20 shadow-md">
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
                  <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 transition-colors z-20 shadow-md">
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
        )}
            </div>
          </div>
        </div>
        
        {brandingTestimonials.length > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {brandingTestimonials.map((_, index) => (
              <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'w-8 bg-[#7C3AED]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const VisibiltyBundle = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const context = useLanguage()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const { currentUser } = useAuth()
  const router = useRouter()

  // Use Tolgee translations
  const content = useBrandingPageTranslation()
  const testimonials = useTestimonialsTranslation()

  const contentSectionRef = useRef(null)

  useEffect(() => {
      if (context) {
          setIsLoading(false);
      }
  }, [context]);

  if (isLoading || !context) {
    // console.log("VisibilityBundle: Waiting for context or still loading...")
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-purple-600" /></div>;
  }

  // Form is now embedded directly, no external URL needed

  const handleGetBundle = () => {
    if (!currentUser) {
      // Redirect to login with redirect back to this page
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    setIsModalOpen(true)
  }

  // pageContent removed - now using useBrandingPageTranslation hook

  const bundleItems = [
    {
      title: content.bundleItems.website.title,
      description: content.bundleItems.website.description,
      imageSrc: "/images/laptop.png",
    },
    {
      title: content.bundleItems.qrCode.title,
      description: content.bundleItems.qrCode.description,
      imageSrc: "/images/qrcode.png",
    },
    {
      title: content.bundleItems.socialMedia.title,
      description: content.bundleItems.socialMedia.description,
      imageSrc: "/images/banner2.png",
    },
    {
      title: content.bundleItems.stationery.title,
      description: content.bundleItems.stationery.description,
      imageSrc: "/images/card.png",
    },
    {
      title: content.bundleItems.wallpapers.title,
      description: content.bundleItems.wallpapers.description,
      imageSrc: "/images/phonelap.png",
    },
    {
      title: content.bundleItems.rollup.title,
      description: content.bundleItems.rollup.description,
      imageSrc: "/images/rollup.png",
    },
    {
      title: content.bundleItems.apparel.title,
      description: content.bundleItems.apparel.description,
      imageSrc: "/images/hoodie.png",
    }
  ]

  const faqItems = content.faq.items;

  const scrollToContent = () => {
    if (contentSectionRef.current) {
      contentSectionRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const containerClass = "max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative"

  return (
    <>
      <RapidWorksHeader />
      <div className="min-h-screen bg-white">
        <main className="relative w-full overflow-x-hidden">

          <section className="relative h-[70vh] min-h-[500px] overflow-hidden text-white">
            {/* Background image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/branding bg.png" 
                alt="Branding Background" 
                className="w-full h-full object-cover object-[center_-50%]"
              />
                </div>
            {/* Color overlay */}
            <div className="absolute inset-0 bg-[#270A5C]/90 z-10"></div>
            
            <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32 relative z-20 flex items-center justify-center h-full">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 sm:mb-8 leading-tight tracking-tight text-white">
                  {content.hero.title}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed font-medium px-2">
                  {content.hero.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={scrollToContent}
              className="absolute bottom-6 sm:bottom-12 left-0 right-0 flex justify-center animate-bounce cursor-pointer bg-transparent border-none focus:outline-none z-30"
              aria-label="Scroll to content"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/70 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </section>

          <section ref={contentSectionRef} className="py-20 bg-white">
            <div className={containerClass}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                  {/* Title */}
                  <h2 className="text-5xl md:text-6xl font-bold text-[#7C3BEC] leading-tight">
                    Rapid Branding
                  </h2>
                  
                  {/* Description */}
                  <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                    {content.mainText}
                  </p>

                  {/* Service Tags */}
                  <div className="space-y-4">
                    {/* First row - 2 items */}
                    <div className="flex gap-4">
                      {content.keyPoints.slice(0, 2).map((point, index) => (
                      <div
                        key={index}
                          className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#7C3BEC] text-black hover:bg-[#7C3BEC]/5 transition-colors bg-white"
                      >
                          <div className="w-3 h-3 rounded-full border-2 border-[#7C3BEC] bg-transparent relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C3BEC]"></div>
                        </div>
                          <span className="text-base font-medium">{point}</span>
                      </div>
                    ))}
                  </div>
                    
                    {/* Second row - 2 items */}
                    <div className="flex gap-4">
                      {content.keyPoints.slice(2, 4).map((point, index) => (
                        <div
                          key={index + 2}
                          className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#7C3BEC] text-black hover:bg-[#7C3BEC]/5 transition-colors bg-white"
                        >
                          <div className="w-3 h-3 rounded-full border-2 border-[#7C3BEC] bg-transparent relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C3BEC]"></div>
                          </div>
                          <span className="text-base font-medium">{point}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Third row - 1 item and "und mehr..." text */}
                    <div className="flex items-center gap-4">
                      {content.keyPoints.length > 4 && (
                        <div
                          className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#7C3BEC] text-black hover:bg-[#7C3BEC]/5 transition-colors bg-white"
                        >
                          <div className="w-3 h-3 rounded-full border-2 border-[#7C3BEC] bg-transparent relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C3BEC]"></div>
                          </div>
                          <span className="text-base font-medium">{content.keyPoints[4]}</span>
                        </div>
                      )}
                  
                  {/* "und mehr..." text */}
                  <p className="text-gray-600 text-lg font-medium">
                    {content.seeMore}
                  </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleGetBundle}
                    className="inline-flex items-center justify-center px-8 py-4 text-white font-medium rounded-3xl transition-all duration-300 hover:shadow-lg hover:scale-105"
                    style={{ backgroundColor: '#FF6B6B' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#FF5252'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B6B'}
                  >
                      {content.cta}
                  </button>
                </div>

                {/* Right Visual */}
                <div className="relative">
                  <img
                    src="/images/more.png"
                    alt="Rapid Branding Showcase"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Inhalt Section */}
          <section className="py-20 md:py-32" style={{ backgroundColor: '#8B2CDF' }}>
            <div className={containerClass}>
              <div className="text-center text-white max-w-4xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 mb-8">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <span className="text-sm font-medium uppercase tracking-wider">
                    {content.inhalt.badge}
                  </span>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
                  {content.inhalt.title}
                </h2>
                
                {/* Description */}
                <p className="text-lg md:text-xl lg:text-2xl leading-loose font-light opacity-95">
                  {content.inhalt.description}
                </p>
              </div>
            </div>
          </section>

          <section id="features" className="py-20 md:py-40 overflow-hidden relative" style={{ backgroundColor: '#492c6f' }}>
            <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 md:px-12 relative">
              <div className="space-y-24 relative">
                {bundleItems.slice(0, 6).map((item, index) => {
                  // Special styling for QR-Code (index 1) and Rollup (index 5)
                  const isSpecialCard = index === 1 || index === 5;
                  // Special styling with white border for Business Card (index 3)
                  const isWhiteBorderCard = index === 3;
                  
                  if (isSpecialCard) {
                    return (
              <motion.div
                        key={index}
                        className="relative group"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        <div className="bg-[#301d49] rounded-[3rem] p-8 md:p-12 text-white">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Text Content */}
                            <div className="space-y-6">
                              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                                {item.title}
                              </h3>
                              <p className="text-white/90 text-base md:text-lg" style={{ lineHeight: '2' }}>
                                {item.description}
                              </p>
                            </div>
                            
                            {/* Visual */}
                            <div className="relative aspect-[4/3] flex items-center justify-center">
                              <img
                                src={item.imageSrc || PlaceholderImage}
                                alt={item.title}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }
                  
                  if (isWhiteBorderCard) {
                    return (
                      <motion.div
                        key={index}
                        className="relative group"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        <div className="border-2 border-white/60 rounded-[3rem] p-8 md:p-12 bg-transparent">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Text Content */}
                            <div className="space-y-6">
                              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                                {item.title}
                              </h3>
                              <p className="text-white/90 text-base md:text-lg" style={{ lineHeight: '2' }}>
                                {item.description}
                              </p>
                            </div>
                            
                            {/* Visual */}
                            <div className="relative aspect-[4/3] flex items-center justify-center">
                              <img
                                src={item.imageSrc || PlaceholderImage}
                                alt={item.title}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          </div>
                        </div>
              </motion.div>
                    );
                  }

                  // Default styling for other items
                  return (
                  <motion.div
                    key={index}
                    className="relative group"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16 lg:gap-24`}>
                      <div className="w-full md:w-1/2">
                        <div className="relative aspect-[4/3] overflow-hidden group rounded-3xl">
                            <div className="h-full transform-gpu flex items-center justify-center">
                            <img
                              src={item.imageSrc || PlaceholderImage}
                              alt={item.title}
                                className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-1/2">
                        <div className="relative">
                          <div className="space-y-6 md:space-y-8">
                            <div className="space-y-4 md:space-y-6">
                                <h3 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-tight text-white leading-relaxed pb-1">
                                {item.title}
                              </h3>
                                <p className={`text-white/90 text-base md:text-lg lg:text-xl`} style={{ lineHeight: '2' }}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Hoodie Section with Background */}
          <section className="pt-6 md:pt-8 pb-20 md:pb-40 overflow-hidden relative" style={{ backgroundColor: '#492c6f' }}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/hoodiebg.png" 
                alt="Background" 
                className="w-full h-full object-cover opacity-10"
              />
              {/* Top fade overlay */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#492c6f] to-transparent z-10"></div>
            </div>
            <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 md:px-12 relative z-10">
              <div className="space-y-24 relative">
                {bundleItems.slice(6).map((item, index) => {
                  const actualIndex = index + 6;
                  const isHoodie = actualIndex === 6;
                  
                  return (
                    <motion.div
                      key={actualIndex}
                      className="relative group"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className="border-2 border-white/60 rounded-[3rem] p-8 md:p-12 bg-transparent">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center lg:grid-flow-col-dense">
                          {/* Text Content */}
                          <div className="space-y-6 lg:col-start-2">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-white/90 text-base md:text-lg" style={{ lineHeight: '2' }}>
                              {item.description}
                            </p>
                          </div>
                          
                          {/* Visual */}
                          <div className="relative aspect-[4/3] flex items-center justify-center lg:col-start-1">
                            <img
                              src={item.imageSrc || PlaceholderImage}
                              alt={item.title}
                              className="max-w-full max-h-full object-contain drop-shadow-2xl"
                              style={{ filter: 'drop-shadow(0 0 40px rgba(124, 59, 236, 0.8))' }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Why Rapid Branding Section */}
          <section className="py-20 md:py-32" style={{ backgroundColor: '#F3F0FF' }}>
            <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 md:px-12">
              <div className="text-center mb-16">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-purple-300 text-purple-600 mb-8 bg-white/50">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium uppercase tracking-wider">
                    {content.benefits.badge}
                  </span>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-16">
                  {content.benefits.title}
                </h2>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.benefits.items.map((benefit, index) => {
                  const icons = [
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>,
                    <img src="/images/visibility_all_inclusive.png" alt="All inclusive icon" className="w-12 h-12" />,
                    <img src="/images/visibility_professional.png" alt="Professional appearance icon" className="w-12 h-12" />,
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ];
                  
                  return (
                    <div key={index} className="rounded-[32px] p-8 text-center text-white min-h-[400px] flex flex-col relative overflow-hidden" 
                         style={{ 
                           backgroundColor: '#BB86FF',
                           boxShadow: '0 20px 40px rgba(146, 87, 221, 0.3)'
                         }}>
                      {/* Bottom gradient border */}
                      <div className="absolute bottom-0 left-0 right-0 h-1" 
                           style={{ background: 'linear-gradient(270deg, #9257DD 23.12%, rgba(255, 107, 107, 0.3) 49.61%, #9257DD 81.85%)' }}></div>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8" style={{ background: 'linear-gradient(to bottom right, #9257DD, #540E92)' }}>
                        {icons[index]}
                      </div>
                      <h3 className="text-xl font-black mb-6 text-[#2D1B69]">{benefit.title}</h3>
                      <p className="text-[#2D1B69] leading-relaxed flex-grow">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 md:py-24 relative overflow-hidden" style={{ backgroundColor: '#270A5C' }}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="/images/pricing_bg.png" 
                alt="Pricing Background" 
                className="w-full h-full object-cover opacity-25"
              />
              {/* Color overlay */}
              <div className="absolute inset-0 bg-[#270A5C]/70"></div>
            </div>
            <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 md:px-12 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  {content.pricing.title}
                </h2>
                <p className="text-xl md:text-2xl text-white/90 font-light">
                  {content.pricing.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
                {/* Pricing Card */}
                <div className="order-1 lg:order-1 lg:col-span-2">
                  <div className="rounded-[32px] p-8 md:p-10 text-center h-full flex flex-col relative overflow-hidden border-2 border-white/60"
                       style={{ 
                         background: 'linear-gradient(140.21deg, #6A20AA 27.33%, #390866 56.88%)'
                       }}>
                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-7xl md:text-8xl font-bold text-white mb-2">
                        {content.pricing.price}
                      </div>
                    </div>

                    {/* What you get */}
                    <div className="mb-6 flex-grow">
                      <h3 className="text-xl font-black text-white mb-6">
                        {content.pricing.whatYouGet}
                      </h3>
                      <div className="space-y-4">
                        {content.pricing.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-center gap-3">
                              <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                            <span className="text-white text-lg">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-4 px-8 rounded-3xl font-semibold text-white transition-all duration-300 hover:scale-105 text-lg"
                      style={{ backgroundColor: '#FF6B6B' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#FF5252'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#FF6B6B'}
                    >
                      {content.pricing.cta}
                    </button>
                  </div>
                </div>

                {/* Information Cards */}
                <div className="order-2 lg:order-2 lg:col-span-3 h-full flex flex-col gap-6">
                  {/* Editable Files Card */}
                  <div className="rounded-[32px] p-8 border-2 border-white/60 bg-transparent flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-white mb-6">
                      {content.pricing.editableFiles.title}
                    </h3>
                    <p className="text-white/90 text-lg leading-relaxed flex-grow">
                      {content.pricing.editableFiles.description}
                    </p>
                  </div>

                  {/* Flexible Adjustments Card */}
                  <div className="rounded-[32px] p-8 border-2 border-white/60 bg-transparent flex-1 flex flex-col justify-center">
                    <p className="text-white/90 text-lg leading-relaxed">
                      {content.pricing.flexibleAdjustments.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <BrandingTestimonialsSection content={content} testimonials={testimonials} />

          <section className="py-16 md:py-20 relative overflow-hidden" 
                   style={{ background: 'linear-gradient(63.21deg, #19042C 36.84%, #3B2888 96.53%)' }}>
            <div className={containerClass}>
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  {content.faqSection.title}
                </h2>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="rounded-[32px] p-6 md:p-8" 
                     style={{ background: 'linear-gradient(63.21deg, #3B2888 36.84%, #19042C 96.53%)' }}>
                  <div className="space-y-4">
                {faqItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="border-b border-white/20 last:border-b-0 pb-4 last:pb-0">
                  <FAQItem
                    key={index}
                    question={item.question}
                    answer={item.answer}
                          isDark={true}
                          isOpen={openFaqIndex === index}
                          onToggle={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  />
                      </div>
                ))}
                  </div>

                  <div className="pt-6 text-center border-t border-white/20 mt-6">
                  <button
                    onClick={() => setIsFAQModalOpen(true)}
                      className="inline-flex items-center text-white hover:text-white/80 font-medium text-lg transition-colors"
                  >
                      {content.faqSection.showAll}
                      <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20">
            <div className={containerClass}>
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-black mb-8 text-black">
                  {content.finalCta.title}
                </h2>
                <p className="text-xl mb-8 text-gray-600">
                  {content.finalCta.subtitle}
                </p>
                <button
                  onClick={() => window.open('https://calendly.com/yannick-familie-heeren/30min', '_blank')}
                  className="text-white px-8 py-3 rounded-3xl font-light transition duration-300 inline-flex items-center text-lg"
                  style={{ backgroundColor: '#7C3BEC' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#6B2DD4'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#7C3BEC'}
                >
                  {content.finalCta.cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </section>

          <ExploreMoreSection excludeService="Branding" />

        </main>

        {showForm && <BundleForm onClose={() => setShowForm(false)} />}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <FAQModal 
          isOpen={isFAQModalOpen}
          onClose={() => setIsFAQModalOpen(false)}
          faqItems={faqItems}
        />

      </div>
    </>
  )
}

const CurvedArrow = () => {
  return (
    <div className="absolute w-full h-24 bottom-0 left-0 overflow-visible pointer-events-none">
      <svg
        viewBox="0 0 400 100"
        className="w-full h-full"
        style={{ transform: 'translateY(50%)' }}
      >
        <path
          d="M350,10 Q200,120 50,10"
          fill="none"
          stroke="#FF4500"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-draw"
        >
          <animate
            attributeName="strokeDashoffset"
            from="1000"
            to="0"
            dur="2s"
            fill="freeze"
          />
        </path>
        <path
          d="M60,10 L50,10 L55,20"
          fill="none"
          stroke="#FF4500"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default VisibiltyBundle