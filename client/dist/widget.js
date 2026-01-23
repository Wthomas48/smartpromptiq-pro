/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    SmartPromptIQ Embeddable Chat Widget                   ║
 * ║                              Version: 1.1.0                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  🚀 PLUG & PLAY - Works on ANY website with just ONE script tag!          ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║                                                                           ║
 * ║  MINIMAL USAGE (just 2 lines!):                                           ║
 * ║  ────────────────────────────────────────────────────────────────────────║
 * ║  <script src="https://smartpromptiq.com/widget.js"                        ║
 * ║          data-api-key="YOUR_API_KEY"></script>                            ║
 * ║                                                                           ║
 * ║  FULL USAGE (with all options):                                           ║
 * ║  ────────────────────────────────────────────────────────────────────────║
 * ║  <script                                                                  ║
 * ║    src="https://smartpromptiq.com/widget.js"                              ║
 * ║    data-api-key="spiq_your_api_key"                                       ║
 * ║    data-agent="your-agent-slug"                                           ║
 * ║    data-theme="light"              (light|dark|auto)                      ║
 * ║    data-position="bottom-right"    (bottom-right|bottom-left)             ║
 * ║    data-primary-color="#6366f1"    (any hex color)                        ║
 * ║    data-greeting="Hi! How can I help?"                                    ║
 * ║  ></script>                                                               ║
 * ║                                                                           ║
 * ║  📖 Docs: https://smartpromptiq.com/docs/widget                           ║
 * ║  🎫 Get API Key: https://smartpromptiq.com/agents                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.SmartPromptIQ) {
    console.warn('SmartPromptIQ widget already initialized');
    return;
  }

  // ============================================
  // Configuration
  // ============================================

  const WIDGET_VERSION = '1.0.0';
  const API_BASE_URL = getApiBaseUrl();
  const WIDGET_ID = 'spiq-widget';

  function getApiBaseUrl() {
    // Check for custom API URL in script tag first
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const script = scripts[i];
      if (script.src && script.src.includes('widget.js')) {
        // Allow custom API URL via data attribute (for self-hosted)
        const customApiUrl = script.getAttribute('data-api-url');
        if (customApiUrl) {
          return customApiUrl.endsWith('/api/chat') ? customApiUrl : customApiUrl + '/api/chat';
        }

        // Try to determine from script URL
        try {
          const url = new URL(script.src);
          const hostname = url.hostname;

          // Production URLs - smartpromptiq.com
          if (hostname === 'smartpromptiq.com' || hostname === 'www.smartpromptiq.com') {
            return 'https://smartpromptiq.com/api/chat';
          }

          // Railway deployment URLs
          if (hostname.includes('railway.app')) {
            return url.origin + '/api/chat';
          }

          // Vercel/Netlify deployments
          if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
            return url.origin + '/api/chat';
          }

          // Development/staging (localhost)
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Use port 3001 for backend in development
            return `http://${hostname}:3001/api/chat`;
          }

          // Default: use same origin as script (works for any deployment)
          return url.origin + '/api/chat';
        } catch (e) {
          console.warn('SmartPromptIQ: Could not parse script URL', e);
        }
      }
    }
    // Ultimate fallback to production API
    return 'https://smartpromptiq.com/api/chat';
  }

  // ============================================
  // Widget Configuration from Script Tag
  // ============================================

  function getConfig() {
    const script = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.includes('widget.js')) {
          return scripts[i];
        }
      }
      return null;
    })();

    if (!script) {
      console.error('SmartPromptIQ: Could not find widget script tag');
      return null;
    }

    return {
      apiKey: script.getAttribute('data-api-key') || '',
      agent: script.getAttribute('data-agent') || 'default',
      theme: script.getAttribute('data-theme') || 'light',
      position: script.getAttribute('data-position') || 'bottom-right',
      primaryColor: script.getAttribute('data-primary-color') || '#6366f1',
      voiceEnabled: script.getAttribute('data-voice-enabled') === 'true',
      language: script.getAttribute('data-language') || 'en',
      greeting: script.getAttribute('data-greeting') || null,
      placeholder: script.getAttribute('data-placeholder') || 'Type your message...'
    };
  }

  // ============================================
  // Styles
  // ============================================

  function injectStyles(config) {
    const isDark = config.theme === 'dark';
    const position = config.position;
    const primaryColor = config.primaryColor;

    // Calculate contrast color
    const contrastColor = getContrastColor(primaryColor);

    const css = `
      /* SmartPromptIQ Widget Styles */
      #${WIDGET_ID}-container {
        --spiq-primary: ${primaryColor};
        --spiq-primary-hover: ${adjustColor(primaryColor, -10)};
        --spiq-contrast: ${contrastColor};
        --spiq-bg: ${isDark ? '#1f2937' : '#ffffff'};
        --spiq-bg-secondary: ${isDark ? '#374151' : '#f3f4f6'};
        --spiq-text: ${isDark ? '#f9fafb' : '#111827'};
        --spiq-text-secondary: ${isDark ? '#9ca3af' : '#6b7280'};
        --spiq-border: ${isDark ? '#4b5563' : '#e5e7eb'};
        --spiq-shadow: ${isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.25)'};

        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        position: fixed;
        ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        ${position.includes('top') ? 'top: 20px;' : 'bottom: 100px;'}
        z-index: 999999;
      }

      /* Chat Bubble */
      #${WIDGET_ID}-bubble {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--spiq-primary);
        color: var(--spiq-contrast);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--spiq-shadow);
        transition: transform 0.2s ease, background-color 0.2s ease;
      }

      #${WIDGET_ID}-bubble:hover {
        transform: scale(1.1);
        background: var(--spiq-primary-hover);
      }

      #${WIDGET_ID}-bubble svg {
        width: 28px;
        height: 28px;
        fill: currentColor;
      }

      #${WIDGET_ID}-bubble.has-unread::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 16px;
        height: 16px;
        background: #ef4444;
        border-radius: 50%;
        border: 2px solid var(--spiq-bg);
      }

      /* Chat Window */
      #${WIDGET_ID}-window {
        position: absolute;
        ${position.includes('right') ? 'right: 0;' : 'left: 0;'}
        ${position.includes('top') ? 'top: 70px;' : 'bottom: 170px;'}
        width: 380px;
        height: 520px;
        max-height: calc(100vh - 100px);
        background: var(--spiq-bg);
        border-radius: 16px;
        box-shadow: var(--spiq-shadow);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--spiq-border);
      }

      #${WIDGET_ID}-window.open {
        display: flex;
        animation: spiq-slide-in 0.3s ease;
      }

      @keyframes spiq-slide-in {
        from {
          opacity: 0;
          transform: translateY(${position.includes('top') ? '-20px' : '20px'});
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Header */
      #${WIDGET_ID}-header {
        padding: 16px;
        background: var(--spiq-primary);
        color: var(--spiq-contrast);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      #${WIDGET_ID}-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #${WIDGET_ID}-header-info {
        flex: 1;
      }

      #${WIDGET_ID}-header-title {
        font-weight: 600;
        font-size: 16px;
        margin: 0;
      }

      #${WIDGET_ID}-header-status {
        font-size: 12px;
        opacity: 0.8;
      }

      #${WIDGET_ID}-header-close {
        background: none;
        border: none;
        color: var(--spiq-contrast);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      #${WIDGET_ID}-header-close:hover {
        opacity: 1;
      }

      /* Messages */
      #${WIDGET_ID}-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .${WIDGET_ID}-message {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 16px;
        word-wrap: break-word;
      }

      .${WIDGET_ID}-message.user {
        align-self: flex-end;
        background: var(--spiq-primary);
        color: var(--spiq-contrast);
        border-bottom-right-radius: 4px;
      }

      .${WIDGET_ID}-message.assistant {
        align-self: flex-start;
        background: var(--spiq-bg-secondary);
        color: var(--spiq-text);
        border-bottom-left-radius: 4px;
      }

      .${WIDGET_ID}-message.system {
        align-self: center;
        background: transparent;
        color: var(--spiq-text-secondary);
        font-size: 12px;
        padding: 4px 8px;
      }

      .${WIDGET_ID}-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .${WIDGET_ID}-typing-dot {
        width: 8px;
        height: 8px;
        background: var(--spiq-text-secondary);
        border-radius: 50%;
        animation: spiq-typing 1.4s infinite ease-in-out;
      }

      .${WIDGET_ID}-typing-dot:nth-child(1) { animation-delay: 0s; }
      .${WIDGET_ID}-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .${WIDGET_ID}-typing-dot:nth-child(3) { animation-delay: 0.4s; }

      @keyframes spiq-typing {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40% { transform: scale(1); opacity: 1; }
      }

      /* Input Area */
      #${WIDGET_ID}-input-area {
        padding: 12px 16px;
        border-top: 1px solid var(--spiq-border);
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      #${WIDGET_ID}-input {
        flex: 1;
        border: 1px solid var(--spiq-border);
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        background: var(--spiq-bg);
        color: var(--spiq-text);
        resize: none;
        max-height: 100px;
        font-family: inherit;
      }

      #${WIDGET_ID}-input:focus {
        border-color: var(--spiq-primary);
      }

      #${WIDGET_ID}-input::placeholder {
        color: var(--spiq-text-secondary);
      }

      #${WIDGET_ID}-send {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--spiq-primary);
        color: var(--spiq-contrast);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        flex-shrink: 0;
      }

      #${WIDGET_ID}-send:hover:not(:disabled) {
        background: var(--spiq-primary-hover);
      }

      #${WIDGET_ID}-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      #${WIDGET_ID}-send svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
      }

      /* Branding */
      #${WIDGET_ID}-branding {
        padding: 8px;
        text-align: center;
        font-size: 11px;
        color: var(--spiq-text-secondary);
        border-top: 1px solid var(--spiq-border);
      }

      #${WIDGET_ID}-branding a {
        color: var(--spiq-primary);
        text-decoration: none;
      }

      #${WIDGET_ID}-branding a:hover {
        text-decoration: underline;
      }

      /* Suggested Queries */
      .${WIDGET_ID}-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 16px 12px;
      }

      .${WIDGET_ID}-suggestion {
        background: var(--spiq-bg-secondary);
        border: 1px solid var(--spiq-border);
        border-radius: 16px;
        padding: 6px 12px;
        font-size: 12px;
        color: var(--spiq-text);
        cursor: pointer;
        transition: all 0.2s;
      }

      .${WIDGET_ID}-suggestion:hover {
        background: var(--spiq-primary);
        color: var(--spiq-contrast);
        border-color: var(--spiq-primary);
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        #${WIDGET_ID}-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 100px);
          max-height: none;
          ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        }
      }
    `;

    const style = document.createElement('style');
    style.id = `${WIDGET_ID}-styles`;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ============================================
  // Utility Functions
  // ============================================

  function getContrastColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  function adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ============================================
  // Widget Class
  // ============================================

  class SmartPromptIQWidget {
    constructor(config) {
      this.config = config;
      this.isOpen = false;
      this.isLoading = false;
      this.sessionId = this.getOrCreateSessionId();
      this.messages = [];
      this.agentInfo = null;

      this.init();
    }

    getOrCreateSessionId() {
      const storageKey = `spiq_session_${this.config.agent}`;
      let sessionId = localStorage.getItem(storageKey);
      if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(storageKey, sessionId);
      }
      return sessionId;
    }

    async init() {
      // Inject styles
      injectStyles(this.config);

      // Create widget DOM
      this.createWidget();

      // Fetch agent info
      await this.fetchAgentInfo();

      // Bind events
      this.bindEvents();
    }

    createWidget() {
      // Container
      const container = document.createElement('div');
      container.id = `${WIDGET_ID}-container`;

      // Chat bubble
      const bubble = document.createElement('button');
      bubble.id = `${WIDGET_ID}-bubble`;
      bubble.setAttribute('aria-label', 'Open chat');
      bubble.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      `;

      // Chat window
      const window = document.createElement('div');
      window.id = `${WIDGET_ID}-window`;
      window.innerHTML = `
        <div id="${WIDGET_ID}-header">
          <div id="${WIDGET_ID}-header-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div id="${WIDGET_ID}-header-info">
            <h3 id="${WIDGET_ID}-header-title">AI Assistant</h3>
            <div id="${WIDGET_ID}-header-status">Online</div>
          </div>
          <button id="${WIDGET_ID}-header-close" aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div id="${WIDGET_ID}-messages"></div>
        <div class="${WIDGET_ID}-suggestions" id="${WIDGET_ID}-suggestions"></div>
        <div id="${WIDGET_ID}-input-area">
          <textarea
            id="${WIDGET_ID}-input"
            placeholder="${escapeHtml(this.config.placeholder)}"
            rows="1"
            aria-label="Message input"
          ></textarea>
          <button id="${WIDGET_ID}-send" aria-label="Send message">
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div id="${WIDGET_ID}-branding">
          Powered by <a href="https://smartpromptiq.com" target="_blank" rel="noopener">SmartPromptIQ</a>
        </div>
      `;

      container.appendChild(bubble);
      container.appendChild(window);
      document.body.appendChild(container);

      // Store references
      this.container = container;
      this.bubble = bubble;
      this.window = window;
      this.messagesContainer = document.getElementById(`${WIDGET_ID}-messages`);
      this.suggestionsContainer = document.getElementById(`${WIDGET_ID}-suggestions`);
      this.input = document.getElementById(`${WIDGET_ID}-input`);
      this.sendButton = document.getElementById(`${WIDGET_ID}-send`);
    }

    async fetchAgentInfo() {
      try {
        const response = await fetch(`${API_BASE_URL}/agent`, {
          method: 'GET',
          headers: {
            'X-API-Key': this.config.apiKey
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            this.agentInfo = data.data;
            this.updateAgentUI();
          }
        }
      } catch (error) {
        console.error('SmartPromptIQ: Failed to fetch agent info', error);
      }
    }

    updateAgentUI() {
      if (!this.agentInfo) return;

      // Update header
      const title = document.getElementById(`${WIDGET_ID}-header-title`);
      if (title) {
        title.textContent = this.agentInfo.name || 'AI Assistant';
      }

      // Add welcome message
      if (this.messages.length === 0 && this.agentInfo.welcome_message) {
        this.addMessage('assistant', this.agentInfo.welcome_message);
      }

      // Add suggested queries
      if (this.agentInfo.suggested_queries && this.agentInfo.suggested_queries.length > 0) {
        this.renderSuggestions(this.agentInfo.suggested_queries);
      }
    }

    renderSuggestions(suggestions) {
      this.suggestionsContainer.innerHTML = suggestions.map(q =>
        `<button class="${WIDGET_ID}-suggestion">${escapeHtml(q)}</button>`
      ).join('');
    }

    bindEvents() {
      // Toggle chat window
      this.bubble.addEventListener('click', () => this.toggle());
      document.getElementById(`${WIDGET_ID}-header-close`).addEventListener('click', () => this.close());

      // Send message
      this.sendButton.addEventListener('click', () => this.sendMessage());
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      this.input.addEventListener('input', () => {
        this.input.style.height = 'auto';
        this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
      });

      // Suggestion clicks
      this.suggestionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains(`${WIDGET_ID}-suggestion`)) {
          this.input.value = e.target.textContent;
          this.sendMessage();
        }
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isOpen = true;
      this.window.classList.add('open');
      this.bubble.setAttribute('aria-expanded', 'true');
      this.input.focus();

      // Remove unread indicator
      this.bubble.classList.remove('has-unread');
    }

    close() {
      this.isOpen = false;
      this.window.classList.remove('open');
      this.bubble.setAttribute('aria-expanded', 'false');
    }

    addMessage(role, content) {
      const message = {
        id: Date.now(),
        role,
        content,
        timestamp: new Date()
      };
      this.messages.push(message);

      const messageEl = document.createElement('div');
      messageEl.className = `${WIDGET_ID}-message ${role}`;
      messageEl.innerHTML = this.formatMessage(content);
      this.messagesContainer.appendChild(messageEl);
      this.scrollToBottom();

      // Hide suggestions after first user message
      if (role === 'user') {
        this.suggestionsContainer.style.display = 'none';
      }

      return message;
    }

    formatMessage(content) {
      // Basic markdown-like formatting
      let formatted = escapeHtml(content);

      // Bold
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Italic
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Line breaks
      formatted = formatted.replace(/\n/g, '<br>');

      return formatted;
    }

    showTyping() {
      const typingEl = document.createElement('div');
      typingEl.id = `${WIDGET_ID}-typing`;
      typingEl.className = `${WIDGET_ID}-message assistant ${WIDGET_ID}-typing`;
      typingEl.innerHTML = `
        <div class="${WIDGET_ID}-typing-dot"></div>
        <div class="${WIDGET_ID}-typing-dot"></div>
        <div class="${WIDGET_ID}-typing-dot"></div>
      `;
      this.messagesContainer.appendChild(typingEl);
      this.scrollToBottom();
    }

    hideTyping() {
      const typingEl = document.getElementById(`${WIDGET_ID}-typing`);
      if (typingEl) {
        typingEl.remove();
      }
    }

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async sendMessage() {
      const content = this.input.value.trim();
      if (!content || this.isLoading) return;

      // Disable input
      this.isLoading = true;
      this.input.value = '';
      this.input.style.height = 'auto';
      this.sendButton.disabled = true;

      // Add user message
      this.addMessage('user', content);

      // Show typing indicator
      this.showTyping();

      try {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
          },
          body: JSON.stringify({
            message: content,
            session_id: this.sessionId,
            context: {
              page_url: window.location.href,
              page_title: document.title,
              referrer: document.referrer
            }
          })
        });

        const data = await response.json();

        this.hideTyping();

        if (data.success) {
          this.addMessage('assistant', data.data.message);
        } else {
          this.addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
          console.error('SmartPromptIQ: API error', data.error);
        }
      } catch (error) {
        this.hideTyping();
        this.addMessage('assistant', 'I apologize, but I\'m having trouble connecting. Please check your internet connection and try again.');
        console.error('SmartPromptIQ: Network error', error);
      } finally {
        this.isLoading = false;
        this.sendButton.disabled = false;
        this.input.focus();
      }
    }

    // Public API
    destroy() {
      this.container.remove();
      const styles = document.getElementById(`${WIDGET_ID}-styles`);
      if (styles) styles.remove();
    }

    setTheme(theme) {
      this.config.theme = theme;
      // Re-inject styles
      const oldStyles = document.getElementById(`${WIDGET_ID}-styles`);
      if (oldStyles) oldStyles.remove();
      injectStyles(this.config);
    }
  }

  // ============================================
  // Initialize Widget
  // ============================================

  const config = getConfig();

  if (!config) {
    console.error('SmartPromptIQ: Widget configuration not found');
    return;
  }

  if (!config.apiKey) {
    console.error('SmartPromptIQ: API key is required. Add data-api-key attribute to the script tag.');
    return;
  }

  // Create and expose widget instance
  window.SmartPromptIQ = new SmartPromptIQWidget(config);

  console.log(`SmartPromptIQ Widget v${WIDGET_VERSION} initialized`);

})();
