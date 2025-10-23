'use client';

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

const TrackingRedirect = () => {
  const { trackingCode } = useParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleRedirect = () => {
      // Prevent double execution (React StrictMode protection)
      if (hasProcessed.current || !trackingCode) {
        return;
      }

      hasProcessed.current = true;
      console.log('🚀 Ultra-fast redirect for code:', trackingCode);

      // ULTRA-OPTIMIZATION: Immediate redirect without async/await overhead
      const serverRedirectUrl = `https://us-central1-landingpage-606e9.cloudfunctions.net/trackingRedirect/${trackingCode}`;
      
      // IMMEDIATE redirect - no try/catch to avoid overhead
      window.location.replace(serverRedirectUrl);
    };

    // Execute immediately - this should be nearly instantaneous
    handleRedirect();
  }, [trackingCode]);

  // ULTRA-OPTIMIZATION: Preload the server function URL for even faster redirects
  useEffect(() => {
    if (trackingCode) {
      const serverRedirectUrl = `https://us-central1-landingpage-606e9.cloudfunctions.net/trackingRedirect/${trackingCode}`;
      
      // Preload the redirect URL (DNS lookup, connection establishment)
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = serverRedirectUrl;
      document.head.appendChild(link);
      
      // Clean up
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [trackingCode]);

  // ULTRA-MINIMAL loading state - absolute minimum rendering
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{ 
        width: '16px', 
        height: '16px', 
        border: '2px solid #7C3BEC', 
        borderTop: '2px solid transparent', 
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {/* FALLBACK: Meta refresh for non-JS environments */}
      <meta httpEquiv="refresh" content={`0;url=https://us-central1-landingpage-606e9.cloudfunctions.net/trackingRedirect/${trackingCode}`} />
    </div>
  );
};

export default TrackingRedirect;
