'use client';

import React from 'react';
import Link from 'next/link';
import { Megaphone, Users, FileText, Compass, Euro, ArrowRight, Handshake } from 'lucide-react';
import { useExploreMoreTranslation } from '../tolgee/hooks/useExploreMoreTranslation';

const ExploreMoreSection = ({ excludeService }) => {
  // Use Tolgee translations
  const content = useExploreMoreTranslation();

  // Define all possible services
  const allServices = [
    { icon: <Megaphone className="h-8 w-8" />, labelKey: "Branding", path: "/branding" },
    { icon: <Users className="h-8 w-8" />, labelKey: "Experts", path: "/experts" },
    { icon: <Handshake className="h-8 w-8" />, labelKey: "Partners", path: "/partners" },
    { icon: <Compass className="h-8 w-8" />, labelKey: "Coaching", path: "/coaching" },
    { icon: <Euro className="h-8 w-8" />, labelKey: "Financing", path: "/financing" }
  ];

  // Filter out the service specified by the prop
  const servicesToShow = allServices.filter(service => service.labelKey !== excludeService);

  // Dynamically adjust title using the service name
  const serviceToBeMentioned = excludeService
    ? (content.services[excludeService] || excludeService)
    : (content.services["Branding"] || "Branding");

  // Get the dynamic title with the service name
  const dynamicTitle = content.getTitle(serviceToBeMentioned);


  const containerClass = "max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative";

  return (
    <section className="py-20 md:py-32" style={{ background: 'linear-gradient(63.21deg, #19042C 36.84%, #3B2888 96.53%)' }}>
      <div className={containerClass}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white mb-8 bg-white/5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-sm font-medium uppercase tracking-wider">
            {content.badge}
            </span>
          </div>
          
          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {dynamicTitle}
          </h2>
          
          {/* Description */}
          <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
            {content.description}
          </p>
          
          {/* Service Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            {servicesToShow.map((item, index) => (
              <Link href={item.path}
                key={index} 
                className="bg-white/10 backdrop-blur-sm p-6 md:p-8 rounded-3xl flex flex-col items-center gap-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 min-h-[140px] justify-center border border-white/10"
              >
                <div className="text-white">
                {item.icon}
                </div>
                <span className="text-white text-lg font-medium text-center">{content.services[item.labelKey]}</span>
              </Link>
            ))}
          </div>
          
          {/* CTA Button */}
          <Link href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-3xl transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#8B2CDF' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7A25CD'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8B2CDF'}
          >
              {content.cta}
            <ArrowRight className="ml-3 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ExploreMoreSection; 