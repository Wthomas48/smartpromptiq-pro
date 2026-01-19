// SmartPromptIQ Chrome Extension - Auth Listener
// Listens for authentication events on the SmartPromptIQ website and syncs with extension

(function() {
  'use strict';

  // Avoid duplicate injection
  if (window.smartPromptIQAuthListenerInjected) return;
  window.smartPromptIQAuthListenerInjected = true;

  console.log('SmartPromptIQ: Auth listener initialized');

  // Storage keys to monitor
  const AUTH_KEYS = ['token', 'authToken', 'accessToken', 'jwt', 'user'];

  // Check for existing auth on page load
  function checkExistingAuth() {
    // Check localStorage
    for (const key of AUTH_KEYS) {
      const value = localStorage.getItem(key);
      if (value && isValidToken(value)) {
        syncTokenToExtension(value);
        return;
      }
    }

    // Check for specific SmartPromptIQ storage patterns
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
        const value = localStorage.getItem(key);
        if (value && isValidToken(value)) {
          syncTokenToExtension(value);
          return;
        }
      }
    }
  }

  // Validate if a string looks like a JWT token
  function isValidToken(value) {
    if (!value || typeof value !== 'string') return false;

    // JWT format: header.payload.signature
    const parts = value.split('.');
    if (parts.length === 3) {
      // Try to decode the payload to verify it's a valid JWT
      try {
        const payload = JSON.parse(atob(parts[1]));
        return payload && (payload.sub || payload.userId || payload.email);
      } catch (e) {
        return false;
      }
    }

    // Also accept bearer token format if it's stored with 'Bearer ' prefix
    if (value.startsWith('Bearer ')) {
      return isValidToken(value.slice(7));
    }

    return false;
  }

  // Extract user info from JWT
  function extractUserFromToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        return {
          id: payload.sub || payload.userId,
          email: payload.email,
          role: payload.role,
          plan: payload.plan
        };
      }
    } catch (e) {
      console.log('Could not extract user from token');
    }
    return null;
  }

  // Sync token to Chrome extension storage
  async function syncTokenToExtension(token) {
    if (!token) return;

    // Clean the token
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    try {
      // Send message to background script
      chrome.runtime.sendMessage({
        type: 'AUTH_TOKEN_RECEIVED',
        token: cleanToken,
        user: extractUserFromToken(cleanToken),
        source: 'website'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('SmartPromptIQ: Extension not available');
          return;
        }
        if (response?.success) {
          console.log('SmartPromptIQ: Auth synced with extension');
          showSyncNotification('Connected to SmartPromptIQ extension!');
        }
      });
    } catch (error) {
      console.log('SmartPromptIQ: Could not sync auth', error);
    }
  }

  // Clear token from extension when user logs out
  async function clearExtensionAuth() {
    try {
      chrome.runtime.sendMessage({
        type: 'AUTH_LOGOUT',
        source: 'website'
      }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response?.success) {
          console.log('SmartPromptIQ: Auth cleared from extension');
        }
      });
    } catch (error) {
      console.log('SmartPromptIQ: Could not clear auth', error);
    }
  }

  // Show sync notification
  function showSyncNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      color: white;
      padding: 14px 20px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
      <span style="font-size: 18px;">🧠</span>
      <span>${message}</span>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Monitor localStorage changes
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);

    // Check if this is an auth-related key
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('token') || lowerKey.includes('auth') || AUTH_KEYS.includes(key)) {
      if (isValidToken(value)) {
        console.log('SmartPromptIQ: Auth token detected in localStorage');
        syncTokenToExtension(value);
      }
    }
  };

  // Monitor localStorage removals (logout)
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('token') || lowerKey.includes('auth') || AUTH_KEYS.includes(key)) {
      console.log('SmartPromptIQ: Auth token removed - user logged out');
      clearExtensionAuth();
    }
    originalRemoveItem.apply(this, arguments);
  };

  // Monitor localStorage clear (logout)
  const originalClear = localStorage.clear;
  localStorage.clear = function() {
    console.log('SmartPromptIQ: localStorage cleared - user logged out');
    clearExtensionAuth();
    originalClear.apply(this);
  };

  // Listen for custom auth events from the website
  window.addEventListener('smartpromptiq-auth', (event) => {
    const { type, token, user } = event.detail || {};

    if (type === 'login' && token) {
      console.log('SmartPromptIQ: Auth event received');
      syncTokenToExtension(token);
    } else if (type === 'logout') {
      console.log('SmartPromptIQ: Logout event received');
      clearExtensionAuth();
    }
  });

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_AUTH_FROM_PAGE') {
      // Check for auth token in localStorage
      for (const key of AUTH_KEYS) {
        const value = localStorage.getItem(key);
        if (value && isValidToken(value)) {
          sendResponse({ token: value, user: extractUserFromToken(value) });
          return;
        }
      }
      sendResponse({ token: null, user: null });
    }

    if (message.type === 'EXTENSION_CONNECTED') {
      console.log('SmartPromptIQ: Extension connected');
      // Check for existing auth when extension connects
      checkExistingAuth();
      sendResponse({ success: true });
    }
  });

  // Check for existing auth on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkExistingAuth);
  } else {
    // Small delay to ensure localStorage is populated
    setTimeout(checkExistingAuth, 500);
  }

  // Also check periodically for auth changes (in case of SPA navigation)
  let lastToken = null;
  setInterval(() => {
    for (const key of AUTH_KEYS) {
      const value = localStorage.getItem(key);
      if (value && isValidToken(value) && value !== lastToken) {
        lastToken = value;
        syncTokenToExtension(value);
        break;
      }
    }
  }, 5000);

})();
