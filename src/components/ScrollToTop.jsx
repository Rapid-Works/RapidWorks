'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Force scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Changed from default smooth behavior
    });
  }, [pathname]); // This will run on every route change

  return null;
};

export default ScrollToTop; 