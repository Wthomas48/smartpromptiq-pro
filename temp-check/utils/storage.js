// SmartPromptIQ Chrome Extension - Storage Service
// Handles local storage, caching, and state management

class StorageService {
  constructor() {
    this.KEYS = {
      TOKEN: 'smartpromptiq_token',
      USER: 'smartpromptiq_user',
      STATE: 'smartpromptiq_state',
      SETTINGS: 'smartpromptiq_settings',
      PROMPTS_CACHE: 'smartpromptiq_prompts_cache',
      TEMPLATES_CACHE: 'smartpromptiq_templates_cache',
      RECENT_PROMPTS: 'smartpromptiq_recent_prompts',
      ENVIRONMENT: 'smartpromptiq_env'
    };

    this.DEFAULT_SETTINGS = {
      autoInsert: true,
      showNotifications: true,
      darkMode: true,
      defaultCategory: 'marketing',
      showFloatingButton: true,
      keyboardShortcuts: true
    };

    this.DEFAULT_STATE = {
      isAuthenticated: false,
      selectedCategory: 'marketing',
      credits: 0,
      promptCount: 0
    };
  }

  // ============ GENERIC STORAGE METHODS ============

  async get(key) {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key] || null;
    } catch (error) {
      console.error(`Storage get error for ${key}:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error(`Storage set error for ${key}:`, error);
      return false;
    }
  }

  async remove(key) {
    try {
      await chrome.storage.local.remove([key]);
      return true;
    } catch (error) {
      console.error(`Storage remove error for ${key}:`, error);
      return false;
    }
  }

  async clear() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  // ============ AUTH METHODS ============

  async getToken() {
    return this.get(this.KEYS.TOKEN);
  }

  async setToken(token) {
    return this.set(this.KEYS.TOKEN, token);
  }

  async getUser() {
    return this.get(this.KEYS.USER);
  }

  async setUser(user) {
    return this.set(this.KEYS.USER, user);
  }

  async clearAuth() {
    await this.remove(this.KEYS.TOKEN);
    await this.remove(this.KEYS.USER);
    const state = await this.getState();
    state.isAuthenticated = false;
    await this.setState(state);
  }

  // ============ STATE METHODS ============

  async getState() {
    const state = await this.get(this.KEYS.STATE);
    return { ...this.DEFAULT_STATE, ...state };
  }

  async setState(state) {
    const currentState = await this.getState();
    return this.set(this.KEYS.STATE, { ...currentState, ...state });
  }

  async updateState(updates) {
    const currentState = await this.getState();
    return this.set(this.KEYS.STATE, { ...currentState, ...updates });
  }

  // ============ SETTINGS METHODS ============

  async getSettings() {
    const settings = await this.get(this.KEYS.SETTINGS);
    return { ...this.DEFAULT_SETTINGS, ...settings };
  }

  async setSettings(settings) {
    const currentSettings = await this.getSettings();
    return this.set(this.KEYS.SETTINGS, { ...currentSettings, ...settings });
  }

  async updateSetting(key, value) {
    const settings = await this.getSettings();
    settings[key] = value;
    return this.set(this.KEYS.SETTINGS, settings);
  }

  // ============ CACHE METHODS ============

  async getCachedData(key, ttl = 5 * 60 * 1000) {
    try {
      const cached = await this.get(key);
      if (cached && cached.timestamp && cached.data) {
        const age = Date.now() - cached.timestamp;
        if (age < ttl) {
          return cached.data;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async setCachedData(key, data) {
    return this.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async clearCache() {
    await this.remove(this.KEYS.PROMPTS_CACHE);
    await this.remove(this.KEYS.TEMPLATES_CACHE);
  }

  // ============ PROMPTS CACHE ============

  async getCachedPrompts() {
    return this.getCachedData(this.KEYS.PROMPTS_CACHE, 5 * 60 * 1000);
  }

  async setCachedPrompts(prompts) {
    return this.setCachedData(this.KEYS.PROMPTS_CACHE, prompts);
  }

  // ============ TEMPLATES CACHE ============

  async getCachedTemplates() {
    return this.getCachedData(this.KEYS.TEMPLATES_CACHE, 30 * 60 * 1000);
  }

  async setCachedTemplates(templates) {
    return this.setCachedData(this.KEYS.TEMPLATES_CACHE, templates);
  }

  // ============ RECENT PROMPTS ============

  async getRecentPrompts(limit = 10) {
    const recent = await this.get(this.KEYS.RECENT_PROMPTS);
    if (Array.isArray(recent)) {
      return recent.slice(0, limit);
    }
    return [];
  }

  async addRecentPrompt(prompt) {
    const recent = await this.getRecentPrompts(50);

    const newPrompt = {
      id: Date.now(),
      content: prompt.content,
      category: prompt.category,
      title: prompt.title || prompt.content.slice(0, 50),
      timestamp: Date.now()
    };

    // Add to beginning and limit to 50
    recent.unshift(newPrompt);
    const limited = recent.slice(0, 50);

    await this.set(this.KEYS.RECENT_PROMPTS, limited);
    return newPrompt;
  }

  async removeRecentPrompt(id) {
    const recent = await this.getRecentPrompts(50);
    const filtered = recent.filter(p => p.id !== id);
    return this.set(this.KEYS.RECENT_PROMPTS, filtered);
  }

  async clearRecentPrompts() {
    return this.remove(this.KEYS.RECENT_PROMPTS);
  }

  // ============ OFFLINE SUPPORT ============

  async saveForOffline(key, data) {
    const offlineKey = `offline_${key}`;
    return this.set(offlineKey, {
      data,
      savedAt: Date.now()
    });
  }

  async getOfflineData(key) {
    const offlineKey = `offline_${key}`;
    const result = await this.get(offlineKey);
    return result?.data || null;
  }

  // ============ SYNC METHODS ============

  async exportData() {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      const settings = await this.getSettings();
      const recentPrompts = await this.getRecentPrompts(50);

      return {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        data: {
          settings,
          recentPrompts
        }
      };
    } catch (error) {
      console.error('Export error:', error);
      return null;
    }
  }

  async importData(exportedData) {
    try {
      if (!exportedData || !exportedData.data) {
        throw new Error('Invalid import data');
      }

      const { settings, recentPrompts } = exportedData.data;

      if (settings) {
        await this.setSettings(settings);
      }

      if (recentPrompts) {
        await this.set(this.KEYS.RECENT_PROMPTS, recentPrompts);
      }

      return true;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { storageService, StorageService };
}
