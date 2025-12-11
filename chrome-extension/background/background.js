// SmartPromptIQ Chrome Extension - Background Service Worker

const CONFIG = {
  API_BASE_URL: 'https://smartpromptiq.com',
  DEV_API_URL: 'http://localhost:5001',
  WEBSITE_URL: 'https://smartpromptiq.com'
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('SmartPromptIQ Extension installed:', details.reason);

  // Create context menu items
  try {
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
  } catch (e) {
    console.log('Context menus already exist or error:', e);
  }

  // Set default badge color
  chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText || '';

  switch (info.menuItemId) {
    case 'smartpromptiq-generate':
      handleContextGenerate(selectedText, tab);
      break;
    case 'smartpromptiq-improve':
      handleContextImprove(selectedText, tab);
      break;
    case 'smartpromptiq-explain':
      handleContextExplain(selectedText, tab);
      break;
  }
});

// Handle generate from context menu
function handleContextGenerate(text, tab) {
  chrome.storage.local.set({ pending_context: text });
  // Can't programmatically open popup, so just set the context
  console.log('Context saved for generation:', text);
}

// Handle improve text
function handleContextImprove(text, tab) {
  if (!text || !tab.id) return;

  const prompt = `Please improve the following text to make it clearer, more professional, and more engaging while maintaining its original meaning:

"${text}"

Provide:
1. The improved version
2. Brief explanation of changes made`;

  injectPrompt(tab.id, prompt);
}

// Handle explain text
function handleContextExplain(text, tab) {
  if (!text || !tab.id) return;

  const prompt = `Please explain the following text in simple terms:

"${text}"

Provide:
1. A clear, simple explanation
2. Key concepts or terms explained
3. Any important context`;

  injectPrompt(tab.id, prompt);
}

// Inject prompt into the page
function injectPrompt(tabId, prompt) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (promptText) => {
      // Try to find AI chat input
      const selectors = [
        'textarea[data-id="root"]',
        '#prompt-textarea',
        'div[contenteditable="true"].ProseMirror',
        'div[contenteditable="true"]',
        'textarea[placeholder*="Message"]',
        'textarea[placeholder*="message"]'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            element.value = promptText;
            element.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            element.innerHTML = promptText.replace(/\n/g, '<br>');
            element.dispatchEvent(new InputEvent('input', { bubbles: true }));
          }

          // Show notification
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
          `;
          toast.textContent = 'SmartPromptIQ: Prompt inserted!';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
          return true;
        }
      }

      // Fallback: copy to clipboard
      navigator.clipboard.writeText(promptText);
      alert('SmartPromptIQ: Prompt copied to clipboard!');
      return false;
    },
    args: [prompt]
  }).catch(err => console.error('Script injection error:', err));
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('Command received:', command);
  if (command === 'quick-generate') {
    // Send message to content script to toggle panel
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_PANEL' }).catch(() => {});
      }
    });
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message.type);

  switch (message.type) {
    case 'GENERATE_PROMPT':
      handleGeneratePrompt(message.data).then(sendResponse);
      return true;

    case 'GET_AUTH_STATUS':
      getAuthStatus().then(sendResponse);
      return true;

    case 'SAVE_PROMPT':
      savePrompt(message.data).then(sendResponse);
      return true;

    case 'GET_PROMPTS':
      getPrompts().then(sendResponse);
      return true;

    case 'OPEN_DASHBOARD':
      chrome.tabs.create({ url: CONFIG.WEBSITE_URL + '/dashboard' });
      sendResponse({ success: true });
      return false;

    default:
      return false;
  }
});

// Generate prompt via API
async function handleGeneratePrompt(data) {
  try {
    const result = await chrome.storage.local.get(['smartpromptiq_token']);
    const token = result.smartpromptiq_token;

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${CONFIG.DEV_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Generate prompt error:', error);
    return { success: false, error: error.message };
  }
}

// Get authentication status
async function getAuthStatus() {
  try {
    const result = await chrome.storage.local.get(['smartpromptiq_token']);
    const token = result.smartpromptiq_token;

    if (!token) {
      return { authenticated: false };
    }

    const response = await fetch(`${CONFIG.DEV_API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return { authenticated: true, user: data.user || data.data?.user };
    }

    return { authenticated: false };
  } catch (error) {
    console.error('Auth status error:', error);
    return { authenticated: false };
  }
}

// Save prompt to library
async function savePrompt(data) {
  try {
    const result = await chrome.storage.local.get(['smartpromptiq_token']);
    const token = result.smartpromptiq_token;

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${CONFIG.DEV_API_URL}/api/prompts`, {
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

    return { success: true };
  } catch (error) {
    console.error('Save prompt error:', error);
    return { success: false, error: error.message };
  }
}

// Get saved prompts
async function getPrompts() {
  try {
    const result = await chrome.storage.local.get(['smartpromptiq_token']);
    const token = result.smartpromptiq_token;

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${CONFIG.DEV_API_URL}/api/prompts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Fetch failed');
    }

    const data = await response.json();
    return { success: true, prompts: data.prompts || data.data?.prompts || [] };
  } catch (error) {
    console.error('Get prompts error:', error);
    return { success: false, error: error.message };
  }
}

// Log when service worker starts
console.log('SmartPromptIQ Service Worker Started');
