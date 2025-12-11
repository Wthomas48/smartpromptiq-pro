// SmartPromptIQ Chrome Extension - Popup Script

// Configuration
const CONFIG = {
  API_BASE_URL: 'https://smartpromptiq.com',
  DEV_API_URL: 'http://localhost:5001',
  WEBSITE_URL: 'https://smartpromptiq.com'
};

// Get API URL based on environment
function getApiUrl() {
  // Check if we're in development
  return CONFIG.DEV_API_URL; // Change to CONFIG.API_BASE_URL for production
}

// State
let state = {
  isAuthenticated: false,
  user: null,
  selectedCategory: 'marketing',
  recentPrompts: [],
  credits: 10,
  settings: {
    autoInsert: true,
    showNotifications: true,
    darkMode: true,
    defaultCategory: 'marketing'
  }
};

// DOM Elements
const elements = {
  authSection: document.getElementById('authSection'),
  mainContent: document.getElementById('mainContent'),
  connectionStatus: document.getElementById('connectionStatus'),
  settingsBtn: document.getElementById('settingsBtn'),
  settingsPanel: document.getElementById('settingsPanel'),
  closeSettings: document.getElementById('closeSettings'),
  signInBtn: document.getElementById('signInBtn'),
  signUpLink: document.getElementById('signUpLink'),
  generateBtn: document.getElementById('generateBtn'),
  libraryBtn: document.getElementById('libraryBtn'),
  categoryGrid: document.getElementById('categoryGrid'),
  contextInput: document.getElementById('contextInput'),
  usePageContext: document.getElementById('usePageContext'),
  generatePromptBtn: document.getElementById('generatePromptBtn'),
  recentList: document.getElementById('recentList'),
  resultSection: document.getElementById('resultSection'),
  resultContent: document.getElementById('resultContent'),
  copyBtn: document.getElementById('copyBtn'),
  insertBtn: document.getElementById('insertBtn'),
  saveBtn: document.getElementById('saveBtn'),
  regenerateBtn: document.getElementById('regenerateBtn'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  toast: document.getElementById('toast'),
  toastMessage: document.getElementById('toastMessage'),
  promptCount: document.getElementById('promptCount'),
  creditsLeft: document.getElementById('creditsLeft'),
  upgradeBtn: document.getElementById('upgradeBtn'),
  viewAllBtn: document.getElementById('viewAllBtn'),
  logoutBtn: document.getElementById('logoutBtn')
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadState();
  setupEventListeners();
  updateUI();
  await checkAuthentication();
}

// Load state from storage
async function loadState() {
  try {
    const stored = await chrome.storage.local.get(['smartpromptiq_state']);
    if (stored.smartpromptiq_state) {
      state = { ...state, ...stored.smartpromptiq_state };
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
}

// Save state to storage
async function saveState() {
  try {
    await chrome.storage.local.set({ smartpromptiq_state: state });
  } catch (error) {
    console.error('Error saving state:', error);
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
  elements.generateBtn.addEventListener('click', () => elements.contextInput.focus());
  elements.libraryBtn.addEventListener('click', openLibrary);

  // Category Selection
  elements.categoryGrid.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => selectCategory(btn.dataset.category));
  });

  // Context
  elements.usePageContext.addEventListener('click', getPageContext);

  // Generate
  elements.generatePromptBtn.addEventListener('click', generatePrompt);

  // Result Actions
  elements.copyBtn.addEventListener('click', copyToClipboard);
  elements.insertBtn.addEventListener('click', insertIntoPage);
  elements.saveBtn.addEventListener('click', saveToLibrary);
  elements.regenerateBtn.addEventListener('click', generatePrompt);

  // Footer
  elements.upgradeBtn.addEventListener('click', openUpgrade);
  elements.viewAllBtn.addEventListener('click', openLibrary);

  // Settings toggles
  document.getElementById('autoInsert').addEventListener('change', (e) => {
    state.settings.autoInsert = e.target.checked;
    saveState();
  });
  document.getElementById('showNotifications').addEventListener('change', (e) => {
    state.settings.showNotifications = e.target.checked;
    saveState();
  });
  document.getElementById('darkMode').addEventListener('change', (e) => {
    state.settings.darkMode = e.target.checked;
    saveState();
  });
  document.getElementById('defaultCategory').addEventListener('change', (e) => {
    state.settings.defaultCategory = e.target.value;
    saveState();
  });
}

// Check authentication
async function checkAuthentication() {
  try {
    const token = await chrome.storage.local.get(['smartpromptiq_token']);
    if (token.smartpromptiq_token) {
      // Verify token with backend
      const response = await fetch(`${getApiUrl()}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token.smartpromptiq_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        state.isAuthenticated = true;
        state.user = data.user || data.data?.user;
        await saveState();
      } else {
        await handleLogout();
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    updateConnectionStatus(false);
  }
  updateUI();
}

// Update UI based on state
function updateUI() {
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

  // Update settings
  document.getElementById('autoInsert').checked = state.settings.autoInsert;
  document.getElementById('showNotifications').checked = state.settings.showNotifications;
  document.getElementById('darkMode').checked = state.settings.darkMode;
  document.getElementById('defaultCategory').value = state.settings.defaultCategory;

  // Render recent prompts
  renderRecentPrompts();
}

// Render recent prompts
function renderRecentPrompts() {
  const categoryIcons = {
    marketing: '📣',
    development: '💻',
    writing: '✍️',
    business: '💼',
    education: '🎓',
    creative: '🎨'
  };

  if (state.recentPrompts.length === 0) {
    elements.recentList.innerHTML = `
      <div class="recent-item" style="justify-content: center; color: var(--text-muted);">
        <span>No recent prompts yet</span>
      </div>
    `;
    return;
  }

  elements.recentList.innerHTML = state.recentPrompts.slice(0, 3).map((prompt, index) => `
    <div class="recent-item" data-index="${index}">
      <div class="recent-icon">${categoryIcons[prompt.category] || '📝'}</div>
      <div class="recent-info">
        <div class="recent-title">${prompt.title || prompt.content.slice(0, 40)}...</div>
        <div class="recent-meta">${prompt.category} • ${formatTimeAgo(prompt.timestamp)}</div>
      </div>
      <button class="recent-action" title="Use this prompt">📋</button>
    </div>
  `).join('');

  // Add click handlers
  elements.recentList.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      const prompt = state.recentPrompts[index];
      showResult(prompt.content);
    });
  });
}

// Format time ago
function formatTimeAgo(timestamp) {
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
  chrome.tabs.create({ url: `${CONFIG.WEBSITE_URL}/signin` });
}

// Handle sign up
function handleSignUp(e) {
  e.preventDefault();
  chrome.tabs.create({ url: `${CONFIG.WEBSITE_URL}/signin?mode=signup` });
}

// Handle logout
async function handleLogout() {
  await chrome.storage.local.remove(['smartpromptiq_token']);
  state.isAuthenticated = false;
  state.user = null;
  await saveState();
  updateUI();
  toggleSettings(false);
  showToast('Signed out successfully');
}

// Select category
function selectCategory(category) {
  state.selectedCategory = category;
  saveState();
  updateUI();
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

        // Detect AI platform
        let platform = 'unknown';
        if (url.includes('chat.openai.com')) platform = 'ChatGPT';
        else if (url.includes('claude.ai')) platform = 'Claude';
        else if (url.includes('gemini.google.com')) platform = 'Gemini';
        else if (url.includes('bing.com/chat')) platform = 'Bing';
        else if (url.includes('poe.com')) platform = 'Poe';

        return { title, meta, h1, url, platform };
      }
    });

    if (result && result[0]?.result) {
      const context = result[0].result;
      let contextText = '';

      if (context.platform !== 'unknown') {
        contextText = `Platform: ${context.platform}\n`;
      }
      if (context.title) {
        contextText += `Page: ${context.title}\n`;
      }
      if (context.meta) {
        contextText += `Context: ${context.meta}`;
      }

      elements.contextInput.value = contextText.trim() || 'No context detected';
      showToast('Page context loaded');
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
    // Check if authenticated
    const tokenData = await chrome.storage.local.get(['smartpromptiq_token']);

    if (tokenData.smartpromptiq_token) {
      // Use real API
      const response = await fetch(`${getApiUrl()}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.smartpromptiq_token}`
        },
        body: JSON.stringify({
          category: state.selectedCategory,
          context: context,
          type: 'prompt'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedPrompt = data.prompt || data.data?.prompt || data.content;
        showResult(generatedPrompt);
        addToRecent(generatedPrompt);
        state.credits = Math.max(0, state.credits - 1);
        await saveState();
        updateUI();
      } else {
        throw new Error('Generation failed');
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
    // Fallback to demo
    const demoPrompt = generateDemoPrompt(state.selectedCategory, context);
    showResult(demoPrompt);
    addToRecent(demoPrompt);
  } finally {
    showLoading(false);
  }
}

// Generate demo prompt
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
function addToRecent(content) {
  const prompt = {
    content,
    category: state.selectedCategory,
    title: content.slice(0, 50),
    timestamp: Date.now()
  };

  state.recentPrompts.unshift(prompt);
  state.recentPrompts = state.recentPrompts.slice(0, 10); // Keep last 10
  saveState();
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

        // Try common AI chat input selectors
        const selectors = [
          'textarea[data-id="root"]', // ChatGPT
          'div[contenteditable="true"]', // Claude, others
          'textarea[placeholder*="Message"]',
          'textarea[placeholder*="message"]',
          '#prompt-textarea',
          '.ProseMirror'
        ];

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
              element.value = text;
              element.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              element.textContent = text;
              element.dispatchEvent(new InputEvent('input', { bubbles: true }));
            }
            return true;
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

  try {
    const tokenData = await chrome.storage.local.get(['smartpromptiq_token']);

    if (tokenData.smartpromptiq_token) {
      const response = await fetch(`${getApiUrl()}/api/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.smartpromptiq_token}`
        },
        body: JSON.stringify({
          content,
          category: state.selectedCategory,
          title: content.slice(0, 50)
        })
      });

      if (response.ok) {
        showToast('Saved to library!');
      } else {
        throw new Error('Save failed');
      }
    } else {
      showToast('Sign in to save prompts');
    }
  } catch (error) {
    console.error('Save failed:', error);
    showToast('Could not save - try again', 'error');
  }
}

// Open library
function openLibrary() {
  chrome.tabs.create({ url: `${CONFIG.WEBSITE_URL}/dashboard` });
}

// Open upgrade
function openUpgrade() {
  chrome.tabs.create({ url: `${CONFIG.WEBSITE_URL}/pricing` });
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

  elements.toast.querySelector('.toast-icon').textContent = icons[type] || icons.success;
  elements.toastMessage.textContent = message;
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AUTH_SUCCESS') {
    state.isAuthenticated = true;
    state.user = message.user;
    saveState();
    updateUI();
    showToast('Signed in successfully!');
  }
});
