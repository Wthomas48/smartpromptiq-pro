// SmartPromptIQ Chrome Extension - Options Page Script

// DOM Elements
const elements = {
  // Auth states
  notLoggedIn: document.getElementById('notLoggedIn'),
  loggedIn: document.getElementById('loggedIn'),
  signInBtn: document.getElementById('signInBtn'),
  signUpLink: document.getElementById('signUpLink'),
  signOutBtn: document.getElementById('signOutBtn'),

  // User info
  userAvatar: document.getElementById('userAvatar'),
  userName: document.getElementById('userName'),
  userEmail: document.getElementById('userEmail'),
  userPlan: document.getElementById('userPlan'),

  // Stats
  tokensLeft: document.getElementById('tokensLeft'),
  promptsGenerated: document.getElementById('promptsGenerated'),
  promptsSaved: document.getElementById('promptsSaved'),

  // Account actions
  openDashboardBtn: document.getElementById('openDashboardBtn'),
  upgradePlanBtn: document.getElementById('upgradePlanBtn'),

  // Settings
  darkMode: document.getElementById('darkMode'),
  showNotifications: document.getElementById('showNotifications'),
  defaultCategory: document.getElementById('defaultCategory'),
  showFloatingButton: document.getElementById('showFloatingButton'),
  autoInsert: document.getElementById('autoInsert'),
  keyboardShortcuts: document.getElementById('keyboardShortcuts'),

  // Data & Privacy
  clearCacheBtn: document.getElementById('clearCacheBtn'),
  clearRecentBtn: document.getElementById('clearRecentBtn'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importFile: document.getElementById('importFile'),

  // Developer
  devOptionsToggle: document.getElementById('devOptionsToggle'),
  devOptionsContent: document.getElementById('devOptionsContent'),
  environment: document.getElementById('environment'),
  currentApiUrl: document.getElementById('currentApiUrl'),
  debugMode: document.getElementById('debugMode'),

  // Toast
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toastIcon'),
  toastMessage: document.getElementById('toastMessage')
};

// State
let currentUser = null;
let settings = {};

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadEnvironment();
  await loadSettings();
  await checkAuth();
  setupEventListeners();
  updateUI();
}

// Load environment setting
async function loadEnvironment() {
  try {
    const result = await chrome.storage.local.get(['smartpromptiq_env']);
    const env = result.smartpromptiq_env || 'production';
    elements.environment.value = env;
    updateApiUrlDisplay(env);

    // Update CONFIG if available
    if (typeof CONFIG !== 'undefined') {
      CONFIG.CURRENT_ENV = env;
    }
  } catch (error) {
    console.error('Failed to load environment:', error);
  }
}

// Update API URL display
function updateApiUrlDisplay(env) {
  const urls = {
    production: 'https://smartpromptiq.com',
    development: 'http://localhost:5001'
  };
  elements.currentApiUrl.textContent = urls[env] || urls.production;
}

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['smartpromptiq_settings']);
    settings = {
      darkMode: true,
      showNotifications: true,
      defaultCategory: 'marketing',
      showFloatingButton: true,
      autoInsert: true,
      keyboardShortcuts: true,
      debugMode: false,
      ...result.smartpromptiq_settings
    };

    // Update UI with loaded settings
    elements.darkMode.checked = settings.darkMode;
    elements.showNotifications.checked = settings.showNotifications;
    elements.defaultCategory.value = settings.defaultCategory;
    elements.showFloatingButton.checked = settings.showFloatingButton;
    elements.autoInsert.checked = settings.autoInsert;
    elements.keyboardShortcuts.checked = settings.keyboardShortcuts;
    elements.debugMode.checked = settings.debugMode;
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    await chrome.storage.local.set({ smartpromptiq_settings: settings });
    showToast('Settings saved!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showToast('Failed to save settings', 'error');
  }
}

// Check authentication status
async function checkAuth() {
  try {
    const result = await chrome.storage.local.get(['smartpromptiq_token', 'smartpromptiq_user']);
    const token = result.smartpromptiq_token;

    if (!token) {
      currentUser = null;
      return;
    }

    // Try to get fresh user data
    const env = elements.environment.value || 'production';
    const apiUrl = env === 'development' ? 'http://localhost:5001' : 'https://smartpromptiq.com';

    const response = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user || data.data?.user || result.smartpromptiq_user;
      await chrome.storage.local.set({ smartpromptiq_user: currentUser });

      // Fetch additional stats
      await fetchUserStats(apiUrl, token);
    } else {
      // Token invalid
      currentUser = null;
      await chrome.storage.local.remove(['smartpromptiq_token', 'smartpromptiq_user']);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // Use cached user if available
    const result = await chrome.storage.local.get(['smartpromptiq_user']);
    currentUser = result.smartpromptiq_user || null;
  }

  updateUI();
}

// Fetch user stats
async function fetchUserStats(apiUrl, token) {
  try {
    // Get usage stats
    const usageResponse = await fetch(`${apiUrl}/api/usage`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (usageResponse.ok) {
      const usageData = await usageResponse.json();
      currentUser.usage = usageData.usage || usageData.data?.usage;
    }

    // Get prompts count
    const promptsResponse = await fetch(`${apiUrl}/api/prompts?limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (promptsResponse.ok) {
      const promptsData = await promptsResponse.json();
      currentUser.promptsCount = promptsData.total || promptsData.data?.total || 0;
    }
  } catch (error) {
    console.log('Failed to fetch user stats:', error);
  }
}

// Update UI based on current state
function updateUI() {
  if (currentUser) {
    elements.notLoggedIn.style.display = 'none';
    elements.loggedIn.style.display = 'block';

    // Update user info
    elements.userName.textContent = currentUser.username || currentUser.name || 'User';
    elements.userEmail.textContent = currentUser.email || '';

    // Plan badge
    const plan = currentUser.subscriptionTier || currentUser.plan || 'free';
    elements.userPlan.textContent = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`;

    // Avatar
    if (currentUser.avatar) {
      elements.userAvatar.innerHTML = `<img src="${currentUser.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      const initial = (currentUser.username || currentUser.email || 'U')[0].toUpperCase();
      elements.userAvatar.textContent = initial;
    }

    // Stats
    elements.tokensLeft.textContent = currentUser.tokenBalance || currentUser.tokens || 0;
    elements.promptsGenerated.textContent = currentUser.usage?.promptsGenerated || 0;
    elements.promptsSaved.textContent = currentUser.promptsCount || 0;
  } else {
    elements.notLoggedIn.style.display = 'block';
    elements.loggedIn.style.display = 'none';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Auth buttons
  elements.signInBtn.addEventListener('click', () => {
    const env = elements.environment.value || 'production';
    const url = env === 'development' ? 'http://localhost:5173' : 'https://smartpromptiq.com';
    chrome.tabs.create({ url: `${url}/signin` });
  });

  elements.signUpLink.addEventListener('click', (e) => {
    e.preventDefault();
    const env = elements.environment.value || 'production';
    const url = env === 'development' ? 'http://localhost:5173' : 'https://smartpromptiq.com';
    chrome.tabs.create({ url: `${url}/signin?mode=signup` });
  });

  elements.signOutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['smartpromptiq_token', 'smartpromptiq_user']);
    currentUser = null;
    updateUI();
    showToast('Signed out successfully', 'success');
  });

  // Account actions
  elements.openDashboardBtn.addEventListener('click', () => {
    const env = elements.environment.value || 'production';
    const url = env === 'development' ? 'http://localhost:5173' : 'https://smartpromptiq.com';
    chrome.tabs.create({ url: `${url}/dashboard` });
  });

  elements.upgradePlanBtn.addEventListener('click', () => {
    const env = elements.environment.value || 'production';
    const url = env === 'development' ? 'http://localhost:5173' : 'https://smartpromptiq.com';
    chrome.tabs.create({ url: `${url}/pricing` });
  });

  // Settings toggles
  const settingElements = [
    { el: elements.darkMode, key: 'darkMode' },
    { el: elements.showNotifications, key: 'showNotifications' },
    { el: elements.showFloatingButton, key: 'showFloatingButton' },
    { el: elements.autoInsert, key: 'autoInsert' },
    { el: elements.keyboardShortcuts, key: 'keyboardShortcuts' },
    { el: elements.debugMode, key: 'debugMode' }
  ];

  settingElements.forEach(({ el, key }) => {
    el.addEventListener('change', () => {
      settings[key] = el.checked;
      saveSettings();

      // Notify content scripts of setting changes
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED',
            settings
          }).catch(() => {});
        });
      });
    });
  });

  elements.defaultCategory.addEventListener('change', () => {
    settings.defaultCategory = elements.defaultCategory.value;
    saveSettings();
  });

  // Data & Privacy
  elements.clearCacheBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove([
      'smartpromptiq_prompts_cache',
      'smartpromptiq_templates_cache'
    ]);
    showToast('Cache cleared!', 'success');
  });

  elements.clearRecentBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['smartpromptiq_recent_prompts']);
    showToast('Recent prompts cleared!', 'success');
  });

  elements.exportBtn.addEventListener('click', exportData);
  elements.importBtn.addEventListener('click', () => elements.importFile.click());
  elements.importFile.addEventListener('change', importData);

  // Developer options toggle
  elements.devOptionsToggle.addEventListener('click', () => {
    const section = elements.devOptionsToggle.closest('.settings-section');
    section.classList.toggle('open');
    elements.devOptionsContent.style.display =
      elements.devOptionsContent.style.display === 'none' ? 'block' : 'none';
  });

  // Environment selector
  elements.environment.addEventListener('change', async () => {
    const env = elements.environment.value;
    await chrome.storage.local.set({ smartpromptiq_env: env });
    updateApiUrlDisplay(env);

    // Update CONFIG if available
    if (typeof CONFIG !== 'undefined') {
      CONFIG.CURRENT_ENV = env;
    }

    showToast(`Switched to ${env} environment`, 'success');

    // Re-check auth with new environment
    await checkAuth();
  });
}

// Export data
async function exportData() {
  try {
    const result = await chrome.storage.local.get([
      'smartpromptiq_settings',
      'smartpromptiq_recent_prompts'
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        settings: result.smartpromptiq_settings || {},
        recentPrompts: result.smartpromptiq_recent_prompts || []
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpromptiq-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully!', 'success');
  } catch (error) {
    console.error('Export error:', error);
    showToast('Failed to export data', 'error');
  }
}

// Import data
async function importData(event) {
  try {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const importedData = JSON.parse(text);

    if (!importedData.data) {
      throw new Error('Invalid import file format');
    }

    if (importedData.data.settings) {
      await chrome.storage.local.set({
        smartpromptiq_settings: importedData.data.settings
      });
      settings = { ...settings, ...importedData.data.settings };
    }

    if (importedData.data.recentPrompts) {
      await chrome.storage.local.set({
        smartpromptiq_recent_prompts: importedData.data.recentPrompts
      });
    }

    // Reload settings UI
    await loadSettings();

    showToast('Data imported successfully!', 'success');
  } catch (error) {
    console.error('Import error:', error);
    showToast('Failed to import data. Invalid file format.', 'error');
  }

  // Reset file input
  event.target.value = '';
}

// Show toast notification
function showToast(message, type = 'success') {
  elements.toast.className = `toast ${type}`;
  elements.toastIcon.textContent = type === 'success' ? '✓' : '✕';
  elements.toastMessage.textContent = message;
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 3000);
}

// Listen for auth changes from other parts of the extension
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    if (changes.smartpromptiq_token || changes.smartpromptiq_user) {
      checkAuth();
    }
  }
});
