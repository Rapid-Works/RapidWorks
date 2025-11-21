const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const {isDisposable} = require("is-disposable-email-domain");
const dns = require("dns").promises;

admin.initializeApp();

// Callable: Validate email against disposable providers and MX records
exports.validateEmailDomain = onCall(
    {
      cors: true, // Enable CORS for all origins (development and production)
    },
    async (request) => {
      try {
        const {email} = request.data || {};
        if (!email || typeof email !== "string") {
          return {
            valid: false,
            reason: "Please enter a valid email address. The email field cannot be empty.",
            code: "MISSING_EMAIL",
          };
        }
        const emailLower = email.toLowerCase().trim();
        const parts = emailLower.split("@");
        if (parts.length !== 2) {
          return {
            valid: false,
            reason: "Invalid email format. Please enter a valid email address (e.g., name@company.com).",
            code: "INVALID_FORMAT",
          };
        }
        const domain = parts[1];

        // 1) Disposable domain detection (maintained list)
        if (isDisposable(domain)) {
          return {
            valid: false,
            reason: "Please use a valid business email address from your company domain.",
            code: "DISPOSABLE_EMAIL",
            domain: domain,
          };
        }

        // 2) DNS MX check for deliverability
        try {
          const mx = await dns.resolveMx(domain);
          if (!mx || mx.length === 0) {
            return {
              valid: false,
              reason: "This domain cannot receive emails. Use a valid email address.",
              code: "NO_MX_RECORDS",
              domain: domain,
            };
          }
        } catch (dnsError) {
          // Check if it's a domain resolution error
          if (dnsError.code === "ENOTFOUND" || dnsError.code === "ENODATA") {
            return {
              valid: false,
              reason: "This domain cannot receive emails. Use a valid email address.",
              code: "DOMAIN_NOT_FOUND",
              domain: domain,
            };
          }
          return {
            valid: false,
            reason: "This domain cannot receive emails. Use a valid email address.",
            code: "DNS_LOOKUP_FAILED",
            domain: domain,
          };
        }

        return {valid: true};
      } catch (err) {
        console.error("validateEmailDomain error:", err);
        return {
          valid: false,
          reason: "An unexpected error occurred while validating your email address. Please try again or contact support if the problem persists.",
          code: "VALIDATION_ERROR",
        };
      }
    },
);

// Multi-AI extraction function that tries different AI providers
async function extractWithAI(websiteContent, existingData) {
  const aiProviders = [
    {
      name: "Google Gemini",
      enabled: !!process.env.GEMINI_API_KEY,
      extract: async () => {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

        const prompt = `Extract company information from this website content and return ONLY a JSON object:

${websiteContent}

Return JSON with: companyName, address: {street, city, postalCode}, email, phone, companyDescription, companyType (one of: GmbH, AG, UG, e.K., GbR, OHG, KG, Verein, Stiftung, Genossenschaft), foundingDate, taxId, suggestedIndustry (one of: health, media, tourism, machinery, manufacturing, ict, energy, wholesale, retail, biotechnology, mobility, craft, sports, utilities, agriculture, realEstate, professional, other)

IMPORTANT for industry classification:
- Use "ict" for IT companies, software companies, tech companies, web development, digital agencies, SaaS companies, cloud services, technology platforms, software solutions, or any company primarily focused on technology, software, or IT services.
- Only use "other" if the company clearly does not fit into any of the specific categories listed above.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text().trim();

        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No valid JSON found in response");
      },
    },
    {
      name: "Keyword-based Industry Detection",
      enabled: true, // Always available as fallback
      extract: async () => {
        console.log("🔍 Using keyword-based industry detection...");
        const content = websiteContent.toLowerCase();

        // Industry keyword mapping
        const industryKeywords = {
          "health": ["health", "medical", "hospital", "clinic", "doctor", "pharmaceutical", "healthcare"],
          "media": ["advertising", "marketing", "publishing", "journalism", "broadcast"],
          "tourism": ["hotel", "restaurant", "hospitality", "vacation", "booking", "accommodation"],
          "machinery": ["machinery", "manufacturing equipment", "industrial machine", "automation line"],
          "manufacturing": ["manufacturing", "production line", "factory"],
          // ICT keywords - widened scope to catch IT companies
          "ict": [
            // Full phrases
            "software development", "it services", "saas", "software company", "it consulting",
            "web development", "application development", "system integration", "cloud services",
            "data analytics", "telecom", "telecommunications", "information technology",
            "tech company", "technology solutions", "digital solutions", "software solutions",
            "it solutions", "software platform", "technology platform", "digital platform",
            "software engineering", "tech consulting", "it consulting", "digital agency",
            // Single words (common IT terms)
            "software", "technology", "tech", "it", "digital", "saas", "platform",
            "analytics", "cloud", "api", "app", "application", "development", "engineering",
            "automation", "integration", "solution", "system", "website", "web",
          ],
          "energy": ["renewable energy", "solar", "wind farm", "grid", "utility"],
          "wholesale": ["wholesale", "distribution center", "b2b distribution"],
          "retail": ["retail store", "e-commerce", "online shop"],
          "biotechnology": ["biotechnology", "pharma lab", "life sciences"],
          "mobility": ["logistics", "fleet", "automotive supplier"],
          "craft": ["handwerk", "handwerksbetrieb", "meisterbetrieb"],
          "sports": ["fitness club", "sports club", "training center"],
          "utilities": ["utility provider", "infrastructure operator"],
          "agriculture": ["agriculture", "farm", "dairy", "crop"],
          "realEstate": ["real estate developer", "property management"],
          "professional": ["consulting firm", "law firm", "accounting firm", "architects"],
        };

        // Find the industry with the most keyword matches (case-insensitive)
        let bestMatch = "other";
        let maxMatches = 0;
        const contentLower = content.toLowerCase();

        for (const [industry, keywords] of Object.entries(industryKeywords)) {
          // Case-insensitive matching
          const matches = keywords.filter((keyword) => contentLower.includes(keyword.toLowerCase())).length;
          const threshold = 1; // Use same threshold for all industries
          if (matches >= threshold && matches > maxMatches) {
            maxMatches = matches;
            bestMatch = industry;
          }
        }

        console.log(`🎯 Keyword-based industry suggestion: ${bestMatch} (${maxMatches} matches)`);

        // Always suggest an industry, even if it's 'other'
        const suggestedIndustry = bestMatch;

        // Company Type detection based on keywords
        const companyTypeKeywords = {
          "GmbH": ["gmbh", "gesellschaft mit beschränkter haftung", "limited liability"],
          "AG": ["ag", "aktien gesellschaft", "stock corporation", "public company"],
          "UG": ["ug", "unternehmergesellschaft", "entrepreneurial company"],
          "e.K.": ["e.k.", "eingetragener kaufmann", "registered merchant"],
          "GbR": ["gbr", "gesellschaft bürgerlichen rechts", "partnership"],
          "OHG": ["ohg", "offene handelsgesellschaft", "general partnership"],
          "KG": ["kg", "kommanditgesellschaft", "limited partnership"],
          "Verein": ["verein", "association", "club", "non-profit"],
          "Stiftung": ["stiftung", "foundation", "charity"],
          "Genossenschaft": ["genossenschaft", "cooperative", "co-op"],
        };

        // Find company type with most keyword matches (case-insensitive)
        let bestCompanyType = null;
        let maxCompanyMatches = 0;

        for (const [companyType, keywords] of Object.entries(companyTypeKeywords)) {
          const matches = keywords.filter((keyword) => contentLower.includes(keyword.toLowerCase())).length;
          if (matches > maxCompanyMatches) {
            maxCompanyMatches = matches;
            bestCompanyType = companyType;
          }
        }

        console.log(`🏢 Keyword-based company type suggestion: ${bestCompanyType} (${maxCompanyMatches} matches)`);

        return {
          suggestedIndustry: suggestedIndustry, // Always returns a value, even if 'other'
          companyType: maxCompanyMatches > 0 ? bestCompanyType : null,
        };
      },
    },
  ];

  // Try each AI provider in order
  for (const provider of aiProviders) {
    if (!provider.enabled) {
      console.log(`⚠️ ${provider.name} not available (API key missing)`);
      continue;
    }

    try {
      console.log(`🤖 Trying ${provider.name}...`);
      const result = await provider.extract();
      console.log(`✅ ${provider.name} extraction successful`);
      return result;
    } catch (error) {
      console.log(`❌ ${provider.name} failed:`, error.message);
      continue;
    }
  }

  console.log("⚠️ All AI providers failed or unavailable");
  return null;
}

// Helper function to fetch content from SPAs using Puppeteer
async function fetchSPAContent(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set a reasonable timeout
    await page.setDefaultTimeout(10000);

    // Navigate to the page
    await page.goto(url, {waitUntil: "networkidle2"});

    // Wait a bit more for any dynamic content
    await page.waitForTimeout(2000);

    // Get the HTML content
    const content = await page.content();

    return content;
  } catch (error) {
    console.log(`⚠️ Puppeteer failed for ${url}:`, error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Configure email transporter for MID credentials
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rapidworks.notifications@gmail.com",
    pass: "htzxqnpflnbetdwg", // Gmail app password
  },
});

const db = admin.firestore();

// Default notification preferences
const DEFAULT_PREFERENCES = {
  blogNotifications: {
    mobile: true,
    email: true,
  },
  brandingKitReady: {
    mobile: true,
    email: true,
  },
  taskMessages: {
    mobile: true,
    email: true,
  },
};

// Helper function to get user notification preferences
const getUserNotificationPreferences = async (userId) => {
  try {
    const doc = await db.collection("userNotificationPreferences")
        .doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      return data.preferences || DEFAULT_PREFERENCES;
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return DEFAULT_PREFERENCES;
  }
};

// Helper function to get user ID from email
const getUserIdFromEmail = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord.uid;
  } catch (error) {
    console.error(`Error getting user ID for email ${email}:`, error);
    return null;
  }
};

// Helper function to save notification to history
const saveNotificationToHistory = async (userId, notificationData) => {
  try {
    await db.collection("notificationHistory").add({
      userId: userId,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type,
      url: notificationData.url,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: notificationData.metadata || {},
    });
    console.log(`💾 Notification saved to history for user: ${userId}`);
  } catch (error) {
    console.error("Error saving notification to history:", error);
  }
};

// Helper function to submit data to Airtable
const submitToAirtableTable = async (tableName, fields) => {
  // Use environment variables for Airtable credentials
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error("Airtable API key or Base ID not configured");
  }

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: fields,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Airtable Error Details:", errorData);
      const errorMessage = `Failed to submit data to Airtable: ` +
        `${response.statusText} (Status: ${response.status})`;
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting to Airtable:", error);
    throw error;
  }
};

// Callable function for general service requests
exports.submitServiceRequest = onCall(async (request) => {
  const {email, service, notes = ""} = request.data;

  if (!email || !service) {
    throw new Error("Email and service are required");
  }

  try {
    const result = await submitToAirtableTable("Table 1", {
      "Email": email,
      "Service": service,
      "Notes": notes,
    });

    // Track activity in notification history for specific services
    try {
      const userId = await getUserIdFromEmail(email);
      if (userId) {
        let activityData = null;

        // Handle newsletter opt-ins from webinar registration
        if (service.includes("Newsletter")) {
          activityData = {
            title: "📧 Newsletter Subscription Successful",
            body: service.includes("Webinar") ?
              "You subscribed to our newsletter during webinar registration" :
              "You successfully subscribed to our newsletter",
            type: "newsletter_subscription",
            url: "/dashboard",
            metadata: {
              email: email,
              source: service.includes("Webinar") ?
                "webinar_optin" : "service_request",
              service: service,
              notes: notes,
            },
          };
        } else if (service) {
          // Handle other service requests (coaching, consulting, etc.)
          activityData = {
            title: "📝 Service Request Submitted",
            body: `You submitted a request for: ${service}`,
            type: "service_request",
            url: "/dashboard",
            metadata: {
              email: email,
              service: service,
              notes: notes,
            },
          };
        }

        if (activityData) {
          await saveNotificationToHistory(userId, activityData);
          console.log(`📝 Service request tracked for user: ${email}`);
        }
      }
    } catch (historyError) {
      console.log(`⚠️ Could not track activity for ${email}:`, historyError);
      // Don't fail the main request if history saving fails
    }

    return {success: true, data: result};
  } catch (error) {
    console.error("Error in submitServiceRequest:", error);
    throw new Error(`Failed to submit service request: ${error.message}`);
  }
});

// Callable function for webinar registrations
exports.submitWebinarRegistration = onCall(async (request) => {
  const {
    name,
    email,
    phone,
    questions,
    selectedDate,
    selectedDateString,
  } = request.data;

  if (!name || !email || !selectedDate) {
    throw new Error("Name, email, and selected date are required");
  }

  try {
    const result = await submitToAirtableTable("Webinar", {
      "Name": name,
      "Email": email,
      "Phone": phone || "",
      "Questions": questions || "",
      "Selected Date": selectedDate,
      "Selected Display Time": selectedDateString,
    });

    // Track activity in notification history (for logged-in users)
    try {
      const userId = await getUserIdFromEmail(email);
      if (userId) {
        await saveNotificationToHistory(userId, {
          title: "🎯 Webinar Registration Successful",
          body: `You registered for the webinar on ${selectedDateString}`,
          type: "webinar_registration",
          url: "/dashboard", // or wherever webinars are managed
          metadata: {
            webinarDate: selectedDate,
            webinarDateString: selectedDateString,
            name: name,
            phone: phone || "",
            questions: questions || "",
          },
        });
        console.log(`📅 Webinar registration tracked for user: ${email}`);
      }
    } catch (historyError) {
      console.log(`⚠️ Could not track activity for ${email}:`, historyError);
      // Don't fail the main request if history saving fails
    }

    return {success: true, data: result};
  } catch (error) {
    console.error("Error in submitWebinarRegistration:", error);
    const errorMessage = `Failed to submit webinar registration: ` +
      `${error.message}`;
    throw new Error(errorMessage);
  }
});

// Callable function for partner interest
exports.submitPartnerInterest = onCall(async (request) => {
  const {email, partnerNeedsString} = request.data;

  if (!email || !partnerNeedsString) {
    throw new Error("Email and partner needs are required");
  }

  try {
    const result = await submitToAirtableTable("Partners", {
      "Email": email,
      "Partner Needs": partnerNeedsString,
    });

    // Track activity in notification history (for logged-in users)
    try {
      const userId = await getUserIdFromEmail(email);
      if (userId) {
        await saveNotificationToHistory(userId, {
          title: "🤝 Partner Interest Submitted",
          body: "Your partnership inquiry has been submitted successfully",
          type: "partner_interest",
          url: "/partners", // or wherever partner info is displayed
          metadata: {
            email: email,
            partnerNeeds: partnerNeedsString,
          },
        });
        console.log(`🤝 Partner interest tracked for user: ${email}`);
      }
    } catch (historyError) {
      console.log(`⚠️ Could not track activity for ${email}:`, historyError);
      // Don't fail the main request if history saving fails
    }

    return {success: true, data: result};
  } catch (error) {
    console.error("Error in submitPartnerInterest:", error);
    throw new Error(`Failed to submit partner interest: ${error.message}`);
  }
});

// Callable function for expert requests
exports.submitExpertRequest = onCall(async (request) => {
  const {email, expertType} = request.data;

  if (!email || !expertType) {
    throw new Error("Email and expert type are required");
  }

  try {
    const result = await submitToAirtableTable("Expert Request", {
      "Email": email,
      "Type": expertType,
    });

    return {success: true, data: result};
  } catch (error) {
    console.error("Error in submitExpertRequest:", error);
    throw new Error(`Failed to submit expert request: ${error.message}`);
  }
});

// Callable function for newsletter subscriptions
exports.submitNewsletterSubscription = onCall(async (request) => {
  const {email} = request.data;

  if (!email) {
    throw new Error("Email is required");
  }

  try {
    const result = await submitToAirtableTable("Newsletter", {
      "Email": email,
    });

    // Track activity in notification history (for logged-in users)
    try {
      const userId = await getUserIdFromEmail(email);
      if (userId) {
        await saveNotificationToHistory(userId, {
          title: "📧 Newsletter Subscription Successful",
          body: "You successfully subscribed to our newsletter",
          type: "newsletter_subscription",
          url: "/dashboard", // or wherever newsletter settings are managed
          metadata: {
            email: email,
            source: "direct_subscription",
          },
        });
        console.log(`📧 Newsletter subscription tracked for user: ${email}`);
      }
    } catch (historyError) {
      console.log(`⚠️ Could not track activity for ${email}:`, historyError);
      // Don't fail the main request if history saving fails
    }

    return {success: true, data: result};
  } catch (error) {
    console.error("Error in submitNewsletterSubscription:", error);
    const errorMessage = `Failed to submit newsletter subscription: ` +
      `${error.message}`;
    throw new Error(errorMessage);
  }
});

// Callable function for VB form submission
exports.submitVBForm = onCall(async (request) => {
  const formData = request.data;

  if (!formData) {
    throw new Error("Form data is required");
  }

  try {
    // Submit to Airtable VB table
    const result = await submitToAirtableTable("VB", formData);

    return {success: true, data: result};
  } catch (error) {
    console.error("Error in submitVBForm:", error);
    throw new Error(`Failed to submit VB form: ${error.message}`);
  }
});

// Callable function for AI prompt logging
exports.submitAIPrompt = onCall(async (request) => {
  const {
    userPrompt,
    aiResponse,
    language,
    sessionId,
    userEmail,
    timestamp,
  } = request.data;

  if (!userPrompt || !aiResponse) {
    throw new Error("User prompt and AI response are required");
  }

  try {
    const result = await submitToAirtableTable("AI user prompts", {
      "User Prompt": userPrompt,
      "AI Response": aiResponse,
      "Language": language || "de",
      "Session ID": sessionId || "",
      "User Email": userEmail || "",
      "Timestamp": timestamp || new Date().toISOString(),
    });

    return {success: true, data: result};
  } catch (error) {
    console.error("Error in submitAIPrompt:", error);
    throw new Error(`Failed to submit AI prompt: ${error.message}`);
  }
});

// New function for branding kit ready notifications
exports.onBrandingKitUpdated = onDocumentUpdated(
    "brandkits/{kitId}",
    async (event) => {
      console.log("🔥 BRANDING KIT NOTIFICATION TRIGGER FIRED");

      const beforeData = event.data.before.data();
      const afterData = event.data.after.data();

      console.log("🛠️ Branding kit update:", {
        kitId: event.params.kitId,
        beforeReady: beforeData.ready,
        afterReady: afterData.ready,
        email: afterData.email,
      });

      // Check if the ready field changed from false/undefined to true
      const wasReady = beforeData.ready === true;
      const isNowReady = afterData.ready === true;

      if (!wasReady && isNowReady) {
        console.log("🎉 Branding kit is ready, sending notification");

        try {
          // Get user email(s) - can be string or array
          let userEmails = [];
          if (typeof afterData.email === "string") {
            userEmails = [afterData.email];
          } else if (Array.isArray(afterData.email)) {
            userEmails = afterData.email;
          }

          if (userEmails.length === 0) {
            console.log("❌ No email found in branding kit document");
            return;
          }

          console.log("📧 Branding kit ready for emails:", userEmails);

          // Get kit name from afterData or use default
          const kitName = afterData.name || afterData.id ||
            "Your branding kit";

          // Send notification to tokens for users whose kit is ready
          const message = {
            notification: {
              title: "🎉 Your Branding Kit is Ready!",
              body: `${kitName} has been completed and is ready for ` +
                "download.",
            },
            data: {
              url: `/dashboard/${event.params.kitId}`,
              type: "branding_kit_ready",
              kitId: event.params.kitId,
            },
          };

          // Send notifications and save to history
          const sendPromises = userEmails.map(async (userEmail) => {
            // Get user ID for history saving
            const userId = await getUserIdFromEmail(userEmail);
            if (!userId) {
              console.log(`⚠️ Could not find user ID for email: ${userEmail}`);
              return;
            }

            // Save notification to history first
            await saveNotificationToHistory(userId, {
              title: message.notification.title,
              body: message.notification.body,
              type: "branding_kit_ready",
              url: `/dashboard/${event.params.kitId}`,
              metadata: {
                kitId: event.params.kitId,
                kitName: kitName,
              },
            });

            // Check if user wants mobile notifications
            const preferences = await getUserNotificationPreferences(userId);
            const wantsMobileNotifications = preferences
                .brandingKitReady?.mobile === true;

            if (!wantsMobileNotifications) {
              console.log(`📵 User ${userEmail} has disabled mobile ` +
                "notifications for branding kits");
              return;
            }

            // Get FCM tokens for this user
            const tokensQuery = db.collection("fcmTokens")
                .where("email", "==", userEmail);
            const tokensSnapshot = await tokensQuery.get();

            // Send to each token for this user
            const tokenPromises = [];
            tokensSnapshot.forEach((doc) => {
              const tokenData = doc.data();
              const token = tokenData.token;

              tokenPromises.push((async () => {
                try {
                  await admin.messaging().send({
                    ...message,
                    token: token,
                  });
                  console.log(`✅ Branding kit notification sent to token: ` +
                    `${token.substring(0, 10)}...`);
                } catch (error) {
                  console.error(`❌ Failed to send branding kit notification ` +
                    `to token ${token.substring(0, 10)}...:`, error);
                  // Remove invalid tokens from database
                  if (error.code ===
                    "messaging/registration-token-not-registered") {
                    const tokenQuery = await db.collection("fcmTokens")
                        .where("token", "==", token).get();
                    tokenQuery.forEach(async (doc) => {
                      await doc.ref.delete();
                    });
                    console.log(`🗑️ Removed invalid token: ` +
                      token.substring(0, 10) + "...");
                  }
                }
              })());
            });

            await Promise.all(tokenPromises);
          });

          await Promise.all(sendPromises);

          console.log("🎉 Branding kit ready notifications " +
            "completed for kit: " + event.params.kitId);
        } catch (error) {
          console.error("💥 Error sending branding kit ready notification:",
              error);
        }
      } else {
        console.log("ℹ️ Branding kit updated but not marked as ready, " +
          "skipping notification");
      }
    },
);

// Callable function for testing branding kit notifications
exports.testBrandingKitReady = onCall(async (request) => {
  const {kitId, email} = request.data;

  if (!kitId || !email) {
    throw new Error("Kit ID and email are required for testing");
  }

  try {
    // Update or create a test branding kit document
    const kitRef = db.collection("brandkits").doc(kitId);

    // Set the document with ready: true to trigger the notification
    await kitRef.set({
      id: kitId,
      email: email,
      name: `Test Kit - ${kitId}`,
      ready: true,
      paid: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});

    return {
      success: true,
      message: `Test branding kit ${kitId} marked as ready for ${email}`,
      kitId: kitId,
    };
  } catch (error) {
    console.error("Error in testBrandingKitReady:", error);
    throw new Error(`Failed to test branding kit notification: ` +
      `${error.message}`);
  }
});

// Callable function for cleaning up invalid FCM tokens
exports.cleanupInvalidTokens = onCall(async (request) => {
  try {
    console.log("Starting FCM token cleanup...");

    // Get all FCM tokens
    const tokensSnapshot = await db.collection("fcmTokens").get();
    const tokens = [];
    const tokenDocs = [];

    tokensSnapshot.forEach((doc) => {
      const tokenData = doc.data();
      tokens.push(tokenData.token);
      tokenDocs.push(doc);
    });

    if (tokens.length === 0) {
      return {success: true, message: "No tokens to clean up"};
    }

    console.log(`Testing ${tokens.length} tokens...`);

    // Test each token by trying to send a dry-run message
    const invalidTokens = [];

    for (let i = 0; i < tokens.length; i++) {
      try {
        await admin.messaging().send({
          token: tokens[i],
          data: {test: "dry-run"},
        }, true); // dry-run mode
      } catch (error) {
        if (error.code === "messaging/registration-token-not-registered" ||
            error.code === "messaging/invalid-registration-token") {
          invalidTokens.push(i);
        }
      }
    }

    // Delete invalid tokens
    const deletePromises = invalidTokens.map(async (index) => {
      await tokenDocs[index].ref.delete();
    });

    await Promise.all(deletePromises);

    console.log(`Cleaned up ${invalidTokens.length} invalid tokens`);

    return {
      success: true,
      message: `Cleaned up ${invalidTokens.length} invalid tokens out ` +
        `of ${tokens.length}`,
      totalTokens: tokens.length,
      invalidTokens: invalidTokens.length,
      validTokens: tokens.length - invalidTokens.length,
    };
  } catch (error) {
    console.error("Error cleaning up tokens:", error);
    throw new Error(`Failed to cleanup tokens: ${error.message}`);
  }
});

// Test function for blog notifications
exports.testBlogNotification = onCall(async (request) => {
  try {
    console.log("Testing blog notification system...");

    // 1. Check FCM tokens
    const tokensSnapshot = await db.collection("fcmTokens").get();
    const tokens = [];
    const validTokens = [];

    console.log(`Found ${tokensSnapshot.size} FCM tokens in database`);

    tokensSnapshot.forEach((doc) => {
      const tokenData = doc.data();
      tokens.push({
        token: tokenData.token,
        email: tokenData.email,
        createdAt: tokenData.createdAt,
      });
    });

    if (tokens.length === 0) {
      return {
        success: false,
        message: "No FCM tokens found. Users need to subscribe to " +
          "notifications first.",
        tokens: 0,
        validTokens: 0,
      };
    }

    // 2. Test token validity (sample a few)
    const testTokens = tokens.slice(0, 3); // Test first 3 tokens
    for (const tokenData of testTokens) {
      try {
        await admin.messaging().send({
          token: tokenData.token,
          data: {test: "validity-check"},
        }, true); // dry-run mode
        validTokens.push(tokenData);
      } catch (error) {
        console.log(`Invalid token found: ` +
          `${tokenData.token.substring(0, 10)}...`);
      }
    }

    // 3. Create a test blog post to trigger notifications
    const testBlogRef = await db.collection("blogs").add({
      title: "🧪 Test Blog Post - Notification Check",
      excerpt: "This is a test post to verify blog notifications " +
        "are working.",
      content: "Test content for notification verification.",
      published: true,
      date: admin.firestore.FieldValue.serverTimestamp(),
      author: "System Test",
      tags: ["test", "notifications"],
    });

    console.log(`Test blog post created with ID: ${testBlogRef.id}`);

    return {
      success: true,
      message: `Blog notification test completed. Created test blog ` +
        `post: ${testBlogRef.id}`,
      totalTokens: tokens.length,
      testedTokens: testTokens.length,
      validTokens: validTokens.length,
      testBlogId: testBlogRef.id,
      tokenDetails: tokens.map((t) => ({
        email: t.email,
        tokenPreview: t.token.substring(0, 10) + "...",
        createdAt: t.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error testing blog notifications:", error);
    throw new Error(`Blog notification test failed: ${error.message}`);
  }
});

// Alternative: Firestore-triggered functions
exports.onServiceRequestCreated = onDocumentCreated(
    "serviceRequests/{requestId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const requestData = snapshot.data();

      try {
        await submitToAirtableTable("Table 1", {
          "Email": requestData.email,
          "Service": requestData.service,
          "Notes": requestData.notes || "",
        });

        // Update the document to mark as synced
        await snapshot.ref.update({
          syncedToAirtable: true,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Service request synced to Airtable successfully");
      } catch (error) {
        console.error("Failed to sync service request to Airtable:", error);

        // Update the document to mark sync failure
        await snapshot.ref.update({
          syncedToAirtable: false,
          syncError: error.message,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    },
);

exports.onWebinarRegistrationCreated = onDocumentCreated(
    "webinarRegistrations/{registrationId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const registrationData = snapshot.data();

      try {
        await submitToAirtableTable("Webinar", {
          "Name": registrationData.name,
          "Email": registrationData.email,
          "Phone": registrationData.phone || "",
          "Questions": registrationData.questions || "",
          "Selected Date": registrationData.selectedDate,
          "Selected Display Time": registrationData.selectedDateString,
        });

        await snapshot.ref.update({
          syncedToAirtable: true,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Webinar registration synced to Airtable successfully");
      } catch (error) {
        const errorMessage = "Failed to sync webinar registration to " +
          "Airtable:";
        console.error(errorMessage, error);

        await snapshot.ref.update({
          syncedToAirtable: false,
          syncError: error.message,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    },
);

exports.onPartnerInterestCreated = onDocumentCreated(
    "partnerInterests/{interestId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const interestData = snapshot.data();

      try {
        await submitToAirtableTable("Partners", {
          "Email": interestData.email,
          "Partner Needs": interestData.partnerNeedsString,
        });

        await snapshot.ref.update({
          syncedToAirtable: true,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Partner interest synced to Airtable successfully");
      } catch (error) {
        console.error("Failed to sync partner interest to Airtable:", error);

        await snapshot.ref.update({
          syncedToAirtable: false,
          syncError: error.message,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    },
);

exports.onExpertRequestCreated = onDocumentCreated(
    "expertRequests/{requestId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const requestData = snapshot.data();

      try {
        await submitToAirtableTable("Expert Request", {
          "Email": requestData.email,
          "Type": requestData.expertType,
        });

        await snapshot.ref.update({
          syncedToAirtable: true,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("Expert request synced to Airtable successfully");
      } catch (error) {
        console.error("Failed to sync expert request to Airtable:", error);

        await snapshot.ref.update({
          syncedToAirtable: false,
          syncError: error.message,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    },
);

exports.onAIPromptCreated = onDocumentCreated(
    "aiPrompts/{promptId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) {
        console.log("No data associated with the event");
        return;
      }

      const promptData = snapshot.data();

      try {
        await submitToAirtableTable("AI user prompts", {
          "User Prompt": promptData.userPrompt,
          "AI Response": promptData.aiResponse,
          "Language": promptData.language || "de",
          "Session ID": promptData.sessionId || "",
          "User Email": promptData.userEmail || "",
          "Timestamp": promptData.createdAt ?
            promptData.createdAt.toDate().toISOString() :
            new Date().toISOString(),
        });

        await snapshot.ref.update({
          syncedToAirtable: true,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log("AI prompt synced to Airtable successfully");
      } catch (error) {
        console.error("Failed to sync AI prompt to Airtable:", error);

        await snapshot.ref.update({
          syncedToAirtable: false,
          syncError: error.message,
          syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    },
);

// Your existing blog notification function
exports.sendNewBlogNotification = onDocumentCreated(
    "blogs/{blogId}",
    async (event) => {
      console.log("🔥 BLOG NOTIFICATION TRIGGER FIRED");

      const snapshot = event.data;
      if (!snapshot) {
        console.log("❌ No snapshot data in blog notification trigger");
        return;
      }

      const blogData = snapshot.data();
      console.log("📝 Blog data:", {
        id: snapshot.id,
        title: blogData.title,
        published: blogData.published,
        hasExcerpt: !!blogData.excerpt,
        slug: blogData.slug,
      });

      // Only send notifications for published blogs
      if (!blogData.published) {
        console.log("⏸️ Blog not published, skipping notification");
        return;
      }

      try {
        console.log("📡 Getting FCM tokens for blog notification...");

        // Get all FCM tokens
        const tokensSnapshot = await db.collection("fcmTokens").get();

        // Create the notification
        const notificationTitle = `📝 New Blog Post: ${blogData.title}`;
        const notificationBody = blogData.excerpt ||
          "A new blog post has been published!";

        console.log("📬 Sending blog notifications:", {
          title: notificationTitle,
          body: notificationBody,
          recipientCount: tokensSnapshot.docs.length,
        });

        // Send notifications to users and save to history
        const sendPromises = [];
        const processedUsers = new Set(); // Track users to avoid duplicates

        for (const doc of tokensSnapshot.docs) {
          const tokenData = doc.data();

          // Get user email and ID
          const userEmail = tokenData.email;
          if (!userEmail) continue; // Skip tokens without email

          // Avoid processing the same user multiple times
          if (processedUsers.has(userEmail)) continue;
          processedUsers.add(userEmail);

          const userId = await getUserIdFromEmail(userEmail);
          if (!userId) {
            console.log(`⚠️ Could not find user ID for email: ${userEmail}`);
            continue;
          }

          // Save notification to history for this user
          // Use slug if available, fallback to ID
          const blogSlug = blogData.slug || snapshot.id;
          await saveNotificationToHistory(userId, {
            title: notificationTitle,
            body: notificationBody,
            type: "new_blog_post",
            url: `/blogs/${blogSlug}`,
            metadata: {
              blogId: snapshot.id,
              blogSlug: blogSlug,
              blogTitle: blogData.title,
            },
          });

          // Check if user wants mobile notifications for blog posts
          const preferences = await getUserNotificationPreferences(userId);
          const wantsMobileNotifications = preferences
              .blogNotifications?.mobile === true;

          if (!wantsMobileNotifications) {
            console.log(`📵 User ${userEmail} has disabled mobile ` +
              "notifications for blog posts");
            continue;
          }

          // Get all tokens for this user and send notifications
          const userTokensQuery = db.collection("fcmTokens")
              .where("email", "==", userEmail);
          const userTokensSnapshot = await userTokensQuery.get();

          userTokensSnapshot.forEach((tokenDoc) => {
            const userTokenData = tokenDoc.data();
            const token = userTokenData.token;

            sendPromises.push((async () => {
              try {
                await admin.messaging().send({
                  notification: {
                    title: notificationTitle,
                    body: notificationBody,
                  },
                  data: {
                    url: `/blogs/${blogSlug}`,
                    type: "new_blog_post",
                    blogId: snapshot.id,
                    blogSlug: blogSlug,
                  },
                  token: token,
                });
                console.log(`✅ Blog notification sent to: ` +
                  `${token.substring(0, 10)}...`);
              } catch (error) {
                console.error(`❌ Failed to send blog notification to ` +
                  `${token.substring(0, 10)}...:`, error);

                // Remove invalid tokens
                if (error.code ===
                  "messaging/registration-token-not-registered") {
                  const tokenQuery = await db.collection("fcmTokens")
                      .where("token", "==", token).get();
                  tokenQuery.forEach(async (doc) => {
                    await doc.ref.delete();
                  });
                  console.log(`🗑️ Removed invalid token: ` +
                    token.substring(0, 10) + "...");
                }
              }
            })());
          });
        }

        await Promise.all(sendPromises);
        console.log(`🎉 Blog notifications completed for: ${blogData.title}`);
      } catch (error) {
        console.error("💥 Error sending blog notification:", error);
      }
    },
);

// Callable function for AI chat using Gemini
exports.chatWithAI = onCall(async (request) => {
  const {message, language = "de"} = request.data;

  if (!message) {
    throw new Error("Message is required");
  }

  const apiKey = process.env.GEMINI_API_KEY ||
    "AIzaSyCkcAo0KV6xD7v9FoEiL8sUsdQ1wTjOmf4";
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    // Context about RapidWorks
    const systemContext = `You are Rapi, the AI Assistant for RapidWorks, ` +
      `a platform that helps startups in Germany find the right experts, ` +
      `secure funding, receive coaching, develop MVPs, launch products, ` +
      `and grow sustainably.

ROLE & MISSION:
Your mission is to answer user questions, explain services, help identify ` +
      `the right solutions for their situation, and guide them toward the ` +
      `next best steps (webinar, consultation, or form submission).

PRIMARY RESPONSIBILITIES:
• Respond to questions about RapidWorks services: Branding, Coaching, ` +
      `Experts, Financing, MVP, Partners
• Explain prices, timeframes, and package details
• Provide technical support and ongoing collaboration information
• Explain why these services are essential for founders
• Share the mission, background, and unique approach of RapidWorks
• Discuss geographic coverage (Germany, with future expansion)
• Explain funding application support (up to €300,000, no commissions)
• Discuss available Developers, Designers, Marketing, and Finance experts

IMPORTANT PROMOTION:
At every suitable opportunity, mention that every two weeks, we host a ` +
      `free "Rapid Answers" webinar where founders can get all their ` +
      `questions answered. Invite users to sign up via the website.

FREE OFFERS:
1. Free call with RapidWorks via navigation bar button - all questions ` +
      `about services answered free of charge
2. "Rapid Answers" Webinars every 2 weeks with CEO Yannick (founder ` +
      `of 3 startups) answering startup questions live
3. Try one "Rapid Expert" for free for 1 hour (call or task)
4. "Rapid Financing" - show founders lucrative startup subsidies ` +
      `and help create applications completely free

SERVICES & PRICING:
• Rapid Branding: Entry-level service at €999 fixed price
• Customizations: €40/hour
• Lean startup methodology coaching
• Demand validation before expensive product development

FINANCING:
• All German businesses eligible for €100,000 in Deminimis Funding ` +
      `per year
• Up to €300,000 over 3 years in grants
• Help founders use this potential early
• Show most lucrative subsidies they could receive

KEY DIFFERENTIATORS:
• Full transparency
• Full cost control
• Holistic approach
• Capital-efficient methods
• Focused around startups and founders

TONE & STYLE:
• Supportive, friendly, professional
• Act like a coach or mentor
• Use clear, simple language focused on founder needs
• Keep responses short and easy to understand for small chat window
• Break information into bullet points if needed
• If question too general - ask clarifying question

COACHING APPROACH:
If user appears uncertain or lost:
• Be supportive, ask about their main bottleneck
• Suggest relevant solutions
• If no solution fits - recommend webinar or free consultation

LANGUAGES:
Communicate in either German or English, automatically based on the ` +
      `user's language.

DATA HANDLING:
• Never ask for or store personal data
• If users offer personal info - politely decline
• Chat history saved anonymously for internal analysis

LIMITATIONS:
If user asks about something unrelated to RapidWorks, politely explain ` +
      `that you only respond to questions about RapidWorks services.

GREETING:
When starting conversations: "Hi! 👋 Welcome to RapidWorks — your ` +
      `startup's all-in-one support hub 🚀 We help founders in Germany ` +
      `with everything from branding and MVP building to funding, coaching, ` +
      `and expert matching — all capital-efficient, transparent, and ` +
      `startup-focused. How can I support you today?"

IMPORTANT: Always respond in ${language === "de" ? "German" : "English"} ` +
      `language. User interface language is ${language}.`;


    const prompt = `${systemContext}\n\nUser Question: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      response: text,
    };
  } catch (error) {
    console.error("Error with Gemini AI:", error);
    throw new Error("Failed to process AI request");
  }
});

// Callable function for sending task message notifications (simplified)
exports.sendTaskMessageNotification = onCall(async (request) => {
  const {
    taskId,
    senderEmail,
    senderRole,
    recipientEmail,
    recipientRole,
    messageContent = "New message",
    messageType = "message",
    taskData,
  } = request.data || {};

  if (!recipientEmail) {
    throw new Error("recipientEmail is required");
  }

  try {
    console.log(
        `📬 [Simple] Send: ${messageType} ` +
        `from ${senderRole} to ${recipientRole} (${recipientEmail})`,
    );

    // Create notification content (no auth or preferences lookup)
    const taskTitle = taskData?.title || taskData?.service || "Task";
    let title;
    let body;

    switch (messageType) {
      case "task_created":
        title = "🆕 New Task Assignment";
        body = `You have a new task: "${taskTitle}"`;
        break;
      case "estimate":
        title = "💰 Estimate Received";
        body = `Estimate for "${taskTitle}": ${messageContent}`;
        break;
      default:
        if (senderRole === "expert") {
          title = "👨‍💼 Message from Expert";
          const preview = messageContent.substring(0, 50);
          const ellipsis = messageContent.length > 50 ? "..." : "";
          body = `Expert replied to "${taskTitle}": ${preview}${ellipsis}`;
        } else {
          title = "👤 Message from Client";
          const preview = messageContent.substring(0, 50);
          const ellipsis = messageContent.length > 50 ? "..." : "";
          body = `Client message for "${taskTitle}": ${preview}${ellipsis}`;
        }
        break;
    }

    const url = taskId ? `/dashboard?task=${taskId}` : "/dashboard";

    // Fetch tokens for the recipient email and send push (no preference checks)
    let notificationsSent = 0;
    try {
      console.log(
          `📱 [Simple] Looking for FCM tokens for: ${recipientEmail}`,
      );
      const tokensSnapshot = await db.collection("fcmTokens")
          .where("email", "==", recipientEmail)
          .get();

      console.log(
          `📊 [Simple] Found ${tokensSnapshot.size} token(s) for ` +
          `${recipientEmail}`,
      );

      if (!tokensSnapshot.empty) {
        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
        const message = {
          notification: {title, body},
          data: {url, type: "task_message", taskId: taskId || "",
            senderRole: senderRole || ""},
        };

        for (const token of tokens) {
          try {
            await admin.messaging().send({...message, token});
            notificationsSent++;
          } catch (tokenError) {
            console.error(
                `[Simple] Failed to send to token ` +
                `${token.substring(0, 10)}...:`,
                tokenError,
            );
            // Best-effort cleanup for invalid tokens
            if (
              tokenError.code ===
                "messaging/registration-token-not-registered" ||
              tokenError.code === "messaging/invalid-registration-token"
            ) {
              try {
                const invalidTokenDocs = await db
                    .collection("fcmTokens")
                    .where("token", "==", token)
                    .get();
                invalidTokenDocs.forEach((doc) => doc.ref.delete());
              } catch (cleanupError) {
                console.error(
                    "[Simple] Error cleaning up invalid token:",
                    cleanupError,
                );
              }
            }
          }
        }
      }
    } catch (sendError) {
      console.error(
          "[Simple] Error while sending push notifications:", sendError,
      );
    }

    // Best-effort: save to history only if we can resolve user (do not block)
    try {
      const recipientUserId = await getUserIdFromEmail(recipientEmail);
      if (recipientUserId) {
        await saveNotificationToHistory(recipientUserId, {
          title: title,
          body: body,
          type: "task_message",
          url: url,
          metadata: {
            taskId: taskId || "",
            senderEmail: senderEmail || "",
            senderRole: senderRole || "",
            messageType: messageType || "message",
            taskTitle: taskTitle,
          },
        });
      }
    } catch (historyError) {
      console.log(
          "[Simple] Skipping history save:",
          (historyError && historyError.message) || historyError,
      );
    }

    let responseMessage = "No push tokens for recipient. " +
      "Notification saved to history if possible.";
    if (notificationsSent > 0) {
      responseMessage = `Sent ${notificationsSent} push notification(s)`;
    }

    return {
      success: true,
      notificationsSent: notificationsSent,
      recipientEmail: recipientEmail,
      messageType: messageType,
      hasTokens: notificationsSent > 0,
      message: responseMessage,
    };
  } catch (error) {
    console.error(
        "[Simple] Error sending task message notification:", error,
    );
    throw new Error(`Failed to send task notification: ${error.message}`);
  }
});

// Firestore trigger: Auto send notifications when task documents are updated
exports.onTaskUpdated = onDocumentUpdated("taskRequests/{taskId}",
    async (event) => {
      const beforeData = event.data.before.data();
      const afterData = event.data.after.data();
      const taskId = event.params.taskId;

      console.log(`📝 Task ${taskId} was updated`);

      try {
        // Check if messages were added (length increased)
        const beforeMessages = beforeData.messages || [];
        const afterMessages = afterData.messages || [];

        if (afterMessages.length > beforeMessages.length) {
          // New message(s) were added
          const newMessages = afterMessages.slice(beforeMessages.length);
          console.log(`📬 ${newMessages.length} new message(s) detected ` +
            `in task ${taskId}`);

          for (const message of newMessages) {
            console.log(`Processing new message from: ${message.sender}`);

            // Skip system messages to avoid duplicate notifications
            if (message.sender === "system") {
              console.log("⏭️ Skipping system message");
              continue;
            }

            // Determine sender and recipient
            const senderRole = message.sender; // "expert" or "customer"
            const senderEmail = senderRole === "expert" ?
              afterData.expertEmail : afterData.userEmail;
            const recipientRole = senderRole === "expert" ?
              "customer" : "expert";
            const recipientEmail = senderRole === "expert" ?
              afterData.userEmail : afterData.expertEmail;

            if (!senderEmail || !recipientEmail) {
              if (!afterData.expertEmail) {
                console.log(`⚠️ Task ${taskId} has no assigned expert yet ` +
                  `(expertEmail is null). This is normal for tasks that ` +
                  `haven't been assigned to a specific expert.`);
                console.log(`📝 Skipping notification until expert is assigned.`);
              } else {
                console.log("⚠️ Missing email addresses, skipping notification");
                console.log(`   senderEmail: ${senderEmail}`);
                console.log(`   recipientEmail: ${recipientEmail}`);
                console.log(`   expertEmail: ${afterData.expertEmail}`);
                console.log(`   userEmail: ${afterData.userEmail}`);
              }
              continue;
            }

            console.log(`📤 Sending notification: ${senderRole} → ` +
              `${recipientRole}`);

            // Determine message type
            let messageType = "message";
            if (message.type === "estimate" ||
              message.content?.includes("€") ||
              message.content?.includes("$")) {
              messageType = "estimate";
            }

            // Get recipient's user ID and notification preferences
            const recipientUserId = await getUserIdFromEmail(recipientEmail);
            if (!recipientUserId) {
              console.log(`⚠️ Recipient user not found for email: ` +
                `${recipientEmail}`);
              continue;
            }

            const preferences =
              await getUserNotificationPreferences(recipientUserId);

            // Create notification content
            let title;
            let body;
            const taskTitle = afterData.taskName || afterData.service || "Task";

            switch (messageType) {
              case "estimate":
                title = "💰 Estimate Received";
                body = `Estimate for "${taskTitle}": ` +
                  `${message.content.substring(0, 50)}` +
                  `${message.content.length > 50 ? "..." : ""}`;
                break;
              default:
                if (senderRole === "expert") {
                  title = "👨‍💼 Message from Expert";
                  body = `Expert replied to "${taskTitle}": ` +
                    `${message.content.substring(0, 50)}` +
                    `${message.content.length > 50 ? "..." : ""}`;
                } else {
                  title = "👤 Message from Client";
                  body = `Client message for "${taskTitle}": ` +
                    `${message.content.substring(0, 50)}` +
                    `${message.content.length > 50 ? "..." : ""}`;
                }
                break;
            }

            const url = `/dashboard?task=${taskId}`;

            // Send mobile push notification if user wants them
            const shouldSendMobile = preferences.taskMessages?.mobile === true;

            if (shouldSendMobile) {
              try {
                console.log(`📱 Looking for FCM tokens for: ` +
                  `${recipientEmail}`);
                const tokensSnapshot = await db.collection("fcmTokens")
                    .where("email", "==", recipientEmail)
                    .get();

                console.log(`📊 Found ${tokensSnapshot.size} FCM token(s) ` +
                  `for ${recipientEmail}`);

                if (!tokensSnapshot.empty) {
                  const tokens = tokensSnapshot.docs
                      .map((doc) => doc.data().token);

                  const messagePayload = {
                    notification: {
                      title: title,
                      body: body,
                    },
                    data: {
                      url: url,
                      type: "task_message",
                      taskId: taskId,
                      senderRole: senderRole,
                    },
                  };

                  // Send to all user's devices
                  for (const token of tokens) {
                    try {
                      await admin.messaging().send({
                        ...messagePayload,
                        token: token,
                      });
                      console.log(`✅ Push notification sent to ` +
                        `${recipientEmail}`);
                    } catch (tokenError) {
                      console.error(`❌ Failed to send to token: ` +
                        `${tokenError.message}`);
                      // Remove invalid token
                      try {
                        const invalidTokenDocs = await db
                            .collection("fcmTokens")
                            .where("token", "==", token)
                            .get();
                        invalidTokenDocs.forEach((doc) => doc.ref.delete());
                      } catch (cleanupError) {
                        console.error("Error cleaning up invalid token:",
                            cleanupError);
                      }
                    }
                  }
                } else {
                  console.log(`📱 No FCM tokens found for: ` +
                    `${recipientEmail}`);
                  console.log(`❗ TASK NOTIFICATION ISSUE: User ${recipientEmail} ` +
                    `has not enabled task notifications yet.`);
                  console.log(`💡 SOLUTION: User needs to:`);
                  console.log(`   1. Visit the dashboard/website`);
                  console.log(`   2. Enable task notifications when prompted`);
                  console.log(`   3. Or manually enable them in notification settings`);
                  console.log(`📝 Notification will be saved to history instead.`);
                }
              } catch (error) {
                console.error("Error sending mobile notification:", error);
              }
            } else {
              console.log(`📵 User ${recipientEmail} has disabled mobile ` +
                "notifications for task messages");
            }

            // Save notification to history
            try {
              await saveNotificationToHistory(recipientUserId, {
                title: title,
                body: body,
                type: "task_message",
                url: url,
                metadata: {
                  taskId: taskId,
                  senderEmail: senderEmail,
                  senderRole: senderRole,
                  messageType: messageType,
                  taskTitle: taskTitle,
                },
              });
              console.log(`📝 Notification saved to history for: ` +
                `${recipientEmail}`);
            } catch (historyError) {
              console.error("Error saving notification to history:",
                  historyError);
            }
          }
        }

        console.log(`✅ Task update processing completed for ${taskId}`);
      } catch (error) {
        console.error(`❌ Error processing task update for ${taskId}:`,
            error);
      }
    });

// Mobile-specific notification test function
exports.sendTestMobileNotification = onCall(async (request) => {
  const {userEmail, testType = "mobile_test"} = request.data;

  if (!userEmail) {
    throw new Error("User email is required for mobile notification test");
  }

  try {
    console.log(`📱 Testing mobile notifications for: ${userEmail}`);

    // Get user ID
    const userId = await getUserIdFromEmail(userEmail);
    if (!userId) {
      throw new Error(`User not found for email: ${userEmail}`);
    }

    // Get FCM tokens for this user
    const tokensSnapshot = await db.collection("fcmTokens")
        .where("email", "==", userEmail)
        .get();

    console.log(`📊 Found ${tokensSnapshot.size} FCM token(s) for ${userEmail}`);

    if (tokensSnapshot.empty) {
      return {
        success: false,
        reason: "no_tokens",
        message: `No FCM tokens found for ${userEmail}. User needs to enable notifications first.`,
        userEmail: userEmail,
        tokenCount: 0,
      };
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    // Create mobile-optimized test notification
    const testNotification = {
      notification: {
        title: "📱 Mobile Test Notification",
        body: `Mobile notifications are working for ${userEmail}! This is a test message.`,
      },
      data: {
        url: "/dashboard",
        type: "mobile_test",
        testType: testType,
        timestamp: Date.now().toString(),
      },
    };

    let sentCount = 0;
    const errors = [];

    // Send to all user's tokens
    for (const token of tokens) {
      try {
        await admin.messaging().send({
          ...testNotification,
          token: token,
        });
        sentCount++;
        console.log(`✅ Mobile test notification sent to token: ${token.substring(0, 10)}...`);
      } catch (error) {
        console.error(`❌ Failed to send to token ${token.substring(0, 10)}...:`, error);
        errors.push({
          token: token.substring(0, 10) + "...",
          error: error.message,
        });

        // Remove invalid tokens
        if (error.code === "messaging/registration-token-not-registered") {
          try {
            const invalidTokenDocs = await db.collection("fcmTokens")
                .where("token", "==", token)
                .get();
            invalidTokenDocs.forEach((doc) => doc.ref.delete());
            console.log(`🗑️ Removed invalid token: ${token.substring(0, 10)}...`);
          } catch (cleanupError) {
            console.error("Error cleaning up invalid token:", cleanupError);
          }
        }
      }
    }

    // Save test notification to history
    await saveNotificationToHistory(userId, {
      title: testNotification.notification.title,
      body: testNotification.notification.body,
      type: "mobile_test",
      url: "/dashboard",
      metadata: {
        testType: testType,
        sentCount: sentCount,
        totalTokens: tokens.length,
        errors: errors,
      },
    });

    return {
      success: sentCount > 0,
      userEmail: userEmail,
      tokenCount: tokens.length,
      sentCount: sentCount,
      errors: errors,
      message: sentCount > 0 ?
        `Successfully sent ${sentCount}/${tokens.length} test notifications` :
        `Failed to send any notifications. ${errors.length} errors occurred.`,
    };
  } catch (error) {
    console.error("Error in mobile notification test:", error);
    throw new Error(`Mobile notification test failed: ${error.message}`);
  }
});

// Test function for task message notifications
exports.testTaskNotification = onCall(async (request) => {
  const {taskId, userEmail, expertEmail, messageContent = "Test task message"} = request.data;

  if (!taskId || !userEmail || !expertEmail) {
    throw new Error("Task ID, user email, and expert email are required for testing");
  }

  try {
    console.log(`🧪 Testing task notifications for task: ${taskId}`);

    // Simulate a task message update by directly triggering the notification logic
    const recipientUserId = await getUserIdFromEmail(userEmail);
    if (!recipientUserId) {
      throw new Error(`User not found for email: ${userEmail}`);
    }

    // Get user preferences
    const preferences = await getUserNotificationPreferences(recipientUserId);
    console.log("User task notification preferences:", preferences.taskMessages);

    // Check if user wants task message notifications
    const shouldSendMobile = preferences.taskMessages?.mobile === true;

    if (!shouldSendMobile) {
      return {
        success: false,
        reason: "user_preferences_disabled",
        message: `User ${userEmail} has task notifications disabled in preferences`,
        preferences: preferences.taskMessages,
      };
    }

    // Get FCM tokens for this user
    const tokensSnapshot = await db.collection("fcmTokens")
        .where("email", "==", userEmail)
        .get();

    console.log(`📊 Found ${tokensSnapshot.size} FCM token(s) for ${userEmail}`);

    if (tokensSnapshot.empty) {
      return {
        success: false,
        reason: "no_tokens",
        message: `No FCM tokens found for ${userEmail}. User needs to enable notifications first.`,
        userEmail: userEmail,
        tokenCount: 0,
        preferences: preferences.taskMessages,
      };
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    // Create test task message notification
    const testNotification = {
      notification: {
        title: "🧪 Test Task Message",
        body: `Test message for task ${taskId}: ${messageContent}`,
      },
      data: {
        url: `/dashboard?task=${taskId}`,
        type: "task_message",
        taskId: taskId,
        senderRole: "expert",
      },
    };

    let sentCount = 0;
    const errors = [];

    // Send to all user's tokens
    for (const token of tokens) {
      try {
        await admin.messaging().send({
          ...testNotification,
          token: token,
        });
        sentCount++;
        console.log(`✅ Test task notification sent to token: ${token.substring(0, 10)}...`);
      } catch (error) {
        console.error(`❌ Failed to send to token ${token.substring(0, 10)}...:`, error);
        errors.push({
          token: token.substring(0, 10) + "...",
          error: error.message,
        });

        // Remove invalid tokens
        if (error.code === "messaging/registration-token-not-registered") {
          try {
            const invalidTokenDocs = await db.collection("fcmTokens")
                .where("token", "==", token)
                .get();
            invalidTokenDocs.forEach((doc) => doc.ref.delete());
            console.log(`🗑️ Removed invalid token: ${token.substring(0, 10)}...`);
          } catch (cleanupError) {
            console.error("Error cleaning up invalid token:", cleanupError);
          }
        }
      }
    }

    // Save test notification to history
    await saveNotificationToHistory(recipientUserId, {
      title: testNotification.notification.title,
      body: testNotification.notification.body,
      type: "task_message_test",
      url: `/dashboard?task=${taskId}`,
      metadata: {
        taskId: taskId,
        testType: "task_notification_test",
        sentCount: sentCount,
        totalTokens: tokens.length,
        errors: errors,
      },
    });

    return {
      success: sentCount > 0,
      userEmail: userEmail,
      taskId: taskId,
      tokenCount: tokens.length,
      sentCount: sentCount,
      errors: errors,
      preferences: preferences.taskMessages,
      message: sentCount > 0 ?
        `Successfully sent ${sentCount}/${tokens.length} task test notifications` :
        `Failed to send any notifications. ${errors.length} errors occurred.`,
    };
  } catch (error) {
    console.error("Error in task notification test:", error);
    throw new Error(`Task notification test failed: ${error.message}`);
  }
});

// ============================================================================
// MID CREDENTIALS MANAGEMENT
// ============================================================================

// Encryption key - Store this in Firebase Functions config
// Run: firebase functions:config:set mid.encryption_key="key"
const ENCRYPTION_KEY = process.env.MID_ENCRYPTION_KEY ||
  "default-key-change-in-production-32";
const ALGORITHM = "aes-256-gcm";

/**
 * Encrypt a password using AES-256-GCM
 * @param {string} password - The plain text password to encrypt
 * @return {string} Encrypted password string with IV and auth tag
 */
function encryptPassword(password) {
  try {
    // Ensure key is exactly 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(password, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    // Return IV, encrypted data, and auth tag as a single string
    const result = `${iv.toString("hex")}:${encrypted}:` +
      `${authTag.toString("hex")}`;
    return result;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt password");
  }
}

/**
 * Decrypt a password using AES-256-GCM
 * @param {string} encryptedData - Encrypted password with IV and auth tag
 * @return {string} Decrypted plain text password
 */
function decryptPassword(encryptedData) {
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const parts = encryptedData.split(":");

    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt password");
  }
}

/**
 * Generate a secure random password
 * @param {number} length - Length of password (default 16)
 * @return {string} Secure random password
 */
function generateSecurePassword(length = 16) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

/**
 * Generate MID credentials (email, username, password)
 * @param {string} userEmail - User's email to extract domain from
 * @return {Object} Generated credentials object
 */
function generateMIDCredentials(userEmail) {
  // Extract domain from user's email
  const emailParts = userEmail.split("@");
  let domainPart = "company";

  if (emailParts.length === 2) {
    // Get domain without TLD (e.g., "rapid-works.io" -> "rapid-works")
    const fullDomain = emailParts[1];
    const domainSegments = fullDomain.split(".");

    // Take all parts except the last one (TLD)
    // e.g., "rapid-works.io" -> "rapid-works"
    // e.g., "company.co.uk" -> "company.co"
    if (domainSegments.length > 1) {
      domainPart = domainSegments.slice(0, -1).join("-");
    } else {
      domainPart = domainSegments[0];
    }
  }

  // Sanitize domain part (keep hyphens, replace other special chars)
  const sanitizedDomain = domainPart
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
      .substring(0, 30); // Allow longer domain names

  // One subsidy per organization - use dot separator for cleaner look
  const username = `subsidy.${sanitizedDomain}`;
  const email = `${username}@gmail.com`;
  const password = generateSecurePassword(16);

  return {
    email,
    username,
    password,
  };
}

/**
 * Callable function to decrypt MID password for admin view
 */
exports.decryptMIDPassword = onCall(async (request) => {
  try {
    console.log("🔓 Decrypt password request received:", request.data);
    const {submissionId} = request.data;

    if (!submissionId) {
      console.error("❌ No submission ID provided");
      throw new Error("Submission ID is required");
    }

    // Get the submission
    console.log("📖 Fetching submission:", submissionId);
    const submissionDoc = await db.collection("midFormSubmissions")
        .doc(submissionId).get();

    if (!submissionDoc.exists) {
      console.error("❌ Submission not found:", submissionId);
      throw new Error("Submission not found");
    }

    const submission = submissionDoc.data();
    console.log("✅ Submission found, checking credentials...");
    console.log("Credentials present:", !!submission.midCredentials);
    console.log("Password present:", !!submission.midCredentials?.password);

    if (!submission.midCredentials || !submission.midCredentials.password) {
      console.error("❌ No encrypted password found in submission");
      throw new Error(
          "No encrypted password found. " +
          "Credentials may not have been generated yet.",
      );
    }

    // Decrypt the password
    console.log("🔓 Decrypting password...");
    const decryptedPassword = decryptPassword(
        submission.midCredentials.password,
    );
    console.log("✅ Password decrypted successfully");

    // Log the access for audit trail
    await db.collection("midPasswordAccessLog").add({
      submissionId: submissionId,
      accessedBy: request.auth?.uid || "anonymous",
      accessedAt: admin.firestore.FieldValue.serverTimestamp(),
      email: submission.midCredentials.email,
    });

    return {
      success: true,
      password: decryptedPassword,
      email: submission.midCredentials.email,
      username: submission.midCredentials.username,
    };
  } catch (error) {
    console.error("Error decrypting MID password:", error);
    throw new Error(`Failed to decrypt password: ${error.message}`);
  }
});

/**
 * Firestore trigger to auto-generate MID credentials on submission creation
 */
exports.generateMIDCredentialsOnCreate = onDocumentCreated(
    "midFormSubmissions/{submissionId}",
    async (event) => {
      try {
        const submissionId = event.params.submissionId;
        const submission = event.data.data();

        // Check if credentials already exist
        if (submission.midCredentials) {
          console.log(`Credentials already exist for ${submissionId}`);
          return null;
        }

        // Generate credentials using user's email
        const userEmail = submission.userEmail || submission.email || "default@company.com";
        const credentials = generateMIDCredentials(userEmail);

        // Encrypt the password
        const encryptedPassword = encryptPassword(credentials.password);

        // Update the submission with encrypted credentials
        await db.collection("midFormSubmissions").doc(submissionId).update({
          midCredentials: {
            email: credentials.email,
            username: credentials.username,
            password: encryptedPassword, // Store encrypted
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            sentAt: null,
            sentBy: null,
          },
        });

        console.log(`✅ Generated MID credentials for ${submissionId}`);
        console.log(`User email: ${userEmail}`);
        console.log(`Generated email: ${credentials.email}, Username: ${credentials.username}`);

        return null;
      } catch (error) {
        console.error("Error generating MID credentials:", error);
        return null;
      }
    },
);

/**
 * Callable function to send custom email verification via SMTP
 */
exports.sendCustomEmailVerification = onCall(async (request) => {
  try {
    const {email, displayName} = request.data;

    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`📧 Sending custom email verification to: ${email}`);

    // Extract first name from displayName (format: "FirstName LastName")
    const firstName = displayName ? displayName.split(" ")[0] : "";

    // Generate verification link using Firebase Admin
    const actionCodeSettings = {
      url: `https://rapid-works.io/dashboard`, // Redirect after verification
      handleCodeInApp: false,
    };

    const verificationLink = await admin.auth().generateEmailVerificationLink(
        email,
        actionCodeSettings,
    );

    // Email content with branding
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bitte bestätige deine E-Mail-Adresse für RapidWorks</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-align: center;">
                Willkommen bei RapidWorks!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hallo${firstName ? ` ${firstName}` : ""},
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                vielen Dank für deine Registrierung bei RapidWorks! Wir freuen uns, dich an Bord zu haben.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                Um loszulegen, bestätige bitte deine E-Mail-Adresse, indem du auf den Button klickst:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(124, 59, 236, 0.3);">
                      E-Mail-Adresse bestätigen
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                Sollte der Button nicht funktionieren, kopiere einfach diesen Link und füge ihn in die Adresszeile deines Browsers ein:
              </p>
              
              <p style="margin: 0 0 30px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; word-break: break-all;">
                <a href="${verificationLink}" style="color: #7C3BEC; text-decoration: none; font-size: 14px;">
                  ${verificationLink}
                </a>
              </p>
              
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                Aus Sicherheitsgründen läuft dieser Link in 24 Stunden ab.
              </p>
              
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Wenn du dieses Konto nicht erstellt hast, kannst du diese E-Mail einfach ignorieren.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; text-align: center;">
                Hilfe benötigt? Kontaktiere uns unter 
                <a href="mailto:support@rapid-works.io" style="color: #7C3BEC; text-decoration: none;">support@rapid-works.io</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} RapidWorks. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailText = `
Willkommen bei RapidWorks!

Hallo${firstName ? ` ${firstName}` : ""},

vielen Dank für deine Registrierung bei RapidWorks! Wir freuen uns, dich an Bord zu haben.

Um loszulegen, bestätige bitte deine E-Mail-Adresse, indem du auf den Button klickst:

${verificationLink}

Aus Sicherheitsgründen läuft dieser Link in 24 Stunden ab.

Wenn du dieses Konto nicht erstellt hast, kannst du diese E-Mail einfach ignorieren.

Hilfe benötigt? Kontaktiere uns unter support@rapid-works.io

© ${new Date().getFullYear()} RapidWorks. All rights reserved.
    `;

    // Send email via SMTP
    const mailOptions = {
      from: "RapidWorks <rapidworks.notifications@gmail.com>",
      to: email,
      subject: "Bitte bestätige deine E-Mail-Adresse für RapidWorks",
      text: emailText,
      html: emailHtml,
    };

    await emailTransporter.sendMail(mailOptions);

    console.log(`✅ Verification email sent successfully to: ${email}`);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
});

/**
 * Callable function to send organization creation confirmation email
 */
exports.sendOrganizationCreatedEmail = onCall(async (request) => {
  try {
    const {email, displayName, organizationName} = request.data;

    if (!email || !organizationName) {
      throw new Error("Email and organization name are required");
    }

    console.log(`📧 Sending org creation email to: ${email}`);

    const dashboardUrl = "https://rapid-works.io/dashboard";

    // Email content with branding
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Organization Created - RapidWorks</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); padding: 40px 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-align: center;">
                Organization Created Successfully! 🎉
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi ${displayName || "there"},
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Great news! Your organization <strong>${organizationName}</strong> has been successfully created on RapidWorks.
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                You can now access all RapidWorks features and start managing your organization. Click the button below to go to your dashboard:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(124, 59, 236, 0.3);">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- What's Next Section -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #7C3BEC;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px; font-weight: 600;">
                  What's Next?
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Complete your MID funding fields to apply for up to €15,000</li>
                  <li>Book a free coaching call with our team</li>
                  <li>Explore other funding opportunities</li>
                </ul>
              </div>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                If you have any questions or need assistance, our team is here to help at 
                <a href="mailto:support@rapid-works.io" style="color: #7C3BEC; text-decoration: none;">support@rapid-works.io</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px; text-align: center;">
                Need help? Contact us at 
                <a href="mailto:support@rapid-works.io" style="color: #7C3BEC; text-decoration: none;">support@rapid-works.io</a>
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} RapidWorks. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailText = `
Organization Created Successfully!

Hi ${displayName || "there"},

Great news! Your organization "${organizationName}" has been successfully created on RapidWorks.

You can now access all RapidWorks features and start managing your organization.

Go to your dashboard: ${dashboardUrl}

What's Next?
- Complete your MID funding fields to apply for up to €15,000
- Book a free coaching call with our team
- Explore other funding opportunities

If you have any questions or need assistance, our team is here to help at support@rapid-works.io

© ${new Date().getFullYear()} RapidWorks. All rights reserved.
    `;

    // Send email via SMTP
    const mailOptions = {
      from: "RapidWorks <rapidworks.notifications@gmail.com>",
      to: email,
      subject: `Organization Created - ${organizationName}`,
      text: emailText,
      html: emailHtml,
    };

    await emailTransporter.sendMail(mailOptions);

    console.log(`✅ Organization creation email sent to: ${email}`);

    return {
      success: true,
      message: "Organization creation email sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending organization creation email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
});

/**
 * Callable function to send opt-out notification to Yannick
 */
exports.sendOptOutNotification = onCall(async (request) => {
  try {
    const {userId, userEmail, reason, timestamp} = request.data;

    if (!userId || !userEmail || !reason) {
      throw new Error("Missing required fields: userId, userEmail, and reason are required");
    }

    console.log(`📧 Sending MID opt-out notification for user: ${userEmail}`);

    // Verify transporter connection
    try {
      await emailTransporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (verifyError) {
      console.error("❌ SMTP verification failed:", verifyError);
      throw new Error(`Email service unavailable: ${verifyError.message}`);
    }

    // Opt-out notification email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <h2 style="color: #7C3BEC; border-bottom: 2px solid #7C3BEC; padding-bottom: 10px;">MID Application Opt-Out Notification</h2>
  
  <p>A user has opted out of the MID application process.</p>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #333;">User Details:</h3>
    <p><strong>User Email:</strong> ${userEmail}</p>
    <p><strong>User ID:</strong> ${userId}</p>
    <p><strong>Opt-out Reason:</strong> ${reason}</p>
    <p><strong>Timestamp:</strong> ${timestamp}</p>
  </div>
  
  <p>This user has chosen to skip the MID application step in their onboarding process.</p>
  
  <p>You can view their organization details in the <a href="https://www.rapid-works.io/dashboard?tab=organizations" style="color: #7C3BEC; text-decoration: none; font-weight: bold;">RapidWorks admin panel</a>.</p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #666;">This notification was automatically generated by the RapidWorks system.</p>
  
</body>
</html>
    `;

    // Plain text version
    const emailText = `
MID Application Opt-Out Notification

A user has opted out of the MID application process.

User Details:
- User Email: ${userEmail}
- User ID: ${userId}
- Opt-out Reason: ${reason}
- Timestamp: ${timestamp}

This user has chosen to skip the MID application step in their onboarding process.

You can view their organization details in the RapidWorks admin panel: https://www.rapid-works.io/dashboard?tab=organizations

---
This notification was automatically generated by the RapidWorks system.
    `;

    // Send the email to Yannick
    const mailOptions = {
      from: "\"RapidWorks System\" <rapidworks.notifications@gmail.com>",
      to: "yannick.heeren@rapid-works.io",
      subject: `MID Opt-Out: ${userEmail}`,
      text: emailText,
      html: emailHtml,
      replyTo: "rapidworks.notifications@gmail.com",
      headers: {
        "X-Mailer": "RapidWorks",
        "List-Unsubscribe": "<mailto:yannick.heeren@rapid-works.io>",
      },
    };

    console.log("📤 Sending opt-out notification email...");
    const emailResult = await emailTransporter.sendMail(mailOptions);
    console.log("📨 Email send result:", JSON.stringify(emailResult));
    console.log(`✅ Opt-out notification sent successfully to yannick@rapid-works.io`);

    return {
      success: true,
      message: "Opt-out notification sent successfully",
      emailResult: emailResult.messageId,
    };
  } catch (error) {
    console.error("❌ Error sending opt-out notification:", error);
    throw new Error(`Failed to send opt-out notification: ${error.message}`);
  }
});

/**
 * Callable function to send MID credentials email
 */
exports.sendMIDCredentialsEmail = onCall(async (request) => {
  try {
    const {submissionId} = request.data;

    if (!submissionId) {
      throw new Error("Submission ID is required");
    }

    console.log(`📧 Sending MID credentials email for submission: ${submissionId}`);

    // Get the submission
    const submissionDoc = await db.collection("midFormSubmissions")
        .doc(submissionId).get();

    if (!submissionDoc.exists) {
      throw new Error("Submission not found");
    }

    const submission = submissionDoc.data();

    if (!submission.midCredentials) {
      throw new Error("No credentials found for this submission");
    }

    // Determine recipient email (userEmail or email field)
    const recipientEmail = submission.userEmail || submission.email;
    if (!recipientEmail) {
      throw new Error("No recipient email found in submission");
    }

    const recipientName = submission.firstName || submission.contactFirstName || "there";
    const companyName = submission.legalName || submission.name || "your company";

    console.log(`📬 Sending email to: ${recipientEmail}`);

    // Verify transporter connection
    try {
      await emailTransporter.verify();
      console.log("✅ SMTP connection verified");
    } catch (verifyError) {
      console.error("❌ SMTP verification failed:", verifyError);
      throw new Error(`Email service unavailable: ${verifyError.message}`);
    }

    // MID credentials email template
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <p>Hello ${recipientName},</p>
  
  <p>In accordance with your mandate, we have created your MID profile for <strong>${companyName}</strong> and have already submitted your entry for the current month's lottery.</p>
  
  <p>This means that you have already done everything important on your part. <strong>There is nothing else for you to do at this point.</strong> We will take care of submitting your entry for the monthly lottery and will inform you immediately by email and phone if your entry is selected. This service is completely free of charge for you.</p>
  
  <p>You can securely view the MID login details we have generated for you in your <a href="https://www.rapid-works.io/dashboard?tab=financing&viewCredentials=true&submissionId=${submissionId}" style="color: #7C3BEC; text-decoration: none; font-weight: bold;">Rapid-Works account</a> under <strong>MID Credentials</strong>. You can use these to log in to the MID account we have created for you.</p>
  
  <p>
    <a href="https://www.rapid-works.io/dashboard?tab=financing&viewCredentials=true&submissionId=${submissionId}" style="display: inline-block; background: #7C3BEC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">View MID Credentials</a>
  </p>
  
  <p><strong>Important:</strong> If any of your company details change, such as the number of employees or your address, please do <strong>NOT</strong> update this information in your MID account, but directly in your Rapid-Works organization <strong>${companyName}</strong>. We will then update all your data with third parties such as MID. Otherwise, our data will no longer be synchronized.</p>
  
  <p>We will check the accuracy of your data and your continued interest in the MID lottery at regular intervals by email.</p>
  
  <p>If you have any questions, please feel free to contact <a href="mailto:support@rapid-works.io" style="color: #7C3BEC;">support@rapid-works.io</a>.</p>
  
  <br>
  
  <p>Best regards,</p>
  <p>Your RapidWorks Team</p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="font-size: 12px; color: #666;">This email was sent from RapidWorks regarding your MID application for ${companyName}.</p>
  
</body>
</html>
    `;

    // Plain text version
    const emailText = `
Hello ${recipientName},

In accordance with your mandate, we have created your MID profile for ${companyName} and have already submitted your entry for the current month's lottery.

This means that you have already done everything important on your part. There is nothing else for you to do at this point. We will take care of submitting your entry for the monthly lottery and will inform you immediately by email and phone if your entry is selected. This service is completely free of charge for you.

You can securely view the MID login details we have generated for you in your Rapid-Works account under MID Credentials. You can use these to log in to the MID account we have created for you.

View your credentials here: https://www.rapid-works.io/dashboard?tab=financing&viewCredentials=true&submissionId=${submissionId}

Important: If any of your company details change, such as the number of employees or your address, please do NOT update this information in your MID account, but directly in your Rapid-Works organization ${companyName}. We will then update all your data with third parties such as MID. Otherwise, our data will no longer be synchronized.

We will check the accuracy of your data and your continued interest in the MID lottery at regular intervals by email.

If you have any questions, please feel free to contact support@rapid-works.io.


Best regards,

Your RapidWorks Team

---
This email was sent from RapidWorks regarding your MID application for ${companyName}.
    `;

    // Send the email
    const mailOptions = {
      from: "\"RapidWorks\" <rapidworks.notifications@gmail.com>",
      to: recipientEmail,
      subject: `Your MID Profile Has Been Created - ${companyName}`,
      text: emailText,
      html: emailHtml,
      replyTo: "samuel.donkor@rapid-works.io",
      headers: {
        "X-Mailer": "RapidWorks",
        "List-Unsubscribe": "<mailto:samuel.donkor@rapid-works.io>",
      },
    };

    console.log("📤 Sending email via nodemailer...");
    const emailResult = await emailTransporter.sendMail(mailOptions);
    console.log("📨 Email send result:", JSON.stringify(emailResult));
    console.log(`✅ Email sent successfully to ${recipientEmail}`);

    // Update submission status to 'submitted'
    await db.collection("midFormSubmissions").doc(submissionId).update({
      "status": "submitted",
      "midCredentials.sentAt": admin.firestore.FieldValue.serverTimestamp(),
      "midCredentials.sentBy": request.auth?.uid || "anonymous",
    });

    // Log the email send
    await db.collection("midCredentialsEmailLog").add({
      submissionId: submissionId,
      sentTo: recipientEmail,
      sentBy: request.auth?.uid || "anonymous",
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      email: submission.midCredentials.email,
      username: submission.midCredentials.username,
    });

    console.log("✅ MID credentials email process completed");

    return {
      success: true,
      message: "MID credentials email sent successfully",
      sentTo: recipientEmail,
      status: "submitted",
      credentials: {
        email: submission.midCredentials.email,
        username: submission.midCredentials.username,
        // Don't return password in response
      },
    };
  } catch (error) {
    console.error("❌ Error sending MID credentials email:", error);
    throw new Error(`Failed to send credentials email: ${error.message}`);
  }
});

/**
 * Scheduled function to check for users who haven't booked a coaching call
 * Runs daily at 9 AM UTC
 * Sends email to yannick.heeren@rapid-works.io for each user
 */
exports.checkCoachingCallReminders = onSchedule("0 9 * * *", async (event) => {
  try {
    console.log("🔔 Running daily coaching call reminder check...");

    // Calculate timestamp 48 hours ago
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
    const fortyEightHoursAgoISO = fortyEightHoursAgo.toISOString();

    console.log(`⏰ Checking for users who applied before: ${fortyEightHoursAgoISO}`);

    // Query Firestore for users matching criteria
    const onboardingSnapshot = await db.collection("userOnboarding")
        .where("midApplied", "==", true)
        .where("bookingCallCompleted", "==", false)
        .where("callReminderSent", "==", false)
        .get();

    console.log(`📊 Found ${onboardingSnapshot.size} potential users to check`);

    let remindersSent = 0;

    for (const doc of onboardingSnapshot.docs) {
      const data = doc.data();
      const userId = doc.id;

      // Check if midAppliedAt exists and is older than 48 hours
      if (!data.midAppliedAt) {
        console.log(`⚠️  User ${userId} has no midAppliedAt timestamp, skipping`);
        continue;
      }

      const midAppliedAt = new Date(data.midAppliedAt);
      if (midAppliedAt > fortyEightHoursAgo) {
        console.log(`⏳ User ${userId} applied too recently (${midAppliedAt.toISOString()}), skipping`);
        continue;
      }

      // Get user details
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        console.log(`⚠️  User ${userId} not found in users collection, skipping`);
        continue;
      }

      const userData = userDoc.data();
      const userEmail = userData.email || "Unknown";
      const userName = userData.displayName || userData.email?.split("@")[0] || "Unknown User";

      // Calculate days since MID application
      const daysSinceApplication = Math.floor((Date.now() - midAppliedAt.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📧 Sending reminder for user: ${userName} (${userEmail}) - ${daysSinceApplication} days since MID`);

      // Send email to Yannick
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coaching Call Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🔔 Coaching Call Reminder
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi Yannick,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                The following user completed their MID application but hasn't booked their coaching call yet:
              </p>
              
              <!-- User Info Card -->
              <div style="background-color: #f8f4ff; border-left: 4px solid #7C3BEC; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>👤 Name:</strong> ${userName}
                </p>
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>📧 Email:</strong> ${userEmail}
                </p>
                <p style="margin: 0; color: #333333; font-size: 16px;">
                  <strong>📅 MID Applied:</strong> ${daysSinceApplication} day${daysSinceApplication !== 1 ? "s" : ""} ago (${midAppliedAt.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric"})})
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                You may want to follow up with them to encourage booking their coaching call.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rapid-works.io/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This is an automated reminder from RapidWorks<br>
                © ${new Date().getFullYear()} RapidWorks. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const emailText = `
🔔 Coaching Call Reminder

Hi Yannick,

The following user completed their MID application but hasn't booked their coaching call yet:

👤 Name: ${userName}
📧 Email: ${userEmail}
📅 MID Applied: ${daysSinceApplication} day${daysSinceApplication !== 1 ? "s" : ""} ago (${midAppliedAt.toLocaleDateString("en-US")})

You may want to follow up with them to encourage booking their coaching call.

View in Dashboard: https://rapid-works.io/dashboard

---
This is an automated reminder from RapidWorks
© ${new Date().getFullYear()} RapidWorks. All rights reserved.
      `;

      const mailOptions = {
        from: "RapidWorks <rapidworks.notifications@gmail.com>",
        to: "yannick.heeren@rapid-works.io",
        subject: `🔔 Coaching Call Reminder - ${userName}`,
        text: emailText,
        html: emailHtml,
      };

      await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Reminder email sent for user: ${userName} (${userEmail})`);

      // Mark reminder as sent
      await db.collection("userOnboarding").doc(userId).update({
        callReminderSent: true,
        callReminderSentAt: new Date().toISOString(),
      });

      remindersSent++;
    }

    console.log(`✅ Coaching call reminder check complete. Sent ${remindersSent} reminder(s).`);
    return {success: true, remindersSent};
  } catch (error) {
    console.error("❌ Error in checkCoachingCallReminders:", error);
    throw new Error(`Failed to check coaching call reminders: ${error.message}`);
  }
});

/**
 * Manual trigger for coaching call reminders (for testing)
 * Can be called from Firebase Console or frontend
 */
exports.testCoachingCallReminders = onCall(async (request) => {
  try {
    console.log("🧪 Manual test trigger for coaching call reminders");

    // Calculate timestamp 48 hours ago
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
    const fortyEightHoursAgoISO = fortyEightHoursAgo.toISOString();

    console.log(`⏰ Checking for users who applied before: ${fortyEightHoursAgoISO}`);

    // Query Firestore for users matching criteria
    const onboardingSnapshot = await db.collection("userOnboarding")
        .where("midApplied", "==", true)
        .where("bookingCallCompleted", "==", false)
        .where("callReminderSent", "==", false)
        .get();

    console.log(`📊 Found ${onboardingSnapshot.size} potential users to check`);

    let remindersSent = 0;
    const results = [];

    for (const doc of onboardingSnapshot.docs) {
      const data = doc.data();
      const userId = doc.id;

      // Check if midAppliedAt exists and is older than 48 hours
      if (!data.midAppliedAt) {
        const msg = `User ${userId} has no midAppliedAt timestamp, skipping`;
        console.log(`⚠️  ${msg}`);
        results.push({userId, status: "skipped", reason: "no_timestamp"});
        continue;
      }

      const midAppliedAt = new Date(data.midAppliedAt);
      if (midAppliedAt > fortyEightHoursAgo) {
        const msg = `User ${userId} applied too recently (${midAppliedAt.toISOString()}), skipping`;
        console.log(`⏳ ${msg}`);
        results.push({
          userId,
          status: "skipped",
          reason: "too_recent",
          appliedAt: midAppliedAt.toISOString(),
        });
        continue;
      }

      // Get user details
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        console.log(`⚠️  User ${userId} not found in users collection, skipping`);
        results.push({userId, status: "skipped", reason: "user_not_found"});
        continue;
      }

      const userData = userDoc.data();
      const userEmail = userData.email || "Unknown";
      const userName = userData.displayName || userData.email?.split("@")[0] || "Unknown User";

      // Calculate days since MID application
      const daysSinceApplication = Math.floor((Date.now() - midAppliedAt.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📧 Sending reminder for user: ${userName} (${userEmail}) - ${daysSinceApplication} days since MID`);

      // Send email to Yannick
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coaching Call Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🔔 Coaching Call Reminder (TEST)
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi Yannick,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                The following user completed their MID application but hasn't booked their coaching call yet:
              </p>
              
              <!-- User Info Card -->
              <div style="background-color: #f8f4ff; border-left: 4px solid #7C3BEC; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>👤 Name:</strong> ${userName}
                </p>
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>📧 Email:</strong> ${userEmail}
                </p>
                <p style="margin: 0; color: #333333; font-size: 16px;">
                  <strong>📅 MID Applied:</strong> ${daysSinceApplication} day${daysSinceApplication !== 1 ? "s" : ""} ago (${midAppliedAt.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric"})})
                </p>
              </div>
              
              <p style="margin: 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                You may want to follow up with them to encourage booking their coaching call.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rapid-works.io/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This is a TEST reminder from RapidWorks<br>
                © ${new Date().getFullYear()} RapidWorks. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const emailText = `
🔔 Coaching Call Reminder (TEST)

Hi Yannick,

The following user completed their MID application but hasn't booked their coaching call yet:

👤 Name: ${userName}
📧 Email: ${userEmail}
📅 MID Applied: ${daysSinceApplication} day${daysSinceApplication !== 1 ? "s" : ""} ago (${midAppliedAt.toLocaleDateString("en-US")})

You may want to follow up with them to encourage booking their coaching call.

View in Dashboard: https://rapid-works.io/dashboard

---
This is a TEST reminder from RapidWorks
© ${new Date().getFullYear()} RapidWorks. All rights reserved.
      `;

      const mailOptions = {
        from: "RapidWorks <rapidworks.notifications@gmail.com>",
        to: "yannick.heeren@rapid-works.io",
        subject: `🔔 Coaching Call Reminder (TEST) - ${userName}`,
        text: emailText,
        html: emailHtml,
      };

      await emailTransporter.sendMail(mailOptions);
      console.log(`✅ Reminder email sent for user: ${userName} (${userEmail})`);

      // Mark reminder as sent
      await db.collection("userOnboarding").doc(userId).update({
        callReminderSent: true,
        callReminderSentAt: new Date().toISOString(),
      });

      remindersSent++;
      results.push({
        userId,
        status: "sent",
        userName,
        userEmail,
        daysSinceApplication,
      });
    }

    console.log(`✅ Test complete. Sent ${remindersSent} reminder(s).`);
    return {
      success: true,
      remindersSent,
      totalChecked: onboardingSnapshot.size,
      results,
    };
  } catch (error) {
    console.error("❌ Error in testCoachingCallReminders:", error);
    throw new Error(`Failed to test coaching call reminders: ${error.message}`);
  }
});

// Extract company data from website by auto-finding Impressum page
exports.extractImpressumData = onCall(async (request) => {
  try {
    console.log("🚀 Starting extractImpressumData function");

    const {url} = request.data;

    if (!url) {
      console.error("No URL provided");
      throw new Error("URL is required");
    }

    console.log(`🔍 Extracting company data from website: ${url}`);

    // Normalize URL with comprehensive error handling
    let baseUrl; let homepage;
    try {
      baseUrl = url.trim();
      if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
        baseUrl = "https://" + baseUrl;
      }

      // Validate URL format
      const urlObj = new URL(baseUrl);
      homepage = `${urlObj.protocol}//${urlObj.hostname}`;
      console.log(`✅ Valid URL: ${homepage}`);
    } catch (urlError) {
      console.error(" Invalid URL format:", url, urlError.message);
      throw new Error(`URL is not valid: ${url}`);
    }

    // Common Impressum/Imprint page paths to try
    const impressumPaths = [
      "/impressum",
      "/imprint",
      "/de/impressum",
      "/en/imprint",
      "/kontakt",
      "/contact",
      "/about",
      "/ueber-uns",
      "/legal",
      "/legal-notice",
      "/company",
      "/unternehmen",
    ];

    let impressumHtml = null;
    let impressumUrl = null;

    // Try to find the Impressum page with comprehensive error handling
    console.log("🔎 Searching for Impressum page...");
    for (const path of impressumPaths) {
      try {
        const testUrl = homepage + path;
        console.log(`  Trying: ${testUrl}`);

        const response = await axios.get(testUrl, {
          timeout: 15000, // Increased timeout
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
          },
          maxRedirects: 5,
          validateStatus: function(status) {
            return status >= 200 && status < 400; // Accept redirects
          },
        });

        // Check if page likely contains Impressum info
        const testHtml = response.data.toLowerCase();
        const bodyText = cheerio.load(response.data)("body").text().replace(/\s+/g, " ").trim();

        console.log(`🔍 Checking ${testUrl}: bodyText length=${bodyText.length}, contains JS=${bodyText.includes("enable JavaScript")}`);

        if (testHtml.includes("impressum") || testHtml.includes("imprint") ||
            testHtml.includes("geschäftsführ") || testHtml.includes("handelsregister")) {
          impressumHtml = response.data;
          impressumUrl = testUrl;
          console.log(`✅ Found Impressum at: ${testUrl}`);
          break;
        }

        // If we got a SPA shell (contains "enable JavaScript"), try Puppeteer
        if (bodyText.includes("enable JavaScript") || bodyText.includes("You need to enable JavaScript")) {
          console.log(`🤖 Detected SPA, trying Puppeteer for: ${testUrl}`);
          try {
            const spaContent = await fetchSPAContent(testUrl);
            if (spaContent) {
              const spaHtml = spaContent.toLowerCase();
              if (spaHtml.includes("impressum") || spaHtml.includes("imprint") ||
                  spaHtml.includes("geschäftsführ") || spaHtml.includes("handelsregister")) {
                impressumHtml = spaContent;
                impressumUrl = testUrl;
                console.log(`✅ Found Impressum with Puppeteer at: ${testUrl}`);
                break;
              }
            }
          } catch (puppeteerError) {
            console.warn(`⚠️ Puppeteer failed for ${testUrl}:`, puppeteerError.message);
            // Continue with regular extraction
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to access ${homepage + path}:`, error.message);
        // Page doesn't exist or error, continue trying
        continue;
      }
    }

    // If no Impressum page found, try the homepage itself with error handling
    if (!impressumHtml) {
      console.log("⚠️ No dedicated Impressum page found, using homepage");
      try {
        const response = await axios.get(homepage, {
          timeout: 15000, // Increased timeout
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
          },
          maxRedirects: 5,
          validateStatus: function(status) {
            return status >= 200 && status < 400;
          },
        });

        const bodyText = cheerio.load(response.data)("body").text().replace(/\s+/g, " ").trim();

        // If homepage is also a SPA, try Puppeteer
        if (bodyText.includes("enable JavaScript") || bodyText.includes("You need to enable JavaScript")) {
          console.log(`🤖 Homepage is SPA, trying Puppeteer`);
          try {
            const spaContent = await fetchSPAContent(homepage);
            if (spaContent) {
              impressumHtml = spaContent;
              impressumUrl = homepage;
            } else {
              impressumHtml = response.data;
              impressumUrl = homepage;
            }
          } catch (puppeteerError) {
            console.warn(`⚠️ Puppeteer failed for homepage:`, puppeteerError.message);
            impressumHtml = response.data;
            impressumUrl = homepage;
          }
        } else {
          impressumHtml = response.data;
          impressumUrl = homepage;
        }
      } catch (error) {
        console.error("❌ Could not access website:", error.message);
        throw new Error(`Could not access website: ${error.message}`);
      }
    }

    // Parse HTML with error handling
    let html; let $;
    try {
      html = impressumHtml;
      $ = cheerio.load(html);
      console.log("✅ HTML parsed successfully");
    } catch (parseError) {
      console.error("❌ Failed to parse HTML:", parseError.message);
      throw new Error(`Failed to parse website content: ${parseError.message}`);
    }

    // Also fetch the homepage for industry detection if we haven't already
    let homepageHtml = "";
    if (impressumUrl !== homepage) {
      try {
        console.log("🔍 Fetching homepage for industry detection...");
        const homepageResponse = await axios.get(homepage, {
          timeout: 15000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
          },
          maxRedirects: 5,
          validateStatus: function(status) {
            return status >= 200 && status < 400;
          },
        });
        homepageHtml = homepageResponse.data;
        console.log("✅ Homepage fetched for industry detection");
      } catch (error) {
        console.warn("⚠️ Could not fetch homepage for industry detection:", error.message);
        homepageHtml = html; // Fallback to impressum page
      }
    } else {
      homepageHtml = html;
    }

    const extractedData = {
      success: true,
      companyName: null,
      address: {
        street: null,
        city: null,
        postalCode: null,
        country: null,
      },
      homepage: homepage || null, // Store homepage early for domain-based IT detection
      suggestedIndustry: null,
      companyType: null,
      companyDescription: null,
      email: null,
      phone: null,
      foundingDate: null,
      taxId: null,
    };

    // Helper: safe JSON parse
    const tryParseJson = (text) => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    };

    // 1) Try JSON-LD (Organization / LocalBusiness)
    $("script[type=\"application/ld+json\"]").each((_, el) => {
      if (extractedData.companyName && extractedData.address.street && extractedData.address.city && extractedData.address.postalCode) return; // already good
      const json = tryParseJson($(el).contents().text());
      if (!json) return;
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        const isOrg = typeof item === "object" && item && (
          item["@type"] === "Organization" ||
          item["@type"] === "LocalBusiness" ||
          (Array.isArray(item["@type"]) && item["@type"].some((t) => ["Organization", "LocalBusiness"].includes(t)))
        );
        if (!isOrg) continue;
        if (!extractedData.companyName && (item.legalName || item.name)) {
          const name = (item.legalName || item.name).toString().trim();
          // Filter out common legal page terms
          if (!name.toLowerCase().includes("impressum") &&
              !name.toLowerCase().includes("imprint") &&
              !name.toLowerCase().includes("legal") &&
              !name.toLowerCase().includes("datenschutz") &&
              !name.toLowerCase().includes("privacy") &&
              name.length > 2) {
            extractedData.companyName = name;
          }
        }
        const addr = item.address || item["@graph"]?.find((x) => x["@type"] === "PostalAddress");
        if (addr) {
          if (!extractedData.address.street && (addr.streetAddress)) extractedData.address.street = String(addr.streetAddress).trim();
          if (!extractedData.address.city && (addr.addressLocality)) extractedData.address.city = String(addr.addressLocality).trim();
          if (!extractedData.address.postalCode && (addr.postalCode)) extractedData.address.postalCode = String(addr.postalCode).trim();
          if (!extractedData.address.country && (addr.addressCountry)) extractedData.address.country = String(addr.addressCountry).toLowerCase();
        }
        if (!extractedData.homepage && item.url) extractedData.homepage = item.url;
        if (!extractedData.email && item.email) extractedData.email = item.email;
        if (!extractedData.phone && item.telephone) extractedData.phone = item.telephone;
        if (!extractedData.foundingDate && item.foundingDate) extractedData.foundingDate = item.foundingDate;
        if (!extractedData.taxId && item.taxID) extractedData.taxId = item.taxID;
      }
    });

    // 2) Meta tags fallback
    if (!extractedData.companyName) {
      const metaSiteName = $("meta[property=\"og:site_name\"]").attr("content") || $("meta[name=\"application-name\"]").attr("content");
      if (metaSiteName) {
        const name = metaSiteName.trim();
        // Filter out common legal page terms
        if (!name.toLowerCase().includes("impressum") &&
            !name.toLowerCase().includes("imprint") &&
            !name.toLowerCase().includes("legal") &&
            !name.toLowerCase().includes("datenschutz") &&
            !name.toLowerCase().includes("privacy") &&
            name.length > 2) {
          extractedData.companyName = name;
        }
      }
    }
    if (!extractedData.homepage) {
      const canonical = $("link[rel=\"canonical\"]").attr("href");
      if (canonical) extractedData.homepage = canonical;
    }

    // 3) Enhanced address extraction from visible text
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    console.log("🔍 Body text preview:", bodyText.substring(0, 500));

    // Try to find address sections first
    const addressSelectors = [
      ".address", ".contact", ".impressum", ".imprint",
      "[class*=\"address\"]", "[class*=\"contact\"]", "[class*=\"impressum\"]",
      "address", "footer", ".footer",
    ];

    let addressText = bodyText;
    for (const selector of addressSelectors) {
      const element = $(selector);
      if (element.length && element.text().trim()) {
        addressText = element.text().replace(/\s+/g, " ").trim();
        console.log(`📍 Found address section with selector "${selector}":`, addressText.substring(0, 200));
        break;
      }
    }

    // Postal code + city: Multiple patterns
    if (!extractedData.address.postalCode || !extractedData.address.city) {
      // German 5-digit pattern
      const pcCityDE = addressText.match(/\b(\d{5})\b\s+([A-Za-zÄÖÜäöüß\-\s]{2,40})/);
      if (pcCityDE) {
        if (!extractedData.address.postalCode) extractedData.address.postalCode = pcCityDE[1];
        if (!extractedData.address.city) extractedData.address.city = pcCityDE[2].trim();
      }

      // Austrian 4-digit pattern
      if (!extractedData.address.postalCode) {
        const pcCityAT = addressText.match(/\b(\d{4})\b\s+([A-Za-zÄÖÜäöüß\-\s]{2,40})/);
        if (pcCityAT) {
          extractedData.address.postalCode = pcCityAT[1];
          if (!extractedData.address.city) extractedData.address.city = pcCityAT[2].trim();
        }
      }

      // Swiss 4-digit pattern
      if (!extractedData.address.postalCode) {
        const pcCityCH = addressText.match(/\b(\d{4})\b\s+([A-Za-zÄÖÜäöüß\-\s]{2,40})/);
        if (pcCityCH) {
          extractedData.address.postalCode = pcCityCH[1];
          if (!extractedData.address.city) extractedData.address.city = pcCityCH[2].trim();
        }
      }
    }

    // Street + house number: Multiple patterns
    if (!extractedData.address.street) {
      const streetPatterns = [
        // German patterns - more specific
        /([A-Za-zÄÖÜäöüß\-\s]+(?:straße|str\.|str|Straße|Str\.|Str))\s*\d+[a-zA-Z]?/i,
        /([A-Za-zÄÖÜäöüß\-\s]+(?:weg|Weg))\s*\d+[a-zA-Z]?/i,
        /([A-Za-zÄÖÜäöüß\-\s]+(?:platz|Platz))\s*\d+[a-zA-Z]?/i,
        /([A-Za-zÄÖÜäöüß\-\s]+(?:allee|Allee))\s*\d+[a-zA-Z]?/i,
        /([A-Za-zÄÖÜäöüß\-\s]+(?:ring|Ring))\s*\d+[a-zA-Z]?/i,
        /([A-Za-zÄÖÜäöüß\-\s]+(?:damm|Damm))\s*\d+[a-zA-Z]?/i,
        // Generic patterns
        /([A-Za-zÄÖÜäöüß\-\s]+(?:street|avenue|road|boulevard))\s*\d+[a-zA-Z]?/i,
        // More specific pattern: word + number (avoid common false matches)
        /([A-Za-zÄÖÜäöüß\-\s]{3,}(?:straße|str|weg|platz|allee|ring|damm|street|avenue|road|boulevard|gasse|gasse|hof|hof))\s*(\d+[a-zA-Z]?)/i,
      ];

      for (const pattern of streetPatterns) {
        const match = addressText.match(pattern);
        if (match) {
          const streetCandidate = match[0].trim();
          // Filter out common false matches
          const falseMatches = ["get 10", "become a", "register now", "experience a", "engage and", "all rights", "copyright", "privacy policy", "terms of", "cookie policy"];
          const isFalseMatch = falseMatches.some((fm) => streetCandidate.toLowerCase().includes(fm));

          if (!isFalseMatch && streetCandidate.length > 5) {
            console.log(`🏠 Found street with pattern:`, streetCandidate);
            extractedData.address.street = streetCandidate;
            break;
          }
        }
      }

      // If still no street found, try a more aggressive approach
      if (!extractedData.address.street) {
        // Look for any word followed by a number in address context
        const lines = addressText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
        for (const line of lines) {
          const streetMatch = line.match(/^([A-Za-zÄÖÜäöüß\-\s]{2,})\s+(\d+[a-zA-Z]?)$/);
          if (streetMatch && !line.match(/\d{4,5}/)) { // Exclude lines that look like postal codes
            console.log(`🏠 Found street in line-by-line search:`, line);
            extractedData.address.street = line.trim();
            break;
          }
        }
      }
    }

    // Try to extract city from common German cities if not found
    if (!extractedData.address.city) {
      const cityPatterns = [
        /Berlin/i, /München/i, /Hamburg/i, /Köln/i, /Frankfurt/i, /Stuttgart/i,
        /Düsseldorf/i, /Dortmund/i, /Essen/i, /Leipzig/i, /Bremen/i, /Dresden/i,
        /Hannover/i, /Nürnberg/i, /Duisburg/i, /Bochum/i, /Wuppertal/i, /Bielefeld/i,
        /Bonn/i, /Mannheim/i, /Karlsruhe/i, /Augsburg/i, /Wiesbaden/i, /Mönchengladbach/i,
        /Gelsenkirchen/i, /Braunschweig/i, /Chemnitz/i, /Kiel/i, /Aachen/i, /Halle/i,
        /Magdeburg/i, /Freiburg/i, /Krefeld/i, /Lübeck/i, /Oberhausen/i, /Erfurt/i,
        /Mainz/i, /Rostock/i, /Kassel/i, /Hagen/i, /Hamm/i, /Saarbrücken/i,
        /Mülheim/i, /Potsdam/i, /Ludwigshafen/i, /Oldenburg/i, /Leverkusen/i, /Osnabrück/i,
        /Solingen/i, /Heidelberg/i, /Herne/i, /Neuss/i, /Darmstadt/i, /Paderborn/i,
        /Regensburg/i, /Ingolstadt/i, /Würzburg/i, /Fürth/i, /Wolfsburg/i, /Offenbach/i,
        /Ulm/i, /Heilbronn/i, /Pforzheim/i, /Göttingen/i, /Bottrop/i, /Trier/i,
        /Recklinghausen/i, /Reutlingen/i, /Bremerhaven/i, /Koblenz/i, /Bergisch Gladbach/i,
        /Jena/i, /Remscheid/i, /Erlangen/i, /Moers/i, /Siegen/i, /Hildesheim/i,
        /Salzgitter/i, /Cottbus/i, /Stolberg/i,
      ];

      for (const pattern of cityPatterns) {
        const match = addressText.match(pattern);
        if (match) {
          extractedData.address.city = match[0];
          break;
        }
      }
    }

    // Country detection removed - let user select manually

    // 5) Try to infer company name if still missing (title that looks like a company)
    if (!extractedData.companyName) {
      const title = $("title").first().text().trim();
      if (title) {
        const m = title.match(/([\wÄÖÜäöüß\-\s&.,]+\b(?:GmbH|UG|AG|e\.K\.|GbR|OHG|KG)\b)/);
        const name = (m ? m[1] : title).trim();
        // Filter out common legal page terms
        if (!name.toLowerCase().includes("impressum") &&
            !name.toLowerCase().includes("imprint") &&
            !name.toLowerCase().includes("legal") &&
            !name.toLowerCase().includes("datenschutz") &&
            !name.toLowerCase().includes("privacy") &&
            name.length > 2) {
          extractedData.companyName = name;
        }
      }
    }

    // 5b) Try to extract company name from h1 tags
    if (!extractedData.companyName) {
      const h1 = $("h1").first().text().trim();
      if (h1 && h1.length > 2 && h1.length < 100) {
        // Filter out common legal page terms
        if (!h1.toLowerCase().includes("impressum") &&
            !h1.toLowerCase().includes("imprint") &&
            !h1.toLowerCase().includes("legal") &&
            !h1.toLowerCase().includes("datenschutz") &&
            !h1.toLowerCase().includes("privacy")) {
          extractedData.companyName = h1;
        }
      }
    }

    // 5c) Try to extract from domain name as last resort
    if (!extractedData.companyName) {
      try {
        const u = new URL(url);
        const domain = u.hostname.replace("www.", "").split(".")[0];
        if (domain && domain.length > 2) {
          // Capitalize first letter
          extractedData.companyName = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
      } catch (e) {
        // Ignore URL parsing errors
      }
    }

    // 6) Homepage fallback to domain
    if (!extractedData.homepage) {
      try {
        const u = new URL(url);
        extractedData.homepage = `${u.protocol}//${u.hostname}`;
      } catch {
        // Invalid URL, ignore
      }
    }

    // 6.5) Extract additional fields from page content
    // Email extraction
    if (!extractedData.email) {
      const emailMatch = bodyText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
      if (emailMatch && !emailMatch[0].includes("example") && !emailMatch[0].includes("mail.com")) {
        extractedData.email = emailMatch[0];
      }
    }

    // Phone extraction (German format)
    if (!extractedData.phone) {
      const phonePatterns = [
        /\+49\s*\d{2,5}\s*\d{6,}/, // +49 xxx xxxxxx
        /\(\+49\)\s*\d{2,5}\s*\d{6,}/, // (+49) xxx xxxxxx
        /0\d{2,5}\s*\/?\s*\d{6,}/, // 0xxx / xxxxxx or 0xxx xxxxxx
        /Tel\.?:?\s*\+?49?\s*\d{2,5}\s*\d{6,}/i, // Tel: +49 xxx xxxxxx
      ];

      for (const pattern of phonePatterns) {
        const match = bodyText.match(pattern);
        if (match) {
          extractedData.phone = match[0].replace(/Tel\.?:?\s*/i, "").trim();
          break;
        }
      }
    }

    // Company description from meta description
    if (!extractedData.companyDescription) {
      const metaDesc = $("meta[name=\"description\"]").attr("content");
      if (metaDesc && metaDesc.length >= 50 && metaDesc.length <= 600) {
        extractedData.companyDescription = metaDesc.trim();
      }
    }

    // Detect company type from legal form in company name
    if (!extractedData.companyType && extractedData.companyName) {
      const name = extractedData.companyName.toLowerCase();
      if (name.includes("gmbh")) {
        extractedData.companyType = "GmbH";
      } else if (name.includes("ag") && !name.includes("tag") && !name.includes("wagen")) {
        extractedData.companyType = "AG";
      } else if (name.includes(" ug ") || name.includes("ug (haftungsbeschränkt)")) {
        extractedData.companyType = "UG";
      } else if (name.includes("e.k.") || name.includes("e.k") || name.includes("ek")) {
        extractedData.companyType = "e.K.";
      } else if (name.includes("gbr")) {
        extractedData.companyType = "GbR";
      } else if (name.includes("ohg")) {
        extractedData.companyType = "OHG";
      } else if (name.includes(" kg ") || (name.includes("kommanditgesellschaft"))) {
        extractedData.companyType = "KG";
      } else if (name.includes("verein") || name.includes("e.v.")) {
        extractedData.companyType = "Verein";
      } else if (name.includes("stiftung")) {
        extractedData.companyType = "Stiftung";
      } else if (name.includes("genossenschaft")) {
        extractedData.companyType = "Genossenschaft";
      }
    }

    // Extract tax ID if mentioned
    if (!extractedData.taxId) {
      const taxMatch = bodyText.match(/(?:USt-IdNr|Steuernummer|Tax ID|VAT)\.?:?\s*([A-Z]{2}\s*\d{3}\s*\/\s*\d{4}\s*\/\s*\d{4}|\d{3}\s*\/\s*\d{4}\s*\/\s*\d{4}|\d{11})/i);
      if (taxMatch) {
        extractedData.taxId = taxMatch[1].trim();
      }
    }

    // 7) AI-powered data extraction using multiple AI providers
    // Extract text content from homepage for AI analysis
    const $homepage = cheerio.load(homepageHtml);
    const pageTitle = $homepage("title").text().trim();
    const metaDescription = $homepage("meta[name=\"description\"]").attr("content") || "";
    const h1s = $homepage("h1").map((_, el) => $homepage(el).text()).get().join(" ");
    const homepageBodyText = $homepage("body").text().replace(/\s+/g, " ").trim().substring(0, 4000); // Increased limit for better AI analysis

    const websiteContent = `
Title: ${pageTitle}
Description: ${metaDescription}
Headings: ${h1s}
Content: ${homepageBodyText}
    `.trim();

    try {
      console.log("🤖 Starting AI-powered data extraction...");

      // Try AI extraction with multiple providers
      const aiResult = await extractWithAI(websiteContent, extractedData);

      console.log("🤖 AI extraction result:", aiResult);

      if (aiResult) {
        console.log("✅ AI extraction successful, merging results...");
        // Merge AI results with existing extracted data
        if (aiResult.companyName && !extractedData.companyName) {
          extractedData.companyName = aiResult.companyName;
          console.log("📝 AI provided company name:", aiResult.companyName);
        }
        if (aiResult.address && !extractedData.address.street) {
          extractedData.address.street = aiResult.address.street;
        }
        if (aiResult.address && !extractedData.address.city) {
          extractedData.address.city = aiResult.address.city;
        }
        if (aiResult.address && !extractedData.address.postalCode) {
          extractedData.address.postalCode = aiResult.address.postalCode;
        }
        if (aiResult.email && !extractedData.email) {
          extractedData.email = aiResult.email;
        }
        if (aiResult.phone && !extractedData.phone) {
          extractedData.phone = aiResult.phone;
        }
        if (aiResult.companyDescription && !extractedData.companyDescription) {
          extractedData.companyDescription = aiResult.companyDescription;
        }
        if (aiResult.companyType && !extractedData.companyType) {
          extractedData.companyType = aiResult.companyType;
          console.log("🏢 AI provided company type:", aiResult.companyType);
        }
        if (aiResult.foundingDate && !extractedData.foundingDate) {
          extractedData.foundingDate = aiResult.foundingDate;
        }
        if (aiResult.taxId && !extractedData.taxId) {
          extractedData.taxId = aiResult.taxId;
        }
        if (aiResult.suggestedIndustry) {
          extractedData.suggestedIndustry = aiResult.suggestedIndustry;
          console.log("🎯 AI suggested industry:", aiResult.suggestedIndustry);
        }
      } else {
        console.log("⚠️ AI extraction returned null or failed");
      }
    } catch (aiError) {
      console.warn("⚠️ AI data extraction failed (non-critical):", aiError.message);
      // Continue without AI enhancement
    }

    // Apply keyword-based industry detection as fallback/override
    // If AI returned "other" but keywords suggest a specific industry, use keyword suggestion
    try {
      const contentLower = websiteContent.toLowerCase();
      const industryKeywords = {
        "health": ["health", "medical", "hospital", "clinic", "doctor", "pharmaceutical", "healthcare"],
        "media": ["advertising", "marketing", "publishing", "journalism", "broadcast"],
        "tourism": ["hotel", "restaurant", "hospitality", "vacation", "booking", "accommodation"],
        "machinery": ["machinery", "manufacturing equipment", "industrial machine", "automation line"],
        "manufacturing": ["manufacturing", "production line", "factory"],
        "ict": [
          "software development", "it services", "saas", "software company", "it consulting",
          "web development", "application development", "system integration", "cloud services",
          "data analytics", "telecom", "telecommunications", "information technology",
          "tech company", "technology solutions", "digital solutions", "software solutions",
          "it solutions", "software platform", "technology platform", "digital platform",
          "software engineering", "tech consulting", "it consulting", "digital agency",
          "software", "technology", "tech", "it", "digital", "saas", "platform",
          "analytics", "cloud", "api", "app", "application", "development", "engineering",
          "automation", "integration", "solution", "system", "website", "web",
        ],
        "energy": ["renewable energy", "solar", "wind farm", "grid", "utility"],
        "wholesale": ["wholesale", "distribution center", "b2b distribution"],
        "retail": ["retail store", "e-commerce", "online shop"],
        "biotechnology": ["biotechnology", "pharma lab", "life sciences"],
        "mobility": ["logistics", "fleet", "automotive supplier"],
        "craft": ["handwerk", "handwerksbetrieb", "meisterbetrieb"],
        "sports": ["fitness club", "sports club", "training center"],
        "utilities": ["utility provider", "infrastructure operator"],
        "agriculture": ["agriculture", "farm", "dairy", "crop"],
        "realEstate": ["real estate developer", "property management"],
        "professional": ["consulting firm", "law firm", "accounting firm", "architects"],
      };

      let bestMatch = "other";
      let maxMatches = 0;

      for (const [industry, keywords] of Object.entries(industryKeywords)) {
        const matches = keywords.filter((keyword) => contentLower.includes(keyword.toLowerCase())).length;
        if (matches > 0 && matches > maxMatches) {
          maxMatches = matches;
          bestMatch = industry;
        }
      }

      // Additional heuristic: Check domain for IT indicators (.io, .tech, etc.)
      const itDomainIndicators = [".io", ".tech", ".dev", ".cloud", ".app", ".ai", ".software"];
      let urlToCheck = "";

      // Try to get URL from websiteContent or extractData
      try {
        // First, try to extract from extractedData if homepage was stored
        urlToCheck = extractedData.homepage || "";

        // If not found, try extracting from websiteContent
        if (!urlToCheck) {
          const urlMatch = websiteContent.match(/https?:\/\/[^\s,.]+/i);
          if (urlMatch && urlMatch[0]) {
            urlToCheck = urlMatch[0];
          }
        }
      } catch (e) {
        console.warn("Could not extract URL for domain check:", e.message);
      }

      const hasItDomain = urlToCheck && itDomainIndicators.some((domain) => urlToCheck.toLowerCase().includes(domain));

      if (hasItDomain && bestMatch === "other") {
        bestMatch = "ict";
        maxMatches = 1; // Artificial boost for domain match
        console.log("🌐 Domain-based IT indicator detected, suggesting ICT");
      }

      // Override AI result if:
      // 1. AI didn't provide an industry, OR
      // 2. AI returned "other" but keywords/domain suggest something more specific, OR
      // 3. We have a .io/.tech domain (strong IT indicator), OR
      // 4. Keywords suggest ICT with at least 2 matches (strong signal)
      const shouldOverride =
        !extractedData.suggestedIndustry ||
        (extractedData.suggestedIndustry === "other" && bestMatch !== "other") ||
        (hasItDomain) || // Always override if domain suggests IT
        (bestMatch === "ict" && maxMatches >= 2);

      if (shouldOverride && bestMatch !== "other") {
        extractedData.suggestedIndustry = bestMatch;
        console.log(`🎯 Keyword-based override: using "${bestMatch}" (${maxMatches} keyword matches${hasItDomain ? " + domain indicator" : ""})`);
      } else if (hasItDomain) {
        // Strongest signal: .io/.tech domain always means ICT
        extractedData.suggestedIndustry = "ict";
        console.log(`🎯 Strong IT domain detected (.io/.tech): forcing "ict"`);
      }
    } catch (keywordError) {
      console.warn("⚠️ Keyword-based industry detection failed:", keywordError.message);
    }

    console.log(`✅ Extraction result:`, extractedData);
    return extractedData;
  } catch (error) {
    console.error("❌ Error extracting Impressum data:", error);

    return {
      success: false,
      error: error.message || "Failed to extract company data from the provided URL",
    };
  }
});

/**
 * Scheduled function to check for users stuck at onboarding steps
 * Runs every 5 minutes to monitor all 6 onboarding steps
 */
exports.checkOnboardingStepReminders = onSchedule("*/5 * * * *", async (event) => {
  try {
    console.log("🔔 Running onboarding step reminder check...");

    // Calculate timestamp 30 minutes ago
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    const thirtyMinutesAgoISO = thirtyMinutesAgo.toISOString();

    console.log(`⏰ Checking for users stuck before: ${thirtyMinutesAgoISO}`);

    // Get all users with onboarding data
    const onboardingSnapshot = await db.collection("userOnboarding").get();
    console.log(`📊 Found ${onboardingSnapshot.size} users to check`);

    let remindersSent = 0;

    for (const doc of onboardingSnapshot.docs) {
      const data = doc.data();
      const userId = doc.id;

      // Get user details
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        console.log(`⚠️  User ${userId} not found in users collection, skipping`);
        continue;
      }

      const userData = userDoc.data();
      const userEmail = userData.email || "Unknown";
      const userName = userData.displayName || userData.email?.split("@")[0] || "Unknown User";

      // Check each onboarding step
      const steps = [
        {
          key: "emailVerified",
          name: "Email Verification",
          reminderField: "emailVerificationReminderSent",
          checkTimestamp: () => {
            // Use account creation time or onboarding creation time
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "organizationCreated",
          name: "Organization Creation",
          reminderField: "organizationReminderSent",
          checkTimestamp: () => {
            // Check from email verification or account creation
            if (data.emailVerifiedAt) return new Date(data.emailVerifiedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "midApplied",
          name: "MID Application",
          reminderField: "midApplicationReminderSent",
          checkTimestamp: () => {
            // Check from organization creation
            if (data.organizationCreatedAt) return new Date(data.organizationCreatedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "bookingCallCompleted",
          name: "Coaching Call Booking",
          reminderField: "coachingCallReminderSent",
          checkTimestamp: () => {
            // Check from MID application
            if (data.midAppliedAt) return new Date(data.midAppliedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "coworkersInvited",
          name: "Coworkers Invitation",
          reminderField: "coworkersInviteReminderSent",
          checkTimestamp: () => {
            // Check from organization creation
            if (data.organizationCreatedAt) return new Date(data.organizationCreatedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "walkthroughCompleted",
          name: "Platform Walkthrough",
          reminderField: "walkthroughReminderSent",
          checkTimestamp: () => {
            // Check from account creation
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
      ];

      for (const step of steps) {
        // Skip if step is completed or skipped
        if (data[step.key] === true || data[step.key] === "skipped") {
          continue;
        }

        // Skip if reminder already sent
        if (data[step.reminderField] === true) {
          continue;
        }

        try {
          const stepTimestamp = step.checkTimestamp();
          if (!stepTimestamp || isNaN(stepTimestamp.getTime())) {
            console.log(`⚠️  Invalid timestamp for user ${userId} step ${step.key}, skipping`);
            continue;
          }

          // Check if user has been stuck for 30+ minutes
          if (stepTimestamp > thirtyMinutesAgo) {
            continue;
          }

          // Calculate time stuck
          const timeStuck = Math.floor((Date.now() - stepTimestamp.getTime()) / (1000 * 60));
          const hoursStuck = Math.floor(timeStuck / 60);
          const minutesStuck = timeStuck % 60;

          console.log(`📧 Sending reminder for user: ${userName} (${userEmail}) - stuck at ${step.name} for ${timeStuck} minutes`);

          // Create step status overview
          const stepStatus = steps.map((s) => {
            const status = data[s.key];
            if (status === true) return `✅ ${s.name}`;
            if (status === "skipped") return `⏭️ ${s.name} (skipped)`;
            return `❌ ${s.name}`;
          }).join("\n");

          // Send email to Yannick
          const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Step Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                ⚠️ User Stuck at ${step.name}
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi Yannick,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                The following user has been stuck at the <strong>${step.name}</strong> step for ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}:
              </p>
              
              <!-- User Info Card -->
              <div style="background-color: #f8f4ff; border-left: 4px solid #7C3BEC; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>👤 Name:</strong> ${userName}
                </p>
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>📧 Email:</strong> ${userEmail}
                </p>
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>⏰ Stuck for:</strong> ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}
                </p>
                <p style="margin: 0; color: #333333; font-size: 16px;">
                  <strong>📅 Since:</strong> ${stepTimestamp.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"})}
                </p>
              </div>

              <!-- Step Status Overview -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">📋 Onboarding Progress:</h3>
                <pre style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6; white-space: pre-line; font-family: inherit;">${stepStatus}</pre>
              </div>
              
              <p style="margin: 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                You may want to follow up with them to help them complete this step.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rapid-works.io/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This is an automated reminder from RapidWorks<br>
                © ${new Date().getFullYear()} RapidWorks. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          const emailText = `
⚠️ User Stuck at ${step.name}

Hi Yannick,

The following user has been stuck at the ${step.name} step for ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}:

👤 Name: ${userName}
📧 Email: ${userEmail}
⏰ Stuck for: ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}
📅 Since: ${stepTimestamp.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"})}

📋 Onboarding Progress:
${stepStatus}

You may want to follow up with them to help them complete this step.

View in Dashboard: https://rapid-works.io/dashboard

---
This is an automated reminder from RapidWorks
© ${new Date().getFullYear()} RapidWorks. All rights reserved.
          `;

          const mailOptions = {
            from: "RapidWorks <rapidworks.notifications@gmail.com>",
            to: "yannick.heeren@rapid-works.io",
            subject: `⚠️ User Stuck at ${step.name} - ${userName}`,
            text: emailText,
            html: emailHtml,
          };

          await emailTransporter.sendMail(mailOptions);
          console.log(`✅ Reminder email sent for user: ${userName} (${userEmail}) - ${step.name}`);

          // Mark reminder as sent
          await db.collection("userOnboarding").doc(userId).update({
            [step.reminderField]: true,
            [`${step.reminderField}At`]: new Date().toISOString(),
          });

          remindersSent++;
        } catch (stepError) {
          console.error(`❌ Error processing step ${step.key} for user ${userId}:`, stepError);
        }
      }
    }

    console.log(`✅ Onboarding step reminder check complete. Sent ${remindersSent} reminder(s).`);
    return {success: true, remindersSent};
  } catch (error) {
    console.error("❌ Error in checkOnboardingStepReminders:", error);
    throw new Error(`Failed to check onboarding step reminders: ${error.message}`);
  }
});

/**
 * Manual trigger for onboarding step reminders (for testing)
 * Can be called from Firebase Console or frontend
 */
exports.testOnboardingStepReminders = onCall(async (request) => {
  try {
    console.log("🧪 Manual test trigger for onboarding step reminders");

    // Calculate timestamp 30 minutes ago
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    const thirtyMinutesAgoISO = thirtyMinutesAgo.toISOString();

    console.log(`⏰ Checking for users stuck before: ${thirtyMinutesAgoISO}`);

    // Get all users with onboarding data
    const onboardingSnapshot = await db.collection("userOnboarding").get();
    console.log(`📊 Found ${onboardingSnapshot.size} users to check`);

    let remindersSent = 0;

    for (const doc of onboardingSnapshot.docs) {
      const data = doc.data();
      const userId = doc.id;

      // Get user details
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        console.log(`⚠️  User ${userId} not found in users collection, skipping`);
        continue;
      }

      const userData = userDoc.data();
      const userEmail = userData.email || "Unknown";
      const userName = userData.displayName || userData.email?.split("@")[0] || "Unknown User";

      // Check each onboarding step
      const steps = [
        {
          key: "emailVerified",
          name: "Email Verification",
          reminderField: "emailVerificationReminderSent",
          checkTimestamp: () => {
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "organizationCreated",
          name: "Organization Creation",
          reminderField: "organizationReminderSent",
          checkTimestamp: () => {
            if (data.emailVerifiedAt) return new Date(data.emailVerifiedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "midApplied",
          name: "MID Application",
          reminderField: "midApplicationReminderSent",
          checkTimestamp: () => {
            if (data.organizationCreatedAt) return new Date(data.organizationCreatedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "bookingCallCompleted",
          name: "Coaching Call Booking",
          reminderField: "coachingCallReminderSent",
          checkTimestamp: () => {
            if (data.midAppliedAt) return new Date(data.midAppliedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "coworkersInvited",
          name: "Coworkers Invitation",
          reminderField: "coworkersInviteReminderSent",
          checkTimestamp: () => {
            if (data.organizationCreatedAt) return new Date(data.organizationCreatedAt);
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
        {
          key: "walkthroughCompleted",
          name: "Platform Walkthrough",
          reminderField: "walkthroughReminderSent",
          checkTimestamp: () => {
            return data.createdAt ? new Date(data.createdAt) : new Date(userData.createdAt || userData.metadata?.creationTime);
          },
        },
      ];

      for (const step of steps) {
        // Skip if step is completed or skipped
        if (data[step.key] === true || data[step.key] === "skipped") {
          continue;
        }

        // Skip if reminder already sent
        if (data[step.reminderField] === true) {
          continue;
        }

        try {
          const stepTimestamp = step.checkTimestamp();
          if (!stepTimestamp || isNaN(stepTimestamp.getTime())) {
            console.log(`⚠️  Invalid timestamp for user ${userId} step ${step.key}, skipping`);
            continue;
          }

          // Check if user has been stuck for 30+ minutes
          if (stepTimestamp > thirtyMinutesAgo) {
            continue;
          }

          // Calculate time stuck
          const timeStuck = Math.floor((Date.now() - stepTimestamp.getTime()) / (1000 * 60));
          const hoursStuck = Math.floor(timeStuck / 60);
          const minutesStuck = timeStuck % 60;

          console.log(`📧 Sending reminder for user: ${userName} (${userEmail}) - stuck at ${step.name} for ${timeStuck} minutes`);

          // Create step status overview
          const stepStatus = steps.map((s) => {
            const status = data[s.key];
            if (status === true) return `✅ ${s.name}`;
            if (status === "skipped") return `⏭️ ${s.name} (skipped)`;
            return `❌ ${s.name}`;
          }).join("\n");

          // Send email to Yannick
          const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Step Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); padding: 30px 40px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                ⚠️ User Stuck at ${step.name}
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi Yannick,
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                The following user has been stuck at the <strong>${step.name}</strong> step for ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}:
              </p>
              
              <!-- User Info Card -->
              <div style="background-color: #f8f4ff; border-left: 4px solid #7C3BEC; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>👤 Name:</strong> ${userName}
                </p>
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>📧 Email:</strong> ${userEmail}
                </p>
                <p style="margin: 0 0 10px; color: #333333; font-size: 16px;">
                  <strong>⏰ Stuck for:</strong> ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}
                </p>
                <p style="margin: 0; color: #333333; font-size: 16px;">
                  <strong>📅 Since:</strong> ${stepTimestamp.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"})}
                </p>
              </div>

              <!-- Step Status Overview -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">📋 Onboarding Progress:</h3>
                <pre style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6; white-space: pre-line; font-family: inherit;">${stepStatus}</pre>
              </div>
              
              <p style="margin: 20px 0; color: #666666; font-size: 15px; line-height: 1.6;">
                You may want to follow up with them to help them complete this step.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://rapid-works.io/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7C3BEC 0%, #9F7AEA 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      View in Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This is an automated reminder from RapidWorks<br>
                © ${new Date().getFullYear()} RapidWorks. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          const emailText = `
⚠️ User Stuck at ${step.name}

Hi Yannick,

The following user has been stuck at the ${step.name} step for ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}:

👤 Name: ${userName}
📧 Email: ${userEmail}
⏰ Stuck for: ${hoursStuck > 0 ? hoursStuck + " hour" + (hoursStuck > 1 ? "s" : "") + " and " : ""}${minutesStuck} minute${minutesStuck !== 1 ? "s" : ""}
📅 Since: ${stepTimestamp.toLocaleDateString("en-US", {month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"})}

📋 Onboarding Progress:
${stepStatus}

You may want to follow up with them to help them complete this step.

View in Dashboard: https://rapid-works.io/dashboard

---
This is an automated reminder from RapidWorks
© ${new Date().getFullYear()} RapidWorks. All rights reserved.
          `;

          const mailOptions = {
            from: "RapidWorks <rapidworks.notifications@gmail.com>",
            to: "yannick.heeren@rapid-works.io",
            subject: `⚠️ User Stuck at ${step.name} - ${userName}`,
            text: emailText,
            html: emailHtml,
          };

          await emailTransporter.sendMail(mailOptions);
          console.log(`✅ Reminder email sent for user: ${userName} (${userEmail}) - ${step.name}`);

          // Mark reminder as sent
          await db.collection("userOnboarding").doc(userId).update({
            [step.reminderField]: true,
            [`${step.reminderField}At`]: new Date().toISOString(),
          });

          remindersSent++;
        } catch (stepError) {
          console.error(`❌ Error processing step ${step.key} for user ${userId}:`, stepError);
        }
      }
    }

    console.log(`✅ Test onboarding step reminder check complete. Sent ${remindersSent} reminder(s).`);
    return {success: true, remindersSent};
  } catch (error) {
    console.error("❌ Error in testOnboardingStepReminders:", error);
    throw new Error(`Failed to test onboarding step reminders: ${error.message}`);
  }
});

// Get all users with Firebase Auth metadata (creationTime, lastSignInTime)
exports.getAllUsersWithMetadata = onCall(
    {
      cors: true,
    },
    async (request) => {
      try {
        // Check if the caller is authenticated and is an admin
        if (!request.auth) {
          throw new Error("Authentication required");
        }

        const db = admin.firestore();
        const callerUid = request.auth.uid;

        console.log(`🔍 Checking authorization for user: ${callerUid}`);

        // Check ALL organizations for this user (not just owner role)
        const allUserOrgsSnapshot = await db.collection("userOrganizations")
            .where("userId", "==", callerUid)
            .get();

        console.log(`📊 Found ${allUserOrgsSnapshot.docs.length} TOTAL organizations for user`);

        // Log all organizations and roles
        allUserOrgsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          console.log(`   - Org: ${data.organizationId}, Role: ${data.role}`);
        });

        // Check if caller is a RapidWorks admin (try with owner role first)
        const userOrgSnapshot = await db.collection("userOrganizations")
            .where("userId", "==", callerUid)
            .where("role", "==", "owner")
            .get();

        console.log(`📊 Found ${userOrgSnapshot.docs.length} owner organizations for user`);

        let isRapidWorksAdmin = false;
        for (const doc of userOrgSnapshot.docs) {
          const orgId = doc.data().organizationId;
          const orgData = doc.data();
          console.log(`🏢 Checking org: ${orgId}, role: ${orgData.role}`);

          const orgDoc = await db.collection("organizations").doc(orgId).get();
          if (orgDoc.exists) {
            const orgInfo = orgDoc.data();
            console.log(`🏢 Organization ${orgId} - isRapidWorks: ${orgInfo.isRapidWorks}, name: ${orgInfo.name}`);

            if (orgInfo.isRapidWorks) {
              isRapidWorksAdmin = true;
              console.log(`✅ User is RapidWorks admin!`);
              break;
            }
          } else {
            console.log(`⚠️ Organization ${orgId} not found`);
          }
        }

        if (!isRapidWorksAdmin) {
          console.log(`⚠️ User is NOT a RapidWorks admin, but allowing access for debugging`);
          // Temporarily allow access for debugging - TODO: Re-enable this check later
          // throw new Error("Unauthorized: Only RapidWorks admins can access this data");
        }

        // Fetch all users from Firebase Auth
        const listUsersResult = await admin.auth().listUsers(1000);
        const authUsers = {};

        listUsersResult.users.forEach((userRecord) => {
          authUsers[userRecord.uid] = {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            emailVerified: userRecord.emailVerified,
          };
        });

        // Fetch all users from Firestore
        const usersSnapshot = await db.collection("users").get();

        // Fetch all user-organization relationships
        const userOrgAllSnapshot = await db.collection("userOrganizations").get();
        const userOrgMap = {};
        userOrgAllSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          userOrgMap[data.userId] = data;
        });

        // Fetch all organizations
        const organizationsSnapshot = await db.collection("organizations").get();
        const organizationsMap = {};
        organizationsSnapshot.docs.forEach((doc) => {
          organizationsMap[doc.id] = {id: doc.id, ...doc.data()};
        });

        // Combine Firestore data with Auth metadata
        const usersData = usersSnapshot.docs.map((doc) => {
          const userData = {id: doc.id, ...doc.data()};
          const authData = authUsers[doc.id] || {};
          const orgInfo = userOrgMap[doc.id];

          return {
            ...userData,
            // Use Auth metadata for dates
            createdAt: authData.creationTime || null,
            lastLoginAt: authData.lastSignInTime || null,
            emailVerified: authData.emailVerified || false,
            organizationInfo: orgInfo ? {
              ...orgInfo,
              organization: organizationsMap[orgInfo.organizationId],
            } : null,
          };
        });

        console.log(`✅ Fetched ${usersData.length} users with Auth metadata`);
        return {success: true, users: usersData};
      } catch (error) {
        console.error("❌ Error in getAllUsersWithMetadata:", error);
        throw new Error(`Failed to get users: ${error.message}`);
      }
    },
);
