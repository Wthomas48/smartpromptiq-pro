// SmartPromptIQ Chrome Extension - Background Service Worker
// Enhanced version with better API handling, caching, and notifications

// Configuration
const CONFIG = {
  API_URLS: {
    production: 'https://smartpromptiq.com',
    development: 'http://localhost:5001'
  },
  WEBSITE_URLS: {
    production: 'https://smartpromptiq.com',
    development: 'http://localhost:5173'
  },
  STORAGE_KEYS: {
    TOKEN: 'smartpromptiq_token',
    USER: 'smartpromptiq_user',
    ENV: 'smartpromptiq_env',
    SETTINGS: 'smartpromptiq_settings',
    PROMPTS_CACHE: 'smartpromptiq_prompts_cache',
    RECENT_PROMPTS: 'smartpromptiq_recent_prompts'
  }
};

// Current environment
let currentEnv = 'production';

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('SmartPromptIQ Extension installed:', details.reason);

  // Load environment setting
  await loadEnvironment();

  // Create context menu items
  setupContextMenus();

  // Set default badge
  chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });

  // Initialize settings if not exist
  await initializeSettings();

  // Check auth status and update badge
  await updateBadge();
});

// Load environment setting
async function loadEnvironment() {
  try {
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.ENV]);
    currentEnv = result[CONFIG.STORAGE_KEYS.ENV] || 'production';
  } catch (e) {
    currentEnv = 'production';
  }
}

// Get API URL
function getApiUrl() {
  return CONFIG.API_URLS[currentEnv] || CONFIG.API_URLS.production;
}

// Get Website URL
function getWebsiteUrl() {
  return CONFIG.WEBSITE_URLS[currentEnv] || CONFIG.WEBSITE_URLS.production;
}

// Initialize default settings
async function initializeSettings() {
  const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.SETTINGS]);
  if (!result[CONFIG.STORAGE_KEYS.SETTINGS]) {
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.SETTINGS]: {
        autoInsert: true,
        showNotifications: true,
        darkMode: true,
        defaultCategory: 'marketing',
        showFloatingButton: true,
        keyboardShortcuts: true
      }
    });
  }
}

// Setup context menus
function setupContextMenus() {
  try {
    // Remove existing menus first
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'smartpromptiq-generate',
        title: 'Generate Prompt with SmartPromptIQ',
        contexts: ['selection', 'page']
      });

      chrome.contextMenus.create({
        id: 'smartpromptiq-improve',
        title: 'Improve Selected Text',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'smartpromptiq-explain',
        title: 'Explain Selected Text',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'smartpromptiq-summarize',
        title: 'Summarize Selected Text',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'smartpromptiq-separator',
        type: 'separator',
        contexts: ['selection', 'page']
      });

      chrome.contextMenus.create({
        id: 'smartpromptiq-open-dashboard',
        title: 'Open SmartPromptIQ Dashboard',
        contexts: ['page']
      });
    });
  } catch (e) {
    console.log('Context menus setup error:', e);
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText || '';

  switch (info.menuItemId) {
    case 'smartpromptiq-generate':
      handleContextGenerate(selectedText, tab);
      break;
    case 'smartpromptiq-improve':
      handleQuickAction('improve', selectedText, tab);
      break;
    case 'smartpromptiq-explain':
      handleQuickAction('explain', selectedText, tab);
      break;
    case 'smartpromptiq-summarize':
      handleQuickAction('summarize', selectedText, tab);
      break;
    case 'smartpromptiq-open-dashboard':
      chrome.tabs.create({ url: `${getWebsiteUrl()}/dashboard` });
      break;
  }
});

// Handle context generate
function handleContextGenerate(text, tab) {
  // Save context for popup
  chrome.storage.local.set({ pending_context: text });
  // Notify user
  if (text) {
    showNotification('Context saved! Click the extension icon to generate.');
  }
}

// Handle quick actions
function handleQuickAction(action, text, tab) {
  if (!text || !tab?.id) return;

  const prompts = {
    improve: `Please improve the following text to be clearer, more professional, and engaging while maintaining its original meaning:

"${text}"

Provide:
1. The improved version
2. Brief explanation of changes made`,

    explain: `Please explain the following in simple, easy-to-understand terms:

"${text}"

Provide:
1. A clear, simple explanation
2. Key concepts or terms explained
3. Any important context or background`,

    summarize: `Please summarize the following text concisely:

"${text}"

Provide:
1. A brief summary (2-3 sentences)
2. Key points as bullet points
3. Main takeaways`
  };

  injectPrompt(tab.id, prompts[action] || prompts.improve);
}

// Inject prompt into page
function injectPrompt(tabId, prompt) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (promptText) => {
      // Platform-specific selectors
      const selectorGroups = [
        // ChatGPT
        ['textarea[data-id="root"]', '#prompt-textarea', 'textarea[placeholder*="Message ChatGPT"]'],
        // Claude
        ['div[contenteditable="true"].ProseMirror', 'div.ProseMirror[contenteditable="true"]'],
        // Gemini
        ['rich-textarea div[contenteditable="true"]', 'div[contenteditable="true"][aria-label*="Enter"]'],
        // Generic
        ['textarea[placeholder*="Message"]', 'textarea[placeholder*="message"]', 'div[contenteditable="true"]']
      ];

      for (const selectors of selectorGroups) {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
              element.value = promptText;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              // Contenteditable
              element.innerHTML = promptText.replace(/\n/g, '<br>');
              element.dispatchEvent(new InputEvent('input', { bubbles: true, data: promptText }));
            }
            element.focus();

            // Show success notification
            const toast = document.createElement('div');
            toast.style.cssText = `
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 14px;
              font-weight: 600;
              z-index: 999999;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              animation: spiqSlideIn 0.3s ease;
            `;
            toast.textContent = 'SmartPromptIQ: Prompt inserted!';

            const style = document.createElement('style');
            style.textContent = `
              @keyframes spiqSlideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `;
            document.head.appendChild(style);
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

            return true;
          }
        }
      }

      // Fallback: copy to clipboard
      navigator.clipboard.writeText(promptText);
      alert('SmartPromptIQ: Prompt copied to clipboard! Paste with Ctrl+V');
      return false;
    },
    args: [prompt]
  }).catch(err => console.error('Script injection error:', err));
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  if (command === 'quick-generate') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_PANEL' }).catch(() => {});
      }
    });
  }
});

// ============ MESSAGE HANDLERS ============

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);

  // Handle async responses
  const handleAsync = (promise) => {
    promise.then(sendResponse).catch(err => {
      console.error('Message handler error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep channel open for async
  };

  switch (message.type) {
    // Auth messages
    case 'AUTH_TOKEN_RECEIVED':
      return handleAsync(handleAuthTokenReceived(message));

    case 'AUTH_LOGOUT':
      return handleAsync(handleAuthLogout());

    case 'GET_AUTH_STATUS':
      return handleAsync(getAuthStatus());

    case 'LOGIN':
      return handleAsync(handleLogin(message.email, message.password));

    // Prompt messages
    case 'GENERATE_PROMPT':
      return handleAsync(handleGeneratePrompt(message.data));

    case 'SAVE_PROMPT':
      return handleAsync(handleSavePrompt(message.data));

    case 'GET_PROMPTS':
      return handleAsync(handleGetPrompts(message.options));

    case 'DELETE_PROMPT':
      return handleAsync(handleDeletePrompt(message.promptId));

    // Template messages
    case 'GET_TEMPLATES':
      return handleAsync(handleGetTemplates(message.category));

    case 'GET_CATEGORIES':
      return handleAsync(handleGetCategories());

    // User messages
    case 'GET_USER_PROFILE':
      return handleAsync(handleGetUserProfile());

    case 'GET_USER_USAGE':
      return handleAsync(handleGetUserUsage());

    // Navigation
    case 'OPEN_DASHBOARD':
      chrome.tabs.create({ url: `${getWebsiteUrl()}/dashboard` });
      sendResponse({ success: true });
      return false;

    case 'OPEN_PRICING':
      chrome.tabs.create({ url: `${getWebsiteUrl()}/pricing` });
      sendResponse({ success: true });
      return false;

    case 'OPEN_SIGNIN':
      chrome.tabs.create({ url: `${getWebsiteUrl()}/signin` });
      sendResponse({ success: true });
      return false;

    case 'OPEN_OPTIONS':
      chrome.runtime.openOptionsPage();
      sendResponse({ success: true });
      return false;

    // Settings
    case 'GET_SETTINGS':
      return handleAsync(getSettings());

    case 'UPDATE_SETTINGS':
      return handleAsync(updateSettings(message.settings));

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
      return false;
  }
});

// ============ AUTH HANDLERS ============

async function handleAuthTokenReceived(message) {
  const { token, user } = message;

  if (!token) {
    return { success: false, error: 'No token provided' };
  }

  await chrome.storage.local.set({
    [CONFIG.STORAGE_KEYS.TOKEN]: token,
    [CONFIG.STORAGE_KEYS.USER]: user
  });

  await updateBadge();

  // Notify popup if open
  chrome.runtime.sendMessage({ type: 'AUTH_SUCCESS', user }).catch(() => {});

  return { success: true };
}

async function handleAuthLogout() {
  await chrome.storage.local.remove([
    CONFIG.STORAGE_KEYS.TOKEN,
    CONFIG.STORAGE_KEYS.USER
  ]);

  await updateBadge();

  return { success: true };
}

async function getAuthStatus() {
  try {
    const result = await chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.TOKEN,
      CONFIG.STORAGE_KEYS.USER
    ]);

    const token = result[CONFIG.STORAGE_KEYS.TOKEN];

    if (!token) {
      return { authenticated: false };
    }

    // Verify token with API
    const response = await fetch(`${getApiUrl()}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user || data.data?.user;

      // Update stored user data
      await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.USER]: user });
      await updateBadge(user);

      return { authenticated: true, user };
    }

    // Token invalid - clear it
    await handleAuthLogout();
    return { authenticated: false };

  } catch (error) {
    console.error('Auth status check failed:', error);
    // Return cached user if available
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.USER]);
    if (result[CONFIG.STORAGE_KEYS.USER]) {
      return { authenticated: true, user: result[CONFIG.STORAGE_KEYS.USER] };
    }
    return { authenticated: false };
  }
}

async function handleLogin(email, password) {
  try {
    const response = await fetch(`${getApiUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      await chrome.storage.local.set({
        [CONFIG.STORAGE_KEYS.TOKEN]: data.token,
        [CONFIG.STORAGE_KEYS.USER]: data.user
      });

      await updateBadge(data.user);

      return { success: true, user: data.user };
    }

    return { success: false, error: data.message || 'Login failed' };

  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ============ PROMPT HANDLERS ============

async function handleGeneratePrompt(data) {
  try {
    const tokenResult = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN]);
    const token = tokenResult[CONFIG.STORAGE_KEYS.TOKEN];

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${getApiUrl()}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Generation failed');
    }

    const responseData = await response.json();

    // Add to recent prompts
    await addToRecentPrompts({
      content: responseData.prompt || responseData.data?.prompt,
      category: data.category,
      timestamp: Date.now()
    });

    // Update badge with new token count
    await updateBadge();

    return { success: true, data: responseData };

  } catch (error) {
    console.error('Generate prompt error:', error);
    return { success: false, error: error.message };
  }
}

async function handleSavePrompt(data) {
  try {
    const tokenResult = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN]);
    const token = tokenResult[CONFIG.STORAGE_KEYS.TOKEN];

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${getApiUrl()}/api/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Save failed');
    }

    const responseData = await response.json();
    return { success: true, data: responseData };

  } catch (error) {
    console.error('Save prompt error:', error);
    return { success: false, error: error.message };
  }
}

async function handleGetPrompts(options = {}) {
  try {
    const tokenResult = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN]);
    const token = tokenResult[CONFIG.STORAGE_KEYS.TOKEN];

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const { page = 1, limit = 20, category = null } = options;
    let endpoint = `/api/prompts?page=${page}&limit=${limit}`;
    if (category) endpoint += `&category=${category}`;

    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Fetch failed');
    }

    const data = await response.json();

    // Cache the prompts
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.PROMPTS_CACHE]: {
        data: data.prompts || data.data?.prompts || [],
        timestamp: Date.now()
      }
    });

    return {
      success: true,
      prompts: data.prompts || data.data?.prompts || [],
      total: data.total || data.data?.total || 0
    };

  } catch (error) {
    console.error('Get prompts error:', error);

    // Try to return cached data
    const cached = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.PROMPTS_CACHE]);
    if (cached[CONFIG.STORAGE_KEYS.PROMPTS_CACHE]?.data) {
      return {
        success: true,
        prompts: cached[CONFIG.STORAGE_KEYS.PROMPTS_CACHE].data,
        fromCache: true
      };
    }

    return { success: false, error: error.message };
  }
}

async function handleDeletePrompt(promptId) {
  try {
    const tokenResult = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN]);
    const token = tokenResult[CONFIG.STORAGE_KEYS.TOKEN];

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${getApiUrl()}/api/prompts/${promptId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return { success: true };

  } catch (error) {
    console.error('Delete prompt error:', error);
    return { success: false, error: error.message };
  }
}

// ============ TEMPLATE HANDLERS ============

async function handleGetTemplates(category = null) {
  try {
    const tokenResult = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN]);
    const token = tokenResult[CONFIG.STORAGE_KEYS.TOKEN];

    let endpoint = '/api/templates';
    if (category) endpoint += `?category=${category}`;

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${getApiUrl()}${endpoint}`, { headers });

    if (!response.ok) {
      throw new Error('Fetch failed');
    }

    const data = await response.json();
    return {
      success: true,
      templates: data.templates || data.data?.templates || []
    };

  } catch (error) {
    console.error('Get templates error:', error);
    return { success: false, error: error.message };
  }
}

async function handleGetCategories() {
  try {
    const response = await fetch(`${getApiUrl()}/api/categories`);

    if (!response.ok) {
      throw new Error('Fetch failed');
    }

    const data = await response.json();
    return {
      success: true,
      categories: data.categories || data.data?.categories || []
    };

  } catch (error) {
    console.error('Get categories error:', error);
    // Return default categories
    return {
      success: true,
      categories: [
        { id: 'marketing', name: 'Marketing' },
        { id: 'development', name: 'Development' },
        { id: 'writing', name: 'Writing' },
        { id: 'business', name: 'Business' },
        { id: 'education', name: 'Education' },
        { id: 'creative', name: 'Creative' }
      ]
    };
  }
}

// ============ USER HANDLERS ============

async function handleGetUserProfile() {
  try {
    const tokenResult = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN]);
    const token = tokenResult[CONFIG.STORAGE_KEYS.TOKEN];

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${getApiUrl()}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Fetch failed');
    }

    const data = await response.json();
    return { success: true, profile: data.profile || data.data?.profile || data };

  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error: error.message };
  }
}

async function handleGetUserUsage() {
  try {
    const tokenResult = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.TOKEN]);
    const token = tokenResult[CONFIG.STORAGE_KEYS.TOKEN];

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${getApiUrl()}/api/usage`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Fetch failed');
    }

    const data = await response.json();
    return { success: true, usage: data.usage || data.data?.usage || data };

  } catch (error) {
    console.error('Get user usage error:', error);
    return { success: false, error: error.message };
  }
}

// ============ SETTINGS HANDLERS ============

async function getSettings() {
  const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.SETTINGS]);
  return {
    success: true,
    settings: result[CONFIG.STORAGE_KEYS.SETTINGS] || {}
  };
}

async function updateSettings(newSettings) {
  const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.SETTINGS]);
  const settings = { ...result[CONFIG.STORAGE_KEYS.SETTINGS], ...newSettings };

  await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.SETTINGS]: settings });

  return { success: true, settings };
}

// ============ UTILITY FUNCTIONS ============

async function addToRecentPrompts(prompt) {
  try {
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.RECENT_PROMPTS]);
    let recent = result[CONFIG.STORAGE_KEYS.RECENT_PROMPTS] || [];

    recent.unshift({
      ...prompt,
      id: Date.now()
    });

    // Keep last 50
    recent = recent.slice(0, 50);

    await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.RECENT_PROMPTS]: recent });
  } catch (error) {
    console.error('Failed to add to recent prompts:', error);
  }
}

async function updateBadge(user = null) {
  try {
    if (!user) {
      const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.USER]);
      user = result[CONFIG.STORAGE_KEYS.USER];
    }

    if (user && user.tokenBalance !== undefined) {
      const tokens = user.tokenBalance || 0;
      if (tokens > 0) {
        chrome.action.setBadgeText({ text: tokens > 99 ? '99+' : String(tokens) });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Green
      } else {
        chrome.action.setBadgeText({ text: '0' });
        chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Red
      }
    } else if (user) {
      chrome.action.setBadgeText({ text: '' });
    } else {
      // Not logged in
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' }); // Orange
    }
  } catch (error) {
    console.error('Failed to update badge:', error);
  }
}

function showNotification(message) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'SmartPromptIQ',
      message: message
    });
  } catch (error) {
    console.log('Notification error:', error);
  }
}

// Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes[CONFIG.STORAGE_KEYS.USER]) {
      updateBadge(changes[CONFIG.STORAGE_KEYS.USER].newValue);
    }
    if (changes[CONFIG.STORAGE_KEYS.ENV]) {
      currentEnv = changes[CONFIG.STORAGE_KEYS.ENV].newValue || 'production';
    }
  }
});

// Startup
loadEnvironment().then(() => {
  console.log('SmartPromptIQ Service Worker Started - Environment:', currentEnv);
  updateBadge();
});
