import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

// Simple error suppression for recharts only
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('recharts') || message.includes('locale_default')) {
    return; // Suppress recharts errors only
  }
  originalConsoleError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nextProvider>
  </React.StrictMode>
);
