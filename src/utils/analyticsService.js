import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const db = getFirestore();
const functions = getFunctions();

// Initialize Bit.ly functions
const createBitlyShortLink = httpsCallable(functions, 'createBitlyShortLink');

// Generate a unique tracking code
const generateTrackingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if tracking code is unique
const isTrackingCodeUnique = async (code) => {
  try {
    const q = query(collection(db, 'trackingLinks'), where('trackingCode', '==', code));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking tracking code uniqueness:', error);
    return false;
  }
};

// Generate unique tracking code
const generateUniqueTrackingCode = async () => {
  let code;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    code = generateTrackingCode();
    isUnique = await isTrackingCodeUnique(code);
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique tracking code');
  }
  
  return code;
};

// Create a new tracking link
export const createTrackingLink = async (linkData) => {
  try {
    const trackingCode = await generateUniqueTrackingCode();
    // Use production domain for tracking URLs
    const baseUrl = 'https://www.rapid-works.io';
    
    // Create the original tracking URL
    const originalTrackingUrl = `${baseUrl}/t/${trackingCode}`;
    
    // Try to create a Bit.ly short link for the tracking URL
    let shortUrl = originalTrackingUrl;
    let bitlyId = null;
    let bitlySuccess = false;
    
    // Only create Bit.ly links if user prefers Bit.ly AND it's a production URL (not localhost)
    if (linkData.useBitly !== false && !originalTrackingUrl.includes('localhost') && !originalTrackingUrl.includes('127.0.0.1')) {
      try {
        console.log('🔗 Creating Bit.ly short link for tracking URL:', originalTrackingUrl);
        
        // Validate URL before sending to Bit.ly
        try {
          new URL(originalTrackingUrl);
        } catch (urlError) {
          console.warn('⚠️ Invalid URL format, skipping Bit.ly:', originalTrackingUrl);
          throw new Error('Invalid URL format');
        }
        
        const bitlyResult = await createBitlyShortLink({
          longUrl: originalTrackingUrl,
          title: linkData.name || 'RapidWorks Tracking Link'
        });
        
        if (bitlyResult.data.success) {
          shortUrl = bitlyResult.data.shortUrl;
          bitlyId = bitlyResult.data.id;
          bitlySuccess = true;
          console.log('✅ Bit.ly short link created:', shortUrl);
        } else {
          console.warn('⚠️ Bit.ly failed, using original URL:', bitlyResult.data.error);
        }
      } catch (bitlyError) {
        console.warn('⚠️ Bit.ly service unavailable, using original URL:', bitlyError.message);
      }
    } else {
      if (linkData.useBitly === false) {
        console.log('ℹ️ User selected Direct links, skipping Bit.ly');
      } else {
        console.log('ℹ️ Skipping Bit.ly for localhost URL:', originalTrackingUrl);
      }
    }
    
    const trackingLink = {
      ...linkData,
      trackingCode,
      trackingUrl: shortUrl, // Use Bit.ly URL if available, otherwise original
      originalTrackingUrl, // Keep original for reference
      analyticsUrl: `${baseUrl}/analytics/${trackingCode}`,
      bitlyId, // Store Bit.ly ID for analytics
      bitlySuccess, // Track if Bit.ly was successful
      visits: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'trackingLinks'), trackingLink);
    
    // Clear cache to ensure fresh data
    trackingLinksCache.clear();
    
    return {
      id: docRef.id,
      ...trackingLink,
      trackingUrl: shortUrl,
      originalTrackingUrl,
      analyticsUrl: `${baseUrl}/analytics/${trackingCode}`
    };
  } catch (error) {
    console.error('Error creating tracking link:', error);
    throw new Error('Failed to create tracking link');
  }
};

// Simple cache for tracking links (expires after 2 minutes)
const trackingLinksCache = new Map();
const TRACKING_LINKS_CACHE_EXPIRY = 2 * 60 * 1000; // 2 minutes

// Get tracking links for a user/organization
export const getTrackingLinks = async (userId, organizationId = null) => {
  try {
    // Check cache first
    const cacheKey = `${userId}-${organizationId || 'personal'}`;
    const cached = trackingLinksCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TRACKING_LINKS_CACHE_EXPIRY) {
      console.log('🚀 Cache hit for tracking links:', cacheKey);
      return cached.data;
    }

    console.log('🔍 getTrackingLinks called with:', { userId, organizationId });
    
    let q;
    
    if (organizationId) {
      console.log('📋 Querying organization tracking links for org:', organizationId);
      console.log('📋 Query: organizationId ==', organizationId);
      // Get organization tracking links
      q = query(
        collection(db, 'trackingLinks'),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
    } else {
      console.log('👤 Querying personal tracking links for user:', userId);
      console.log('👤 Query: userId ==', userId, 'AND organizationId == null');
      // Get personal tracking links (where organizationId is null and userId matches)
      q = query(
        collection(db, 'trackingLinks'),
        where('userId', '==', userId),
        where('organizationId', '==', null),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    
    console.log('📊 Query snapshot size:', snapshot.size);
    
    // Convert docs to array without nested referrer queries (major performance optimization)
    const links = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      topReferrers: [] // Initialize empty, will be loaded separately if needed
    }));

    console.log('✅ Found', links.length, 'tracking links (optimized - no nested queries)');
    
    // Cache the result
    trackingLinksCache.set(cacheKey, {
      data: links,
      timestamp: Date.now()
    });
    
    return links;
  } catch (error) {
    console.error('❌ Error fetching tracking links:', error);
    throw new Error('Failed to fetch tracking links');
  }
};

// Get tracking link by code
// Simple in-memory cache for tracking links (expires after 5 minutes)
const trackingLinkCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const getTrackingLinkByCode = async (trackingCode) => {
  try {
    // Check cache first
    const cached = trackingLinkCache.get(trackingCode);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      console.log('🚀 Cache hit for tracking code:', trackingCode);
      return cached.data;
    }

    console.log('🔍 Cache miss, fetching from Firestore:', trackingCode);
    
    const q = query(
      collection(db, 'trackingLinks'),
      where('trackingCode', '==', trackingCode)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = {
      id: doc.id,
      ...doc.data()
    };

    // Cache the result
    trackingLinkCache.set(trackingCode, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error('Error fetching tracking link by code:', error);
    return null;
  }
};

// Record a click/visit
export const recordClick = async (trackingCode, clickData = {}) => {
  try {
    console.log('🔗 recordClick called for:', trackingCode);
    
    // Check for duplicate clicks within 3 seconds (prevent double-counting)
    const clickKey = `tracking_click_${trackingCode}`;
    const lastClickTime = localStorage.getItem(clickKey);
    const now = Date.now();
    
    if (lastClickTime && (now - parseInt(lastClickTime)) < 3000) {
      console.log('⚠️ Duplicate click detected within 3 seconds, skipping...', {
        lastClick: new Date(parseInt(lastClickTime)),
        currentClick: new Date(now),
        timeDiff: now - parseInt(lastClickTime)
      });
      // Don't record duplicate clicks
      return;
    }
    
    console.log('✅ Click is legitimate, proceeding with recording...');
    
    // Store this click timestamp
    localStorage.setItem(clickKey, now.toString());
    
    // Clean up old click timestamps (older than 1 hour) to prevent localStorage bloat
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tracking_click_')) {
          const timestamp = parseInt(localStorage.getItem(key) || '0');
          if (now - timestamp > 3600000) { // 1 hour = 3600000ms
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (cleanupError) {
      console.warn('Warning: Could not clean up old tracking timestamps:', cleanupError);
    }
    
    // First, get the tracking link to increment visits
    const trackingLink = await getTrackingLinkByCode(trackingCode);
    
    if (!trackingLink) {
      throw new Error('Tracking link not found');
    }

    console.log('📊 Recording click for tracking link:', trackingLink.id);

    // Parse and categorize the referrer
    const parseReferrer = (referrerUrl) => {
      if (!referrerUrl || referrerUrl === 'direct') {
        return { source: 'Direct', category: 'direct', url: '' };
      }

      try {
        const url = new URL(referrerUrl);
        const hostname = url.hostname.toLowerCase();

        // Social Media
        if (hostname.includes('linkedin.com')) return { source: 'LinkedIn', category: 'social', url: referrerUrl };
        if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return { source: 'Facebook', category: 'social', url: referrerUrl };
        if (hostname.includes('twitter.com') || hostname.includes('x.com')) return { source: 'Twitter/X', category: 'social', url: referrerUrl };
        if (hostname.includes('instagram.com')) return { source: 'Instagram', category: 'social', url: referrerUrl };
        if (hostname.includes('tiktok.com')) return { source: 'TikTok', category: 'social', url: referrerUrl };
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return { source: 'YouTube', category: 'social', url: referrerUrl };
        if (hostname.includes('whatsapp.com') || hostname.includes('wa.me')) return { source: 'WhatsApp', category: 'messaging', url: referrerUrl };
        if (hostname.includes('telegram.org') || hostname.includes('t.me')) return { source: 'Telegram', category: 'messaging', url: referrerUrl };

        // Search Engines
        if (hostname.includes('google.')) return { source: 'Google', category: 'search', url: referrerUrl };
        if (hostname.includes('bing.com')) return { source: 'Bing', category: 'search', url: referrerUrl };
        if (hostname.includes('yahoo.com')) return { source: 'Yahoo', category: 'search', url: referrerUrl };
        if (hostname.includes('duckduckgo.com')) return { source: 'DuckDuckGo', category: 'search', url: referrerUrl };

        // Email
        if (hostname.includes('gmail.com') || hostname.includes('outlook.com') || hostname.includes('yahoo.com') || hostname.includes('mail.')) {
          return { source: 'Email', category: 'email', url: referrerUrl };
        }

        // Default to hostname
        return { source: hostname, category: 'website', url: referrerUrl };
      } catch (error) {
        return { source: 'Unknown', category: 'unknown', url: referrerUrl };
      }
    };

    const referrerInfo = parseReferrer(document.referrer || clickData.referrer);

    // Record the click
    const clickRecord = {
      trackingCode,
      trackingLinkId: trackingLink.id,
      clickedAt: serverTimestamp(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      referrerSource: referrerInfo.source,
      referrerCategory: referrerInfo.category,
      referrerUrl: referrerInfo.url,
      ...clickData
    };

    console.log('📝 Adding click record to trackingClicks collection...');
    await addDoc(collection(db, 'trackingClicks'), clickRecord);
    console.log('✅ Click record added successfully');

    // Increment visit count on the tracking link
    console.log('📈 Incrementing visit count for link:', trackingLink.id);
    const linkRef = doc(db, 'trackingLinks', trackingLink.id);
    await updateDoc(linkRef, {
      visits: increment(1),
      lastVisit: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Visit count incremented successfully');

    console.log('🎉 Click recorded successfully - total process complete');
    return trackingLink.destinationUrl;
  } catch (error) {
    console.error('❌ Error recording click:', error);
    throw error;
  }
};

// Get click analytics for a tracking link
export const getClickAnalytics = async (trackingCode) => {
  try {
    const q = query(
      collection(db, 'trackingClicks'),
      where('trackingCode', '==', trackingCode),
      orderBy('clickedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const clicks = [];
    
    snapshot.forEach((doc) => {
      clicks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return clicks;
  } catch (error) {
    console.error('Error fetching click analytics:', error);
    throw new Error('Failed to fetch click analytics');
  }
};

// Update tracking link
export const updateTrackingLink = async (linkId, updates) => {
  try {
    const linkRef = doc(db, 'trackingLinks', linkId);
    await updateDoc(linkRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating tracking link:', error);
    throw new Error('Failed to update tracking link');
  }
};

// Delete tracking link
export const deleteTrackingLink = async (linkId) => {
  try {
    // Delete the tracking link
    await deleteDoc(doc(db, 'trackingLinks', linkId));
    
    // Note: We might want to keep click data for historical purposes
    // Or delete associated clicks if needed:
    // const clicksQuery = query(collection(db, 'trackingClicks'), where('trackingLinkId', '==', linkId));
    // const clicksSnapshot = await getDocs(clicksQuery);
    // const batch = writeBatch(db);
    // clicksSnapshot.forEach((doc) => batch.delete(doc.ref));
    // await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error deleting tracking link:', error);
    throw new Error('Failed to delete tracking link');
  }
};

// Get analytics summary for user/organization
export const getAnalyticsSummary = async (userId, organizationId = null) => {
  try {
    console.log('📈 getAnalyticsSummary called with:', { userId, organizationId });
    
    const links = await getTrackingLinks(userId, organizationId);
    
    const totalLinks = links.length;
    const totalVisits = links.reduce((sum, link) => sum + (link.visits || 0), 0);
    const activeLinks = links.filter(link => (link.visits || 0) > 0).length;
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLinks = links.filter(link => {
      if (!link.createdAt) return false;
      const createdDate = link.createdAt.toDate ? link.createdAt.toDate() : new Date(link.createdAt);
      return createdDate >= thirtyDaysAgo;
    });

    const summary = {
      totalLinks,
      totalVisits,
      activeLinks,
      recentLinks: recentLinks.length,
      conversionRate: totalLinks > 0 ? ((activeLinks / totalLinks) * 100).toFixed(1) : 0
    };

    console.log('📊 Analytics summary calculated:', summary);
    return summary;
  } catch (error) {
    console.error('❌ Error fetching analytics summary:', error);
    throw new Error('Failed to fetch analytics summary');
  }
};

// Get referrer analytics for user/organization
export const getReferrerAnalytics = async (userId, organizationId = null) => {
  try {
    console.log('🔍 Getting referrer analytics for:', { userId, organizationId });
    
    // Get all tracking links for the user/organization
    const links = await getTrackingLinks(userId, organizationId);
    const linkIds = links.map(link => link.id);
    
    if (linkIds.length === 0) {
      return { sources: [], categories: {}, total: 0 };
    }

    // Get all clicks for these tracking links
    const clicksQuery = query(
      collection(db, 'trackingClicks'),
      where('trackingLinkId', 'in', linkIds.slice(0, 10)), // Firestore 'in' limit is 10
      orderBy('clickedAt', 'desc')
    );

    const clicksSnapshot = await getDocs(clicksQuery);
    const referrerData = {};
    const categoryData = {};
    let totalClicks = 0;

    clicksSnapshot.forEach((doc) => {
      const click = doc.data();
      const source = click.referrerSource || 'Direct';
      const category = click.referrerCategory || 'direct';
      
      referrerData[source] = (referrerData[source] || 0) + 1;
      categoryData[category] = (categoryData[category] || 0) + 1;
      totalClicks++;
    });

    // Convert to array format for charts
    const sources = Object.entries(referrerData)
      .map(([source, count]) => ({ source, count, percentage: ((count / totalClicks) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    console.log('📊 Referrer analytics:', { sources, categories: categoryData, total: totalClicks });
    
    return {
      sources,
      categories: categoryData,
      total: totalClicks
    };
  } catch (error) {
    console.error('❌ Error fetching referrer analytics:', error);
    throw new Error('Failed to fetch referrer analytics');
  }
};

// Get visit trends over time
export const getVisitTrends = async (userId, organizationId = null, days = 30, specificLinkId = null) => {
  try {
    console.log('📈 Getting visit trends for:', { userId, organizationId, days, specificLinkId });
    
    let linkIds;
    if (specificLinkId) {
      // Filter for specific link only
      linkIds = [specificLinkId];
    } else {
      // Get all links for user/organization
      const links = await getTrackingLinks(userId, organizationId);
      linkIds = links.map(link => link.id);
    }
    
    if (linkIds.length === 0) {
      return [];
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get clicks from the last N days
    let clicksQuery;
    if (linkIds.length === 1) {
      // Single link query (more efficient)
      clicksQuery = query(
        collection(db, 'trackingClicks'),
        where('trackingLinkId', '==', linkIds[0]),
        where('clickedAt', '>=', startDate),
        orderBy('clickedAt', 'desc')
      );
    } else {
      // Multiple links query
      clicksQuery = query(
        collection(db, 'trackingClicks'),
        where('trackingLinkId', 'in', linkIds.slice(0, 10)), // Firestore 'in' limit is 10
        where('clickedAt', '>=', startDate),
        orderBy('clickedAt', 'desc')
      );
    }

    const clicksSnapshot = await getDocs(clicksQuery);
    const dailyData = {};

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = 0;
    }

    // Count clicks by day
    clicksSnapshot.forEach((doc) => {
      const click = doc.data();
      if (click.clickedAt && click.clickedAt.toDate) {
        const clickDate = click.clickedAt.toDate().toISOString().split('T')[0];
        if (dailyData.hasOwnProperty(clickDate)) {
          dailyData[clickDate]++;
        }
      }
    });

    // Convert to array format for charts
    const trends = Object.entries(dailyData)
      .map(([date, visits]) => ({ date, visits }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('📈 Visit trends calculated:', trends.slice(-7)); // Log last 7 days
    return trends;
  } catch (error) {
    console.error('❌ Error fetching visit trends:', error);
    throw new Error('Failed to fetch visit trends');
  }
};

// Regenerate Bit.ly short link for an existing tracking link
export const regenerateBitlyLink = async (linkId) => {
  try {
    console.log('🔄 Regenerating Bit.ly link for:', linkId);
    
    // Get the existing tracking link
    const linkRef = doc(db, 'trackingLinks', linkId);
    const linkDoc = await getDoc(linkRef);
    
    if (!linkDoc.exists()) {
      throw new Error('Tracking link not found');
    }
    
    const linkData = linkDoc.data();
    const originalUrl = linkData.originalTrackingUrl || linkData.trackingUrl;
    
    if (!originalUrl) {
      throw new Error('No original URL found for this tracking link');
    }
    
    // Skip Bit.ly for localhost URLs
    if (originalUrl.includes('localhost') || originalUrl.includes('127.0.0.1')) {
      throw new Error('Bit.ly links are not available for localhost URLs. Deploy to production to use Bit.ly shortening.');
    }
    
    // Validate URL before sending to Bit.ly
    try {
      new URL(originalUrl);
    } catch (urlError) {
      throw new Error('Invalid URL format - please check the destination URL');
    }
    
    // Create new Bit.ly short link
    const bitlyResult = await createBitlyShortLink({
      longUrl: originalUrl,
      title: linkData.name || 'RapidWorks Tracking Link'
    });
    
    if (bitlyResult.data.success) {
      // Update the tracking link with new Bit.ly URL
      await updateDoc(linkRef, {
        trackingUrl: bitlyResult.data.shortUrl,
        bitlyId: bitlyResult.data.id,
        bitlySuccess: true,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Bit.ly link regenerated:', bitlyResult.data.shortUrl);
      
      return {
        success: true,
        shortUrl: bitlyResult.data.shortUrl,
        originalUrl: originalUrl,
        id: bitlyResult.data.id
      };
    } else {
      throw new Error(bitlyResult.data.error || 'Failed to create Bit.ly link');
    }
  } catch (error) {
    console.error('❌ Error regenerating Bit.ly link:', error);
    throw new Error(`Failed to regenerate Bit.ly link: ${error.message}`);
  }
};
