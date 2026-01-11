// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTANT: Import third-party protection FIRST before any other imports
// This ensures error handlers are in place before any libraries load
// ═══════════════════════════════════════════════════════════════════════════════
import './utils/libProtection.js'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { GlobalFeedbackProvider } from './components/GlobalFeedback'
import './index.css'

// ═══════════════════════════════════════════════════════════════════════════════
// Font Awesome - Self-hosted for CSP compliance (no external CDN)
// This avoids CSP violations from loading fonts from cdnjs.cloudflare.com
// ═══════════════════════════════════════════════════════════════════════════════
import '@fortawesome/fontawesome-free/css/all.min.css'

// Enhanced error suppression for third-party libraries
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  // Expanded list of suppressible errors
  const suppressPatterns = [
    'recharts',
    'locale_default',
    "Cannot find module './en'",
    "Cannot find module './es'",
    'stripe.redirectToCheckout',
    'IntegrationError',
    'Host validation',
    'dynamic import',
    'operationBanner',
    'backendManager',
    '.create is not a function',
    'convertDetectedLanguage',
    'i18next'
  ];
  if (suppressPatterns.some(pattern => message.includes(pattern))) {
    return; // Suppress known third-party errors
  }
  originalConsoleError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <GlobalFeedbackProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GlobalFeedbackProvider>
    </I18nextProvider>
  </React.StrictMode>
);
