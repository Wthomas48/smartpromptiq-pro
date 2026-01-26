// SmartPromptIQ Chrome Extension - Popup Script
// Enhanced version with template browser, better API integration, and improved UX

// Configuration
const CONFIG = {
  WEBSITE_URL: 'https://smartpromptiq.com',
  DEV_WEBSITE_URL: 'http://localhost:5173'
};

// State
let state = {
  isAuthenticated: false,
  user: null,
  selectedCategory: 'marketing',
  recentPrompts: [],
  credits: 0,
  currentView: 'main', // 'main', 'templates', 'library', 'settings'
  templates: [],
  settings: {
    autoInsert: true,
    showNotifications: true,
    darkMode: true,
    defaultCategory: 'marketing'
  }
};

// Category icons mapping
const CATEGORY_ICONS = {
  marketing: '📣',
  development: '💻',
  writing: '✍️',
  business: '💼',
  education: '🎓',
  creative: '🎨'
};

// DOM Elements
const elements = {};

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  cacheElements();
  await loadState();
  setupEventListeners();
  await checkAuthentication();
  await loadPendingContext();
  renderUI();
}

// Cache DOM elements
function cacheElements() {
  elements.authSection = document.getElementById('authSection');
  elements.mainContent = document.getElementById('mainContent');
  elements.connectionStatus = document.getElementById('connectionStatus');
  elements.settingsBtn = document.getElementById('settingsBtn');
  elements.settingsPanel = document.getElementById('settingsPanel');
  elements.closeSettings = document.getElementById('closeSettings');
  elements.signInBtn = document.getElementById('signInBtn');
  elements.signUpLink = document.getElementById('signUpLink');
  elements.generateBtn = document.getElementById('generateBtn');
  elements.libraryBtn = document.getElementById('libraryBtn');
  elements.categoryGrid = document.getElementById('categoryGrid');
  elements.contextInput = document.getElementById('contextInput');
  elements.usePageContext = document.getElementById('usePageContext');
  elements.generatePromptBtn = document.getElementById('generatePromptBtn');
  elements.recentList = document.getElementById('recentList');
  elements.resultSection = document.getElementById('resultSection');
  elements.resultContent = document.getElementById('resultContent');
  elements.copyBtn = document.getElementById('copyBtn');
  elements.insertBtn = document.getElementById('insertBtn');
  elements.saveBtn = document.getElementById('saveBtn');
  elements.regenerateBtn = document.getElementById('regenerateBtn');
  elements.loadingOverlay = document.getElementById('loadingOverlay');
  elements.toast = document.getElementById('toast');
  elements.toastMessage = document.getElementById('toastMessage');
  elements.promptCount = document.getElementById('promptCount');
  elements.creditsLeft = document.getElementById('creditsLeft');
  elements.upgradeBtn = document.getElementById('upgradeBtn');
  elements.viewAllBtn = document.getElementById('viewAllBtn');
  elements.logoutBtn = document.getElementById('logoutBtn');
}

// Load state from storage
async function loadState() {
  try {
    const stored = await chrome.storage.local.get([
      'smartpromptiq_state',
      'smartpromptiq_settings',
      'smartpromptiq_recent_prompts'
    ]);

    if (stored.smartpromptiq_state) {
      state = { ...state, ...stored.smartpromptiq_state };
    }
    if (stored.smartpromptiq_settings) {
      state.settings = { ...state.settings, ...stored.smartpromptiq_settings };
      state.selectedCategory = state.settings.defaultCategory || 'marketing';
    }
    if (stored.smartpromptiq_recent_prompts) {
      state.recentPrompts = stored.smartpromptiq_recent_prompts;
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

// Save state to storage
async function saveState() {
  try {
    await chrome.storage.local.set({
      smartpromptiq_state: {
        selectedCategory: state.selectedCategory,
        currentView: state.currentView
      }
    });
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// Load pending context from context menu
async function loadPendingContext() {
  try {
    const result = await chrome.storage.local.get(['pending_context']);
    if (result.pending_context) {
      elements.contextInput.value = result.pending_context;
      await chrome.storage.local.remove(['pending_context']);
    }
  } catch (error) {
    console.error('Error loading pending context:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Settings
  elements.settingsBtn.addEventListener('click', () => toggleSettings(true));
  elements.closeSettings.addEventListener('click', () => toggleSettings(false));

  // Auth
  elements.signInBtn.addEventListener('click', handleSignIn);
  elements.signUpLink.addEventListener('click', handleSignUp);
  elements.logoutBtn.addEventListener('click', handleLogout);

  // Quick Actions
  elements.generateBtn.addEventListener('click', () => {
    elements.contextInput.focus();
    elements.contextInput.scrollIntoView({ behavior: 'smooth' });
  });
  elements.libraryBtn.addEventListener('click', openLibrary);

  // Category Selection
  elements.categoryGrid.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => selectCategory(btn.dataset.category));
  });

  // Context
  elements.usePageContext.addEventListener('click', getPageContext);

  // Generate
  elements.generatePromptBtn.addEventListener('click', generatePrompt);

  // Allow Enter to generate (with Ctrl/Cmd)
  elements.contextInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generatePrompt();
    }
  });

  // Result Actions
  elements.copyBtn.addEventListener('click', copyToClipboard);
  elements.insertBtn.addEventListener('click', insertIntoPage);
  elements.saveBtn.addEventListener('click', saveToLibrary);
  elements.regenerateBtn.addEventListener('click', generatePrompt);

  // Footer
  elements.upgradeBtn.addEventListener('click', openUpgrade);
  elements.viewAllBtn.addEventListener('click', openLibrary);

  // Settings toggles
  setupSettingsListeners();
}

// Setup settings event listeners
function setupSettingsListeners() {
  document.getElementById('autoInsert')?.addEventListener('change', (e) => {
    state.settings.autoInsert = e.target.checked;
    saveSettings();
  });
  document.getElementById('showNotifications')?.addEventListener('change', (e) => {
    state.settings.showNotifications = e.target.checked;
    saveSettings();
  });
  document.getElementById('darkMode')?.addEventListener('change', (e) => {
    state.settings.darkMode = e.target.checked;
    saveSettings();
  });
  document.getElementById('defaultCategory')?.addEventListener('change', (e) => {
    state.settings.defaultCategory = e.target.value;
    saveSettings();
  });
}

// Save settings
async function saveSettings() {
  try {
    await chrome.storage.local.set({ smartpromptiq_settings: state.settings });
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: state.settings
    }).catch(() => {});
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Check authentication
async function checkAuthentication() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });

    if (response?.authenticated) {
      state.isAuthenticated = true;
      state.user = response.user;
      state.credits = response.user?.tokenBalance || response.user?.tokens || 0;
      updateConnectionStatus(true);
    } else {
      state.isAuthenticated = false;
      state.user = null;
      updateConnectionStatus(false);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    updateConnectionStatus(false);
  }

  renderUI();
}

// Render UI based on state
function renderUI() {
  // Show/hide sections based on auth
  if (state.isAuthenticated) {
    elements.authSection.style.display = 'none';
    elements.mainContent.style.display = 'block';
  } else {
    elements.authSection.style.display = 'block';
    elements.mainContent.style.display = 'none';
  }

  // Update stats
  elements.promptCount.textContent = state.recentPrompts.length;
  elements.creditsLeft.textContent = state.credits;

  // Update category selection
  elements.categoryGrid.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === state.selectedCategory);
  });

  // Update settings UI
  const autoInsertEl = document.getElementById('autoInsert');
  const showNotificationsEl = document.getElementById('showNotifications');
  const darkModeEl = document.getElementById('darkMode');
  const defaultCategoryEl = document.getElementById('defaultCategory');

  if (autoInsertEl) autoInsertEl.checked = state.settings.autoInsert;
  if (showNotificationsEl) showNotificationsEl.checked = state.settings.showNotifications;
  if (darkModeEl) darkModeEl.checked = state.settings.darkMode;
  if (defaultCategoryEl) defaultCategoryEl.value = state.settings.defaultCategory;

  // Render recent prompts
  renderRecentPrompts();
}

// Render recent prompts
function renderRecentPrompts() {
  if (state.recentPrompts.length === 0) {
    elements.recentList.innerHTML = `
      <div class="recent-item empty" style="justify-content: center; color: var(--text-muted); cursor: default;">
        <span>No recent prompts yet</span>
      </div>
    `;
    return;
  }

  elements.recentList.innerHTML = state.recentPrompts.slice(0, 3).map((prompt, index) => `
    <div class="recent-item" data-index="${index}">
      <div class="recent-icon">${CATEGORY_ICONS[prompt.category] || '📝'}</div>
      <div class="recent-info">
        <div class="recent-title">${escapeHtml(prompt.title || prompt.content?.slice(0, 40) || 'Untitled')}...</div>
        <div class="recent-meta">${prompt.category || 'general'} • ${formatTimeAgo(prompt.timestamp)}</div>
      </div>
      <button class="recent-action" title="Use this prompt">📋</button>
    </div>
  `).join('');

  // Add click handlers
  elements.recentList.querySelectorAll('.recent-item:not(.empty)').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      const prompt = state.recentPrompts[index];
      if (prompt) {
        showResult(prompt.content);
      }
    });
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format time ago
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Recently';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Update connection status
function updateConnectionStatus(connected) {
  const statusDot = elements.connectionStatus.querySelector('.status-dot');
  const statusText = elements.connectionStatus.querySelector('.status-text');

  if (connected) {
    statusDot.style.background = 'var(--success)';
    statusText.textContent = 'Connected';
    elements.connectionStatus.style.color = 'var(--success)';
  } else {
    statusDot.style.background = 'var(--error)';
    statusText.textContent = 'Offline';
    elements.connectionStatus.style.color = 'var(--error)';
  }
}

// Toggle settings panel
function toggleSettings(show) {
  elements.settingsPanel.style.display = show ? 'flex' : 'none';
}

// Handle sign in
function handleSignIn() {
  chrome.runtime.sendMessage({ type: 'OPEN_SIGNIN' });
}

// Handle sign up
function handleSignUp(e) {
  e.preventDefault();
  chrome.tabs.create({ url: `${CONFIG.WEBSITE_URL}/signin?mode=signup` });
}

// Handle logout
async function handleLogout() {
  try {
    await chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' });
    state.isAuthenticated = false;
    state.user = null;
    state.credits = 0;
    renderUI();
    toggleSettings(false);
    showToast('Signed out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Failed to sign out', 'error');
  }
}

// Select category
function selectCategory(category) {
  state.selectedCategory = category;
  saveState();
  renderUI();
}

// Get page context
async function getPageContext() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        // Get page context
        const title = document.title;
        const meta = document.querySelector('meta[name="description"]')?.content || '';
        const h1 = document.querySelector('h1')?.textContent || '';
        const url = window.location.href;
        const selectedText = window.getSelection().toString().trim();

        // Detect AI platform
        let platform = 'unknown';
        if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) platform = 'ChatGPT';
        else if (url.includes('claude.ai')) platform = 'Claude';
        else if (url.includes('gemini.google.com')) platform = 'Gemini';
        else if (url.includes('bing.com/chat') || url.includes('copilot.microsoft.com')) platform = 'Copilot';
        else if (url.includes('poe.com')) platform = 'Poe';

        return { title, meta, h1, url, platform, selectedText };
      }
    });

    if (result && result[0]?.result) {
      const context = result[0].result;
      let contextText = '';

      // If there's selected text, use that
      if (context.selectedText) {
        contextText = context.selectedText;
        showToast('Selected text captured');
      } else {
        if (context.platform !== 'unknown') {
          contextText = `Platform: ${context.platform}\n`;
        }
        if (context.title) {
          contextText += `Page: ${context.title}\n`;
        }
        if (context.meta) {
          contextText += `Context: ${context.meta}`;
        }
        showToast('Page context loaded');
      }

      elements.contextInput.value = contextText.trim() || 'No context detected';
    }
  } catch (error) {
    console.error('Error getting page context:', error);
    showToast('Could not get page context', 'error');
  }
}

// Generate prompt
async function generatePrompt() {
  const context = elements.contextInput.value.trim();

  if (!context) {
    showToast('Please enter what you need', 'warning');
    elements.contextInput.focus();
    return;
  }

  showLoading(true);

  try {
    if (state.isAuthenticated) {
      // Use real API via background script
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_PROMPT',
        data: {
          category: state.selectedCategory,
          context: context,
          type: 'prompt'
        }
      });

      if (response?.success) {
        const generatedPrompt = response.data?.prompt || response.data?.data?.prompt || response.data?.content;
        showResult(generatedPrompt);
        addToRecent(generatedPrompt);

        // Update credits
        if (response.data?.tokensRemaining !== undefined) {
          state.credits = response.data.tokensRemaining;
        } else {
          state.credits = Math.max(0, state.credits - 1);
        }

        renderUI();

        // Auto-insert if enabled
        if (state.settings.autoInsert) {
          await insertIntoPage();
        }
      } else {
        throw new Error(response?.error || 'Generation failed');
      }
    } else {
      // Demo mode - generate sample prompt
      const demoPrompt = generateDemoPrompt(state.selectedCategory, context);
      showResult(demoPrompt);
      addToRecent(demoPrompt);
      showToast('Demo mode - Sign in for full access');
    }
  } catch (error) {
    console.error('Error generating prompt:', error);

    // Check if it's a token error
    if (error.message?.includes('token') || error.message?.includes('credit')) {
      showToast('No tokens remaining. Upgrade your plan!', 'error');
    } else {
      // Fallback to demo
      const demoPrompt = generateDemoPrompt(state.selectedCategory, context);
      showResult(demoPrompt);
      addToRecent(demoPrompt);
      showToast('Using offline mode', 'warning');
    }
  } finally {
    showLoading(false);
  }
}

// Generate demo prompt (offline fallback)
function generateDemoPrompt(category, context) {
  const templates = {
    marketing: `You are an expert marketing strategist. I need you to help me with the following:

**Context:** ${context}

**Your Task:**
1. Analyze the target audience and their pain points
2. Develop 3 compelling value propositions
3. Create attention-grabbing headlines (5 variations)
4. Suggest a content marketing strategy
5. Recommend key messaging pillars

Please provide actionable, specific recommendations that I can implement immediately.`,

    development: `You are a senior software architect. Help me with the following technical challenge:

**Context:** ${context}

**Your Task:**
1. Analyze the requirements and constraints
2. Propose an optimal architecture/solution
3. Identify potential challenges and mitigations
4. Provide code structure recommendations
5. Suggest best practices and design patterns

Include specific implementation details where applicable.`,

    writing: `You are a professional content writer and editor. Help me with:

**Context:** ${context}

**Your Task:**
1. Analyze the purpose and target audience
2. Create an engaging outline/structure
3. Write compelling opening hooks (3 variations)
4. Suggest tone and style guidelines
5. Provide tips for maintaining reader engagement

Focus on clarity, engagement, and achieving the content goals.`,

    business: `You are a business strategy consultant. Assist me with:

**Context:** ${context}

**Your Task:**
1. Analyze the business situation and objectives
2. Identify key opportunities and risks
3. Develop strategic recommendations
4. Create an action plan with priorities
5. Define success metrics and KPIs

Provide practical, data-driven insights.`,

    education: `You are an expert instructional designer. Help me with:

**Context:** ${context}

**Your Task:**
1. Define clear learning objectives
2. Structure the content for optimal learning
3. Suggest engaging activities and exercises
4. Create assessment strategies
5. Recommend resources and materials

Focus on learner engagement and knowledge retention.`,

    creative: `You are a creative director with expertise in ideation. Help me with:

**Context:** ${context}

**Your Task:**
1. Generate 10 unique creative concepts
2. Develop the most promising idea in detail
3. Suggest visual/aesthetic direction
4. Create a mood board description
5. Outline implementation steps

Push creative boundaries while staying aligned with objectives.`
  };

  return templates[category] || templates.marketing;
}

// Show result
function showResult(content) {
  elements.resultSection.style.display = 'block';
  elements.resultContent.textContent = content;
  elements.resultSection.scrollIntoView({ behavior: 'smooth' });
}

// Add to recent prompts
async function addToRecent(content) {
  const prompt = {
    id: Date.now(),
    content,
    category: state.selectedCategory,
    title: content.slice(0, 50),
    timestamp: Date.now()
  };

  state.recentPrompts.unshift(prompt);
  state.recentPrompts = state.recentPrompts.slice(0, 50); // Keep last 50

  try {
    await chrome.storage.local.set({
      smartpromptiq_recent_prompts: state.recentPrompts
    });
  } catch (error) {
    console.error('Failed to save recent prompts:', error);
  }
}

// Copy to clipboard
async function copyToClipboard() {
  const content = elements.resultContent.textContent;
  try {
    await navigator.clipboard.writeText(content);
    showToast('Copied to clipboard!');
  } catch (error) {
    console.error('Copy failed:', error);
    showToast('Copy failed', 'error');
  }
}

// Insert into page
async function insertIntoPage() {
  const content = elements.resultContent.textContent;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: (text) => {
        // Try to find an active text input or textarea
        const activeElement = document.activeElement;

        if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
          activeElement.value = text;
          activeElement.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }

        // Platform-specific selectors
        const selectorGroups = [
          // ChatGPT
          ['textarea[data-id="root"]', '#prompt-textarea', 'textarea[placeholder*="Message ChatGPT"]'],
          // Claude
          ['div[contenteditable="true"].ProseMirror', 'div.ProseMirror[contenteditable="true"]'],
          // Gemini
          ['rich-textarea div[contenteditable="true"]'],
          // Generic
          ['textarea[placeholder*="Message"]', 'textarea[placeholder*="message"]', 'div[contenteditable="true"]']
        ];

        for (const selectors of selectorGroups) {
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
              } else {
                element.innerHTML = text.replace(/\n/g, '<br>');
                element.dispatchEvent(new InputEvent('input', { bubbles: true }));
              }
              element.focus();
              return true;
            }
          }
        }

        return false;
      },
      args: [content]
    });

    showToast('Inserted into page!');
  } catch (error) {
    console.error('Insert failed:', error);
    // Fallback to clipboard
    await copyToClipboard();
    showToast('Copied - please paste manually');
  }
}

// Save to library
async function saveToLibrary() {
  const content = elements.resultContent.textContent;

  if (!state.isAuthenticated) {
    showToast('Sign in to save prompts');
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_PROMPT',
      data: {
        content,
        category: state.selectedCategory,
        title: content.slice(0, 50)
      }
    });

    if (response?.success) {
      showToast('Saved to library!');
    } else {
      throw new Error(response?.error || 'Save failed');
    }
  } catch (error) {
    console.error('Save failed:', error);
    showToast('Could not save - try again', 'error');
  }
}

// Open library
function openLibrary() {
  chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
}

// Open upgrade
function openUpgrade() {
  chrome.runtime.sendMessage({ type: 'OPEN_PRICING' });
}

// Show loading
function showLoading(show) {
  elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Show toast
function showToast(message, type = 'success') {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠'
  };

  const toastIcon = elements.toast.querySelector('.toast-icon');
  if (toastIcon) {
    toastIcon.textContent = icons[type] || icons.success;
  }

  elements.toastMessage.textContent = message;
  elements.toast.classList.add('show');

  // Update toast border color based on type
  const colors = {
    success: 'var(--success)',
    error: 'var(--error)',
    warning: 'var(--warning)'
  };
  elements.toast.style.borderColor = colors[type] || colors.success;

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_SUCCESS') {
    state.isAuthenticated = true;
    state.user = message.user;
    state.credits = message.user?.tokenBalance || message.user?.tokens || 0;
    renderUI();
    showToast('Signed in successfully!');
  }

  if (message.type === 'SETTINGS_UPDATED') {
    state.settings = { ...state.settings, ...message.settings };
    renderUI();
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.smartpromptiq_user) {
      const user = changes.smartpromptiq_user.newValue;
      if (user) {
        state.isAuthenticated = true;
        state.user = user;
        state.credits = user.tokenBalance || user.tokens || 0;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.credits = 0;
      }
      renderUI();
    }

    if (changes.smartpromptiq_recent_prompts) {
      state.recentPrompts = changes.smartpromptiq_recent_prompts.newValue || [];
      renderRecentPrompts();
    }
  }
});
