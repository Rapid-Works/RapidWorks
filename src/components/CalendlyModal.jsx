'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const CalendlyModal = ({ isOpen, onClose, userName, userEmail, onBookingComplete }) => {
  const calendlyRef = useRef(null);

  useEffect(() => {
    if (isOpen && calendlyRef.current) {
      // Clear any existing content
      calendlyRef.current.innerHTML = '';

      // Build Calendly URL with name, email, and simple MID message
      const baseUrl = 'https://calendly.com/yannick-familie-heeren/30min';
      const params = new URLSearchParams();
      
      if (userName) {
        params.append('name', userName);
      }
      if (userEmail) {
        params.append('email', userEmail);
      }
      
      // Add simple MID message
      params.append('a1', 'MID');
      
      const calendlyUrl = `${baseUrl}?${params.toString()}`;

      // Create Calendly embed
      const calendlyWidget = document.createElement('div');
      calendlyWidget.className = 'calendly-inline-widget';
      calendlyWidget.setAttribute('data-url', calendlyUrl);
      calendlyWidget.style.minWidth = '320px';
      calendlyWidget.style.height = 'calc(95vh - 80px)';

      calendlyRef.current.appendChild(calendlyWidget);

      // Load Calendly widget script
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      
      // Add event listener for Calendly events
      script.onload = () => {
        // Listen for Calendly events
        window.addEventListener('message', (event) => {
          if (event.data.event && event.data.event === 'calendly.event_scheduled') {
            console.log('✅ Calendly booking completed:', event.data);
            // Automatically mark booking task as complete
            if (onBookingComplete) {
              onBookingComplete();
            }
            // Close the modal
            onClose();
          }
        });
      };
      
      document.head.appendChild(script);
    }
  }, [isOpen, userName, userEmail]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-lg max-w-6xl w-full h-[95vh] overflow-hidden shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-end p-2 border-b border-gray-200">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Calendly Content */}
          <div className="p-2 h-full">
            <div ref={calendlyRef} className="w-full h-full" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CalendlyModal;
