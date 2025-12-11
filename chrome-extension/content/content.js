// SmartPromptIQ Chrome Extension - Content Script
// Injected into AI chat platforms

(function() {
  'use strict';

  // Avoid duplicate injection
  if (window.smartPromptIQInjected) return;
  window.smartPromptIQInjected = true;

  console.log('SmartPromptIQ: Content script loaded');

  // Configuration
  const FLOATING_BUTTON_ID = 'smartpromptiq-floating-btn';
  const QUICK_PANEL_ID = 'smartpromptiq-quick-panel';

  // Detect which AI platform we're on
  function detectPlatform() {
    const url = window.location.href;
    if (url.includes('chat.openai.com')) return 'chatgpt';
    if (url.includes('claude.ai')) return 'claude';
    if (url.includes('gemini.google.com')) return 'gemini';
    if (url.includes('bing.com/chat')) return 'bing';
    if (url.includes('poe.com')) return 'poe';
    return 'unknown';
  }

  const platform = detectPlatform();

  // Create floating action button
  function createFloatingButton() {
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
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
      transition: all 0.3s ease;
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
      width: 320px;
      background: #1a1a2e;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      z-index: 999998;
      display: none;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid rgba(139, 92, 246, 0.3);
    `;

    panel.innerHTML = `
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 16px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">🧠</span>
          <span style="color: white; font-weight: 700; font-size: 16px;">SmartPromptIQ</span>
        </div>
        <button id="spiq-close" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 14px;">✕</button>
      </div>

      <div style="padding: 16px;">
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Quick Actions</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="spiq-action" data-action="improve" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left;">
              ✨ Improve Text
            </button>
            <button class="spiq-action" data-action="explain" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left;">
              💡 Explain
            </button>
            <button class="spiq-action" data-action="summarize" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left;">
              📋 Summarize
            </button>
            <button class="spiq-action" data-action="code" style="padding: 12px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; font-size: 13px; text-align: left;">
              💻 Code Help
            </button>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Custom Prompt</label>
          <textarea id="spiq-custom-input" placeholder="What do you need help with?" style="width: 100%; height: 60px; background: #252542; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; padding: 12px; font-size: 13px; resize: none; font-family: inherit;"></textarea>
        </div>

        <button id="spiq-generate" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #f97316 0%, #eab308 100%); border: none; border-radius: 10px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
          🚀 Generate & Insert
        </button>

        <div style="margin-top: 12px; text-align: center;">
          <a href="#" id="spiq-open-full" style="color: #a78bfa; font-size: 12px; text-decoration: none;">Open Full Dashboard →</a>
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
  }

  // Toggle quick panel
  function toggleQuickPanel() {
    const panel = document.getElementById(QUICK_PANEL_ID);
    if (!panel) {
      createQuickPanel();
      document.getElementById(QUICK_PANEL_ID).style.display = 'block';
    } else {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  }

  // Handle quick actions
  function handleQuickAction(action) {
    const selectedText = window.getSelection().toString().trim();

    const prompts = {
      improve: selectedText
        ? `Please improve the following text to be clearer, more professional, and engaging:\n\n"${selectedText}"\n\nProvide the improved version and briefly explain the changes.`
        : `Please help me improve my writing. I need assistance with making text clearer and more engaging.`,

      explain: selectedText
        ? `Please explain the following in simple terms:\n\n"${selectedText}"\n\nProvide a clear explanation with key concepts identified.`
        : `Please help me understand a concept. I'll describe what I need explained.`,

      summarize: selectedText
        ? `Please summarize the following text:\n\n"${selectedText}"\n\nProvide:\n1. A brief summary (2-3 sentences)\n2. Key points as bullet points`
        : `Please help me create a summary. I'll provide the content to summarize.`,

      code: selectedText
        ? `Please help with the following code/technical question:\n\n"${selectedText}"\n\nProvide explanation and any improvements or fixes needed.`
        : `I need help with coding. Please provide guidance on best practices and solutions.`
    };

    insertPromptIntoChat(prompts[action] || prompts.improve);
    toggleQuickPanel();
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
      prompt = `${text}\n\nContext/Reference:\n"${selectedText}"`;
    }

    insertPromptIntoChat(prompt);
    customInput.value = '';
    toggleQuickPanel();
  }

  // Insert prompt into chat input
  function insertPromptIntoChat(prompt) {
    const selectors = {
      chatgpt: ['textarea[data-id="root"]', '#prompt-textarea'],
      claude: ['div[contenteditable="true"].ProseMirror', 'div[contenteditable="true"]'],
      gemini: ['div[contenteditable="true"]', 'textarea'],
      bing: ['textarea', 'div[contenteditable="true"]'],
      poe: ['textarea', 'div[contenteditable="true"]'],
      unknown: ['textarea', 'div[contenteditable="true"]', 'input[type="text"]']
    };

    const platformSelectors = selectors[platform] || selectors.unknown;

    for (const selector of platformSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
          element.value = prompt;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // Contenteditable
          element.innerHTML = prompt.replace(/\n/g, '<br>');
          element.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }

        element.focus();
        showNotification('Prompt inserted!');
        return true;
      }
    }

    // Fallback: copy to clipboard
    navigator.clipboard.writeText(prompt).then(() => {
      showNotification('Copied to clipboard - paste with Ctrl+V');
    });

    return false;
  }

  // Show notification
  function showNotification(message) {
    const existing = document.querySelector('.spiq-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'spiq-notification';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 9999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: spiqSlideUp 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'spiqSlideDown 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }

  // Add CSS animations
  function addStyles() {
    const style = document.createElement('style');
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

      #${QUICK_PANEL_ID} button:hover {
        transform: translateY(-1px);
      }

      #${QUICK_PANEL_ID} button:active {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  // Listen for keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+G to toggle panel
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
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

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'INSERT_PROMPT') {
      insertPromptIntoChat(message.prompt);
      sendResponse({ success: true });
    }
    if (message.type === 'TOGGLE_PANEL') {
      toggleQuickPanel();
      sendResponse({ success: true });
    }
  });

  // Initialize
  function init() {
    addStyles();
    createFloatingButton();

    // Log platform detection
    console.log(`SmartPromptIQ: Detected platform - ${platform}`);
  }

  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
