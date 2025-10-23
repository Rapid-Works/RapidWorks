// Microsoft Teams webhook service for sending notifications
import { generateTaskDeepLink, generateDashboardLink, generateOrganizationDeepLink } from './linkService';

const TEAMS_WEBHOOK_URL = 'https://default1ad4f835a3b1431ea8f2106eb76311.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/9c86d50f0f6b4d36ba75f5fd6cfb7658/triggers/manual/paths/invoke/?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fCgx5EebG_fpAKlypzaMhCH6vgwCEAK8kVTSUBvVeTk';

// Organization creation webhook URL
const ORGANIZATION_WEBHOOK_URL = 'https://default1ad4f835a3b1431ea8f2106eb76311.68.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/b3a5f51f2cde4e75827cb5d90dd52c01/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=UY7EuIumV2hSi-yzDYIDxJ97sSa6mT-R_kZuDIKHowQ';

/**
 * Expert email mapping for mentions
 */
const EXPERT_EMAILS = {
  'Samuel Donkor': 'samuel.donkor@rapid-works.io',
  'Prince Ardiabah': 'prince.ardiabah@rapid-works.io'
};

/**
 * Organization notification email mapping
 */
const ORGANIZATION_NOTIFICATION_EMAILS = {
  'Prince Ardiabah': 'prince.ardiabah@rapid-works.io'
};

/**
 * Get mention data for the assigned expert
 * @param {string} expertName - The expert's name
 * @returns {Object} - Mention configuration
 */
const getExpertMention = (expertName) => {
  if (!expertName || !EXPERT_EMAILS[expertName]) {
    return null;
  }
  
  return {
    text: `<at>${expertName}</at>`,
    entity: {
      type: "mention",
      text: `<at>${expertName}</at>`,
      mentioned: {
        id: EXPERT_EMAILS[expertName],
        name: expertName
      }
    }
  };
};

/**
 * Get mention data for organization notifications
 * @param {string} personName - The person's name to mention
 * @returns {Object} - Mention configuration
 */
const getOrganizationMention = (personName) => {
  if (!personName || !ORGANIZATION_NOTIFICATION_EMAILS[personName]) {
    return null;
  }
  
  return {
    text: `<at>${personName}</at>`,
    entity: {
      type: "mention",
      text: `<at>${personName}</at>`,
      mentioned: {
        id: ORGANIZATION_NOTIFICATION_EMAILS[personName],
        name: personName
      }
    }
  };
};

/**
 * Format date in human readable format (e.g., "12th August 2025")
 * @param {string|Date} date - The date to format
 * @returns {string} - Human readable date
 */
const formatHumanDate = (date) => {
  if (!date) return 'Not specified';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('en-GB', { month: 'long' });
  const year = dateObj.getFullYear();
  
  // Add ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd'; 
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

/**
 * Format date and time in human readable format (e.g., "12th August 2025 at 2:30 PM")
 * @param {string|Date} date - The date to format
 * @returns {string} - Human readable date and time
 */
const formatHumanDateTime = (date) => {
  if (!date) return 'Not specified';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('en-GB', { month: 'long' });
  const year = dateObj.getFullYear();
  const time = dateObj.toLocaleTimeString('en-GB', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  // Add ordinal suffix (st, nd, rd, th)
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd'; 
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${day}${getOrdinalSuffix(day)} ${month} ${year} at ${time}`;
};

/**
 * Send a new task notification to Teams with enhanced features
 * @param {Object} taskData - The task data to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendNewTaskNotification = async (taskData) => {
  try {
    const expertMention = getExpertMention(taskData.expertName);
    
    const adaptiveCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": `New Task: ${taskData.taskName}`,
          "weight": "Bolder",
          "size": "Large",
          "color": "Accent"
        },
        {
          "type": "TextBlock",
          "text": `New task request from **${taskData.customerName}**`,
          "size": "Medium",
          "wrap": true
        },
        {
          "type": "Container",
          "style": "emphasis",
          "items": [
            {
              "type": "TextBlock",
              "text": `**Action Required:** Click the button below to view this specific task in your dashboard.`,
              "wrap": true,
              "weight": "Bolder",
              "color": "Accent"
            }
          ]
        },
        {
          "type": "Container",
          "style": "emphasis",
          "items": [
            {
              "type": "TextBlock",
              "text": "**Direct Link (Copyable):**",
              "weight": "Bolder",
              "size": "Small"
            },
            {
              "type": "TextBlock",
              "text": generateTaskDeepLink(taskData.taskId),
              "wrap": true,
              "fontType": "Monospace",
              "size": "Small",
              "color": "Dark"
            }
          ]
        },
        ...(expertMention ? [{
          "type": "TextBlock",
          "text": `**Assigned Expert:** ${expertMention.text}`,
          "wrap": true,
          "weight": "Bolder",
          "spacing": "Medium"
        }] : []),
        {
          "type": "FactSet",
          "facts": [
            {
              "title": "Task Name",
              "value": taskData.taskName || 'Not specified'
            },
            {
              "title": "Customer",
              "value": taskData.customerName
            },
            {
              "title": "Email",
              "value": taskData.customerEmail ? `[${taskData.customerEmail}](mailto:${taskData.customerEmail})` : 'Not provided'
            },
            {
              "title": "Expert Type",
              "value": taskData.expertType || 'General'
            },
            {
              "title": "Expert Name",
              "value": taskData.expertName || 'Not specified'
            },
            {
              "title": "Description",
              "value": taskData.description ? 
                (taskData.description.length > 200 ? 
                  taskData.description.substring(0, 200) + '...' : 
                  taskData.description) : 'No description provided'
            },
            {
              "title": "Due Date",
              "value": formatHumanDate(taskData.dueDate)
            },
            {
              "title": "Files",
              "value": taskData.files && taskData.files.length > 0 ? `${taskData.files.length} file(s) attached` : 'No files attached'
            },
            {
              "title": "Task ID",
              "value": taskData.taskId || 'Generated on creation'
            },
            {
              "title": "Direct Link",
              "value": `[${generateTaskDeepLink(taskData.taskId)}](${generateTaskDeepLink(taskData.taskId)})`
            },
            {
              "title": "Created",
              "value": formatHumanDateTime(new Date())
            }
          ]
        }
      ],
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "View Task",
          "url": generateTaskDeepLink(taskData.taskId),
          "style": "positive"
        },
        {
          "type": "Action.OpenUrl",
          "title": "Open Dashboard",
          "url": "https://rapid-works.io/dashboard",
          "style": "default"
        },
        {
          "type": "Action.OpenUrl",
          "title": "Reply to Customer",
          "url": `mailto:${taskData.customerEmail}?subject=Re: ${encodeURIComponent(taskData.taskName || 'Task Request')}`,
          "style": "default"
        }
      ]
    };

    // Add mentions only if expert is recognized
    if (expertMention) {
      adaptiveCard.msteams = {
        entities: [expertMention.entity]
      };
    }

    // Use the working Power Automate format with enhanced card
    const message = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: adaptiveCard
    };

    console.log('📤 Sending enhanced Teams notification:', JSON.stringify(message, null, 2));

    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const responseText = await response.text();
    console.log('📥 Enhanced notification response:', response.status, responseText);

    if (response.ok) {
      console.log('✅ Enhanced Teams notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send enhanced Teams notification:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending enhanced Teams notification:', error);
    return false;
  }
};

/**
 * Send a task status update notification to Teams with expert mentions
 * @param {Object} updateData - The update data
 * @returns {Promise<boolean>} - Success status
 */
export const sendTaskStatusUpdateNotification = async (updateData) => {
  try {
    const expertMention = getExpertMention(updateData.expertName);
    const statusColor = updateData.newStatus === 'completed' ? 'Good' : 
                       updateData.newStatus === 'accepted' ? 'Warning' : 
                       updateData.newStatus === 'declined' ? 'Attention' : 'Default';

    const adaptiveCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": "Task Status Update",
          "weight": "Bolder",
          "size": "Large",
          "color": statusColor
        },
        {
          "type": "TextBlock",
          "text": `Task "${updateData.taskName}" status changed to **${updateData.newStatus.toUpperCase()}**`,
          "size": "Medium",
          "wrap": true
        },
        {
          "type": "Container",
          "style": "emphasis",
          "items": [
            {
              "type": "TextBlock",
              "text": "**Check Dashboard:** Visit your [rapid-works.io dashboard](https://rapid-works.io/dashboard) for full details.",
              "wrap": true,
              "weight": "Bolder"
            }
          ]
        },
        ...(expertMention ? [{
          "type": "TextBlock",
          "text": `**Expert:** ${expertMention.text}`,
          "wrap": true,
          "weight": "Bolder",
          "spacing": "Medium"
        }] : []),
        {
          "type": "FactSet",
          "facts": [
            {
              "title": "Task",
              "value": updateData.taskName
            },
            {
              "title": "Status",
              "value": updateData.newStatus.replace('_', ' ').toUpperCase()
            },
            {
              "title": "Customer",
              "value": updateData.customerName
            },
            {
              "title": "Expert",
              "value": updateData.expertName || 'Not assigned'
            },
            {
              "title": "Notes",
              "value": updateData.notes || 'No additional notes'
            },
            {
              "title": "Task ID",
              "value": updateData.taskId || 'N/A'
            },
            {
              "title": "Direct Link",
              "value": updateData.taskId ? generateTaskDeepLink(updateData.taskId) : 'N/A'
            },
            {
              "title": "Updated",
              "value": formatHumanDateTime(new Date())
            }
          ]
        }
      ],
      "actions": [
        ...(updateData.taskId ? [{
          "type": "Action.OpenUrl",
          "title": "View Task",
          "url": generateTaskDeepLink(updateData.taskId),
          "style": "positive"
        }] : []),
        {
          "type": "Action.OpenUrl",
          "title": "Open Dashboard",
          "url": "https://rapid-works.io/dashboard",
          "style": updateData.taskId ? "default" : "positive"
        }
      ]
    };

    // Add mentions only if expert is recognized
    if (expertMention) {
      adaptiveCard.msteams = {
        entities: [expertMention.entity]
      };
    }

    const message = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: adaptiveCard
    };

    console.log('📤 Sending status update notification:', JSON.stringify(message, null, 2));

    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const responseText = await response.text();
    console.log('📥 Status update response:', response.status, responseText);

    if (response.ok) {
      console.log('✅ Teams status update notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send Teams status update notification:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending Teams status update notification:', error);
    return false;
  }
};

/**
 * Send a generic notification to Teams with optional expert mention
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {Object} data - Additional data to include
 * @param {string} expertName - Optional expert name to mention
 * @returns {Promise<boolean>} - Success status
 */
export const sendGenericTeamsNotification = async (title, message, data = {}, expertName = null) => {
  try {
    const expertMention = getExpertMention(expertName);
    
    const adaptiveCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": title,
          "weight": "Bolder",
          "size": "Large",
          "color": "Accent"
        },
        {
          "type": "TextBlock",
          "text": message,
          "wrap": true
        },
        {
          "type": "TextBlock",
          "text": "**Dashboard:** Check your [rapid-works.io dashboard](https://rapid-works.io/dashboard) for more details.",
          "wrap": true,
          "weight": "Bolder",
          "spacing": "Medium"
        },
        ...(expertMention ? [{
          "type": "TextBlock",
          "text": `**Expert:** ${expertMention.text}`,
          "wrap": true,
          "weight": "Bolder"
        }] : []),
        ...(Object.keys(data).length > 0 ? [
          {
            "type": "FactSet",
            "facts": Object.entries(data).map(([key, value]) => ({
              "title": key,
              "value": String(value)
            }))
          }
        ] : [])
      ],
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "Open Dashboard",
          "url": "https://rapid-works.io/dashboard",
          "style": "positive"
        }
      ]
    };

    // Add mentions only if expert is specified and recognized
    if (expertMention) {
      adaptiveCard.msteams = {
        entities: [expertMention.entity]
      };
    }

    const message_payload = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: adaptiveCard
    };

    console.log('📤 Sending generic Teams notification:', JSON.stringify(message_payload, null, 2));

    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message_payload)
    });

    const responseText = await response.text();
    console.log('📥 Generic notification response:', response.status, responseText);

    if (response.ok) {
      console.log('✅ Generic Teams notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send generic Teams notification:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending generic Teams notification:', error);
    return false;
  }
};

/**
 * Test the Teams webhook connection with a simple message
 * @returns {Promise<boolean>} - Connection status
 */
export const testTeamsWebhook = async () => {
  try {
    const testExpert = 'Samuel Donkor'; // Test with Samuel
    const expertMention = getExpertMention(testExpert);
    
    const simpleCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": `Test message at ${formatHumanDateTime(new Date())}`,
          "weight": "Bolder",
          "size": "Medium"
        },
        {
          "type": "TextBlock",
          "text": "This is a test message to verify the webhook connection is working properly.",
          "wrap": true
        },
        ...(expertMention ? [{
          "type": "TextBlock",
          "text": `**Testing mention:** ${expertMention.text}`,
          "wrap": true,
          "weight": "Bolder"
        }] : [])
      ],
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "Open Dashboard",
          "url": "https://rapid-works.io/dashboard",
          "style": "positive"
        }
      ]
    };

    // Add mentions for testing
    if (expertMention) {
      simpleCard.msteams = {
        entities: [expertMention.entity]
      };
    }

    const message = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: simpleCard
    };

    console.log('🔍 Testing webhook with enhanced adaptive card:', JSON.stringify(message, null, 2));

    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    console.log('🔍 Test response status:', response.status);
    
    const responseText = await response.text();
    console.log('🔍 Test response body:', responseText);

    return response.ok;
  } catch (error) {
    console.error('❌ Teams webhook test failed:', error);
    return false;
  }
};

/**
 * Send a simple text notification to Teams (fallback format)
 * @param {Object} taskData - The task data to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendSimpleTaskNotification = async (taskData) => {
  try {
    const expertMention = getExpertMention(taskData.expertName);
    
    const simpleCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": "New Task Request Created",
          "weight": "Bolder",
          "size": "Large",
          "color": "Accent"
        },
        {
          "type": "TextBlock",
          "text": [
            `**Task:** ${taskData.taskName}`,
            `**Customer:** ${taskData.customerName}`,
            `**Email:** ${taskData.customerEmail}`,
            `**Expert:** ${taskData.expertType}${taskData.expertName ? ` (${taskData.expertName})` : ''}`,
            `**Description:** ${taskData.description ? taskData.description.substring(0, 100) + (taskData.description.length > 100 ? '...' : '') : 'No description'}`,
            `**Due:** ${taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString('en-GB') : 'Not specified'}`,
            `**Files:** ${taskData.files && taskData.files.length > 0 ? `${taskData.files.length} file(s)` : 'None'}`,
            `**Created:** ${new Date().toLocaleString('en-GB')}`,
            '',
            `**Direct Link (copy this):** ${generateTaskDeepLink(taskData.taskId)}`,
            '',
            `**[Click here to view this task directly](${generateTaskDeepLink(taskData.taskId)})**`,
            ...(expertMention ? ['', `**Assigned Expert:** ${expertMention.text}`] : [])
          ].join('\n\n'),
          "wrap": true
        }
      ]
    };

    // Add mentions only if expert is recognized
    if (expertMention) {
      simpleCard.msteams = {
        entities: [expertMention.entity]
      };
    }

    const message = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: simpleCard
    };

    console.log('📤 Sending simple task notification:', JSON.stringify(message, null, 2));

    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const responseText = await response.text();
    console.log('📥 Simple notification response:', response.status, responseText);

    if (response.ok) {
      console.log('✅ Simple Teams notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send simple Teams notification:', response.status, response.statusText);
      console.error('❌ Response body:', responseText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending simple Teams notification:', error);
    return false;
  }
};

/**
 * Send notification in Power Automate expected format (ENHANCED)
 * @param {Object} taskData - The task data to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendPowerAutomateTaskNotification = async (taskData) => {
  try {
    const expertMention = getExpertMention(taskData.expertName);
    
    const adaptiveCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": `New Task: ${taskData.taskName}`,
          "weight": "Bolder",
          "size": "Large",
          "color": "Accent"
        },
        {
          "type": "TextBlock",
          "text": `New task request from **${taskData.customerName}**`,
          "size": "Medium",
          "wrap": true
        },
        {
          "type": "Container",
          "style": "emphasis",
          "items": [
            {
              "type": "TextBlock",
              "text": `**Action Required:** [Click here to view this task directly](${generateTaskDeepLink(taskData.taskId)})`,
              "wrap": true,
              "weight": "Bolder",
              "color": "Accent"
            }
          ]
        },
        {
          "type": "Container",
          "style": "default",
          "items": [
            {
              "type": "TextBlock",
              "text": "**Direct Link (Copyable):**",
              "weight": "Bolder",
              "size": "Small"
            },
            {
              "type": "TextBlock",
              "text": `[${generateTaskDeepLink(taskData.taskId)}](${generateTaskDeepLink(taskData.taskId)})`,
              "wrap": true,
              "fontType": "Monospace",
              "size": "Small",
              "color": "Dark"
            }
          ]
        },
        ...(expertMention ? [{
          "type": "TextBlock",
          "text": `**Expert:** ${expertMention.text}`,
          "wrap": true,
          "weight": "Bolder"
        }] : []),
        {
          "type": "FactSet",
          "facts": [
            { "title": "Task Name", "value": taskData.taskName },
            { "title": "Customer", "value": taskData.customerName },
            { "title": "Email", "value": taskData.customerEmail ? `[${taskData.customerEmail}](mailto:${taskData.customerEmail})` : 'Not provided' },
            { "title": "Expert Type", "value": taskData.expertType },
            { "title": "Expert Name", "value": taskData.expertName || 'Not specified' },
            { "title": "Description", "value": taskData.description || 'No description' },
            { "title": "Due Date", "value": taskData.dueDate || 'Not specified' },
            { "title": "Files", "value": `${taskData.files?.length || 0} file(s)` },
            { "title": "Task ID", "value": taskData.taskId },
            { "title": "Direct Link", "value": `[${generateTaskDeepLink(taskData.taskId)}](${generateTaskDeepLink(taskData.taskId)})` },
            { "title": "Created", "value": new Date().toISOString() }
          ]
        }
      ],
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "View Task",
          "url": generateTaskDeepLink(taskData.taskId),
          "style": "positive"
        },
        {
          "type": "Action.OpenUrl",
          "title": "Open Dashboard", 
          "url": "https://rapid-works.io/dashboard",
          "style": "default"
        },
        {
          "type": "Action.OpenUrl",
          "title": "Reply to Customer",
          "url": `mailto:${taskData.customerEmail}?subject=Re: ${encodeURIComponent(taskData.taskName || 'Task Request')}`,
          "style": "default"
        }
      ]
    };

    // Add mentions only if expert is recognized
    if (expertMention) {
      adaptiveCard.msteams = {
        entities: [expertMention.entity]
      };
    }

    // This matches the Power Automate HTTP trigger schema exactly
    const message = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: adaptiveCard
    };

    console.log('📤 Sending Power Automate format (ENHANCED):', JSON.stringify(message, null, 2));
    
    const response = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    const responseText = await response.text();
    console.log('📥 Power Automate response:', response.status, responseText);

    return response.ok;
  } catch (error) {
    console.error('❌ Power Automate format failed:', error);
    return false;
  }
};

/**
 * Send organization creation notification to Teams
 * @param {Object} organizationData - The organization data
 * @returns {Promise<boolean>} - Success status
 */
export const sendOrganizationCreatedNotification = async (organizationData) => {
  try {
    const princeMention = getOrganizationMention('Prince Ardiabah');
    
    const adaptiveCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": `New Organization Created: ${organizationData.organizationName}`,
          "weight": "Bolder",
          "size": "Large",
          "color": "Good"
        },
        {
          "type": "TextBlock",
          "text": `A new organization has been created by **${organizationData.creatorName}**`,
          "size": "Medium",
          "wrap": true
        },
        {
          "type": "Container",
          "style": "emphasis",
          "items": [
            {
              "type": "TextBlock",
              "text": `**Action Required:** ${princeMention?.text || 'Prince Ardiabah'} - New organization setup completed. Please review and follow up as needed.`,
              "wrap": true,
              "weight": "Bolder",
              "color": "Accent"
            }
          ]
        },
        {
          "type": "Container",
          "style": "default",
          "items": [
            {
              "type": "TextBlock",
              "text": "**Direct Organization Link:**",
              "weight": "Bolder",
              "size": "Small"
            },
            {
              "type": "TextBlock",
              "text": `[${generateOrganizationDeepLink(organizationData.organizationId)}](${generateOrganizationDeepLink(organizationData.organizationId)})`,
              "wrap": true,
              "fontType": "Monospace",
              "size": "Small",
              "color": "Dark"
            }
          ]
        },
        {
          "type": "FactSet",
          "facts": [
            {
              "title": "Organization Name",
              "value": organizationData.organizationName || 'Not specified'
            },
            {
              "title": "Creator",
              "value": organizationData.creatorName || 'Unknown'
            },
            {
              "title": "Creator Email",
              "value": organizationData.creatorEmail ? `[${organizationData.creatorEmail}](mailto:${organizationData.creatorEmail})` : 'Not provided'
            },
            {
              "title": "Address",
              "value": organizationData.address ? 
                `${organizationData.address.street}, ${organizationData.address.city}, ${organizationData.address.postalCode}` : 
                'Not provided'
            },
            {
              "title": "Phone Number",
              "value": organizationData.phoneNumber ? `[${organizationData.phoneNumber}](tel:${organizationData.phoneNumber})` : 'Not provided'
            },
            {
              "title": "Organization ID",
              "value": organizationData.organizationId || 'Generated on creation'
            },
            {
              "title": "Created",
              "value": formatHumanDateTime(new Date())
            }
          ]
        }
      ],
      "actions": [
        {
          "type": "Action.OpenUrl",
          "title": "View Organization",
          "url": generateOrganizationDeepLink(organizationData.organizationId),
          "style": "positive"
        },
        {
          "type": "Action.OpenUrl",
          "title": "Open Dashboard",
          "url": generateDashboardLink(),
          "style": "default"
        },
        {
          "type": "Action.OpenUrl",
          "title": "Contact Creator",
          "url": `mailto:${organizationData.creatorEmail}?subject=Welcome to Rapid Works - ${encodeURIComponent(organizationData.organizationName || 'Your Organization')}`,
          "style": "default"
        }
      ]
    };

    // Add mentions only if Prince is recognized
    if (princeMention) {
      adaptiveCard.msteams = {
        entities: [princeMention.entity]
      };
    }

    // Format for Power Automate with createArray(triggerOutputs()?['body']) structure
    // This should match exactly what the working task webhook sends
    const message = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: adaptiveCard
    };

    console.log('📤 Sending organization creation notification:', JSON.stringify(message, null, 2));

    const response = await fetch(ORGANIZATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const responseText = await response.text();
    console.log('📥 Organization creation notification response:', response.status, responseText);

    if (response.ok) {
      console.log('✅ Organization creation Teams notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send organization creation Teams notification:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending organization creation Teams notification:', error);
    return false;
  }
};

/**
 * Test the organization webhook with a simple message
 * @returns {Promise<boolean>} - Success status
 */
export const testOrganizationWebhookSimple = async () => {
  try {
    console.log('🧪 Testing organization webhook with simple adaptive card...');
    
    // Use the same adaptive card format as the task webhook
    const simpleCard = {
      "type": "AdaptiveCard",
      "version": "1.2",
      "body": [
        {
          "type": "TextBlock",
          "text": "🧪 Organization Webhook Test",
          "weight": "Bolder",
          "size": "Large",
          "color": "Accent"
        },
        {
          "type": "TextBlock",
          "text": `Test message sent at: ${new Date().toLocaleString()}`,
          "wrap": true
        }
      ]
    };

    // Send it exactly like the working task webhook
    const message = {
      contentType: "application/vnd.microsoft.card.adaptive",
      content: simpleCard
    };
    
    console.log('📤 Sending simple test with wrapper:', JSON.stringify(message, null, 2));
    
    const response = await fetch(ORGANIZATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const responseText = await response.text();
    console.log('📥 Simple test response:', response.status, responseText);

    if (response.ok) {
      console.log('✅ Organization webhook simple test PASSED');
      return true;
    } else {
      console.log('❌ Organization webhook simple test FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Organization webhook simple test ERROR:', error);
    return false;
  }
};

/**
 * Test the organization creation webhook with sample data
 * @returns {Promise<boolean>} - Success status
 */
export const testOrganizationCreatedWebhook = async () => {
  try {
    console.log('🧪 Testing organization creation webhook...');
    
    const testOrganizationData = {
      organizationName: 'Test Organization',
      organizationId: 'test-org-123',
      creatorName: 'Test User',
      creatorEmail: 'test@example.com',
      address: {
        street: '123 Test Street',
        city: 'Berlin',
        postalCode: '10115'
      },
      phoneNumber: '+49 30 12345678'
    };
    
    const success = await sendOrganizationCreatedNotification(testOrganizationData);
    
    if (success) {
      console.log('✅ Organization creation webhook test PASSED');
    } else {
      console.log('❌ Organization creation webhook test FAILED');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Organization creation webhook test ERROR:', error);
    return false;
  }
};

/**
 * Debug function to test different message formats
 * @returns {Promise<void>}
 */
export const debugTeamsWebhook = async () => {
  console.log('🔍 Testing different Teams webhook formats...');
  
  const testFormats = [
    {
      name: 'Enhanced Adaptive Card Format',
      data: {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          "type": "AdaptiveCard",
          "version": "1.2",
          "body": [{
            "type": "TextBlock",
            "text": "Test message from Rapid Works - Enhanced Format",
            "weight": "Bolder"
          }, {
            "type": "TextBlock",
            "text": "**Testing:** <at>Samuel Donkor</at>",
            "wrap": true
          }],
          "msteams": {
            "entities": [
              {
                "type": "mention",
                "text": "<at>Samuel Donkor</at>",
                "mentioned": {
                  "id": "samuel.donkor@rapid-works.io",
                  "name": "Samuel Donkor"
                }
              }
            ]
          }
        }
      }
    },
    {
      name: 'Power Automate Common Format',
      data: {
        title: 'Test Notification',
        message: 'This is a test message from Rapid Works',
        body: 'Testing webhook integration'
      }
    },
    {
      name: 'Simple Text Format',
      data: {
        text: 'Test message from Rapid Works - Simple Text'
      }
    }
  ];
  
  for (const format of testFormats) {
    console.log(`🧪 Testing ${format.name}...`);
    try {
      const response = await fetch(TEAMS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(format.data)
      });
      
      const responseText = await response.text();
      console.log(`📥 ${format.name}: ${response.status} - ${responseText}`);
      
      // Wait 2 seconds between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ ${format.name} failed:`, error);
    }
  }
};

// Export global test functions for debugging in browser console
if (typeof window !== 'undefined') {
  window.testTeamsWebhook = testTeamsWebhook;
  window.sendSimpleTaskNotification = sendSimpleTaskNotification;
  window.debugTeamsWebhook = debugTeamsWebhook;
  window.sendPowerAutomateTaskNotification = sendPowerAutomateTaskNotification;
  window.sendNewTaskNotification = sendNewTaskNotification;
  window.sendTaskStatusUpdateNotification = sendTaskStatusUpdateNotification;
  window.sendGenericTeamsNotification = sendGenericTeamsNotification;
  window.sendOrganizationCreatedNotification = sendOrganizationCreatedNotification;
  window.testOrganizationCreatedWebhook = testOrganizationCreatedWebhook;
  window.testOrganizationWebhookSimple = testOrganizationWebhookSimple;
}