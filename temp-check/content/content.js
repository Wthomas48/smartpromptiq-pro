// SmartPromptIQ Chrome Extension - Content Script
// Enhanced version with better platform detection and improved UX

(function() {
  'use strict';

  // Avoid duplicate injection
  if (window.smartPromptIQInjected) return;
  window.smartPromptIQInjected = true;

  console.log('SmartPromptIQ: Content script loaded');

  // Configuration
  const FLOATING_BUTTON_ID = 'smartpromptiq-floating-btn';
  const QUICK_PANEL_ID = 'smartpromptiq-quick-panel';

  // Platform configurations with improved selectors
  const PLATFORMS = {
    chatgpt: {
      name: 'ChatGPT',
      patterns: ['chat.openai.com', 'chatgpt.com'],
      inputSelectors: [
        '#prompt-textarea',
        'textarea[data-id="root"]',
        'textarea[placeholder*="Message ChatGPT"]',
        'textarea[placeholder*="Send a message"]',
        'div[contenteditable="true"][data-placeholder]'
      ],
      submitSelectors: [
        'button[data-testid="send-button"]',
        'button[aria-label*="Send"]',
        'button[class*="send"]'
      ]
    },
    claude: {
      name: 'Claude',
      patterns: ['claude.ai'],
      inputSelectors: [
        'div[contenteditable="true"].ProseMirror',
        'div.ProseMirror[contenteditable="true"]',
        'div[contenteditable="true"][data-placeholder]',
        'div[role="textbox"]'
      ],
      submitSelectors: [
        'button[aria-label*="Send"]',
        'button[type="submit"]'
      ]
    },
    gemini: {
      name: 'Gemini',
      patterns: ['gemini.google.com', 'bard.google.com'],
      inputSelectors: [
        'rich-textarea div[contenteditable="true"]',
        'div[contenteditable="true"][aria-label*="Enter"]',
        'div[contenteditable="true"][role="textbox"]',
        '.ql-editor'
      ],
      submitSelectors: [
        'button[aria-label*="Send"]',
        'button[mat-icon-button]'
      ]
    },
    copilot: {
      name: 'Microsoft Copilot',
      patterns: ['copilot.microsoft.com', 'bing.com/chat'],
      inputSelectors: [
        'textarea#userInput',
        'textarea[placeholder*="message"]',
        'cib-serp #searchbox textarea',
        'textarea'
      ],
      submitSelectors: [
        'button[aria-label*="Submit"]',
        'button[type="submit"]'
      ]
    },
    poe: {
      name: 'Poe',
      patterns: ['poe.com'],
      inputSelectors: [
        'textarea[class*="GrowingTextArea"]',
        'textarea[placeholder*="Talk"]',
        'div[contenteditable="true"]'
      ],
      submitSelectors: [
        'button[class*="send"]',
        'button[aria-label*="Send"]'
      ]
    },
    perplexity: {
      name: 'Perplexity',
      patterns: ['perplexity.ai'],
      inputSelectors: [
        'textarea[placeholder*="Ask"]',
        'textarea',
        'div[contenteditable="true"]'
      ],
      submitSelectors: [
        'button[aria-label*="Submit"]',
        'button[type="submit"]'
      ]
    },
    you: {
      name: 'You.com',
      patterns: ['you.com'],
      inputSelectors: [
        'textarea[placeholder*="Ask"]',
        'textarea',
        'div[contenteditable="true"]'
      ],
      submitSelectors: [
        'button[type="submit"]',
        'button[aria-label*="Search"]'
      ]
    }
  };

  // State
  let currentPlatform = null;
  let settings = {
    showFloatingButton: true,
    autoInsert: true,
    keyboardShortcuts: true
  };

  // Detect current platform
  function detectPlatform() {
    const url = window.location.href.toLowerCase();

    for (const [key, config] of Object.entries(PLATFORMS)) {
      if (config.patterns.some(pattern => url.includes(pattern))) {
        return { key, ...config };
      }
    }

    return null;
  }

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(['smartpromptiq_settings']);
      if (result.smartpromptiq_settings) {
        settings = { ...settings, ...result.smartpromptiq_settings };
      }
    } catch (error) {
      console.log('SmartPromptIQ: Could not load settings');
    }
  }

  // Find input element for current platform
  function findInputElement() {
    if (!currentPlatform) {
      // Try generic selectors
      const genericSelectors = [
        'textarea',
        'div[contenteditable="true"]',
        'input[type="text"]'
      ];

      for (const selector of genericSelectors) {
        const element = document.querySelector(selector);
        if (element && isVisible(element)) {
          return element;
        }
      }
      return null;
    }

    // Try platform-specific selectors
    for (const selector of currentPlatform.inputSelectors) {
      const element = document.querySelector(selector);
      if (element && isVisible(element)) {
        return element;
      }
    }

    return null;
  }

  // Check if element is visible
  function isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' &&
           style.visibility !== 'hidden' &&
           style.opacity !== '0' &&
           element.offsetParent !== null;
  }

  // Insert text into input element
  function insertText(element, text) {
    if (!element) return false;

    try {
      if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        // For textarea/input elements
        element.focus();
        element.value = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (element.contentEditable === 'true') {
        // For contenteditable elements (Claude, Gemini, etc.)
        element.focus();

        // Clear existing content
        element.innerHTML = '';

        // Insert new content with proper line breaks
        const lines = text.split('\n');
        lines.forEach((line, index) => {
          if (index > 0) {
            element.appendChild(document.createElement('br'));
          }
          element.appendChild(document.createTextNode(line));
        });

        // Dispatch events
        element.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: text
        }));

        // Move cursor to end
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      return true;
    } catch (error) {
      console.error('SmartPromptIQ: Insert error:', error);
      return false;
    }
  }

  // Create floating action button
  function createFloatingButton() {
    if (!settings.showFloatingButton) return;
    if (document.getElementById(FLOATING_BUTTON_ID)) return;

    const button = document.createElement('div');
    button.id = FLOATING_BUTTON_ID;
    button.innerHTML = '🧠';
    button.title = 'SmartPromptIQ - Generate Prompt (Ctrl+Shift+G)';
    button.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      z-index: 2147483646;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
    });

    button.addEventListener('click', toggleQuickPanel);

    // Make button draggable
    let isDragging = false;
    let startX, startY, startLeft, startBottom;

    button.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = button.offsetLeft;
      startBottom = parseInt(button.style.bottom) || 100;

      const onMouseMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          isDragging = true;
          button.style.right = 'auto';
          button.style.left = `${startLeft + dx}px`;
          button.style.bottom = `${startBottom - dy}px`;
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        if (!isDragging) {
          toggleQuickPanel();
        }
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      e.preventDefault();
    });

    document.body.appendChild(button);
  }

  // Create quick panel
  function createQuickPanel() {
    if (document.getElementById(QUICK_PANEL_ID)) return;

    const panel = document.createElement('div');
    panel.id = QUICK_PANEL_ID;
    panel.style.cssText = `
      position: fixed;
      bottom: 160px;
      right: 20px;
      width: 340px;
      background: #1a1a2e;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      z-index: 2147483647;
      display: none;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid rgba(139, 92, 246, 0.3);
      animation: spiqPanelIn 0.3s ease;
    `;

    const platformName = currentPlatform?.name || 'AI Chat';

    panel.innerHTML = `
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">🧠</span>
          <div>
            <span style="color: white; font-weight: 700; font-size: 16px; display: block;">SmartPromptIQ</span>
            <span style="color: rgba(255,255,255,0.8); font-size: 11px;">${platformName} detected</span>
          </div>
        </div>
        <button id="spiq-close" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>

      <div style="padding: 16px;">
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Quick Actions</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="spiq-action" data-action="improve" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left; transition: all 0.2s;">
              ✨ Improve Text
            </button>
            <button class="spiq-action" data-action="explain" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left; transition: all 0.2s;">
              💡 Explain
            </button>
            <button class="spiq-action" data-action="summarize" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left; transition: all 0.2s;">
              📋 Summarize
            </button>
            <button class="spiq-action" data-action="code" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left; transition: all 0.2s;">
              💻 Code Help
            </button>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Custom Prompt</label>
          <textarea id="spiq-custom-input" placeholder="Describe what you need help with..." style="width: 100%; height: 70px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; padding: 12px; font-size: 13px; resize: none; font-family: inherit; transition: border-color 0.2s;"></textarea>
        </div>

        <button id="spiq-generate" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #f97316 0%, #eab308 100%); border: none; border-radius: 10px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
          🚀 Generate & Insert
        </button>

        <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
          <a href="#" id="spiq-open-full" style="color: #a78bfa; font-size: 12px; text-decoration: none;">Open Full Dashboard →</a>
          <span id="spiq-status" style="color: #71717a; font-size: 11px;">Ready</span>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById('spiq-close').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    document.querySelectorAll('.spiq-action').forEach(btn => {
      btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
      btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = 'rgba(139, 92, 246, 0.5)';
        btn.style.background = '#2a2a4a';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = 'rgba(255,255,255,0.1)';
        btn.style.background = '#252542';
      });
    });

    document.getElementById('spiq-generate').addEventListener('click', handleCustomGenerate);

    document.getElementById('spiq-open-full').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    });

    // Focus handling for custom input
    const customInput = document.getElementById('spiq-custom-input');
    customInput.addEventListener('focus', () => {
      customInput.style.borderColor = 'rgba(139, 92, 246, 0.5)';
    });
    customInput.addEventListener('blur', () => {
      customInput.style.borderColor = 'rgba(255,255,255,0.1)';
    });
    customInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCustomGenerate();
      }
    });
  }

  // Toggle quick panel
  function toggleQuickPanel() {
    let panel = document.getElementById(QUICK_PANEL_ID);
    if (!panel) {
      createQuickPanel();
      panel = document.getElementById(QUICK_PANEL_ID);
    }

    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }

  // Handle quick actions
  function handleQuickAction(action) {
    const selectedText = window.getSelection().toString().trim();

    const prompts = {
      improve: selectedText
        ? `Please improve the following text to be clearer, more professional, and engaging while maintaining its original meaning:\n\n"${selectedText}"\n\nProvide:\n1. The improved version\n2. Brief explanation of changes made`
        : `Please help me improve my writing. I need assistance with making text clearer, more professional, and engaging.`,

      explain: selectedText
        ? `Please explain the following in simple, easy-to-understand terms:\n\n"${selectedText}"\n\nProvide:\n1. A clear, simple explanation\n2. Key concepts or terms explained\n3. Any important context or background`
        : `Please help me understand a concept. I'll describe what I need explained.`,

      summarize: selectedText
        ? `Please summarize the following text concisely:\n\n"${selectedText}"\n\nProvide:\n1. A brief summary (2-3 sentences)\n2. Key points as bullet points\n3. Main takeaways`
        : `Please help me create a summary. I'll provide the content to summarize.`,

      code: selectedText
        ? `Please help with the following code or technical question:\n\n"${selectedText}"\n\nProvide:\n1. Analysis of the code/question\n2. Explanation of what it does\n3. Any improvements or fixes needed\n4. Best practices recommendations`
        : `I need help with coding. Please provide guidance on best practices, debugging, or implementation.`
    };

    insertPromptIntoChat(prompts[action] || prompts.improve);
    updateStatus('Prompt inserted!');

    // Hide panel after action
    const panel = document.getElementById(QUICK_PANEL_ID);
    if (panel) {
      setTimeout(() => {
        panel.style.display = 'none';
      }, 500);
    }
  }

  // Handle custom generate
  function handleCustomGenerate() {
    const customInput = document.getElementById('spiq-custom-input');
    const text = customInput.value.trim();

    if (!text) {
      customInput.style.borderColor = '#ef4444';
      setTimeout(() => {
        customInput.style.borderColor = 'rgba(255,255,255,0.1)';
      }, 2000);
      return;
    }

    const selectedText = window.getSelection().toString().trim();
    let prompt = text;

    if (selectedText) {
      prompt = `${text}\n\n**Context/Reference:**\n"${selectedText}"`;
    }

    insertPromptIntoChat(prompt);
    customInput.value = '';
    updateStatus('Prompt inserted!');

    // Hide panel after action
    const panel = document.getElementById(QUICK_PANEL_ID);
    if (panel) {
      setTimeout(() => {
        panel.style.display = 'none';
      }, 500);
    }
  }

  // Update status in panel
  function updateStatus(message) {
    const statusEl = document.getElementById('spiq-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.style.color = '#10b981';
      setTimeout(() => {
        statusEl.textContent = 'Ready';
        statusEl.style.color = '#71717a';
      }, 2000);
    }
  }

  // Insert prompt into chat input
  function insertPromptIntoChat(prompt) {
    const inputElement = findInputElement();

    if (inputElement) {
      const success = insertText(inputElement, prompt);
      if (success) {
        showNotification('Prompt inserted!');
        return true;
      }
    }

    // Fallback: copy to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
      showNotification('Copied to clipboard - paste with Ctrl+V');
    }).catch(() => {
      showNotification('Could not insert prompt', 'error');
    });

    return false;
  }

  // Show notification
  function showNotification(message, type = 'success') {
    const existing = document.querySelector('.spiq-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'spiq-notification';

    const colors = {
      success: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)'
    };

    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type] || colors.success};
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 2147483647;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: spiqSlideUp 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const icons = { success: '✓', error: '✕', warning: '⚠' };
    notification.innerHTML = `<span>${icons[type] || icons.success}</span><span>${message}</span>`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'spiqSlideDown 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }

  // Add CSS animations
  function addStyles() {
    if (document.getElementById('spiq-styles')) return;

    const style = document.createElement('style');
    style.id = 'spiq-styles';
    style.textContent = `
      @keyframes spiqSlideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      @keyframes spiqSlideDown {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
      }

      @keyframes spiqPanelIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      #${QUICK_PANEL_ID} button:hover {
        transform: translateY(-1px);
      }

      #${QUICK_PANEL_ID} button:active {
        transform: translateY(0);
      }

      #${FLOATING_BUTTON_ID}:active {
        transform: scale(0.95) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Listen for keyboard shortcuts
  function setupKeyboardShortcuts() {
    if (!settings.keyboardShortcuts) return;

    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+G to toggle panel
      if (e.ctrlKey && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        toggleQuickPanel();
      }

      // Escape to close panel
      if (e.key === 'Escape') {
        const panel = document.getElementById(QUICK_PANEL_ID);
        if (panel && panel.style.display !== 'none') {
          panel.style.display = 'none';
        }
      }
    });
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'INSERT_PROMPT':
        const success = insertPromptIntoChat(message.prompt);
        sendResponse({ success });
        break;

      case 'TOGGLE_PANEL':
        toggleQuickPanel();
        sendResponse({ success: true });
        break;

      case 'SETTINGS_UPDATED':
        settings = { ...settings, ...message.settings };

        // Update floating button visibility
        const button = document.getElementById(FLOATING_BUTTON_ID);
        if (button) {
          button.style.display = settings.showFloatingButton ? 'flex' : 'none';
        } else if (settings.showFloatingButton) {
          createFloatingButton();
        }
        sendResponse({ success: true });
        break;

      case 'GET_SELECTED_TEXT':
        const selectedText = window.getSelection().toString().trim();
        sendResponse({ text: selectedText });
        break;
    }
    return true;
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.smartpromptiq_settings) {
      settings = { ...settings, ...changes.smartpromptiq_settings.newValue };

      const button = document.getElementById(FLOATING_BUTTON_ID);
      if (button) {
        button.style.display = settings.showFloatingButton ? 'flex' : 'none';
      }
    }
  });

  // Initialize
  async function init() {
    addStyles();
    await loadSettings();

    currentPlatform = detectPlatform();
    console.log(`SmartPromptIQ: Platform detected - ${currentPlatform?.name || 'Unknown'}`);

    createFloatingButton();
    setupKeyboardShortcuts();

    // Watch for dynamic content changes
    const observer = new MutationObserver(() => {
      // Re-check for input element if page content changes
      if (!document.getElementById(FLOATING_BUTTON_ID)) {
        createFloatingButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
