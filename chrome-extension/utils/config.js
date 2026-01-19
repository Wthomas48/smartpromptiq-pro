// SmartPromptIQ Chrome Extension - Configuration
// Environment and API configuration

const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
};

// Detect environment based on extension context
function detectEnvironment() {
  // Check if we have a stored preference
  // Default to production for released extension
  return chrome.storage?.local ? ENV.PRODUCTION : ENV.DEVELOPMENT;
}

const CONFIG = {
  // Environment
  ENV: ENV,
  CURRENT_ENV: ENV.PRODUCTION,

  // API URLs
  API_URLS: {
    [ENV.DEVELOPMENT]: 'http://localhost:5001',
    [ENV.PRODUCTION]: 'https://smartpromptiq.com'
  },

  // Website URLs
  WEBSITE_URLS: {
    [ENV.DEVELOPMENT]: 'http://localhost:5173',
    [ENV.PRODUCTION]: 'https://smartpromptiq.com'
  },

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      ME: '/api/auth/me',
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh'
    },
    PROMPTS: {
      LIST: '/api/prompts',
      CREATE: '/api/prompts',
      DELETE: (id) => `/api/prompts/${id}`
    },
    GENERATE: {
      PROMPT: '/api/generate',
      QUICK: '/api/generate/quick'
    },
    TEMPLATES: {
      LIST: '/api/templates',
      CATEGORIES: '/api/categories'
    },
    USER: {
      PROFILE: '/api/users/profile',
      USAGE: '/api/usage',
      TOKENS: '/api/users/tokens'
    }
  },

  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'smartpromptiq_token',
    USER: 'smartpromptiq_user',
    STATE: 'smartpromptiq_state',
    SETTINGS: 'smartpromptiq_settings',
    PROMPTS_CACHE: 'smartpromptiq_prompts_cache',
    TEMPLATES_CACHE: 'smartpromptiq_templates_cache',
    ENVIRONMENT: 'smartpromptiq_env'
  },

  // Cache durations (in milliseconds)
  CACHE: {
    PROMPTS_TTL: 5 * 60 * 1000, // 5 minutes
    TEMPLATES_TTL: 30 * 60 * 1000, // 30 minutes
    USER_TTL: 10 * 60 * 1000 // 10 minutes
  },

  // Supported AI Platforms
  PLATFORMS: {
    chatgpt: {
      name: 'ChatGPT',
      patterns: ['chat.openai.com', 'chatgpt.com'],
      selectors: {
        input: ['textarea[data-id="root"]', '#prompt-textarea', 'textarea[placeholder*="Message"]'],
        submit: ['button[data-testid="send-button"]', 'button[aria-label="Send"]']
      }
    },
    claude: {
      name: 'Claude',
      patterns: ['claude.ai'],
      selectors: {
        input: ['div[contenteditable="true"].ProseMirror', 'div[contenteditable="true"]'],
        submit: ['button[aria-label="Send message"]']
      }
    },
    gemini: {
      name: 'Gemini',
      patterns: ['gemini.google.com'],
      selectors: {
        input: ['div[contenteditable="true"]', 'rich-textarea'],
        submit: ['button[aria-label="Send"]']
      }
    },
    copilot: {
      name: 'Microsoft Copilot',
      patterns: ['copilot.microsoft.com', 'bing.com/chat'],
      selectors: {
        input: ['textarea', 'div[contenteditable="true"]'],
        submit: ['button[aria-label="Submit"]']
      }
    },
    poe: {
      name: 'Poe',
      patterns: ['poe.com'],
      selectors: {
        input: ['textarea', 'div[contenteditable="true"]'],
        submit: ['button[class*="send"]']
      }
    }
  },

  // Categories with icons
  CATEGORIES: [
    { id: 'marketing', name: 'Marketing', icon: '📣' },
    { id: 'development', name: 'Development', icon: '💻' },
    { id: 'writing', name: 'Writing', icon: '✍️' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'creative', name: 'Creative', icon: '🎨' }
  ],

  // Rate Limiting
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 30,
    RETRY_DELAY: 1000,
    MAX_RETRIES: 3
  },

  // Version
  VERSION: '1.1.0'
};

// Helper functions
CONFIG.getApiUrl = function() {
  return CONFIG.API_URLS[CONFIG.CURRENT_ENV];
};

CONFIG.getWebsiteUrl = function() {
  return CONFIG.WEBSITE_URLS[CONFIG.CURRENT_ENV];
};

CONFIG.setEnvironment = async function(env) {
  if (env === ENV.DEVELOPMENT || env === ENV.PRODUCTION) {
    CONFIG.CURRENT_ENV = env;
    await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.ENVIRONMENT]: env });
    return true;
  }
  return false;
};

CONFIG.loadEnvironment = async function() {
  try {
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.ENVIRONMENT]);
    if (result[CONFIG.STORAGE_KEYS.ENVIRONMENT]) {
      CONFIG.CURRENT_ENV = result[CONFIG.STORAGE_KEYS.ENVIRONMENT];
    }
  } catch (e) {
    console.log('Using default environment');
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
